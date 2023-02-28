/* eslint-disable @typescript-eslint/no-unused-vars */
import { Pool, User, UserPosition } from "../../generated/schema";
import { BigInt, Address, ethereum } from "@graphprotocol/graph-ts";
import { getOrCreateMasterChef } from "./master-chef";
import { getOrCreatePool } from "./pool";
import { BI_ZERO, BI_ONE, BOOST_PRECISION } from "../utils";

export function getOrCreateUser(address: Address, pool: Pool, block: ethereum.Block): User {
  const masterChef = getOrCreateMasterChef(block);

  const uid = address.toHex();
  let user = User.load(uid);

  if (user === null) {
    user = new User(uid);
    user.address = address;

    pool.userCount = pool.userCount.plus(BI_ONE);
    pool.totalUsersCount = pool.totalUsersCount.plus(BI_ONE);
    pool.save();
  }

  user.timestamp = block.timestamp;
  user.block = block.number;
  user.save();

  return user as User;
}

// export function getBoostMultiplier(user: User): BigInt {
//   return user.boostMultiplier.gt(BOOST_PRECISION) ? user.boostMultiplier : BOOST_PRECISION;
// }

export function getOrCreateUserPosition(tokenId: BigInt, pool: Pool, block: ethereum.Block): UserPosition {
  const uid = tokenId.toString();
  let userPosition = UserPosition.load(uid);

  if (userPosition === null) {
    userPosition = new UserPosition(uid);
    userPosition.pool = pool.id;
    userPosition.timestamp = block.timestamp;
    userPosition.block = block.number;
    userPosition.earned = BI_ZERO;
    userPosition.isStaked = false;
  }

  return userPosition as UserPosition;
}
