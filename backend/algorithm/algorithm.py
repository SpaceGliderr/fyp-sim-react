from algorithm.arbiter import Arbiter
from src.api_models import _Algorithm


class BaseAlgorithm:
    def __init__(self, algorithm: _Algorithm) -> None:
        self.robots = []
        for robot in algorithm.robots:
            self.robots.append(robot)
        # robots = algorithm.robots
        self.environment = algorithm.environment
        
    def makeDecisions(self):
        decisions = []

        # Pass the robot into the arbiter class to make the decision for the robot.
        for robot in self.robots:
            arbiter = Arbiter(robot)
            decisions.append(arbiter.execute())

        return decisions
