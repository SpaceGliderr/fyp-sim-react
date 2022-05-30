from algorithm.arbiter import Arbiter
from src.api_models import _Algorithm


class BaseAlgorithm:
    def __init__(self, algorithm: _Algorithm) -> None:
        robots = algorithm.robots
        decisions = []

        # Pass the robot into the arbiter class to make the decision for the robot.
        for robot in robots:
            arbiter = Arbiter(robot)
            decisions.append(arbiter.decide())

        pass
