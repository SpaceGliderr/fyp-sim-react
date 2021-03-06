from math import sqrt
from typing import List
import cv2
import numpy as np

from algorithm.controllers.path_planning.astar.node import AStarNode
from models.point import Point
import src.settings as settings


class AStar:
    def __init__(self, final_map):
        self.final_map = final_map
        self.width = self.final_map.shape[1]
        self.height = self.final_map.shape[0]

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
        self.max_iterations = 3000

        # Initialize window related variables
        self.validity_window_size = int(settings.ROBOT_RADIUS_IN_PX + settings.PX_AWAY_FROM_OBSTACLE)
        self.validity_window = np.full((self.validity_window_size * 2, self.validity_window_size * 2), 255, dtype=np.uint8)
        self.path_cost_window_size = self.validity_window_size + settings.WINDOW_BUFFER_PX


    def is_point_valid(self, point: Point):
        """
        Returns True if the point is valid
        """
        window = self.get_window(point, self.validity_window_size)
        inverse_window = cv2.bitwise_not(window)
        result = cv2.bitwise_and(inverse_window, self.validity_window)
        return not np.sum(result) >= 255


    def calculate_euclidean_distance(self, p1: Point, p2: Point):
        return sqrt(pow(p1.x - p2.x, 2) + pow(p1.y - p2.y, 2))


    def get_sizes(self, point: Point, size: int):
        """
        Returns the sizes of the window
        """
        x, y = point.unpack()
        return x - size, y - size, x + size, y + size


    def get_window(self, point: Point, size: int):
        """
        Returns a window of size window_size around the point
        """
        window = np.zeros((size * 2, size * 2), dtype=np.uint8)

        x_min, y_min, x_max, y_max = self.get_sizes(point, size)

        start_x = 0
        end_x = size * 2
        start_y = 0
        end_y = size * 2

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
        
        window[int(start_y):int(end_y), int(start_x):int(end_x)] = self.final_map[int(y_min):int(y_max), int(x_min):int(x_max)]

        return window


    def calculate_path_cost(self, point: Point):
        """
        Calculates the path cost of moving from one node to another
        """
        window = self.get_window(point, self.path_cost_window_size)
        inverse_window = cv2.bitwise_not(window)

        row, col = inverse_window.shape

        return np.sum(inverse_window) / (row * col)


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
    
        
    def search(self, start_point: Point, goal_point: Point):
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

        # Iterations
        iterations = 0

        while not is_goal_found and iterations < self.max_iterations:
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

            iterations = iterations + 1

        if goal_node is None:
            print("Could not find goal with max iterations")
            return ["Max Iterations Reached"]

        print("Found goal with max iterations: " + str(iterations))

        # # Get the path from the goal node
        path = [goal_node.point]
        while goal_node.parent is not None:
            path.insert(0, goal_node.parent)
            for explored_node in explored:
                if explored_node.point == goal_node.parent:
                    goal_node = explored_node
                    break

        return path
