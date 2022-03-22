import { Address, BigDecimal, dataSource } from "@graphprotocol/graph-ts";
import {
  Deposit,
  SmartChef as SmartChefContract,
  Withdraw,
  EmergencyWithdraw,
} from "../generated/templates/SmartChefInitializable/SmartChef";
import { getOrCreateUser } from "./utils/user";

const BIG_DECIMAL_1E18 = BigDecimal.fromString("1e18");

function fetchUserInfo(userAddress: Address) {
  const smartChefContract = SmartChefContract.bind(dataSource.address());
  const userInfo = smartChefContract.userInfo(userAddress);
  return userInfo;
}

export function handleDeposit(event: Deposit): void {
  const user = getOrCreateUser(dataSource.address(), event.params.user);

  const userInfo = fetchUserInfo(event.params.user);
  user.amount = userInfo.value0.divDecimal(BIG_DECIMAL_1E18);
  user.save();
}

export function handleWithdraw(event: Withdraw): void {
  const user = getOrCreateUser(dataSource.address(), event.params.user);

  const userInfo = fetchUserInfo(event.params.user);
  user.amount = userInfo.value0.divDecimal(BIG_DECIMAL_1E18);
  user.save();
}

export function handleEmergencyWithdraw(event: EmergencyWithdraw): void {
  const user = getOrCreateUser(dataSource.address(), event.params.user);
  user.amount = BigDecimal.fromString("0");
  user.save();
}
