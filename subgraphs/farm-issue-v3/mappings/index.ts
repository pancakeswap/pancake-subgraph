import { Deposit as DepositEvent, MasterChefV3 } from "../generated/MasterChefV3/MasterChefV3";
import { V3Pool } from "../generated/MasterChefV3/V3Pool";
import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { Deposit } from "../generated/schema";
import { getOrCreateUser } from "./utils";

let MASTER_CHEF_V3_ADDRESS = Address.fromString("0x556B9306565093C855AEA9AE92A594704c2Cd59e");

// let BI_TWO = BigInt.fromString("2");

//Already divided /2
let uint256Max = BigInt.fromString("57896044618658097711785492504343953926634992332820282019728792003956564819967");

export function handleDeposit(event: DepositEvent): void {
  let mChefV3 = MasterChefV3.bind(MASTER_CHEF_V3_ADDRESS);
  let result = mChefV3.try_userPositionInfos(event.params.tokenId);
  if (result.reverted) {
    log.error("Cannot fetch try_userPositionInfos", []);
  } else {
    let userPositionInfos = result.value;
    let rewardGrowthInside = userPositionInfos.value4;
    let boostLiquidity = userPositionInfos.value1;
    log.info("rewardGrowthInside {}", [rewardGrowthInside.toString()]);

    //This deposit is affected
    if (rewardGrowthInside.gt(uint256Max)) {
      let deposit = new Deposit(
        event.transaction.hash.toHex() +
          "-" +
          event.params.from.toHex() +
          "-" +
          event.params.tokenId.toString() +
          "-" +
          event.params.liquidity.toString() +
          "-" +
          BigInt.fromI32(event.params.tickLower as i32).toString() +
          "-" +
          BigInt.fromI32(event.params.tickUpper as i32).toString()
      );
      deposit.rewardGrowthInside = rewardGrowthInside;
      deposit.pid = event.params.pid;
      deposit.tokenId = event.params.tokenId;
      deposit.user = getOrCreateUser(event.params.from.toHex()).id;
      deposit.tickLower = BigInt.fromI32(event.params.tickLower as i32);
      deposit.tickUpper = BigInt.fromI32(event.params.tickUpper as i32);
      deposit.liquidity = event.params.liquidity;
      deposit.boostLiquidity = boostLiquidity;
      deposit.timestamp = event.block.timestamp;
      deposit.block = event.block.number;

      let result = mChefV3.try_poolInfo(event.params.pid);
      if (result.reverted) {
        log.error("Cannot fetch try_poolInfo", []);
      } else {
        let v3PoolAddress = result.value.value1;
        let v3Pool = V3Pool.bind(v3PoolAddress);
        deposit.lmPool = v3Pool.lmPool();
      }

      deposit.save();
    }
  }
}
