/* eslint-disable prefer-const */
import { ONE_BD, ZERO_BD, ZERO_BI } from "./constants";
import { Bundle, Pool, Token } from "../generated/schema";
import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { exponentToBigDecimal, safeDiv } from "./index";

// prettier-ignore
const WETH_ADDRESS = "0x5aea5775959fbc2557cc8789bc1bf90a239d9a91";
// prettier-ignore
const USDC_WETH_03_POOL = "0x291d9f9764c72c9ba6ff47b451a9f7885ebf9977";

const STABLE_IS_TOKEN0 = "false" as string;

// token where amounts should contribute to tracked volume and liquidity
// usually tokens that many tokens are paired with s
// prettier-ignore
export let WHITELIST_TOKENS: string[] = "0x5aea5775959fbc2557cc8789bc1bf90a239d9a91,0x493257fd37edb34451f62edf8d2a0c418852ba4c,0x2039bb4116b4efc145ec4f0e2ea75012d6c0f181,0x3355df6d4c9c3035724fd0e3914de96a5a83aaf4,0xbbeb516fb02a01611cbbe0453fe3c580d7281011,0x32fd44bb869620c0ef993754c8a00be67c464806,0x703b52f2b28febcb60e1372858af5b18849fe867,0x3a287a06c66f9e95a56327185ca2bdf5f031cecd,0x4b9eb6c0b6ea15176bbf62841c6b2a8a398cb656,0x8e86e46278518efc1c5ced245cba2c7e3ef11557".split(",");

// prettier-ignore
let STABLE_COINS: string[] = "0x493257fd37edb34451f62edf8d2a0c418852ba4c,0x3355df6d4c9c3035724fd0e3914de96a5a83aaf4,0x2039bb4116b4efc145ec4f0e2ea75012d6c0f181,0x4b9eb6c0b6ea15176bbf62841c6b2a8a398cb656,0x8e86e46278518efc1c5ced245cba2c7e3ef11557".split(",");

let MINIMUM_ETH_LOCKED = BigDecimal.fromString("5");

let Q192 = 2 ** 192;
export function sqrtPriceX96ToTokenPrices(sqrtPriceX96: BigInt, token0: Token, token1: Token): BigDecimal[] {
  let num = sqrtPriceX96.times(sqrtPriceX96).toBigDecimal();
  let denom = BigDecimal.fromString(Q192.toString());
  let price1 = num.div(denom).times(exponentToBigDecimal(token0.decimals)).div(exponentToBigDecimal(token1.decimals));

  let price0 = safeDiv(BigDecimal.fromString("1"), price1);
  return [price0, price1];
}

export function getEthPriceInUSD(): BigDecimal {
  // fetch eth prices for each stablecoin
  let usdcPool = Pool.load(USDC_WETH_03_POOL); // dai is token0
  if (usdcPool !== null) {
    if (STABLE_IS_TOKEN0 === "true") {
      return usdcPool.token0Price;
    }
    return usdcPool.token1Price;
  } else {
    return ZERO_BD;
  }
}

/**
 * Search through graph to find derived Eth per token.
 * @todo update to be derived ETH (add stablecoin estimates)
 **/
export function findEthPerToken(token: Token): BigDecimal {
  if (token.id == WETH_ADDRESS) {
    return ONE_BD;
  }
  let whiteList = token.whitelistPools;
  // for now just take USD from pool with greatest TVL
  // need to update this to actually detect best rate based on liquidity distribution
  let largestLiquidityETH = ZERO_BD;
  let priceSoFar = ZERO_BD;
  let bundle = Bundle.load("1");

  // hardcoded fix for incorrect rates
  // if whitelist includes token - get the safe price
  if (STABLE_COINS.includes(token.id)) {
    priceSoFar = safeDiv(ONE_BD, bundle.ethPriceUSD);
  } else {
    for (let i = 0; i < whiteList.length; ++i) {
      let poolAddress = whiteList[i];
      let pool = Pool.load(poolAddress);

      if (pool.liquidity.gt(ZERO_BI)) {
        if (pool.token0 == token.id) {
          // whitelist token is token1
          let token1 = Token.load(pool.token1);
          // get the derived ETH in pool
          let ethLocked = pool.totalValueLockedToken1.times(token1.derivedETH);
          if (
            ethLocked.gt(largestLiquidityETH) &&
            (ethLocked.gt(MINIMUM_ETH_LOCKED) || WHITELIST_TOKENS.includes(pool.token0))
          ) {
            largestLiquidityETH = ethLocked;
            // token1 per our token * Eth per token1
            priceSoFar = pool.token1Price.times(token1.derivedETH as BigDecimal);
          }
        }
        if (pool.token1 == token.id) {
          let token0 = Token.load(pool.token0);
          // get the derived ETH in pool
          let ethLocked = pool.totalValueLockedToken0.times(token0.derivedETH);
          if (
            ethLocked.gt(largestLiquidityETH) &&
            (ethLocked.gt(MINIMUM_ETH_LOCKED) || WHITELIST_TOKENS.includes(pool.token1))
          ) {
            largestLiquidityETH = ethLocked;
            // token0 per our token * ETH per token0
            priceSoFar = pool.token0Price.times(token0.derivedETH as BigDecimal);
          }
        }
      }
    }
  }
  return priceSoFar; // nothing was found return 0
}

/**
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD * 2.
 * If both are, return sum of two amounts
 * If neither is, return 0
 */
export function getTrackedAmountUSD(
  tokenAmount0: BigDecimal,
  token0: Token,
  tokenAmount1: BigDecimal,
  token1: Token
): BigDecimal {
  let bundle = Bundle.load("1");
  let price0USD = token0.derivedETH.times(bundle.ethPriceUSD);
  let price1USD = token1.derivedETH.times(bundle.ethPriceUSD);

  // both are whitelist tokens, return sum of both amounts
  if (WHITELIST_TOKENS.includes(token0.id) && WHITELIST_TOKENS.includes(token1.id)) {
    return tokenAmount0.times(price0USD).plus(tokenAmount1.times(price1USD));
  }

  // take double value of the whitelisted token amount
  if (WHITELIST_TOKENS.includes(token0.id) && !WHITELIST_TOKENS.includes(token1.id)) {
    return tokenAmount0.times(price0USD).times(BigDecimal.fromString("2"));
  }

  // take double value of the whitelisted token amount
  if (!WHITELIST_TOKENS.includes(token0.id) && WHITELIST_TOKENS.includes(token1.id)) {
    return tokenAmount1.times(price1USD).times(BigDecimal.fromString("2"));
  }

  // neither token is on white list, tracked amount is 0
  return ZERO_BD;
}

/**
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD * 2.
 * If both are, return sum of two amounts
 * If neither is, return 0
 */
export function getTrackedAmountETH(
  tokenAmount0: BigDecimal,
  token0: Token,
  tokenAmount1: BigDecimal,
  token1: Token
): BigDecimal {
  let derivedETH0 = token0.derivedETH;
  let derivedETH1 = token1.derivedETH;

  // both are whitelist tokens, return sum of both amounts
  if (WHITELIST_TOKENS.includes(token0.id) && WHITELIST_TOKENS.includes(token1.id)) {
    return tokenAmount0.times(derivedETH0).plus(tokenAmount1.times(derivedETH1));
  }

  // take double value of the whitelisted token amount
  if (WHITELIST_TOKENS.includes(token0.id) && !WHITELIST_TOKENS.includes(token1.id)) {
    return tokenAmount0.times(derivedETH0).times(BigDecimal.fromString("2"));
  }

  // take double value of the whitelisted token amount
  if (!WHITELIST_TOKENS.includes(token0.id) && WHITELIST_TOKENS.includes(token1.id)) {
    return tokenAmount1.times(derivedETH1).times(BigDecimal.fromString("2"));
  }

  // neither token is on white list, tracked amount is 0
  return ZERO_BD;
}

export class AmountType {
  eth: BigDecimal;
  usd: BigDecimal;
  ethUntracked: BigDecimal;
  usdUntracked: BigDecimal;
}

export function getAdjustedAmounts(
  tokenAmount0: BigDecimal,
  token0: Token,
  tokenAmount1: BigDecimal,
  token1: Token
): AmountType {
  let derivedETH0 = token0.derivedETH;
  let derivedETH1 = token1.derivedETH;
  let bundle = Bundle.load("1");

  let eth = ZERO_BD;
  let ethUntracked = tokenAmount0.times(derivedETH0).plus(tokenAmount1.times(derivedETH1));

  // both are whitelist tokens, return sum of both amounts
  if (WHITELIST_TOKENS.includes(token0.id) && WHITELIST_TOKENS.includes(token1.id)) {
    eth = ethUntracked;
  }

  // take double value of the whitelisted token amount
  if (WHITELIST_TOKENS.includes(token0.id) && !WHITELIST_TOKENS.includes(token1.id)) {
    eth = tokenAmount0.times(derivedETH0).times(BigDecimal.fromString("2"));
  }

  // take double value of the whitelisted token amount
  if (!WHITELIST_TOKENS.includes(token0.id) && WHITELIST_TOKENS.includes(token1.id)) {
    eth = tokenAmount1.times(derivedETH1).times(BigDecimal.fromString("2"));
  }

  // Define USD values based on ETH derived values.
  let usd = eth.times(bundle.ethPriceUSD);
  let usdUntracked = ethUntracked.times(bundle.ethPriceUSD);

  return { eth, usd, ethUntracked, usdUntracked };
}
