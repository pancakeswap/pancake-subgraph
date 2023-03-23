/* eslint-disable @typescript-eslint/no-unused-vars */
import { BigInt, log } from "@graphprotocol/graph-ts";
import {
  AddPool,
  Deposit,
  Harvest,
  NewPeriodDuration,
  NewUpkeepPeriod,
  SetPool,
  UpdateLiquidity,
  UpdateUpkeepPeriod,
  Withdraw,
} from "../../generated/MasterChefV3/MasterChefV3";
import { getOrCreateMasterChef } from "../entities/master-chef";
import { getOrCreatePool } from "../entities/pool";
import { getOrCreateUser, getOrCreateUserPosition } from "../entities/user";
import { BI_ONE } from "../utils";

export function handleAddPool(event: AddPool): void {
  log.info("[MasterChefV3] Add Pool {} {} {} {}", [
    event.params.pid.toString(),
    event.params.allocPoint.toString(),
    event.params.lmPool.toHex(),
    event.params.v3Pool.toHex(),
  ]);

  const masterChef = getOrCreateMasterChef(event.block);
  const pool = getOrCreatePool(event.params.pid, event.block);

  // pool.lmPool = event.params.lmPool;
  pool.allocPoint = event.params.allocPoint;
  pool.v3Pool = event.params.v3Pool;

  // let token0 = fetchPoolToken0(event.params.v3Pool);
  // let token1 = fetchPoolToken1(event.params.v3Pool);

  // pool.token0 = token0.id;
  // pool.token1 = token1.id;

  pool.save();

  masterChef.totalAllocPoint = masterChef.totalAllocPoint.plus(pool.allocPoint);
  masterChef.poolCount = masterChef.poolCount.plus(BI_ONE);
  masterChef.save();
}

export function handleSetPool(event: SetPool): void {
  log.info("[MasterChefV3] ˝Set Pool {} {}", [event.params.pid.toString(), event.params.allocPoint.toString()]);

  const masterChef = getOrCreateMasterChef(event.block);
  const pool = getOrCreatePool(event.params.pid, event.block);

  masterChef.totalAllocPoint = masterChef.totalAllocPoint.minus(pool.allocPoint).plus(event.params.allocPoint);

  masterChef.save();

  pool.allocPoint = event.params.allocPoint;
  pool.save();
}

// export function handleNewLMPool(event: NewLMPool): void {
//   log.info("[MasterChefV3] New LM Pool {} {}", [event.params.pid.toString(), event.params.LMPool.toHex()]);

//   const pool = getOrCreatePool(event.params.pid, event.block);

//   pool.lmPool = event.params.LMPool;
//   pool.save();
// }

export function handleDeposit(event: Deposit): void {
  log.info("[MasterChefV3] Log Deposit {} {} {} {}", [
    event.params.from.toHex(),
    event.params.pid.toString(),
    event.params.liquidity.toString(),
    event.params.tokenId.toString(),
  ]);

  const masterChef = getOrCreateMasterChef(event.block);
  const pool = getOrCreatePool(event.params.pid, event.block);
  const user = getOrCreateUser(event.params.from, pool, event.block);
  const userPosition = getOrCreateUserPosition(event.params.tokenId, pool, event.block);

  userPosition.tickLower = BigInt.fromI32(event.params.tickLower);
  userPosition.tickUpper = BigInt.fromI32(event.params.tickUpper);
  userPosition.isStaked = true;
  userPosition.user = user.id;

  // const multiplier = getBoostMultiplier(user);

  userPosition.save();
  pool.save();
  user.save();
}

export function handleWithdraw(event: Withdraw): void {
  log.info("[MasterChefV3] Log Withdraw {} {} {}", [
    event.params.from.toHex(),
    event.params.to.toString(),
    event.params.pid.toString(),
    event.params.tokenId.toString(),
  ]);

  const masterChef = getOrCreateMasterChef(event.block);
  const pool = getOrCreatePool(event.params.pid, event.block);
  const user = getOrCreateUser(event.params.from, pool, event.block);
  const userPosition = getOrCreateUserPosition(event.params.tokenId, pool, event.block);

  pool.userCount = pool.userCount.minus(BI_ONE);

  userPosition.isStaked = false;

  userPosition.save();
  pool.save();
  user.save();
}

export function handleUpdateLiquidity(event: UpdateLiquidity): void {
  log.info("[MasterChefV3] Log Update Liquidity {} {} {} {}", [
    event.params.from.toHex(),
    event.params.pid.toString(),
    event.params.liquidity.toString(),
    event.params.tokenId.toString(),
  ]);

  const masterChef = getOrCreateMasterChef(event.block);
  const pool = getOrCreatePool(event.params.pid, event.block);
  const userPosition = getOrCreateUserPosition(event.params.tokenId, pool, event.block);

  userPosition.tickLower = BigInt.fromI32(event.params.tickLower);
  userPosition.tickUpper = BigInt.fromI32(event.params.tickUpper);
  userPosition.liquidity = event.params.liquidity;
  userPosition.block = event.block.number;
  userPosition.timestamp = event.block.timestamp;
  userPosition.user = getOrCreateUser(event.params.from, pool, event.block).id;

  userPosition.save();
  pool.save();
}

// export function handleBurn(event: Burn): void {
//   log.info("[MasterChefV3] Log Burn {} {} {}", [
//     event.params.sender.toHex(),
//     event.params.pid.toString(),
//     event.params.tokenId.toString(),
//   ]);

//   const masterChef = getOrCreateMasterChef(event.block);
//   const pool = getOrCreatePool(event.params.pid, event.block);
//   const userPosition = getOrCreateUserPosition(event.params.tokenId, pool, event.block);

//   userPosition.isStaked = false;
//   userPosition.save();
// }

export function handleHarvest(event: Harvest): void {
  log.info("[MasterChefV3] Log Harvest {} {} {}", [
    event.params.pid.toHex(),
    event.params.reward.toString(),
    event.params.sender.toHex(),
    event.params.tokenId.toString(),
    event.params.to.toString(),
  ]);

  const pool = getOrCreatePool(event.params.pid, event.block);
  const userPosition = getOrCreateUserPosition(event.params.tokenId, pool, event.block);

  userPosition.earned = userPosition.earned.plus(event.params.reward);
}

export function handleNewPeriodDuration(event: NewPeriodDuration): void {
  log.info("[MasterChefV3] New Period Duration {}", [event.params.periodDuration.toString()]);

  const masterChef = getOrCreateMasterChef(event.block);
  masterChef.periodDuration = event.params.periodDuration;
}

export function handleNewUpkeepPeriod(event: NewUpkeepPeriod): void {
  log.info("[MasterChefV3] New Upkeep Period {} {} {} {}", [
    event.params.cakeAmount.toString(),
    event.params.cakePerSecond.toString(),
    event.params.startTime.toString(),
    event.params.endTime.toString(),
    event.params.periodNumber.toString(),
  ]);

  const masterChef = getOrCreateMasterChef(event.block);
  masterChef.latestPeriodStartTime = event.params.startTime;
  masterChef.latestPeriodEndTime = event.params.endTime;
  masterChef.latestPeriodCakePerSecond = event.params.cakePerSecond;
  masterChef.latestPeriodCakeAmount = event.params.cakeAmount;
}

// export function handleUpdateUpkeepPeriod(event: UpdateUpkeepPeriod): void {
//   log.info("[MasterChefV3] Update Upkeep Period {} {} {} {}", [
//     event.params.periodIndex.toString(),
//     event.params.oldEndTime.toString(),
//     event.params.newEndTime.toString(),
//     event.params.remainedCake.toString(),
//   ]);

//   const masterChef = getOrCreateMasterChef(event.block);
//   masterChef.latestPeriodStartTime = event.block.timestamp;
//   masterChef.latestPeriodEndTime = event.params.;
//   masterChef.latestPeriodCakePerSecond = event.params.cakePerSecond;
//   masterChef.latestPeriodCakeAmount = event.params.cakeAmount;
// }a
