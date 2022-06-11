from math import cos, sin


class Point:
    def __init__(self, x: float, y: float) -> None:
        self.x = x
        self.y = y


    def add(self, other):
        """Returns the sum of two points."""
        return Point(self.x + other.x, self.y + other.y)


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
        print("Rotated Point >>>> ", rotatedPoint.x, rotatedPoint.y)
        return rotatedPoint.add(point)
