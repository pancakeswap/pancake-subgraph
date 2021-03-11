/* eslint-disable prefer-const */
import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { Competition, Team, User } from "../../generated/schema";
import { UserNew } from "../../generated/Profile/Profile";

let ZERO_BI = BigInt.fromI32(0);
let ONE_BI = BigInt.fromI32(1);
let ZERO_BD = BigDecimal.fromString("0");

/**
 * USER
 */

export function handleUserNew(event: UserNew): void {
  // Fail safe condition in case the competition has already been created.
  let competition = Competition.load("1");
  if (competition === null) {
    competition = new Competition("1");
    competition.totalVolumeUSD = ZERO_BD;
    competition.totalVolumeBNB = ZERO_BD;
    competition.userCount = ZERO_BI;
    competition.txCount = ZERO_BI;
    competition.save();
  }

  // Fail safe condition in case the team has already been created.
  let team = Team.load(event.params.teamId.toHex());
  if (team === null) {
    team = new Team(event.params.teamId.toHex());
    team.userCount = ZERO_BI;
    team.totalVolumeUSD = ZERO_BD;
    team.totalVolumeBNB = ZERO_BD;
    team.txCount = ZERO_BI;
    team.save();
  }

  // Fail safe condition in case the user has already been created.
  let user = User.load(event.params.userAddress.toHex());
  if (user === null) {
    user = new User(event.params.userAddress.toHex());
    user.team = event.params.teamId.toHex();
    user.block = event.block.number;
    user.totalVolumeUSD = ZERO_BD;
    user.totalVolumeBNB = ZERO_BD;
    user.txCount = ZERO_BI;
    user.save();
  }

  // Competition statistics.
  competition.userCount = competition.userCount.plus(ONE_BI);
  competition.save();

  // Team statistics.
  team.userCount = team.userCount.plus(ONE_BI);
  team.save();
}
