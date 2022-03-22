/* eslint-disable prefer-const */
import { BigDecimal, log } from "@graphprotocol/graph-ts";
import { Bundle, Competition, Team, User, PairStats } from "../generated/schema";
import { Swap } from "../generated/templates/Pair/Pair";
import {
  BD_1E18,
  BD_ZERO,
  BI_ONE,
  MOBOX_BNB,
  MOBOX_BUSD,
  TRACKED_TOKEN_BNB_PAIRS,
  TRACKED_TOKEN_BUSD_PAIRS,
} from "./utils";

/**
 * SWAP
 */

export function handleSwap(event: Swap): void {
  let competition = Competition.load("3");
  // Competition is not in progress, ignoring trade.
  if (competition.status.notEqual(BI_ONE)) {
    log.info("Competition is not in progress, ignoring trade; status: {}", [competition.status.toString()]);
    return;
  }

  // User is not registered for the competition, skipping.
  let user = User.load(event.transaction.from.toHex());
  if (user === null) {
    log.info("User is not registered, ignoring trade; user: {}", [event.transaction.from.toHex()]);
    return;
  }

  // We load other entities as the trade is doomed valid and competition is in progress.
  let bundle = Bundle.load("1");
  let team = Team.load(user.team);

  let bnbIN: BigDecimal;
  let bnbOUT: BigDecimal;

  let busdIN: BigDecimal;
  let busdOUT: BigDecimal;

  log.info("Pair info: {}, amount0In: {}, amount1In: {}, amount0Out: {}, amount1Out: {}", [
    event.address.toHex(),
    event.params.amount0In.toString(),
    event.params.amount1In.toString(),
    event.params.amount0Out.toString(),
    event.params.amount1Out.toString(),
  ]);

  if (TRACKED_TOKEN_BUSD_PAIRS.includes(event.address.toHex())) {
    busdIN = event.params.amount1In.toBigDecimal().div(BD_1E18);
    busdOUT = event.params.amount1Out.toBigDecimal().div(BD_1E18);
    log.info("Pair found: {}, busdIN: {}, busdOUT: {}", [event.address.toHex(), busdIN.toString(), busdOUT.toString()]);
  } else if (TRACKED_TOKEN_BNB_PAIRS.includes(event.address.toHex())) {
    bnbIN = event.params.amount1In.toBigDecimal().div(BD_1E18);
    bnbOUT = event.params.amount1Out.toBigDecimal().div(BD_1E18);
    log.info("Pair found: {}, bnbIN: {}, bnbOUT: {}", [event.address.toHex(), bnbIN.toString(), bnbOUT.toString()]);
  } else {
    log.info("Pair not tracked: {}", [event.address.toHex()]);
    return;
  }

  let volumeBNB: BigDecimal;
  let volumeUSD: BigDecimal;
  if (bnbIN) {
    volumeBNB = bnbOUT.plus(bnbIN);
    volumeUSD = volumeBNB.times(bundle.bnbPrice);
  } else {
    volumeUSD = busdIN.plus(busdOUT);
    volumeBNB = volumeUSD.div(bundle.bnbPrice);
  }

  log.info("Volume: {} for {} BNB, or {} USD", [
    event.transaction.from.toHex(),
    volumeBNB.toString(),
    volumeUSD.toString(),
  ]);

  // Fail safe condition in case the pairStats has already been created.
  let pairStats = PairStats.load(event.address.toHex());
  if (pairStats === null) {
    pairStats = new PairStats(event.address.toHex());
    pairStats.volumeUSD = BD_ZERO;
    pairStats.volumeBNB = BD_ZERO;
    pairStats.save();
  }
  pairStats.volumeUSD = pairStats.volumeUSD.plus(volumeUSD);
  pairStats.volumeBNB = pairStats.volumeBNB.plus(volumeBNB);
  pairStats.save();

  user.volumeUSD = user.volumeUSD.plus(volumeUSD);
  user.volumeBNB = user.volumeBNB.plus(volumeBNB);
  if (event.address.toHex() == MOBOX_BNB || event.address.toHex() == MOBOX_BUSD) {
    user.moboxVolumeUSD = user.moboxVolumeUSD.plus(volumeUSD);
    user.moboxVolumeBNB = user.moboxVolumeBNB.plus(volumeBNB);
  }
  user.txCount = user.txCount.plus(BI_ONE);
  user.save();

  // Team statistics.
  team.volumeUSD = team.volumeUSD.plus(volumeUSD);
  team.volumeBNB = team.volumeBNB.plus(volumeBNB);
  team.txCount = team.txCount.plus(BI_ONE);
  team.save();

  // Competition statistics.
  competition.volumeUSD = competition.volumeUSD.plus(volumeUSD);
  competition.volumeBNB = competition.volumeBNB.plus(volumeBNB);
  competition.txCount = competition.txCount.plus(BI_ONE);
  competition.save();
}
