/* eslint-disable prefer-const */
import { Address, BigInt, ethereum, log } from "@graphprotocol/graph-ts";
import { Bundle, Competition, Team, User } from "../generated/schema";
import { Pair as PairTemplate } from "../generated/templates";
import { NewCompetitionStatus, UserRegister } from "../generated/TradingCompetitionV1/TradingCompetitionV1";
import { BD_ZERO, BI_ONE, BI_ZERO, getBnbPriceInUSD, TRACKED_PAIRS } from "./utils";

/**
 * BLOCK
 */

export function handleBlock(event: ethereum.Block): void {
  // Fail safe condition in case the bundle has already been created.
  let bundle = Bundle.load("1");
  if (bundle === null) {
    bundle = new Bundle("1");
    bundle.bnbPrice = BD_ZERO;
    bundle.block = BI_ZERO;
    bundle.save();
  }
  bundle.bnbPrice = getBnbPriceInUSD();
  bundle.block = event.number;
  bundle.save();
}

/**
 * COMPETITION
 */

export function handleUserRegister(event: UserRegister): void {
  // Fail safe condition in case the competition has already been created.
  let competition = Competition.load("1");
  if (competition === null) {
    competition = new Competition("1");
    competition.status = BI_ZERO; // Registration
    competition.userCount = BI_ZERO;
    competition.volumeUSD = BD_ZERO;
    competition.volumeBNB = BD_ZERO;
    competition.txCount = BI_ZERO;
    competition.save();
  }
  competition.userCount = competition.userCount.plus(BI_ONE);
  competition.save();

  // Fail safe condition in case the team has already been created.
  let team = Team.load(event.params.teamId.toString()); // Use `String` instead of `hex` to make the reconciliation simpler.
  if (team === null) {
    team = new Team(event.params.teamId.toString());
    team.userCount = BI_ZERO;
    team.volumeUSD = BD_ZERO;
    team.volumeBNB = BD_ZERO;
    team.txCount = BI_ZERO;
    team.save();
  }
  team.userCount = team.userCount.plus(BI_ONE);
  team.save();

  // Fail safe condition in case the user has already been created.
  let user = User.load(event.params.userAddress.toHex());
  if (user === null) {
    user = new User(event.params.userAddress.toHex());
    user.competition = competition.id;
    user.team = team.id;
    user.block = event.block.number;
    user.volumeUSD = BD_ZERO;
    user.volumeBNB = BD_ZERO;
    user.txCount = BI_ZERO;
    user.save();
  }
}

export function handleNewCompetitionStatus(event: NewCompetitionStatus): void {
  // Fail safe condition in case the competition has already been created.
  let competition = Competition.load("1");
  if (competition === null) {
    competition = new Competition("1");
    competition.status = BI_ZERO; // Registration
    competition.userCount = BI_ZERO;
    competition.volumeUSD = BD_ZERO;
    competition.volumeBNB = BD_ZERO;
    competition.txCount = BI_ZERO;
    competition.save();
  }
  competition.status = BigInt.fromI32(event.params.status);
  competition.save();

  // Competition has opened, trigger PairCreated to follow `Swap` events.
  if (BigInt.fromI32(event.params.status).equals(BI_ONE)) {
    TRACKED_PAIRS.forEach((address: string) => {
      PairTemplate.create(Address.fromString(address));

      log.info("Created pair with address {}.", [address]);
    });
  }
}
