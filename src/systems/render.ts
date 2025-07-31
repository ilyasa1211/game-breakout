import fragmentSource from "../shaders/fragment.glsl?raw";
import vertexSource from "../shaders/vertex.glsl?raw";
import strings from "../strings.ts";
import type { IGameWorld, IRenderable, ISystem } from "../types.ts";
import { createProgram, createShader } from "../utilities/webgl.ts";

export default class Render<T extends IGameWorld = IGameWorld>
  implements ISystem<T>
{
  private readonly gl: WebGL2RenderingContext;
  private readonly canvas: HTMLCanvasElement;
  private readonly renderableEntities: IRenderable[];

  public constructor(canvas: HTMLCanvasElement, entities: IRenderable[]) {
    this.canvas = canvas;

    const gl = canvas.getContext("webgl2");

    if (!gl) {
      throw new TypeError(strings.GL_IS_NULL);
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    const program = createProgram(gl, vertexShader, fragmentShader);

    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    gl.useProgram(program);

    this.gl = gl;

    gl.clearColor(71 / 255, 107 / 255, 74 / 255, 1.0);

    for (const entity of entities) {
      entity.initRender(gl, canvas, {
        aTransLoc: gl.getAttribLocation(program, "aTranslation"),
        aPosLoc: gl.getAttribLocation(program, "aPos"),
        aColorLoc: gl.getAttribLocation(program, "aColor"),
        aRotationLoc: gl.getAttribLocation(program, "aRotation"),
      });
    }

    this.renderableEntities = entities;
  }

  public update(world: T): T {
    const { gl } = this;

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw Player
    for (const entity of this.renderableEntities) {
      entity.updateRender(gl, this.canvas);
    }

    return world;
  }
}
