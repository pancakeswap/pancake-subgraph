/* eslint-disable prefer-const */
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Pottery, PotteryVault, PotteryVaultRound, User, Withdrawal } from "../../generated/schema";

export let ZERO_BI = BigInt.fromString("0");
export let ONE_BI = BigInt.fromString("1");
export let ADDRESS_ZERO = Address.fromString("0x0000000000000000000000000000000000000000");

export function getOrCreatePottery(): Pottery {
  //Pottery address as id
  let entity = Pottery.load("0x01871991587d5671f3A2d4E2BcDC22F4E026396e");
  if (entity === null) {
    entity = new Pottery("0x01871991587d5671f3A2d4E2BcDC22F4E026396e");
    entity.lastVaultAddress = "";
    entity.save();
  }

  return entity as Pottery;
}

export function getOrCreatePotteryVault(hexAddress: string): PotteryVault {
  let entity = PotteryVault.load(hexAddress);
  if (entity === null) {
    entity = new PotteryVault(hexAddress);
    entity.totalPlayers = ZERO_BI;
    entity.lastRoundId = ZERO_BI;
    entity.status = "BEFORE_LOCK";
    entity.txid = "";
    entity.save();
  }

  return entity as PotteryVault;
}

export function getOrCreatePotteryVaultRound(vaultAddress: string, roundId: BigInt): PotteryVaultRound {
  let id = vaultAddress + "-" + roundId.toString();

  let entity = PotteryVaultRound.load(id);
  if (entity === null) {
    entity = new PotteryVaultRound(id);
    entity.vault = getOrCreatePotteryVault(vaultAddress).id;
    entity.prizePot = ZERO_BI;
    entity.drawDate = ZERO_BI;
    entity.roundId = roundId;
    entity.txid = "";
    entity.save();
  }

  return entity as PotteryVaultRound;
}

export function getOrCreateWithdrawal(vaultAddress: string, userAddressHex: string): Withdrawal {
  let id = vaultAddress + "-" + userAddressHex;

  let entity = Withdrawal.load(id);
  if (entity === null) {
    entity = new Withdrawal(id);
    entity.shares = ZERO_BI;
    entity.depositDate = ZERO_BI;
    entity.user = getOrCreateUser(userAddressHex).id;
    entity.vault = getOrCreatePotteryVault(vaultAddress).id;
    entity.save();
  }

  return entity as Withdrawal;
}

export function getOrCreateUser(addressHex: string): User {
  let entity = User.load(addressHex);
  if (entity === null) {
    entity = new User(addressHex);
    entity.totalShares = ZERO_BI;
    entity.save();
  }

  return entity as User;
}
