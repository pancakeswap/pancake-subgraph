import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { Pool } from "../../generated/schema";
import { ADDRESS_ZERO, BI_ZERO } from "../utils";
import { getOrCreateMasterChef } from "./master-chef";

export function getOrCreatePool(pid: BigInt, block: ethereum.Block): Pool {
  const masterChef = getOrCreateMasterChef(block);

  let pool = Pool.load(pid.toString());

  if (pool === null) {
    pool = new Pool(pid.toString());
    pool.masterChef = masterChef.id;
    pool.pair = ADDRESS_ZERO;
    pool.allocPoint = BI_ZERO;
    pool.lastRewardBlock = BI_ZERO;
    pool.accCakePerShare = BI_ZERO;
    pool.slpBalance = BI_ZERO;
    pool.userCount = BI_ZERO;
    pool.totalUsersCount = BI_ZERO;
    pool.totalBoostedShare = BI_ZERO;
  }

  pool.timestamp = block.timestamp;
  pool.block = block.number;
  pool.lastRewardBlock = block.number;
  pool.save();

  return pool as Pool;
}
