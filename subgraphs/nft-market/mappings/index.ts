/* eslint-disable prefer-const */
import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { Collection, NFT, AskOrder, Transaction, User } from "../generated/schema";
import {
  AskCancel,
  AskNew,
  AskUpdate,
  CollectionClose,
  CollectionNew,
  CollectionUpdate,
  RevenueClaim,
  Trade,
} from "../generated/ERC721NFTMarketV1/ERC721NFTMarketV1";

import { toBigDecimal } from "./utils";
import { updateCollectionDayData, updateMarketPlaceDayData } from "./utils/dayUpdates";
import { fetchCollectionName, fetchCollectionSymbol, fetchTokenURI } from "./utils/ERC721";

// BigNumber-like references
let ZERO_BI = BigInt.fromI32(0);
let ONE_BI = BigInt.fromI32(1);
let ZERO_BD = BigDecimal.fromString("0");
let ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

/**
 * COLLECTION
 */

export function handleCollectionNew(event: CollectionNew): void {
  let collection = Collection.load(event.params.collection.toHex());
  if (collection == null) {
    collection = new Collection(event.params.collection.toHex());
    collection.name = fetchCollectionName(event.params.collection);
    collection.symbol = fetchCollectionSymbol(event.params.collection);
    collection.active = true;
    collection.totalTrades = ZERO_BI;
    collection.totalVolumeBNB = ZERO_BD;
    collection.numberTokensListed = ZERO_BI;
    collection.creatorAddress = event.params.creator.toHex();
    collection.tradingFee = toBigDecimal(event.params.tradingFee, 2);
    collection.creatorFee = toBigDecimal(event.params.creatorFee, 2);
    collection.whitelistChecker = event.params.whitelistChecker.toHex();
  } else {
    // Collection has existed, was closed, but is re-listed
    collection.active = true;
    collection.creatorAddress = event.params.creator.toHex();
    collection.tradingFee = toBigDecimal(event.params.tradingFee, 2);
    collection.creatorFee = toBigDecimal(event.params.creatorFee, 2);
    collection.whitelistChecker = event.params.whitelistChecker.toHex();
  }
  collection.save();
}

export function handleCollectionClose(event: CollectionClose): void {
  let collection = Collection.load(event.params.collection.toHex());
  if (collection !== null) {
    collection.active = false;
    collection.save();
  }
}

export function handleCollectionUpdate(event: CollectionUpdate): void {
  let collection = Collection.load(event.params.collection.toHex());
  if (collection !== null) {
    collection.creatorAddress = event.params.creator.toHex();
    collection.tradingFee = toBigDecimal(event.params.tradingFee, 2);
    collection.creatorFee = toBigDecimal(event.params.creatorFee, 2);
    collection.whitelistChecker = event.params.whitelistChecker.toHex();
    collection.save();
  }
}

/**
 * ASK ORDERS
 */

export function handleAskNew(event: AskNew): void {
  // 1. User
  let user = User.load(event.params.seller.toHex());
  if (user == null) {
    user = new User(event.params.seller.toHex());
    user.numberTokensListed = ONE_BI;
    user.numberTokensPurchased = ZERO_BI;
    user.numberTokensSold = ZERO_BI;
    user.totalVolumeInBNBTokensPurchased = ZERO_BD;
    user.totalVolumeInBNBTokensSold = ZERO_BD;
    user.totalFeesCollectedInBNB = ZERO_BD;
    user.averageTokenPriceInBNBPurchased = ZERO_BD;
    user.averageTokenPriceInBNBSold = ZERO_BD;
  } else {
    user.numberTokensListed = user.numberTokensListed.plus(ONE_BI);
  }

  // 2. Collection
  let collection = Collection.load(event.params.collection.toHex());

  collection.numberTokensListed = collection.numberTokensListed.plus(ONE_BI);

  // 3. Token
  let tokenConcatId = event.params.collection.toHexString() + "-" + event.params.tokenId.toString();
  let token = NFT.load(tokenConcatId);

  if (token == null) {
    token = new NFT(tokenConcatId);
    token.tokenId = event.params.tokenId;
    token.collection = collection.id;
    token.metadataUrl = fetchTokenURI(event.params.collection, event.params.tokenId);

    token.latestTradedPriceInBNB = ZERO_BD;
    token.tradeVolumeBNB = ZERO_BD;
    token.totalTrades = ZERO_BI;
  }

  token.updatedAt = event.block.timestamp;
  token.currentSeller = event.params.seller.toHex();
  token.currentAskPrice = toBigDecimal(event.params.askPrice, 18);
  token.isTradable = true;

  // 4. Ask Order
  let order = new AskOrder(event.transaction.hash.toHexString());
  order.block = event.block.number;
  order.timestamp = event.block.timestamp;
  order.collection = event.params.collection.toHex();
  order.nft = event.params.collection.toHexString() + "-" + event.params.tokenId.toString();
  order.orderType = "NEW";
  order.askPrice = toBigDecimal(event.params.askPrice, 18);
  order.seller = event.params.seller.toHex();

  user.save();
  collection.save();
  token.save();
  order.save();
}

export function handleAskCancel(event: AskCancel): void {
  // 1. User
  let user = User.load(event.params.seller.toHex());
  user.numberTokensListed = user.numberTokensListed.minus(ONE_BI);

  // 2. Collection
  let collection = Collection.load(event.params.collection.toHex());
  collection.numberTokensListed = collection.numberTokensListed.minus(ONE_BI);

  // 3. Token
  let tokenConcatId = event.params.collection.toHexString() + "-" + event.params.tokenId.toString();
  let token = NFT.load(tokenConcatId);

  token.currentSeller = ZERO_ADDRESS;
  token.updatedAt = event.block.timestamp;
  token.currentAskPrice = ZERO_BD;
  token.isTradable = false;

  // 4. Ask Order
  let order = new AskOrder(event.transaction.hash.toHexString());
  order.block = event.block.number;
  order.timestamp = event.block.timestamp;
  order.collection = event.params.collection.toHex();
  order.nft = event.params.collection.toHexString() + "-" + event.params.tokenId.toString();
  order.orderType = "CANCEL";
  order.askPrice = toBigDecimal(ZERO_BI, 18);
  order.seller = event.params.seller.toHex();

  user.save();
  collection.save();
  token.save();
  order.save();
}

export function handleAskUpdate(event: AskUpdate): void {
  // 1. Token
  let tokenConcatId = event.params.collection.toHexString() + "-" + event.params.tokenId.toString();
  let token = NFT.load(tokenConcatId);

  token.updatedAt = event.block.timestamp;
  token.currentAskPrice = toBigDecimal(event.params.askPrice, 18);

  // 2. Order
  let order = new AskOrder(event.transaction.hash.toHexString());
  order.block = event.block.number;
  order.timestamp = event.block.timestamp;
  order.collection = event.params.collection.toHex();
  order.nft = event.params.collection.toHexString() + "-" + event.params.tokenId.toString();
  order.orderType = "MODIFY";
  order.askPrice = toBigDecimal(event.params.askPrice, 18);
  order.seller = event.params.seller.toHex();

  token.save();
  order.save();
}

/**
 * BUY ORDERS
 */

export function handleTrade(event: Trade): void {
  // 1. Buyer
  let buyer = User.load(event.params.buyer.toHex());

  // Buyer may not exist
  if (buyer == null) {
    buyer = new User(event.params.buyer.toHex());
    buyer.numberTokensListed = ZERO_BI;
    buyer.numberTokensPurchased = ONE_BI; // 1 token purchased
    buyer.numberTokensSold = ZERO_BI;
    buyer.totalVolumeInBNBTokensPurchased = toBigDecimal(event.params.askPrice, 18);
    buyer.totalVolumeInBNBTokensSold = ZERO_BD;
    buyer.totalFeesCollectedInBNB = ZERO_BD;
    buyer.averageTokenPriceInBNBPurchased = buyer.totalVolumeInBNBTokensPurchased;
    buyer.averageTokenPriceInBNBSold = ZERO_BD;
  } else {
    buyer.numberTokensPurchased = buyer.numberTokensPurchased.plus(ONE_BI);
    buyer.totalVolumeInBNBTokensPurchased = buyer.totalVolumeInBNBTokensPurchased.plus(
      toBigDecimal(event.params.askPrice, 18)
    );

    buyer.averageTokenPriceInBNBPurchased = buyer.totalVolumeInBNBTokensPurchased.div(
      buyer.numberTokensPurchased.toBigDecimal()
    );
  }

  // 2. Seller
  let seller = User.load(event.params.seller.toHex());

  seller.numberTokensSold = seller.numberTokensSold.plus(ONE_BI);
  seller.numberTokensListed = seller.numberTokensListed.minus(ONE_BI);
  seller.totalVolumeInBNBTokensSold = seller.totalVolumeInBNBTokensSold.plus(toBigDecimal(event.params.netPrice, 18));
  seller.averageTokenPriceInBNBSold = seller.totalVolumeInBNBTokensSold.div(seller.numberTokensSold.toBigDecimal());

  // 3. NFT
  let tokenConcatId = event.params.collection.toHexString() + "-" + event.params.tokenId.toString();
  let token = NFT.load(tokenConcatId);

  token.latestTradedPriceInBNB = toBigDecimal(event.params.askPrice, 18);
  token.tradeVolumeBNB = token.tradeVolumeBNB.plus(token.latestTradedPriceInBNB);
  token.updatedAt = event.block.timestamp;
  token.totalTrades = token.totalTrades.plus(ONE_BI);
  token.currentAskPrice = ZERO_BD;
  token.currentSeller = ZERO_ADDRESS;
  token.isTradable = false;

  // 4. Transaction
  let transaction = new Transaction(event.transaction.hash.toHexString());

  transaction.block = event.block.number;
  transaction.timestamp = event.block.timestamp;
  transaction.collection = event.params.collection.toHex();
  transaction.nft = event.params.collection.toHexString() + "-" + event.params.tokenId.toString();
  transaction.askPrice = toBigDecimal(event.params.askPrice, 18);
  transaction.netPrice = toBigDecimal(event.params.netPrice, 18);

  transaction.buyer = event.params.buyer.toHex();
  transaction.seller = event.params.seller.toHex();

  transaction.withBNB = event.params.withBNB;

  transaction.save();
  buyer.save();
  seller.save();
  token.save();

  // 5. Update day data for collection and marketplace
  updateCollectionDayData(event.params.collection, toBigDecimal(event.params.askPrice, 18), event);
  updateMarketPlaceDayData(toBigDecimal(event.params.askPrice, 18), event);
}

/**
 * REVENUE CLAIMS BY CREATOR/TREASURY
 */

export function handleRevenueClaim(event: RevenueClaim): void {
  let user = User.load(event.params.claimer.toHex());

  if (user == null) {
    user = new User(event.params.claimer.toHex());
    user.numberTokensListed = ZERO_BI;
    user.numberTokensPurchased = ZERO_BI;
    user.numberTokensSold = ZERO_BI;
    user.totalVolumeInBNBTokensPurchased = ZERO_BD;
    user.totalVolumeInBNBTokensSold = ZERO_BD;
    user.totalFeesCollectedInBNB = toBigDecimal(event.params.amount, 18);
    user.averageTokenPriceInBNBPurchased = ZERO_BD;
    user.averageTokenPriceInBNBSold = ZERO_BD;
  } else {
    user.totalFeesCollectedInBNB = user.totalFeesCollectedInBNB.plus(toBigDecimal(event.params.amount, 18));
  }

  user.save();
}
