import { Claim } from "../generated/AffiliateProgram/AffiliateProgram";
import { ClaimRecord } from "../generated/schema";

export function handleClaim(event: Claim): void {
  let claimType = event.params.claimType == 0 ? "AFFILIATE" : "USER";
  let entity = new ClaimRecord(
    event.params.claimer.toHexString().concat("-").concat(claimType).concat("-").concat(event.params.nonce.toString())
  );
  entity.nonce = event.params.nonce;
  entity.claimer = event.params.claimer;
  entity.type = claimType;
  entity.amount = event.params.amount;
  entity.hash = event.transaction.hash;
  entity.claimTime = event.block.timestamp;

  entity.save();
}
