import { concat, filter, includes, indexOf, isEmpty, map, min } from "lodash";
import { SimulatorAction } from ".";
import { CanvasHelper } from "../utils/canvas";
import { Line, Point, Pose, Vector } from "../utils/coordinates";
import { MathHelper } from "../utils/math";
import { Goal } from "./goal";
import { CircleObstacle, PolygonObstacle } from "./obstacles";
import { IRSensor, USSensor } from "./sensor";
import {
  CLOSE_DISTANCE_IN_PX,
  DIFFERENCE_IN_TIME,
  FRONT_FACING_SENSOR_LOCS,
  IR_SENSOR_LOCS,
  LEADER_ROBOT_COLOR,
  MAX_WHEEL_DRIVE_RATES,
  OBSTACLE_DETECTION_SENSOR_LOCS,
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
  FIND_LEADER = "FIND_LEADER", // When the robot is finding the leader
  NAVIGATION = "NAVIGATION", // When the robot is navigating
}

export enum RobotControllers {
  GO_TO_GOAL = "GO_TO_GOAL",
  AVOID_OBSTACLES = "AVOID_OBSTACLES",
  FOLLOW_WALL = "FOLLOW_WALL",
}

export type RobotPIDMetadata = {
  prev_eP: number;
  prev_eI: number;
};

export interface ExecutionPayload {
  steering_input: [number, number];
  pid_metadata: RobotPIDMetadata;
}

export type AlgorithmPayload = {
  robot_id: number;
  type: number;
  payload: ExecutionPayload;
};

export type ActivityHistory = {
  timeTaken?: number | null; // in milliseconds, null means it was a permanent goal
  goal: Goal;
};

export type RobotConstructorArgs = {
  vector: Vector;
  id: number;
  leader: boolean;
  mappingGoals: Goal[];
  leaderPosition: Point;
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
  private status: RobotStatus = RobotStatus.MAPPING; // TODO: Change this back to IDLE once debugging is done with mapping
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
  private sensorReadings: Point[] = [];
  private leader: boolean = false;
  private currentController: RobotControllers = RobotControllers.GO_TO_GOAL;
  private isCurrentlyMapping: boolean = false;
  private leaderPosition: Point;

  constructor(
    vector: Vector,
    id: number,
    leader: boolean,
    mappingGoals: Goal[],
    leaderPosition: Point,
    regionDetails?: { regionNumber: number; regionPoints: Point[] },
    goal?: Goal
  ) {
    super(vector, Robot.RADIUS);
    this.pose = new Pose(vector, MathHelper.degToRad(Math.random() * 360)); // Spawn heading is random
    this.irSensors = leader
      ? []
      : IR_SENSOR_LOCS.map((loc) => {
          return new IRSensor(
            new Pose(vector, MathHelper.degToRad(loc) + this.pose.getTheta()),
            loc
          );
        });
    this.usSensors = leader
      ? []
      : US_SENSOR_LOCS.map((loc) => {
          return new USSensor(
            new Pose(vector, MathHelper.degToRad(loc) + this.pose.getTheta()),
            loc
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
    this.leaderPosition = leaderPosition;
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
    // if (this.previousPose === pose) return;

    // Set previous pose
    this.previousPose = this.pose;
    // if (hasCollided) {}

    // Set new pose
    this.pose = pose;

    const point = this.pose.getPoint();

    // Update CircleObstacle position
    this.setPoint(point);
    this.signal.setPoint(point);

    // TODO: Fix this
    this.irSensors = IR_SENSOR_LOCS.map((loc) => {
      return new IRSensor(
        new Pose(
          this.pose.getPoint(),
          MathHelper.degToRad(loc) + this.pose.getTheta()
        ),
        loc
      );
    });
    this.usSensors = US_SENSOR_LOCS.map((loc) => {
      return new USSensor(
        new Pose(
          this.pose.getPoint(),
          MathHelper.degToRad(loc) + this.pose.getTheta()
        ),
        loc
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
      // TODO: Change text offsets to make it look better
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

    if (this.isCurrentlyMapping) {
      this.sensorReadings = this.sensorReadings.concat(
        this.getAllSensorReadings()
      );
    }
  };

  public getSensorReadings = () => {
    return this.sensorReadings;
  };

  // Moves using differential drive mechanics
  public drive = (dL: number, dR: number) => {
    // let driveRateL = Math.min(dL, MAX_WHEEL_DRIVE_RATES);
    // let driveRateR = Math.min(dR, MAX_WHEEL_DRIVE_RATES);

    // driveRateL = Math.max(driveRateL, -MAX_WHEEL_DRIVE_RATES);
    // driveRateR = Math.max(driveRateR, -MAX_WHEEL_DRIVE_RATES);

    const dThetaL = dL * DIFFERENCE_IN_TIME;
    const dThetaR = dR * DIFFERENCE_IN_TIME;

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
      (dRightWheel - dLeftWheel) / WHEEL_BASE_LENGTH_IN_PX;

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

    this.resetPidMetadata();

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

  public calculateDistanceOfSensorReadings = (readings: Point[]) => {
    readings.map((reading) => {
      return this.pose.getPoint().distanceTo(reading);
    });
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
    const front_sensor_distances = this.getAllFrontSensorDistances();
    const closestGoalPoint = this.getClosestGoalPoint();
    const ir_sensors = this.getIRSensors();

    const payload = {
      id: this.id,
      pose: this.pose,
      sensor_readings,
      pid_metadata: this.pidMetadata,
      robots_within_signal_range: this.robotsWithinSignalRange,
      mapping_goals: this.mappingGoals.map((goal) => {
        return goal.getPoints()[0];
      }),
      status: this.status,
      current_controller: this.currentController,
      front_sensor_distances,
      ir_sensors,
      leader_position: this.leaderPosition,
    };
    if (closestGoalPoint) {
      return {
        current_goal: closestGoalPoint,
        ...payload,
      };
    }
    return payload;
  };

  public getIRSensors = () => {
    return map(this.irSensors, (sensor) => {
      // const val = {
      //   sensor_location: sensor.getDegreeOnRobot(),
      // };

      if (sensor.getReading() !== null) {
        return {
          reading: sensor.getReading(),
          // ...val,
        };
      } else {
        return {
          reading: sensor.getEmptyReading(),
          // ...val,
        };
      }
    });
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

  public getAllFrontSensorDistances = () => {
    return filter(
      map(concat(this.irSensors, this.usSensors), (sensor) => {
        if (
          OBSTACLE_DETECTION_SENSOR_LOCS.includes(sensor.getDegreeOnRobot())
        ) {
          return sensor.getDistanceOfReading();
        }
      }),
      (reading) => {
        return reading !== null && reading !== undefined;
      }
    ) as number[];
  };

  public isRobotCloseToObstacle = () => {
    let isCloseToObstacle = false;

    concat(this.irSensors, this.usSensors).forEach((sensor) => {
      if (OBSTACLE_DETECTION_SENSOR_LOCS.includes(sensor.getDegreeOnRobot())) {
        if (sensor.getDistanceOfReading() <= CLOSE_DISTANCE_IN_PX) {
          isCloseToObstacle = true;
        }
      }
    });

    return isCloseToObstacle;
  };

  public execute = (algorithmPayload: AlgorithmPayload) => {
    const { type, payload } = algorithmPayload;

    if (payload === null) return;

    const { steering_input, pid_metadata } = payload as ExecutionPayload;

    switch (type) {
      case 1: // Go To Goal behavior
        this.drive(steering_input[0], steering_input[1]);
        this.setPIDMetadata(pid_metadata);
        this.setCurrentController(RobotControllers.GO_TO_GOAL);
        break;

      case 2: // Follow wall behavior
        break;

      case 3: // Avoid obstacle behavior
        this.drive(steering_input[0], steering_input[1]);
        this.setPIDMetadata(pid_metadata);
        this.setCurrentController(RobotControllers.AVOID_OBSTACLES);
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

  public setStatusOnSimAction = (action: SimulatorAction) => {
    switch (action) {
      case SimulatorAction.MAPPING:
        this.setStatus(RobotStatus.MAPPING);
        break;

      default:
        break;
    }
  };

  public resetPidMetadata = () => {
    this.pidMetadata = {
      prev_eP: 0,
      prev_eI: 0,
    };
  };

  public setCurrentController = (controller: RobotControllers) => {
    this.currentController = controller;
  };

  public getIsCurrentlyMapping = () => {
    return this.isCurrentlyMapping;
  };

  public setIsCurrentlyMapping = (isCurrentlyMapping: boolean) => {
    this.isCurrentlyMapping = isCurrentlyMapping;
  };

  public isLeader = () => {
    return this.leader;
  };
}

export type SensorReadingsPerRegion = {
  regionNumber: number;
  sensorReadings: Point[];
};

export class LeaderRobot extends Robot {
  private numberOfRegions: number;
  private regions: Point[][];
  private sensorReadingsPerRegion: SensorReadingsPerRegion[];

  constructor(
    robot: RobotConstructorArgs,
    numberOfRegions: number,
    regions: Point[][]
  ) {
    const { vector, id, leader, leaderPosition, regionDetails, goal } = robot;
    super(vector, id, leader, [], leaderPosition, regionDetails, goal);
    this.numberOfRegions = numberOfRegions;
    this.regions = regions;
    this.sensorReadingsPerRegion = this.initSensorReadingsPerRegion();
  }

  public initSensorReadingsPerRegion = () => {
    const sensorReadingsPerRegion = [];
    for (let i = 0; i < this.numberOfRegions; i++) {
      sensorReadingsPerRegion.push({
        regionNumber: i,
        sensorReadings: [],
      });
    }
    return sensorReadingsPerRegion;
  };

  public transferSensorReadingData = (robot: Robot) => {
    this.sensorReadingsPerRegion.forEach((region) => {
      if (robot.getId() === region.regionNumber) {
        region.sensorReadings = robot.getSensorReadings();
      }
    });
  };

  public generateMappingPayload = (width: number, height: number) => {
    return {
      width,
      height,
      number_of_regions: this.numberOfRegions,
      regions: this.regions,
      sensor_readings_per_region: this.sensorReadingsPerRegion.map(
        (reading) => {
          return {
            region_number: reading.regionNumber,
            sensor_readings: reading.sensorReadings,
          };
        }
      ),
    };
  };
}
