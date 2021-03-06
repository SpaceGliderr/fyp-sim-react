from math import cos, sin, sqrt
from typing import List
import cv2
import numpy as np
from algorithm.controllers.path_planning.bfs.bfs import BFS
from algorithm.controllers.path_planning.graph import Graph
from algorithm.controllers.path_planning.astar.astar import AStar
from models.region import Region
import src.settings as settings
from models.point import Point
from models.pose import Pose
import sys

class PathToGoal:
    def __init__(self, initial_pose: Pose, goal_point: Point, regions: List[Region]):
        np.set_printoptions(threshold=sys.maxsize)

        # Initialize constructor variables
        self.initial_pose = initial_pose
        self.goal_point = goal_point

        # Initialize final map array and associated metadata
        self.final_map_path = "./algorithm/controllers/mapping/maps/final_map_opened.png"
        self.final_map = cv2.imread(self.final_map_path, cv2.IMREAD_GRAYSCALE)

        # Initialize regions
        self.regions = regions

        # Graph
        self.graph = Graph(len(self.regions))
        self.init_graph()

        # Initialize miscellaneous variables
        self.save_dir = "./algorithm/controllers/path_planning/"

        # Initialize Search algorithms
        self.a_star = AStar(self.final_map)
        self.bfs = BFS(self.graph)

    
    def init_graph(self):
        """
        Initialize the adjacency matrix graph
        """
        for region in self.regions:
            for region_id in region.connected_region_ids:
                self.graph.add_edge(region.id, region_id)


    def get_region_from_point(self, point: Point):
        """
        Returns the region containing the point
        """
        return list(filter(lambda x: x.is_point_within_region(point), self.regions))[0]

    
    def visualize(self, path: List[Point]):
        """
        Visualizes the A* algorithm
        """
        path_map = self.final_map.copy()

        for point in path:
            path_map[point.y][point.x] = 100
        
        cv2.imwrite(f'{self.save_dir}{"path_map.png"}', path_map)

    
    def get_navigation_path(self, start_region: Region, goal_region: Region):
        """
        Returns the navigation path from start to goal
        """
        path = self.bfs.search(start_region.id, goal_region.id)
        
        if len(path) == 0:
            return [self.initial_pose.point, self.goal_point]

        navigation_paths = [self.initial_pose.point]
        for idx, p in enumerate(path):
            if idx == len(path) - 1:
                break
            navigation_paths.append(self.regions[path[idx + 1]].get_entry_point(p))
        navigation_paths.append(self.goal_point)

        return navigation_paths

    
    def execute(self):
        """
        Executes the regional A* algorithm
        """
        if not self.a_star.is_point_valid(self.goal_point):
            return []
        
        initial_pose_region = self.get_region_from_point(self.initial_pose.point),
        initial_pose_region = initial_pose_region[0]
        goal_point_region = self.get_region_from_point(self.goal_point)
        
        navigation_points = self.get_navigation_path(initial_pose_region, goal_point_region)
        navigation_paths = []

        for idx, point in enumerate(navigation_points):
            # Last point is the goal, therefore it is not counted
            if idx == len(navigation_points) - 1:
                break
            
            end_point = navigation_points[idx + 1]

            # Trigger the A Star algorithm
            path = self.a_star.search(point.round(), end_point)

            if isinstance(path[0], str):
                navigation_paths = path
                break

            # Add the path to the navigation paths
            navigation_paths.append(path)

        # Visualize the navigation paths
        if not isinstance(path[0], str):
            self.visualize(list(np.concatenate(navigation_paths).flat))

        return navigation_paths
