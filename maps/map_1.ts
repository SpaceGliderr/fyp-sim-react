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
const WIDTH: number = 1400;
const HEIGHT: number = 900;

export const MAP_1: MapTemplate = {
  width: WIDTH,
  height: HEIGHT,
  robotCount: 4,
  robotStartPositions: [
    new Point(400, 240),
    new Point(840, 140),
    new Point(1100, 620),
    new Point(620, 700),
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
      [new Point(0, 0), new Point(60, 0), new Point(60, 40), new Point(0, 40)],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(0, 60),
        new Point(300, 60),
        new Point(300, 220),
        new Point(0, 220),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(0, 280),
        new Point(360, 280),
        new Point(360, 360),
        new Point(0, 360),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(0, 360),
        new Point(400, 360),
        new Point(400, 400),
        new Point(0, 400),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(80, 500),
        new Point(400, 500),
        new Point(400, 560),
        new Point(80, 560),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(0, 600),
        new Point(180, 600),
        new Point(180, 900),
        new Point(0, 900),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(440, 60),
        new Point(480, 60),
        new Point(480, 180),
        new Point(440, 180),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(500, 0),
        new Point(600, 0),
        new Point(600, 260),
        new Point(500, 260),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(600, 0),
        new Point(640, 0),
        new Point(640, 400),
        new Point(600, 400),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(520, 280),
        new Point(580, 280),
        new Point(580, 340),
        new Point(520, 340),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(500, 360),
        new Point(600, 360),
        new Point(600, 400),
        new Point(500, 400),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(580, 560),
        new Point(620, 560),
        new Point(620, 660),
        new Point(580, 660),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(580, 760),
        new Point(620, 760),
        new Point(620, 900),
        new Point(580, 900),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(260, 600),
        new Point(340, 600),
        new Point(340, 700),
        new Point(260, 700),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(240, 800),
        new Point(300, 800),
        new Point(300, 860),
        new Point(240, 860),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(320, 780),
        new Point(480, 780),
        new Point(480, 900),
        new Point(320, 900),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(880, 0),
        new Point(1320, 0),
        new Point(1320, 60),
        new Point(880, 60),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(980, 110),
        new Point(1240, 110),
        new Point(1240, 160),
        new Point(980, 160),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(860, 240),
        new Point(940, 240),
        new Point(940, 320),
        new Point(860, 320),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(960, 220),
        new Point(1260, 220),
        new Point(1260, 360),
        new Point(960, 360),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(880, 360),
        new Point(1400, 360),
        new Point(1400, 400),
        new Point(880, 400),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(1000, 420),
        new Point(1260, 420),
        new Point(1260, 580),
        new Point(1000, 580),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(920, 440),
        new Point(960, 440),
        new Point(960, 560),
        new Point(920, 560),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(1300, 440),
        new Point(1340, 440),
        new Point(1340, 560),
        new Point(1300, 560),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(750, 600),
        new Point(810, 600),
        new Point(810, 900),
        new Point(750, 900),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(880, 780),
        new Point(940, 780),
        new Point(940, 840),
        new Point(880, 840),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(960, 760),
        new Point(1340, 760),
        new Point(1340, 900),
        new Point(960, 900),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(1340, 760),
        new Point(1400, 760),
        new Point(1400, 900),
        new Point(1340, 900),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(0, 560),
        new Point(580, 560),
        new Point(580, 600),
        new Point(0, 600),
      ],
      STATIC_OBSTACLE_COLOR
    ),
  ],
  regions: [
    new Region(
      0,
      [
        new Point(0, 0),
        new Point(700, 0),
        new Point(700, 560),
        new Point(0, 560),
      ],
      [new Point(700, 400), new Point(700, 400), new Point(640, 560)],
      [1, 2, 3]
    ),
    new Region(
      1,
      [
        new Point(700, 0),
        new Point(1400, 0),
        new Point(1400, 400),
        new Point(700, 400),
      ],
      [new Point(700, 400), new Point(700, 400)],
      [0, 2]
    ),
    new Region(
      2,
      [
        new Point(700, 400),
        new Point(1400, 400),
        new Point(1400, 900),
        new Point(700, 900),
      ],
      [new Point(700, 400), new Point(700, 400), new Point(700, 620)],
      [0, 1, 3]
    ),
    new Region(
      3,
      [
        new Point(0, 560),
        new Point(700, 560),
        new Point(700, 900),
        new Point(0, 900),
      ],
      [new Point(640, 560), new Point(700, 620)],
      [0, 2]
    ),
  ],
  numberOfRegions: 4,
  leaderRobotStartPosition: new Point(700, 460),
  mappingGoals: [
    {
      regionNumber: 0,
      goals: [
        new Goal([new Point(360, 140)], GoalShape.CIRCLE, 0, 7),
        new Goal([new Point(180, 30)], GoalShape.CIRCLE, 0, 7),
        new Goal([new Point(160, 250)], GoalShape.CIRCLE, 0, 7),
        new Goal([new Point(440, 400)], GoalShape.CIRCLE, 0, 7),
        new Goal([new Point(40, 460)], GoalShape.CIRCLE, 0, 7),
        new Goal([new Point(640, 540)], GoalShape.CIRCLE, 0, 7),
        new Goal([new Point(670, 80)], GoalShape.CIRCLE, 0, 7),
      ],
    },
    {
      regionNumber: 1,
      goals: [
        new Goal([new Point(780, 80)], GoalShape.CIRCLE, 1, 7),
        new Goal([new Point(800, 340)], GoalShape.CIRCLE, 1, 7),
        new Goal([new Point(950, 200)], GoalShape.CIRCLE, 1, 7),
        new Goal([new Point(1340, 240)], GoalShape.CIRCLE, 1, 7),
        new Goal([new Point(1120, 80)], GoalShape.CIRCLE, 1, 7),
      ],
    },
    {
      regionNumber: 2,
      goals: [
        new Goal([new Point(1370, 480)], GoalShape.CIRCLE, 2, 7),
        new Goal([new Point(980, 600)], GoalShape.CIRCLE, 2, 7),
        new Goal([new Point(950, 720)], GoalShape.CIRCLE, 2, 7),
        new Goal([new Point(860, 880)], GoalShape.CIRCLE, 2, 7),
        new Goal([new Point(780, 420)], GoalShape.CIRCLE, 2, 7),
        new Goal([new Point(720, 760)], GoalShape.CIRCLE, 2, 7),
      ],
    },
    {
      regionNumber: 3,
      goals: [
        new Goal([new Point(660, 620)], GoalShape.CIRCLE, 3, 7),
        new Goal([new Point(640, 800)], GoalShape.CIRCLE, 3, 7),
        new Goal([new Point(420, 700)], GoalShape.CIRCLE, 3, 7),
        new Goal([new Point(210, 670)], GoalShape.CIRCLE, 3, 7),
        new Goal([new Point(210, 880)], GoalShape.CIRCLE, 3, 7),
      ],
    },
  ],
};
