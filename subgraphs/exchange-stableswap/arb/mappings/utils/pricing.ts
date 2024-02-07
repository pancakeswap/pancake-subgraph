/* eslint-disable prefer-const */
import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { Bundle, Pair, Token } from "../../generated/schema";
import {
  ADDRESS_ZERO,
  BIG_DECIMAL_ONE,
  BIG_DECIMAL_TEN,
  BIG_DECIMAL_ZERO,
  exponentToBigDecimal,
  powBigDecimal,
  stableSwapFactoryContract,
  USDT_ADDR,
  WETH_ADDR,
  PENDLE_ADDR,
  USDC_ADDR,
  priceLensContract,
  convertTokenToDecimal,
  BIG_INT_6,
} from "./index";
import { PairV3 as PairV3Contract } from "../../generated/StableSwapFactory/PairV3";
import { StableSwapPair as StableSwapPairContract } from "../../generated/StableSwapFactory/StableSwapPair";
import { getOrCreateToken } from "./data";

let USDT_WETH_V3_PAIR = "0x0bacc7a9717e70ea0da5ac075889bd87d4c81197"; //token0 WETH
let USDC_WETH_V3_PAIR = "0xd9e2a1a61b6e61b275cec326465d417e52c1b95c"; //token0 WETH

let PENDLE_WETH_V3_PAIR = "0x1cb2892038867adfa78ccfc6c3fb89b1da558243"; //token1 WETH

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

export function getEthPriceInUSD(): BigDecimal {
  return getPairTokenPrice(USDT_WETH_V3_PAIR, true);
}

// token where amounts should contribute to tracked volume and liquidity
let WHITELIST: string[] = [
  // WETH_ADDRESS,
  // USDT_ADDRESS,
  // USDC_ADDRESS,
  // PENDLE_ADDRESS,
  // "0xB688BA096b7Bb75d7841e47163Cd12D18B36A5bF", // mPENDLE
];

// minimum liquidity for price to get tracked
// let MINIMUM_LIQUIDITY_THRESHOLD_BNB = BigDecimal.fromString("10");

function getPairTokenPrice(v3PairAddress: string, token0Price: boolean): BigDecimal {
  let v3PairContract = PairV3Contract.bind(Address.fromString(v3PairAddress));
  let token0 = getOrCreateToken(v3PairContract.token0());
  let token1 = getOrCreateToken(v3PairContract.token1());
  let slot = v3PairContract.slot0();
  let sqrtPriceX96 = slot.value0.toBigDecimal();
  let sqrtPow = Math.pow(2, 96);
  let decimalDenominator = powBigDecimal(BIG_DECIMAL_TEN, token1.decimals.toI32()).div(
    powBigDecimal(BIG_DECIMAL_TEN, token0.decimals.toI32())
  );

  let buyOneOfToken0 = powBigDecimal(sqrtPriceX96.div(BigDecimal.fromString(sqrtPow.toString())), 2).div(
    decimalDenominator
  );
  // .truncate(token1.decimals.toI32());
  if (token0Price) {
    return buyOneOfToken0;
  }

  let buyOneOfToken1 = BIG_DECIMAL_ONE.div(buyOneOfToken0);
  // .truncate(token0.decimals.toI32());
  return buyOneOfToken1;
}

/**
 * Search through graph to find derived BNB per token.
 **/
export function findBnbPerToken(token: Token): BigDecimal {
  if (Address.fromString(token.id).equals(WETH_ADDR)) {
    return BIG_DECIMAL_ONE;
  }
  if (Address.fromString(token.id).equals(USDT_ADDR)) {
    return getPairTokenPrice(USDT_WETH_V3_PAIR, false);
  }
  if (Address.fromString(token.id).equals(USDC_ADDR)) {
    return getPairTokenPrice(USDC_WETH_V3_PAIR, false);
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
        return pair.token1Price.times(token1.derivedETH as BigDecimal); // return token1 per our token * BNB per token 1
      }
      if (pair.token1 == token.id) {
        let token0 = Token.load(pair.token0);
        return pair.token0Price.times(token0.derivedETH as BigDecimal); // return token0 per our token * BNB per token 0
      }
    }
  }
  let tokenBNBPrice = priceLensContract.try_getNativePrice(Address.fromString(token.id));

  if (!tokenBNBPrice.reverted) {
    return convertTokenToDecimal(tokenBNBPrice.value, BIG_INT_6);
  }

  // backward compatibility before price lens
  if (Address.fromString(token.id).equals(PENDLE_ADDR)) {
    return getPairTokenPrice(PENDLE_WETH_V3_PAIR, true);
  }

  return BIG_DECIMAL_ZERO; // nothing was found return 0
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
  let price0 = token0.derivedETH.times(bundle.ethPrice);
  let price1 = token1.derivedETH.times(bundle.ethPrice);

  // take double value of the whitelisted token amount
  if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0).times(BigDecimal.fromString("2"));
  }

  // take double value of the whitelisted token amount
  if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount1.times(price1).times(BigDecimal.fromString("2"));
  }

  return tokenAmount0.times(price0).plus(tokenAmount1.times(price1));
}
