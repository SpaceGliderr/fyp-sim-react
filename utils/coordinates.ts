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
}

export class Vector extends Point {}

export class Line {
  private v1: Point;
  private v2: Point;

  constructor(v1: Point, v2: Point) {
    this.v1 = v1;
    this.v2 = v2;
  }

  public pointOrientation = (point: Point) => {
    // Find the orientation of a point with respect to the current line
  };

  public length = () => {
    // Distance of line
  };
}

export class Pose {
  private vector: Vector;
  private theta: number; // in radians

  constructor(Point: Point, theta: number) {
    this.vector = Point;
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
