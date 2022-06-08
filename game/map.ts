import { Point } from "../utils/coordinates";
import { Goal } from "./goal";
import { DynamicObstacle, PolygonObstacle } from "./obstacles";

export type MappingGoal = {
  goals: Goal[];
  regionNumber: number; // Follows the index number of the region in the regions array
};

export type MapTemplate = {
  width: number;
  height: number;
  robotCount: number; // Number of robots for the map
  robotStartPositions: Point[]; // Starting positions for the robots, must be same length as robotCount variable
  staticObstacles: PolygonObstacle[];
  dynamicObstacles?: DynamicObstacle[]; // A map may or may not have dynamic obstacles
  goals?: Goal[]; // A map may or may not have goals
  regions: Point[][]; // A map has more than one regions
  numberOfRegions: number; // Number of regions for the map
  leaderRobotStartPosition: Point; // Starting position for the leader robot
  mappingGoals: MappingGoal[]; // Goals for the mapping phase
};

export class Map {
  private staticObstacles: PolygonObstacle[] = [];
  private dynamicObstacles: DynamicObstacle[] = []; // TODO: Implement dynamic obstacles in the future
  private robotCount: number;
  private robotStartPositions: Point[];
  private width: number;
  private height: number;
  private goals?: Goal[] = [];
  private regions: Point[][] = [];
  private numberOfRegions: number;
  private leaderRobotStartPosition: Point;
  private mappingGoals: MappingGoal[];

  constructor(map: MapTemplate) {
    this.robotCount = map.robotCount;
    this.robotStartPositions = map.robotStartPositions;
    this.staticObstacles = map.staticObstacles;
    this.width = map.width;
    this.height = map.height;
    this.goals = map.goals;
    this.regions = map.regions;
    this.numberOfRegions = map.numberOfRegions;
    this.leaderRobotStartPosition = map.leaderRobotStartPosition;
    this.mappingGoals = map.mappingGoals;
  }

  public getWidth = () => {
    return this.width;
  };

  public getHeight = () => {
    return this.height;
  };

  public unpack = () => {
    return {
      robotCount: this.robotCount,
      robotStartPositions: this.robotStartPositions,
      staticObstacles: this.staticObstacles,
      dynamicObstacles: this.dynamicObstacles,
      width: this.width,
      height: this.height,
      goals: this.goals,
      regions: this.regions,
      numberOfRegions: this.numberOfRegions,
      leaderRobotStartPosition: this.leaderRobotStartPosition,
      mappingGoals: this.mappingGoals,
    };
  };
}
