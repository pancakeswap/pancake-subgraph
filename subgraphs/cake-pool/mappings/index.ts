/* eslint-disable prefer-const */
import { BigInt, log } from "@graphprotocol/graph-ts";
import { CakePool } from "../generated/schema";
import { Deposit, Lock, NewMaxLockDuration, Unlock } from "../generated/CakePool/CakePool";
import { getOrCreateUser, ZERO_BI } from "./utils";

export function startCountdown(event: NewMaxLockDuration): void {
  let cakePool = CakePool.load("1");
  log.warning("NewMaxLockDuration: {}", [event.params.maxLockDuration.toString()]);
  //Start calculation when first time max duration of 52 weeks was set up
  if (cakePool === null && event.params.maxLockDuration.equals(BigInt.fromI32(31536000))) {
    cakePool = new CakePool("1");
    cakePool.creationTimestamp = event.block.timestamp;
    cakePool.blockNumber = event.block.number;
    cakePool.totalLocked = ZERO_BI;
    cakePool.maxLockDuration = event.params.maxLockDuration;
    cakePool.usersWithLockedCake = [];
    cakePool.save();
  }
}

export function handleDeposit(event: Deposit): void {
  let cakePool = CakePool.load("1");
  if (cakePool !== null) {
    let user = getOrCreateUser(event.params.sender.toHex());
    // log.info("Deposit. Duration - {}. Lock amount - {}", [
    //   event.params.duration.toString(),
    //   event.params.amount.toString(),
    // ]);

    if (event.params.duration.gt(ZERO_BI)) {
      if (user.lockEndTime < event.block.timestamp) {
        user.lockStartTime = event.block.timestamp;
        user.lockEndTime = event.block.timestamp.plus(event.params.duration);
      } else {
        user.lockEndTime = user.lockEndTime.plus(event.params.duration);
      }
      cakePool.usersWithLockedCake = cakePool.usersWithLockedCake.concat([event.params.sender.toHex()]);
    } else {
      if (user.totalLocked.gt(ZERO_BI)) {
        user.totalLocked = user.totalLocked.plus(event.params.amount);
        cakePool.totalLocked = cakePool.totalLocked.plus(event.params.amount);
      }
    }

    user.save();
    cakePool.save();
  }
}

export function handleLock(event: Lock): void {
  let cakePool = CakePool.load("1");
  if (cakePool !== null) {
    let user = getOrCreateUser(event.params.sender.toHex());
    // log.info("Lock. Duration - {}. Lock amount - {}", [
    //   event.params.lockedDuration.toString(),
    //   event.params.lockedAmount.toString(),
    // ]);

    cakePool.totalLocked = cakePool.totalLocked.minus(user.totalLocked).plus(event.params.lockedAmount);
    cakePool.save();

    user.totalLocked = event.params.lockedAmount;
    user.duration = event.params.lockedDuration;
    user.locked = true;
    user.save();
  }
}

export function handleUnlock(event: Unlock): void {
  let cakePool = CakePool.load("1");
  if (cakePool !== null) {
    let user = getOrCreateUser(event.params.sender.toHex());
    // log.info("Unlock. Amount - {}", [event.params.amount.toString()]);

    cakePool.totalLocked = cakePool.totalLocked.minus(event.params.amount);
    cakePool.save();

    user.totalLocked = user.totalLocked.minus(event.params.amount);
    user.lockStartTime = ZERO_BI;
    user.lockEndTime = ZERO_BI;
    user.locked = false;

    user.save();
  }
}
