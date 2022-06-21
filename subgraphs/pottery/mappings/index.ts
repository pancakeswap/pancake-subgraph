import { log } from "@graphprotocol/graph-ts";
import { ClaimReward, CloseDraw, CreatePottery, StartDraw } from "../generated/Pottery/PotteryDraw";
import { PotteryVault } from "../generated/templates";

export function handleClaimReward(event: ClaimReward): void {
  log.info("PotteryDraw. ClaimReward. Prize {}, WinCount {}, Winner {}, Fee {}", [
    event.params.prize.toString(),
    event.params.winCount.toString(),
    event.params.winner.toHex(),
    event.params.fee.toString(),
  ]);
}

export function handleCloseDraw(event: CloseDraw): void {
  log.info("PotteryDraw. CloseDraw. Admin {}, DrawId {}, Vault {}, Timestamp {}, RequestId {}", [
    event.params.admin.toHex(),
    event.params.drawId.toString(),
    event.params.vault.toHex(),
    event.params.timestamp.toString(),
    event.params.requestId.toString(),
  ]);
}

export function handleCreatePottery(event: CreatePottery): void {
  log.info("PotteryDraw. CreatePottery. Vault {}, Admin {}, Treasury {}, TotalPrize {}, DrawTime {}, LockTime {}", [
    event.params.vault.toHex(),
    event.params.admin.toHex(),
    event.params.treasury.toHex(),
    event.params.totalPrize.toString(),
    event.params.drawTime.toString(),
    event.params.lockTime.toString(),
  ]);
  PotteryVault.create(event.params.vault);
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
}
