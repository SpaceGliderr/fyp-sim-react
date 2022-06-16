from models.point import Point


class AStarNode:
    def __init__(self, id: int, expansion_sequence: int, point: Point, f: float = None, parent: Point = None, removed: bool = False):
        self.id = id
        self.expansion_sequence = expansion_sequence
        self.point = point
        self.parent = parent
        self.f = f
        self.removed = removed
        self.children = []

    def add_children(self, children):
        self.children.extend(children)