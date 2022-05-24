from typing import List
from pydantic import BaseModel


class Point(BaseModel):
    x: float
    y: float


class Pose(BaseModel):
    point: Point
    theta: float # heading


class SensorReading(BaseModel):
    pose: Pose


class Robot(BaseModel):
    id: int
    pose: Pose
    sensor_readings: List[SensorReading]
    goal: Point = None # optional, a robot can not have a goal at a given time


class TopologicalEnvironment(BaseModel):
    width: int
    height: int


class Algorithm(BaseModel):
    robots: List[Robot]
    environment: TopologicalEnvironment
