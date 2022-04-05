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

export class Robot {
  // Spawn point
  private x: number;
  private y: number;
  private radius: number;
  private color: string;

  constructor(x: number, y: number, radius: number, color: string) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.radius = radius;
  }

  public draw = (ctx: any) => {
    // TODO: Draw the robot, complex polygon
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  };

  public move = (deltaX: number, deltaY: number) => {
    // TODO: Make more comprehensive movement system
  };
}
