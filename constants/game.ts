// Create a vector class
export class Vector {
  private x: number;
  private y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public add = (vector: Vector) => {
    return new Vector(this.x + vector.x, this.y + vector.y);
  };

  public subtract = (vector: Vector) => {
    return new Vector(this.x - vector.x, this.y - vector.y);
  };

  public multiply = (scalar: number) => {
    return new Vector(this.x * scalar, this.y * scalar);
  };

  public divide = (scalar: number) => {
    return new Vector(this.x / scalar, this.y / scalar);
  };

  public getX = () => {
    return this.x;
  };

  public getY = () => {
    return this.y;
  };

  public getMagnitude = () => {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  };

  public getAngle = () => {
    return Math.atan2(this.y, this.x);
  };

  public getNormalized = () => {
    // Putting it on the unit circle
    return new Vector(
      this.x / this.getMagnitude(),
      this.y / this.getMagnitude()
    );
  };

  public getNormal = () => {
    return new Vector(this.y, -this.x);
  };

  public getRotated = (angle: number) => {
    return new Vector(
      this.x * Math.cos(angle) - this.y * Math.sin(angle),
      this.x * Math.sin(angle) + this.y * Math.cos(angle)
    );
  };

  public getRotatedNormal = (angle: number) => {
    return new Vector(
      this.x * Math.cos(angle) - this.y * Math.sin(angle),
      this.x * Math.sin(angle) + this.y * Math.cos(angle)
    );
  };

  public getRotatedNormalized = (angle: number) => {
    return new Vector(
      this.x * Math.cos(angle) - this.y * Math.sin(angle),
      this.x * Math.sin(angle) + this.y * Math.cos(angle)
    );
  };

  public getRotatedNormalizedInverse = (angle: number) => {
    return new Vector(
      this.x * Math.cos(angle) + this.y * Math.sin(angle),
      -this.x * Math.sin(angle) + this.y * Math.cos(angle)
    );
  };

  public getRotatedInverse = (angle: number) => {
    return new Vector(
      this.x * Math.cos(angle) + this.y * Math.sin(angle),
      -this.x * Math.sin(angle) + this.y * Math.cos(angle)
    );
  };
}

const normalizeTheta = (theta: number) => {
  return Math.atan2(Math.sin(theta), Math.cos(theta));
};

export class Pose {
  private vector: Vector;
  private theta: number;

  constructor(vector: Vector, theta: number) {
    this.theta = normalizeTheta(theta);
    this.vector = new Vector(
      20 * Math.cos(this.theta) + vector.getX(),
      20 * Math.sin(this.theta) + vector.getY()
    );
    // console.log(
    //   "🚀 ~ file: game.ts ~ line 102 ~ Pose ~ constructor ~ this.vector.x",
    //   20 * Math.cos(this.theta) + this.vector.getX()
    // );
    // console.log(
    //   "🚀 ~ file: game.ts ~ line 102 ~ Pose ~ constructor ~ this.vector.y",
    //   20 * Math.sin(this.theta) + this.vector.getY()
    // );
  }

  public draw = (ctx: any) => {
    ctx.fillStyle = "red";
    ctx.fillRect(this.vector.getX() - 2.5, this.vector.getY() - 2.5, 5, 5);
  };

  public drawTri = (ctx: any) => {
    ctx.fillStyle = "purple";
    ctx.beginPath();
    ctx.moveTo(this.vector.getX() - 4, this.vector.getY() - 8);
    ctx.lineTo(this.vector.getX() + 10, this.vector.getY());
    ctx.lineTo(this.vector.getX() - 4, this.vector.getY() + 8);
    ctx.lineTo(this.vector.getX() - 4, this.vector.getY() - 8);
    ctx.fill();
  };

  public drawArc = (ctx: any) => {
    ctx.fillStyle = "green";
    ctx.beginPath();
    ctx.arc(this.vector.getX(), this.vector.getY(), 2.5, 0, Math.PI * 2);
    ctx.fill();
  };

  public update = (theta: number) => {};

  public getTheta = () => {
    return this.theta;
  };

  public getVector = () => {
    return this.vector;
  };
}

export class Wall {
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private color: string;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
  }

  public draw = (ctx: any) => {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  };

  public hasCollision = (
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    // const hasLeftCollided =
    //   x - width > this.x && x - width < this.x + this.width;
    // const hasRightCollided =
    //   x + width > this.x && x + width < this.x + this.width;
    // const hasTopCollided =
    //   y - height > this.y && y - height < this.y + this.height;
    // const hasBottomCollided =
    //   y + height > this.y && y + height < this.y + this.height;
    // const hasMiddleCollided =
    //   x >= this.x &&
    //   x <= this.x + this.width &&
    //   y >= this.y &&
    //   y <= this.y + this.height;

    // TODO: Update this collision detection system once the character is changed from a circle to a more complex polygon

    return (
      x >= this.x &&
      x <= this.x + this.width &&
      y >= this.y &&
      y <= this.y + this.height
    );
  };

  public getLines = () => {
    return [
      {
        pt1: new Vector(this.x, this.y),
        pt2: new Vector(this.x + this.width, this.y),
      },
      {
        pt1: new Vector(this.x + this.width, this.y),
        pt2: new Vector(this.x + this.width, this.y + this.height),
      },
      {
        pt1: new Vector(this.x + this.width, this.y + this.height),
        pt2: new Vector(this.x, this.y + this.height),
      },
      {
        pt1: new Vector(this.x, this.y + this.height),
        pt2: new Vector(this.x, this.y),
      },
    ];
  };

  public getVector = () => {
    return new Vector(this.x, this.y);
  };
}

type Sensors = {
  name: string;
  theta: number; // in degrees, will be converted into radian later
};

const IR_SENSORS: Sensors[] = [
  {
    name: "IR E",
    theta: 0,
  },
  {
    name: "IR N",
    theta: 90,
  },
  {
    name: "IR W",
    theta: 180,
  },
  {
    name: "IR S",
    theta: 270,
  },
  {
    name: "IR NE",
    theta: 45,
  },
  {
    name: "IR NW",
    theta: 135,
  },
  {
    name: "IR SE",
    theta: 315,
  },
  {
    name: "IR SW",
    theta: 225,
  },
];

const PRX_SENSORS: Sensors[] = [
  {
    name: "PRX E",
    theta: 0,
  },
  {
    name: "PRX N",
    theta: 90,
  },
  {
    name: "PRX S",
    theta: 270,
  },
  {
    name: "PRX NE",
    theta: 45,
  },
  {
    name: "PRX NW",
    theta: 315,
  },
];

const degToRad = (theta: number) => {
  return (theta * Math.PI) / 180;
};

export class Robot {
  // Spawn point
  private x: number;
  private y: number;
  private radius: number;
  private color: string;
  private sensors: IRSensor[];
  private prxSensors: PRXSensor[];
  private pose: Pose;

  constructor(
    x: number,
    y: number,
    radius: number,
    color: string,
    deg: number
  ) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.radius = radius;
    this.pose = new Pose(new Vector(x, y), degToRad(deg)); // Pose dictates the direction which the bot faces, the head will always be facing East when it spawns
    this.sensors = IR_SENSORS.map(({ name, theta }) => {
      return new IRSensor(
        name,
        new Pose(new Vector(x, y), degToRad(theta) + degToRad(deg))
      );
    });
    this.prxSensors = PRX_SENSORS.map(({ name, theta }) => {
      return new PRXSensor(
        name,
        new Pose(new Vector(x, y), degToRad(theta) + degToRad(deg))
      );
    });
  }

  public draw = (ctx: any, walls: Wall[]) => {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    this.pose.drawTri(ctx);
    this.prxSensors.forEach((sensor) => {
      sensor.draw(ctx, walls);
    });
    this.sensors.forEach((sensor) => {
      sensor.draw(ctx, walls);
    });
  };

  public readSensors = () => {};

  // Used to update the position of the robot
  public update = (theta: number) => {};

  public move = (deltaX: number, deltaY: number) => {
    // TODO: Make more comprehensive movement system using the unicycle model
  };
}

// TODO Create an abstract class Sensors
export class IRSensor {
  private pose: Pose;
  private name: string;
  private distance: number;
  private reading: Vector | null = null;

  constructor(name: string, pose: Pose) {
    this.name = name;
    this.pose = pose;
    this.distance = 25; // in cm
  }

  public draw = (ctx: any, walls: Wall[]) => {
    this.pose.drawArc(ctx);

    // Render the sight of the sensor
    // 0.7 cm = 1 pixel
    const theta = this.pose.getTheta();
    const x = this.pose.getVector().getX();
    const y = this.pose.getVector().getY();

    walls.forEach((wall) => {
      const lines = wall.getLines();
      lines.forEach((line) => {
        const { pt1, pt2 } = line;

        if (
          intersects(
            new Vector(x, y),
            new Vector(36 * Math.cos(theta) + x, 36 * Math.sin(theta) + y),
            pt1,
            pt2
          )
        ) {
          console.log("Intersects", pt1, pt2);

          console.log(
            "Intersection point",
            findIntersectPoint(
              new Vector(x, y),
              new Vector(36 * Math.cos(theta) + x, 36 * Math.sin(theta) + y),
              pt1,
              pt2
            )
          );

          // Cannot just find intersect point. Lines are infinite, and does not account for the magnitude
          this.setReading(
            findIntersectPoint(
              new Vector(x, y),
              new Vector(36 * Math.cos(theta) + x, 36 * Math.sin(theta) + y),
              pt1,
              pt2
            )
          );
        }
      });
    });

    ctx.beginPath();
    ctx.strokeStyle = "green";
    ctx.moveTo(x, y);

    if (this.reading) {
      ctx.lineTo(this.reading.getX(), this.reading.getY());
      ctx.closePath();
      ctx.stroke();

      // Render intersect point
      ctx.arc(this.reading.getX(), this.reading.getY(), 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.lineTo(36 * Math.cos(theta) + x, 36 * Math.sin(theta) + y);
      ctx.closePath();
      ctx.stroke();
    }
  };

  public setReading = (newReading: Vector | null) => {
    if (newReading == null) return;

    if (this.reading == null) {
      this.reading = newReading;
    }

    if (
      distanceBetweenPoints(this.pose.getVector(), newReading) <
      distanceBetweenPoints(this.pose.getVector(), this.reading)
    ) {
      this.reading = newReading;
    }
  };

  public read = (ctx: any) => {};
}

export class PRXSensor {
  private pose: Pose;
  private name: string;
  private distance: number;
  private reading: Vector | null = null;

  constructor(name: string, pose: Pose) {
    this.name = name;
    this.pose = pose;
    this.distance = 25; // in cm
  }

  public draw = (ctx: any, walls: Wall[]) => {
    this.pose.draw(ctx);

    // Render the sight of the sensor
    // 0.7 cm = 1 pixel
    const theta = this.pose.getTheta();
    const x = this.pose.getVector().getX();
    const y = this.pose.getVector().getY();

    walls.forEach((wall) => {
      const lines = wall.getLines();
      lines.forEach((line) => {
        const { pt1, pt2 } = line;

        if (
          intersects(
            new Vector(x, y),
            new Vector(286 * Math.cos(theta) + x, 286 * Math.sin(theta) + y),
            pt1,
            pt2
          )
        ) {
          console.log("Intersects", pt1, pt2);

          console.log(
            "Intersection point",
            findIntersectPoint(
              new Vector(x, y),
              new Vector(286 * Math.cos(theta) + x, 286 * Math.sin(theta) + y),
              pt1,
              pt2
            )
          );

          // Cannot just find intersect point. Lines are infinite, and does not account for the magnitude
          this.setReading(
            findIntersectPoint(
              new Vector(x, y),
              new Vector(286 * Math.cos(theta) + x, 286 * Math.sin(theta) + y),
              pt1,
              pt2
            )
          );
        }
      });
    });

    ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.moveTo(x, y);

    if (this.reading) {
      ctx.lineTo(this.reading.getX(), this.reading.getY());
      ctx.closePath();
      ctx.stroke();

      // Render intersect point
      ctx.arc(this.reading.getX(), this.reading.getY(), 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.lineTo(286 * Math.cos(theta) + x, 286 * Math.sin(theta) + y);
      ctx.closePath();
      ctx.stroke();
    }
  };

  public setReading = (newReading: Vector | null) => {
    if (newReading == null) return;

    if (this.reading == null) {
      this.reading = newReading;
    }

    if (
      distanceBetweenPoints(this.pose.getVector(), newReading) <
      distanceBetweenPoints(this.pose.getVector(), this.reading)
    ) {
      this.reading = newReading;
    }
  };

  public read = (ctx: any) => {};
}

const distanceBetweenPoints = (p1: Vector, p2: Vector) => {
  return Math.sqrt(
    Math.pow(p1.getX() - p2.getX(), 2) + Math.pow(p1.getY() - p2.getY(), 2)
  );
};

// const crossProduct = (p1: Vector, p2: Vector, p3: Vector, p4: Vector) => {
//   return p1.getX() * p2.getY() - p1.getY() * p2.getX();
// };

const orientation = (p1: Vector, p2: Vector, p3: Vector) => {
  return (
    (p2.getX() - p3.getX()) * (p1.getY() - p3.getY()) -
    (p1.getX() - p3.getX()) * (p2.getY() - p3.getY())
  );
};

const intersects = (p1: Vector, p2: Vector, p3: Vector, p4: Vector) => {
  const p1p2p3 = orientation(p1, p2, p3);
  const p1p2p4 = orientation(p1, p2, p4);
  const p3p4p1 = orientation(p3, p4, p1);
  const p3p4p2 = orientation(p3, p4, p2);

  // If the points are collinear, the sum of all orientation calculations will be 0
  // Next would be to check if they overlap
  if (p1p2p3 + p1p2p4 + p3p4p1 + p3p4p2 == 0) {
    return (
      (p1.getX() >= p3.getX() && p1.getX() <= p4.getX()) ||
      (p2.getX() >= p3.getX() && p2.getX() <= p4.getX())
    );
  }

  // If p1p2p3 is +ve, then p1p2p4 must be -ve
  // If p1p2p3 is -ve, then p1p2p4 must be +ve
  // If p3p4p1 is +ve, then p3p4p2 must be -ve
  // If p3p4p1 is -ve, then p3p4p2 must be +ve
  // Therefore, multiply the results, if they are negative, then they are at opposite ends of the line
  // If they are positive, then they are on the same side of the line
  if (p1p2p3 * p1p2p4 <= 0 && p3p4p1 * p3p4p2 <= 0) {
    return true;
  }

  return false;
};

const findIntersectPoint = (p1: Vector, p2: Vector, p3: Vector, p4: Vector) => {
  // https://dirask.com/posts/JavaScript-calculate-intersection-point-of-two-lines-for-given-4-points-VjvnAj
  const x1 = p1.getX();
  const y1 = p1.getY();
  const x2 = p2.getX();
  const y2 = p2.getY();
  const x3 = p3.getX();
  const y3 = p3.getY();
  const x4 = p4.getX();
  const y4 = p4.getY();

  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

  if (denom === 0) {
    return null; // Null means no intersect detected
  }

  const numerator1 =
    (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4);
  const numerator2 =
    (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4);

  // Alternate algorithm to calculate the intersection point
  // const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;

  // const x = x1 + t * (x2 - x1);
  // const y = y1 + t * (y2 - y1);

  const x = numerator1 / denom;
  const y = numerator2 / denom;

  // console.log(x, y);

  return new Vector(x, y);
};
