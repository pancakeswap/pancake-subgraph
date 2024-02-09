/* eslint-disable prefer-const */
import { Address, BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";
import { Bundle, Pair, Token } from "../../generated/schema";
import { getOrCreateFactory } from "../utils/data";
import { BIG_DECIMAL_ZERO, BIG_INT_ZERO, convertTokenToDecimal } from "../utils";
import { findBnbPerToken, getEthPriceInUSD, getPriceFromPCS, getTrackedLiquidityUSD } from "../utils/pricing";
import { StableSwapPair } from "../../generated/templates/StableSwapPair/StableSwapPair";

export function sync(pairAddress: Address): void {
  let pair = Pair.load(pairAddress.toHex());
  let pairContract = StableSwapPair.bind(pairAddress);
  let token0 = Token.load(pair.token0);
  let token1 = Token.load(pair.token1);
  let factory = getOrCreateFactory(pair.factory);

  let reserve0 = getReserve(pairContract, "0");
  let reserve1 = getReserve(pairContract, "1");

  // reset factory liquidity by subtracting only tracked liquidity
  factory.totalLiquidityETH = factory.totalLiquidityETH.minus(pair.trackedReserveETH as BigDecimal);

  // reset token total liquidity amounts
  token0.totalLiquidity = token0.totalLiquidity.minus(pair.reserve0);
  token1.totalLiquidity = token1.totalLiquidity.minus(pair.reserve1);

  pair.reserve0 = convertTokenToDecimal(reserve0, token0.decimals);
  pair.reserve1 = convertTokenToDecimal(reserve1, token1.decimals);

  //TODO fix price
  pair.token0Price = getPriceFromPCS(Address.fromString(pair.token0), pair);
  pair.token1Price = getPriceFromPCS(Address.fromString(pair.token1), pair);
  // if (pair.reserve1.notEqual(BIG_DECIMAL_ZERO)) pair.token0Price = pair.reserve0.div(pair.reserve1);
  // else pair.token0Price = BIG_DECIMAL_ZERO;
  // if (pair.reserve0.notEqual(BIG_DECIMAL_ZERO)) pair.token1Price = pair.reserve1.div(pair.reserve0);
  // else pair.token1Price = BIG_DECIMAL_ZERO;

  let bundle = Bundle.load("1");
  bundle.ethPrice = getEthPriceInUSD();
  bundle.save();

  let t0derivedETH = findBnbPerToken(token0 as Token);
  let t1derivedETH = findBnbPerToken(token1 as Token);

  // if t0 bnb is not found
  if (t0derivedETH.equals(BIG_DECIMAL_ZERO) && t1derivedETH.gt(BIG_DECIMAL_ZERO)) {
    t0derivedETH = t1derivedETH.times(pair.token1Price);
  }

  // if t1 bnb is not found
  if (t1derivedETH.equals(BIG_DECIMAL_ZERO) && t0derivedETH.gt(BIG_DECIMAL_ZERO)) {
    t1derivedETH = t0derivedETH.times(pair.token0Price);
  }

  token0.derivedETH = t0derivedETH;
  token0.derivedUSD = t0derivedETH.times(bundle.ethPrice);
  token0.save();

  token1.derivedETH = t1derivedETH;
  token1.derivedUSD = t1derivedETH.times(bundle.ethPrice);
  token1.save();

  // get tracked liquidity - will be 0 if neither is in whitelist
  let trackedLiquidityBNB: BigDecimal;
  if (bundle.ethPrice.notEqual(BIG_DECIMAL_ZERO)) {
    trackedLiquidityBNB = getTrackedLiquidityUSD(
      bundle as Bundle,
      pair.reserve0,
      token0 as Token,
      pair.reserve1,
      token1 as Token
    ).div(bundle.ethPrice);
  } else {
    trackedLiquidityBNB = BIG_DECIMAL_ZERO;
  }

  // use derived amounts within pair
  pair.trackedReserveETH = trackedLiquidityBNB;
  pair.reserveETH = pair.reserve0
    .times(token0.derivedETH as BigDecimal)
    .plus(pair.reserve1.times(token1.derivedETH as BigDecimal));
  pair.reserveUSD = pair.reserveETH.times(bundle.ethPrice);

  // use tracked amounts globally
  factory.totalLiquidityETH = factory.totalLiquidityETH.plus(trackedLiquidityBNB);
  factory.totalLiquidityUSD = factory.totalLiquidityETH.times(bundle.ethPrice);

  // now correctly set liquidity amounts for each token
  token0.totalLiquidity = token0.totalLiquidity.plus(pair.reserve0);
  token1.totalLiquidity = token1.totalLiquidity.plus(pair.reserve1);

  let virtualPriceResult = pairContract.try_get_virtual_price();
  let vPrice = BIG_DECIMAL_ZERO;
  if (virtualPriceResult.reverted) {
    log.warning("Unable to fetch virtual price for pair {}", [pair.id]);
  } else {
    vPrice = virtualPriceResult.value.toBigDecimal();
  }
  pair.virtualPrice = vPrice;

  // save entities
  pair.save();
  factory.save();
  token0.save();
  token1.save();
}

let getReserve = (pairContract: StableSwapPair, index: string): BigInt => {
  let balance = BIG_INT_ZERO;
  let balanceResult = pairContract.try_balances(BigInt.fromString(index));
  if (balanceResult.reverted) {
    log.warning("Unable to fetch try_balances for {}", [pairContract._address.toHex()]);
  } else {
    balance = balanceResult.value;
  }

  return balance;
};
