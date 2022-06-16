from ast import AST
from math import sqrt
from typing import List
import cv2
import numpy as np
from algorithm.controllers.path_planning.node import AStarNode
import src.settings as settings
from models.point import Point
from models.pose import Pose


class PathToGoal:
    def __init__(self, initial_pose: Pose, goal_point: Point):
        self.initial_pose = initial_pose
        self.goal_point = goal_point

        self.final_map_path = "./algorithm/controllers/mapping/maps/final_map.png"
        self.final_map = cv2.imread(self.final_map_path)
        self.width, self.height = self.final_map.shape
        self.window_size = int(settings.ROBOT_RADIUS_IN_PX + settings.WINDOW_OFFSET_IN_PX)
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


    def calculateEuclideanDistance(self, p1: Point, p2: Point):
        return sqrt(pow(p1.x - p2.x, 2) + pow(p1.y - p2.y, 2))


    def getWindow(self, point: Point):
        """
        Returns a window of size window_size around the point
        """
        x, y = point.unpack()
        window = self.final_map[y - self.window_size : y + self.window_size, x - self.window_size : x + self.window_size]
        return window


    def calculatePathCost(self, point: Point):
        """
        Calculates the path cost of moving from one node to another
        """
        window = self.getWindow(point)
        inverse_window = cv2.bitwise_not(window)

        # NOTE: We can update the path cost here by adding weights to a mask
        path_cost = np.sum(inverse_window)
        
        return path_cost


    def getTotalCost(self, p1: Point, p2: Point):
        """
        Returns the total F cost of the point
        """
        return self.calculatePathCost(p2) + self.calculateEuclideanDistance(p1, p2)


    def getNeighbours(self, point: Point):
        """
        Returns a list of neighbours of the point
        """
        neighbours = []
        for action in self.actions:
            neighbours.append(point.add(action))
        return neighbours


    def expandAndReturnChildren(self, node: AStarNode):
        """
        Expands the node and returns a list of children
        """
        self.number_of_expansions += 1
        node.expansion_sequence = self.number_of_expansions

        children = []

        for neighbour in self.getNeighbours(node.point):
            if (neighbour.x in range(0, self.width) and neighbour.y in range(0, self.height)):
                self.number_of_nodes += 1
                children.append(AStarNode(self.number_of_nodes, -1, neighbour, node.point))

        return children


    def execute(self):
        """
        Executes the A* algorithm
        """
        frontier: List[AStarNode] = []
        explored = []
        removed = []
        is_goal_found = False
        goal_node: AStarNode = None

        self.number_of_nodes += 1

        initial_f = self.getTotalCost(self.initial_pose.point, self.goal_point)
        frontier.append(AStarNode(self.number_of_nodes, self.number_of_expansions, self.initial_pose.point, initial_f))

        while not is_goal_found:
            # Goal test before expansion

            # Get children paths of the first frontier element
            children = self.expandAndReturnChildren(frontier[0])
            frontier[0].add_children(children)

            # Put the first element of the frontier to the explored array
            explored.append(frontier[0])

            # Remove the first element of the frontier
            frontier.pop(0)

            for child in children:
                if not (child.point in [e.point for e in explored] and not (child.point in [f.point for f in frontier])):
                    child.f = self.getTotalCost(child.point, self.goal_point)

                    frontier.append(child)
                else:
                    child.removed = True
                    removed.append(child)

            # Sort the frontier by the F cost
            frontier.sort(key=lambda x: x.f)


        # Get the path from the goal node
        path = [goal_node.point]
        while goal_node.parent is not None:
            path.insert(0, goal_node.parent)
            for explored_node in explored:
                if explored_node.point == goal_node.parent:
                    goal_node = explored_node
                    break
