import { CanvasHelper } from "../utils/canvas";
import { Collision } from "../utils/collision";
import { Point } from "../utils/coordinates";
import { GeneralUtils } from "../utils/general";
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
  private robotId: number;
  private expiryDate?: Date; // only navigation goals will have expiry dates

  constructor(
    point: Point[],
    shape: GoalShape,
    robotId: number,
    radius?: number,
    expiryDate?: Date,
    duration?: number
  ) {
    this.point = point;
    this.shape = shape;
    this.obstacle =
      shape == GoalShape.CIRCLE && radius
        ? new CircleObstacle(point[0], radius, GOAL_COLOR)
        : new PolygonObstacle(point, GOAL_COLOR);
    this.robotId = robotId;
    this.expiryDate = expiryDate;
    if (duration && !this.expiryDate) {
      this.expiryDate = GeneralUtils.generateExpiryDate(duration);
    }
  }

  public render = () => {
    this.obstacle.render();
    CanvasHelper.drawText(this.point[0], this.robotId.toString(), -2.75, 3);
  };

  public unpack = () => {
    return {
      point: this.point,
      shape: this.shape,
      obstacle: this.obstacle,
      status: this.status,
      robotId: this.robotId,
    };
  };

  public getPoints = () => {
    return this.point;
  };

  public setStatusToReached = () => {
    this.status = GoalStatus.REACHED;
  };

  public getRobotId = () => {
    return this.robotId;
  };

  public getObstacle = () => {
    return this.obstacle;
  };

  public checkForCollisionWithRobot = (robot: CircleObstacle) => {
    if (this.shape == GoalShape.CIRCLE) {
      return Collision.circleCircleIntersect(
        this.obstacle as CircleObstacle,
        robot
      );
    } else {
      return Collision.circlePolygonIntersect(
        this.obstacle as PolygonObstacle,
        robot
      );
    }
  };

  public getExpiryDate = () => {
    return this.expiryDate;
  };

  public isExpired = () => {
    if (this.expiryDate) {
      return new Date() > this.expiryDate;
    } else {
      return false;
    }
  };

  public getTimeTaken = () => {
    if (this.expiryDate) {
      return new Date().getTime() - this.expiryDate.getTime();
    } else {
      return null;
    }
  };
}
