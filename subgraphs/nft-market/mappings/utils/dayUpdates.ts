/* eslint-disable prefer-const */
import { CollectionDayData, MarketPlaceDayData } from "../../generated/schema";
import { Address, BigInt, BigDecimal, ethereum } from "@graphprotocol/graph-ts";

// BigNumber-like references
let ONE_BI = BigInt.fromI32(1);

export function updateCollectionDayData(collection: Address, newVolumeinBNB: BigDecimal, event: ethereum.Event): void {
  let timestamp = event.block.timestamp.toI32();
  let dayID = timestamp / 86400;
  let dayStartTimestamp = dayID * 86400;

  let ID = dayID.toString() + "-" + collection.toHexString();

  let collectionDayData = CollectionDayData.load(ID.toString());

  if (collectionDayData == null) {
    collectionDayData = new CollectionDayData(ID.toString());
    collectionDayData.date = dayStartTimestamp;
    collectionDayData.collection = collection.toHexString();
    collectionDayData.dailyVolumeBNB = newVolumeinBNB;
    collectionDayData.dailyTrades = ONE_BI;
  } else {
    collectionDayData.dailyVolumeBNB = collectionDayData.dailyVolumeBNB.plus(newVolumeinBNB);
    collectionDayData.dailyTrades = collectionDayData.dailyTrades.plus(ONE_BI);
  }

  collectionDayData.save();
}

export function updateMarketPlaceDayData(newVolumeinBNB: BigDecimal, event: ethereum.Event): void {
  let timestamp = event.block.timestamp.toI32();
  let dayID = timestamp / 86400;
  let dayStartTimestamp = dayID * 86400;

  let marketPlaceDayData = MarketPlaceDayData.load(dayID.toString());

  if (marketPlaceDayData == null) {
    marketPlaceDayData = new MarketPlaceDayData(dayID.toString());
    marketPlaceDayData.date = dayStartTimestamp;
    marketPlaceDayData.dailyVolumeBNB = newVolumeinBNB;
    marketPlaceDayData.dailyTrades = ONE_BI;
  } else {
    marketPlaceDayData.dailyVolumeBNB = marketPlaceDayData.dailyVolumeBNB.plus(newVolumeinBNB);
    marketPlaceDayData.dailyTrades = marketPlaceDayData.dailyTrades.plus(ONE_BI);
  }

  marketPlaceDayData.save();
}
