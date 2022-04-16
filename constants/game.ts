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

  public draw = (ctx: any) => {
    // TODO: Draw the robot, complex polygon
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    this.pose.drawTri(ctx);
    this.sensors.forEach((sensor) => {
      sensor.draw(ctx);
    });
    this.prxSensors.forEach((sensor) => {
      sensor.draw(ctx);
    });
  };

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

  constructor(name: string, pose: Pose) {
    this.name = name;
    this.pose = pose;
    this.distance = 25; // in cm
  }

  public draw = (ctx: any) => {
    this.pose.drawArc(ctx);
  };

  public read = (ctx: any) => {};
}

export class PRXSensor {
  private pose: Pose;
  private name: string;
  private distance: number;

  constructor(name: string, pose: Pose) {
    this.name = name;
    this.pose = pose;
    this.distance = 25; // in cm
  }

  public draw = (ctx: any) => {
    this.pose.draw(ctx);
  };

  public read = (ctx: any) => {};
}
