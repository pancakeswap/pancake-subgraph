/* eslint-disable prefer-const */
import { log } from "@graphprotocol/graph-ts";
import { PancakeFactory, Pair, Token, Bundle } from "../../generated/schema";
import { Pair as PairTemplate } from "../../generated/templates";
import { PairCreated } from "../../generated/Factory/Factory";
import {
  FACTORY_ADDRESS,
  ZERO_BD,
  ZERO_BI,
  fetchTokenSymbol,
  fetchTokenName,
  fetchTokenDecimals,
  fetchTokenTotalSupply,
} from "./utils";

export function handlePairCreated(event: PairCreated): void {
  let factory = PancakeFactory.load(FACTORY_ADDRESS);
  if (factory === null) {
    factory = new PancakeFactory(FACTORY_ADDRESS);
    factory.pairCount = 0;
    factory.totalVolumeBNB = ZERO_BD;
    factory.totalLiquidityBNB = ZERO_BD;
    factory.totalVolumeUSD = ZERO_BD;
    factory.untrackedVolumeUSD = ZERO_BD;
    factory.totalLiquidityUSD = ZERO_BD;
    factory.txCount = ZERO_BI;

    // create new bundle
    let bundle = new Bundle("1");
    bundle.bnbPrice = ZERO_BD;
    bundle.save();
  }
  factory.pairCount = factory.pairCount + 1;
  factory.save();

  // create the tokens
  let token0 = Token.load(event.params.token0.toHexString());
  let token1 = Token.load(event.params.token1.toHexString());

  // fetch info if null
  if (token0 === null) {
    token0 = new Token(event.params.token0.toHexString());
    token0.symbol = fetchTokenSymbol(event.params.token0);
    token0.name = fetchTokenName(event.params.token0);
    token0.totalSupply = fetchTokenTotalSupply(event.params.token0);
    let decimals = fetchTokenDecimals(event.params.token0);
    // bail if we couldn't figure out the decimals
    if (decimals === null) {
      log.debug("mybug the decimal on token 0 was null", []);
      return;
    }

    token0.decimals = decimals;
    token0.derivedBNB = ZERO_BD;
    token0.tradeVolume = ZERO_BD;
    token0.tradeVolumeUSD = ZERO_BD;
    token0.untrackedVolumeUSD = ZERO_BD;
    token0.totalLiquidity = ZERO_BD;
    // token0.allPairs = []
    token0.txCount = ZERO_BI;
  }

  // fetch info if null
  if (token1 === null) {
    token1 = new Token(event.params.token1.toHexString());
    token1.symbol = fetchTokenSymbol(event.params.token1);
    token1.name = fetchTokenName(event.params.token1);
    token1.totalSupply = fetchTokenTotalSupply(event.params.token1);
    let decimals = fetchTokenDecimals(event.params.token1);

    // bail if we couldn't figure out the decimals
    if (decimals === null) {
      return;
    }
    token1.decimals = decimals;
    token1.derivedBNB = ZERO_BD;
    token1.tradeVolume = ZERO_BD;
    token1.tradeVolumeUSD = ZERO_BD;
    token1.untrackedVolumeUSD = ZERO_BD;
    token1.totalLiquidity = ZERO_BD;
    // token1.allPairs = []
    token1.txCount = ZERO_BI;
  }

  let pair = new Pair(event.params.pair.toHexString()) as Pair;
  pair.token0 = token0.id;
  pair.token1 = token1.id;
  pair.createdAtTimestamp = event.block.timestamp;
  pair.createdAtBlockNumber = event.block.number;
  pair.txCount = ZERO_BI;
  pair.reserve0 = ZERO_BD;
  pair.reserve1 = ZERO_BD;
  pair.trackedReserveBNB = ZERO_BD;
  pair.reserveBNB = ZERO_BD;
  pair.reserveUSD = ZERO_BD;
  pair.totalSupply = ZERO_BD;
  pair.volumeToken0 = ZERO_BD;
  pair.volumeToken1 = ZERO_BD;
  pair.volumeUSD = ZERO_BD;
  pair.untrackedVolumeUSD = ZERO_BD;
  pair.token0Price = ZERO_BD;
  pair.token1Price = ZERO_BD;

  // create the tracked contract based on the template
  PairTemplate.create(event.params.pair);

  // save updated values
  token0.save();
  token1.save();
  pair.save();
  factory.save();
}
