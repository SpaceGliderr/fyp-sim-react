from typing import List
from models.point import Point
from models.pose import Pose
from src.api_models import _PIDMetadata, _SensorReading


class Robot:
    def __init__(self, id: int, pose: Pose, sensor_readings: List[_SensorReading], current_goal: Point = None, pid_metadata: _PIDMetadata = None) -> None:
        self.id = id
        self.pose = pose
        self.sensor_readings = sensor_readings
        self.current_goal = current_goal
        self.pid_metadata = pid_metadata
        pass
    pass
