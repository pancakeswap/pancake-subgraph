import { BigInt, dataSource, ethereum } from "@graphprotocol/graph-ts";
import { MasterChef } from "../../generated/schema";
import { BI_ZERO } from "../utils";

export function getOrCreateMasterChef(block: ethereum.Block): MasterChef {
  let masterChef = MasterChef.load(dataSource.address().toHex());

  if (masterChef === null) {
    masterChef = new MasterChef(dataSource.address().toHex());
    masterChef.totalAllocPoint = BI_ZERO;
    masterChef.undistributedCake = BI_ZERO;
    masterChef.lastHarvestBlock = BI_ZERO;
    masterChef.latestPeriodCakePerSecond = BI_ZERO;
    masterChef.latestPeriodEndTime = BI_ZERO;
    masterChef.latestPeriodCakeAmount = BI_ZERO;
    masterChef.latestPeriodStartTime = BI_ZERO;
    masterChef.poolCount = BI_ZERO;
    masterChef.periodDuration = BigInt.fromI32(86400);
  }

  masterChef.timestamp = block.timestamp;
  masterChef.block = block.number;
  masterChef.save();

  return masterChef as MasterChef;
}
