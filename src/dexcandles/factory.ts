/* eslint-disable prefer-const */
import { Pair } from "../../generated/schema";
import { Pair as PairTemplate } from "../../generated/templates";
import { PairCreated } from "../../generated/Factory/Factory";

export function handlePairCreated(event: PairCreated): void {
  let pair = new Pair(event.params.pair.toHex());
  pair.token0 = event.params.token0;
  pair.token1 = event.params.token1;
  pair.save();

  PairTemplate.create(event.params.pair);
}
