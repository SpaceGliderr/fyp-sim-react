from enum import Enum
from typing import List
from pydantic import BaseModel


class _Point(BaseModel):
    x: float
    y: float


class _Pose(BaseModel):
    vector: _Point
    theta: float # heading


class _SensorReading(BaseModel):
    reading: _Point


class _PIDMetadata(BaseModel):
    prev_eP: float
    prev_eI: float


class _Robot(BaseModel):
    id: int
    pose: _Pose
    sensor_readings: List[_SensorReading]
    current_goal: _Point = None # optional, a robot can not have a goal at a given time
    pid_metadata: _PIDMetadata # optional, pid metadata for the robot


class _TopologicalEnvironment(BaseModel):
    width: int
    height: int


class _Algorithm(BaseModel):
    robots: List[_Robot]
    environment: _TopologicalEnvironment


class _PayloadTypes(Enum):
    gtg = 1 # Go To Goal payload type.
    fw = 2 # Follow Wall payload type.
    ao = 3 # Avoid Obstacle payload type.
