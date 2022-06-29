export const IR_SENSOR_LOCS = [0, 45, 90, 135, 180, 225, 270, 315];

// export const IR_SENSOR_LOCS = [];

export const US_SENSOR_LOCS = [0, 45, 90, 270, 315];

export const FRONT_FACING_SENSOR_LOCS = [0, 45, 315];

// export const US_SENSOR_LOCS = [0];

export const PIXEL_TO_CM_RATIO = 2;

export const IR_SENSOR_MEASUREMENT_LENGTH = 25; // in cm

export const US_SENSOR_MEASUREMENT_LENGTH = 200; // in cm

export const ROBOT_RADIUS = 7; // in cm

export const ROBOT_COLOR = "#00ff00";

export const ROBOT_HEADING_COLOR = "#183d22";

export const IR_SENSOR_COLOR = "#ff0000";

export const US_SENSOR_COLOR = "#0000ff";

export const UPDATES_PER_SECOND = 30;

export const TICKS_PER_UPDATE = 1000 / UPDATES_PER_SECOND;

export const SENSOR_TICKS_PER_UPDATE = 20; // Sensors always update at a pace of 20 ms

export const GOAL_COLOR = "#e8874a";

export const GOAL_SPAWN_RATE = 5000; // in milliseconds (5 seconds)

export const WHEEL_RADIUS_IN_CM = 2.1; // in Cm (diameter is 42 mm)

export const WHEEL_RADIUS_IN_PX = WHEEL_RADIUS_IN_CM * PIXEL_TO_CM_RATIO;

export const WHEEL_BASE_LENGTH_IN_CM = 8.85;

export const WHEEL_BASE_LENGTH_IN_PX =
  WHEEL_BASE_LENGTH_IN_CM * PIXEL_TO_CM_RATIO;

export const DIFFERENCE_IN_TIME = UPDATES_PER_SECOND / 1000;

export const MAX_WHEEL_DRIVE_RATES = 19; // in rad/s

export const SIGNAL_RADIUS_IN_CM = 100; // in cm

export const SIGNAL_RADIUS_IN_PX = SIGNAL_RADIUS_IN_CM * PIXEL_TO_CM_RATIO;

export const SIGNAL_CIRCLE_COLOR_RGB = [247, 185, 156];

export const SIGNAL_CIRCLE_OPACITY = 0.2;

export const GOAL_TIMER_DURATION = 40; // in seconds

export const LEADER_ROBOT_COLOR = "#cfe39f";

export const DEFAULT_FONT_SETTINGS = "10px Arial";

export const DEFAULT_FONT_FILL_STYLE = "black";

export const ROBOT_FONT_SETTINGS = "14px Arial";

export const CLOSE_DISTANCE_IN_CM = 6; // in cm

export const CLOSE_DISTANCE_IN_PX = CLOSE_DISTANCE_IN_CM * PIXEL_TO_CM_RATIO;

export const OBSTACLE_DETECTION_SENSOR_LOCS = [0, 45, 90, 270, 315];

export const PATH_POINT_ERROR_MARGIN = 0.5; // in px
