import json
import os
from posixpath import dirname
from typing import List

import cv2
from algorithm.controllers.mapping.mapping import SensorReadingsPerRegion
from models.region import Region
from src.api_models import _Mapping
from src.api_models import _Robot
from models.point import Point
from models.pose import Pose
import src.settings as settings


def uni_to_diff(velocity, omega):
    """
    Translates the unicycle model input to the differential model input
    From the website: https://www.toptal.com/robotics/programming-a-robot-an-introductory-tutorial
    """
    radius = settings.WHEEL_RADIUS_IN_PX
    length = settings.WHEEL_BASE_LENGTH_IN_PX

    velocityL = ((2.0 * velocity) - (omega * length)) / (2.0 * radius)
    velocityR = ((2.0 * velocity) + (omega * length)) / (2.0 * radius)

    return velocityL, velocityR


def transform_sensor_readings(sensor_readings):
    """Transforms the sensor readings to a list of points"""
    points: List[Point] = []
    for sensor_reading in sensor_readings:
        points.append(Point(sensor_reading.reading.x, sensor_reading.reading.y))
    return points


def transform_robot_api_model(robot: _Robot):
    """Transforms the _Robot API model to return a Robot class"""
    pose: Pose = Pose(Point(robot.pose.vector.x, robot.pose.vector.y), robot.pose.theta)
    if (robot.current_goal is not None):
        current_goal: Point = Point(robot.current_goal.x, robot.current_goal.y)
    else:
        current_goal = None
    
    mapping_goals: List[Point] = []
    if (len(robot.mapping_goals) > 0):
        for goal in robot.mapping_goals:
            mapping_goals.append(Point(goal.x, goal.y))

    leader_position = Point(robot.leader_position.x, robot.leader_position.y)
    
    return robot.id, pose, robot.sensor_readings, current_goal, robot.pid_metadata, robot.robots_within_signal_range, mapping_goals, robot.status, transform_sensor_readings(robot.ir_sensors), robot.front_sensor_distances, leader_position


def transform_mapping_api_model(mapping: _Mapping):
    sensor_readings_per_region: List[SensorReadingsPerRegion] = []

    for sensor_readings in mapping.sensor_readings_per_region:
        
        readings = []
        for reading in sensor_readings.sensor_readings:
            readings.append(Point(reading.x, reading.y))
        
        sensor_readings_per_region.append(SensorReadingsPerRegion(sensor_readings.region_number, readings))

    regions: List[Region] = []
    region_points: List[Point] = []
    for region in mapping.regions:
        points = []
        for point in region.points:
            points.append(Point(point.x, point.y))

        region_points.append(points)

        entry_points = []
        for entry_point in region.entry_points:
            entry_points.append(Point(entry_point.x, entry_point.y))

        regions.append(Region(region.id, points, entry_points, region.connected_region_ids))

    return mapping.width, mapping.height, mapping.number_of_regions, region_points, sensor_readings_per_region


def save_image(name: str, dir: str, content):
    cv2.imwrite(f'{dir}{name}', content)
