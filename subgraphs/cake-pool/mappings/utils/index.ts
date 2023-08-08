/* eslint-disable prefer-const */
import { User } from "../../generated/schema";
import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { CakePool } from "../../generated/CakePool/CakePool";

export let ZERO_BI = BigInt.fromI32(0);
export let BI_1E18 = BigInt.fromString("1000000000000000000");
export let CAKE_POOL_CONTRACT = CakePool.bind(Address.fromString("0x45c54210128a065de780C4B0Df3d16664f7f859e"));

export class LockTime {
  lockStartTime: BigInt;
  lockEndTime: BigInt;
}

export function getOrCreateUser(id: string): User {
  let user = User.load(id);
  if (user === null) {
    user = new User(id);
    user.lockStartTime = ZERO_BI;
    user.lockEndTime = ZERO_BI;
    user.totalLocked = ZERO_BI;
    user.duration = ZERO_BI;
    user.save();
  }
  return user as User;
}

export function getUserLockAmount(userAddress: string): BigInt {
  let userInfoResult = CAKE_POOL_CONTRACT.try_userInfo(Address.fromString(userAddress));
  let cakeAmount = ZERO_BI;
  if (userInfoResult.reverted) {
    log.warning("Unable to fetch try_userInfo for {}", [CAKE_POOL_CONTRACT._address.toHex()]);
  } else {
    let userInfo = userInfoResult.value;
    let shares = userInfo.value0;
    let userBoostedShare = userInfo.value6;
    let pricePerFullShareResult = CAKE_POOL_CONTRACT.try_getPricePerFullShare();
    if (pricePerFullShareResult.reverted) {
      log.warning("Unable to fetch try_getPricePerFullShare for {}", [CAKE_POOL_CONTRACT._address.toHex()]);
    } else {
      let pricePerFullShare = pricePerFullShareResult.value;
      // cake amount (wei), in flexible staking, userInfo.userBoostedShare should be 0.
      cakeAmount = shares.times(pricePerFullShare).div(BI_1E18).minus(userBoostedShare);
    }
  }
  return cakeAmount;
}

export function getUserLockTime(userAddress: string): LockTime {
  let userInfoResult = CAKE_POOL_CONTRACT.try_userInfo(Address.fromString(userAddress));
  let lockStartTime = ZERO_BI;
  let lockEndTime = ZERO_BI;
  if (userInfoResult.reverted) {
    log.warning("Unable to fetch try_userInfo for {}", [CAKE_POOL_CONTRACT._address.toHex()]);
  } else {
    let userInfo = userInfoResult.value;
    lockStartTime = userInfo.value4;
    lockEndTime = userInfo.value5;
  }
  return { lockStartTime, lockEndTime };
}
