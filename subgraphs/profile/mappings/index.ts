/* eslint-disable prefer-const */
import { Address, BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import { concat } from "@graphprotocol/graph-ts/helper-functions";
import { Point, Team, User } from "../generated/schema";
import {
  TeamAdd,
  TeamPointIncrease,
  UserChangeTeam,
  UserNew,
  UserPause,
  UserPointIncrease,
  UserPointIncreaseMultiple,
  UserReactivate,
} from "../generated/Profile/Profile";

// BigNumber-like references
let ZERO_BI = BigInt.fromI32(0);
let ONE_BI = BigInt.fromI32(1);

/**
 * TEAM
 */

export function handleTeamAdd(event: TeamAdd): void {
  // Fail safe condition in case the team has already been created.
  let team = Team.load(event.params.teamId.toString());
  if (team === null) {
    team = new Team(event.params.teamId.toString());
    team.name = event.params.teamName;
    team.isJoinable = true;
    team.block = event.block.number;
    team.timestamp = event.block.timestamp;
    team.totalUsers = ZERO_BI;
    team.totalPoints = ZERO_BI;
    team.save();
  }
}

export function handleTeamPointIncrease(event: TeamPointIncrease): void {
  let team = Team.load(event.params.teamId.toString());
  if (team === null) {
    log.error("Error in contract, increased point when teamId: {} was not created.", [event.params.teamId.toString()]);
  }

  let pointId = concat(
    Bytes.fromI32(event.params.campaignId.toI32()),
    Bytes.fromI32(event.params.teamId.toI32())
  ).toHex();
  let point = new Point(pointId);
  point.team = event.params.teamId.toString();
  point.points = event.params.numberPoints;
  point.campaignId = event.params.campaignId;
  point.hash = event.transaction.hash;
  point.block = event.block.number;
  point.timestamp = event.block.timestamp;
  point.save();

  team.totalPoints = team.totalPoints.plus(point.points);
  team.save();
}

/**
 * USER
 */

export function handleUserNew(event: UserNew): void {
  // Fail safe condition in case the user has already been created.
  let user = User.load(event.params.userAddress.toHex());
  if (user === null) {
    user = new User(event.params.userAddress.toHex());
    user.isActive = true;
    user.createdAt = event.block.timestamp;
    user.updatedAt = event.block.timestamp;
    user.block = event.block.number;
    user.team = event.params.teamId.toString();
    user.totalPoints = ZERO_BI;
    user.save();
  }

  // Update the team based on the new user joining it.
  let team = Team.load(event.params.teamId.toString());
  if (team === null) {
    log.error("Error in contract, joined team when teamId: {} was not created.", [event.params.teamId.toString()]);
  }
  team.totalUsers = team.totalUsers.plus(ONE_BI);
  team.save();
}

export function handleUserPause(event: UserPause): void {
  let user = User.load(event.params.userAddress.toHex());
  if (user === null) {
    log.error("Error in contract, paused user when userId: {} was not created.", [event.params.userAddress.toHex()]);
  }
  user.isActive = false;
  user.updatedAt = event.block.timestamp;
  user.save();

  // Update the team based on the new user joining it.
  let team = Team.load(event.params.teamId.toString());
  if (team === null) {
    log.error("Error in contract, paused user when teamId: {} was not created.", [event.params.teamId.toString()]);
  }
  team.totalUsers = team.totalUsers.minus(ONE_BI);
  team.save();
}

export function handleUserReactivate(event: UserReactivate): void {
  let user = User.load(event.params.userAddress.toHex());
  if (user === null) {
    log.error("Error in contract, resumed user when userId: {} was not created.", [event.params.userAddress.toHex()]);
  }
  user.isActive = true;
  user.updatedAt = event.block.timestamp;
  user.save();

  // Update the team based on the new user joining it.
  let team = Team.load(event.params.teamId.toString());
  if (team === null) {
    log.error("Error in contract, resumed user when teamId: {} was not created.", [event.params.teamId.toString()]);
  }
  team.totalUsers = team.totalUsers.plus(ONE_BI);
  team.save();
}

export function handleUserChangeTeam(event: UserChangeTeam): void {
  // Update the (old) team based on the user leaving it.
  let oldTeam = Team.load(event.params.oldTeamId.toString());
  if (oldTeam === null) {
    log.error("Error in contract, changed team when (old) teamId: {} was not created.", [
      event.params.oldTeamId.toString(),
    ]);
  }
  oldTeam.totalUsers = oldTeam.totalUsers.minus(ONE_BI);
  oldTeam.save();

  // Update the (new) team based on the user joining it.
  let newTeam = Team.load(event.params.newTeamId.toString());
  if (newTeam === null) {
    log.error("Error in contract, changed team when (new) teamId: {} was not created.", [
      event.params.newTeamId.toString(),
    ]);
  }
  newTeam.totalUsers = newTeam.totalUsers.plus(ONE_BI);
  newTeam.save();

  // Update the user based on his (new) team.
  let user = User.load(event.params.userAddress.toHex());
  if (user === null) {
    log.error("Error in contract, changed team when userId: {} was not created.", [event.params.userAddress.toHex()]);
  }
  user.team = event.params.newTeamId.toString();
  user.save();
}

export function handleUserPointIncrease(event: UserPointIncrease): void {
  let user = User.load(event.params.userAddress.toHex());
  if (user === null) {
    log.error("Error in contract, increased point when userId: {} was not created.", [
      event.params.userAddress.toHex(),
    ]);
  }

  let pointId = concat(
    Bytes.fromI32(event.params.campaignId.toI32()),
    Bytes.fromHexString(event.params.userAddress.toHex())
  ).toHex();
  let point = new Point(pointId);
  point.user = event.params.userAddress.toHex();
  point.points = event.params.numberPoints;
  point.campaignId = event.params.campaignId;
  point.hash = event.transaction.hash;
  point.block = event.block.number;
  point.timestamp = event.block.timestamp;
  point.save();

  user.totalPoints = user.totalPoints.plus(point.points);
  user.save();
}

export function handleUserPointIncreaseMultiple(event: UserPointIncreaseMultiple): void {
  event.params.userAddresses.forEach((userAddress: Address) => {
    let user = User.load(userAddress.toHex());
    if (user === null) {
      log.error("Error in contract, increased point when userId: {} was not created.", [userAddress.toHex()]);
    }

    let pointId = concat(
      Bytes.fromI32(event.params.campaignId.toI32()),
      Bytes.fromHexString(userAddress.toHex())
    ).toHex();
    let point = new Point(pointId);
    point.user = userAddress.toHex();
    point.points = event.params.numberPoints;
    point.campaignId = event.params.campaignId;
    point.hash = event.transaction.hash;
    point.block = event.block.number;
    point.timestamp = event.block.timestamp;
    point.save();

    user.totalPoints = user.totalPoints.plus(point.points);
    user.save();
  });
}
