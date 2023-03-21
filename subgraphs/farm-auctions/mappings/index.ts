/* eslint-disable prefer-const */
import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { Auction, Bidder } from "../generated/schema";
import {
  AuctionBid,
  AuctionClose,
  AuctionStart,
  WhitelistAdd,
  WhitelistRemove,
} from "../generated/FarmAuction/FarmAuction";
import { toBigDecimal } from "./utils";

// BigNumber-like references
let ZERO_BI = BigInt.fromI32(0);
let ONE_BI = BigInt.fromI32(1);
let ZERO_BD = BigDecimal.fromString("0");

/**
 * Whitelisting service
 */

export function handleWhitelistAdd(event: WhitelistAdd): void {
  let bidder = Bidder.load(event.params.account.toHex());
  if (bidder === null) {
    bidder = new Bidder(event.params.account.toHex());
    bidder.isWhitelisted = true;
    bidder.totalBids = ZERO_BI;
    bidder.totalCake = ZERO_BD;
    bidder.block = event.block.number;
    bidder.timestamp = event.block.timestamp;
    bidder.save();
  }
  bidder.isWhitelisted = true;
  bidder.save();
}

export function handleWhitelistRemove(event: WhitelistRemove): void {
  let bidder = Bidder.load(event.params.account.toHex());
  if (bidder === null) {
    bidder = new Bidder(event.params.account.toHex());
    bidder.isWhitelisted = false;
    bidder.totalBids = ZERO_BI;
    bidder.totalCake = ZERO_BD;
    bidder.block = event.block.number;
    bidder.timestamp = event.block.timestamp;
    bidder.save();
  }
  bidder.isWhitelisted = false;
  bidder.save();
}

/**
 * Auction service
 */

export function handleAuctionStart(event: AuctionStart): void {
  let auction = new Auction(event.params.auctionId.toString());
  auction.totalBids = ZERO_BI;
  auction.totalCake = ZERO_BD;
  auction.status = "Open";
  auction.startBlock = event.params.startBlock;
  auction.endBlock = event.params.endBlock;
  auction.initialBidAmount = toBigDecimal(event.params.initialBidAmount);
  auction.leaderboard = event.params.leaderboard;
  auction.leaderboardThreshold = ZERO_BD;
  auction.save();
}

export function handleAuctionClose(event: AuctionClose): void {
  let auction = Auction.load(event.params.auctionId.toString());
  if (auction !== null) {
    auction.status = "Close";
    auction.leaderboardThreshold = toBigDecimal(event.params.participationLimit);
    auction.save();
  }
}

export function handleAuctionBid(event: AuctionBid): void {
  let auction = Auction.load(event.params.auctionId.toString());
  if (auction !== null) {
    auction.totalBids = auction.totalBids.plus(ONE_BI);
    auction.totalCake = auction.totalCake.plus(toBigDecimal(event.params.amount));
    auction.save();
  }

  let bidder = Bidder.load(event.params.account.toHex());
  if (bidder !== null) {
    bidder.totalBids = bidder.totalBids.plus(ONE_BI);
    bidder.totalCake = bidder.totalCake.plus(toBigDecimal(event.params.amount));
    bidder.save();
  }
}
