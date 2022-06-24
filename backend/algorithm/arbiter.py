import numpy as np


from algorithm.controllers.navigation.go_to_goal import GoToGoal
from algorithm.controllers.mapping.mapping import Mapping
from algorithm.controllers.navigation.avoid_obstacles import AvoidObstacles
from algorithm.controllers.navigation.reverse import Reverse
from models.point import Point
from src.api_models import _TopologicalEnvironment
from src.api_models import _PayloadTypes
from models.robot import Robot
from src.utils import transform_robot_api_model
from src.api_models import _Robot
from enum import Enum
import src.settings as settings


class ControllerType(Enum):
    GO_TO_GOAL = 1
    AVOID_OBSTACLES = 2
    REVERSE = 3


controller_type_dictionary = {
    "GO_TO_GOAL": ControllerType.GO_TO_GOAL,
    "AVOID_OBSTACLES": ControllerType.AVOID_OBSTACLES,
    "REVERSE": ControllerType.REVERSE
}

payload_type_dictionary = {
    "GO_TO_GOAL": _PayloadTypes.gtg,
    "AVOID_OBSTACLES": _PayloadTypes.ao,
    "REVERSE": _PayloadTypes.rv,
}



# The arbiter class is a decision making class that decides the next move for the robot.
class Arbiter:
    def __init__(self, robot: _Robot) -> None:
        id, pose, sensor_readings, current_goal, pid_metadata, robots_within_signal_range, mapping_goals, status, ir_sensors, front_sensor_distances, leader_position, path_points = transform_robot_api_model(robot)
        self.robot = Robot(id, pose, sensor_readings, mapping_goals, status, ir_sensors, front_sensor_distances, leader_position, path_points, current_goal, pid_metadata, robots_within_signal_range)

        # Declare the controllers
        self.go_to_goal = GoToGoal(self.robot.pose, Point(1.0, 0.0), self.robot.pid_metadata)
        self.avoid_obstacle = AvoidObstacles(self.robot.pose, self.robot.pid_metadata, self.robot.ir_sensors)
        self.reverse = Reverse(self.robot.pose, self.robot.pid_metadata)

        # Current controller
        self.controller = self.go_to_goal

        # Previous controller
        self.previous_controller = controller_type_dictionary[robot.current_controller]

        # Controller instance dictionary
        self.controller_instances = {
            ControllerType.GO_TO_GOAL: self.go_to_goal,
            ControllerType.AVOID_OBSTACLES: self.avoid_obstacle,
            ControllerType.REVERSE: self.reverse
        }

        # Arbiter payload
        self.payload = {
            'robot_id': self.robot.id,
            'type': None,
            'payload': None,
        }


    def update_controller(self, controller_type: ControllerType):
        """
        Updates the controller.
        """
        self.controller = self.controller_instances[controller_type]
        self.payload['type'] = payload_type_dictionary[controller_type.name]

        if controller_type is not self.previous_controller:
            # Reset the PID to 0
            self.controller.reset_pid()


    def update_goal_of_controllers(self, goal: Point):
        """
        Updates the goal of the controllers.
        """
        self.go_to_goal.update_goal(goal)


    def determine_goal(self):
        """
        Determines the goal for the controllers.
        """
        if self.robot.status == "MAPPING":
            if len(self.robot.mapping_goals) > 0:
                self.update_goal_of_controllers(self.robot.mapping_goals[0])
        elif self.robot.status == "FIND_LEADER":
            self.update_goal_of_controllers(self.robot.leader_position)
        elif self.robot.status == "NAVIGATION":
            if len(self.robot.path_points) > 0:
                self.update_goal_of_controllers(self.robot.path_points[0])
            # self.update_goal_of_controllers(self.robot.current_goal)


    def determine_controller(self):
        """
        Determines the state of the robot, whether it is in danger or not. And adjusts the controllers accordingly.
        """
        if self.robot.status == "COLLISION":
            self.update_controller(ControllerType.REVERSE)
        elif self.close_to_obstacle() and not self.robot.status == "NAVIGATION":
            self.update_controller(ControllerType.AVOID_OBSTACLES)
        elif len(self.robot.path_points) > 0 or len(self.robot.mapping_goals) > 0:
            self.update_controller(ControllerType.GO_TO_GOAL)
        elif self.robot.status == "FIND_LEADER":
            self.update_controller(ControllerType.GO_TO_GOAL)


    def execute(self) -> None:
        self.determine_goal()
        self.determine_controller()
        steering_input, pid_metadata = self.controller.calculate_steering_inputs()

        self.payload['payload'] = {
            'steering_input': steering_input,
            'pid_metadata': pid_metadata,
        }

        return self.payload


    # CONDITIONS
    def close_to_obstacle(self):
        """
        Checks if the robot is near an obstacle.
        """
        for dist in self.robot.front_sensor_distances: 
            if dist < settings.CLOSE_DISTANCE_IN_PX:
                return True
        return False
