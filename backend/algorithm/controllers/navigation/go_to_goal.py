from math import atan2
from src.api_models import _PIDMetadata
from models.point import Point
from models.pose import Pose
import src.utils as utils
import src.settings as settings


class GoToGoal:
    def __init__(self, pose: Pose, goal: Point, pid_metadata: _PIDMetadata) -> None:
        self.pose = pose
        self.goal = goal
        self.heading_vector = self.calculate_heading_vector()

        # PID controller parameters.
        self.kP = settings.PID_CONTROLLER['kP'] # Proportional gain.
        self.kI = settings.PID_CONTROLLER['kI'] # Integral gain.
        self.kD = settings.PID_CONTROLLER['kD'] # Derivative gain.
        
        # Previous PID controller values.
        self.prev_eP = pid_metadata.prev_eP # Previous error in the proportional term.
        self.prev_eI = pid_metadata.prev_eI # Previous integral error.


    def calculate_steering_inputs(self) -> None:
        """Calculates the steering inputs for the robot to move towards the goal."""
        dt = settings.DIFFERENCE_IN_TIME # seconds, by right it should update every 0.03 seconds, but might be updating at different times in the future

        # Calculate the error in the heading vector.
        theta_d = atan2(self.heading_vector.y, self.heading_vector.x)
        eP = theta_d
        eI = self.prev_eI + eP * dt
        eD = (eP - self.prev_eP) / dt

        # Calculate angular velocity
        w = self.kP * eP + self.kI * eI + self.kD * eD

        # Calculate translational velocity
        v = settings.MAX_TRANSLATIONAL_VELOCITY / (abs(w) + 1) ** 0.5

        # Store the previous error values in pid_metadata.
        pid_metadata = {
            'prev_eP': eP,
            'prev_eI': eI,
        }

        v = max(min(v, settings.MAX_TRANSLATIONAL_VELOCITY), -settings.MAX_TRANSLATIONAL_VELOCITY)
        w = max(min(w, settings.MAX_ANGULAR_VELOCITY), -settings.MAX_ANGULAR_VELOCITY)

        # Return the steering inputs.
        steering_input = utils.uni_to_diff(v, w)
        return steering_input, pid_metadata

    
    def calculate_heading_vector(self):
        """Calculates the heading vector of the goal for the robot."""
        inverse_pose = self.pose.inverse()
        return self.goal.rotate_and_translate(inverse_pose.point, inverse_pose.theta)


    def reset_pid(self):
        """Resets the PID controller."""
        self.prev_eP = 0.0
        self.prev_eI = 0.0

    
    def update_goal(self, goal: Point):
        """Updates the goal of the robot."""
        self.goal = goal
        self.heading_vector = self.calculate_heading_vector()
