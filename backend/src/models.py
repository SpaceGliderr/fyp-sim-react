from typing import List, Union
from pydantic import BaseModel


class Point(BaseModel):
    x: float
    y: float


class Pose(BaseModel):
    vector: Point
    theta: float # heading


class SensorReading(BaseModel):
    reading: Point


class Robot(BaseModel):
    id: int
    pose: Pose
    sensor_readings: List[SensorReading]
    current_goal: List[Point] = None # optional, a robot can not have a goal at a given time


class TopologicalEnvironment(BaseModel):
    width: int
    height: int


class Algorithm(BaseModel):
    robots: List[Robot]
    environment: TopologicalEnvironment
