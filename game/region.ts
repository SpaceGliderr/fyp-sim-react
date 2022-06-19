import { Point } from "../utils/coordinates";

export class Region {
  private id: number;
  private points: Point[];
  private entryPoints: Point[];
  private connectedRegionIds: number[];

  constructor(
    id: number,
    points: Point[],
    entryPoints: Point[],
    connectedRegionIds: number[]
  ) {
    this.id = id;
    this.points = points;
    this.entryPoints = entryPoints;
    this.connectedRegionIds = connectedRegionIds;
  }

  public getId = () => {
    return this.id;
  };

  public unpack = () => {
    return {
      id: this.id,
      points: this.points,
      entryPoints: this.entryPoints,
      connectedRegionIds: this.connectedRegionIds,
    };
  };
}
