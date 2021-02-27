/* eslint-disable prefer-const */
import { BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import { concat } from "@graphprotocol/graph-ts/helper-functions";
import { Points, Team, User } from "../../generated/schema";
import {
  TeamAdd,
  TeamPointIncrease,
  UserChangeTeam,
  UserNew,
  UserPause,
  UserPointIncrease,
  UserReactivate,
} from "../../generated/Profile/Profile";

let ZERO_BI = BigInt.fromI32(0);
let ONE_BI = BigInt.fromI32(1);

/**
 * TEAM
 */

export function handleTeamAdd(event: TeamAdd): void {
  let team = new Team(event.params.teamId.toHex());
  team.name = event.params.teamName;
  team.totalUsers = ZERO_BI;
  team.totalPoints = ZERO_BI;
  team.isJoinable = true;
  team.users = [];
  team.points = [];
  team.save();
}

export function handleTeamPointIncrease(event: TeamPointIncrease): void {
  let team = Team.load(event.params.teamId.toHex());
  if (team === null) {
    log.error("Error in contract, increased point when team was not created.", []);
  }

  let pointId = concat(
    Bytes.fromI32(event.params.campaignId.toI32()),
    Bytes.fromI32(event.params.teamId.toI32())
  ).toHex();
  let point = new Points(pointId);
  point.points = event.params.numberPoints;
  point.campaignId = event.params.campaignId;
  point.save();

  team.totalPoints = team.totalUsers.plus(event.params.numberPoints);
  team.points = team.points.concat([point.id]);
  team.save();
}

/**
 * USER
 */

export function handleUserNew(event: UserNew): void {
  let user = new User(event.params.userAddress.toHex());
  user.totalPoints = ZERO_BI;
  user.isActive = true;
  user.points = [];
  user.team = event.params.teamId.toHex();
  user.save();

  // Update the team based on the new user joining it.
  let team = Team.load(event.params.teamId.toHex());
  if (team === null) {
    log.error("Error in contract, increased point when team was not created.", []);
  }
  team.totalUsers = team.totalUsers.plus(ONE_BI);
  team.users = team.users.concat([event.params.userAddress.toHex()]);
  team.save();
}

export function handleUserPause(event: UserPause): void {
  let user = User.load(event.params.userAddress.toHex());
  if (user === null) {
    log.error("Error in contract, increased point when user was not created.", []);
  }
  user.isActive = false;
  user.save();

  // Update the team based on the new user joining it.
  let team = Team.load(event.params.teamId.toHex());
  if (team === null) {
    log.error("Error in contract, increased point when team was not created.", []);
  }
  team.totalUsers = team.totalUsers.minus(ONE_BI);
  team.save();
}

export function handleUserReactivate(event: UserReactivate): void {
  let user = User.load(event.params.userAddress.toHex());
  if (user === null) {
    log.error("Error in contract, increased point when user was not created.", []);
  }
  user.isActive = true;
  user.save();

  // Update the team based on the new user joining it.
  let team = Team.load(event.params.teamId.toHex());
  if (team === null) {
    log.error("Error in contract, increased point when team was not created.", []);
  }
  team.totalUsers = team.totalUsers.plus(ONE_BI);
  team.save();
}

export function handleUserChangeTeam(event: UserChangeTeam): void {
  let user = User.load(event.params.userAddress.toHex());
  if (user === null) {
    log.error("Error in contract, increased point when user was not created.", []);
  }
  user.team = event.params.newTeamId.toHex();
  user.save();

  // Update the oldTeam based on the new user joining it.
  let oldTeam = Team.load(event.params.oldTeamId.toHex());
  if (oldTeam === null) {
    log.error("Error in contract, increased point when team was not created.", []);
  }
  oldTeam.totalUsers = oldTeam.totalUsers.minus(ONE_BI);
  oldTeam.users = oldTeam.users.filter((user) => user !== event.params.userAddress.toHex());
  oldTeam.save();

  // Update the newTeam based on the new user joining it.
  let newTeam = Team.load(event.params.newTeamId.toHex());
  if (newTeam === null) {
    log.error("Error in contract, increased point when team was not created.", []);
  }
  newTeam.totalUsers = newTeam.totalUsers.plus(ONE_BI);
  newTeam.users = newTeam.users.concat([event.params.userAddress.toHex()]);
  newTeam.save();
}

export function handleUserPointIncrease(event: UserPointIncrease): void {
  let user = User.load(event.params.userAddress.toHex());
  if (user === null) {
    log.error("Error in contract, increased point when user was not created.", []);
  }

  let pointId = concat(
    Bytes.fromI32(event.params.campaignId.toI32()),
    Bytes.fromHexString(event.params.userAddress.toHex())
  ).toHex();
  let point = new Points(pointId);
  point.points = event.params.numberPoints;
  point.campaignId = event.params.campaignId;
  point.save();

  user.totalPoints = user.totalPoints.plus(event.params.numberPoints);
  user.points = user.points.concat([point.id]);
  user.save();
}
