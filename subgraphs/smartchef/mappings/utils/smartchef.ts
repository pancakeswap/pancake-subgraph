/* eslint-disable prefer-const */
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { SmartChef } from "../../generated/SmartChefFactory/SmartChef";

export let ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

export function fetchStakeToken(smartChefAddress: Address): Address {
  let contract = SmartChef.bind(smartChefAddress);
  let nameValue = Address.fromString(ADDRESS_ZERO);
  let nameResult = contract.try_stakedToken();
  if (!nameResult.reverted) {
    nameValue = nameResult.value;
  }

  return nameValue;
}

export function fetchRewardToken(smartChefAddress: Address): Address {
  let contract = SmartChef.bind(smartChefAddress);
  let nameValue = Address.fromString(ADDRESS_ZERO);
  let nameResult = contract.try_rewardToken();
  if (!nameResult.reverted) {
    nameValue = nameResult.value;
  }

  return nameValue;
}

export function fetchStartBlock(smartChefAddress: Address): BigInt {
  let contract = SmartChef.bind(smartChefAddress);
  let decimalValue = BigInt.fromI32(0);
  let decimalResult = contract.try_startBlock();
  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value;
  }
  return decimalValue;
}

export function fetchEndBlock(smartChefAddress: Address): BigInt {
  let contract = SmartChef.bind(smartChefAddress);
  let decimalValue = BigInt.fromI32(0);
  let decimalResult = contract.try_bonusEndBlock();
  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value;
  }
  return decimalValue;
}

export function fetchRewardPerBlock(smartChefAddress: Address): BigInt {
  let contract = SmartChef.bind(smartChefAddress);
  let decimalValue = BigInt.fromI32(0);
  let decimalResult = contract.try_rewardPerBlock();
  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value;
  }
  return decimalValue;
}

export function fetchUserLimit(smartChefAddress: Address): BigInt {
  let contract = SmartChef.bind(smartChefAddress);
  let decimalValue = BigInt.fromI32(0);
  let decimalResult = contract.try_poolLimitPerUser();
  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value;
  }
  return decimalValue;
}
