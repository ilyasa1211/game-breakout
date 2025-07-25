import type { Control } from "./enums.ts";

const entity = ["player", "enemy", "ball"] as const;

export type IGameWorld = {
  renderMeta: IRenderMetadata;
  deltaTime: number;
  pressedKey: {
    [K in (typeof Control)[keyof typeof Control]]?: boolean;
  };
};

export type IRenderMetadata = {
  [K in (typeof entity)[number]]: {
    vao: WebGLVertexArrayObject | null;
    translationBuffer: WebGLBuffer | null;
    colorBuffer: WebGLBuffer | null;
  };
};

export interface ISystem<T extends IGameWorld = IGameWorld> {
  update(world: T): T;
}
