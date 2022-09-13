/* eslint-disable prefer-const */
import { log } from "@graphprotocol/graph-ts";
import { NewStableSwapPair } from "../generated/StableSwapFactory/StableSwapFactory";
import { Pair } from "../generated/schema";
import { StableSwapPair } from "../generated/templates";

export function handlePairCreated(event: NewStableSwapPair): void {
  log.info("handlePairCreated. address: {}", [event.address.toHex()]);
  let pair = Pair.load(event.params.swapContract.toHex());
  if (pair === null) {
    pair = new Pair(event.params.swapContract.toHex());
    pair.tokenA = event.params.tokenA.toHex();
    pair.tokenB = event.params.tokenB.toHex();
    pair.save();
  }

  StableSwapPair.create(event.params.swapContract);
}
