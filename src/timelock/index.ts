/* eslint-disable prefer-const */
import { BigInt } from "@graphprotocol/graph-ts";
import { Timelock } from "../../generated/schema";
import { CancelTransaction, ExecuteTransaction, QueueTransaction } from "../../generated/Timelock/Timelock";

export function handleCanceledTransaction(event: CancelTransaction): void {
  let tl = Timelock.load(event.params.txHash.toHex());
  if (tl !== null) {
    tl.canceledBlock = event.block.number;
    tl.canceledAt = event.block.timestamp;
    tl.canceledTx = event.transaction.hash.toHex();
    tl.isCanceled = true;
    tl.save();
  }
}

export function handleExecutedTransaction(event: ExecuteTransaction): void {
  let tl = Timelock.load(event.params.txHash.toHex());
  if (tl !== null) {
    tl.executedBlock = event.block.number;
    tl.executedAt = event.block.timestamp;
    tl.executedTx = event.transaction.hash.toHex();
    tl.isExecuted = true;
    tl.save();
  }
}

export function handleQueuedTransaction(event: QueueTransaction): void {
  let tl = Timelock.load(event.params.txHash.toHex());
  if (tl === null) {
    tl = new Timelock(event.params.txHash.toHex());
    tl.targetAddress = event.params.target.toHex();
    tl.functionName = event.params.signature;
    tl.data = event.params.data.toHex();
    tl.value = event.params.value;
    tl.eta = event.params.eta;
    tl.createdBlock = event.block.number;
    tl.createdAt = event.block.timestamp;
    tl.createdTx = event.transaction.hash.toHex();
    tl.expiresAt = event.params.eta.plus(BigInt.fromI32(14 * 86400));
    tl.isExecuted = false;
    tl.isCanceled = false;
    tl.save();
  }
}
