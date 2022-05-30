from algorithm.controllers.navigation.go_to_goal import GoToGoal
from src.api_models import _PayloadTypes
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
        payload = {
            'robot_id': self.robot.id,
            'type': None,
            'payload': None,
        }

        if self.robot.current_goal is not None:
            payload['type'] = _PayloadTypes.gtg
            # If the robot has a goal, then move towards the goal.
            controller = GoToGoal(self.robot.pose, self.robot.current_goal, self.robot.pid_metadata)
            steering_input, pid_metadata = controller.calculate_steering_inputs()

            payload['payload'] = {
                'steering_input': steering_input,
                'pid_metadata': pid_metadata,
            }

        return payload
