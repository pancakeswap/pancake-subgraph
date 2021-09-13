/* eslint-disable prefer-const */
import { BigInt } from "@graphprotocol/graph-ts";
import { Factory, Pair, Token } from "../generated/schema";
import { PairCreated } from "../generated/Factory/Factory";
import { fetchDecimals, fetchName, fetchSymbol } from "./utils/erc20";

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

  let token0 = Token.load(event.params.token0.toHex());
  if (token0 === null) {
    // Token0
    token0 = new Token(event.params.token0.toHex());
    token0.name = fetchName(event.params.token0);
    token0.symbol = fetchSymbol(event.params.token0);
    token0.decimals = fetchDecimals(event.params.token0);

    // Factory
    factory.totalTokens = factory.totalTokens.plus(ONE_BI);
  }

  let token1 = Token.load(event.params.token1.toHex());
  if (token1 === null) {
    // Token1
    token1 = new Token(event.params.token1.toHex());
    token1.name = fetchName(event.params.token1);
    token1.symbol = fetchSymbol(event.params.token1);
    token1.decimals = fetchDecimals(event.params.token1);

    // Factory
    factory.totalTokens = factory.totalTokens.plus(ONE_BI);
  }

  // Pair
  let pair = new Pair(event.params.pair.toHex());
  pair.token0 = token0.id;
  pair.token1 = token1.id;
  pair.name = token0.symbol.concat("-").concat(token1.symbol);
  pair.hash = event.transaction.hash;
  pair.block = event.block.number;
  pair.timestamp = event.block.timestamp;

  // Factory
  factory.totalPairs = factory.totalPairs.plus(ONE_BI);

  // Entities
  token0.save();
  token1.save();
  pair.save();
  factory.save();
}
