import { useEffect, useMemo, useRef } from "react";
import { CanvasProp } from "./props";
import { CanvasHelper } from "../../utils/canvas";
import { Simulator } from "../../game";
import { MAP_1 } from "../../maps/map_1";
import { Map } from "../../game/map";
import { SENSOR_TICKS_PER_UPDATE, TICKS_PER_UPDATE } from "../../game/settings";

const Canvas = (props: CanvasProp) => {
  // Declare selected map
  const map = useMemo(() => new Map(MAP_1), []);
  const { width, height } = map.unpack();

  // Instantiate the simulator class based on the chosen map
  const simulator = useMemo(() => new Simulator(map), [map]);

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

      // Apply sensor readings
      // simulator.readRobotSensors();

      // Initialize robots
      simulator.renderRobots();

      // Check for collisions
      simulator.checkForCollisions();

      robots[0].drive(0.5, 4, 0);
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
