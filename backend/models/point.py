from math import cos, sin


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


    def round(self):
        """
        Round the x and y values of the point
        """
        return Point(round(self.x), round(self.y))


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
