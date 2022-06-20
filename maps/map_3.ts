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
const WIDTH: number = 1120;
const HEIGHT: number = 760;

export const MAP_3: MapTemplate = {
  width: WIDTH,
  height: HEIGHT,
  robotCount: 3,
  robotStartPositions: [
    new Point(560, 60),
    new Point(460, 440),
    new Point(1020, 480),
  ],
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
        new Point(100, 0),
        new Point(300, 0),
        new Point(300, 40),
        new Point(100, 40),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(140, 100),
        new Point(240, 100),
        new Point(240, 160),
        new Point(140, 160),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(60, 220),
        new Point(100, 220),
        new Point(100, 260),
        new Point(60, 260),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(140, 240),
        new Point(280, 240),
        new Point(280, 300),
        new Point(140, 300),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(0, 300),
        new Point(420, 300),
        new Point(420, 340),
        new Point(0, 340),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [new Point(360, 340), new Point(400, 340), new Point(360, 360)],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(0, 340),
        new Point(360, 340),
        new Point(360, 400),
        new Point(0, 400),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(340, 220),
        new Point(380, 220),
        new Point(380, 260),
        new Point(340, 260),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(0, 460),
        new Point(60, 460),
        new Point(60, 520),
        new Point(0, 520),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(0, 540),
        new Point(360, 540),
        new Point(360, 740),
        new Point(0, 740),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(460, 660),
        new Point(560, 660),
        new Point(560, 760),
        new Point(460, 760),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(520, 300),
        new Point(560, 300),
        new Point(560, 340),
        new Point(520, 340),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(560, 300),
        new Point(620, 300),
        new Point(620, 760),
        new Point(560, 760),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(580, 220),
        new Point(880, 220),
        new Point(880, 300),
        new Point(580, 300),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(620, 300),
        new Point(1000, 300),
        new Point(1000, 340),
        new Point(620, 340),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(740, 40),
        new Point(800, 40),
        new Point(800, 80),
        new Point(740, 80),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(840, 0),
        new Point(1120, 0),
        new Point(1120, 100),
        new Point(840, 100),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(1080, 300),
        new Point(1120, 300),
        new Point(1120, 340),
        new Point(1080, 340),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(640, 420),
        new Point(720, 420),
        new Point(720, 680),
        new Point(640, 680),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(720, 480),
        new Point(780, 480),
        new Point(780, 620),
        new Point(720, 620),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [new Point(720, 420), new Point(780, 480), new Point(720, 480)],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [new Point(720, 620), new Point(780, 620), new Point(720, 680)],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(840, 480),
        new Point(900, 480),
        new Point(900, 620),
        new Point(840, 620),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(1000, 640),
        new Point(1060, 640),
        new Point(1060, 700),
        new Point(1000, 700),
      ],
      STATIC_OBSTACLE_COLOR
    ),
  ],
  regions: [
    new Region(
      0,
      [
        new Point(0, 0),
        new Point(1120, 0),
        new Point(1120, 300),
        new Point(0, 300),
      ],
      [new Point(470, 300), new Point(1040, 300)],
      [1, 2]
    ),
    new Region(
      1,
      [
        new Point(0, 300),
        new Point(590, 300),
        new Point(590, 760),
        new Point(0, 760),
      ],
      [new Point(470, 300)],
      [0]
    ),
    new Region(
      2,
      [
        new Point(590, 300),
        new Point(1120, 300),
        new Point(1120, 760),
        new Point(590, 760),
      ],
      [new Point(1040, 300)],
      [0]
    ),
  ],
  numberOfRegions: 3,
  leaderRobotStartPosition: new Point(580, 190),
  mappingGoals: [
    {
      regionNumber: 0,
      goals: [
        new Goal([new Point(680, 20)], GoalShape.CIRCLE, 0, 7),
        new Goal([new Point(820, 120)], GoalShape.CIRCLE, 0, 7),
        new Goal([new Point(980, 200)], GoalShape.CIRCLE, 0, 7),
        new Goal([new Point(480, 160)], GoalShape.CIRCLE, 0, 7),
        new Goal([new Point(360, 60)], GoalShape.CIRCLE, 0, 7),
        new Goal([new Point(300, 180)], GoalShape.CIRCLE, 0, 7),
        new Goal([new Point(300, 260)], GoalShape.CIRCLE, 0, 7),
        new Goal([new Point(100, 200)], GoalShape.CIRCLE, 0, 7),
        new Goal([new Point(60, 60)], GoalShape.CIRCLE, 0, 7),
        new Goal([new Point(20, 280)], GoalShape.CIRCLE, 0, 7),
      ],
    },
    {
      regionNumber: 1,
      goals: [
        new Goal([new Point(460, 460)], GoalShape.CIRCLE, 1, 7),
        new Goal([new Point(220, 520)], GoalShape.CIRCLE, 1, 7),
        new Goal([new Point(30, 430)], GoalShape.CIRCLE, 1, 7),
        new Goal([new Point(400, 740)], GoalShape.CIRCLE, 1, 7),
      ],
    },
    {
      regionNumber: 2,
      goals: [
        new Goal([new Point(1040, 420)], GoalShape.CIRCLE, 2, 7),
        new Goal([new Point(700, 380)], GoalShape.CIRCLE, 2, 7),
        new Goal([new Point(810, 550)], GoalShape.CIRCLE, 2, 7),
        new Goal([new Point(720, 720)], GoalShape.CIRCLE, 2, 7),
        new Goal([new Point(1090, 730)], GoalShape.CIRCLE, 2, 7),
      ],
    },
  ],
};
