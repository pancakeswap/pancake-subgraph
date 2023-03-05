/* eslint-disable prefer-const */
import { Address, BigDecimal } from "@graphprotocol/graph-ts/index";
import { Bundle, Pair, Token } from "../../generated/schema";
import {
  ADDRESS_ZERO,
  BIG_DECIMAL_ONE,
  BIG_DECIMAL_ZERO,
  BIG_INT_18,
  BUSD_ADDR,
  convertTokenToDecimal,
  stableSwapFactoryContract,
  exponentToBigDecimal,
  WBNB_ADDR,
} from "./index";
import { Pair as PairContract } from "../../generated/StableSwapFactory/Pair";
import { StableSwapPair as StableSwapPairContract } from "../../generated/StableSwapFactory/StableSwapPair";
import { BigInt } from "@graphprotocol/graph-ts";
import { getOrCreateToken } from "./data";

let BUSD_WBNB_PAIR = "0x58f876857a02d6762e0101bb5c46a8c1ed44dc16";
let USDT_WBNB_PAIR = "0x16b9a82891338f9ba80e2d6970fdda79d1eb0dae";
// let USDT_ADDRESS = "0x55d398326f99059ff775485246999027b3197955";

function getByDy(pair_: Pair | null, token: Address): BigDecimal {
  if (!pair_) return BIG_DECIMAL_ZERO;
  let targetTokenAddress = token.toHexString();
  let targetToken = getOrCreateToken(token);
  let targetTokenIndex = pair_.token0 == targetTokenAddress ? 0 : pair_.token1 == targetTokenAddress ? 1 : 2;
  let baseTokenIndex = targetTokenIndex == 0 ? 1 : 0;
  let baseToken =
    baseTokenIndex == 0
      ? getOrCreateToken(Address.fromString(pair_.token0))
      : getOrCreateToken(Address.fromString(pair_.token1));
  let pair = StableSwapPairContract.bind(Address.fromString(pair_.id));
  let dy = pair.try_get_dy(
    BigInt.fromI32(baseTokenIndex),
    BigInt.fromI32(targetTokenIndex),
    BigInt.fromI32(1).times(BigInt.fromString(exponentToBigDecimal(baseToken.decimals).toString()))
  );

  if (!dy.reverted) {
    return dy.value.divDecimal(exponentToBigDecimal(targetToken.decimals));
  }
  return BIG_DECIMAL_ZERO;
}

export function getPriceFromPCS(token: Address, pair_: Pair | null): BigDecimal {
  return getByDy(pair_, token);
}

export function getBusdPerBnb(): BigDecimal {
  let busdPair = PairContract.bind(Address.fromString(BUSD_WBNB_PAIR));
  let busdPairReserve0: BigDecimal, busdPairReserve1: BigDecimal, price: BigDecimal;
  if (busdPair !== null) {
    let busdReserves = busdPair.getReserves();
    busdPairReserve0 = convertTokenToDecimal(busdReserves.value0, BIG_INT_18);
    busdPairReserve1 = convertTokenToDecimal(busdReserves.value1, BIG_INT_18);
    price = busdPairReserve0.div(busdPairReserve1);
  }
  if (price !== null) {
    return price;
  } else {
    return BIG_DECIMAL_ZERO;
  }
}

export function getBnbPriceInUSD(): BigDecimal {
  // fetch eth prices for each stablecoin
  let usdtPair = PairContract.bind(Address.fromString(USDT_WBNB_PAIR)); // usdt is token0
  let busdPair = PairContract.bind(Address.fromString(BUSD_WBNB_PAIR)); // busd is token1

  let busdPairReserve0: BigDecimal, busdPairReserve1: BigDecimal, busdToken1Price: BigDecimal;
  if (busdPair !== null) {
    let busdReserves = busdPair.getReserves();
    busdPairReserve0 = convertTokenToDecimal(busdReserves.value0, BIG_INT_18);
    busdPairReserve1 = convertTokenToDecimal(busdReserves.value1, BIG_INT_18);
    busdToken1Price = busdPairReserve1.div(busdPairReserve0);
  }

  let usdtPairReserve0: BigDecimal, usdtPairReserve1: BigDecimal, usdtToken0Price: BigDecimal;
  if (usdtPair !== null) {
    let usdtReserves = usdtPair.getReserves();
    usdtPairReserve0 = convertTokenToDecimal(usdtReserves.value0, BIG_INT_18);
    usdtPairReserve1 = convertTokenToDecimal(usdtReserves.value1, BIG_INT_18);
    usdtToken0Price = usdtPairReserve0.div(usdtPairReserve1);
  }

  if (busdPair !== null && usdtPair !== null) {
    let totalLiquidityBNB = busdPairReserve0.plus(usdtPairReserve1);
    if (totalLiquidityBNB.notEqual(BIG_DECIMAL_ZERO)) {
      let busdWeight = busdPairReserve0.div(totalLiquidityBNB);
      let usdtWeight = usdtPairReserve1.div(totalLiquidityBNB);
      return busdToken1Price.times(busdWeight).plus(usdtToken0Price.times(usdtWeight));
    } else {
      return BIG_DECIMAL_ZERO;
    }
  } else if (busdPair !== null) {
    return busdToken1Price;
  } else if (usdtPair !== null) {
    return usdtToken0Price;
  } else {
    return BIG_DECIMAL_ZERO;
  }
}

// token where amounts should contribute to tracked volume and liquidity
let WHITELIST: string[] = [
  "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c", // WBNB
  "0xe9e7cea3dedca5984780bafc599bd69add087d56", // BUSD
  "0x55d398326f99059ff775485246999027b3197955", // USDT
  "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", // USDC
  "0x0782b6d8c4551b9760e74c0545a9bcd90bdc41e5", // HAY
];

// minimum liquidity for price to get tracked
// let MINIMUM_LIQUIDITY_THRESHOLD_BNB = BigDecimal.fromString("10");

/**
 * Search through graph to find derived BNB per token.
 **/
export function findBnbPerToken(token: Token): BigDecimal {
  if (Address.fromString(token.id).equals(BUSD_ADDR)) {
    return getBusdPerBnb();
  }
  if (Address.fromString(token.id).equals(WBNB_ADDR)) {
    return BIG_DECIMAL_ONE;
  }
  // loop through whitelist and check if paired with any
  for (let i = 0; i < WHITELIST.length; ++i) {
    if (Address.fromString(token.id).equals(Address.fromString(WHITELIST[i]))) {
      continue;
    }
    let pairAddress = stableSwapFactoryContract.getPairInfo(
      Address.fromString(token.id),
      Address.fromString(WHITELIST[i])
    ).swapContract;
    if (pairAddress.toHex() != ADDRESS_ZERO) {
      let pair = Pair.load(pairAddress.toHex());
      if (pair.token0 == token.id) {
        let token1 = Token.load(pair.token1);
        return pair.token1Price.times(token1.derivedBNB as BigDecimal); // return token1 per our token * BNB per token 1
      }
      if (pair.token1 == token.id) {
        let token0 = Token.load(pair.token0);
        return pair.token0Price.times(token0.derivedBNB as BigDecimal); // return token0 per our token * BNB per token 0
      }
    }
  }
  return BIG_DECIMAL_ZERO; // nothing was found return 0
}

/**
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD.
 * If both are, return average of two amounts
 * If neither is, return 0
 */
export function getTrackedVolumeUSD(
  bundle: Bundle,
  tokenAmount0: BigDecimal,
  token0: Token,
  tokenAmount1: BigDecimal,
  token1: Token
): BigDecimal {
  let price0 = token0.derivedBNB.times(bundle.bnbPrice);
  let price1 = token1.derivedBNB.times(bundle.bnbPrice);

  // both are whitelist tokens, take average of both amounts
  if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0).plus(tokenAmount1.times(price1)).div(BigDecimal.fromString("2"));
  }

  // take full value of the whitelisted token amount
  if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0);
  }

  // take full value of the whitelisted token amount
  if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount1.times(price1);
  }

  // neither token is on white list, tracked volume is 0
  return BIG_DECIMAL_ZERO;
}

/**
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD * 2.
 * If both are, return sum of two amounts
 * If neither is, return 0
 */
export function getTrackedLiquidityUSD(
  bundle: Bundle,
  tokenAmount0: BigDecimal,
  token0: Token,
  tokenAmount1: BigDecimal,
  token1: Token
): BigDecimal {
  let price0 = token0.derivedBNB.times(bundle.bnbPrice);
  let price1 = token1.derivedBNB.times(bundle.bnbPrice);

  // both are whitelist tokens, take average of both amounts
  if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0).plus(tokenAmount1.times(price1));
  }

  // take double value of the whitelisted token amount
  if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0).times(BigDecimal.fromString("2"));
  }

  // take double value of the whitelisted token amount
  if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount1.times(price1).times(BigDecimal.fromString("2"));
  }

  // neither token is on white list, tracked volume is 0
  return BIG_DECIMAL_ZERO;
}
