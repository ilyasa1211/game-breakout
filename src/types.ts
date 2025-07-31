import type { Control } from "./enums.ts";

const entity = ["player", "enemy", "ball"] as const;

export type IGameWorld = {
  isStarted: boolean;
  deltaTime: number;
  pressedKey: {
    [K in (typeof Control)[keyof typeof Control]]?: boolean;
  };
};

export interface ISystem<T extends IGameWorld = IGameWorld> {
  update(world: T): T;
}

export interface IRenderable<
  T = {
    aTransLoc: GLint;
    aPosLoc: GLint;
    aColorLoc: GLint;
    aRotationLoc: GLint;
  },
> {
  initRender(
    gl: WebGL2RenderingContext,
    canvas: HTMLCanvasElement,
    attribute: T,
  ): void;
  updateRender(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement): void;
}

export interface IEntity {};
