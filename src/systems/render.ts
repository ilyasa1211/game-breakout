import { defineQuery } from "bitecs";
import { Circle, Rectangle } from "../components/shape.ts";
import { Transform } from "../components/transform.ts";
import fragmentSource from "../shaders/fragment.glsl?raw";
import vertexSource from "../shaders/vertex.glsl?raw";
import strings from "../strings.ts";
import type { IGameWorld, ISystem } from "../types.ts";
import { createProgram, createShader } from "../utilities/webgl.ts";

const renderRectQuery = defineQuery([Rectangle, Transform]);
const renderCircleQuery = defineQuery([Circle, Transform]);

export default class Render<T extends IGameWorld = IGameWorld>
  implements ISystem<T>
{
  private gl: WebGL2RenderingContext;
  private canvas: HTMLCanvasElement;
  private transLoc: WebGLUniformLocation | undefined;

  public constructor(canvas: HTMLCanvasElement) {
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

    this.transLoc = gl.getUniformLocation(
      program,
      "aTranslation",
    ) as WebGLUniformLocation;

    const shapePosition = new Float32Array([
      -0.5, 0, 0.5, 0, 0.5, -0.5, -0.5, -0.5,
    ]);

    const indices = new Uint8Array([0, 1, 2, 0, 2, 3]);

    const colors = new Float32Array([1.0, 1.0, 1.0, 1.0]);

    const positionLocation = gl.getAttribLocation(program, "aPos");
    const colorLocation = gl.getAttribLocation(program, "aColor");

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    gl.enableVertexAttribArray(positionLocation);
    gl.enableVertexAttribArray(colorLocation);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      4 * 2 * Float32Array.BYTES_PER_ELEMENT,
      gl.STATIC_DRAW,
    );
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, shapePosition);

    gl.vertexAttribPointer(
      positionLocation,
      2,
      gl.FLOAT,
      false,
      2 * Float32Array.BYTES_PER_ELEMENT,
      0,
    )

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    gl.vertexAttribPointer(
      colorLocation,
      4,
      gl.FLOAT,
      false,
      4 * Float32Array.BYTES_PER_ELEMENT,
      0,
    );
    gl.vertexAttribDivisor(colorLocation, 1);
  }

  public update(world: T): T {
    const gl = this.gl;

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    gl.clear(gl.COLOR_BUFFER_BIT);

    for (const eid of renderRectQuery(world)) {
      const x = Transform.x[eid];
      // const y = Transform.y[eid]
      gl.uniform2f(this.transLoc!, x - 0.5, 0);
      gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0, 1);

      // renderRect(
      //   gl,
      //   Transform.x[eid],
      //   Transform.y[eid],
      //   Rectangle.width[eid],
      //   Rectangle.height[eid],
      // );
    }

    // for (const eid of renderCircleQuery(world)) {
    //   renderCircle(gl, Transform.x[eid], Transform.y[eid], Circle.radius[eid]);
    // }

    return world;
  }
}

function renderCircle(
  gl: WebGL2RenderingContext,
  x: number,
  y: number,
  r: number,
) {}

function renderRect(
  gl: WebGL2RenderingContext,
  x: number,
  y: number,
  width: number,
  height: number,
) {}
