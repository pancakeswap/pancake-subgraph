/* eslint-disable prefer-const */
import { Point, Team, User } from "../../../generated/schema";

/**
 * Increase points for a given entity.
 *
 * @param {Team|User} entity
 * @param {Point} point
 */
export function increaseEntityPoints(entity: Team | User, point: Point): void {
  entity.totalPoints = entity.totalPoints.plus(point.points);
  entity.points = entity.points.concat([point.id]);
  entity.save();
}
