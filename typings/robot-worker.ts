export type RobotWorker = {
  status: RobotWorkerStatus;
  worker: Worker;
};

export enum RobotWorkerStatus {
  IDLE = "IDLE",
  PROCESSING = "PROCESSING",
}

export enum RobotWorkerOperation {
  PLAN_PATH = "PLAN_PATH",
  FIND_LEADER = "FIND_LEADER",
  NAVIGATE = "NAVIGATE",
  COLLISION = "COLLISION",
}

export type RobotWorkerArgs = {
  payload: object;
  operation?: RobotWorkerOperation;
};
