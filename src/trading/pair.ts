/* eslint-disable prefer-const */
import { BigInt, log } from "@graphprotocol/graph-ts";
import { Bundle, Competition, Team, User } from "../../generated/schema";
import { Swap } from "../../generated/templates/Pair/Pair";
import { convertTokenToDecimal, ONE_BI } from "./utils";

export function handleSwap(event: Swap): void {
  let bundle = Bundle.load("1");
  let competition = Competition.load("1");
  let user = User.load(event.transaction.from.toHex());
  let team = Team.load(user.team);

  let bnbIN = convertTokenToDecimal(event.params.amount0In, BigInt.fromI32(18));
  let bnbOUT = convertTokenToDecimal(event.params.amount0Out, BigInt.fromI32(18));
  let volumeBNB = bnbOUT.plus(bnbIN);
  let volumeUSD = volumeBNB.times(bundle.bnbPrice);

  log.info("Volume: {} for {} BNB, or {} USD", [
    event.transaction.from.toHex(),
    volumeBNB.toString(),
    volumeUSD.toString(),
  ]);

  user.volumeUSD = user.volumeUSD.plus(volumeUSD);
  user.volumeBNB = user.volumeBNB.plus(volumeBNB);
  user.txCount = user.txCount.plus(ONE_BI);
  user.save();

  // Team statistics.
  team.volumeUSD = team.volumeUSD.plus(volumeUSD);
  team.volumeBNB = team.volumeBNB.plus(volumeBNB);
  team.txCount = team.txCount.plus(ONE_BI);
  team.save();

  // Competition statistics.
  competition.volumeUSD = competition.volumeUSD.plus(volumeUSD);
  competition.volumeBNB = competition.volumeBNB.plus(volumeBNB);
  competition.txCount = competition.txCount.plus(ONE_BI);
  competition.save();
}
