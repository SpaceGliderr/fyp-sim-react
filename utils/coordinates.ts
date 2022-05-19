export class Point {
  private x: number;
  private y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  // Getter for class variables
  public getX = () => {
    return this.x;
  };

  public getY = () => {
    return this.y;
  };

  public unpack = () => {
    return { x: this.x, y: this.y };
  };

  // Computational functions for Point class
  public distanceTo = (point: Point) => {
    const { x, y } = this.unpack();
    const { x: x2, y: y2 } = point.unpack();

    return Math.sqrt(Math.pow(x - x2, 2) + Math.pow(y - y2, 2));
  };

  public getAxis = () => {
    return new Point(-this.y, this.x);
  };

  public multiply = (scalar: number) => {
    return new Point(this.x * scalar, this.y * scalar);
  };

  public add = (point: Point) => {
    return new Point(this.x + point.getX(), this.y + point.getY());
  };

  public subtract = (point: Point) => {
    return new Point(this.x - point.getX(), this.y - point.getY());
  };
}

export class Vector extends Point {}

export class Line {
  private p1: Point;
  private p2: Point;

  constructor(p1: Point, p2: Point) {
    this.p1 = p1;
    this.p2 = p2;
  }

  public getPoints = () => {
    return [this.p1, this.p2];
  };

  public unpack = () => {
    return {
      x1: this.p1.unpack().x,
      y1: this.p1.unpack().y,
      x2: this.p2.unpack().x,
      y2: this.p2.unpack().y,
    };
  };

  public pointOrientation = (point: Point) => {
    // Find the orientation of a point with respect to the current line
    return (
      (this.p2.getX() - point.getX()) * (this.p1.getY() - point.getY()) -
      (this.p1.getX() - point.getX()) * (this.p2.getY() - point.getY())
    );
  };

  public lineOrientation = (line: Line) => {
    return {
      o1: this.pointOrientation(line.p1),
      o2: this.pointOrientation(line.p2),
    };
  };

  public length = () => {
    // Distance of line
    return Math.sqrt(
      Math.pow(this.p1.getX() - this.p2.getX(), 2) +
        Math.pow(this.p1.getY() - this.p2.getY(), 2)
    );
  };

  public intersects = (l2: Line) => {
    // Check whether 2 lines intersect each other (depends on the length of the lines)
    // Find the orientation of the lines
    const { o1, o2 } = this.lineOrientation(l2);
    const { o1: o3, o2: o4 } = l2.lineOrientation(this);

    // If the points are collinear, the sum of all orientation calculations will be 0
    // Next would be to check if they overlap
    if (o1 + o2 + o3 + o4 == 0) {
      return (
        (this.getPoints()[0].getX() >= l2.getPoints()[0].getX() &&
          this.getPoints()[0].getX() <= l2.getPoints()[1].getX()) ||
        (this.getPoints()[1].getX() >= l2.getPoints()[0].getX() &&
          this.getPoints()[1].getX() <= l2.getPoints()[1].getX())
      );
    }

    // If o1 is +ve, then o2 must be -ve
    // If o1 is -ve, then o2 must be +ve
    // If o3 is +ve, then o4 must be -ve
    // If o3 is -ve, then o4 must be +ve
    // Therefore, multiply the results, if they are negative, then they are at opposite ends of the line
    // If they are positive, then they are on the same side of the line
    if (o1 * o2 <= 0 && o3 * o4 <= 0) {
      return true;
    }
    return false;
  };

  public intersectionPointOf = (line: Line) => {
    // Find the intersection point of a line with this line
    const { x1, y1, x2, y2 } = this.unpack();
    const { x1: x3, y1: y3, x2: x4, y2: y4 } = line.unpack();

    // Formula from:
    // https://dirask.com/posts/JavaScript-calculate-intersection-point-of-two-lines-for-given-4-points-VjvnAj
    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    if (denom === 0) {
      // throw new Error("No intersect found"); // !: For some reason this causes errors when the pose of the robot is manually entered?
    }

    const numerator1 =
      (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4);
    const numerator2 =
      (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4);

    const x = numerator1 / denom;
    const y = numerator2 / denom;

    return new Point(x, y);
  };

  public getEdge = () => {
    return new Point(
      this.p1.getX() - this.p2.getX(),
      this.p1.getY() - this.p2.getY()
    );
  };
}

export class Pose {
  private vector: Vector;
  private theta: number; // in radians

  constructor(vector: Vector, theta: number) {
    this.vector = vector; // making this a vector for now, can be a Point in the future
    this.theta = theta;
  }

  // Getters for class variables
  public getPoint = () => {
    return this.vector;
  };

  public getTheta = () => {
    return this.theta;
  };

  // To return all relevant information about a Point
  public unpack = () => {
    return {
      x: this.vector.getX(),
      y: this.vector.getY(),
      theta: this.theta,
    };
  };
}
