import { log } from "@graphprotocol/graph-ts";
import {
  Approval,
  Deposit,
  Lock,
  Transfer,
  Unlock,
  Withdraw,
} from "../../generated/templates/PotteryVault/PancakeSwapPotteryVault";

export function handleApproval(event: Approval): void {
  log.info("PotteryVault. Approve. Owner {}, Value {}, Spender {}", [
    event.params.owner.toHex(),
    event.params.value.toString(),
    event.params.spender.toHex(),
  ]);
}

export function handleDeposit(event: Deposit): void {
  log.info("PotteryVault. Deposit. Owner {}, Assets {}, Caller {}, Shares {}", [
    event.params.owner.toHex(),
    event.params.assets.toString(),
    event.params.caller.toHex(),
    event.params.shares.toString(),
  ]);
}

export function handleLock(event: Lock): void {
  log.info("PotteryVault. Lock. LockAmount {}, Admin {}, StartTime {}", [
    event.params.lockAmount.toString(),
    event.params.admin.toHex(),
    event.params.startTime.toString(),
  ]);
}

export function handleTransfer(event: Transfer): void {
  log.info("PotteryVault. Transfer. From {}, To {}, Value {}", [
    event.params.from.toHex(),
    event.params.to.toHex(),
    event.params.value.toString(),
  ]);
}

export function handleUnlock(event: Unlock): void {
  log.info("PotteryVault. Unlock. Admin {}, EndTime {}, ApyAmount {}, BurnAmount {}, EarnAmount {}", [
    event.params.admin.toHex(),
    event.params.endTime.toString(),
    event.params.apyAmount.toString(),
    event.params.burnAmount.toString(),
    event.params.earnAmount.toString(),
  ]);
}

export function handleWithdraw(event: Withdraw): void {
  log.info("PotteryVault. Withdraw. Assets {}, Caller {}, Owner {}, Shares {}, Receiver {}", [
    event.params.assets.toString(),
    event.params.caller.toHex(),
    event.params.owner.toHex(),
    event.params.shares.toString(),
    event.params.receiver.toHex(),
  ]);
}
