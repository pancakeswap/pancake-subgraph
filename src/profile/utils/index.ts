/* eslint-disable prefer-const */
import { BigInt, log } from "@graphprotocol/graph-ts";
import { Point, Team, User } from "../../../generated/schema";

export function getUser(userId: string): User {
  let user = User.load(userId);
  if (user === null) {
    log.error("Error in contract, tried to retrieve when userId: {}", [userId]);
  }

  return user as User;
}

export function getTeam(teamId: string): Team {
  let team = Team.load(teamId);
  if (team === null) {
    log.error("Error in contract, tried to retrieve when teamId: {}", [teamId]);
  }

  return team as Team;
}

/**
 * Create a Point entity based on computed field (pointId).
 *
 * @param {string} pointId
 * @param {BigInt} numberPoints
 * @param {BigInt} campaignId
 */
export function createPoint(pointId: string, numberPoints: BigInt, campaignId: BigInt): Point {
  let point = new Point(pointId);
  point.points = numberPoints;
  point.campaignId = campaignId;
  point.save();

  return point as Point;
}

/**
 * Increase points for a given entity.
 *
 * @param {Team|User} entity
 * @param {Point} point
 */
export function increaseEntityPoint<T>(entity: T, point: Point): void {
  if (entity instanceof Team || entity instanceof User) {
    entity.totalPoints = entity.totalPoints.plus(point.points);
    entity.points = entity.points.concat([point.id]);
    entity.save();
  }
}
