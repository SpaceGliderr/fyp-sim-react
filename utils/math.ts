import { Line, Point, Pose } from "./coordinates";

export class MathHelper {
  public static degToRad = (deg: number) => {
    return (deg * Math.PI) / 180;
  };

  public static radToDeg = (rad: number) => {
    return (rad * 180) / Math.PI;
  };

  // Distance must be measured in pixels
  public static calcEndPoint = (pose: Pose, distance: number) => {
    const { x, y, theta } = pose.unpack();

    return new Point(
      distance * Math.cos(theta) + x,
      distance * Math.sin(theta) + y
    );
  };

  // To retrieve all the Lines that make up a polygon from a set of points
  public static getLinesFromPoints = (points: Point[]): Line[] => {
    return points.reduce((acc, curr, i) => {
      let endPoint = points[i + 1];
      if (i === points.length - 1) {
        endPoint = points[0];
      }
      return acc.concat(new Line(curr, endPoint));
    }, [] as Line[]);
  };

  public static normalize = (point: Point) => {
    // Normalize vector
    const length = Math.sqrt(
      Math.pow(point.getX(), 2) + Math.pow(point.getY(), 2)
    );
    return new Point(point.getX() / length, point.getY() / length);
  };

  public static dotProduct = (p1: Point, p2: Point) => {
    return p1.getX() * p2.getX() + p1.getY() * p2.getY();
  };

  public static projectVertices = (points: Point[], axis: Point) => {
    // Project all the vertices onto the axis
    let min = Number.MAX_VALUE;
    let max = Number.MIN_VALUE;

    points.forEach((point) => {
      const projection = MathHelper.dotProduct(point, axis);
      if (projection < min) {
        min = projection;
      }
      if (projection > max) {
        max = projection;
      }
    });

    return { min, max };
  };

  public static projectCircle = (
    center: Point,
    radius: number,
    axis: Point
  ) => {
    const direction = MathHelper.normalize(axis);
    const directionAndRadius = direction.multiply(radius);

    const p1 = center.add(directionAndRadius);
    const p2 = center.subtract(directionAndRadius);

    // Project the circle onto the axis
    let min = MathHelper.dotProduct(p1, axis);
    let max = MathHelper.dotProduct(p2, axis);

    if (min > max) {
      const t = min;
      min = max;
      max = t;
    }

    return { min, max };
  };

  public static findClosestPointOnPolygon = (
    center: Point,
    vertices: Point[]
  ): number => {
    let result = -1;
    let minDist: number = Number.MAX_VALUE;

    vertices.forEach((vertex, i) => {
      const distance = vertex.distanceTo(center);

      if (distance < minDist) {
        minDist = distance;
        result = i;
      }
    });

    return result;
  };
}
