/* eslint-disable prefer-const */
import { ethereum } from "@graphprotocol/graph-ts";
import { Block } from "../../generated/schema";

export function handleBlock(block: ethereum.Block): void {
  let blockEntity = new Block(block.hash.toHex());
  blockEntity.number = block.number;
  blockEntity.timestamp = block.timestamp;
  blockEntity.parentHash = block.parentHash.toHex();
  blockEntity.author = block.author.toHex();
  blockEntity.difficulty = block.difficulty;
  blockEntity.totalDifficulty = block.totalDifficulty;
  blockEntity.gasUsed = block.gasUsed;
  blockEntity.gasLimit = block.gasLimit;
  blockEntity.receiptsRoot = block.receiptsRoot.toHex();
  blockEntity.transactionsRoot = block.transactionsRoot.toHex();
  blockEntity.stateRoot = block.stateRoot.toHex();
  blockEntity.size = block.size;
  blockEntity.unclesHash = block.unclesHash.toHex();
  blockEntity.save();
}
