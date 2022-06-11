PIXEL_TO_CM_RATIO = 2;

WHEEL_RADIUS_IN_M = 0.021; # in m (diameter is 42 mm)

WHEEL_RADIUS_IN_PX = WHEEL_RADIUS_IN_M * PIXEL_TO_CM_RATIO;

WHEEL_BASE_LENGTH_IN_M = 0.0885;

WHEEL_BASE_LENGTH_IN_PX = WHEEL_BASE_LENGTH_IN_M * PIXEL_TO_CM_RATIO;

# TODO: Fix translational velocity, the velocity for the robot is not this high
MAX_TRANSLATIONAL_VELOCITY = 0.813; # in m/s
