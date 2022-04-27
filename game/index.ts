import { Map } from "./map";
import { DynamicObstacle, PolygonObstacle } from "./obstacles";
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

  public renderStaticObstacles = () => {
    this.staticObstacles.forEach((obstacle) => {
      obstacle.render(true);
    });
  };

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
}
