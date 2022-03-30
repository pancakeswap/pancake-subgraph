import { Address, BigInt, dataSource } from "@graphprotocol/graph-ts";
import {
  Deposit,
  EmergencyWithdraw,
  NewRewardPerBlock,
  NewStartAndEndBlocks,
  Withdraw,
} from "../generated/templates/SmartChefInitializable/SmartChef";
import { convertTokenToDecimal } from "./utils";
import { getOrCreateToken } from "./utils/erc20";
import { getOrCreateSmartChef } from "./utils/smartchef";
import { getOrCreateUser } from "./utils/user";

export function handleDeposit(event: Deposit): void {
  const user = getOrCreateUser(dataSource.address(), event.params.user);
  const pool = getOrCreateSmartChef(dataSource.address());
  user.stakeToken = pool.stakeToken;
  user.stakeAmount = user.stakeAmount.plus(event.params.amount);
  user.save();
}

export function handleWithdraw(event: Withdraw): void {
  const user = getOrCreateUser(dataSource.address(), event.params.user);
  user.stakeAmount = user.stakeAmount.minus(event.params.amount);
  user.save();
}

export function handleEmergencyWithdraw(event: EmergencyWithdraw): void {
  const user = getOrCreateUser(dataSource.address(), event.params.user);
  user.stakeAmount = BigInt.fromI32(0);
  user.save();
}

export function handleNewStartAndEndBlocks(event: NewStartAndEndBlocks): void {
  const pool = getOrCreateSmartChef(dataSource.address());
  pool.startBlock = event.params.startBlock;
  pool.endBlock = event.params.endBlock;
  pool.save();
}

export function handleNewRewardPerBlock(event: NewRewardPerBlock): void {
  const pool = getOrCreateSmartChef(dataSource.address());
  const earnToken = getOrCreateToken(Address.fromString(pool.earnToken));
  pool.reward = convertTokenToDecimal(event.params.rewardPerBlock, earnToken.decimals);
  pool.save();
}
