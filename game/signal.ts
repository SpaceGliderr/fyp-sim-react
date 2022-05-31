import { Collision } from "../utils/collision";
import { Point } from "../utils/coordinates";
import { CircleObstacle } from "./obstacles";
import { SIGNAL_RADIUS_IN_PX } from "./settings";

export class Signal extends CircleObstacle {
  constructor(point: Point) {
    super(point, SIGNAL_RADIUS_IN_PX);
  }

  public isSignalWithinRange = (signal: Signal) => {
    return Collision.circleCircleIntersect(this, signal);
  };
}
