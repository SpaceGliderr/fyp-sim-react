import { CanvasHelper } from "../utils/canvas";
import { Line, Point } from "../utils/coordinates";
import { MathHelper } from "../utils/math";

export abstract class Obstacle {
  private color: string | undefined;

  constructor(color: string | undefined) {
    this.color = color;
  }

  public getColor = () => {
    return this.color;
  };
}

// Rectangle not needed for now as PolygonObstacle can be used instead
// export class RectangleObstacle extends Obstacle {
//   private point: Point;
//   private width: number;
//   private height: number;
//   private lines: Line[];

//   constructor(color: string, point: Point, width: number, height: number) {
//     super(color);
//     this.point = point;
//     this.width = width;
//     this.height = height;
//     this.lines = [];
//   }

//   public render = () => {
//     CanvasHelper.drawRect(this.point, this.width, this.height, this.getColor());
//   };
// }

// The CircleObstacle class probably won't be used, just adding it here for now, in case
// Won't be used for simplicities sake, as the circle would require another set of collision detection mechanics
export class CircleObstacle extends Obstacle {
  private point: Point;
  private radius: number;

  constructor(point: Point, radius: number, color?: string) {
    super(color);
    this.point = point;
    this.radius = radius;
  }

  public render = (isStatic: boolean = false) => {
    CanvasHelper.drawArc(this.point, this.radius, this.getColor(), isStatic);
  };

  public getRadius = () => {
    return this.radius;
  };

  public setPoint = (point: Point) => {
    this.point = point;
  };

  public getPoint = () => {
    return this.point;
  };

  public unpack = () => {
    return {
      point: this.point,
      radius: this.radius,
      color: this.getColor(),
    };
  };
}

export class PolygonObstacle extends Obstacle {
  private points: Point[];
  private lines: Line[]; // To help make collision checking more efficient by splitting them into individual lines

  constructor(points: Point[], color?: string) {
    super(color);
    this.points = points;
    this.lines = MathHelper.getLinesFromPoints(points);
  }

  public render = (isStatic: boolean = false) => {
    CanvasHelper.drawPolygon(this.points, this.getColor(), isStatic);
  };

  public getLines = () => {
    return this.lines;
  };

  public getPoints = () => {
    return this.points;
  };
}

export class DynamicObstacle extends Obstacle {}
