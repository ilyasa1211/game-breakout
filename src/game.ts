import { createWorld, pipe } from "bitecs";
import type { RefObject } from "preact";
import Ball from "./entities/ball.ts";
import Paddle from "./entities/paddle.ts";
import { Control, KeyDown } from "./enums.ts";
import {
  GameOverEvent,
  GameReadyEvent,
  GameStartEvent,
} from "./events/game.ts";
import { KeyDownEvent, KeyUpEvent } from "./events/input.ts";
import settings from "./settings.ts";
import strings from "./strings.ts";
import CheckSystem from "./systems/check.ts";
import Movement from "./systems/movement.ts";
import Render from "./systems/render.ts";
import type { IGameWorld } from "./types.ts";
import { generateEnemiesFromLevel } from "./utilities/level.ts";

export default class Game extends EventTarget {
  private requestAnimationFrameId: number | null = null;
  private level;
  private lastTime: number = 0;
  private isOver = false;

  private pipeline: ((...input: any[]) => any) | undefined;
  private readonly world;

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
    this.world = createWorld<IGameWorld>({
      eventTarget: this,
      isStarted: false,
      deltaTime: 0,
      pressedKey: this.pressedKey,
    });

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
        this.onGameOver(e as GameOverEvent);
      },
      {
        once: true,
      },
    );
    this.addEventListener(
      GameReadyEvent.name,
      () => {
        this.start();
      },
      {
        once: true,
      },
    );
    this.addEventListener(GameStartEvent.name, () => {
      this.world.isStarted = true;
    });

    this.onCreate(canvas);
  }

  /**
   * Entry point, trigger the game loop
   */
  private start() {
    if (this.isOver && this.requestAnimationFrameId) {
      cancelAnimationFrame(this.requestAnimationFrameId);
      return;
    }

    this.requestAnimationFrameId = requestAnimationFrame((now) => {
      this.onUpdate(now);
      this.start(); // recursive
    });
  }

  private onGameOver(event: GameOverEvent) {
    this.isOver = true;

    if (event.isWin()) {
      alert(strings.GAME_OVER_MESSAGE_WIN);
      return;
    }

    if (event.isLose()) {
      alert(strings.GAME_OVER_MESSAGE_LOSE);
      return;
    }
  }

  /**
   * Get called immidiately after the class is constructed
   */
  private async onCreate(canvas: HTMLCanvasElement) {
    const playerWidth = canvas.clientWidth / 7;
    const playerHeight = canvas.clientHeight / 14;
    const playerY = canvas.clientHeight - playerHeight * 3;
    const playerColor = {
      r: settings.PLAYER_COLOR[0],
      g: settings.PLAYER_COLOR[1],
      b: settings.PLAYER_COLOR[2],
      a: settings.PLAYER_COLOR[3],
    };

    const ballColor = {
      r: settings.BALL_COLOR[0],
      g: settings.BALL_COLOR[1],
      b: settings.BALL_COLOR[2],
      a: settings.BALL_COLOR[3],
    };

    const player = new Paddle(this.world, {
      x: canvas.clientWidth / 2 - playerWidth / 2,
      y: playerY,
      width: playerWidth,
      height: playerHeight,
      color: playerColor,
    });

    const ball = new Ball(this.world, {
      r: settings.BALL_RADIUS,
      x: canvas.clientWidth / 2,
      y: playerY - 4 * settings.BALL_RADIUS,
      xV: settings.BALL_INITIAL_X_VELOCITY,
      yV: settings.BALL_INITIAL_Y_VELOCITY,
      color: ballColor,
    });

    const enemies = await generateEnemiesFromLevel(
      this.level,
      this.world,
      canvas,
    ).then((v) => v);

    this.pipeline = pipe(
      ...[
        new CheckSystem(canvas),
        new Movement(canvas),
        new Render(canvas, [player, ball, enemies]),
      ].map((system) => system.update.bind(system)),
    );
  }

  /**
   * The game loop
   * @param now
   */
  private onUpdate(now: number) {
    this.world.deltaTime = this.getDeltaTime(now);
    this.pipeline?.call(null, this.world);
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
      case KeyDown.SPACE:
        this.dispatchEvent(new GameStartEvent());
    }
  }

  /**
   * @param now
   * @returns {number} in miliseconds
   */
  private getDeltaTime(now: number) {
    if (this.lastTime === 0) this.lastTime = now;

    const deltaTime = now - this.lastTime;
    this.lastTime = now;

    return deltaTime / 1000;
  }
}
