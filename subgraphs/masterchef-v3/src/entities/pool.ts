import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { Pool } from "../../generated/schema";
import { ADDRESS_ZERO, BI_ZERO } from "../utils";
import { getOrCreateMasterChef } from "./master-chef";
// import { getOrCreateToken } from "./token";

// export function fetchPoolToken0(v3PoolAddress: Address): Token {
//   const poolContract = V3Pool.bind(v3PoolAddress);
//   const token0 = poolContract.token0();
//   return getOrCreateToken(token0);
// }
// export function fetchPoolToken1(v3PoolAddress: Address): Token {
//   const poolContract = V3Pool.bind(v3PoolAddress);
//   const token1 = poolContract.token1();
//   return getOrCreateToken(token1);
// }

export function getOrCreatePool(pid: BigInt, block: ethereum.Block): Pool {
  const masterChef = getOrCreateMasterChef(block);

  let pool = Pool.load(pid.toString());

  if (pool === null) {
    pool = new Pool(pid.toString());
    pool.masterChef = masterChef.id;
    pool.v3Pool = ADDRESS_ZERO;
    // pool.lmPool = ADDRESS_ZERO;
    pool.allocPoint = BI_ZERO;
    pool.allocPoint = BI_ZERO;
    pool.userCount = BI_ZERO;
    pool.totalUsersCount = BI_ZERO;
  }

  pool.timestamp = block.timestamp;
  pool.block = block.number;
  // pool.save();

  return pool as Pool;
}
