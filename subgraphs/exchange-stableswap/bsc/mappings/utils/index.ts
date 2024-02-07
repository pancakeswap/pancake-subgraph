/* eslint-disable prefer-const */
import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
// import { ERC20 } from "../../../exchange/generated/Factory/ERC20";
// import { ERC20NameBytes } from "../../../exchange/generated/Factory/ERC20NameBytes";
// import { ERC20SymbolBytes } from "../../../exchange/generated/Factory/ERC20SymbolBytes";
import { StableSwapFactory } from "../../generated/StableSwapFactory/StableSwapFactory";
import { Factory } from "../../generated/StableSwapFactory/Factory";
import { ERC20 } from "../../generated/StableSwapFactory/ERC20";
import { ERC20SymbolBytes } from "../../generated/StableSwapFactory/ERC20SymbolBytes";
import { ERC20NameBytes } from "../../generated/StableSwapFactory/ERC20NameBytes";
import { PriceLens0 } from "../../generated/StableSwapFactory/PriceLens0";

export let ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";
export let STABLESWAP_FACTORY_ADDRESS = "0x36bbb126e75351c0dfb651e39b38fe0bc436ffd2";
export let STABLESWAP_FACTORY_ADDRESS_2 = "0x25a55f9f2279A54951133D503490342b50E5cd15";
export let PCS_FACTORY_ADDRESS = "0xca143ce32fe78f1f7019d7d551a6402fc5350c73";
export let BUSD_ADDRESS = "0xe9e7cea3dedca5984780bafc599bd69add087d56";
export let WBNB_ADDRESS = "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c";
export let CAKE_ADDRESS = "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82";

//When new factory was deployed, and SC address into list
export let FACTORIES: string[] = [STABLESWAP_FACTORY_ADDRESS, STABLESWAP_FACTORY_ADDRESS_2];

export let priceLensContract = PriceLens0.bind(Address.fromString("0x6234d989583520565d00131948c1fb7c4ebb691d"));

export let BUSD_ADDR = Address.fromString(BUSD_ADDRESS);
export let WBNB_ADDR = Address.fromString(WBNB_ADDRESS);
export let CAKE_ADDR = Address.fromString(CAKE_ADDRESS);

export let BIG_INT_ZERO = BigInt.fromI32(0);
export let BIG_INT_ONE = BigInt.fromI32(1);
export let BIG_DECIMAL_ZERO = BigDecimal.fromString("0");
export let BIG_DECIMAL_ONE = BigDecimal.fromString("1");
export let BIG_DECIMAL_1E18 = BigDecimal.fromString("1e18");

export let BIG_INT_18 = BigInt.fromI32(18);
export let BIG_INT_6 = BigInt.fromI32(6);

export let stableSwapFactoryContract = StableSwapFactory.bind(Address.fromString(STABLESWAP_FACTORY_ADDRESS_2));
export let pcsFactoryContract = Factory.bind(Address.fromString(PCS_FACTORY_ADDRESS));

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
