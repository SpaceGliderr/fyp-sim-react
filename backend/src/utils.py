import json
from posixpath import dirname
from typing import List
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
    
    # Not sure whether we allow the robot wheel to reverse, therefore, any negative drive rates will be set to 0.
    # TODO: Might have to remove this restriction, don't know what effects it has on the error terms in the calculation of steering inputs.
    # if (velocityL < 0):
    #     velocityL = 0
    # if (velocityR < 0):
    #     velocityR = 0

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
    
    return robot.id, pose, robot.sensor_readings, current_goal, robot.pid_metadata, robot.robots_within_signal_range, mapping_goals, robot.status, transform_sensor_readings(robot.ir_sensors)


def clear_map_json():    
    # Load map_template.json file
    template_file = open("./algorithm/controllers/mapping/template_map.json")
    template = json.load(template_file)

    # Replace map.json file with template data
    with open('./algorithm/controllers/mapping/map.json', 'w') as map_file:
        map_file.write(json.dumps(template))

    template_file.close()
