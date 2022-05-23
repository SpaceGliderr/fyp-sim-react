import { CanvasHelper } from "../utils/canvas";
import { Line, Pose, Vector } from "../utils/coordinates";
import { MathHelper } from "../utils/math";
import { Goal } from "./goal";
import { CircleObstacle, PolygonObstacle } from "./obstacles";
import { IRSensor, USSensor } from "./sensor";
import {
  IR_SENSOR_LOCS,
  PIXEL_TO_CM_RATIO,
  ROBOT_COLOR,
  ROBOT_HEADING_COLOR,
  ROBOT_RADIUS,
  US_SENSOR_LOCS,
} from "./settings";

export enum RobotStatus {
  IDLE = "IDLE", // When the robot is not doing anything
  PROCESSING = "PROCESSING", // When the robot is processing data
  TRANSIT = "TRANSIT", // When the robot is moving from point A to point B
}

export class Robot extends CircleObstacle {
  public static readonly RADIUS = ROBOT_RADIUS * PIXEL_TO_CM_RATIO;
  public static readonly COLOR = ROBOT_COLOR;
  public static readonly HEADING_COLOR = ROBOT_HEADING_COLOR;
  private pose: Pose;
  private irSensors: IRSensor[];
  private usSensors: USSensor[];
  private status: RobotStatus = RobotStatus.IDLE;
  private currentGoal: Goal | undefined = undefined; // A robot's current goal can be undefined
  private activityHistory: Goal[] = [];
  private id: number;

  constructor(vector: Vector, id: number, goal?: Goal) {
    super(vector, ROBOT_RADIUS);
    this.pose = new Pose(vector, MathHelper.degToRad(Math.random() * 360)); // Spawn heading is random
    this.irSensors = IR_SENSOR_LOCS.map((loc) => {
      return new IRSensor(
        new Pose(vector, MathHelper.degToRad(loc) + this.pose.getTheta())
      );
    });
    this.usSensors = US_SENSOR_LOCS.map((loc) => {
      return new USSensor(
        new Pose(vector, MathHelper.degToRad(loc) + this.pose.getTheta())
      );
    });
    this.currentGoal = goal;
    this.id = id;
  }

  public setStatus = (status: RobotStatus) => {
    this.status = status;
  };

  public getStatus = () => {
    return this.status;
  };

  public setPose = (pose: Pose) => {
    this.pose = pose;

    // Update sensor bearings based on the new pose
    this.irSensors = IR_SENSOR_LOCS.map((loc) => {
      return new IRSensor(
        new Pose(
          this.pose.getPoint(),
          MathHelper.degToRad(loc) + this.pose.getTheta()
        )
      );
    });
    this.usSensors = US_SENSOR_LOCS.map((loc) => {
      return new USSensor(
        new Pose(
          this.pose.getPoint(),
          MathHelper.degToRad(loc) + this.pose.getTheta()
        )
      );
    });
  };

  public getPose = () => {
    return this.pose;
  };

  public getSensors = () => {
    return {
      irSensors: this.irSensors,
      usSensors: this.usSensors,
    };
  };

  public render = () => {
    // Render robot
    CanvasHelper.drawArc(this.pose.getPoint(), Robot.RADIUS, Robot.COLOR);

    // Render robot heading
    CanvasHelper.drawLine(
      new Line(
        this.pose.getPoint(),
        MathHelper.calcEndPoint(this.pose, Robot.RADIUS)
      ),
      Robot.HEADING_COLOR
    );

    // Render robot sensor
    this.irSensors.forEach((sensor) => {
      sensor.render();
    });

    this.usSensors.forEach((sensor) => {
      sensor.render();
    });

    // Render robot goal
    if (this.currentGoal) {
      this.currentGoal.render();
    }
  };

  public updateSensors = (obstacles: PolygonObstacle[]) => {
    this.irSensors.forEach((sensor) => {
      sensor.measure(obstacles);
    });

    this.usSensors.forEach((sensor) => {
      sensor.measure(obstacles);
    });
  };

  // Moves using differential drive mechanics
  public drive = (dt: number, driveRateL: number, driveRateR: number) => {
    const dTheta = MathHelper.degToRad(dt);

    const dThetaL = driveRateL * dTheta;
    const dThetaR = driveRateR * dTheta;

    const wheelMetersPerRad = 0.5;
    const dLeftWheel = dThetaL * wheelMetersPerRad;
    const dRightWheel = dThetaR * wheelMetersPerRad;
    const dCenter = (dLeftWheel + dRightWheel) / 2;

    const newX =
      this.pose.getPoint().getX() + dCenter * Math.cos(this.pose.getTheta());
    const newY =
      this.pose.getPoint().getY() + dCenter * Math.sin(this.pose.getTheta());
    const newTheta = this.pose.getTheta() + (dRightWheel - dLeftWheel) / 1;

    this.setPose(new Pose(new Vector(newX, newY), newTheta));
  };

  private goalReached = () => {
    if (this.currentGoal) {
      this.currentGoal.setStatusToReached();

      this.activityHistory.push(this.currentGoal);

      this.currentGoal = undefined;
    }
  };

  public checkGoal = () => {
    if (this.currentGoal && this.currentGoal.checkForCollisionWithRobot(this)) {
      this.goalReached();
      return this.id;
    }
    return null;
  };

  public setCurrentGoal = (currentGoal: Goal) => {
    this.currentGoal = currentGoal;
  };

  public getCurrentGoal = () => {
    return this.currentGoal;
  };

  public getId = () => {
    return this.id;
  };
}
