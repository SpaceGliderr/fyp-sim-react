import {
  DEFAULT_FONT_FILL_STYLE,
  DEFAULT_FONT_SETTINGS,
} from "../game/settings";
import { Line, Point } from "./coordinates";

export class CanvasHelper {
  static staticCtx: CanvasRenderingContext2D;
  static dynamicCtx: CanvasRenderingContext2D;

  constructor(
    staticCtx: CanvasRenderingContext2D,
    dynamicCtx: CanvasRenderingContext2D
  ) {
    CanvasHelper.staticCtx = staticCtx;
    CanvasHelper.dynamicCtx = dynamicCtx;
  }

  public static clearContext = (isStatic: boolean = false) => {
    if (isStatic) {
      this.staticCtx.clearRect(
        0,
        0,
        this.staticCtx.canvas.width,
        this.staticCtx.canvas.height
      );
    } else {
      this.dynamicCtx.clearRect(
        0,
        0,
        this.dynamicCtx.canvas.width,
        this.dynamicCtx.canvas.height
      );
    }
  };

  public static drawLine = (
    line: Line,
    stroke: string,
    isStatic: boolean = false
  ) => {
    const ctx: CanvasRenderingContext2D = isStatic
      ? this.staticCtx
      : this.dynamicCtx;
    const { x1, y1, x2, y2 } = line.unpack();

    ctx.strokeStyle = stroke;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.stroke();
  };

  // Following method places two dots at the end of the line
  public static drawLineWithArc = (
    line: Line,
    color: string,
    radius: number
  ) => {
    CanvasHelper.drawArc(line.getPoints()[0], radius, color);
    CanvasHelper.drawLine(line, color);
    CanvasHelper.drawArc(line.getPoints()[1], radius, color);
  };

  public static drawArc = (
    point: Point,
    radius: number,
    fill?: string,
    isStatic: boolean = false
  ) => {
    const ctx: CanvasRenderingContext2D = isStatic
      ? this.staticCtx
      : this.dynamicCtx;
    const { x, y } = point.unpack();

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);

    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }

    ctx.closePath();
  };

  public static drawRect = (
    point: Point,
    height: number,
    width: number,
    fill: string,
    isStatic: boolean = false
  ) => {
    const ctx: CanvasRenderingContext2D = isStatic
      ? this.staticCtx
      : this.dynamicCtx;
    const { x, y } = point.unpack();

    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.fillRect(x, y, 1, 1);
    ctx.closePath();
  };

  public static drawPolygon = (
    points: Point[],
    fill?: string,
    isStatic: boolean = false
  ) => {
    const ctx: CanvasRenderingContext2D = isStatic
      ? this.staticCtx
      : this.dynamicCtx;
    ctx.beginPath();
    ctx.moveTo(points[0].getX(), points[0].getY());
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].getX(), points[i].getY());
    }
    ctx.lineTo(points[0].getX(), points[0].getY());
    ctx.closePath();

    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
  };

  public static drawText = (
    point: Point,
    text: string,
    xOffset: number,
    yOffset: number,
    fontDetails?: {
      fontSettings?: string;
      fillStyle?: string;
    },
    isStatic: boolean = false
  ) => {
    const ctx: CanvasRenderingContext2D = isStatic
      ? this.staticCtx
      : this.dynamicCtx;

    const { x, y } = point.unpack();
    ctx.font = fontDetails?.fontSettings ?? DEFAULT_FONT_SETTINGS;
    ctx.fillStyle = fontDetails?.fillStyle ?? DEFAULT_FONT_FILL_STYLE;
    ctx.fillText(text, x + xOffset, y + yOffset);
  };
}
