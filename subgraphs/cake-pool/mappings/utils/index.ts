/* eslint-disable prefer-const */
import { BlockInfo, User } from "../../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts";

export let ZERO_BI = BigInt.fromI32(0);

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

export function getOrCreateBlockInfo(): BlockInfo {
  let blockInfo = BlockInfo.load("1");
  if (blockInfo === null) {
    blockInfo = new BlockInfo("1");
    blockInfo.lastBlockNumber = ZERO_BI;
    blockInfo.save();
  }
  return blockInfo as BlockInfo;
}
