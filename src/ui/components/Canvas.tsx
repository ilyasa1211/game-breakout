import { useContext, useEffect, useRef } from "preact/hooks";
import { KeyDownEvent, KeyUpEvent } from "../../events/input.ts";
import Game from "../../game.ts";
import { CurrentLevelContext } from "../contexts/LevelContext.ts";

export default function Canvas() {
  const level = useContext(CurrentLevelContext);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (Number.isInteger(level) && canvasRef.current !== null) {
      const game = new Game({ level, canvasRef: canvasRef });

      addEventListener("keydown", (ev) =>
        game.dispatchEvent(new KeyDownEvent(ev)),
      );
      addEventListener("keyup", (ev) => game.dispatchEvent(new KeyUpEvent(ev)));

      game.start();
    }
  }, [level, canvasRef]);

  return (
    <>
      <h2>Level {level}</h2>
      <canvas ref={canvasRef} className="min-w-[400px] w-[80vw]"></canvas>
    </>
  );
}
