/* eslint-disable prefer-const */
import { Address, BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";
import { Bundle, Pair, Token } from "../../generated/schema";
import { getOrCreateFactory } from "../utils/data";
import { BIG_DECIMAL_ZERO, BIG_INT_ZERO, convertTokenToDecimal } from "../utils";
import { findBnbPerToken, getBnbPriceInUSD, getPriceFromPCS, getTrackedLiquidityUSD } from "../utils/pricing";
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
  factory.totalLiquidityBNB = factory.totalLiquidityBNB.minus(pair.trackedReserveBNB as BigDecimal);

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
  bundle.bnbPrice = getBnbPriceInUSD();
  bundle.save();

  let t0DerivedBNB = findBnbPerToken(token0 as Token);
  token0.derivedBNB = t0DerivedBNB;
  token0.derivedUSD = t0DerivedBNB.times(bundle.bnbPrice);
  token0.save();

  let t1DerivedBNB = findBnbPerToken(token1 as Token);
  token1.derivedBNB = t1DerivedBNB;
  token1.derivedUSD = t1DerivedBNB.times(bundle.bnbPrice);
  token1.save();

  // get tracked liquidity - will be 0 if neither is in whitelist
  let trackedLiquidityBNB: BigDecimal;
  if (bundle.bnbPrice.notEqual(BIG_DECIMAL_ZERO)) {
    trackedLiquidityBNB = getTrackedLiquidityUSD(
      bundle as Bundle,
      pair.reserve0,
      token0 as Token,
      pair.reserve1,
      token1 as Token
    ).div(bundle.bnbPrice);
  } else {
    trackedLiquidityBNB = BIG_DECIMAL_ZERO;
  }

  // use derived amounts within pair
  pair.trackedReserveBNB = trackedLiquidityBNB;
  pair.reserveBNB = pair.reserve0
    .times(token0.derivedBNB as BigDecimal)
    .plus(pair.reserve1.times(token1.derivedBNB as BigDecimal));
  pair.reserveUSD = pair.reserveBNB.times(bundle.bnbPrice);

  // use tracked amounts globally
  factory.totalLiquidityBNB = factory.totalLiquidityBNB.plus(trackedLiquidityBNB);
  factory.totalLiquidityUSD = factory.totalLiquidityBNB.times(bundle.bnbPrice);

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
