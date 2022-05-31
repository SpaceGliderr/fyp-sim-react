import { NextPage } from "next";
import { useMemo, useState } from "react";
import { Simulator } from "../game";
import { Map } from "../game/map";
import { MAP_1 } from "../maps/map_1";

const Test: NextPage = () => {
  // Declare selected map
  const map = useMemo(() => new Map(MAP_1), []);

  // Instantiate the simulator class based on the chosen map
  const simulator = useMemo(() => new Simulator(map), [map]);

  // console.log(JSON.stringify(simulator.generatePayload()));

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

  const executeAlgorithm = async () => {
    const response = await fetch(`${process.env.API_URL}/clear_map_json/`, {
      method: "POST",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
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
