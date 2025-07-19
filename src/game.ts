import { createWorld, pipe } from "bitecs";
import type { RefObject } from "preact";
import { Control, KeyDown } from "./enums.ts";
import { KeyDownEvent, KeyUpEvent } from "./events/input.ts";
import fragmentSource from "./shaders/fragment.glsl?raw";
import vertexSource from "./shaders/vertex.glsl?raw";
import Movement from "./systems/movement.ts";
import Render from "./systems/render.ts";
import type { IGameWorld } from "./types.ts";
import { createProgram, createShader } from "./utilities/webgl.ts";

export default class Game extends EventTarget {
  private requestAnimationFrameId: number | null = null;
  private level;
  private lastTime: number = 0;

  private readonly canvas;
  private readonly gl;
  private readonly program;

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

    if (canvas === null) {
      throw new TypeError("canvas is null");
    }

    const gl = canvas.getContext("webgl2");

    if (gl === null) {
      throw new TypeError("Failed to initialize webgl2 context", {
        cause: "Your browser didn't support webgl2 context",
      });
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    const program = createProgram(gl, vertexShader, fragmentShader);

    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    gl.useProgram(program);

    this.program = program;
    this.gl = gl;
    this.level = level;
    this.canvas = canvas;

    this.world = createWorld<IGameWorld>({
      gl: this.gl,
      program: this.program,
      deltaTime: 0,
      pressedKey: this.pressedKey,
    });

    this.pipeline = pipe(Movement, Render);

    // init input listener
    this.addEventListener(KeyDownEvent.name, (e) => {
      this.onKeyDown((e as KeyDownEvent).detail);
    });
    this.addEventListener(KeyUpEvent.name, (e) => {
      this.onKeyUp((e as KeyUpEvent).detail);
    });
  }

  /**
   * Entry point, trigger the game loop
   */
  public start() {
    this.requestAnimationFrameId = requestAnimationFrame((now) => {
      this.onUpdate(now);
      this.start(); // recursive
    });
  }

  private onUpdate(now: number) {
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.world.deltaTime = this.getDeltaTime(now);
    this.pipeline(this.world);
  }

  private onDestroy() {
    if (this.requestAnimationFrameId) {
      cancelAnimationFrame(this.requestAnimationFrameId);
    }
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
