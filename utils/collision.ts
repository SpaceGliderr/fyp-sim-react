import { CircleObstacle, PolygonObstacle } from "../game/obstacles";
import { CanvasHelper } from "./canvas";
import { Point } from "./coordinates";
import { MathHelper } from "./math";

export class Collision {
  public static circlePolygonIntersect = (
    polygon: PolygonObstacle,
    circle: CircleObstacle
  ): boolean => {
    let collision = true; // TODO: This collision is not supposed to be in the program, need to ask for clarification

    // Implements the Separating Axis Theorem
    const lines = polygon.getLines();
    lines.forEach((line) => {
      const { x1, y1, x2, y2 } = line.unpack();
      const pointA = new Point(x1, y1);
      const pointB = new Point(x2, y2);

      let axis: Point = pointA.subtract(pointB);
      axis = axis.getAxis();
      axis = MathHelper.normalize(axis);

      const { min: minA, max: maxA } = MathHelper.projectVertices(
        polygon.getPoints(),
        axis
      );
      const { min: minB, max: maxB } = MathHelper.projectCircle(
        circle.getPoint(),
        circle.getRadius(),
        axis
      );

      if (maxA < minB || maxB < minA) {
        collision = false;
        return false;
      }
    });

    // TODO: This part is currently redundant due to the bug
    const cpIndex = MathHelper.findClosestPointOnPolygon(
      circle.getPoint(),
      polygon.getPoints()
    );
    const cp = polygon.getPoints()[cpIndex];

    let axis = cp.subtract(circle.getPoint());
    axis = MathHelper.normalize(axis);
    CanvasHelper.drawArc(axis, 10, "green");

    const { min: minA, max: maxA } = MathHelper.projectVertices(
      polygon.getPoints(),
      axis
    );
    const { min: minB, max: maxB } = MathHelper.projectCircle(
      circle.getPoint(),
      circle.getRadius(),
      axis
    );

    if (maxA < minB || maxB < minA) {
      return false;
    }

    return collision;
  };
}
