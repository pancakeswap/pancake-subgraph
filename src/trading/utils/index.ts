/* eslint-disable prefer-const */
import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { Pair } from "../../../generated/templates/Pair/Pair";

export let ZERO_BI = BigInt.fromI32(0);
export let ONE_BI = BigInt.fromI32(1);
export let ZERO_BD = BigDecimal.fromString("0");

export let TRACKED_PAIRS: string[] = [
  "0x1b96b92314c44b159149f7e0303511fb2fc4774f", // WBNB/BUSD
  "0xa527a61703d82139f8a06bc30097cc9caa2df5a6", // CAKE/WBNB
  "0x70d8929d04b60af4fb9b58713ebcf18765ade422", // ETH/WBNB
  "0x7561eee90e24f3b348e1087a005f78b4c8453524", // BTCB/WBNB
];

export function getBnbPriceInUSD(): BigDecimal {
  // Bind WBNB/BUSD pair to query pair.
  let pairContract = Pair.bind(Address.fromString(TRACKED_PAIRS[0]));

  // Fail-safe call to get BNB price as BUSD.
  let reserves = pairContract.try_getReserves();
  if (!reserves.reverted) {
    let reserve0 = convertTokenToDecimal(reserves.value.value0, BigInt.fromI32(18));
    let reserve1 = convertTokenToDecimal(reserves.value.value1, BigInt.fromI32(18));

    if (reserve0.notEqual(ZERO_BD)) {
      return reserve1.div(reserve0);
    }
  }

  return ZERO_BD;
}

export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
  let bd = BigDecimal.fromString("1");
  for (let i = ZERO_BI; i.lt(decimals as BigInt); i = i.plus(ONE_BI)) {
    bd = bd.times(BigDecimal.fromString("10"));
  }

  return bd;
}

export function convertTokenToDecimal(tokenAmount: BigInt, exchangeDecimals: BigInt): BigDecimal {
  if (exchangeDecimals == ZERO_BI) {
    return tokenAmount.toBigDecimal();
  }

  return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals));
}
