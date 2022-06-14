import { CanvasHelper } from "../utils/canvas";
import { Collision } from "../utils/collision";
import { Line, Point, Pose } from "../utils/coordinates";
import { MathHelper } from "../utils/math";
import { PolygonObstacle } from "./obstacles";
import { Robot } from "./robot";
import {
  IR_SENSOR_COLOR,
  IR_SENSOR_MEASUREMENT_LENGTH,
  PIXEL_TO_CM_RATIO,
  ROBOT_RADIUS,
  US_SENSOR_COLOR,
  US_SENSOR_MEASUREMENT_LENGTH,
} from "./settings";

export abstract class Sensor {
  private pose: Pose;
  private reading: Point | null = null;
  private mLen: number;
  private color: string;
  private degreeOnRobot: number;
  private distanceOfReading: number;

  constructor(pose: Pose, mLen: number, color: string, degreeOnRobot: number) {
    this.pose = pose;
    this.mLen = mLen;
    this.color = color;
    this.degreeOnRobot = degreeOnRobot;
    this.distanceOfReading = this.getPointOnRobot().distanceTo(
      this.getEmptyReading()
    );
  }

  public getEmptyReading = (): Point => {
    return MathHelper.calcEndPoint(this.pose, this.mLen);
  };

  public getDegreeOnRobot(): number {
    return this.degreeOnRobot;
  }

  public getDistanceOfReading(): number {
    return this.distanceOfReading;
  }

  public setReading = (newReading: Point) => {
    const pointOnRobot = this.getPointOnRobot();

    if (this.reading === null) {
      this.reading = newReading;
      this.distanceOfReading = pointOnRobot.distanceTo(newReading);
      return;
    }

    if (
      pointOnRobot.distanceTo(newReading) <
      pointOnRobot.distanceTo(this.reading)
    ) {
      this.reading = newReading;
      this.distanceOfReading = pointOnRobot.distanceTo(newReading);
      return;
    }
  };

  public clearReading = () => {
    this.reading = null;
    this.distanceOfReading = this.getPointOnRobot().distanceTo(
      this.getEmptyReading()
    );
  };

  public getReading = () => {
    return this.reading;
  };

  public getMLen = () => {
    return this.mLen;
  };

  public measure = (
    obstacles: PolygonObstacle[],
    robots: Robot[],
    robotId: number
  ) => {
    let intersect: boolean = false; // Intersect flag

    obstacles.forEach((obstacle) => {
      const sensorLine = new Line(
        MathHelper.calcEndPoint(this.pose, ROBOT_RADIUS * PIXEL_TO_CM_RATIO),
        MathHelper.calcEndPoint(this.pose, this.mLen)
      );

      obstacle.getLines().forEach((line) => {
        if (sensorLine.intersects(line)) {
          this.setReading(sensorLine.intersectionPointOf(line));
          intersect = true;
        }
      });
    });

    robots.forEach((robot) => {
      if (robot.getId() === robotId) return;

      const sensorLine = new Line(
        MathHelper.calcEndPoint(this.pose, ROBOT_RADIUS * PIXEL_TO_CM_RATIO),
        MathHelper.calcEndPoint(this.pose, this.mLen)
      );

      if (Collision.circleLineIntersect(robot, sensorLine)) {
        const points = Collision.getCircleLineIntersectionPoints(
          robot,
          sensorLine
        );

        if (points.length === 2) {
          if (
            this.pose.getPoint().distanceTo(points[0]) <
            this.pose.getPoint().distanceTo(points[1])
          ) {
            this.setReading(points[0]);
          } else {
            this.setReading(points[1]);
          }
          intersect = true;
        } else if (points.length === 1) {
          this.setReading(points[0]);
          intersect = true;
        }
      }
    });

    if (!intersect) this.clearReading();
  };

  public render = () => {
    let endPoint: Point = MathHelper.calcEndPoint(this.pose, this.mLen);

    if (this.reading) {
      endPoint = this.reading;
    }

    CanvasHelper.drawLineWithArc(
      new Line(
        MathHelper.calcEndPoint(this.pose, ROBOT_RADIUS * PIXEL_TO_CM_RATIO),
        endPoint
      ),
      this.color,
      2.5
    );
  };

  public getPointOnRobot = () => {
    return MathHelper.calcEndPoint(this.pose, ROBOT_RADIUS * PIXEL_TO_CM_RATIO);
  };
}

// Infrared Sensor
export class IRSensor extends Sensor {
  constructor(pose: Pose, degreeOnRobot: number) {
    super(
      pose,
      IR_SENSOR_MEASUREMENT_LENGTH * PIXEL_TO_CM_RATIO,
      IR_SENSOR_COLOR,
      degreeOnRobot
    );
  }
}

// Ultrasonic Sensor (Proximity)
export class USSensor extends Sensor {
  constructor(pose: Pose, degreeOnRobot: number) {
    super(
      pose,
      US_SENSOR_MEASUREMENT_LENGTH * PIXEL_TO_CM_RATIO,
      US_SENSOR_COLOR,
      degreeOnRobot
    );
  }
}
