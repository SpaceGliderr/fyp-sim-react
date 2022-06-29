import numpy as np
from src.api_models import _GroundTruthMap
import src.utils as utils


def generate_ground_truth(ground_truth: _GroundTruthMap):
    width, height, obstacles = ground_truth.width, ground_truth.height, ground_truth.obstacles
    # width, height, obstacles = ground_truth

    ground_truth_map = np.full((height + 1, width + 1), 255, dtype=np.uint8)

    for obstacle in obstacles:
        # print(obstacle)
        if len(obstacle) == 3:
            print("aljksdbglkasjgjlbgk")
            start_point = obstacle[1]
            end_point = obstacle[2]

            print(start_point)
            print(end_point)

            length = int(start_point.x) - int(end_point.x) + 1
            if start_point.y < end_point.y:
                print('LENGTH: ', length)
                for i in range(0, length):
                    ground_truth_map[int(start_point.y) + i][int(start_point.x) - i] = 0                
            else:
                print('LEngth: ', length)
                for i in range(0, length):
                    ground_truth_map[int(start_point.y) - i][int(start_point.x) - i] = 0                

        elif len(obstacle) == 4:
            start_point = obstacle[0]
            end_point = obstacle[2]
            ground_truth_map[int(start_point.y):int(end_point.y), int(start_point.x)] = 0
            ground_truth_map[int(start_point.y):int(end_point.y), int(end_point.x)] = 0
            ground_truth_map[int(start_point.y), int(start_point.x):int(end_point.x)] = 0
            ground_truth_map[int(end_point.y), int(start_point.x):int(end_point.x)] = 0
            ground_truth_map[int(end_point.y), int(end_point.x)] = 0

    print(ground_truth_map)
    utils.save_image("ground_truth_map.png", "./performance_metrics/mapping/", ground_truth_map)

    return ground_truth_map