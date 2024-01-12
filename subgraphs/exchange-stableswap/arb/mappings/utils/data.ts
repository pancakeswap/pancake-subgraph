/* eslint-disable prefer-const */
import { Address } from "@graphprotocol/graph-ts";
import {
  BIG_DECIMAL_ZERO,
  BIG_INT_ZERO,
  fetchTokenDecimals,
  fetchTokenName,
  fetchTokenSymbol,
  STABLESWAP_FACTORY_ADDRESS,
} from "./index";
import { Bundle, Factory, Token } from "../../generated/schema";

export function getOrCreateFactory(factoryAddress: string | null): Factory {
  let id = Address.fromString(factoryAddress || STABLESWAP_FACTORY_ADDRESS).toHex();
  let factory = Factory.load(id);
  if (factory === null) {
    factory = new Factory(id);
    factory.totalPairs = BIG_INT_ZERO;
    factory.totalLiquidityETH = BIG_DECIMAL_ZERO;
    factory.totalLiquidityUSD = BIG_DECIMAL_ZERO;
    factory.totalVolumeETH = BIG_DECIMAL_ZERO;
    factory.totalVolumeUSD = BIG_DECIMAL_ZERO;
    factory.totalTransactions = BIG_INT_ZERO;
    factory.untrackedVolumeUSD = BIG_DECIMAL_ZERO;
    factory.pairs = [];
    factory.save();

    let bundle = new Bundle("1");
    bundle.ethPrice = BIG_DECIMAL_ZERO;
    bundle.save();
  }

  return factory as Factory;
}

export function getOrCreateToken(tokenAddress: Address): Token {
  let token = Token.load(tokenAddress.toHex());
  if (token === null) {
    token = new Token(tokenAddress.toHex());
    token.symbol = fetchTokenSymbol(tokenAddress);
    token.decimals = fetchTokenDecimals(tokenAddress);
    token.name = fetchTokenName(tokenAddress);
    token.tradeVolume = BIG_DECIMAL_ZERO;
    token.tradeVolumeUSD = BIG_DECIMAL_ZERO;
    token.derivedETH = BIG_DECIMAL_ZERO;
    token.derivedUSD = BIG_DECIMAL_ZERO;
    token.untrackedVolumeUSD = BIG_DECIMAL_ZERO;
    token.totalLiquidity = BIG_DECIMAL_ZERO;
    token.totalTransactions = BIG_INT_ZERO;

    token.save();
  }

  return token as Token;
}
