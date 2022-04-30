import { useEffect, useMemo, useRef } from "react";
import { CanvasProp } from "./props";
import { CanvasHelper } from "../../utils/canvas";
import { Simulator } from "../../game";
import { MAP_1 } from "../../maps/map_1";
import { Map } from "../../game/map";

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
  // This useEffect hook will act as the game play loop
  useEffect(() => {
    // Clear the dynamic canvas before rendering the new frame
    CanvasHelper.clearContext();

    // Apply sensor readings
    simulator.readRobotSensors();

    // Initialize robots
    simulator.renderRobots();

    // Check for collisions
    simulator.checkForCollisions();

    // Learning Separate Axis Theorem
    // const polygon1 = new PolygonObstacle(
    //   [
    //     new Point(600, 0),
    //     new Point(640, 0),
    //     new Point(640, 400),
    //     new Point(600, 400),
    //   ],
    //   "red"
    // );

    // polygon1.render();

    // const polygon2 = new CircleObstacle(
    //   new Point(610, 420),
    //   Robot.RADIUS,
    //   "blue",
    // );

    // polygon2.render();

    // if (Collision.circlePolygonIntersect(polygon1, polygon2)) {
    //   console.log("Collision detected");
    // }
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
