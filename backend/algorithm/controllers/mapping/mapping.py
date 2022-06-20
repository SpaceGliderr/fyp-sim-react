import json
from typing import List

import numpy as np
from models.region import Region
from src.api_models import _SensorReading
from models.point import Point
import cv2
import src.utils as utils

class SensorReadingsPerRegion:
    def __init__(self, region_number: int, sensor_readings: List[Point]):
        self.region_number = region_number
        self.sensor_readings = sensor_readings


class Mapping:
    def __init__(self, width: int, height: int, number_of_regions: int, region_points: List[List[Point]], sensor_readings: List[SensorReadingsPerRegion]):
        self.map_file_path = "./algorithm/controllers/mapping/map.json"
        self.width = width
        self.height = height
        self.region_points = region_points
        self.sensor_readings = sensor_readings
        self.number_of_regions = number_of_regions
        self.save_dir = "./algorithm/controllers/mapping/maps/"


    def convert_readings_to_tuples(self, readings: List[Point], toRound=True):
        points = []
        for reading in readings:
            if (toRound):
                points.append((round(reading.x), round(reading.y)))
            else:
                points.append((reading.x, reading.y))
        return points

    
    def convert_regions_to_tuples(self, toRound=True):
        """Converts regions to tuples"""
        regions = []

        for region in self.region_points:
            points = []
            for point in region:
                if (toRound):
                    points.append((round(point.x), round(point.y)))
                else:
                    points.append((point.x, point.y))
            regions.append(points)
        
        return regions

    
    def convert_sensor_readings_per_region_to_dict(self, toRound=True):
        """Converts sensor readings per region to dictionary"""
        sensor_readings_per_region = []
        for sensor_reading in self.sensor_readings:
            sensor_readings_per_region.append({
                "region_number": sensor_reading.region_number,
                "sensor_readings": self.convert_readings_to_tuples(sensor_reading.sensor_readings, toRound)
            })
        
        return sensor_readings_per_region

    
    def get_region_limits(self, region_number: int):
        # x_min, y_min, x_max, y_max
        return self.region_points[region_number][0].x, self.region_points[region_number][0].y, self.region_points[region_number][2].x, self.region_points[region_number][2].y


    def clear_map_json(self):
        self.save_data_to_file("")


    def store_raw_data(self):
        """"Stores raw data such as sensor readings, just in case it needs to be pre-loaded in"""
        replacement_data = {
            "width": self.width,
            "height": self.height,
            "number_of_regions": self.number_of_regions,
            "regions": self.convert_regions_to_tuples(False),
            "sensor_readings": self.convert_sensor_readings_per_region_to_dict(False)
        }

        self.save_data_to_file(replacement_data)


    def generate_region_map(self, region_number: int):
        """Generates a region map from the data"""
        # Create a mask for the region
        region_map = np.full((self.height + 1, self.width + 1), 255, dtype=np.uint8)
        x_min, y_min, x_max, y_max = self.get_region_limits(region_number)

        sensor_readings = self.convert_sensor_readings_per_region_to_dict()
        
        for reading in sensor_readings[region_number]["sensor_readings"]:
            x, y = reading

            # Check if the reading is within the region
            if (x_min <= x <= x_max and y_min <= y <= y_max):\
                # Set the mask to 0
                region_map[y, x] = 0

        return region_map

    
    def generate_map(self):
        """Generates a map from the data"""
        final_map = np.full((self.height + 1, self.width + 1), 255, dtype=np.uint8)

        for idx, _ in enumerate(self.region_points):
            region_map = self.generate_region_map(idx)
            final_map = cv2.bitwise_and(final_map, region_map)

        final_map_opened = self.apply_opening(final_map, 3, 3)

        utils.save_image("final_map.png", self.save_dir, final_map)
        utils.save_image("final_map_opened.png", self.save_dir, final_map_opened)

    
    def apply_opening(self, image, kernel_size: int, iterations: int):
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (kernel_size, kernel_size))
        return cv2.morphologyEx(image, cv2.MORPH_OPEN, kernel, iterations=iterations)
    
    
    def save_data_to_file(self, replacement_data):
        # Dump data to file
        with open(self.map_file_path, "w") as map_file:
            map_file.write(json.dumps(replacement_data))
