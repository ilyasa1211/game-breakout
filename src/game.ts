import { createWorld, pipe } from "bitecs";
import type { RefObject } from "preact";
import Ball from "./entities/ball.ts";
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

    // createScene();
    this.world = createWorld<IGameWorld>({
      renderMeta: {
        ball: {
          vao: null,
          translationBuffer: null,
          colorBuffer: null,
        },
        player: {
          vao: null,
          translationBuffer: null,
          colorBuffer: null,
        },
        enemy: {
          vao: null,
          translationBuffer: null,
          colorBuffer: null,
        },
      },
      deltaTime: 0,
      pressedKey: this.pressedKey,
    });

    console.log(canvas.clientWidth, canvas.clientHeight
    );

    const playerHeight = 30;
    const playerWidth = 100;
    Paddle(this.world, {
      x: 300,
      y: 30,
      width: playerWidth,
      height: playerHeight,
      color: {
        r: 200,
        g: 200,
        b: 0,
        a: 255,
      },
    });

    Ball(this.world, {
      r: 0.3,
      x: 0.5,
      y: 0.5,
    });

    this.pipeline = pipe(
      ...[new Movement(canvas), new Render(canvas, this.world)].map((system) =>
        system.update.bind(system),
      ),
    );

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
      () => {
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
