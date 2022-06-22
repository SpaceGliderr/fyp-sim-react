export type RobotWorker = {
  status: RobotWorkerStatus;
  worker: Worker;
};

export enum RobotWorkerStatus {
  IDLE = "IDLE",
  PROCESSING = "PROCESSING",
}
