import { addComponent, addEntity, type IWorld } from "bitecs";
import { Color } from "../components/color.ts";
import { Player } from "../components/player.ts";
import { Rectangle } from "../components/shape.ts";
import { Transform } from "../components/transform.ts";
import type { IRenderable } from "../types.ts";
import { clipSpaceToWorldCoordinate } from "../utilities/coordinate.ts";
import { mat2 } from "../utilities/matrix.ts";

export default class Paddle<
  T extends IWorld,
  U extends {
    x: number;
    y: number;
    width: number;
    height: number;
    color: {
      r: number;
      g: number;
      b: number;
      a: number;
    };
  },
> implements IRenderable
{
  private readonly id: number;
  private canvas: HTMLCanvasElement | undefined;
  private vao: WebGLVertexArrayObject | undefined;
  private vbo: { translationBuffer: WebGLBuffer | null } = {
    translationBuffer: null,
  };
  private readonly x0 = 0;
  private readonly y0 = 0;

  public constructor(world: T, props: U) {
    const entity = addEntity(world);

    addComponent(world, Transform, entity);
    addComponent(world, Rectangle, entity);
    addComponent(world, Color, entity);
    addComponent(world, Player, entity);

    const { x, y, width, height, color } = props;

    Transform.x[entity] = x;
    Transform.y[entity] = y;
    Rectangle.width[entity] = width;
    Rectangle.height[entity] = height;
    Color.r[entity] = color.r;
    Color.g[entity] = color.g;
    Color.b[entity] = color.b;
    Color.a[entity] = color.a;

    this.id = entity;
  }
  public initRender(
    gl: WebGL2RenderingContext,
    canvas: HTMLCanvasElement,
    attribute: {
      aTransLoc: GLint;
      aPosLoc: GLint;
      aColorLoc: GLint;
      aRotationLoc: GLint;
    },
  ): void {
    this.canvas = canvas;
    const { aColorLoc, aPosLoc, aRotationLoc, aTransLoc } = attribute;

    const x = Transform.x[this.id];
    const y = Transform.y[this.id];
    const w = Rectangle.width[this.id];
    const h = Rectangle.height[this.id];

    const { x: x0, y: y0 } = clipSpaceToWorldCoordinate(
      this.x0,
      this.y0,
      canvas,
    );

    // calculate the translation
    const xT = ((x - x0) * 2) / canvas.clientWidth;
    const yT = ((y0 - y) * 2) / canvas.clientHeight;

    // Bottom-right in clip space
    const x1 = (w + x0) / this.canvas.clientWidth * 2 - 1;
    const y1 = 1 - (h + y0) / this.canvas.clientHeight * 2;

    const color = new Float32Array([
      Color.r[this.id] / 255,
      Color.g[this.id] / 255,
      Color.b[this.id] / 255,
      Color.a[this.id] / 255,
    ]);

    const shapePosition = new Float32Array([
      this.x0,
      this.y0,
      x1,
      this.y0,
      this.x0,
      y1,
      x1,
      y1,
    ]);

    const indices = new Uint8Array([0, 1, 2, 2, 1, 3]);

    const vao = gl.createVertexArray();
    this.vao = vao;

    gl.bindVertexArray(vao);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, shapePosition, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(aPosLoc);
    gl.vertexAttribPointer(
      aPosLoc,
      2,
      gl.FLOAT,
      false,
      2 * Float32Array.BYTES_PER_ELEMENT,
      0,
    );

    const matrixBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(mat2.identity()),
      gl.STATIC_DRAW,
    );
    for (let i = 0; i < 2; i++) {
      const loc = aRotationLoc + i;
      gl.vertexAttribPointer(
        loc,
        2,
        gl.FLOAT,
        false,
        4 * Float32Array.BYTES_PER_ELEMENT,
        i * 2 * Float32Array.BYTES_PER_ELEMENT,
      );
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribDivisor(loc, 1);
    }

    const translationBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, translationBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([xT, yT]), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(aTransLoc);
    gl.vertexAttribPointer(
      aTransLoc,
      2,
      gl.FLOAT,
      false,
      2 * Float32Array.BYTES_PER_ELEMENT,
      0,
    );
    gl.vertexAttribDivisor(aTransLoc, 1);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, color, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(aColorLoc);
    gl.vertexAttribPointer(
      aColorLoc,
      4,
      gl.FLOAT,
      false,
      4 * Float32Array.BYTES_PER_ELEMENT,
      0,
    );
    gl.vertexAttribDivisor(aColorLoc, 1);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    gl.bindVertexArray(null);

    this.vbo.translationBuffer = translationBuffer;
  }

  public updateRender(
    gl: WebGL2RenderingContext,
    canvas: HTMLCanvasElement,
  ): void {
    if (!this.vao) return;

    gl.bindVertexArray(this.vao);

    const { x: x0, y: y0 } = clipSpaceToWorldCoordinate(
      this.x0,
      this.y0,
      canvas,
    );

    const x = Transform.x[this.id];
    const y = Transform.y[this.id];

    // calculate the translation
    const xT = ((x - x0) * 2) / canvas.clientWidth;
    const yT = ((y0 - y) * 2) / canvas.clientHeight;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo.translationBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array([xT, yT]));
    gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0, 1);

    gl.bindVertexArray(null);
  }
}
