/* eslint-disable prefer-const */

import { dataSource, store, log } from "@graphprotocol/graph-ts";
import { Deposit, Transfer, Lock } from "../../generated/templates/PotteryVault/PancakeSwapPotteryVault";
import {
  ZERO_BI,
  ONE_BI,
  getOrCreatePotteryVault,
  getOrCreateWithdrawal,
  ADDRESS_ZERO,
  getOrCreateUser,
} from "../utils";
import { UserPotteryVault } from "../../generated/schema";

let context = dataSource.context();
let vaultAddress = context.getString("vaultAddress");

export function handleDeposit(event: Deposit): void {
  log.info("PotteryVault. Deposit. Owner {}, Assets {}, Caller {}, Shares {}", [
    event.params.owner.toHex(),
    event.params.assets.toString(),
    event.params.caller.toHex(),
    event.params.shares.toString(),
  ]);

  let withdrawal = getOrCreateWithdrawal(vaultAddress, event.params.caller.toHex());
  withdrawal.depositDate = event.block.timestamp;
  withdrawal.save();
}

export function handleTransfer(event: Transfer): void {
  log.info("PotteryVault. Transfer. From {}, To {}, Value {}", [
    event.params.from.toHex(),
    event.params.to.toHex(),
    event.params.value.toString(),
  ]);

  let potteryVault = getOrCreatePotteryVault(vaultAddress);

  let userId = event.params.to.toHex();
  let user = getOrCreateUser(userId);
  let withdrawal = getOrCreateWithdrawal(vaultAddress, userId);

  // Income to vault
  if (ADDRESS_ZERO.equals(event.params.from)) {
    log.info("PotteryVault. INCOME. From {}, To {}, Value {}", [
      event.params.from.toHex(),
      event.params.to.toHex(),
      event.params.value.toString(),
    ]);
    user.totalShares = user.totalShares.plus(event.params.value);
    withdrawal.shares = withdrawal.shares.plus(event.params.value);

    let userPotteryVault = UserPotteryVault.load(userId.concat(potteryVault.id));
    if (userPotteryVault === null) {
      potteryVault.totalPlayers = potteryVault.totalPlayers.plus(ONE_BI);

      userPotteryVault = new UserPotteryVault(userId.concat(potteryVault.id));
      userPotteryVault.user = userId;
      userPotteryVault.vault = potteryVault.id;
      userPotteryVault.save();
    }
    // withdrawal.depositDate = event.block.timestamp;
    withdrawal.save();
  }
  // Outcome from vault
  else if (ADDRESS_ZERO.equals(event.params.to)) {
    user.totalShares = user.totalShares.minus(event.params.value);
    withdrawal.shares = withdrawal.shares.minus(event.params.value);
    withdrawal.save();
    log.info("PotteryVault. OUTCOME. From {}, To {}, Value {}", [
      event.params.from.toHex(),
      event.params.to.toHex(),
      event.params.value.toString(),
    ]);

    if (potteryVault.status === "BEFORE_LOCK") {
      if (withdrawal.shares.equals(ZERO_BI)) {
        potteryVault.totalPlayers = potteryVault.totalPlayers.minus(ONE_BI);

        store.remove("UserPotteryVault", event.params.from.toHex().concat(potteryVault.id));
      }
    }
  }

  potteryVault.save();
}

export function handleLock(event: Lock): void {
  let potteryVault = getOrCreatePotteryVault(vaultAddress);
  potteryVault.status = "LOCK";
  potteryVault.lockDate = event.block.timestamp;

  potteryVault.save();
}

export function handleUnlock(): void {
  let potteryVault = getOrCreatePotteryVault(vaultAddress);
  potteryVault.status = "UNLOCK";

  potteryVault.save();
}
