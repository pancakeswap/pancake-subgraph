/* eslint-disable prefer-const */
import { Address, BigInt, ethereum, log, store } from "@graphprotocol/graph-ts";
import { Bundle, Competition, Team, User } from "../../generated/schema";
import { Pair as PairTemplate } from "../../generated/templates";
import { NewCompetitionStatus, UserRegister } from "../../generated/TradingCompetitionV1/TradingCompetitionV1";
import { getBnbPriceInUSD, ONE_BI, TRACKED_PAIRS, ZERO_BD, ZERO_BI } from "./utils";

/**
 * USER
 */

export function handleBlock(event: ethereum.Block): void {
  // Fail safe condition in case the bundle has already been created.
  let bundle = Bundle.load("1");
  if (bundle === null) {
    bundle = new Bundle("1");
    bundle.bnbPrice = ZERO_BD;
    bundle.block = ZERO_BI;
    bundle.save();
  }

  bundle.bnbPrice = getBnbPriceInUSD();
  bundle.block = event.number;
  bundle.save();
}

/**
 * USER
 */

export function handleUserRegister(event: UserRegister): void {
  // Fail safe condition in case the competition has already been created.
  let competition = Competition.load("1");
  if (competition === null) {
    competition = new Competition("1");
    competition.status = BigInt.fromI32(2); // Close
    competition.volumeUSD = ZERO_BD;
    competition.volumeBNB = ZERO_BD;
    competition.userCount = ZERO_BI;
    competition.txCount = ZERO_BI;
    competition.save();
  }

  // Fail safe condition in case the team has already been created.
  let team = Team.load(event.params.teamId.toHex());
  if (team === null) {
    team = new Team(event.params.teamId.toHex());
    team.userCount = ZERO_BI;
    team.volumeUSD = ZERO_BD;
    team.volumeBNB = ZERO_BD;
    team.txCount = ZERO_BI;
    team.save();
  }

  // Fail safe condition in case the user has already been created.
  let user = User.load(event.params.userAddress.toHex());
  if (user === null) {
    user = new User(event.params.userAddress.toHex());
    user.team = event.params.teamId.toHex();
    user.block = event.block.number;
    user.volumeUSD = ZERO_BD;
    user.volumeBNB = ZERO_BD;
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

/**
 * COMPETITION
 */

export function handleNewCompetitionStatus(event: NewCompetitionStatus): void {
  // Fail safe condition in case the competition has already been created.
  let competition = Competition.load("1");
  if (competition === null) {
    competition = new Competition("1");
    competition.status = BigInt.fromI32(2); // Close
    competition.volumeUSD = ZERO_BD;
    competition.volumeBNB = ZERO_BD;
    competition.userCount = ZERO_BI;
    competition.txCount = ZERO_BI;
    competition.save();
  }

  competition.status = BigInt.fromI32(event.params.status);
  competition.save();

  // Competition has opened, trigger PairCreated to follow `Swap` events.
  if (BigInt.fromI32(event.params.status).equals(BigInt.fromI32(1))) {
    TRACKED_PAIRS.forEach((address: string) => {
      PairTemplate.create(Address.fromString(address));

      log.info("Created pair with address {}.", [address]);
    });
  }

  // Competition has closed, remove PairCreated to close competition.
  if (BigInt.fromI32(event.params.status).equals(BigInt.fromI32(2))) {
    TRACKED_PAIRS.forEach((address: string) => {
      if (store.get("Pair", address)) {
        store.remove("Pair", address);

        log.info("Removed pair with address {}.", [address]);
      }
    });
  }
}
