from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from algorithm.algorithm import BaseAlgorithm

from src.api_models import _Algorithm


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
    decider = BaseAlgorithm(algorithm)
    return "Test API Successful"
