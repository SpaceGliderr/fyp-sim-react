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
}
