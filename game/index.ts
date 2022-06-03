import combinations from "combinations";
import { concat, filter, map as lodashMap } from "lodash";
import { Collision } from "../utils/collision";
import { Goal } from "./goal";
import { Map } from "./map";
import { CircleObstacle, DynamicObstacle, PolygonObstacle } from "./obstacles";
import { AlgorithmPayload, Robot } from "./robot";

export class Simulator {
  private robots: Robot[];
  private staticObstacles: PolygonObstacle[];
  private dynamicObstacles?: DynamicObstacle[]; // TODO: Make this at a later date
  private goals?: Goal[];
  private map: Map;

  constructor(map: Map) {
    const { robotStartPositions, staticObstacles, dynamicObstacles, goals } =
      map.unpack();
    this.goals = goals;
    this.robots = robotStartPositions.map((position, robotId) => {
      // Assign predefined goal to each robot if the goal exists
      if (this.getGoal(robotId)) {
        return new Robot(
          position,
          robotId,
          {
            regionNumber: robotId,
            regionPoints: this.map.unpack().regions[robotId],
          },
          this.getGoal(robotId)
        );
      }
      // Otherwise, no goal is needed
      return new Robot(position, robotId, {
        regionNumber: robotId,
        regionPoints: this.map.unpack().regions[robotId],
      });
    });
    this.staticObstacles = staticObstacles;
    this.dynamicObstacles = dynamicObstacles;
    this.map = map;
  }

  public unpack = () => {
    return {
      robots: this.robots,
      staticObstacles: this.staticObstacles,
      dynamicObstacles: this.dynamicObstacles,
      goals: this.goals,
      map: this.map,
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
      robot.updateSensors(this.staticObstacles);
    });
  };

  public checkForCollisions = () => {
    this.staticObstacles.forEach((obstacle, index) => {
      if (index == 0) return; // Skip past the first obstacle because that defines the boundaries of the environment
      this.robots.forEach((robot) => {
        if (
          Collision.circlePolygonIntersect(
            obstacle,
            new CircleObstacle(robot.getPose().getPoint(), Robot.RADIUS)
          )
        ) {
          console.log("Collision detected");
        }
      });
    });
  };

  public resolveCollision = () => {};

  public checkRobotGoals = () => {
    this.robots.forEach((robot) => {
      const robotCheckGoal = robot.checkGoal();
      if (robotCheckGoal !== null && this.goals) {
        console.log("Robot reached goal");
        this.goals = lodashMap(this.goals, (goal: Goal) => {
          if (goal.getRobotId() !== robotCheckGoal) {
            return goal;
          }
        }) as Goal[];
      }
    });
  };

  public getGoal = (idx: number) => {
    return filter(this.goals, (goal: Goal) => {
      return goal.getRobotId() === idx;
    })[0];
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
    // Clear signal overlaps
    this.robots.forEach((robot) => {
      robot.clearRobotsWithinSignalRange();
    });

    // Search for signal overlaps
    const indices = Array.from(Array(this.robots.length).keys());
    const combinationOfIndices = combinations(indices, 2, 2);
    combinationOfIndices.forEach(([first, second]) => {
      const firstRobot = this.robots[first];
      const secondRobot = this.robots[second];
      if (firstRobot.getSignal().isSignalWithinRange(secondRobot.getSignal())) {
        firstRobot.addRobotIdToSignalRange(secondRobot.getId());
        secondRobot.addRobotIdToSignalRange(firstRobot.getId());
      }
    });
  };
}
