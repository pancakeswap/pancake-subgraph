/* eslint-disable prefer-const */
import { BigInt } from "@graphprotocol/graph-ts";
import { Burn as BurnEvent, Mint as MintEvent, Swap as SwapEvent } from "../generated/templates/Pool/Pool";
import { Burn, Mint, Pool, Swap, Token } from "../generated/schema";
import { convertTokenToDecimal, loadTransaction } from "../utils";

export function handleMint(event: MintEvent): void {
  let transaction = loadTransaction(event);
  let poolAddress = event.address.toHexString();
  let pool = Pool.load(poolAddress);
  let token0 = Token.load(pool.token0);
  let token1 = Token.load(pool.token1);

  let amount0 = convertTokenToDecimal(event.params.amount0, token0.decimals);
  let amount1 = convertTokenToDecimal(event.params.amount1, token1.decimals);

  let mint = new Mint(transaction.id.toString() + "#" + pool.txCount.toString());
  mint.transaction = transaction.id;
  mint.timestamp = transaction.timestamp;
  mint.pool = pool.id;
  mint.token0 = pool.token0;
  mint.token1 = pool.token1;
  mint.owner = event.params.owner;
  mint.sender = event.params.sender;
  mint.origin = event.transaction.from;
  mint.amount = event.params.amount;
  mint.amount0 = amount0;
  mint.amount1 = amount1;
  mint.tickLower = BigInt.fromI32(event.params.tickLower);
  mint.tickUpper = BigInt.fromI32(event.params.tickUpper);
  mint.logIndex = event.logIndex;
}

export function handleBurn(event: BurnEvent): void {
  let transaction = loadTransaction(event);
  let poolAddress = event.address.toHexString();
  let pool = Pool.load(poolAddress);
  let token0 = Token.load(pool.token0);
  let token1 = Token.load(pool.token1);

  let amount0 = convertTokenToDecimal(event.params.amount0, token0.decimals);
  let amount1 = convertTokenToDecimal(event.params.amount1, token1.decimals);

  let burn = new Burn(transaction.id + "#" + pool.txCount.toString());
  burn.transaction = transaction.id;
  burn.timestamp = transaction.timestamp;
  burn.pool = pool.id;
  burn.token0 = pool.token0;
  burn.token1 = pool.token1;
  burn.owner = event.params.owner;
  burn.origin = event.transaction.from;
  burn.amount = event.params.amount;
  burn.amount0 = amount0;
  burn.amount1 = amount1;
  burn.tickLower = BigInt.fromI32(event.params.tickLower);
  burn.tickUpper = BigInt.fromI32(event.params.tickUpper);
  burn.logIndex = event.logIndex;
}

export function handleSwap(event: SwapEvent): void {
  let transaction = loadTransaction(event);
  let poolAddress = event.address.toHexString();
  let pool = Pool.load(poolAddress);
  let token0 = Token.load(pool.token0);
  let token1 = Token.load(pool.token1);

  let amount0 = convertTokenToDecimal(event.params.amount0, token0.decimals);
  let amount1 = convertTokenToDecimal(event.params.amount1, token1.decimals);

  let swap = new Swap(transaction.id + "#" + pool.txCount.toString());
  swap.transaction = transaction.id;
  swap.timestamp = transaction.timestamp;
  swap.pool = pool.id;
  swap.token0 = pool.token0;
  swap.token1 = pool.token1;
  swap.sender = event.params.sender;
  swap.origin = event.transaction.from;
  swap.recipient = event.params.recipient;
  swap.amount0 = amount0;
  swap.amount1 = amount1;
  swap.tick = BigInt.fromI32(event.params.tick as i32);
  swap.sqrtPriceX96 = event.params.sqrtPriceX96;
  swap.logIndex = event.logIndex;
}
