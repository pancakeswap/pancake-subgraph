/* eslint-disable prefer-const */
import { BigInt, Bytes, log } from "@graphprotocol/graph-ts";
import { concat } from "@graphprotocol/graph-ts/helper-functions";
import { Points, User } from "../../generated/schema";
import { UserNew, UserPointIncrease } from "../../generated/Profile/Profile";

export function handleNewUser(event: UserNew): void {
  let user = new User(event.params.userAddress.toHex());
  user.isActive = true;
  user.totalPoints = BigInt.fromI32(0);
  user.points = [];
  user.save();
}

export function handleIncreasePoint(event: UserPointIncrease): void {
  let user = User.load(event.params.userAddress.toHex());
  if (user === null) {
    log.error("Error in contract, increased point when user was not created.", []);
  }

  let pointId = concat(Bytes.fromI32(event.params.campaignId.toI32()), event.params.userAddress).toHex();
  let point = new Points(pointId);
  point.user = user.id;
  point.points = event.params.numberPoints;
  point.campaignId = event.params.campaignId;
  point.save();

  user.totalPoints = user.totalPoints.plus(event.params.numberPoints);
  user.points = user.points.concat([point.id]);
  user.save();
}
