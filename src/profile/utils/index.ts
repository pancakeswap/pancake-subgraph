/* eslint-disable prefer-const */
import { BigInt } from "@graphprotocol/graph-ts";
import { Point, Team, User } from "../../../generated/schema";

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
export function increaseEntityPoints<T>(entity: T, point: Point): void {
  if (entity instanceof Team || entity instanceof User) {
    entity.totalPoints = entity.totalPoints.plus(point.points);
    entity.points = entity.points.concat([point.id]);
    entity.save();
  }
}
