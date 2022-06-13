from models.point import Point
from models.pose import Pose
from src.api_models import _PIDMetadata
import src.settings as settings


class FollowWall:
    def __init__(self, pose: Pose, pid_metadata: _PIDMetadata, sensor_readings) -> None:
        self.pose = pose

        self.kP = settings.PID_CONTROLLER['kP'] # Proportional gain.
        self.kI = settings.PID_CONTROLLER['kI'] # Integral gain.
        self.kD = settings.PID_CONTROLLER['kD'] # Derivative gain.


    def reset_pid(self):
        """Resets the PID controller."""
        self.prev_eP = 0.0
        self.prev_eI = 0.0
