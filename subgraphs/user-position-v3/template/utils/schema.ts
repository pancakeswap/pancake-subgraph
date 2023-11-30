import { BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { Transaction, UserPosition } from "../generated/schema";
import { ZERO_BI } from "./constants";

export function loadTransaction(event: ethereum.Event): Transaction {
  let transaction = Transaction.load(event.transaction.hash.toHexString());
  if (transaction === null) {
    transaction = new Transaction(event.transaction.hash.toHexString());
  }
  transaction.blockNumber = event.block.number;
  transaction.timestamp = event.block.timestamp;
  transaction.gasUsed = event.transaction.gasUsed;
  transaction.gasPrice = event.transaction.gasPrice;
  transaction.isPositionUpdated = false;
  transaction.save();
  return transaction as Transaction;
}

export function updateUserPosition(event: ethereum.Event, tx: Transaction): void {
  if (
    tx.isPositionUpdated === false &&
    tx.tickLower !== null &&
    tx.tickUpper !== null &&
    tx.tokenId !== null &&
    tx.positionOwner !== null &&
    (tx.increaseLiquidityAmount !== null || tx.decreaseLiquidityAmount !== null)
  ) {
    let userPosition = UserPosition.load(tx.tokenId.toString());
    if (userPosition === null) {
      userPosition = new UserPosition(tx.tokenId.toString());
      userPosition.liquidity = ZERO_BI;
      userPosition.pool = tx.pool;
      userPosition.createdAtBlockNumber = event.block.number;
      userPosition.createdAtTimestamp = event.block.timestamp;
    }
    userPosition.tickLower = tx.tickLower as BigInt;
    userPosition.tickUpper = tx.tickUpper as BigInt;
    userPosition.owner = tx.positionOwner as Bytes;
    userPosition.originOwner = tx.positionOwner as Bytes;
    if (tx.increaseLiquidityAmount !== null) {
      userPosition.liquidity = userPosition.liquidity.plus(tx.increaseLiquidityAmount as BigInt);
    }
    if (tx.decreaseLiquidityAmount !== null) {
      userPosition.liquidity = userPosition.liquidity.minus(tx.decreaseLiquidityAmount as BigInt);
    }

    tx.isPositionUpdated = true;
    tx.save();
    userPosition.save();
  }
}
