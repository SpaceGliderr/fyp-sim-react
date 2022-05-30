from math import cos, sin
from models.point import Point

class Pose:
    def __init__(self, point, theta: float) -> None:
        self.point = point
        self.theta = theta

    
    def inverse(self):
        """Returns the inverse of the pose."""
        inverse_pose = Pose(Point(-self.point.x, -self.point.y), -self.theta)
        result_point = self.rotate_vector(inverse_pose)
        return Pose(result_point, -self.theta)


    def rotate(self):
        """
        Rotate a vector by theta radians
        """
        x, y = self.point.unpack()

        rotatedX = x * cos(self.theta) - y * sin(self.theta)
        rotatedY = x * sin(self.theta) + y * cos(self.theta)
        
        return Point(rotatedX, rotatedY)


    def rotate_and_translate(self, vector: Point):
        """
        Rotate and translate a vector by theta radians
        """
        rotatedPoint = self.rotate()
        return rotatedPoint.add(vector)

    
    def unpack(self):
        """Returns the x, y, theta of the pose."""
        return self.point.x, self.point.y, self.theta
