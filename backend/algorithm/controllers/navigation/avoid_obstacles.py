from math import atan2, floor
from typing import List
from models.point import Point
from models.pose import Pose
from src.api_models import _PIDMetadata
import src.utils as utils
import src.settings as settings


class AvoidObstacles:
    def __init__(self, pose: Pose, pid_metadata: _PIDMetadata, sensor_readings: List[Point]) -> None:
        self.pose = pose
        self.sensor_readings = sensor_readings
        self.sensor_weights = settings.SENSOR_WEIGHTS
        self.inverted_weight_indices = settings.INVERTED_WEIGHT_INDICES
        self.heading_vector = self.calculate_heading_vector()

        # PID controller parameters.
        self.kP = settings.PID_CONTROLLER['kP'] # Proportional gain.
        self.kI = settings.PID_CONTROLLER['kI'] # Integral gain.
        self.kD = settings.PID_CONTROLLER['kD'] # Derivative gain.
        
        # Previous PID controller values.
        self.prev_eP = pid_metadata.prev_eP # Previous error in the proportional term.
        self.prev_eI = pid_metadata.prev_eI # Previous integral error.


    def calculate_steering_inputs(self):
        """Calculates the steering inputs for the robot to move towards the goal."""
        dt = settings.DIFFERENCE_IN_TIME

        # Calculate the error in the heading vector.
        theta_d = atan2(self.heading_vector.y, self.heading_vector.x)
        print("Error Heading >>> ", theta_d)
        eP = theta_d
        eI = self.prev_eI + eP * dt
        eD = (eP - self.prev_eP) / dt

        # Calculate angular velocity
        w = self.kP * eP + self.kI * eI + self.kD * eD

        # Calculate translational velocity
        v = settings.MAX_TRANSLATIONAL_VELOCITY / (abs(w) + 1) ** 0.5
        print("V >>> ", v)
        print("W >>> ", w)

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
        heading_vector = Point(0, 0)
        # current_vector = self.pose.point
        print("Current Vector >>> ", self.pose.unpack())

        # Calculate the heading vector.
        for index, sensor_reading in enumerate(self.sensor_readings):
            print("Sensor Readings >>> ", index)
            print("Ori Sensor Reading >>> ", sensor_reading.unpack())
            print("Sensor Readings Rotated >>> ", sensor_reading.rotate_and_translate(self.pose.inverse().point, self.pose.inverse().theta).unpack())
            # print("Reading >>> ", current_vector.subtract(sensor_reading.rotate_and_translate(self.pose.inverse().point, self.pose.inverse().theta)).unpack())

            inverse_pose = self.pose.inverse()

            reading = sensor_reading.rotate_and_translate(inverse_pose.point, inverse_pose.theta)

            heading_vector = heading_vector.add(reading.scale(self.sensor_weights[index]))

        return heading_vector


    def reset_pid(self):
        """Resets the PID controller."""
        self.prev_eP = 0.0
        self.prev_eI = 0.0

    
    def update_heading(self):
        """Updates the goal of the robot."""
        pass
