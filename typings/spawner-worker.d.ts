export type SpawnerWorkerResponse = {
  id: number;
  obstacle: SpawnerWorkerObstacle;
  point: SpawnerWorkerPoint[];
  shape: string;
  expiryDate: Date;
};

export type SpawnerWorkerObstacle = {
  radius: number;
  point: SpawnerWorkerPoint[];
};

export type SpawnerWorkerPoint = {
  x: number;
  y: number;
};
