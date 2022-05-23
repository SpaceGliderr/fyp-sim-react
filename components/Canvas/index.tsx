import { useEffect, useMemo, useRef, useState } from "react";
import { CanvasProp } from "./props";
import { CanvasHelper } from "../../utils/canvas";
import { Simulator } from "../../game";
import { MAP_1 } from "../../maps/map_1";
import { Map } from "../../game/map";
import { SENSOR_TICKS_PER_UPDATE, TICKS_PER_UPDATE } from "../../game/settings";
import { Goal, GoalShape } from "../../game/goal";
import { SpawnerWorkerResponse } from "../../typings/spawner-worker";
import { Point } from "../../utils/coordinates";

const Canvas = (props: CanvasProp) => {
  // Declare selected map
  const map = useMemo(() => new Map(MAP_1), []);
  const { width, height } = map.unpack();

  // Instantiate the simulator class based on the chosen map
  const simulator = useMemo(() => new Simulator(map), [map]);
  const [spawnerWorker, setSpawnerWorker] = useState<Worker | undefined>(
    undefined
  );

  // ========================= ENVIRONMENT RENDERING =========================
  // Declare canvas references
  const staticCanvasRef = useRef(null);
  const dynamicCanvasRef = useRef(null);

  // This useEffect hook just acts as a componentDidMount reference, it should only be triggered once
  useEffect(() => {
    // The lower layer canvas is for static obstacles
    // Although it is only rendered once, this staticContext variable needs to be declared in a useEffect hook because we need to get the reference to the DOM element after the component has been mounted
    if (!staticCanvasRef.current) return;
    const staticCanvas: HTMLCanvasElement = staticCanvasRef.current;
    const staticContext: CanvasRenderingContext2D = staticCanvas.getContext(
      "2d"
    ) as CanvasRenderingContext2D;

    // The upper layer canvas is for dynamic obstacles
    if (!dynamicCanvasRef.current) return;
    const dynamicCanvas: HTMLCanvasElement = dynamicCanvasRef.current;
    const dynamicContext: CanvasRenderingContext2D = dynamicCanvas.getContext(
      "2d"
    ) as CanvasRenderingContext2D;

    // Initialize the canvas
    new CanvasHelper(staticContext, dynamicContext);

    // Render the static obstacles
    simulator.renderStaticObstacles();

    // Test whether goal spawner works
    // generateGoalsForRobots(simulator);
    // console.log(
    //   "🚀 ~ file: index.tsx ~ line 48 ~ useEffect ~ generateGoalsForRobots(simulator);",
    //   generateGoalsForRobots(simulator)
    // );

    // const spawnerWorker: Worker = new Worker("./workers/spawner.js", {
    //   type: "module",
    // });
    // spawnerWorker.postMessage(JSON.stringify(simulator));
    // console.log(JSON.stringify(simulator));
    // console.log(JSON.parse(JSON.stringify(simulator)));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!spawnerWorker) {
      setSpawnerWorker(new Worker("./workers/spawner.js", { type: "module" }));
      // console.log("HUH");
    } else {
      // console.log("LKJBASDLKJGBALKS");
      spawnerWorker.postMessage(JSON.stringify(simulator));
      // console.log("qwerqwerqwerqwer");
    }
  }, [spawnerWorker, simulator]);

  useEffect(() => {
    if (spawnerWorker) {
      spawnerWorker.onmessage = (event) => {
        const { data } = event;

        if (data) {
          const generatedGoals = data.map((g: SpawnerWorkerResponse) => {
            const { id, obstacle, point, shape: s } = g;
            const points = point.map((p) => {
              return new Point(p.x, p.y);
            });
            const shape = s === "CIRCLE" ? GoalShape.CIRCLE : GoalShape.POLYGON;
            return new Goal(points, shape, id, obstacle.radius);
          });
          console.log(
            "🚀 ~ file: index.tsx ~ line 94 ~ generatedGoals ~ generatedGoals",
            generatedGoals
          );
          simulator.addGoals(generatedGoals);
        }
        console.log(simulator);
        // console.log(data);
      };
    }
  }, [spawnerWorker, simulator]);

  // ========================= COMPONENT RENDERING =========================
  // This useEffect hook will act as the refresh loop for moving objects on the dynamic canvas
  useEffect(() => {
    const robots = simulator.getRobots();

    // Set the ticker here
    const ticker = setInterval(() => {
      // Clear the dynamic canvas before rendering the new frame
      CanvasHelper.clearContext();

      // Apply sensor readings
      // simulator.readRobotSensors();

      // Initialize robots
      simulator.renderRobots();

      // Check for collisions
      simulator.checkForCollisions();

      // Check for robot goals
      simulator.checkRobotGoals();

      robots[0].drive(0.5, 4, 0);
      robots[1].drive(0.5, 0, 4);
      robots[2].drive(0.5, 4, 0);
    }, TICKS_PER_UPDATE);

    // Unmount ticker
    return () => clearInterval(ticker);
  }, [simulator]);

  // This useEffect hook will act as the sensor reading loop for the robots
  useEffect(() => {
    const ticker = setInterval(() => {
      // Apply sensor readings every 20ms
      simulator.readRobotSensors();
    }, SENSOR_TICKS_PER_UPDATE);

    return () => clearInterval(ticker);
  }, [simulator]);

  return (
    <div>
      <canvas
        className="absolute top-5 left-24"
        width={width}
        height={height}
        ref={staticCanvasRef}
      />
      <canvas
        className="border-black border-2 border-solid absolute top-5 left-24"
        width={width}
        height={height}
        ref={dynamicCanvasRef}
      />
    </div>
  );
};

export default Canvas;
