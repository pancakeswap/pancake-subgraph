/* eslint-disable prefer-const */
import { ethereum } from "@graphprotocol/graph-ts";
import { Block } from "../../generated/schema";

export function handleBlock(block: ethereum.Block): void {
  let blockEntity = new Block(block.hash.toHex());
  blockEntity.parentHash = block.parentHash.toHex();
  blockEntity.unclesHash = block.unclesHash.toHex();
  blockEntity.author = block.author.toHex();
  blockEntity.stateRoot = block.stateRoot.toHex();
  blockEntity.transactionsRoot = block.transactionsRoot.toHex();
  blockEntity.receiptsRoot = block.receiptsRoot.toHex();
  blockEntity.number = block.number;
  blockEntity.gasUsed = block.gasUsed;
  blockEntity.gasLimit = block.gasLimit;
  blockEntity.timestamp = block.timestamp;
  blockEntity.difficulty = block.difficulty;
  blockEntity.totalDifficulty = block.totalDifficulty;
  blockEntity.size = block.size;
  blockEntity.save();
}
