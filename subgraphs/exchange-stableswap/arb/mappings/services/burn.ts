/* eslint-disable prefer-const */
import { BigDecimal, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { updatePairDayData, updatePairHourData, updatePancakeDayData, updateTokenDayData } from "./dayUpdates";
import { Bundle, Burn, Pair, Token, Transaction } from "../../generated/schema";
import { getOrCreateFactory } from "../utils/data";
import { BIG_INT_ONE, convertTokenToDecimal } from "../utils";

export function burn(event: ethereum.Event, tokenAmount0: BigInt, tokenAmount1: BigInt, to: Bytes | null): void {
  let transaction = Transaction.load(event.transaction.hash.toHex());
  if (transaction === null) {
    return;
  }

  let burns = transaction.burns;
  let burn = Burn.load(burns[burns.length - 1]);

  let pair = Pair.load(event.address.toHex());
  let factory = getOrCreateFactory(pair.factory);

  //update token info
  let token0 = Token.load(pair.token0);
  let token1 = Token.load(pair.token1);
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
  // factory. = factory.totalTransactions.plus(BIG_INT_ONE);
  pair.totalTransactions = pair.totalTransactions.plus(BIG_INT_ONE);

  // update global counter and save
  token0.save();
  token1.save();
  pair.save();
  factory.save();

  // update burn
  burn.sender = event.transaction.from;
  burn.amount0 = token0Amount as BigDecimal;
  burn.amount1 = token1Amount as BigDecimal;
  burn.to = to;
  burn.logIndex = event.logIndex;
  burn.amountUSD = amountTotalUSD as BigDecimal;
  burn.save();

  updatePairDayData(event);
  updatePairHourData(event);
  updatePancakeDayData(event);
  updateTokenDayData(token0 as Token, event);
  updateTokenDayData(token1 as Token, event);
}
