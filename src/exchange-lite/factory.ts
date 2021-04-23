/* eslint-disable prefer-const */
import { BigInt } from "@graphprotocol/graph-ts";
import { Pair, Token, Bundle, Factory } from "../../generated/schema";
import { Pair as PairTemplate } from "../../generated/templates";
import { PairCreated } from "../../generated/Factory/Factory";
import { ZERO_BD } from "./utils";
import { fetchTokenDecimals, fetchTokenName, fetchTokenSymbol } from "./utils/bep20";
import { WHITELIST } from "./utils/pricing";

let ZERO_BI = BigInt.fromI32(0);
let ONE_BI = BigInt.fromI32(1);
let FACTORY = "0xca143ce32fe78f1f7019d7d551a6402fc5350c73";

export function handlePairCreated(event: PairCreated): void {
  // Add factory.
  let factory = Factory.load(FACTORY);
  if (factory === null) {
    factory = new Factory(FACTORY);
    factory.totalPairs = ZERO_BI;
    factory.totalTokens = ZERO_BI;
    factory.save();

    let bundle = new Bundle("1");
    bundle.bnbPrice = ZERO_BD;
    bundle.save();
  }
  factory.totalPairs = factory.totalPairs.plus(ONE_BI);
  factory.save();

  // Add token0.
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
    token0.derivedUSD = ZERO_BD;
    token0.whitelist = [];
    token0.save();

    // Factory
    factory.totalTokens = factory.totalTokens.plus(ONE_BI);
    factory.save();
  }

  // Add token1.
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
    token1.derivedUSD = ZERO_BD;
    token1.whitelist = [];
    token1.save();

    // Factory
    factory.totalTokens = factory.totalTokens.plus(ONE_BI);
    factory.save();
  }

  // Add (whitelisted) pairs to token0 entity.
  if (WHITELIST.includes(token0.id)) {
    let whitelistedPairs = token1.whitelist;
    whitelistedPairs.push(event.params.pair.toHex());
    token1.whitelist = whitelistedPairs;
    token1.save();
  }

  // Add (whitelisted) pairs to token1 entity.
  if (WHITELIST.includes(token1.id)) {
    let whitelistedPairs = token0.whitelist;
    whitelistedPairs.push(event.params.pair.toHex());
    token0.whitelist = whitelistedPairs;
    token0.save();
  }

  // Add pair.
  let pair = new Pair(event.params.pair.toHex());
  pair.token0 = token0.id;
  pair.token1 = token1.id;
  pair.name = token0.symbol.concat("-").concat(token1.symbol);
  pair.reserve0 = ZERO_BD;
  pair.reserve1 = ZERO_BD;
  pair.reserveBNB = ZERO_BD;
  pair.reserveUSD = ZERO_BD;
  pair.token0Price = ZERO_BD;
  pair.token1Price = ZERO_BD;
  pair.volumeToken0 = ZERO_BD;
  pair.volumeToken1 = ZERO_BD;
  pair.volumeBNB = ZERO_BD;
  pair.volumeUSD = ZERO_BD;
  pair.block = event.block.number;
  pair.timestamp = event.block.timestamp;
  pair.save();

  PairTemplate.create(event.params.pair);
}
