import settings


def uni_to_diff(velocity, omega):
    """
    Translates the unicycle model input to the differential model input
    From the website: https://www.toptal.com/robotics/programming-a-robot-an-introductory-tutorial
    """
    radius = settings.WHEEL_RADIUS_IN_PX
    length = settings.WHEEL_BASE_LENGTH_IN_PX

    velocityL = ((2.0 * velocity) - (omega * length)) / (2.0 * radius)
    velocityR = ((2.0 * velocity) + (omega * length)) / (2.0 * radius)
    
    return velocityL, velocityR
