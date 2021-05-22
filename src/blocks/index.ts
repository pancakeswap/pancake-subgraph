/* eslint-disable prefer-const */
import { ethereum } from "@graphprotocol/graph-ts";
import { Block } from "../../generated/schema";

export function handleBlock(block: ethereum.Block): void {
  let blockEntity = new Block(block.hash.toHex());
  blockEntity.parentHash = block.parentHash;
  blockEntity.unclesHash = block.unclesHash;
  blockEntity.author = block.author;
  blockEntity.stateRoot = block.stateRoot;
  blockEntity.transactionsRoot = block.transactionsRoot;
  blockEntity.receiptsRoot = block.receiptsRoot;
  blockEntity.number = block.number;
  blockEntity.gasUsed = block.gasUsed;
  blockEntity.gasLimit = block.gasLimit;
  blockEntity.timestamp = block.timestamp;
  blockEntity.difficulty = block.difficulty;
  blockEntity.totalDifficulty = block.totalDifficulty;
  blockEntity.size = block.size;
  blockEntity.save();
}
