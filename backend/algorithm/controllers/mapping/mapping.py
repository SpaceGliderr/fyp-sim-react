import json
from typing import List

import numpy as np
from src.api_models import _SensorReading
from models.point import Point

class SensorReadingsPerRegion:
    def __init__(self, region_number: int, sensor_readings: List[Point]):
        self.region_number = region_number
        self.sensor_readings = sensor_readings


class Mapping:
    def __init__(self, width: int, height: int, regions: List[List[Point]], sensor_readings: SensorReadingsPerRegion):
        self.map_file_path = "./algorithm/controllers/mapping/map.json"
        self.width = width
        self.height = height
        self.regions = regions
        self.sensor_readings = sensor_readings


    def convert_readings_to_tuples(self, readings: List[_SensorReading]):
        points = []
        for reading in readings:
            points.append((round(reading.reading.x, 2), round(reading.reading.y, 2)))
        return points


    def clear_map_json(self):
        self.save_data_to_file("")


    def store_raw_data(self):
        """"Stores raw data such as sensor readings, just in case it needs to be pre-loaded in"""
        replacement_data = {
            "width": self.width,
            "height": self.height,
            "regions": self.regions,
            "sensor_readings": self.sensor_readings
        }

        self.save_data_to_file(replacement_data)


    def store_generated_map(self):
        pass


    def generate_region_map(self):
        """Generates a region map from the data"""
        pass


    def stitch_region_maps(self):
        """Stitches the region maps together"""
        pass

    
    def generate_map(self):
        """Generates a map from the data"""
        print("Generating map")
        pass
    
    
    def save_data_to_file(self, replacement_data):
        # Dump data to file
        with open(self.map_file_path, "w") as map_file:
            map_file.write(json.dumps(replacement_data))
