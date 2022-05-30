from algorithm.controllers.navigation.go_to_goal import GoToGoal
from models.robot import Robot
from src.utils import transform_robot_api_model
from src.api_models import _Robot


# The arbiter class is a decision making class that decides the next move for the robot.
class Arbiter:
    def __init__(self, robot: _Robot) -> None:
        id, pose, sensor_readings, current_goal, pid_metadata = transform_robot_api_model(robot)
        self.robot = Robot(id, pose, sensor_readings, current_goal, pid_metadata)
        pass

    def decide(self) -> None:
        if self.robot.current_goal is not None:
            # If the robot has a goal, then move towards the goal.
            controller = GoToGoal(self.robot.pose, self.robot.current_goal, self.robot.pid_metadata)
            decision = controller.calculate_steering_inputs()
            print(decision)
            return decision
        pass
