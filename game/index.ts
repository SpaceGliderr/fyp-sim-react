import combinations from "combinations";
import { concat, filter, findIndex } from "lodash";
import { Collision } from "../utils/collision";
import { Point } from "../utils/coordinates";
import { Goal } from "./goal";
import { Map, MappingGoal } from "./map";
import { CircleObstacle, DynamicObstacle, PolygonObstacle } from "./obstacles";
import { AlgorithmPayload, LeaderRobot, Robot, RobotStatus } from "./robot";

export enum SimulatorAction {
  MAPPING = "MAPPING",
  MAPPING_COMPLETE = "MAPPING_COMPLETE",
  NAVIGATION = "NAVIGATION",
}

export class Simulator {
  private robots: Robot[];
  private staticObstacles: PolygonObstacle[];
  private dynamicObstacles?: DynamicObstacle[]; // TODO: Make this at a later date
  private goals?: Goal[];
  private map: Map;
  private leaderRobot: LeaderRobot;
  private action: SimulatorAction = SimulatorAction.MAPPING; // Default after initializing is mapping
  private mappingGoals: MappingGoal[];

  constructor(map: Map) {
    const {
      robotStartPositions,
      staticObstacles,
      dynamicObstacles,
      goals,
      regions,
      leaderRobotStartPosition,
      numberOfRegions,
      mappingGoals,
    } = map.unpack();
    this.goals = goals ?? [];
    this.mappingGoals = mappingGoals;
    this.robots = robotStartPositions.map((position, robotId) => {
      // Assign predefined goal to each robot if the goal exists
      if (this.getGoal(robotId)) {
        return new Robot(
          position,
          robotId,
          false,
          this.getMappingGoals(robotId),
          {
            regionNumber: robotId,
            regionPoints: regions[robotId],
          },
          this.getGoal(robotId)
        );
      }
      // Otherwise, no goal is needed
      return new Robot(
        position,
        robotId,
        false,
        this.getMappingGoals(robotId),
        {
          regionNumber: robotId,
          regionPoints: regions[robotId],
        },
        undefined
      );
    });
    this.staticObstacles = staticObstacles;
    this.dynamicObstacles = dynamicObstacles;
    this.map = map;
    this.leaderRobot = new LeaderRobot(
      {
        vector: new Point(
          leaderRobotStartPosition.getX(),
          leaderRobotStartPosition.getY()
        ),
        id: -1,
        leader: true,
        mappingGoals: [],
      },
      numberOfRegions,
      regions
    );
  }

  public unpack = () => {
    return {
      robots: this.robots,
      staticObstacles: this.staticObstacles,
      dynamicObstacles: this.dynamicObstacles,
      goals: this.goals,
      map: this.map,
      leaderRobot: this.leaderRobot,
      action: this.action,
    };
  };

  public getRobots = () => {
    return this.robots;
  };

  public renderStaticObstacles = () => {
    this.staticObstacles.forEach((obstacle) => {
      obstacle.render(true);
    });
  };

  public renderDynamicObstacles = () => {};

  public renderRobots = () => {
    this.robots.forEach((robot) => {
      robot.render();
    });
  };

  public readRobotSensors = () => {
    this.robots.forEach((robot) => {
      const robots = concat(this.robots, this.leaderRobot);
      robot.updateSensors(this.staticObstacles, robots);
    });
  };

  public renderLeaderRobot = () => {
    this.leaderRobot.render(true);
  };

  public checkForCollisions = () => {
    this.staticObstacles.forEach((obstacle, index) => {
      if (index == 0) return; // Skip past the first obstacle because that defines the boundaries of the environment
      this.robots.forEach((robot) => {
        if (
          Collision.circlePolygonIntersect(
            obstacle,
            new CircleObstacle(robot.getPose().getPoint(), Robot.RADIUS)
          ) ||
          !this.withinBoundaries(robot)
        ) {
          this.resolveCollision(robot);
        }
      });
    });
  };

  public withinBoundaries = (robot: Robot) => {
    const { radius, point } = robot.unpack();
    if (point.getX() - radius < 0) return false;
    if (point.getX() + radius > this.map.getWidth()) return false;
    if (point.getY() - radius < 0) return false;
    if (point.getY() + radius > this.map.getHeight()) return false;
    return true;
  };

  public resolveCollision = (robot: Robot) => {
    robot.setPose(robot.getPreviousPose());
    robot.setStatus(RobotStatus.COLLISION);
  };

  public checkRobotGoals = () => {
    this.robots.forEach((robot) => {
      const robotCheckGoal = robot.checkGoal();
      if (robotCheckGoal !== null && this.goals) {
        this.goals = filter(this.goals, (goal) => {
          if (goal.getRobotId() !== robotCheckGoal) {
            return goal;
          }
        }) as Goal[];
      }
    });
  };

  public checkRobotMappingGoals = () => {
    this.robots.forEach((robot) => {
      const robotCheckGoal = robot.checkMappingGoal();
      if (robotCheckGoal !== null && this.mappingGoals) {
        const { id, removedMappingGoal } = robotCheckGoal;
        const idxToRemove = findIndex(
          this.mappingGoals[id].goals,
          removedMappingGoal
        );
        this.mappingGoals = filter(this.mappingGoals, (mappingGoal) => {
          const { regionNumber, goals } = mappingGoal;
          if (regionNumber !== id) return mappingGoal;
          mappingGoal.goals = filter(goals, (goal, idx) => {
            if (idx !== idxToRemove) return goal;
          }) as Goal[];
          return mappingGoal;
        }) as MappingGoal[];
      }
    });
  };

  public getGoal = (idx: number) => {
    return filter(this.goals, (goal: Goal) => {
      return goal.getRobotId() === idx;
    })[0];
  };

  public getMappingGoals = (regionNumber: number) => {
    return filter(this.mappingGoals, (mappingGoal: MappingGoal) => {
      return mappingGoal.regionNumber === regionNumber;
    })[0].goals;
  };

  public getRobotById = (id: number) => {
    return filter(this.robots, (robot: Robot) => {
      return robot.getId() === id;
    })[0];
  };

  // This function is to supposed to be used by a JS worker running in intervals
  // The choice to use JS worker is to prevent the main thread from blocking
  private assignGoalToRobot = (goal: Goal) => {
    const robot = this.getRobotById(goal.getRobotId());
    robot.setCurrentGoal(goal);
  };

  public addGoals = (goals: Goal[]) => {
    goals.forEach((goal) => {
      this.assignGoalToRobot(goal);
    });

    if (goals !== undefined) {
      this.goals = concat(this.goals, goals) as Goal[];
    } else {
      this.goals = goals;
    }
  };

  public generatePayload = () => {
    // Generates the API payload for the algorithm to use
    const { width, height } = this.map.unpack();
    const robotPayload = this.robots.map((robot) => {
      return robot.generatePayload();
    });

    return {
      robots: robotPayload,
      environment: {
        width,
        height,
      },
    };
  };

  public execute = (payload: AlgorithmPayload[]) => {
    // Execute the algorithm payloads
    payload.forEach((p) => {
      const robot = this.getRobotById(p.robot_id);
      robot.execute(p);
    });
  };

  public searchForSignalOverlaps = () => {
    // Combine all the robots into a single array
    const robots = concat(this.robots, this.leaderRobot);

    // Clear signal overlaps
    robots.forEach((robot) => {
      robot.clearRobotsWithinSignalRange();
    });

    // Search for signal overlaps
    const indices = Array.from(Array(robots.length).keys());
    const combinationOfIndices = combinations(indices, 2, 2);
    combinationOfIndices.forEach(([first, second]) => {
      const firstRobot = robots[first];
      const secondRobot = robots[second];
      if (firstRobot.getSignal().isSignalWithinRange(secondRobot.getSignal())) {
        firstRobot.addRobotIdToSignalRange(secondRobot.getId());
        secondRobot.addRobotIdToSignalRange(firstRobot.getId());
      }
    });
  };

  public getLeaderRobot = () => {
    return this.leaderRobot;
  };

  public setActionToNavigation = () => {
    this.action = SimulatorAction.NAVIGATION;
  };

  public mapping = () => {
    this.mappingGoals.forEach(({ goals }) => {
      goals.forEach((goal) => {
        goal.render();
      });
    });

    this.checkRobotMappingGoals();

    if (this.mappingGoals.length === 0) {
      this.action = SimulatorAction.MAPPING_COMPLETE;
    }
  };

  public mapGenerated = () => {
    this.action = SimulatorAction.NAVIGATION;
  };

  public getAction = () => {
    return this.action;
  };
}
