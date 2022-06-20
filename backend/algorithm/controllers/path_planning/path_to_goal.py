from math import cos, sin, sqrt
from typing import List
import cv2
import numpy as np
from algorithm.controllers.path_planning.bfs.bfs import BFS
from algorithm.controllers.path_planning.graph import Graph
from node import AStarNode
# import src.settings as settings
# from models.point import Point
# from models.pose import Pose
import sys


# TODO: Remove Point, Pose, Region once algorithm is implemented finished
class Point:
    def __init__(self, x: float, y: float) -> None:
        self.x = x
        self.y = y


    def add(self, other):
        """Returns the sum of two points."""
        return Point(self.x + other.x, self.y + other.y)


    def subtract(self, other):
        """Returns the difference of two points."""
        return Point(self.x - other.x, self.y - other.y)

    
    def equal(self, other):
        """Returns True if the points are equal."""
        return self.x == other.x and self.y == other.y


    def scale(self, scale: float):
        """
        Scale a vector by a scale factor
        """
        x, y = self.unpack()
        return Point(x * scale, y * scale)


    def unpack(self):
        """Returns the x, y of the point."""
        return self.x, self.y


    def rotate_vector(self, theta: float):
        """
        Rotate a vector by theta radians
        """
        x, y = self.unpack()

        rotatedX = x * cos(theta) - y * sin(theta)
        rotatedY = x * sin(theta) + y * cos(theta)

        return Point(rotatedX, rotatedY)


    def rotate_and_translate(self, point, theta: float):
        """
        Rotate and translate a vector by theta radians
        """
        rotatedPoint = self.rotate_vector(theta)
        return rotatedPoint.add(point)


class Pose:
    def __init__(self, point: Point, theta: float) -> None:
        self.point = point
        self.theta = theta

    
    def inverse(self):
        """Returns the inverse of the pose."""
        inverse_pose = Pose(Point(-self.point.x, -self.point.y), -self.theta)
        result_point = inverse_pose.rotate()
        return Pose(result_point, -self.theta)


    def rotate(self):
        """
        Rotate a vector by theta radians
        """
        x, y = self.point.unpack()

        rotatedX = x * cos(self.theta) - y * sin(self.theta)
        rotatedY = x * sin(self.theta) + y * cos(self.theta)
        
        return Point(rotatedX, rotatedY)

    
    def unpack(self):
        """Returns the x, y, theta of the pose."""
        return self.point.x, self.point.y, self.theta


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


class PathToGoal:
    def __init__(self, initial_pose: Pose, goal_point: Point):
        np.set_printoptions(threshold=sys.maxsize)

        # Initialize constructor variables
        self.initial_pose = initial_pose
        self.goal_point = goal_point

        # Initialize final map array and associated metadata
        self.final_map_path = "./algorithm/controllers/mapping/maps/final_map_opened.png"
        self.final_map = cv2.imread(self.final_map_path, cv2.IMREAD_GRAYSCALE)
        self.width = self.final_map.shape[1]
        self.height = self.final_map.shape[0]

        # Initialize window related variables
        self.window_size = int(14 + 3)
        self.window_mask = np.pad(np.full((30, 30), 255, dtype=np.uint8), 2, mode="constant")

        # Initialize A* variables
        self.actions = [
            Point(-1, -1),
            Point(0, -1),
            Point(1, -1),
            Point(1, 0),
            Point(1, 1),
            Point(0, 1),
            Point(-1, 1),
            Point(-1, 0)
        ]
        self.number_of_nodes = 0
        self.number_of_expansions = 0

        # Initialize regions
        self.regions = [
            Region(0, [
                Point(0, 0),
                Point(1120, 0),
                Point(1120, 300),
                Point(0, 300),
            ], [Point(470, 300), Point(1040, 300)], [1, 2]),
            Region(1, [
                Point(0, 300),
                Point(590, 300),
                Point(590, 760),
                Point(0, 760),
            ], [Point(470, 300)], [0]),
            Region(2, [
                Point(590, 300),
                Point(1120, 300),
                Point(1120, 760),
                Point(590, 760),
            ], [Point(1040, 300)], [0])
        ]

        # Graph
        self.graph = Graph(len(self.regions))
        self.init_graph()

        # Initialize miscellaneous variables
        self.save_dir = "./algorithm/controllers/path_planning/"

    
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

    
    def is_point_valid(self, point: Point):
        """
        Returns True if the point is valid
        """
        window = self.get_window(point)
        inverse_window = cv2.bitwise_not(window)
        result = cv2.bitwise_and(inverse_window, self.window_mask)
        return not np.sum(result) >= 255


    def calculate_euclidean_distance(self, p1: Point, p2: Point):
        return sqrt(pow(p1.x - p2.x, 2) + pow(p1.y - p2.y, 2))

    
    def get_sizes(self, point: Point):
        """
        Returns the sizes of the window
        """
        x, y = point.unpack()
        return x - self.window_size, y - self.window_size, x + self.window_size, y + self.window_size


    def get_window(self, point: Point):
        """
        Returns a window of size window_size around the point
        """
        window = np.zeros((34, 34), dtype=np.uint8)

        x_min, y_min, x_max, y_max = self.get_sizes(point)

        start_x = 0
        end_x = self.window_size * 2
        start_y = 0
        end_y = self.window_size * 2

        if x_min < 0:
            start_x = abs(x_min)
            x_min = 0
        if y_min < 0:
            start_y = abs(y_min)
            y_min = 0
        if x_max > self.width:
            end_x = abs(self.width - x_max)
            x_max = self.width
        if y_max > self.height:
            end_y = abs(self.height - y_max)
            y_max = self.height
        
        window[start_y:end_y, start_x:end_x] = self.final_map[y_min:y_max, x_min:x_max]

        return window


    def calculate_path_cost(self, point: Point):
        """
        Calculates the path cost of moving from one node to another
        """
        window = self.get_window(point)
        inverse_window = cv2.bitwise_not(window)
        return np.sum(inverse_window)


    def get_total_cost(self, p1: Point, p2: Point):
        """
        Returns the total F cost of the point
        """
        return self.calculate_path_cost(p1) + self.calculate_euclidean_distance(p1, p2)


    def get_neighbours(self, point: Point):
        """
        Returns a list of neighbours of the point
        """
        neighbours = []
        for action in self.actions:
            neighbours.append(point.add(action))
        return neighbours


    def expand_and_return_children(self, node: AStarNode):
        """
        Expands the node and returns a list of children
        """
        self.number_of_expansions += 1
        node.expansion_sequence = self.number_of_expansions

        children = []

        for neighbour in self.get_neighbours(node.point):
            if (neighbour.x in range(0, self.width) and neighbour.y in range(0, self.height) and self.is_point_valid(neighbour)):
                self.number_of_nodes += 1
                children.append(AStarNode(self.number_of_nodes, -1, neighbour, parent=node.point))

        return children


    def a_star(self, start_point: Point, goal_point: Point):
        """
        Executes the A* algorithm
        """
        frontier: List[AStarNode] = []
        explored = []
        removed = []
        is_goal_found = False
        goal_node: AStarNode = None

        self.number_of_nodes += 1

        # initial path cost of g is 0
        initial_f = self.calculate_euclidean_distance(start_point, goal_point)
        frontier.append(AStarNode(self.number_of_nodes, self.number_of_expansions, start_point, initial_f))

        while not is_goal_found:
            # Goal test before expansion
            if frontier[0].point.equal(goal_point):
                goal_node = frontier[0]
                break

            # Get children paths of the first frontier element
            children = self.expand_and_return_children(frontier[0])
            frontier[0].add_children(children)

            # Put the first element of the frontier to the explored array
            explored.append(frontier[0])

            # Remove the first element of the frontier
            del frontier[0]

            for child in children:
                if not np.any([child.point.equal(e.point) for e in explored]) and not np.any([child.point.equal(f.point) for f in frontier]):
                    child.f = self.get_total_cost(child.point, goal_point)
                    frontier.append(child)
                else:
                    child.removed = True
                    removed.append(child)

            # Sort the frontier by the F cost
            frontier.sort(key=lambda x: x.f)

        # # Get the path from the goal node
        path = [goal_node.point]
        while goal_node.parent is not None:
            path.insert(0, goal_node.parent)
            for explored_node in explored:
                if explored_node.point == goal_node.parent:
                    goal_node = explored_node
                    break

        return path

    
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
        path = BFS(self.graph).search(start_region.id, goal_region.id)

        if len(path) == 0:
            return [self.initial_pose.point, self.goal_point]

        navigation_paths = []
        for idx, p in enumerate(path):
            if p == start_region.id:
                navigation_paths.append(self.initial_pose.point)
            elif p == goal_region.id:
                navigation_paths.append(self.goal_point)
            else:
                navigation_paths.append(self.regions[path[idx - 1]].get_entry_point(p))
                navigation_paths.append(self.regions[path[idx + 1]].get_entry_point(p))
        
        return navigation_paths

    
    def execute(self):
        """
        Executes the regional A* algorithm
        """
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
            path = self.a_star(point, end_point)

            # Add the path to the navigation paths
            navigation_paths.append(path)

        # TODO: Remove this once the algorithm is fully implemented
        # Visualize the navigation paths
        self.visualize(list(np.concatenate(navigation_paths).flat))


# TODO: Remove this once the path planning is fully implemented
if __name__ == "__main__":
    # Test execution of A star algorithm on the final map
    path_to_goal = PathToGoal(Pose(Point(460, 460), 0), Point(1040, 420))
    path_to_goal.execute()
    # print(path_to_goal.graph.matrix)
