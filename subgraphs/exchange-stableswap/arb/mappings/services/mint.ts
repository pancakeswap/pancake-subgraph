/* eslint-disable prefer-const */
import { BigDecimal, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { updatePairDayData, updatePairHourData, updatePancakeDayData, updateTokenDayData } from "./dayUpdates";
import { Bundle, Mint, Pair, Token, Transaction } from "../../generated/schema";
import { BIG_INT_ONE, convertTokenToDecimal } from "../utils";
import { getOrCreateFactory } from "../utils/data";

export function mint(event: ethereum.Event, tokenAmount0: BigInt, tokenAmount1: BigInt, sender?: Bytes): void {
  let transaction = Transaction.load(event.transaction.hash.toHex());
  let mints = transaction.mints;
  let mint = Mint.load(mints[mints.length - 1]);

  let pair = Pair.load(event.address.toHex());
  let factory = getOrCreateFactory(pair.factory);

  let token0 = Token.load(pair.token0);
  let token1 = Token.load(pair.token1);

  // update exchange info (except balances, sync will cover that)
  let token0Amount = convertTokenToDecimal(tokenAmount0, token0.decimals);
  let token1Amount = convertTokenToDecimal(tokenAmount1, token1.decimals);

  // update txn counts
  token0.totalTransactions = token0.totalTransactions.plus(BIG_INT_ONE);
  token1.totalTransactions = token1.totalTransactions.plus(BIG_INT_ONE);

  // get new amounts of USD and BNB for tracking
  let bundle = Bundle.load("1");
  let amountTotalUSD = token1.derivedETH
    .times(token1Amount)
    .plus(token0.derivedETH.times(token0Amount))
    .times(bundle.ethPrice);

  // update txn counts
  pair.totalTransactions = pair.totalTransactions.plus(BIG_INT_ONE);
  factory.totalTransactions = factory.totalTransactions.plus(BIG_INT_ONE);

  // save entities
  token0.save();
  token1.save();
  pair.save();
  factory.save();

  mint.sender = sender;
  mint.amount0 = token0Amount as BigDecimal;
  mint.amount1 = token1Amount as BigDecimal;
  mint.logIndex = event.logIndex;
  mint.amountUSD = amountTotalUSD as BigDecimal;
  mint.save();

  updatePairDayData(event);
  updatePairHourData(event);
  updatePancakeDayData(event);
  updateTokenDayData(token0 as Token, event);
  updateTokenDayData(token1 as Token, event);
}
