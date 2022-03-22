import { Address, BigDecimal, dataSource } from "@graphprotocol/graph-ts";
import { SmartChef__userInfoResult } from "../generated/SmartChefFactory/SmartChef";
import {
  Deposit,
  SmartChef as SmartChefContract,
  Withdraw,
  EmergencyWithdraw,
  NewRewardPerBlock,
  NewStartAndEndBlocks,
} from "../generated/templates/SmartChefInitializable/SmartChef";
import { convertTokenToDecimal } from "./utils";
import { getOrCreateToken } from "./utils/erc20";
import {
  fetchEndBlock,
  fetchRewardPerBlock,
  fetchRewardToken,
  fetchStakeToken,
  fetchStartBlock,
  getOrCreateSmartChef,
} from "./utils/smartchef";
import { getOrCreateUser } from "./utils/user";

function fetchUserInfo(userAddress: Address): SmartChef__userInfoResult {
  const smartChefContract = SmartChefContract.bind(dataSource.address());
  const userInfo = smartChefContract.userInfo(userAddress);
  return userInfo as SmartChef__userInfoResult;
}

export function handleDeposit(event: Deposit): void {
  const user = getOrCreateUser(dataSource.address(), event.params.user);

  const stakeTokenAddress = fetchStakeToken(dataSource.address());
  const stakeToken = getOrCreateToken(stakeTokenAddress);
  const userInfo = fetchUserInfo(event.params.user);
  user.amount = convertTokenToDecimal(userInfo.value0, stakeToken.decimals);
  user.stakeToken = stakeTokenAddress.toHex();
  user.save();
}

export function handleWithdraw(event: Withdraw): void {
  const user = getOrCreateUser(dataSource.address(), event.params.user);

  const stakeTokenAddress = fetchStakeToken(dataSource.address());
  const stakeToken = getOrCreateToken(stakeTokenAddress);
  const userInfo = fetchUserInfo(event.params.user);
  user.amount = convertTokenToDecimal(userInfo.value0, stakeToken.decimals);
  user.save();
}

export function handleEmergencyWithdraw(event: EmergencyWithdraw): void {
  const user = getOrCreateUser(dataSource.address(), event.params.user);
  user.amount = BigDecimal.fromString("0");
  user.save();
}

export function handleNewStartAndEndBlocks(event: NewRewardPerBlock): void {
  const pool = getOrCreateSmartChef(dataSource.address());
  pool.startBlock = fetchStartBlock(dataSource.address());
  pool.endBlock = fetchEndBlock(dataSource.address());
  pool.save();
}

export function handleNewRewardPerBlock(event: NewStartAndEndBlocks): void {
  const pool = getOrCreateSmartChef(dataSource.address());
  const earnTokenAddress = fetchRewardToken(dataSource.address());
  const earnToken = getOrCreateToken(earnTokenAddress);
  pool.reward = convertTokenToDecimal(fetchRewardPerBlock(dataSource.address()), earnToken.decimals);
  pool.startBlock = fetchStartBlock(dataSource.address());
  pool.endBlock = fetchEndBlock(dataSource.address());
  pool.save();
}
