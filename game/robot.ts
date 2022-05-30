import { concat, filter, indexOf, isEmpty, map, min } from "lodash";
import { CanvasHelper } from "../utils/canvas";
import { Line, Pose, Vector } from "../utils/coordinates";
import { MathHelper } from "../utils/math";
import { Goal } from "./goal";
import { CircleObstacle, PolygonObstacle } from "./obstacles";
import { IRSensor, USSensor } from "./sensor";
import {
  DIFFERENCE_IN_TIME,
  IR_SENSOR_LOCS,
  MAX_WHEEL_DRIVE_RATES,
  PIXEL_TO_CM_RATIO,
  ROBOT_COLOR,
  ROBOT_HEADING_COLOR,
  ROBOT_RADIUS,
  US_SENSOR_LOCS,
  WHEEL_BASE_LENGTH_IN_PX,
  WHEEL_RADIUS_IN_PX,
} from "./settings";

export enum RobotStatus {
  IDLE = "IDLE", // When the robot is not doing anything
  PROCESSING = "PROCESSING", // When the robot is processing data
  TRANSIT = "TRANSIT", // When the robot is moving from point A to point B
}

export type RobotPIDMetadata = {
  prev_eP: number;
  prev_eI: number;
};

export interface ExecutionPayload {}

export type AlgorithmPayload = {
  robot_id: number;
  type: number;
  payload: ExecutionPayload;
};

export interface GoToGoalPayload extends ExecutionPayload {
  steering_input: [number, number];
  pid_metadata: RobotPIDMetadata;
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
  private pidMetadata = {
    prev_eP: 0,
    prev_eI: 0,
  };

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

  public setPIDMetadata = (metadata: RobotPIDMetadata) => {
    this.pidMetadata = metadata;
  };

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
  public drive = (dL: number, dR: number) => {
    const driveRateL = Math.min(dL, MAX_WHEEL_DRIVE_RATES);
    const driveRateR = Math.min(dR, MAX_WHEEL_DRIVE_RATES);

    const dThetaL = driveRateL * DIFFERENCE_IN_TIME;
    const dThetaR = driveRateR * DIFFERENCE_IN_TIME;

    const wheelMetersPerRad = WHEEL_RADIUS_IN_PX;
    const dLeftWheel = dThetaL * wheelMetersPerRad;
    const dRightWheel = dThetaR * wheelMetersPerRad;
    const dCenter = (dLeftWheel + dRightWheel) / 2;

    const newX =
      this.pose.getPoint().getX() + dCenter * Math.cos(this.pose.getTheta());
    const newY =
      this.pose.getPoint().getY() + dCenter * Math.sin(this.pose.getTheta());
    const newTheta =
      this.pose.getTheta() +
      (dLeftWheel - dRightWheel) / WHEEL_BASE_LENGTH_IN_PX;

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

  public getClosestGoalPoint = () => {
    if (this.currentGoal) {
      const distances = this.currentGoal.getPoints().map((point) => {
        return this.pose.getPoint().distanceTo(point);
      });
      return this.currentGoal.getPoints()[indexOf(distances, min(distances))];
    }
    return undefined;
  };

  public getId = () => {
    return this.id;
  };

  public generatePayload = () => {
    const sensor_readings = filter(
      map(concat(this.irSensors, this.usSensors), (sensor) => {
        return { reading: sensor.getReading() };
      }),
      isEmpty
    );
    const closestGoalPoint = this.getClosestGoalPoint();
    if (closestGoalPoint) {
      return {
        id: this.id,
        pose: this.pose,
        current_goal: closestGoalPoint,
        sensor_readings,
        pid_metadata: this.pidMetadata,
      };
    }
    return {
      id: this.id,
      pose: this.pose,
      sensor_readings,
      pid_metadata: this.pidMetadata,
    };
  };

  public execute = (algorithmPayload: AlgorithmPayload) => {
    const { type, payload } = algorithmPayload;

    if (payload === null) return;

    switch (type) {
      case 1: // Go To Goal behavior
        const { steering_input, pid_metadata } = payload as GoToGoalPayload;
        this.drive(steering_input[0], steering_input[1]);
        this.setPIDMetadata(pid_metadata);
        break;

      case 2: // Follow wall behavior
        break;

      case 3: // Avoid obstacle behavior
        break;

      default:
        break;
    }
  };
}
