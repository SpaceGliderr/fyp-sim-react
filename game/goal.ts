import { Point } from "../utils/coordinates";
import { CircleObstacle, PolygonObstacle } from "./obstacles";
import { GOAL_COLOR } from "./settings";

export enum GoalShape {
  CIRCLE = "CIRCLE",
  POLYGON = "POLYGON",
}

enum GoalStatus {
  NOT_REACHED = "NOT_REACHED",
  REACHED = "REACHED",
}

export class Goal {
  private point: Point[];
  private shape: GoalShape;
  private obstacle: CircleObstacle | PolygonObstacle;
  private status: GoalStatus = GoalStatus.NOT_REACHED;

  constructor(point: Point[], shape: GoalShape, radius?: number) {
    this.point = point;
    this.shape = shape;
    this.obstacle =
      shape == GoalShape.CIRCLE && radius
        ? new CircleObstacle(point[0], radius, GOAL_COLOR)
        : new PolygonObstacle(point, GOAL_COLOR);
  }

  public render = () => {
    this.obstacle.render(true);
  };

  public unpack = () => {
    return {
      point: this.point,
      shape: this.shape,
      obstacle: this.obstacle,
      status: this.status,
    };
  };

  public setStatusToReached = () => {
    this.status = GoalStatus.REACHED;
  };
}
