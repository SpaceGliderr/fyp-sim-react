from math import cos, sin
from models.point import Point

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
