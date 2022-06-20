from math import cos, sin
from typing import List
from algorithm.controllers.path_planning.bfs.node import BFSNode

from algorithm.controllers.path_planning.graph import Graph



class BFS:
    def __init__(self, graph: Graph):
        self.matrix = graph.matrix

    
    def expand_and_return_children(self, node):
        children = []

        for idx, i in enumerate(self.matrix[node.state]):
            if i == 1:
                children.append(BFSNode(idx, node.state))

        return children


    def search(self, start: int, goal: int):
        if (start == goal):
            return []

        frontier = []
        explored = []
        is_goal_found = False
        goal_node: BFSNode = None

        frontier.append(BFSNode(start))

        while len(frontier) > 0 and not is_goal_found:
            children = self.expand_and_return_children(frontier[0])
            frontier[0].add_children(children)
            explored.append(frontier[0])
            frontier.pop(0)

            for child in children:
                if not (child.state in [e.state for e in explored]) and not (child.state in [f.state for f in frontier]):
                    if child.state == goal:
                        goal_node = child
                        is_goal_found = True
                    frontier.append(child)

        path = [goal_node.state]
        while goal_node.parent is not None:
            path.insert(0, goal_node.parent)

            for explored_node in explored:
                if explored_node.state == goal_node.parent:
                    goal_node = explored_node
                    break

        return path
