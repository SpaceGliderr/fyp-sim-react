import { Goal, GoalShape } from "../game/goal";
import { MapTemplate } from "../game/map";
import { PolygonObstacle } from "../game/obstacles";
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
  goals: [],
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
        new Point(100, 80),
        new Point(100, 340),
        new Point(0, 340),
      ],
      STATIC_OBSTACLE_COLOR
    ),
    new PolygonObstacle(
      [
        new Point(120, 140),
        new Point(180, 140),
        new Point(180, 280),
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
        new Point(560, 0),
        new Point(760, 0),
        new Point(760, 80),
        new Point(560, 80),
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
        new Point(760, 560),
        new Point(840, 560),
        new Point(840, 640),
        new Point(760, 640),
      ],
      STATIC_OBSTACLE_COLOR
    ),
  ],
};
