from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from algorithm.algorithm import BaseAlgorithm
from algorithm.arbiter import Arbiter
from algorithm.controllers.mapping.mapping import Mapping
from algorithm.controllers.path_planning.path_to_goal import PathToGoal
from src.api_models import _Mapping
from src.utils import transform_mapping_api_model
from src.api_models import _Robot
from src.api_models import _Algorithm

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
    width, height, number_of_regions, region_points, sensor_readings_per_region = transform_mapping_api_model(raw_mapping)
    mapping = Mapping(width, height, number_of_regions, region_points, sensor_readings_per_region)
    mapping.clear_map_json()
    mapping.store_raw_data()
    mapping.generate_map()


@app.post("/plan_path/")
def plan_path(robot: _Robot):
    robot = utils.transform_robot_api_model(robot)
    print("Robot ID >>> ", robot[0])
    path_to_goal = PathToGoal(robot[1], robot[3])
    navigation_paths = path_to_goal.execute()
    return navigation_paths
