import { Line } from "../coordinates";

export class MathHelper {
  public static intersects = (l1: Line, l2: Line) => {};
  public static intersectionPoint = (l1: Line, l2: Line) => {};
  public static degToRad = (deg: number) => {
    return (deg * Math.PI) / 180;
  };

  public static radToDeg = (rad: number) => {
    return (rad * 180) / Math.PI;
  };
}
