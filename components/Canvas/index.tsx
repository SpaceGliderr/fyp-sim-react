import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CanvasProp } from "./props";
import { CanvasHelper } from "../../utils/canvas";
import { CommunicationPurpose, Simulator, SimulatorAction } from "../../game";
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
  executeSingleRobot,
} from "../../public/api/algorithm";
import { RobotStatus } from "../../game/robot";
import { RobotWorker, RobotWorkerStatus } from "../../typings/robot-worker";

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
    SimulatorAction.MAPPING
  ); // First simulator action state is MAPPING procedure
  const [currentRobotId, setCurrentRobotId] = useState<number>(0); // Current robot id that is being controlled
  const numberOfRobots = simulator.getRobots().length; // Number of robots in the simulator
  const [robotWorkers, setRobotWorkers] = useState<RobotWorker[]>([]); // Array of workers that are running the robots

  // ========================= SIMULATOR ACTIONS =========================
  const updateAction = useCallback(() => {
    switch (simulator.getAction()) {
      case SimulatorAction.MAPPING:
        setSimulatorAction(SimulatorAction.MAPPING);
        break;

      case SimulatorAction.MAPPING_COMPLETE:
        setSimulatorAction(SimulatorAction.MAPPING_COMPLETE);
        break;

      case SimulatorAction.GENERATE_MAP:
        setSimulatorAction(SimulatorAction.GENERATE_MAP);
        break;

      case SimulatorAction.NAVIGATION:
        setSimulatorAction(SimulatorAction.NAVIGATION);
        break;

      default:
        break;
    }
  }, [simulator]);

  const executeAction = useCallback(() => {
    const currentRobot = simulator.getRobotById(currentRobotId);

    if (simulatorAction === SimulatorAction.MAPPING) {
      if (currentRobot.getStatus() === RobotStatus.MAPPING_COMPLETE) {
        currentRobot.setIsCurrentlyMapping(false);
        setCurrentRobotId((currentRobotId) => {
          return (currentRobotId + 1) % numberOfRobots;
        });
      } else {
        currentRobot.setIsCurrentlyMapping(true);

        const response = executeSingleRobot(currentRobot.generatePayload());
        response
          .then((res) => {
            currentRobot.execute(res);
          })
          .catch(() => {});
      }

      simulator.mapping();
    } else if (simulatorAction === SimulatorAction.MAPPING_COMPLETE) {
      if (currentRobot.getStatus() === RobotStatus.FIND_LEADER) {
        const response = executeSingleRobot(currentRobot.generatePayload());
        response
          .then((res) => {
            currentRobot.execute(res);
          })
          .catch(() => {});
        simulator.communicateWithLeader(
          CommunicationPurpose.GIVE_SENSOR_READINGS,
          currentRobot
        );
      } else {
        setCurrentRobotId((currentRobotId) => {
          return (currentRobotId + 1) % numberOfRobots;
        });
      }

      simulator.mappingComplete();
    }
  }, [simulator, simulatorAction, currentRobotId, numberOfRobots]);

  useEffect(() => {
    if (simulatorAction === SimulatorAction.GENERATE_MAP) {
      const response = executeGenerateMap(
        simulator
          .getLeaderRobot()
          .generateMappingPayload(simulator.getWidth(), simulator.getHeight())
      );
      response
        .then((res) => {
          simulator.generateMapPhaseComplete();
        })
        .catch(() => {});
    }
  }, [simulatorAction, simulator]);

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
    // Set the ticker here
    const ticker = setInterval(() => {
      // Clear the dynamic canvas before rendering the new frame
      CanvasHelper.clearContext();

      // Search signal overlap information
      simulator.searchForSignalOverlaps();

      // Initialize robots
      simulator.renderRobots();

      // Check for collisions
      // TODO: Enable this when the motion model is fixed
      simulator.checkForCollisions();

      // Check for robot goals
      simulator.checkRobotGoals();

      // Execute Algorithm
      executeAction();
      updateAction();
    }, TICKS_PER_UPDATE);

    // Unmount ticker
    return () => clearInterval(ticker);
  }, [simulator, simulatorAction, executeAction, updateAction]);

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

  // ========================= ROBOT WORKERS =========================
  useEffect(() => {
    const robots = simulator.getRobots();

    if (simulatorAction === SimulatorAction.NAVIGATION) {
      const ticker = setInterval(() => {
        if (robotWorkers.length === 0) {
          const robotWorkersArray: RobotWorker[] = [];
          for (let i = 0; i < numberOfRobots; i++) {
            const worker = new Worker("./workers/robot.js", { type: "module" });
            robotWorkersArray.push({
              status: RobotWorkerStatus.IDLE,
              worker,
            });
          }
          setRobotWorkers(robotWorkersArray);
        } else {
          robotWorkers.forEach((robotWorker, idx) => {
            const { status, worker } = robotWorker;
            if (
              status === RobotWorkerStatus.IDLE &&
              robots[idx].getCurrentGoal()
            ) {
              console.log(
                "Robot Worker Starting",
                robots[idx].generatePayload()
              );
              worker.postMessage(JSON.stringify(robots[idx].generatePayload()));
              setRobotWorkers((prev) => {
                prev[idx].status = RobotWorkerStatus.PROCESSING;
                return prev;
              });
            }
          });
        }
      }, 2000);

      return () => clearInterval(ticker);
    }
  }, [
    simulatorAction,
    numberOfRobots,
    robotWorkers,
    setRobotWorkers,
    simulator,
  ]);

  useEffect(() => {
    if (
      simulatorAction === SimulatorAction.NAVIGATION &&
      robotWorkers.length === numberOfRobots
    ) {
      robotWorkers.forEach(({ worker }, idx) => {
        worker.onmessage = (event: any) => {
          const { data } = event;
          console.log(data);
          setRobotWorkers((prev) => {
            prev[idx].status = RobotWorkerStatus.IDLE;
            return prev;
          });
        };
      });
    }
  }, [simulatorAction, robotWorkers, numberOfRobots]);

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
