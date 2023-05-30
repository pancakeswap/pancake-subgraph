/* eslint-disable prefer-const */
import {
  DecreaseLiquidity,
  IncreaseLiquidity,
  Transfer,
} from "../generated/NonfungiblePositionManager/NonfungiblePositionManager";
import { loadTransaction } from "../utils";

export function handleIncreaseLiquidity(event: IncreaseLiquidity): void {
  let transaction = loadTransaction(event);
}

export function handleDecreaseLiquidity(event: DecreaseLiquidity): void {
  let transaction = loadTransaction(event);
}

export function handleTransfer(event: Transfer): void {
  let transaction = loadTransaction(event);
}
