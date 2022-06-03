from dataclasses import replace
import json
from typing import List

import numpy as np
from src.api_models import _Algorithm
from src.api_models import _SensorReading
from models.point import Point


class Mapping:
    def __init__(self):
        self.map_file_path = "./algorithm/controllers/mapping/map.json"


    def convert_readings_to_tuples(self, readings: List[_SensorReading]):
        points = []
        for reading in readings:
            points.append((round(reading.reading.x, 2), round(reading.reading.y, 2)))
        return points

    
    def initialize_map_json(self, algorithm: _Algorithm):
        replacement_data = {}

        with open(self.map_file_path, "r") as map_file:
            data = json.loads(map_file.read())

            # Setup environment JSON
            data["environment_details"]["width"] = algorithm.environment.width
            data["environment_details"]["height"] = algorithm.environment.height

            # Setup robots JSON
            robotsJSON = {}
            for robot in algorithm.robots:
                robotsJSON[str(robot.id)] = []

            data["robots"] = robotsJSON

            replacement_data = data
        
        self.save_data_to_file(replacement_data)

    
    def update_robot_readings(self, robot_id: int, readings: List[_SensorReading]):
        points = self.convert_readings_to_tuples(readings)

        replacement_data = {}

        print("POINTS >>>> ", points)

        with open(self.map_file_path, "r") as map_file:
            try:
                data = json.loads(map_file.read())

                # Update robot readings JSON
                # print(data["robots"][str(robot_id)])
                # print("POINTS >>>> ", points)

                updated_readings_array = []

                if (len(data["robots"][str(robot_id)]) == 0):
                    updated_readings_array = points
                else:
                    # updated_readings_array = np.unique(np.concatenate((data["robots"][str(robot_id)], points)))
                    print('AJSBFALKJSDGBAJLKBSDGLJB >>> ', np.concatenate((data["robots"][str(robot_id)], points)))
                
                if (len(updated_readings_array) > 0):
                    data["robots"][str(robot_id)] = updated_readings_array
                    print("UPDATED READINGS ARRAY >>>> ", updated_readings_array)

                # data["robots"][str(robot_id)] = updated_readings_array

                replacement_data = data

                print(replacement_data)

                self.save_data_to_file(replacement_data)
            
            except Exception as e:
                print(e)

    
    def save_data_to_file(self, replacement_data):
        # Dump data to file
        with open(self.map_file_path, "w") as map_file:
            map_file.write(json.dumps(replacement_data))
