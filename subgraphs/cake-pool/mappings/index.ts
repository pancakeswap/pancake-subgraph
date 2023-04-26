/* eslint-disable prefer-const */
import { BigInt, log } from "@graphprotocol/graph-ts";
import { CakePool } from "../generated/schema";
import { Lock, NewMaxLockDuration, Unlock } from "../generated/CakePool/CakePool";
import { getOrCreateUser, getUserLockAmount, getUserLockTime, ZERO_BI } from "./utils";

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
    cakePool.save();
  }
}

export function handleLock(event: Lock): void {
  let cakePool = CakePool.load("1");
  if (cakePool !== null) {
    let user = getOrCreateUser(event.params.sender.toHex());

    let lockTime = getUserLockTime(user.id);
    let userTotalLocked = getUserLockAmount(user.id);

    cakePool.totalLocked = cakePool.totalLocked.minus(user.totalLocked).plus(userTotalLocked);
    cakePool.save();

    user.lockStartTime = lockTime.lockStartTime;
    user.lockEndTime = lockTime.lockEndTime;
    user.totalLocked = userTotalLocked;
    user.duration = event.params.lockedDuration;
    user.locked = true;
    user.save();
  }
}

export function handleUnlock(event: Unlock): void {
  let cakePool = CakePool.load("1");
  if (cakePool !== null) {
    let user = getOrCreateUser(event.params.sender.toHex());

    cakePool.totalLocked = cakePool.totalLocked.minus(user.totalLocked);
    cakePool.save();

    user.totalLocked = ZERO_BI;
    user.lockStartTime = ZERO_BI;
    user.lockEndTime = ZERO_BI;
    user.locked = false;

    user.save();
  }
}
