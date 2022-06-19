from math import cos, sin, sqrt
from typing import List
import cv2
import numpy as np
from node import AStarNode
# import src.settings as settings
# from models.point import Point
# from models.pose import Pose
import sys


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
        self.entry_points = entry_points
        self.start_point = self.points[0]
        self.end_point = self.points[3]


    def is_point_within_region(self, point: Point):
        """
        Checks if a point is within the region
        """
        return point.x >= self.start_point.x and point.x <= self.end_point.x and point.y >= self.start_point.y and point.y <= self.end_point.y

    
    def is_connected_to_region_id(self, region_id: int):
        """
        Checks if the region is connected to a region with the given id
        """
        return region_id in self.connected_region_ids


class PathToGoal:
    def __init__(self, initial_pose: Pose, goal_point: Point):
        np.set_printoptions(threshold=sys.maxsize)

        self.initial_pose = initial_pose
        self.goal_point = goal_point

        self.final_map_path = "./algorithm/controllers/mapping/maps/final_map.png"
        self.final_map = cv2.imread(self.final_map_path, cv2.IMREAD_GRAYSCALE)
        self.width = self.final_map.shape[1]
        self.height = self.final_map.shape[0]
        self.window_size = int(14 + 3)
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

        self.save_dir = "./algorithm/controllers/path_planning/"
        # self.window_mask_path = self.save_dir + "window_mask.png"
        # self.window_mask = cv2.imread(self.window_mask_path, cv2.IMREAD_GRAYSCALE)
        # print(self.window_mask)
        # cv2.imwrite(f"{self.save_dir}window_mask.png", self.mask)
        self.window_mask = np.pad(np.full((30, 30), 255, dtype=np.uint8), 2, mode="constant")
        self.window_mask_path = self.save_dir + "window_mask_2.png"

        self.regions = [
            Region(0, [
                Point(0, 0),
                Point(420, 0),
                Point(420, 640),
                Point(0, 640)
            ], [Point(480, 470)], [1]),
            Region(1, [
                Point(420, 0),
                Point(840, 0),
                Point(840, 640),
                Point(420, 640)
            ], [Point(480, 470)], [0])
        ]


    def get_region_id_from_point(self, point: Point):
        """
        Returns the region id of the region containing the point
        """
        for region in self.regions:
            if region.is_point_within_region(point):
                return region.id


    # def region_is_connected(self, region_id: int):
    #     """
    #     Returns True if the region is connected to another region
    #     """
    #     for region in self.regions:
    #         return region.is_connected_to_region_id(region_id)

    
    def is_point_valid(self, point: Point):
        """
        Returns True if the point is valid
        """
        window = self.get_window(point)
        # print(window)
        inverse_window = cv2.bitwise_not(window)
        # print(inverse_window)
        result = cv2.bitwise_and(inverse_window, self.window_mask)
        # print(result)
        # Means the point is invalid
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
        
        # print(x_min, y_min, x_max, y_max)
        # print(start_x, start_y, end_x, end_y)
        # print(self.final_map[y_min:y_max, x_min:x_max])
        window[start_y:end_y, start_x:end_x] = self.final_map[y_min:y_max, x_min:x_max]
        # print(window)

        return window

        # diff_x = 0
        # diff_y = 0

        # if (x_min < 0):
        #     diff_x = abs(x_min)
        #     x_min = 0
        # if (y_min < 0):
        #     diff_y = abs(y_min)
        #     y_min = 0
        # if (x_max > self.width):
        #     diff_x = abs(self.width - x_max)
        #     x_max = self.width
        # if (y_max > self.height):
        #     diff_y = abs(self.height - y_max)
        #     y_max = self.height

        # offset_x = self.window_size - diff_x

        # y_oob = diff_y * self.window_size
        # x_oob = diff_x * offset_x
        # oob = y_oob + x_oob

        # window = self.final_map[y_min : y_max, x_min : x_max]
        # # print(window.shape)
        # return window, oob


    def calculate_path_cost(self, point: Point):
        """
        Calculates the path cost of moving from one node to another
        """
        # window, oob = self.get_window(point)
        window = self.get_window(point)

        inverse_window = cv2.bitwise_not(window)

        # NOTE: We can update the path cost here by adding weights to a mask
        # path_cost = np.sum(inverse_window) + (oob * 255)
        path_cost = np.sum(inverse_window)
        
        return path_cost


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


    def a_star(self):
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
        initial_f = self.calculate_euclidean_distance(self.initial_pose.point, self.goal_point)
        frontier.append(AStarNode(self.number_of_nodes, self.number_of_expansions, self.initial_pose.point, initial_f))

        # Goal test before expansion
        # if frontier[0].point == self.goal_point:
        #     goal_node = frontier[0]
        #     break

        # Get children paths of the first frontier element
        # children = self.expand_and_return_children(frontier[0])
        # frontier[0].add_children(children)
        # print([(c.point.x, c.point.y) for c in frontier[0].children])

        # # Put the first element of the frontier to the explored array
        # explored.append(frontier[0])
        # print(explored)

        # # Remove the first element of the frontier
        # del frontier[0]
        # print(frontier)

        # for child in children:
        #     if not (child.point in [e.point for e in explored] and not (child.point in [f.point for f in frontier])):
        #         child.f = self.get_total_cost(child.point, self.goal_point)
        #         frontier.append(child)
        #     else:
        #         child.removed = True
        #         removed.append(child)

        # print([c.f for c in children])

        # # # Sort the frontier by the F cost
        # frontier.sort(key=lambda x: x.f)
        # print([(f.point.x, f.point.y, f.f) for f in frontier])

        # for f in frontier:
        #     print(f.__str__())

        # if (frontier[0].point.equal(Point(259, 441))):
        #     print("Goal found")

        # for i in range(0, 10):
        #     print("Frontier: " + frontier[0].point.unpack())

        #     children = self.expand_and_return_children(frontier[0])
        #     print("Children: ", [(c.point.x, c.point.y) for c in frontier[0].children])
            
        #     frontier[0].add_children(children)
        #     print("Frontier Children: ", [(c.point.x, c.point.y) for c in frontier[0].children])

        #     explored.append(frontier[0])
        #     print("Explored: ", [(e.point.x, e.point.y) for e in explored])

        #     del frontier[0]
        #     print("New Frontier: ", [(f.point.x, f.point.y) for f in frontier])

        #     for child in children:
        #         if not (child.point in [e.point for e in explored] and not (child.point in [f.point for f in frontier])):
        #             child.f = self.get_total_cost(child.point, self.goal_point)
        #             frontier.append(child)
        #         else:
        #             child.removed = True
        #             removed.append(child)

        #     frontier.sort(key=lambda x: x.f)
        #     print([(f.point.x, f.point.y, f.f) for f in frontier])

        # for _ in range(0, 1):
        while not is_goal_found:
            # Goal test before expansion
            if frontier[0].point.equal(self.goal_point):
                goal_node = frontier[0]
                break

            print(f"Frontier: {frontier[0].point.unpack()} {frontier[0].f}")
            # if np.any([frontier[0].point.equal(e.point) for e in explored]):
            #     print("INFINITE LOOP")

            # Get children paths of the first frontier element
            children = self.expand_and_return_children(frontier[0])
            frontier[0].add_children(children)

            # Put the first element of the frontier to the explored array
            explored.append(frontier[0])

            # Remove the first element of the frontier
            del frontier[0]

            for child in children:
                # print(np.any([child.point.equal(e.point) for e in explored]))
                if not np.any([child.point.equal(e.point) for e in explored]) and not np.any([child.point.equal(f.point) for f in frontier]):
                    # child.f = self.get_total_cost(child.point, self.goal_point)
                    child.f = self.calculate_euclidean_distance(child.point, self.goal_point)

                    frontier.append(child)
                else:
                    # print("HARLOW?")
                    child.removed = True
                    removed.append(child)

            # Sort the frontier by the F cost
            frontier.sort(key=lambda x: x.f)

            # print("NEW ITERATION >>> ")
            # for f in frontier:
            #     print(f.__str__())

        # TODO: Uncomment this when done
        # path = [goal_node.point]
        # while goal_node.parent is not None:
        #     path.insert(0, goal_node.parent)
        #     for explored_node in explored:
        #         if explored_node.point.equal(goal_node.parent):
        #             goal_node = explored_node
        #             break
        
        # print([p.unpack() for p in path])


        # # Get the path from the goal node
        path = [goal_node.point]
        while goal_node.parent is not None:
            path.insert(0, goal_node.parent)
            for explored_node in explored:
                if explored_node.point == goal_node.parent:
                    goal_node = explored_node
                    break

        # print("DONE >>> ", goal_node.point.unpack())
        # print("GOAL >>> ", goal_node.parent.unpack())
        # print("Path: ", [(p.x, p.y) for p in path])

        return path

    
    def visualize(self, path: List[Point]):
        """
        Visualizes the A* algorithm
        """
        path_map = self.final_map.copy()

        for point in path:
            path_map[point.y][point.x] = 100
        
        cv2.imwrite(f'{self.save_dir}{"path_map.png"}', path_map)

    
    def execute(self):
        """
        Executes the regional A* algorithm
        """
        point_regions = [
            self.get_region_id_from_point(self.initial_pose.point),
            self.get_region_id_from_point(self.goal_point)
        ]


if __name__ == "__main__":
    # Test execution of A star algorithm on the final map
    path_to_goal = PathToGoal(Pose(Point(170, 50), 0), Point(460, 480))
    path = path_to_goal.a_star()
    path_to_goal.visualize(path)
    # print(path_to_goal.is_point_valid(Point(225, 40)))
    # path_to_goal.get_window(Point(170, 50))

    # window, oob = path_to_goal.get_window(Point(0, 0))

    # print(window)
    # print(oob)
