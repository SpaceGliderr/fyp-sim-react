import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CanvasProp } from "./props";
import { testMap } from "../../constants/maps";
import { Robot, Wall } from "../../constants/game";

const Canvas = (props: CanvasProp) => {
  const HEIGHT = 900;
  const WIDTH = 1400;
  const DELTA = 20;

  const canvasRef = useRef(null);

  const [coordinates, setCoordinates] = useState({
    x: 680,
    y: 380,
  });

  const walls: Wall[] = useMemo(() => [], []);

  const detectCollision = useCallback(() => {
    walls.forEach((wall) => {
      if (wall.hasCollision(coordinates.x, coordinates.y, DELTA, DELTA)) {
        handleCollision();
        return;
      }
    });
  }, [coordinates, walls]);

  const handleCollision = () => {
    // TODO: Supposed to be a game over screen -> Currently resets the character coordinates
    setCoordinates({
      x: 680,
      y: 380,
    });
  };

  const character: Robot = useMemo(
    () => new Robot(coordinates.x, coordinates.y, 20, "black"),
    [coordinates]
  );

  const drawCharacter = useCallback(
    (ctx: any) => {
      // Reset board
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      detectCollision();
      character.draw(ctx);
    },
    [detectCollision, character]
  );

  // const memoizedDraw = useCallback(draw, [coordinates]);

  const drawEnvironment = useCallback(
    (ctx: any) => {
      testMap.forEach(({ width, height, x, y }) => {
        // ctx.fillStyle = "#000000";
        // ctx.fillRect(x, y, width, height);
        const wall = new Wall(x, y, width, height, "black");
        wall.draw(ctx);
        walls.push(wall);
      });
    },
    [walls]
  );

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

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    drawCharacter(context);
    drawEnvironment(context);
  }, [drawCharacter, drawEnvironment]);

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
