import { BigInt } from "@graphprotocol/graph-ts";

export let WEEK = BigInt.fromString("604800");
export let TWO_WEEKS = WEEK.times(BigInt.fromString("2"));

export function nextPeriod(timestamp: BigInt, period: BigInt): BigInt {
  let nextPeriod = timestamp.plus(period);
  return nextPeriod.div(period).times(period);
}
