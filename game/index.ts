import { filter, remove } from "lodash";
import { Collision } from "../utils/collision";
import { Point } from "../utils/coordinates";
import { Goal, GoalShape } from "./goal";
import { Map } from "./map";
import { CircleObstacle, DynamicObstacle, PolygonObstacle } from "./obstacles";
import { Robot, RobotStatus } from "./robot";

export class Simulator {
  private robots: Robot[];
  private staticObstacles: PolygonObstacle[];
  private dynamicObstacles?: DynamicObstacle[]; // TODO: Make this at a later date
  private goals?: Goal[];

  constructor(map: Map) {
    const { robotStartPositions, staticObstacles, dynamicObstacles, goals } =
      map.unpack();
    this.goals = goals;
    this.robots = robotStartPositions.map((position, robotId) => {
      // Assign predefined goal to each robot if the goal exists
      if (this.getGoal(robotId)) {
        return new Robot(position, robotId, this.getGoal(robotId));
      }
      // Otherwise, no goal is needed
      return new Robot(position, robotId);
    });
    this.staticObstacles = staticObstacles;
    this.dynamicObstacles = dynamicObstacles;
  }

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
        remove(this.goals, robotCheckGoal);
      }
    });
  };

  public getGoal = (idx: number) => {
    return filter(this.goals, (goal: Goal) => {
      return goal.getRobotId() === idx;
    })[0];
  };

  // This function is to supposed to be used by a JS worker running in intervals
  // The choice to use JS worker is to prevent the main thread from blocking
  public assignGoalToRobot = () => {
    this.robots.forEach((robot) => {
      if (
        robot.getStatus() === RobotStatus.IDLE &&
        robot.getCurrentGoal() === null
      ) {
        robot.setGoal(this.generateGoal(robot.getId()));
      }
    });
  };

  private generateGoal = (robotId: number) => {
    // TODO: Must generate a goal where no static obstacle lies
    return new Goal([new Point(0, 0)], GoalShape.CIRCLE, robotId, 0);
  };
}
