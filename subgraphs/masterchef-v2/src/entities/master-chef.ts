import { BigInt, dataSource, ethereum } from "@graphprotocol/graph-ts";
import { MasterChef } from "../../generated/schema";
import { BI_ZERO } from "../utils";

export function getOrCreateMasterChef(block: ethereum.Block): MasterChef {
  let masterChef = MasterChef.load(dataSource.address().toHex());

  if (masterChef === null) {
    masterChef = new MasterChef(dataSource.address().toHex());
    masterChef.totalRegularAllocPoint = BI_ZERO;
    masterChef.totalSpecialAllocPoint = BI_ZERO;
    masterChef.cakeRateToBurn = BigInt.fromString("750000000000");
    masterChef.cakeRateToRegularFarm = BigInt.fromString("100000000000");
    masterChef.cakeRateToSpecialFarm = BigInt.fromString("150000000000");
    masterChef.poolCount = BI_ZERO;
  }

  masterChef.timestamp = block.timestamp;
  masterChef.block = block.number;
  masterChef.save();

  return masterChef as MasterChef;
}
