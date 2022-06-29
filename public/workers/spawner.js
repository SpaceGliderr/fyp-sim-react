let goalDuration = 100;

const generateGoalsForRobots = (data) => {
  // 0. Define variables
  const { robots, goals, staticObstacles: obstacles, map } = data;
  const { width, height } = map;

  // 1. Filter for robots with no goals
  const robotWithNoGoals = robots.filter(
    (robot) => robot.currentGoal === undefined
  );

  // 2. Combine all obstacles into one array
  const goalObstacles = goals.map((goal) => {
    return goal.obstacle;
  });
  const allObstacles = obstacles.concat(goalObstacles);
  allObstacles.shift();

  // 3. Generate a goal for each robot that has no goal
  const generatedGoals = [];

  robotWithNoGoals.forEach((robot) => {
    var collision = true;
    var generatedGoal = generateGoal(width, height, robot);

    while (collision) {
      const generatedObstacle = generatedGoal.obstacle;

      for (let obstacle of allObstacles) {
        var obstacleGoalCollision = false;

        if (obstacle.radius) {
          obstacleGoalCollision = circleCircleIntersect(
            generatedObstacle,
            obstacle
          );
        } else {
          obstacleGoalCollision = circlePolygonIntersect(
            generatedObstacle,
            obstacle
          );
        }

        if (obstacleGoalCollision) {
          collision = true;
          break;
        } else {
          collision = false;
        }
      }

      if (collision) {
        generatedGoal = generateGoal(width, height, robot);
      }
    }

    // 5. Add the goal to the list of goals
    if (!collision) {
      generatedGoals.push(generatedGoal);
    }
  });

  return generatedGoals;
};

const generateGoal = (width, height, robot) => {
  const radius = 7; // For now all goals will be of CircleObstacle type, can change this in the future by altering this code
  const offset = 2;
  const offsetRadius = radius + offset;
  const x = generateRandomNumber(offsetRadius, width - offsetRadius);
  const y = generateRandomNumber(offsetRadius, height - offsetRadius);
  return {
    id: robot.id,
    obstacle: {
      point: {
        x,
        y,
      },
      radius,
    },
    point: [{ x, y }],
    shape: "CIRCLE",
    expiryDate: generateEndDate(),
  };
};

const generateRandomNumber = (min, max) => {
  return Math.round(Math.random() * (max - min + 1) + min);
};

const circleCircleIntersect = (c1, c2) => {
  const { point: cp1, radius: cr1 } = c1;
  const { point: cp2, radius: cr2 } = c2;

  const dist = Math.sqrt(
    Math.pow(cp1.x - cp2.x, 2) + Math.pow(cp1.y - cp2.y, 2)
  );
  const totalRadius = cr1 + cr2;

  return dist < totalRadius;
};

const circlePolygonIntersect = (circle, polygon) => {
  let collision = true;

  const lines = polygon.lines;
  lines.forEach((line) => {
    const { p1, p2 } = line;
    const { x: x1, y: y1 } = p1;
    const { x: x2, y: y2 } = p2;

    let axis = {
      x: x1 - x2,
      y: y1 - y2,
    };
    axis = {
      x: -axis.y,
      y: axis.x,
    };
    axis = normalize(axis);

    const { min: minA, max: maxA } = projectVertices(polygon.points, axis);
    const { min: minB, max: maxB } = projectCircle(
      circle.point,
      circle.radius,
      axis
    );

    if (maxA < minB || maxB < minA) {
      collision = false;
      return false;
    }
  });

  return collision;
};

const normalize = ({ x, y }) => {
  const length = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
  return {
    x: x / length,
    y: y / length,
  };
};

const dotProduct = (p1, p2) => {
  return p1.x * p2.x + p1.y * p2.y;
};

const projectVertices = (points, axis) => {
  let min = Number.MAX_VALUE;
  let max = Number.MIN_VALUE;

  points.forEach((point) => {
    const projection = dotProduct(point, axis);
    if (projection < min) {
      min = projection;
    }
    if (projection > max) {
      max = projection;
    }
  });

  return { min, max };
};

const projectCircle = (center, radius, axis) => {
  const direction = normalize(axis);
  const directionAndRadius = {
    x: direction.x * radius,
    y: direction.y * radius,
  };

  const p1 = {
    x: center.x + directionAndRadius.x,
    y: center.y + directionAndRadius.y,
  };
  const p2 = {
    x: center.x - directionAndRadius.x,
    y: center.y - directionAndRadius.y,
  };

  let min = dotProduct(p1, axis);
  let max = dotProduct(p2, axis);

  if (min > max) {
    const t = min;
    min = max;
    max = t;
  }

  return { min, max };
};

const generateEndDate = () => {
  // Offset is to account fo the potential delay in the spawner
  const expiryDate = new Date();
  expiryDate.setSeconds(expiryDate.getSeconds() + goalDuration);
  return expiryDate;
};

self.onmessage = (event) => {
  const { data } = event;
  const { simulator, duration } = JSON.parse(data);
  goalDuration = duration;
  const generatedGoals = generateGoalsForRobots(simulator);
  self.postMessage(generatedGoals);
};
