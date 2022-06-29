from models.point import Point
from models.pose import Pose
from src.api_models import _PIDMetadata
import src.settings as settings
import src.utils as utils


class Reverse:
    def __init__(self, pose: Pose, pid_metadata: _PIDMetadata) -> None:
        self.pose = pose
        self.pid_metadata = {
            'prev_eP': 0,
            'prev_eI': 0,
        }

        self.kP = settings.PID_CONTROLLER['kP'] # Proportional gain.
        self.kI = settings.PID_CONTROLLER['kI'] # Integral gain.
        self.kD = settings.PID_CONTROLLER['kD'] # Derivative gain.

        # Previous PID controller values.
        self.prev_eP = pid_metadata.prev_eP # Previous error in the proportional term.
        self.prev_eI = pid_metadata.prev_eI # Previous integral error.

    
    def calculate_steering_inputs(self):
        """Calculates the steering inputs for the robot to reverse from an obstacle."""
        dt = settings.DIFFERENCE_IN_TIME

        # The angular velocity will always be zero when reversing
        w = 0.0

        # Calculate translational velocity
        v = settings.MAX_TRANSLATIONAL_VELOCITY / (abs(w) + 1) ** 0.5

        # Return the steering inputs.
        steering_input = utils.uni_to_diff((-v * 3), w)
        return steering_input, self.pid_metadata


    def reset_pid(self):
        """Resets the PID controller."""
        self.prev_eP = 0.0
        self.prev_eI = 0.0
