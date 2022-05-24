import { NextPage } from "next";
import { useState } from "react";

const Test: NextPage = () => {
  const [res, setRes] = useState<string>("Default");

  const executeAlgorithm = async () => {
    const response = await fetch(`${process.env.API_URL}/algorithm/`, {
      method: "POST",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        robots: [
          {
            id: 1,
            pose: {
              point: {
                x: 0,
                y: 0,
              },
              theta: 0,
            },
            sensor_readings: [
              {
                pose: {
                  point: {
                    x: 0,
                    y: 0,
                  },
                  theta: 0,
                },
              },
              {
                pose: {
                  point: {
                    x: 0,
                    y: 0,
                  },
                  theta: 0,
                },
              },
              {
                pose: {
                  point: {
                    x: 0,
                    y: 0,
                  },
                  theta: 0,
                },
              },
            ],
            goal: {
              x: 0,
              y: 0,
            },
          },
        ],
        environment: {
          width: 1400,
          height: 800,
        },
      }),
    });
    const data = await response.json();
    // console.log("🚀 ~ file: test.tsx ~ line 6 ~ executeAlgorithm ~ data", data);
    setRes(data);
  };

  return (
    <div>
      <p>{res}</p>
      <button onClick={executeAlgorithm}>Click</button>
    </div>
  );
};

export default Test;
