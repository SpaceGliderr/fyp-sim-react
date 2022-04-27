import { MapTemplate } from "../game/map";
import { PolygonObstacle } from "../game/obstacles";
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
  robotCount: 1,
  robotStartPositions: [new Point(680, 360)],
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
        new Point(240, 600),
        new Point(320, 600),
        new Point(320, 700),
        new Point(240, 700),
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
        new Point(980, 100),
        new Point(1240, 100),
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
  ],
};
