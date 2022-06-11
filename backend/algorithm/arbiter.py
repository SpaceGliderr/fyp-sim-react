from algorithm.controllers.navigation.go_to_goal import GoToGoal
from algorithm.controllers.mapping.mapping import Mapping
from src.api_models import _TopologicalEnvironment
from src.api_models import _PayloadTypes
from models.robot import Robot
from src.utils import transform_robot_api_model
from src.api_models import _Robot


# The arbiter class is a decision making class that decides the next move for the robot.
class Arbiter:
    def __init__(self, robot: _Robot) -> None:
        id, pose, sensor_readings, current_goal, pid_metadata, robots_within_signal_range, mapping_goals, status = transform_robot_api_model(robot)
        self.robot = Robot(id, pose, sensor_readings, mapping_goals, status, current_goal, pid_metadata, robots_within_signal_range)
        self.mapping = Mapping()


    def decide(self) -> None:
        payload = {
            'robot_id': self.robot.id,
            'type': None,
            'payload': None,
        }

        # self.mapping.update_robot_readings(self.robot.id, self.robot.sensor_readings)
        print("STATUS STUFF >>> ", self.robot.status, self.robot.mapping_goals)

        if self.robot.status == "COLLISION":
            pass
        
        elif self.robot.status == "MAPPING" and len(self.robot.mapping_goals) > 0:
            goal = self.robot.mapping_goals[0]
            print("GOAL >>> ", goal.unpack())
            payload['type'] = _PayloadTypes.gtg
            controller = GoToGoal(self.robot.pose, goal, self.robot.pid_metadata)
            steering_input, pid_metadata = controller.calculate_steering_inputs()
            print(steering_input)

            payload['payload'] = {
                'steering_input': steering_input,
                'pid_metadata': pid_metadata,
            }

        elif self.robot.current_goal is not None:
            payload['type'] = _PayloadTypes.gtg
            # If the robot has a goal, then move towards the goal.
            controller = GoToGoal(self.robot.pose, self.robot.current_goal, self.robot.pid_metadata)
            steering_input, pid_metadata = controller.calculate_steering_inputs()

            payload['payload'] = {
                'steering_input': steering_input,
                'pid_metadata': pid_metadata,
            }

        return payload
