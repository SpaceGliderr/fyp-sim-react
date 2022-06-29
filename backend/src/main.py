from typing import List
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from algorithm.algorithm import BaseAlgorithm
from algorithm.arbiter import Arbiter
from algorithm.controllers.mapping.mapping import Mapping
from algorithm.controllers.path_planning.path_to_goal import PathToGoal
from src.api_models import _ActivityHistory
from src.api_models import _GroundTruthMap
from src.api_models import _Mapping
from src.utils import transform_mapping_api_model
from src.api_models import _Robot
from src.api_models import _Algorithm
from performance_metrics.generate_ground_truth import generate_ground_truth

import src.utils as utils


app = FastAPI()


origins = [
    "http://localhost:3000",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/algorithm/")
def algorithm(algorithm: _Algorithm):
    base_algorithm = BaseAlgorithm(algorithm)
    decisions = base_algorithm.makeDecisions()
    return decisions


@app.post("/single_robot/")
def single_robot(robot: _Robot):
    decision = Arbiter(robot)
    return decision.execute()


@app.post("/generate_map/")
def generate_map(raw_mapping: _Mapping):
    width, height, number_of_regions, region_points, sensor_readings_per_region, _ = transform_mapping_api_model(raw_mapping)
    mapping = Mapping(width, height, number_of_regions, region_points, sensor_readings_per_region)
    mapping.clear_map_json()
    mapping.store_raw_data()
    mapping.generate_map()


@app.post("/plan_path/")
def plan_path(robot: _Robot, mapping: _Mapping):
    robot = utils.transform_robot_api_model(robot)
    mapping = utils.transform_mapping_api_model(mapping)
    try:
        path_to_goal = PathToGoal(robot[1], robot[3], mapping[5])
        navigation_paths = path_to_goal.execute()
        return navigation_paths
    except Exception as e:
        print(e)
        return []


@app.post("/generate_ground_truth_map/")
def generate_ground_truth_map(ground_truth: _GroundTruthMap):
    generate_ground_truth(ground_truth)
    return "Success"


@app.post("/log_activity_history/")
def log_activity_history(activity_histories: List[List[_ActivityHistory]]):
    activity_histories_transformed = utils.transform_activity_history_api_model(activity_histories)
    print(activity_histories_transformed)
    utils.save_data_to_file(replacement_data=activity_histories_transformed, file_path="./src/activity_history_log.json")


@app.post("/test_plan_path/")
def test_plan_path(robot: _Robot, mapping: _Mapping):
    robot = utils.transform_robot_api_model(robot)
    mapping = utils.transform_mapping_api_model(mapping)
    print("Robot ID >>> ", robot[0])
    path_to_goal = PathToGoal(robot[1], robot[3], mapping[5])
    navigation_paths = path_to_goal.execute()
    return navigation_paths
