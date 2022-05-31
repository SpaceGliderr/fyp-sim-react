from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from algorithm.algorithm import BaseAlgorithm
from algorithm.arbiter import Arbiter
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
    print("Robots \n", algorithm.robots)
    print("Environment \n", algorithm.environment)
    base_algorithm = BaseAlgorithm(algorithm)
    print(base_algorithm.makeDecisions())
    decisions = base_algorithm.makeDecisions()
    return decisions

@app.post("/single_robot/")
def single_robot(robot: _Robot):
    print("Robot \n", robot)
    decision = Arbiter(robot)
    return decision


@app.post("/clear_map_json/")
def clear_map_json():
    try:
        utils.clear_map_json()
    except Exception as e:
        print(e)
        return str(e)
    return "successfully cleared map json"
