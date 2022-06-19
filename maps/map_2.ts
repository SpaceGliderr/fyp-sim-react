import { Goal, GoalShape } from "../game/goal";
import { MapTemplate } from "../game/map";
import { PolygonObstacle } from "../game/obstacles";
import { Region } from "../game/region";
import { Point } from "../utils/coordinates";

// ========================= DESCRIPTION OF THE MAP =========================
// 1. What type of obstacles are there in the map environment?
// 2. Where are the permissible spawn locations of the robots?
// 3. What is the map trying to test?

// ========================== MAP TEMPLATE ===================================
const STATIC_OBSTACLE_COLOR: string = "#5c5756";
const WIDTH: number = 840;
const HEIGHT: number = 640;

export const MAP_2: MapTemplate = {
  width: WIDTH,
  height: HEIGHT,
  robotCount: 2,
  robotStartPositions: [new Point(260, 440), new Point(780, 420)],
  staticObstacles: [
    // The first obstacle is the boundary for the map
    new PolygonObstacle([
      new Point(0, 0),
      new Point(0, HEIGHT),
      new Point(WIDTH, HEIGHT),
      new Point(WIDTH, 0),
    ]),
    new PolygonObstacle(
      [
        new Point(0, 80),
        new Point(90, 80),
        new Point(90, 330),
        new Point(0, 330),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(120, 140),
        new Point(170, 140),
        new Point(170, 280),
        new Point(120, 280),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(240, 0),
        new Point(420, 0),
        new Point(420, 340),
        new Point(240, 340),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(420, 0),
        new Point(480, 0),
        new Point(480, 420),
        new Point(420, 420),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(40, 380),
        new Point(100, 380),
        new Point(100, 440),
        new Point(40, 440),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(140, 560),
        new Point(420, 560),
        new Point(420, 640),
        new Point(140, 640),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(420, 520),
        new Point(480, 520),
        new Point(480, 640),
        new Point(420, 640),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(570, 0),
        new Point(750, 0),
        new Point(750, 80),
        new Point(570, 80),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(580, 320),
        new Point(740, 320),
        new Point(740, 380),
        new Point(580, 380),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(580, 480),
        new Point(840, 480),
        new Point(840, 520),
        new Point(580, 520),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(580, 600),
        new Point(620, 600),
        new Point(620, 640),
        new Point(580, 640),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(640, 600),
        new Point(740, 600),
        new Point(740, 640),
        new Point(640, 640),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(760, 580),
        new Point(840, 580),
        new Point(840, 640),
        new Point(760, 640),
      ],
      STATIC_OBSTACLE_COLOR
    ),
  ],
  regions: [
    new Region(
      0,
      [
        new Point(0, 0),
        new Point(480, 0),
        new Point(480, 640),
        new Point(0, 640),
      ],
      [new Point(480, 470)],
      [1]
    ),
    new Region(
      1,
      [
        new Point(480, 0),
        new Point(840, 0),
        new Point(840, 640),
        new Point(480, 640),
      ],
      [new Point(480, 470)],
      [1]
    ),
  ],
  numberOfRegions: 2,
  leaderRobotStartPosition: new Point(500, 260),
  mappingGoals: [
    {
      regionNumber: 0,
      goals: [
        new Goal([new Point(20, 480)], GoalShape.CIRCLE, 0, 7),
        new Goal([new Point(460, 480)], GoalShape.CIRCLE, 0, 7),
        new Goal([new Point(300, 420)], GoalShape.CIRCLE, 0, 7),
        new Goal([new Point(160, 360)], GoalShape.CIRCLE, 0, 7),
        new Goal([new Point(210, 200)], GoalShape.CIRCLE, 0, 7),
        new Goal([new Point(150, 80)], GoalShape.CIRCLE, 0, 7),
        new Goal([new Point(40, 40)], GoalShape.CIRCLE, 0, 7),
      ],
    },
    {
      regionNumber: 1,
      goals: [
        new Goal([new Point(800, 360)], GoalShape.CIRCLE, 1, 7),
        new Goal([new Point(660, 200)], GoalShape.CIRCLE, 1, 7),
        new Goal([new Point(800, 40)], GoalShape.CIRCLE, 1, 7),
        new Goal([new Point(520, 40)], GoalShape.CIRCLE, 1, 7),
        new Goal([new Point(520, 360)], GoalShape.CIRCLE, 1, 7),
        new Goal([new Point(660, 440)], GoalShape.CIRCLE, 1, 7),
        new Goal([new Point(520, 520)], GoalShape.CIRCLE, 1, 7),
        new Goal([new Point(630, 560)], GoalShape.CIRCLE, 1, 7),
        new Goal([new Point(800, 540)], GoalShape.CIRCLE, 1, 7),
      ],
    },
  ],
};
