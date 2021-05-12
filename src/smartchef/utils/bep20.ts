/* eslint-disable prefer-const */
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { BEP20 } from "../../../generated/SmartChefFactory/BEP20";
import { BEP20NameBytes } from "../../../generated/SmartChefFactory/BEP20NameBytes";
import { BEP20SymbolBytes } from "../../../generated/SmartChefFactory/BEP20SymbolBytes";

export function isNullBnbValue(value: string): boolean {
  return value == "0x0000000000000000000000000000000000000000000000000000000000000001";
}

export function fetchTokenName(tokenAddress: Address): string {
  let contract = BEP20.bind(tokenAddress);
  let contractNameBytes = BEP20NameBytes.bind(tokenAddress);

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

export function fetchTokenSymbol(tokenAddress: Address): string {
  let contract = BEP20.bind(tokenAddress);
  let contractSymbolBytes = BEP20SymbolBytes.bind(tokenAddress);

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

export function fetchTokenDecimals(tokenAddress: Address): BigInt {
  let contract = BEP20.bind(tokenAddress);
  let decimalValue = null;
  let decimalResult = contract.try_decimals();
  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value;
  }
  return BigInt.fromI32(decimalValue as i32);
}
