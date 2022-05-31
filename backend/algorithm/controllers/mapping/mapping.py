from typing import List
from src.api_models import _SensorReading
from models.point import Point


class Mapping:
    def __init__(self, readings: List[_SensorReading]):
        self.points = self.convertReadingsToPoints(readings)


    def convert_readings_to_points(self, readings):
        points = []
        for reading in readings:
            points.append(Point(reading.x, reading.y))
        return points

