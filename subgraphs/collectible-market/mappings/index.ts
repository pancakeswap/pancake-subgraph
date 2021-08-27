/* eslint-disable prefer-const */
import { Address, ethereum, BigDecimal, BigInt, ipfs, Bytes, json, JSONValue } from "@graphprotocol/graph-ts";
import { Collection, NFT, Transaction, User } from "../generated/schema";
import {
  AskCancel,
  AskNew,
  CollectionClose,
  CollectionNew,
  CollectionUpdate,
  RevenueClaim,
  Trade,
} from "../generated/CollectibleMarketV1/CollectibleMarketV1";

import { IERC721 } from "../generated/CollectibleMarketV1/IERC721";

let ZERO_BI = BigInt.fromI32(0);
let ONE_BI = BigInt.fromI32(1);
let ZERO_BD = BigDecimal.fromString("0");
let EIGHTEEN_BD = BigDecimal.fromString("1e18");

export function fetchCollectionName(collectionAddress: Address): string {
  let contract = IERC721.bind(collectionAddress);
  let nameValue = "unknown";
  let nameResult = contract.try_name();

  if (!nameResult.reverted) {
    nameValue = nameResult.value.toString();
  }
  return nameValue;
}

export function fetchCollectionSymbol(collectionAddress: Address): string {
  let contract = IERC721.bind(collectionAddress);
  let symbolValue = "unknown";
  let symbolResult = contract.try_symbol();

  if (!symbolResult.reverted) {
    symbolValue = symbolResult.value.toString();
  }
  return symbolValue;
}

export function fetchTokenURI(collectionAddress: Address, tokenId: BigInt): string {
  let contract = IERC721.bind(collectionAddress);
  let tokenURIValue = "unknown";
  let tokenURIResult = contract.try_tokenURI(tokenId);

  if (!tokenURIResult.reverted) {
    tokenURIValue = tokenURIResult.value.toString();
  }
  return tokenURIValue;
}

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
    collection.tradingFee = event.params.tradingFee.toBigDecimal();
    collection.creatorFee = event.params.creatorFee.toBigDecimal();
    collection.whitelistChecker = event.params.whitelistChecker.toHex();
    collection.save();
  } else {
    // Collection has existed, was closed, but is re-listed
    collection.active = true;
    collection.creatorAddress = event.params.creator.toHex();
    collection.tradingFee = event.params.tradingFee.toBigDecimal();
    collection.creatorFee = event.params.creatorFee.toBigDecimal();
    collection.whitelistChecker = event.params.whitelistChecker.toHex();
    collection.save();
  }
}

export function handleCollectionClose(event: CollectionClose): void {
  let collection = Collection.load(event.params.collection.toHex());
  collection.active = false;
  collection.save();
}

export function handleCollectionUpdate(event: CollectionUpdate): void {
  let collection = Collection.load(event.params.collection.toHex());
  collection.creatorAddress = event.params.creator.toHex();
  collection.tradingFee = event.params.tradingFee.toBigDecimal();
  collection.creatorFee = event.params.creatorFee.toBigDecimal();
  collection.whitelistChecker = event.params.whitelistChecker.toHex();
  collection.save();
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

  user.save();

  // 2. Token
  let tokenConcatId = event.params.collection.toString() + "-" + event.params.tokenId.toString();
  let token = NFT.load(tokenConcatId);

  if (token == null) {
    token = new NFT(tokenConcatId);
    token.tokenId = event.params.tokenId;
    token.collection = event.params.collection.toHex();
    token.metadataUrl = fetchTokenURI(event.params.collection, event.params.tokenId);

    token.latestTradedPriceInBNB = ZERO_BD;
    token.tradeVolumeBNB = ZERO_BD;
    token.totalTrades = ZERO_BI;

    token.isTradable = true;

    let rawData = ipfs.cat(token.metadataUrl);

    if (rawData != null) {
      let obj = json.fromBytes(rawData).toObject();

      token.name = obj.get("name").toString();

      token.description = obj.get("description").toString();

      let fields: string[] = ["image", "mp4_url", "gif_url", "webm_url"];

      let visuals: string[];

      for (let i = 0; i < fields.length; i++) {
        let response: string;
        response = obj.get(fields[i]).toString();

        if (response != null) {
          visuals.push(response);
        }
      }

      token.visuals = visuals;
    }
  }

  token.save();

  // 3. Token
  let collection = Collection.load(event.params.collection.toHex());
  collection.numberTokensListed = collection.numberTokensListed.plus(ONE_BI);

  collection.save();
}

export function handleAskCancel(event: AskCancel): void {
  let user = User.load(event.params.seller.toHex());
  user.numberTokensListed = user.numberTokensListed;

  user.save();

  let collection = Collection.load(event.params.collection.toHex());
  collection.numberTokensListed = collection.numberTokensListed.minus(ONE_BI);

  collection.save();

  let tokenConcatId = event.params.collection.toString() + "-" + event.params.tokenId.toString();
  let token = NFT.load(tokenConcatId);

  token.isTradable = true;
  token.save();
}

/**
 * BUY ORDERS
 */

export function handleTrade(block: ethereum.Block, event: Trade): void {
  // 1. Transaction
  let transactionConcId =
    event.params.collection.toString() +
    "-" +
    event.params.tokenId.toString() +
    "-" +
    event.transaction.hash.toHexString();

  let transaction = new Transaction(transactionConcId);
  transaction.block = block.number;
  transaction.timestamp = block.timestamp;
  transaction.collection = event.params.collection.toHex();
  transaction.tokenId = event.params.collection.toString() + "-" + event.params.tokenId.toString();
  transaction.askPrice = event.params.price.toBigDecimal().div(EIGHTEEN_BD);
  transaction.netPrice = event.params.netPrice.toBigDecimal().div(EIGHTEEN_BD);
  transaction.buyer = event.params.buyer.toHex();
  transaction.seller = event.params.seller.toHex();
  transaction.withBNB = event.params.withBNB;

  transaction.save();

  // 2. Buyer
  let buyer = User.load(event.params.buyer.toHex());

  // Buyer may not exist
  if (buyer == null) {
    buyer = new User(event.params.buyer.toHex());
    buyer.numberTokensListed = ZERO_BI;
    buyer.numberTokensPurchased = ONE_BI;
    buyer.numberTokensSold = ZERO_BI;
    buyer.totalVolumeInBNBTokensPurchased = event.params.price.toBigDecimal().div(EIGHTEEN_BD);
    buyer.totalVolumeInBNBTokensSold = ZERO_BD;
    buyer.totalFeesCollectedInBNB = ZERO_BD;
    buyer.averageTokenPriceInBNBPurchased = event.params.price.toBigDecimal().div(EIGHTEEN_BD);
    buyer.averageTokenPriceInBNBSold = ZERO_BD;
  } else {
    buyer.numberTokensPurchased = buyer.numberTokensPurchased.plus(ONE_BI);
    buyer.totalVolumeInBNBTokensPurchased = buyer.totalVolumeInBNBTokensPurchased.plus(
      event.params.price.toBigDecimal().div(EIGHTEEN_BD)
    );
    buyer.averageTokenPriceInBNBPurchased = buyer.totalVolumeInBNBTokensPurchased.div(
      buyer.numberTokensPurchased.toBigDecimal()
    );
  }

  buyer.save();

  // 3. Seller
  let seller = User.load(event.params.seller.toHex());

  seller.numberTokensSold = seller.numberTokensSold.plus(ONE_BI);
  seller.totalVolumeInBNBTokensSold = seller.totalVolumeInBNBTokensSold.plus(
    event.params.netPrice.toBigDecimal().div(EIGHTEEN_BD)
  );
  seller.averageTokenPriceInBNBSold = seller.totalVolumeInBNBTokensSold.div(seller.numberTokensSold.toBigDecimal());

  seller.save();

  // 4. NFT
  let tokenConcatId = event.params.collection.toString() + "-" + event.params.tokenId.toString();
  let token = NFT.load(tokenConcatId);

  token.latestTradedPriceInBNB = event.params.price.toBigDecimal().div(EIGHTEEN_BD);
  token.tradeVolumeBNB = token.tradeVolumeBNB.plus(event.params.price.toBigDecimal().div(EIGHTEEN_BD));
  token.totalTrades = token.totalTrades.plus(ONE_BI);

  token.isTradable = false;

  token.save();
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
    user.totalFeesCollectedInBNB = event.params.amount.toBigDecimal().div(EIGHTEEN_BD);
    user.averageTokenPriceInBNBPurchased = ZERO_BD;
    user.averageTokenPriceInBNBSold = ZERO_BD;
  } else {
    user.totalFeesCollectedInBNB = user.totalFeesCollectedInBNB.plus(
      event.params.amount.toBigDecimal().div(EIGHTEEN_BD)
    );
  }

  user.save();
}
