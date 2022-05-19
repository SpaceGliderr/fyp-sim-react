import { Collision } from "../utils/collision";
import { Map } from "./map";
import { CircleObstacle, DynamicObstacle, PolygonObstacle } from "./obstacles";
import { Robot } from "./robot";

export class Simulator {
  private robots: Robot[];
  private staticObstacles: PolygonObstacle[];
  private dynamicObstacles?: DynamicObstacle[]; // TODO: Make this at a later date

  constructor(map: Map) {
    const { robotStartPositions, staticObstacles, dynamicObstacles } =
      map.unpack();
    this.robots = robotStartPositions.map((position) => new Robot(position));
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
}
