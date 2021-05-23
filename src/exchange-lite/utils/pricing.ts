/* eslint-disable prefer-const */
import { BigDecimal } from "@graphprotocol/graph-ts";
import { Pair, Token } from "../../../generated/schema";
import { ZERO_BD, ONE_BD, FIFTY_BD } from "./index";

export let WHITELIST: string[] = [
  "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c", // WBNB
  "0xe9e7cea3dedca5984780bafc599bd69add087d56", // BUSD
  "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c", // BTCB
  "0x2170ed0880ac9a755fd29b2688956bd959f933f8", // ETH
  "0x23396cf899ca06c4472205fc903bdb4de249d6fc", // UST
];

export function findBnbPerToken(token: Token): BigDecimal {
  if (token.id == WHITELIST[0]) {
    return ONE_BD;
  }

  let whitelist = token.whitelist;
  for (let i = 0; i < whitelist.length; ++i) {
    let pair = Pair.load(whitelist[i]);
    if (pair.reserveBNB.ge(FIFTY_BD)) {
      if (pair.token0 == token.id) {
        let token1 = Token.load(pair.token1);
        return pair.token1Price.times(token1.derivedBNB);
      }

      if (pair.token1 == token.id) {
        let token0 = Token.load(pair.token0);
        return pair.token0Price.times(token0.derivedBNB);
      }
    }
  }

  return ZERO_BD;
}

export function getTrackedVolume(
  tokenAmount0: BigDecimal,
  token0: Token,
  tokenAmount1: BigDecimal,
  token1: Token
): BigDecimal {
  if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(token0.derivedBNB).plus(tokenAmount1.times(token1.derivedBNB));
  }

  if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(token0.derivedBNB).times(BigDecimal.fromString("2"));
  }

  if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount1.times(token1.derivedBNB).times(BigDecimal.fromString("2"));
  }

  return ZERO_BD;
}
