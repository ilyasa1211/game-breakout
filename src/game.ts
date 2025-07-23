import { createWorld, pipe } from "bitecs";
import type { RefObject } from "preact";
import Paddle from "./entities/paddle.ts";
import { Control, KeyDown } from "./enums.ts";
import { GameOverEvent, GameStartEvent } from "./events/game.ts";
import { KeyDownEvent, KeyUpEvent } from "./events/input.ts";
import strings from "./strings.ts";
import Movement from "./systems/movement.ts";
import Render from "./systems/render.ts";
import type { IGameWorld } from "./types.ts";

export default class Game extends EventTarget {
  private requestAnimationFrameId: number | null = null;
  private level;
  private lastTime: number = 0;
  private isOver = false;

  private readonly canvas;
  // private readonly gl;
  // private readonly program;

  private readonly world;
  private readonly pipeline;

  /**
   * Multiple pressed key
   */
  private readonly pressedKey = {
    [Control.LEFT]: false,
    [Control.RIGHT]: false,
  };

  public constructor({
    level,
    canvasRef,
  }: {
    level: number;
    canvasRef: RefObject<HTMLCanvasElement>;
  }) {
    super();
    const canvas = canvasRef.current;

    if (!canvas) {
      throw new TypeError(strings.CANVAS_IS_NULL);
    }

    this.level = level;
    this.canvas = canvas;

    this.world = createWorld<IGameWorld>({
      deltaTime: 0,
      pressedKey: this.pressedKey,
    });

    new Paddle(this.world, {
      x: this.canvas.width / (2 * this.canvas.width),
      y: this.canvas.height / (2 * this.canvas.height),
      width: 0.5,
      height: 0.5,
    });
    // gl.bindVertexArray(null);
    const renderSystem = new Render(canvas);

    this.pipeline = pipe(Movement, renderSystem.update.bind(renderSystem));

    // init input listener
    this.addEventListener(KeyDownEvent.name, (e) => {
      this.onKeyDown((e as KeyDownEvent).detail);
    });
    this.addEventListener(KeyUpEvent.name, (e) => {
      this.onKeyUp((e as KeyUpEvent).detail);
    });

    // init gameplay listener
    this.addEventListener(
      GameOverEvent.name,
      (e) => {
        // TODO: do somethind with e.detail, it has lose or win data
        this.isOver = true;
      },
      {
        once: true,
      },
    );
    this.addEventListener(
      GameStartEvent.name,
      (e) => {
        this.start();
      },
      {
        once: true,
      },
    );
  }

  /**
   * Entry point, trigger the game loop
   */
  public start() {
    if (this.isOver && this.requestAnimationFrameId) {
      cancelAnimationFrame(this.requestAnimationFrameId);
      return;
    }

    this.requestAnimationFrameId = requestAnimationFrame((now) => {
      this.onUpdate(now);
      this.start(); // recursive
    });
  }

  /**
   * The game loop
   * @param now
   */
  private onUpdate(now: number) {
    this.world.deltaTime = this.getDeltaTime(now);
    this.pipeline(this.world);
  }

  private onKeyDown(ev: KeyboardEvent) {
    switch (ev.key) {
      case KeyDown.ARROW_LEFT:
      case KeyDown.A:
        this.pressedKey[Control.LEFT] = true;
        break;
      case KeyDown.ARROW_RIGHT:
      case KeyDown.D:
        this.pressedKey[Control.RIGHT] = true;
        break;
    }
  }

  private onKeyUp(ev: KeyboardEvent) {
    switch (ev.key) {
      case KeyDown.ARROW_LEFT:
      case KeyDown.A:
        this.pressedKey[Control.LEFT] = false;
        break;
      case KeyDown.ARROW_RIGHT:
      case KeyDown.D:
        this.pressedKey[Control.RIGHT] = false;
        break;
    }
  }

  private getDeltaTime(now: number) {
    if (this.lastTime === 0) this.lastTime = now;

    const deltaTime = now - this.lastTime;
    this.lastTime = now;

    return deltaTime;
  }
}
