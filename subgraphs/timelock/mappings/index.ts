/* eslint-disable prefer-const */
import { BigInt } from "@graphprotocol/graph-ts";
import { Timelock } from "../generated/schema";
import { CancelTransaction, ExecuteTransaction, QueueTransaction } from "../generated/Timelock/Timelock";

export function handleCanceledTransaction(event: CancelTransaction): void {
  let timelock = Timelock.load(event.params.txHash.toHex());
  if (timelock !== null) {
    timelock.canceledAt = event.block.timestamp;
    timelock.canceledBlock = event.block.number;
    timelock.canceledHash = event.transaction.hash;
    timelock.isCanceled = true;
    timelock.save();
  }
}

export function handleExecutedTransaction(event: ExecuteTransaction): void {
  let timelock = Timelock.load(event.params.txHash.toHex());
  if (timelock !== null) {
    timelock.executedAt = event.block.timestamp;
    timelock.executedBlock = event.block.number;
    timelock.executedHash = event.transaction.hash;
    timelock.isExecuted = true;
    timelock.save();
  }
}

export function handleQueuedTransaction(event: QueueTransaction): void {
  let timelock = Timelock.load(event.params.txHash.toHex());
  if (timelock === null) {
    timelock = new Timelock(event.params.txHash.toHex());
    timelock.target = event.params.target;
    timelock.signature = event.params.signature;
    timelock.data = event.params.data;
    timelock.value = event.params.value;
    timelock.eta = event.params.eta;
    timelock.createdAt = event.block.timestamp;
    timelock.createdBlock = event.block.number;
    timelock.createdHash = event.transaction.hash;
    timelock.expiresAt = event.params.eta.plus(BigInt.fromI32(14 * 86400));
    timelock.isExecuted = false;
    timelock.isCanceled = false;
    timelock.save();
  }
}
