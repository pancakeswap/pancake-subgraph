/* eslint-disable prefer-const */
import { DataSourceContext, log } from "@graphprotocol/graph-ts";
import { CloseDraw, CreatePottery, StartDraw, RedeemPrize } from "../generated/Pottery/PotteryDraw";
import { PotteryVault } from "../generated/templates";
import { getOrCreatePottery, getOrCreatePotteryVault, getOrCreatePotteryVaultRound } from "./utils";

export function handleCloseDraw(event: CloseDraw): void {
  log.info("PotteryDraw. CloseDraw. Admin {}, DrawId {}, Vault {}, Timestamp {}, RequestId {}", [
    event.params.admin.toHex(),
    event.params.drawId.toString(),
    event.params.vault.toHex(),
    event.params.timestamp.toString(),
    event.params.requestId.toString(),
  ]);

  let potteryVaultRound = getOrCreatePotteryVaultRound(event.params.vault.toHex(), event.params.drawId);
  let eventWinners = event.params.winners;
  let winners = new Array<string>(eventWinners.length);
  for (let i = 0; i < eventWinners.length; i++) {
    winners[i] = eventWinners[i].toHex();
  }
  potteryVaultRound.winners = winners;
  potteryVaultRound.save();
}

export function handleCreatePottery(event: CreatePottery): void {
  log.info("PotteryDraw. CreatePottery. Vault {}, Admin {}, TotalPrize {}, DrawTime {}, LockTime {}", [
    event.params.vault.toHex(),
    event.params.admin.toHex(),
    event.params.totalPrize.toString(),
    event.params.drawTime.toString(),
    event.params.lockTime.toString(),
  ]);

  let context = new DataSourceContext();
  context.setString("vaultAddress", event.params.vault.toHex());
  PotteryVault.createWithContext(event.params.vault, context);

  let pottery = getOrCreatePottery();
  pottery.lastVaultAddress = event.params.vault.toHex();
  pottery.save();

  let potteryVault = getOrCreatePotteryVault(event.params.vault.toHex());
  potteryVault.txid = event.transaction.hash.toHex();
  potteryVault.save();
}

export function handleStartDraw(event: StartDraw): void {
  log.info("PotteryDraw. StartDraw. Admin {}, DrawId {}, Vault {}, Timestamp {}, RequestId {}, TotalPrize {}", [
    event.params.admin.toHex(),
    event.params.drawId.toString(),
    event.params.vault.toHex(),
    event.params.timestamp.toString(),
    event.params.requestId.toString(),
    event.params.totalPrize.toString(),
  ]);

  let potteryVault = getOrCreatePotteryVault(event.params.vault.toHex());
  potteryVault.lastRoundId = event.params.drawId;
  potteryVault.save();

  let potteryVaultRound = getOrCreatePotteryVaultRound(potteryVault.id, event.params.drawId);
  potteryVaultRound.prizePot = event.params.totalPrize;
  potteryVaultRound.drawDate = event.params.timestamp;
  potteryVaultRound.txid = event.transaction.hash.toHex();
  potteryVaultRound.save();
}

export function handleRedeemPrize(event: RedeemPrize): void {
  log.info("PotteryDraw. RedeemPrize. Vault {}, RedeemPrize {}, ActualPrize {}", [
    event.params.vault.toHex(),
    event.params.redeemPrize.toString(),
    event.params.actualPrize.toString(),
  ]);

  let potteryVault = getOrCreatePotteryVault(event.params.vault.toHex());

  let potteryVaultRound = getOrCreatePotteryVaultRound(potteryVault.id, potteryVault.lastRoundId);
  potteryVaultRound.prizePot = event.params.actualPrize;
  potteryVaultRound.save();
}
