import type { Control } from "./enums.ts";

export type IGameWorld = {
  // gl: WebGL2RenderingContext;
  // program: WebGLProgram;
  deltaTime: number;
  pressedKey: {
    [K in (typeof Control)[keyof typeof Control]]?: boolean;
  };
};

export interface ISystem<T extends IGameWorld = IGameWorld> {
  update(world: T): T;
}
