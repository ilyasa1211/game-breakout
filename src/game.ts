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
import type { IGameWorld, IRenderable } from "./types.ts";
import LevelMetadata from "./levels/metadata.json" with { type: "json" };
import levelType from "./levels/level.typescript.example.json" with { type: "json"};
import settings from "./settings.ts";

export default class Game extends EventTarget {
  private requestAnimationFrameId: number | null = null;
  private level;
  private lastTime: number = 0;
  private isOver = false;

  private readonly world;
  private pipeline: ((...input: any[]) => any) | undefined;

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
      isStarted: false,
      deltaTime: 0,
      pressedKey: this.pressedKey,
    });

    const playerWidth = 100;
    const playerHeight = 30;
    const player = new Paddle(this.world, {
      x: canvas.clientWidth / 2 - playerWidth / 2,
      y: canvas.clientHeight - playerHeight * 3,
      width: playerWidth,
      height: playerHeight,
      color: {
        r: 200,
        g: 200,
        b: 0,
        a: 255,
      },
    });

    const ballRadius = 10;
    const ballOffsetCenter = 80;
    const ball = new Ball(this.world, {
      r: ballRadius,
      x: canvas.clientWidth / 2,
      y: canvas.clientHeight / 2 + ballOffsetCenter,
      color: {
        r: 0,
        g: 255,
        b: 0,
        a: 255,
      },
    });

    this.generateEnemiesFromLevel(this.level, this.world, canvas).then(enemies =>
      this.pipeline = pipe(
        ...[new Movement(canvas), new Render(canvas, [player, ball, enemies])].map(
          (system) => system.update.bind(system),
        ),
      )
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
  public async generateEnemiesFromLevel<T extends IGameWorld>(level: number, world: T, canvas: HTMLCanvasElement): Promise<IRenderable> {
    // I'm trying to create 10 blocks for each row and have 4 rows
    const gapX = 10;
    const gapY = 10;
    const maxEnemiesPerRow = 10;
    const enemyWidth = (canvas.clientWidth - gapX * maxEnemiesPerRow) / maxEnemiesPerRow;
    const enemyHeight = 30;

    /**
     * contaguous memory of x, y, w, h, and hardness
     */
    const enemies: number[] = [];
    const levelMeta = LevelMetadata.levels.find(l => l.level === level);

    if (typeof levelMeta === "undefined") {
      throw new Error(`level ${level} is not found in metadata`);
    }

    const levelData: Omit<typeof levelType, "$schema"> = await import(`../levels/${levelMeta.path}`);
    const enemiesCount = levelData.blocks.length;


    /**
     * Use Instancing!
     */

    return new (class <T extends IGameWorld = IGameWorld> implements IRenderable {
      private vao: WebGLVertexArrayObject | undefined;

      public constructor(world: T) {
      }

      public initRender(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement, attribute: { aTransLoc: GLint; aPosLoc: GLint; aColorLoc: GLint; aRotationLoc: GLint; }): void {
        const {
          aColorLoc,
          aPosLoc,
          aRotationLoc,
          aTransLoc
        } = attribute;

        // position x, y, x1, y1
        // color based on hardness

        this.vao = vao;
      }

      public updateRender(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement): void {

      }
    })(world);
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
    }
  }

  private getDeltaTime(now: number) {
    if (this.lastTime === 0) this.lastTime = now;

    const deltaTime = now - this.lastTime;
    this.lastTime = now;

    return deltaTime;
  }
}
