/* eslint-disable prefer-const */
import { Pair, Token } from "../../generated/schema";
import { Swap, Sync } from "../../generated/templates/Pair/Pair";
import { convertTokenToDecimal, ZERO_BD } from "./utils";
import { findBnbPerToken, getTrackedVolume } from "./utils/pricing";

export function handleSync(event: Sync): void {
  let pair = Pair.load(event.address.toHex());
  let token0 = Token.load(pair.token0);
  let token1 = Token.load(pair.token1);

  pair.reserve0 = convertTokenToDecimal(event.params.reserve0, token0.decimals);
  pair.reserve1 = convertTokenToDecimal(event.params.reserve1, token1.decimals);

  pair.token0Price = pair.reserve1.notEqual(ZERO_BD) ? pair.reserve0.div(pair.reserve1) : ZERO_BD;
  pair.token1Price = pair.reserve0.notEqual(ZERO_BD) ? pair.reserve1.div(pair.reserve0) : ZERO_BD;

  token0.derivedBNB = findBnbPerToken(token0 as Token);
  token0.save();

  token1.derivedBNB = findBnbPerToken(token1 as Token);
  token1.save();

  pair.reserveBNB = pair.reserve0.times(token0.derivedBNB).plus(pair.reserve1.times(token1.derivedBNB));
  pair.save();
}

export function handleSwap(event: Swap): void {
  let pair = Pair.load(event.address.toHex());
  let token0 = Token.load(pair.token0);
  let token1 = Token.load(pair.token1);

  let amount0In = convertTokenToDecimal(event.params.amount0In, token0.decimals);
  let amount1In = convertTokenToDecimal(event.params.amount1In, token1.decimals);
  let amount0Out = convertTokenToDecimal(event.params.amount0Out, token0.decimals);
  let amount1Out = convertTokenToDecimal(event.params.amount1Out, token1.decimals);

  let amount0Total = amount0Out.plus(amount0In);
  let amount1Total = amount1Out.plus(amount1In);

  let trackedVolumeBNB = getTrackedVolume(amount0Total, token0 as Token, amount1Total, token1 as Token);

  pair.volumeToken0 = pair.volumeToken0.plus(amount0Total);
  pair.volumeToken1 = pair.volumeToken1.plus(amount1Total);
  pair.volumeBNB = pair.volumeBNB.plus(trackedVolumeBNB);
  pair.save();
}
