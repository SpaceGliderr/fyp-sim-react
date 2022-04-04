import { useCallback, useEffect, useRef, useState } from "react";
import { CanvasProp } from "./props";
import { testMap } from "../../constants/maps";

const Canvas = (props: CanvasProp) => {
  // const { innerHeight: HEIGHT, innerWidth: WIDTH } = window;
  const HEIGHT = 900;
  const WIDTH = 1400;
  const DELTA = 20;

  const canvasRef = useRef(null);

  const [coordinates, setCoordinates] = useState({
    x: 680,
    y: 380,
  });

  const drawCharacter = useCallback(
    (ctx: any) => {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.arc(coordinates.x, coordinates.y, 20, 0, Math.PI * 2);
      ctx.fill();
    },
    [coordinates]
  );

  // const memoizedDraw = useCallback(draw, [coordinates]);

  const drawEnvironment = (ctx: any) => {
    testMap.forEach(({ width, height, x, y }) => {
      ctx.fillStyle = "#000000";
      ctx.fillRect(x, y, width, height);
    });
  };

  const handleKeyDown = useCallback(({ key }) => {
    console.log(key);
    switch (key) {
      case "ArrowUp":
        setCoordinates((prev) => {
          return {
            ...prev,
            y: prev.y - DELTA,
          };
        });
        break;

      case "ArrowDown":
        setCoordinates((prev) => {
          return {
            ...prev,
            y: prev.y + DELTA,
          };
        });

        break;

      case "ArrowLeft":
        setCoordinates((prev) => {
          return {
            ...prev,
            x: prev.x - DELTA,
          };
        });

        break;

      case "ArrowRight":
        setCoordinates((prev) => {
          return {
            ...prev,
            x: prev.x + DELTA,
          };
        });

        break;

      default:
        break;
    }
  }, []);

  // console.log("window", (window.innerWidth * 2) / 3);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    drawCharacter(context);
    drawEnvironment(context);
  }, [drawCharacter]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown, false);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, false);
    };
  }, [handleKeyDown]);

  return (
    <div onKeyDown={handleKeyDown}>
      <canvas
        className="m-auto border-black border-2 border-solid"
        width={WIDTH}
        height={HEIGHT}
        ref={canvasRef}
      />
    </div>
  );
};

export default Canvas;
