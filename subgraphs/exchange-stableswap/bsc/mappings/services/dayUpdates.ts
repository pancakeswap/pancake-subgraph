/* eslint-disable prefer-const */
import { Bundle, Pair, PairDayData, PairHourData, PancakeDayData, Token, TokenDayData } from "../../generated/schema";
import { BigDecimal, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { BIG_DECIMAL_ZERO, BIG_INT_ONE, BIG_INT_ZERO, FACTORIES } from "../utils";
import { getOrCreateFactory } from "../utils/data";

export function updatePancakeDayData(event: ethereum.Event): PancakeDayData {
  let timestamp = event.block.timestamp.toI32();
  let dayID = timestamp / 86400;
  let dayStartTimestamp = dayID * 86400;

  let pancakeDayData = PancakeDayData.load(dayID.toString());
  if (pancakeDayData === null) {
    pancakeDayData = new PancakeDayData(dayID.toString());
    pancakeDayData.date = dayStartTimestamp;
    pancakeDayData.dailyVolumeUSD = BIG_DECIMAL_ZERO;
    pancakeDayData.dailyVolumeBNB = BIG_DECIMAL_ZERO;
    pancakeDayData.totalVolumeUSD = BIG_DECIMAL_ZERO;
    pancakeDayData.totalVolumeBNB = BIG_DECIMAL_ZERO;
    pancakeDayData.dailyVolumeUntracked = BIG_DECIMAL_ZERO;
  }

  let totalLiquidityBNB = BIG_DECIMAL_ZERO;
  let totalLiquidityUSD = BIG_DECIMAL_ZERO;
  let totalTransactions = BIG_INT_ZERO;
  for (let i = 0; i < FACTORIES.length; i++) {
    let factory = getOrCreateFactory(FACTORIES[i]);
    totalLiquidityBNB = totalLiquidityBNB.plus(factory.totalLiquidityBNB);
    totalLiquidityUSD = totalLiquidityUSD.plus(factory.totalLiquidityUSD);
    totalTransactions = totalTransactions.plus(factory.totalTransactions);
  }

  pancakeDayData.totalLiquidityUSD = totalLiquidityUSD;
  pancakeDayData.totalLiquidityBNB = totalLiquidityBNB;
  pancakeDayData.totalTransactions = totalTransactions;
  pancakeDayData.save();

  return pancakeDayData as PancakeDayData;
}

export function updatePairDayData(event: ethereum.Event): PairDayData {
  let timestamp = event.block.timestamp.toI32();
  let dayID = timestamp / 86400;
  let dayStartTimestamp = dayID * 86400;
  let dayPairID = event.address.toHex().concat("-").concat(BigInt.fromI32(dayID).toString());
  let pair = Pair.load(event.address.toHex());
  let pairDayData = PairDayData.load(dayPairID);
  if (pairDayData === null) {
    pairDayData = new PairDayData(dayPairID);
    pairDayData.date = dayStartTimestamp;
    pairDayData.token0 = pair.token0;
    pairDayData.token1 = pair.token1;
    pairDayData.pairAddress = event.address;
    pairDayData.dailyVolumeToken0 = BIG_DECIMAL_ZERO;
    pairDayData.dailyVolumeToken1 = BIG_DECIMAL_ZERO;
    pairDayData.dailyVolumeUSD = BIG_DECIMAL_ZERO;
    pairDayData.dailyTxns = BIG_INT_ZERO;
  }
  pairDayData.totalSupply = pair.totalSupply;
  pairDayData.virtualPrice = pair.virtualPrice;
  pairDayData.reserve0 = pair.reserve0;
  pairDayData.reserve1 = pair.reserve1;
  pairDayData.reserveUSD = pair.reserveUSD;
  pairDayData.dailyTxns = pairDayData.dailyTxns.plus(BIG_INT_ONE);
  pairDayData.token0Price = pair.token0Price;
  pairDayData.token1Price = pair.token1Price;
  pairDayData.token2Price = pair.token2Price;
  pairDayData.save();

  return pairDayData as PairDayData;
}

export function updatePairHourData(event: ethereum.Event): PairHourData {
  let timestamp = event.block.timestamp.toI32();
  let hourIndex = timestamp / 3600;
  let hourStartUnix = hourIndex * 3600;
  let hourPairID = event.address.toHex().concat("-").concat(BigInt.fromI32(hourIndex).toString());
  let pair = Pair.load(event.address.toHex());
  let pairHourData = PairHourData.load(hourPairID);
  if (pairHourData === null) {
    pairHourData = new PairHourData(hourPairID);
    pairHourData.hourStartUnix = hourStartUnix;
    pairHourData.pair = event.address.toHex();
    pairHourData.hourlyVolumeToken0 = BIG_DECIMAL_ZERO;
    pairHourData.hourlyVolumeToken1 = BIG_DECIMAL_ZERO;
    pairHourData.hourlyVolumeUSD = BIG_DECIMAL_ZERO;
    pairHourData.hourlyTxns = BIG_INT_ZERO;
  }
  pairHourData.totalSupply = pair.totalSupply;
  pairHourData.reserve0 = pair.reserve0;
  pairHourData.reserve1 = pair.reserve1;
  pairHourData.reserveUSD = pair.reserveUSD;
  pairHourData.token0Price = pair.token0Price;
  pairHourData.token1Price = pair.token1Price;
  pairHourData.token2Price = pair.token2Price;
  pairHourData.hourlyTxns = pairHourData.hourlyTxns.plus(BIG_INT_ONE);
  pairHourData.save();

  return pairHourData as PairHourData;
}

export function updateTokenDayData(token: Token, event: ethereum.Event): TokenDayData {
  let bundle = Bundle.load("1");
  let timestamp = event.block.timestamp.toI32();
  let dayID = timestamp / 86400;
  let dayStartTimestamp = dayID * 86400;
  let tokenDayID = token.id.toString().concat("-").concat(BigInt.fromI32(dayID).toString());

  let tokenDayData = TokenDayData.load(tokenDayID);
  if (tokenDayData === null) {
    tokenDayData = new TokenDayData(tokenDayID);
    tokenDayData.date = dayStartTimestamp;
    tokenDayData.token = token.id;
    tokenDayData.priceUSD = token.derivedBNB.times(bundle.bnbPrice);
    tokenDayData.dailyVolumeToken = BIG_DECIMAL_ZERO;
    tokenDayData.dailyVolumeBNB = BIG_DECIMAL_ZERO;
    tokenDayData.dailyVolumeUSD = BIG_DECIMAL_ZERO;
    tokenDayData.dailyTxns = BIG_INT_ZERO;
    tokenDayData.totalLiquidityUSD = BIG_DECIMAL_ZERO;
  }
  tokenDayData.priceUSD = token.derivedBNB.times(bundle.bnbPrice);
  tokenDayData.totalLiquidityToken = token.totalLiquidity;
  tokenDayData.totalLiquidityBNB = token.totalLiquidity.times(token.derivedBNB as BigDecimal);
  tokenDayData.totalLiquidityUSD = tokenDayData.totalLiquidityBNB.times(bundle.bnbPrice);
  tokenDayData.dailyTxns = tokenDayData.dailyTxns.plus(BIG_INT_ONE);
  tokenDayData.save();

  return tokenDayData as TokenDayData;
}
