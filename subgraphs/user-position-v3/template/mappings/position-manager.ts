/* eslint-disable prefer-const */
import { Address } from "@graphprotocol/graph-ts";
import {
  DecreaseLiquidity,
  IncreaseLiquidity,
  Transfer,
} from "../generated/NonfungiblePositionManager/NonfungiblePositionManager";
import { loadTransaction, updateUserPosition } from "../utils/schema";
import { ADDRESS_ZERO, MASTERCHEF_ADDRESS } from "../utils/constants";
import { UserPosition } from "../generated/schema";

export function handleIncreaseLiquidity(event: IncreaseLiquidity): void {
  let transaction = loadTransaction(event);
  transaction.tokenId = event.params.tokenId;
  transaction.save();
  updateUserPosition(event, transaction);
}

export function handleDecreaseLiquidity(event: DecreaseLiquidity): void {
  let transaction = loadTransaction(event);
  transaction.tokenId = event.params.tokenId;
  transaction.save();
  updateUserPosition(event, transaction);
}

export function handleTransfer(event: Transfer): void {
  let transaction = loadTransaction(event);
  if (event.params.from.equals(Address.fromString(ADDRESS_ZERO))) {
    transaction.positionOwner = event.params.to;
  } else {
    let userPosition = UserPosition.load(event.params.tokenId.toString());
    userPosition.owner = event.params.to;
    if (!event.params.to.equals(Address.fromString(MASTERCHEF_ADDRESS))) {
      userPosition.originOwner = event.params.to;
    }
    userPosition.save();
  }
  transaction.save();
}
