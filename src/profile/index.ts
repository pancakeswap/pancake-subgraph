/* eslint-disable prefer-const */
import { Address, BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import { concat } from "@graphprotocol/graph-ts/helper-functions";
import { Point, Team, User } from "../../generated/schema";
import {
  TeamAdd,
  TeamPointIncrease,
  UserChangeTeam,
  UserNew,
  UserPause,
  UserPointIncrease,
  UserPointIncreaseMultiple,
  UserReactivate,
} from "../../generated/Profile/Profile";
import { increaseEntityPoints } from "./utils";

let ZERO_BI = BigInt.fromI32(0);
let ONE_BI = BigInt.fromI32(1);

/**
 * TEAM
 */

export function handleTeamAdd(event: TeamAdd): void {
  // Fail safe condition in case the team has already been created.
  let team = Team.load(event.params.teamId.toHex());
  if (team === null) {
    team = new Team(event.params.teamId.toHex());
    team.name = event.params.teamName;
    team.totalUsers = ZERO_BI;
    team.totalPoints = ZERO_BI;
    team.isJoinable = true;
    team.points = [];
    team.save();
  }
}

export function handleTeamPointIncrease(event: TeamPointIncrease): void {
  let team = Team.load(event.params.teamId.toHex());
  if (team === null) {
    log.error("Error in contract, increased point when teamId: {} was not created.", [event.params.teamId.toHex()]);
  }

  let pointId = concat(
    Bytes.fromI32(event.params.campaignId.toI32()),
    Bytes.fromI32(event.params.teamId.toI32())
  ).toHex();
  let point = new Point(pointId);
  point.points = event.params.numberPoints;
  point.campaignId = event.params.campaignId;
  point.save();

  increaseEntityPoints(team, point);
}

/**
 * USER
 */

export function handleUserNew(event: UserNew): void {
  // Fail safe condition in case the user has already been created.
  let user = User.load(event.params.teamId.toHex());
  if (user === null) {
    user = new User(event.params.userAddress.toHex());
    user.totalPoints = ZERO_BI;
    user.isActive = true;
    user.points = [];
    user.team = event.params.teamId.toHex();
    user.save();
  }

  // Update the team based on the new user joining it.
  let team = Team.load(event.params.teamId.toHex());
  if (team === null) {
    log.error("Error in contract, joined team when teamId: {} was not created.", [event.params.teamId.toHex()]);
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
  user.save();

  // Update the team based on the new user joining it.
  let team = Team.load(event.params.teamId.toHex());
  if (team === null) {
    log.error("Error in contract, paused user when teamId: {} was not created.", [event.params.teamId.toHex()]);
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
  user.save();

  // Update the team based on the new user joining it.
  let team = Team.load(event.params.teamId.toHex());
  if (team === null) {
    log.error("Error in contract, resumed user when teamId: {} was not created.", [event.params.teamId.toHex()]);
  }
  team.totalUsers = team.totalUsers.plus(ONE_BI);
  team.save();
}

export function handleUserChangeTeam(event: UserChangeTeam): void {
  // Update the (old) team based on the user leaving it.
  let oldTeam = Team.load(event.params.oldTeamId.toHex());
  if (oldTeam === null) {
    log.error("Error in contract, changed team when (old) teamId: {} was not created.", [
      event.params.oldTeamId.toHex(),
    ]);
  }
  oldTeam.totalUsers = oldTeam.totalUsers.minus(ONE_BI);
  oldTeam.save();

  // Update the (new) team based on the user joining it.
  let newTeam = Team.load(event.params.newTeamId.toHex());
  if (newTeam === null) {
    log.error("Error in contract, changed team when (new) teamId: {} was not created.", [
      event.params.newTeamId.toHex(),
    ]);
  }
  newTeam.totalUsers = newTeam.totalUsers.plus(ONE_BI);
  newTeam.save();

  // Update the user based on his (new) team.
  let user = User.load(event.params.userAddress.toHex());
  if (user === null) {
    log.error("Error in contract, changed team when userId: {} was not created.", [event.params.userAddress.toHex()]);
  }
  user.team = event.params.newTeamId.toHex();
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
  point.points = event.params.numberPoints;
  point.campaignId = event.params.campaignId;
  point.save();

  increaseEntityPoints(user, point);
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
    point.points = event.params.numberPoints;
    point.campaignId = event.params.campaignId;
    point.save();

    increaseEntityPoints(user, point);
  });
}
