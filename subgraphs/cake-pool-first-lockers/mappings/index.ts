/* eslint-disable prefer-const */
import { BigInt, log } from "@graphprotocol/graph-ts";
import { User, CakePool } from "../generated/schema";
import { Deposit, NewMaxLockDuration, Withdraw } from "../generated/CakePool/CakePool";

let ZERO_BI = BigInt.fromI32(0);

export function handleDeposit(event: Deposit): void {
  let cakePool = CakePool.load("1");
  if (cakePool !== null) {
    let time24hAfter = cakePool.creationTimestamp.plus(BigInt.fromI32(86400));
    if (
      (cakePool.maxLockDuration.equals(BigInt.fromI32(31536000)) && time24hAfter.ge(event.block.timestamp)) ||
      cakePool.maxLockDuration.notEqual(BigInt.fromI32(31536000))
    ) {
      let user = User.load(event.params.sender.toHex());
      if (user === null) {
        user = new User(event.params.sender.toHex());
        user.totalLocked = ZERO_BI;
        user.duration = ZERO_BI;
        user.save();
      }
      log.info("Duration - {}. Lock amount - {}", [event.params.duration.toString(), event.params.amount.toString()]);

      user.totalLocked = user.totalLocked.plus(event.params.amount);
      user.duration = user.duration.plus(event.params.duration);
      user.save();
    } else {
      log.error("24h from start already pass, {}, {}, {}", [
        time24hAfter.toString(),
        event.block.timestamp.toString(),
        event.block.number.toString(),
      ]);
    }
  }
}

export function startCountdown(event: NewMaxLockDuration): void {
  let cakePool = CakePool.load("1");
  log.warning("NewMaxLockDuration: {}", [event.params.maxLockDuration.toString()]);
  if (cakePool === null) {
    cakePool = new CakePool("1");
    cakePool.creationTimestamp = event.block.timestamp;
    cakePool.blockNumber = event.block.number;
    cakePool.maxLockDuration = event.params.maxLockDuration;
    cakePool.save();
  } else if (event.params.maxLockDuration.equals(BigInt.fromI32(31536000))) {
    cakePool.creationTimestamp = event.block.timestamp;
    cakePool.blockNumber = event.block.number;
    cakePool.maxLockDuration = event.params.maxLockDuration;
    cakePool.save();
  }
}
