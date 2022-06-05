import { CircleObstacle, PolygonObstacle } from "../game/obstacles";
import { Line, Point } from "./coordinates";
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

  public static circleCircleIntersect = (
    c1: CircleObstacle,
    c2: CircleObstacle
  ) => {
    const { point: cp1, radius: cr1 } = c1.unpack();
    const { point: cp2, radius: cr2 } = c2.unpack();

    const dist = cp1.distanceTo(cp2);
    const totalRadius = cr1 + cr2;

    return dist < totalRadius;
  };

  public static circleLineIntersect = (
    circle: CircleObstacle,
    line: Line
  ): boolean => {
    // https://www.mathworks.com/matlabcentral/answers/401724-how-to-check-if-a-line-segment-intersects-a-circle
    const { point: cp, radius: cr } = circle.unpack();
    const points = line.getPoints();
    const d = points[1].subtract(points[0]);
    const f = points[0].subtract(cp);
    const a = MathHelper.dotProduct(d, d);
    const b = 2 * MathHelper.dotProduct(f, d);
    const c = MathHelper.dotProduct(f, f) - Math.pow(cr, 2);

    const discriminant = Math.pow(b, 2) - 4 * a * c;
    if (discriminant < 0) {
      return false;
    } else {
      const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
      const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);
      return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1);
    }
  };

  public static getCircleLineIntersectionPoints = (
    circle: CircleObstacle,
    line: Line
  ) => {
    // Checks for intersection and returns the points of intersection
    const points = line.getPoints();
    const { slope, intercept } = MathHelper.getLineEquation(
      points[0],
      points[1]
    );
    const { x, y } = circle.getPoint().unpack();

    // var a = 1 + sq(m);
    // var b = -h * 2 + (m * (n - k)) * 2;
    // var c = sq(h) + sq(n - k) - sq(r);

    const a = 1 + Math.pow(slope, 2);
    const b = -x * 2 + slope * (intercept - y) * 2;
    const c =
      Math.pow(x, 2) +
      Math.pow(intercept - y, 2) -
      Math.pow(circle.getRadius(), 2);

    const d = MathHelper.getDiscriminant(a, b, c);

    let intersectXCoords: number[] = [];

    if (d >= 0) {
      intersectXCoords = [
        (-b + Math.sqrt(d)) / (2 * a),
        (-b - Math.sqrt(d)) / (2 * a),
      ];

      if (d === 0) {
        // only 1 intersection
        intersectXCoords = [intersectXCoords[0]];
      }
    }

    const intersectionPoints: Point[] = [];
    if (intersectXCoords.length > 0) {
      intersectXCoords.forEach((x) => {
        // Calculate y
        const y = slope * x + intercept;
        intersectionPoints.push(new Point(x, y));
      });
    }

    return intersectionPoints;
  };
}
