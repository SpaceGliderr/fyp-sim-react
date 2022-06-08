import { useEffect, useMemo, useRef, useState } from "react";
import { CanvasProp } from "./props";
import { CanvasHelper } from "../../utils/canvas";
import { Simulator, SimulatorAction } from "../../game";
import { Map } from "../../game/map";
import {
  GOAL_SPAWN_RATE,
  GOAL_TIMER_DURATION,
  SENSOR_TICKS_PER_UPDATE,
  TICKS_PER_UPDATE,
} from "../../game/settings";
import { Goal, GoalShape } from "../../game/goal";
import { SpawnerWorkerResponse } from "../../typings/spawner-worker";
import { Point } from "../../utils/coordinates";
import {
  executeBatchAlgorithm,
  executeGenerateMap,
  executeInitializeMapJSON,
} from "../../public/api/algorithm";

const Canvas = (props: CanvasProp) => {
  const { map: m } = props;

  // Declare selected map
  const map = useMemo(() => new Map(m), [m]);
  const { width, height } = map.unpack();

  // Instantiate the simulator class based on the chosen map
  const simulator = useMemo(() => new Simulator(map), [map]);
  const [spawnerWorker, setSpawnerWorker] = useState<Worker | undefined>(
    undefined
  );
  const [simulatorAction, setSimulatorAction] = useState<SimulatorAction>(
    SimulatorAction.NAVIGATION
  ); // First simulator action state is MAPPING procedure

  // Initialize map json data
  const response = executeInitializeMapJSON(simulator.generatePayload());
  response.then((res) => console.log(res));

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

    // Render leader robots (leader robots cannot move, hence they can be rendered outside of the simulation loop)
    simulator.renderLeaderRobot();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ========================= COMPONENT RENDERING =========================
  // This useEffect hook will act as the refresh loop for moving objects on the dynamic canvas
  useEffect(() => {
    const robots = simulator.getRobots();

    // Set the ticker here
    const ticker = setInterval(() => {
      // Clear the dynamic canvas before rendering the new frame
      CanvasHelper.clearContext();

      // Search signal overlap information
      simulator.searchForSignalOverlaps();

      // Initialize robots
      simulator.renderRobots();

      // Check for collisions
      simulator.checkForCollisions();

      // Check for robot goals
      simulator.checkRobotGoals();

      // Execute algorithm
      // TODO: Uncomment once it is debugged
      // const response = executeBatchAlgorithm(simulator.generatePayload());

      // response.then((res) => simulator.execute(res)).catch(() => {});

      robots[0].drive(10, 0);
      // robots[1].drive(5, 5);
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

  // ========================= SPAWNER WORKER =========================
  useEffect(() => {
    if (simulatorAction === SimulatorAction.NAVIGATION) {
      const ticker = setInterval(() => {
        if (!spawnerWorker) {
          setSpawnerWorker(
            new Worker("./workers/spawner.js", { type: "module" })
          );
        } else {
          spawnerWorker.postMessage(
            JSON.stringify({ simulator, duration: GOAL_TIMER_DURATION })
          );
        }
      }, GOAL_SPAWN_RATE);

      return () => clearInterval(ticker);
    }
  }, [spawnerWorker, simulator, simulatorAction]);

  useEffect(() => {
    if (spawnerWorker) {
      spawnerWorker.onmessage = (event) => {
        const { data } = event;

        if (data) {
          const generatedGoals = data.map((g: SpawnerWorkerResponse) => {
            const { id, obstacle, point, shape: s, expiryDate } = g;
            const points = point.map((p) => {
              return new Point(p.x, p.y);
            });
            const shape = s === "CIRCLE" ? GoalShape.CIRCLE : GoalShape.POLYGON;
            return new Goal(points, shape, id, obstacle.radius, expiryDate);
          });
          simulator.addGoals(generatedGoals);
        }
      };
    }
  }, [spawnerWorker, simulator]);

  // ========================= SIMULATOR ACTIONS =========================
  useEffect(() => {
    switch (simulator.getAction()) {
      case SimulatorAction.MAPPING:
        setSimulatorAction(SimulatorAction.NAVIGATION);
        break;

      case SimulatorAction.MAPPING_COMPLETE:
        setSimulatorAction(SimulatorAction.MAPPING_COMPLETE);
        break;

      case SimulatorAction.NAVIGATION:
        setSimulatorAction(SimulatorAction.MAPPING);
        break;

      default:
        break;
    }
  }, [simulator]);

  useEffect(() => {
    if (simulatorAction === SimulatorAction.MAPPING_COMPLETE) {
      const response = executeGenerateMap({});
      response.then(() => simulator.mapGenerated());
    }
  }, [simulatorAction, simulator]);

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
