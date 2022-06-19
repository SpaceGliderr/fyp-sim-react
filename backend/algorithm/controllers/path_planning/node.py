from math import cos, sin
# from models.point import Point


# TODO: Remove Point, Pose once algorithm is implemented finished
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


    def __str__(self) -> str:
        return f"{self.id} {self.expansion_sequence} {self.point.unpack()} {self.f} {self.parent.unpack()} {self.removed}"
