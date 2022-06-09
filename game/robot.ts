import { concat, filter, includes, indexOf, isEmpty, map, min } from "lodash";
import { CanvasHelper } from "../utils/canvas";
import { Line, Point, Pose, Vector } from "../utils/coordinates";
import { MathHelper } from "../utils/math";
import { Goal } from "./goal";
import { CircleObstacle, PolygonObstacle } from "./obstacles";
import { IRSensor, USSensor } from "./sensor";
import {
  DIFFERENCE_IN_TIME,
  IR_SENSOR_LOCS,
  LEADER_ROBOT_COLOR,
  MAX_WHEEL_DRIVE_RATES,
  PIXEL_TO_CM_RATIO,
  ROBOT_COLOR,
  ROBOT_FONT_SETTINGS,
  ROBOT_HEADING_COLOR,
  ROBOT_RADIUS,
  SIGNAL_CIRCLE_COLOR_RGB,
  SIGNAL_CIRCLE_OPACITY,
  US_SENSOR_LOCS,
  WHEEL_BASE_LENGTH_IN_PX,
  WHEEL_RADIUS_IN_PX,
} from "./settings";
import { Signal } from "./signal";

export enum RobotStatus {
  IDLE = "IDLE", // When the robot is not doing anything
  PROCESSING = "PROCESSING", // When the robot is processing data
  TRANSIT = "TRANSIT", // When the robot is moving from point A to point B
  COLLISION = "COLLISION", // When the robot is in collision with an obstacle
  MAPPING = "MAPPING", // When the robot is mapping
  MAPPING_COMPLETE = "MAPPING_COMPLETE", // When the robot has completed mapping
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

export type ActivityHistory = {
  timeTaken?: number | null; // in milliseconds, null means it was a permanent goal
  goal: Goal;
};

export type RobotConstructorArgs = {
  vector: Vector;
  id: number;
  leader: boolean;
  mappingGoals: Goal[];
  regionDetails?: { regionNumber: number; regionPoints: Point[] };
  goal?: Goal;
};

export class Robot extends CircleObstacle {
  public static readonly RADIUS = ROBOT_RADIUS * PIXEL_TO_CM_RATIO;
  // public static readonly COLOR = ROBOT_COLOR;
  public static readonly HEADING_COLOR = ROBOT_HEADING_COLOR;
  private pose: Pose;
  private irSensors: IRSensor[];
  private usSensors: USSensor[];
  private status: RobotStatus = RobotStatus.IDLE;
  private currentGoal: Goal | undefined = undefined; // A robot's current goal can be undefined
  private activityHistory: ActivityHistory[] = [];
  private id: number;
  private pidMetadata = {
    prev_eP: 0,
    prev_eI: 0,
  };
  private signal: Signal;
  private robotsWithinSignalRange: number[] = [];
  private regionNumber?: number;
  private regionPoints?: Point[];
  private previousPose: Pose;
  private robotColor: string;
  private mappingGoals: Goal[];
  private sensorReadings: Point[][] = [];
  private leader: boolean = false;

  constructor(
    vector: Vector,
    id: number,
    leader: boolean,
    mappingGoals: Goal[],
    regionDetails?: { regionNumber: number; regionPoints: Point[] },
    goal?: Goal
  ) {
    super(vector, Robot.RADIUS);
    this.pose = new Pose(vector, MathHelper.degToRad(Math.random() * 360)); // Spawn heading is random
    this.irSensors = leader
      ? []
      : IR_SENSOR_LOCS.map((loc) => {
          return new IRSensor(
            new Pose(vector, MathHelper.degToRad(loc) + this.pose.getTheta())
          );
        });
    this.usSensors = leader
      ? []
      : US_SENSOR_LOCS.map((loc) => {
          return new USSensor(
            new Pose(vector, MathHelper.degToRad(loc) + this.pose.getTheta())
          );
        });
    this.currentGoal = goal;
    this.id = id;
    this.signal = new Signal(vector);
    this.regionNumber = regionDetails?.regionNumber;
    this.regionPoints = regionDetails?.regionPoints;
    this.previousPose = this.pose;
    this.robotColor = leader ? LEADER_ROBOT_COLOR : ROBOT_COLOR;
    this.mappingGoals = mappingGoals;
    this.leader = leader;
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
    // Set previous pose
    this.previousPose = this.pose;
    // if (hasCollided) {}

    // Set new pose
    this.pose = pose;

    const point = this.pose.getPoint();

    // Update CircleObstacle position
    this.setPoint(point);
    this.signal.setPoint(point);

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

  public render = (isStatic: boolean = false) => {
    // Render robot
    CanvasHelper.drawArc(
      this.pose.getPoint(),
      Robot.RADIUS,
      this.robotColor,
      isStatic
    );

    // Render robot heading
    CanvasHelper.drawLine(
      new Line(
        this.pose.getPoint(),
        MathHelper.calcEndPoint(this.pose, Robot.RADIUS)
      ),
      Robot.HEADING_COLOR,
      isStatic
    );

    if (this.leader) {
      // Change text offsets to make it look better
    }

    CanvasHelper.drawText(
      this.getPoint(),
      this.id.toString(),
      -3.5,
      4.5,
      {
        fontSettings: ROBOT_FONT_SETTINGS,
      },
      isStatic
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

    // Render robot signal radius
    CanvasHelper.drawArc(
      this.signal.getPoint(),
      this.signal.getRadius(),
      `rgba(${SIGNAL_CIRCLE_COLOR_RGB[0]}, ${SIGNAL_CIRCLE_COLOR_RGB[1]}, ${SIGNAL_CIRCLE_COLOR_RGB[2]}, ${SIGNAL_CIRCLE_OPACITY})`,
      isStatic
    );
  };

  public updateSensors = (obstacles: PolygonObstacle[], robots: Robot[]) => {
    this.irSensors.forEach((sensor) => {
      sensor.measure(obstacles, robots, this.id);
    });

    this.usSensors.forEach((sensor) => {
      sensor.measure(obstacles, robots, this.id);
    });

    this.sensorReadings.push(this.getAllSensorReadings());
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

      this.activityHistory.push({
        goal: this.currentGoal,
        timeTaken: this.currentGoal.getTimeTaken(),
      });

      this.currentGoal = undefined;
    }
  };

  private goalNotReached = () => {
    if (this.currentGoal) {
      this.activityHistory.push({ goal: this.currentGoal });

      this.currentGoal = undefined;
    }
  };

  public checkGoal = () => {
    if (this.currentGoal && this.currentGoal.checkForCollisionWithRobot(this)) {
      this.goalReached();
      return this.id;
    } else if (this.currentGoal && this.currentGoal.isExpired()) {
      this.goalNotReached();
      return this.id;
    }
    return null;
  };

  public mappingGoalReached = () => {
    const newMappingGoals = this.mappingGoals;
    const removedMappingGoal = newMappingGoals.shift();
    this.mappingGoals = newMappingGoals;

    removedMappingGoal?.setStatusToReached();

    if (removedMappingGoal) {
      this.activityHistory.push({
        goal: removedMappingGoal,
        timeTaken: removedMappingGoal.getTimeTaken(),
      });
    }

    if (this.mappingGoals.length === 0) {
      this.setStatus(RobotStatus.MAPPING_COMPLETE);
    }

    return { id: this.id, removedMappingGoal };
  };

  public checkMappingGoal = () => {
    if (
      this.mappingGoals.length > 0 &&
      this.mappingGoals[0]?.checkForCollisionWithRobot(this)
    ) {
      return this.mappingGoalReached();
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
      (readings) => {
        return readings.reading !== null;
      }
    );
    const closestGoalPoint = this.getClosestGoalPoint();
    if (closestGoalPoint) {
      return {
        id: this.id,
        pose: this.pose,
        current_goal: closestGoalPoint,
        sensor_readings,
        pid_metadata: this.pidMetadata,
        robots_within_signal_range: this.robotsWithinSignalRange,
      };
    }
    return {
      id: this.id,
      pose: this.pose,
      sensor_readings,
      pid_metadata: this.pidMetadata,
      robots_within_signal_range: this.robotsWithinSignalRange,
    };
  };

  public getAllSensorReadings = () => {
    return filter(
      map(concat(this.irSensors, this.usSensors), (sensor) => {
        return sensor.getReading();
      }),
      (reading) => {
        return reading !== null;
      }
    ) as Point[];
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

  public getSignal = () => {
    return this.signal;
  };

  public addRobotIdToSignalRange = (robotId: number) => {
    this.robotsWithinSignalRange.push(robotId);
  };

  public clearRobotsWithinSignalRange = () => {
    this.robotsWithinSignalRange = [];
  };

  public getRobotsWithinSignalRange = () => {
    return this.robotsWithinSignalRange;
  };

  public getPreviousPose = () => {
    return this.previousPose;
  };

  public isWithinLeaderRobotRange = () => {
    return includes(this.robotsWithinSignalRange, -1);
  };
}

export class LeaderRobot extends Robot {
  private numberOfRegions: number;
  private regions: Point[][];

  constructor(
    robot: RobotConstructorArgs,
    numberOfRegions: number,
    regions: Point[][]
  ) {
    const { vector, id, leader, regionDetails, goal } = robot;
    super(vector, id, leader, [], regionDetails, goal);
    this.numberOfRegions = numberOfRegions;
    this.regions = regions;
  }
}
