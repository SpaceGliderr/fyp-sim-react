import numpy as np


class Graph:
    def __init__(self, size: int):
        self.size = size
        self.matrix = np.zeros((size, size), dtype=np.uint8)


    def add_edge(self, node1: int, node2: int) -> None:
        self.matrix[node1][node2] = 1
        self.matrix[node2][node1] = 1


    def remove_edge(self, node1: str, node2: str) -> None:
        self.matrix[node1][node2] = 0
        self.matrix[node2][node1] = 0
