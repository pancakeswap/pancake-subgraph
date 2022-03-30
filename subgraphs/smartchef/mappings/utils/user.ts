import { Address, BigInt } from "@graphprotocol/graph-ts";
import { User } from "../../generated/schema";

export function getOrCreateUser(poolAddress: Address, address: Address): User {
  const id = poolAddress.toHex() + "-" + address.toHex();

  let user = User.load(id);

  if (user === null) {
    user = new User(id);
    user.stakeAmount = BigInt.fromI32(0);
    user.pool = poolAddress.toHex();
    user.address = address;
    user.save();
  }

  return user as User;
}
