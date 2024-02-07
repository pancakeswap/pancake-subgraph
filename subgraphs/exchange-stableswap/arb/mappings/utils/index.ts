/* eslint-disable prefer-const */
import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
// import { ERC20 } from "../../../exchange/generated/Factory/ERC20";
// import { ERC20NameBytes } from "../../../exchange/generated/Factory/ERC20NameBytes";
// import { ERC20SymbolBytes } from "../../../exchange/generated/Factory/ERC20SymbolBytes";
import { PriceLens0 } from "../../generated/StableSwapFactory/PriceLens0";
import { StableSwapFactory } from "../../generated/StableSwapFactory/StableSwapFactory";
import { ERC20 } from "../../generated/StableSwapFactory/ERC20";
import { ERC20SymbolBytes } from "../../generated/StableSwapFactory/ERC20SymbolBytes";
import { ERC20NameBytes } from "../../generated/StableSwapFactory/ERC20NameBytes";

export let ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";
export let STABLESWAP_FACTORY_ADDRESS = "0x5d5fbb19572c4a89846198c3dbedb2b6ef58a77a";
export let USDT_ADDRESS = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9";
export let USDC_ADDRESS = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
export let WETH_ADDRESS = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
export let PENDLE_ADDRESS = "0x0c880f6761F1af8d9Aa9C466984b80DAb9a8c9e8";

//When new factory was deployed, and SC address into list
export let FACTORIES: string[] = [STABLESWAP_FACTORY_ADDRESS];

export let PRICE_LENS_ADDRESS = "0xe604940c06df1b6a9851f8e8d8d22468cb932e38";

export let priceLensContract = PriceLens0.bind(Address.fromString(PRICE_LENS_ADDRESS));

export let USDT_ADDR = Address.fromString(USDT_ADDRESS);
export let USDC_ADDR = Address.fromString(USDC_ADDRESS);
export let WETH_ADDR = Address.fromString(WETH_ADDRESS);
export let PENDLE_ADDR = Address.fromString(PENDLE_ADDRESS);

export let BIG_INT_ZERO = BigInt.fromI32(0);
export let BIG_INT_ONE = BigInt.fromI32(1);
export let BIG_DECIMAL_ZERO = BigDecimal.fromString("0");
export let BIG_DECIMAL_ONE = BigDecimal.fromString("1");
export let BIG_DECIMAL_TEN = BigDecimal.fromString("10");
export let BIG_INT_18 = BigInt.fromI32(18);
export let BIG_INT_6 = BigInt.fromI32(6);

export let stableSwapFactoryContract = StableSwapFactory.bind(Address.fromString(STABLESWAP_FACTORY_ADDRESS));
export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
  let bd = BigDecimal.fromString("1");
  for (let i = BIG_INT_ZERO; i.lt(decimals as BigInt); i = i.plus(BIG_INT_ONE)) {
    bd = bd.times(BigDecimal.fromString("10"));
  }
  return bd;
}

export function powBigDecimal(base: BigDecimal, exponent: number): BigDecimal {
  // Convert BigDecimal to f64
  let baseAsF64 = parseFloat(base.toString());

  // Perform the power operation
  let result = Math.pow(baseAsF64, exponent);

  // Convert back to BigDecimal
  return BigDecimal.fromString(result.toString());
}

export function convertTokenToDecimal(tokenAmount: BigInt, exchangeDecimals: BigInt): BigDecimal {
  if (exchangeDecimals == BIG_INT_ZERO) {
    return tokenAmount.toBigDecimal();
  }
  return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals));
}

export function isNullBnbValue(value: string): boolean {
  return value == "0x0000000000000000000000000000000000000000000000000000000000000001";
}

export function fetchTokenSymbol(tokenAddress: Address): string {
  let contract = ERC20.bind(tokenAddress);
  let contractSymbolBytes = ERC20SymbolBytes.bind(tokenAddress);

  let symbolValue = "unknown";
  let symbolResult = contract.try_symbol();
  if (symbolResult.reverted) {
    let symbolResultBytes = contractSymbolBytes.try_symbol();
    if (!symbolResultBytes.reverted) {
      if (!isNullBnbValue(symbolResultBytes.value.toHex())) {
        symbolValue = symbolResultBytes.value.toString();
      }
    }
  } else {
    symbolValue = symbolResult.value;
  }
  return symbolValue;
}

export function fetchTokenName(tokenAddress: Address): string {
  let contract = ERC20.bind(tokenAddress);
  let contractNameBytes = ERC20NameBytes.bind(tokenAddress);

  let nameValue = "unknown";
  let nameResult = contract.try_name();
  if (nameResult.reverted) {
    let nameResultBytes = contractNameBytes.try_name();
    if (!nameResultBytes.reverted) {
      if (!isNullBnbValue(nameResultBytes.value.toHex())) {
        nameValue = nameResultBytes.value.toString();
      }
    }
  } else {
    nameValue = nameResult.value;
  }
  return nameValue;
}

export function fetchTokenDecimals(tokenAddress: Address): BigInt {
  let contract = ERC20.bind(tokenAddress);
  let decimalValue = null;
  let decimalResult = contract.try_decimals();
  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value;
  }
  return BigInt.fromI32(decimalValue as i32);
}
