from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from algorithm.algorithm import BaseAlgorithm
from algorithm.arbiter import Arbiter
from algorithm.controllers.mapping.mapping import Mapping
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
    width, height, regions, sensor_readings_per_region = transform_mapping_api_model(raw_mapping)
    mapping = Mapping(width, height, regions, sensor_readings_per_region)
    try:
        mapping.clear_map_json()
        mapping.generate_map()
    except Exception as e:
        print(e)
