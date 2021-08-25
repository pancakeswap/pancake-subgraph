/* eslint-disable prefer-const */
import { BigInt } from "@graphprotocol/graph-ts";
import { Factory, SmartChef, Token } from "../generated/schema";
import { NewSmartChefContract } from "../generated/SmartChefFactory/SmartChefFactory";
import { fetchTokenDecimals, fetchTokenName, fetchTokenSymbol } from "./utils/erc20";
import {
  fetchEndBlock,
  fetchRewardPerBlock,
  fetchRewardToken,
  fetchStakeToken,
  fetchStartBlock,
  fetchUserLimit,
} from "./utils/smartchef";
import { BLACKLISTED_ADDRESSES, convertTokenToDecimal } from "./utils";

let ZERO_BI = BigInt.fromI32(0);
let ONE_BI = BigInt.fromI32(1);
let FACTORY_ADDRESS = "0x927158be21fe3d4da7e96931bb27fd5059a8cbc2";

export function handleNewSmartChefContract(event: NewSmartChefContract): void {
  // Do not process some SmartChef smart contract, hiccup.
  if (BLACKLISTED_ADDRESSES.includes(event.params.smartChef.toHex())) {
    return;
  }

  let factory = Factory.load(FACTORY_ADDRESS);
  if (factory === null) {
    factory = new Factory(FACTORY_ADDRESS);
    factory.totalSmartChef = ZERO_BI;
    factory.save();
  }
  factory.totalSmartChef = factory.totalSmartChef.plus(ONE_BI);
  factory.save();

  let stakeTokenAddress = fetchStakeToken(event.params.smartChef);
  let stakeToken = Token.load(stakeTokenAddress.toHex());
  if (stakeToken === null) {
    stakeToken = new Token(stakeTokenAddress.toHex());
    stakeToken.name = fetchTokenName(stakeTokenAddress);
    stakeToken.symbol = fetchTokenSymbol(stakeTokenAddress);
    stakeToken.decimals = fetchTokenDecimals(stakeTokenAddress);
    stakeToken.save();
  }

  let earnTokenAddress = fetchRewardToken(event.params.smartChef);
  let earnToken = Token.load(earnTokenAddress.toHex());
  if (earnToken === null) {
    earnToken = new Token(earnTokenAddress.toHex());
    earnToken.name = fetchTokenName(earnTokenAddress);
    earnToken.symbol = fetchTokenSymbol(earnTokenAddress);
    earnToken.decimals = fetchTokenDecimals(earnTokenAddress);
    earnToken.save();
  }

  let smartChef = new SmartChef(event.params.smartChef.toHex());
  smartChef.stakeToken = stakeToken.id;
  smartChef.earnToken = earnToken.id;
  smartChef.startBlock = fetchStartBlock(event.params.smartChef);
  smartChef.endBlock = fetchEndBlock(event.params.smartChef);
  smartChef.reward = convertTokenToDecimal(fetchRewardPerBlock(event.params.smartChef), earnToken.decimals);

  let userLimit = fetchUserLimit(event.params.smartChef);
  if (userLimit.gt(ZERO_BI)) {
    smartChef.limit = convertTokenToDecimal(userLimit, stakeToken.decimals);
  }

  smartChef.block = event.block.number;
  smartChef.timestamp = event.block.timestamp;
  smartChef.save();
}
