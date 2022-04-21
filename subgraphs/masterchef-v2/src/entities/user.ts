/* eslint-disable @typescript-eslint/no-unused-vars */
import { Pool, User } from "../../generated/schema";
import { BigInt, Address, ethereum } from "@graphprotocol/graph-ts";
import { getOrCreateMasterChef } from "./master-chef";
import { getOrCreatePool } from "./pool";
import { BI_ZERO, BI_ONE, BOOST_PRECISION } from "../utils";

export function getOrCreateUser(address: Address, pool: Pool, block: ethereum.Block): User {
  const masterChef = getOrCreateMasterChef(block);

  const uid = address.toHex();
  const id = pool.id.concat("-").concat(uid);
  let user = User.load(id);

  if (user === null) {
    user = new User(id);
    user.address = address;
    user.pool = pool.id;
    user.amount = BI_ZERO;
    user.rewardDebt = BI_ZERO;
    user.boostMultiplier = BOOST_PRECISION;

    pool.userCount = pool.userCount.plus(BI_ONE);
    pool.totalUsersCount = pool.totalUsersCount.plus(BI_ONE);
    pool.save();
  }

  user.timestamp = block.timestamp;
  user.block = block.number;
  user.save();

  return user as User;
}

export function getBoostMultiplier(user: User): BigInt {
  return user.boostMultiplier.gt(BOOST_PRECISION) ? user.boostMultiplier : BOOST_PRECISION;
}
