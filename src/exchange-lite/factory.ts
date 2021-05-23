/* eslint-disable prefer-const */
import { BigInt } from "@graphprotocol/graph-ts";
import { Pair, Token, Factory } from "../../generated/schema";
import { Pair as PairTemplate } from "../../generated/templates";
import { PairCreated } from "../../generated/Factory/Factory";
import { ZERO_BD } from "./utils";
import { fetchTokenDecimals, fetchTokenName, fetchTokenSymbol } from "./utils/bep20";
import { WHITELIST } from "./utils/pricing";

// Constants
let FACTORY_ADDRESS = "0xca143ce32fe78f1f7019d7d551a6402fc5350c73";

// BigNumber-like references
let ZERO_BI = BigInt.fromI32(0);
let ONE_BI = BigInt.fromI32(1);

export function handlePairCreated(event: PairCreated): void {
  let factory = Factory.load(FACTORY_ADDRESS);
  if (factory === null) {
    // Factory
    factory = new Factory(FACTORY_ADDRESS);
    factory.totalPairs = ZERO_BI;
    factory.totalTokens = ZERO_BI;
  }
  factory.totalPairs = factory.totalPairs.plus(ONE_BI);

  let token0 = Token.load(event.params.token0.toHex());
  if (token0 === null) {
    // Token0
    token0 = new Token(event.params.token0.toHex());
    token0.name = fetchTokenName(event.params.token0);
    token0.symbol = fetchTokenSymbol(event.params.token0);
    let decimals = fetchTokenDecimals(event.params.token0);
    if (decimals === null) {
      return;
    }
    token0.decimals = decimals;
    token0.derivedBNB = ZERO_BD;
    token0.whitelist = [];

    // Factory
    factory.totalTokens = factory.totalTokens.plus(ONE_BI);
  }

  let token1 = Token.load(event.params.token1.toHex());
  if (token1 === null) {
    // Token1
    token1 = new Token(event.params.token1.toHex());
    token1.name = fetchTokenName(event.params.token1);
    token1.symbol = fetchTokenSymbol(event.params.token1);
    let decimals = fetchTokenDecimals(event.params.token1);
    if (decimals === null) {
      return;
    }
    token1.decimals = decimals;
    token1.derivedBNB = ZERO_BD;
    token1.whitelist = [];

    // Factory
    factory.totalTokens = factory.totalTokens.plus(ONE_BI);
  }

  // Add (whitelisted) pairs from token0 to token1 entity.
  if (WHITELIST.includes(token0.id)) {
    let whitelistedPairs = token1.whitelist;
    whitelistedPairs.push(event.params.pair.toHex());
    token1.whitelist = whitelistedPairs;
  }

  // Add (whitelisted) pairs from token1 to token0 entity.
  if (WHITELIST.includes(token1.id)) {
    let whitelistedPairs = token0.whitelist;
    whitelistedPairs.push(event.params.pair.toHex());
    token0.whitelist = whitelistedPairs;
  }

  // Pair
  let pair = new Pair(event.params.pair.toHex());
  pair.token0 = token0.id;
  pair.token1 = token1.id;
  pair.name = token0.symbol.concat("-").concat(token1.symbol);
  pair.reserve0 = ZERO_BD;
  pair.reserve1 = ZERO_BD;
  pair.reserveBNB = ZERO_BD;
  pair.token0Price = ZERO_BD;
  pair.token1Price = ZERO_BD;
  pair.volumeToken0 = ZERO_BD;
  pair.volumeToken1 = ZERO_BD;
  pair.volumeBNB = ZERO_BD;
  pair.block = event.block.number;
  pair.timestamp = event.block.timestamp;

  // Entities
  token0.save();
  token1.save();
  pair.save();
  factory.save();

  // Template
  PairTemplate.create(event.params.pair);
}
