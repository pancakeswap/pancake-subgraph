import { Address, BigDecimal } from "@graphprotocol/graph-ts";
import { User } from "../../generated/schema";

export function getOrCreateUser(poolAddress: Address, address: Address): User {
  const id = poolAddress + "-" + address.toHex();

  let user = User.load(id);

  if (user === null) {
    user = new User(id);
    user.amount = BigDecimal.fromString("0");
    user.pool = poolAddress.toHex();
    user.address = address;
    user.save();
  }

  return user;
}
