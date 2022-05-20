import { concat, filter, map, random } from "lodash";
import { Goal, GoalShape } from "../game/goal";
import { Map } from "../game/map";
import { CircleObstacle, Obstacle, PolygonObstacle } from "../game/obstacles";
import { Robot } from "../game/robot";
import { Collision } from "../utils/collision";
import { Point } from "../utils/coordinates";

// Worker to spawn goals in a separate thread

type SpawnGoalArgs = {
  robots: Robot[];
  goals: Goal[];
  obstacles: any[];
  map: Map;
};

// Function to generate the goal in the map
const generateGoalsForRobots = (data: SpawnGoalArgs) => {
  // 0. Define variables
  const { robots, goals, obstacles, map: environmentMap } = data;
  const { width, height } = environmentMap.unpack();

  // 1. Filter for robots with no goals
  const robotsWithNoGoals = filter(
    robots,
    (robot) => robot.getCurrentGoal() === undefined
  );

  // 2. Combine all obstacles into one array
  const goalObstacles = map(goals, (goal) => {
    return goal.getObstacle();
  });
  const allObstacles: Obstacle[] = concat(goalObstacles, obstacles);

  // 3. Generate a goal for each robot that has no goal
  const generatedGoals: Goal[] = [];

  robotsWithNoGoals.forEach((robot) => {
    var collision: boolean = true;
    var generatedGoal: Goal = generateGoal(width, height, robot);

    while (collision) {
      const generatedObstacle = generatedGoal.getObstacle();

      // 4.  Check if the goal is in collision with any obstacles
      allObstacles.forEach((obstacle) => {
        if (
          obstacle instanceof CircleObstacle &&
          generatedObstacle instanceof CircleObstacle
        ) {
          collision = Collision.circleCircleIntersect(
            generatedObstacle,
            obstacle
          );
        } else if (
          obstacle instanceof PolygonObstacle &&
          generatedObstacle instanceof CircleObstacle
        ) {
          collision = Collision.circlePolygonIntersect(
            obstacle,
            generatedObstacle
          );
        }
      });

      generatedGoal = generateGoal(width, height, robot);
    }

    // 5. Add the goal to the list of goals
    generatedGoals.push(generatedGoal);
  });
};

const generateGoal = (width: number, height: number, robot: Robot) => {
  const radius = 7; // For now all goals will be of CircleObstacle type, can change this in the future by altering this code
  const offset = 2;
  const offsetRadius = radius + offset;
  const x = random(offsetRadius, width - offsetRadius, true);
  const y = random(offsetRadius, height - offsetRadius, true);
  const point = new Point(x, y);
  return new Goal([point], GoalShape.CIRCLE, robot.getId(), radius);
};

self.onmessage = (event) => {
  const { data } = event;
  const generatedGoals = generateGoalsForRobots(data);
  self.postMessage(generatedGoals);
};

export {};
