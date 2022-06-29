import { NextPage } from "next";
import { useMemo, useState } from "react";
import { Simulator } from "../game";
import { Goal, GoalShape } from "../game/goal";
import { Map } from "../game/map";
import { MAP_1 } from "../maps/map_1";
import { MAP_2 } from "../maps/map_2";
import { MAP_3 } from "../maps/map_3";
import { Point } from "../utils/coordinates";

const Test: NextPage = () => {
  // Declare selected map
  const map = useMemo(() => new Map(MAP_2), []);

  // Instantiate the simulator class based on the chosen map
  const simulator = useMemo(() => new Simulator(map), [map]);

  const [res, setRes] = useState<string>("Default");

  // const executeAlgorithm = async () => {
  //   const response = await fetch(`${process.env.API_URL}/algorithm/`, {
  //     method: "POST",
  //     headers: {
  //       "Access-Control-Allow-Origin": "*",
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(simulator.generatePayload()),
  //   });
  //   const data = await response.json();
  //   console.log("🚀 ~ file: test.tsx ~ line 6 ~ executeAlgorithm ~ data", data);
  //   // setRes(data);
  // };

  // const executeAlgorithm = async () => {
  //   const response = await fetch(`${process.env.API_URL}/clear_map_json/`, {
  //     method: "POST",
  //     headers: {
  //       "Access-Control-Allow-Origin": "*",
  //       "Content-Type": "application/json",
  //     },
  //   });
  //   const data = await response.json();
  //   console.log("🚀 ~ file: test.tsx ~ line 6 ~ executeAlgorithm ~ data", data);
  //   // setRes(data);
  // };

  // const executeAlgorithm = async () => {
  //   const response = await fetch(
  //     `${process.env.API_URL}/generate_ground_truth_map/`,
  //     {
  //       method: "POST",
  //       headers: {
  //         "Access-Control-Allow-Origin": "*",
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(map.getGroundTruthPayload()),
  //     }
  //   );
  //   const data = await response.json();
  //   console.log("🚀 ~ file: test.tsx ~ line 6 ~ executeAlgorithm ~ data", data);
  //   // setRes(data);
  // };

  const executeAlgorithm = async () => {
    const robot = simulator.getRobotById(0);
    robot.setCurrentGoal(
      new Goal([new Point(800, 40)], GoalShape.CIRCLE, 0, 7, new Date())
    );
    const response = await fetch(`${process.env.API_URL}/test_plan_path/`, {
      method: "POST",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        robot: robot.generatePayload(),
        mapping: simulator
          .getLeaderRobot()
          .generateMappingPayload(simulator.getWidth(), simulator.getHeight()),
      }),
    });
    const data = await response.json();
    console.log("🚀 ~ file: test.tsx ~ line 6 ~ executeAlgorithm ~ data", data);
    // setRes(data);
  };

  return (
    <div>
      <p>{res}</p>
      <button onClick={executeAlgorithm}>Click</button>
    </div>
  );
};

export default Test;
