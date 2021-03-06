/* eslint-disable prefer-const */
import { Point, Team, User } from "../../../generated/schema";

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
