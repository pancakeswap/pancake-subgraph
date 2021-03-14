/* eslint-disable prefer-const */
import { Pair, Token, Bundle } from "../../generated/schema";
import { Pair as PairTemplate } from "../../generated/templates";
import { PairCreated } from "../../generated/Factory/Factory";
import { ZERO_BD, fetchTokenName, fetchTokenSymbol, fetchTokenDecimals } from "./helpers";

export function handlePairCreated(event: PairCreated): void {
  let bundle = Bundle.load("1");
  if (bundle === null) {
    let bundle = new Bundle("1");
    bundle.bnbPrice = ZERO_BD;
    bundle.save();
  }

  let token0 = Token.load(event.params.token0.toHex());
  if (token0 === null) {
    token0 = new Token(event.params.token0.toHex());
    token0.name = fetchTokenName(event.params.token0);
    token0.symbol = fetchTokenSymbol(event.params.token0);
    let decimals = fetchTokenDecimals(event.params.token0);
    if (decimals === null) {
      return;
    }
    token0.decimals = decimals;
    token0.derivedBNB = ZERO_BD;
    token0.save();
  }

  let token1 = Token.load(event.params.token1.toHex());
  if (token1 === null) {
    token1 = new Token(event.params.token1.toHex());
    token1.name = fetchTokenName(event.params.token1);
    token1.symbol = fetchTokenSymbol(event.params.token1);
    let decimals = fetchTokenDecimals(event.params.token1);
    if (decimals === null) {
      return;
    }
    token1.decimals = decimals;
    token1.derivedBNB = ZERO_BD;
    token1.save();
  }

  let pair = new Pair(event.params.pair.toHex());
  pair.token0 = token0.id;
  pair.token1 = token1.id;
  pair.reserve0 = ZERO_BD;
  pair.reserve1 = ZERO_BD;
  pair.reserveBNB = ZERO_BD;
  pair.reserveUSD = ZERO_BD;
  pair.trackedReserveBNB = ZERO_BD;
  pair.token0Price = ZERO_BD;
  pair.token1Price = ZERO_BD;
  pair.volumeToken0 = ZERO_BD;
  pair.volumeToken1 = ZERO_BD;
  pair.volumeUSD = ZERO_BD;
  pair.untrackedVolumeUSD = ZERO_BD;
  pair.save();

  PairTemplate.create(event.params.pair);
}
