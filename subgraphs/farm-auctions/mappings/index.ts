/* eslint-disable prefer-const */
import { BigInt } from "@graphprotocol/graph-ts";
import { Bidder } from "../generated/schema";
import { AuctionBid, WhitelistAdd, WhitelistRemove } from "../generated/FarmAuction/FarmAuction";

// BigNumber-like references
let ZERO_BI = BigInt.fromI32(0);
let ONE_BI = BigInt.fromI32(1);

/**
 * Whitelisting service
 */

export function handleWhitelistAdd(event: WhitelistAdd): void {
  let bidder = Bidder.load(event.params.account.toHex());
  if (bidder === null) {
    bidder = new Bidder(event.params.account.toHex());
    bidder.isWhitelisted = true;
    bidder.totalBids = ZERO_BI;
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

export function handleAuctionBid(event: AuctionBid): void {
  let bidder = Bidder.load(event.params.account.toHex());
  if (bidder !== null) {
    bidder.totalBids = bidder.totalBids.plus(ONE_BI);
    bidder.save();
  }
}
