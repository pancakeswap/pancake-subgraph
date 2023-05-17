import { BigInt } from "@graphprotocol/graph-ts";
import { Claim } from "../generated/AffiliateProgram/AffiliateProgram";
import { ClaimRecord } from "../generated/schema";

export function handleClaim(event: Claim): void {
  let entity = new ClaimRecord(`${event.params.claimer.toHex()}-${event.params.nonce}-${event.params.claimType}`);
  entity.nonce = event.params.nonce;
  entity.claimer = event.params.claimer;
  entity.type = event.params.claimType == 0 ? "AFFILIATE" : "USER";
  entity.amount = event.params.amount;
  entity.hash = event.transaction.hash;
  entity.claimTime = event.block.timestamp;

  entity.save();
}
