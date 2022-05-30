from backend.algorithm.arbiter import Arbiter
from backend.src.models import Algorithm


class Algorithm:
    def __init__(self, algorithm: Algorithm) -> None:
        robots = algorithm.robots
        decisions = []

        # Pass the robot into the arbiter class to make the decision for the robot.
        for robot in robots:
            arbiter = Arbiter(robot)
            decisions.append(arbiter.decide())

        pass
