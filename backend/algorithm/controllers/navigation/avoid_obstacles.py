from models.point import Point
from models.pose import Pose
from src.api_models import _PIDMetadata


class AvoidObstacles:
    def __init__(self, pose: Pose, pid_metadata: _PIDMetadata, sensor_readings) -> None:
        self.pose = pose


    def reset_pid(self):
        """Resets the PID controller."""
        self.prev_eP = 0.0
        self.prev_eI = 0.0
