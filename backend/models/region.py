from typing import List

from models.point import Point


class Region:
    def __init__(self, id: int, points: List[Point], entry_points: List[Point], connected_region_ids: List[int]):
        self.id = id
        self.points = points
        self.connected_region_ids = connected_region_ids
        self.entry_points = self.generate_entry_point_dict_array(entry_points)
        self.start_point = self.points[0]
        self.end_point = self.points[2]


    def generate_entry_point_dict_array(self, entry_points: List[Point]):
        """
        Generates a dictionary of entry points
        """
        entry_point_dict_array = []

        for idx, entry_point in enumerate(entry_points):
            entry_point_dict = {}

            entry_point_dict["region_id"] = self.connected_region_ids[idx]
            entry_point_dict["entry_point"] = entry_point

            entry_point_dict_array.append(entry_point_dict)

        return entry_point_dict_array


    def get_entry_point(self, region_id: int):
        """
        Returns the entry point of a region
        """
        for entry_point in self.entry_points:
            if entry_point["region_id"] == region_id:
                return entry_point["entry_point"]


    def is_point_within_region(self, point: Point):
        """
        Checks if a point is within the region
        """
        return point.x >= self.start_point.x and point.x <= self.end_point.x and point.y >= self.start_point.y and point.y <= self.end_point.y

    
    def is_connected_to_region(self, region):
        """
        Checks if the region is connected to a region with the given id
        """
        return region.id in self.connected_region_ids
