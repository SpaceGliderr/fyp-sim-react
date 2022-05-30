import { CanvasHelper } from "../utils/canvas";
import { Line, Point, Pose } from "../utils/coordinates";
import { MathHelper } from "../utils/math";
import { PolygonObstacle } from "./obstacles";
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

  constructor(pose: Pose, mLen: number, color: string) {
    this.pose = pose;
    this.mLen = mLen;
    this.color = color;
  }

  public setReading = (newReading: Point) => {
    if (this.reading === null) {
      this.reading = newReading;
      return;
    }

    if (
      this.pose.getPoint().distanceTo(newReading) <
      this.pose.getPoint().distanceTo(this.reading)
    ) {
      this.reading = newReading;
      return;
    }
  };

  public clearReading = () => {
    this.reading = null;
  };

  public getReading = () => {
    return this.reading;
  };

  public getMLen = () => {
    return this.mLen;
  };

  public measure = (obstacles: PolygonObstacle[]) => {
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
}

// Infrared Sensor
export class IRSensor extends Sensor {
  constructor(pose: Pose) {
    super(
      pose,
      IR_SENSOR_MEASUREMENT_LENGTH * PIXEL_TO_CM_RATIO,
      IR_SENSOR_COLOR
    );
  }
}

// Ultrasonic Sensor (Proximity)
export class USSensor extends Sensor {
  constructor(pose: Pose) {
    super(
      pose,
      US_SENSOR_MEASUREMENT_LENGTH * PIXEL_TO_CM_RATIO,
      US_SENSOR_COLOR
    );
  }
}
