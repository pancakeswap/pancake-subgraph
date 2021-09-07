/* eslint-disable prefer-const */
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Contract, Owner, Token, Transaction } from "../generated/schema";
import { Transfer } from "../generated/ERC721/ERC721";
import { toBigDecimal } from "./utils";

// Constants
let CONTRACT_ADDRESS = "0x0000000000000000000000000000000000001000";
let ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

// BigNumber-like references
let ZERO_BI = BigInt.fromI32(0);
let ONE_BI = BigInt.fromI32(1);

export function handleTransfer(event: Transfer): void {
  let contract = Contract.load(CONTRACT_ADDRESS);
  if (contract === null) {
    // Contract
    contract = new Contract(CONTRACT_ADDRESS);
    contract.totalTokens = ZERO_BI;
    contract.totalOwners = ZERO_BI;
    contract.totalTransactions = ZERO_BI;
  }
  contract.totalTransactions = contract.totalTransactions.plus(ONE_BI);

  let from = Owner.load(event.params.from.toHex());
  if (from === null) {
    // Owner - as Sender
    from = new Owner(event.params.from.toHex());
    from.totalTokens = ZERO_BI;
    from.totalTokensMinted = ZERO_BI;
    from.totalTransactions = ZERO_BI;
    from.block = event.block.number;
    from.createdAt = event.block.timestamp;
    from.updatedAt = event.block.timestamp;

    // Contract
    contract.totalOwners = contract.totalOwners.plus(ONE_BI);
  }
  from.totalTokens = event.params.from.equals(Address.fromString(ZERO_ADDRESS))
    ? from.totalTokens
    : from.totalTokens.minus(ONE_BI);
  from.totalTransactions = from.totalTransactions.plus(ONE_BI);
  from.updatedAt = event.block.timestamp;

  let to = Owner.load(event.params.to.toHex());
  if (to === null) {
    // Owner - as Receiver
    to = new Owner(event.params.to.toHex());
    to.totalTokens = ZERO_BI;
    to.totalTokensMinted = ZERO_BI;
    to.totalTransactions = ZERO_BI;
    to.block = event.block.number;
    to.createdAt = event.block.timestamp;
    to.updatedAt = event.block.timestamp;

    // Contract
    contract.totalOwners = contract.totalOwners.plus(ONE_BI);
  }
  to.totalTokens = to.totalTokens.plus(ONE_BI);
  to.totalTransactions = to.totalTransactions.plus(ONE_BI);
  to.updatedAt = event.block.timestamp;

  let token = Token.load(event.params.tokenId.toString());
  if (token === null) {
    // Token
    token = new Token(event.params.tokenId.toString());
    token.minter = to.id;
    token.owner = to.id;
    token.burned = false;
    token.totalTransactions = ZERO_BI;
    token.block = event.block.number;
    token.createdAt = event.block.timestamp;
    token.updatedAt = event.block.timestamp;

    // Owner - as Receiver
    to.totalTokensMinted = to.totalTokensMinted.plus(ONE_BI);

    // Contract
    contract.totalTokens = contract.totalTokens.plus(ONE_BI);
  }
  token.owner = to.id;
  token.burned = event.params.to.equals(Address.fromString(ZERO_ADDRESS));
  token.totalTransactions = token.totalTransactions.plus(ONE_BI);
  token.updatedAt = event.block.timestamp;

  // Transaction
  let transaction = new Transaction(event.transaction.hash.toHex());
  transaction.from = from.id;
  transaction.to = to.id;
  transaction.token = token.id;
  transaction.gasUsed = event.transaction.gasUsed;
  transaction.gasPrice = toBigDecimal(event.transaction.gasPrice, 9);
  transaction.block = event.block.number;
  transaction.timestamp = event.block.timestamp;

  // Entities
  from.save();
  to.save();
  token.save();
  transaction.save();
  contract.save();
}
