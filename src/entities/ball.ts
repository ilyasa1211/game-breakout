import { addComponent, addEntity, type IWorld } from "bitecs";
import { Color } from "../components/color.ts";
import { Circle } from "../components/shape.ts";
import { Transform } from "../components/transform.ts";
import { Velocity } from "../components/velocity.ts";
import { Weapon } from "../components/weapon.ts";
import settings from "../settings.ts";
import type { IRenderable } from "../types.ts";
import { clipSpaceToWorldCoordinate } from "../utilities/coordinate.ts";
import { mat2 } from "../utilities/matrix.ts";

export default class Ball<
  T extends IWorld,
  U extends {
    /**
     * x velocity
     */
    xV: number;
    /**
     * y velocity
     */
    yV: number;
    /**
     * x axis in grid unit not pixel
     */
    x: number;
    /**
     * y axis in grid unit not pixel
     */
    y: number;
    /**
     * radius
     */
    r: number;
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
  private vao: WebGLVertexArrayObject | undefined;
  private vbo: { translationBuffer: WebGLBuffer | null } = {
    translationBuffer: null,
  };
  private readonly x0 = 0;
  private readonly y0 = 0;

  public constructor(world: T, props: U) {
    const entity = addEntity(world);

    addComponent(world, Transform, entity);
    addComponent(world, Color, entity);
    addComponent(world, Circle, entity);
    addComponent(world, Velocity, entity);
    addComponent(world, Weapon, entity);

    const { x, y, r, color, xV, yV } = props;

    Transform.x[entity] = x;
    Transform.y[entity] = y;
    Circle.radius[entity] = r;
    Color.r[entity] = color.r;
    Color.g[entity] = color.g;
    Color.b[entity] = color.b;
    Color.a[entity] = color.a;
    Velocity.x[entity] = xV;
    Velocity.y[entity] = yV;

    this.id = entity;
  }

  /**
   * Get initial position in world coordinate
   * @param canvas
   * @returns
   */
  private getInitialPosInWorld(canvas: HTMLCanvasElement) {
    return clipSpaceToWorldCoordinate(this.x0, this.y0, canvas);
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
    const { aColorLoc, aPosLoc, aRotationLoc, aTransLoc } = attribute;

    const triangleCounts = settings.BALL_ROUNDNESS;

    const x = Transform.x[this.id];
    const y = Transform.y[this.id];

    const { x: x0, y: y0 } = this.getInitialPosInWorld(canvas);

    // translation
    const xT = ((x - x0) * 2) / canvas.clientWidth;
    const yT = ((y0 - y) * 2) / canvas.clientHeight;

    const radiusX = (Circle.radius[this.id] * 2) / canvas.clientWidth;
    const radiusY = (Circle.radius[this.id] * 2) / canvas.clientHeight;

    const color = new Float32Array([
      Color.r[this.id] / 255,
      Color.g[this.id] / 255,
      Color.b[this.id] / 255,
      Color.a[this.id] / 255,
    ]);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const circleVertices = [this.x0, this.y0];
    for (let i = 0; i <= triangleCounts; i++) {
      const angle = (i * 2 * Math.PI) / triangleCounts;

      circleVertices.push(radiusX * Math.cos(angle), radiusY * Math.sin(angle));
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(circleVertices),
      gl.DYNAMIC_DRAW,
    );
    gl.enableVertexAttribArray(aPosLoc);
    gl.vertexAttribPointer(
      aPosLoc,
      2,
      gl.FLOAT,
      false,
      2 * Float32Array.BYTES_PER_ELEMENT,
      0,
    );
    gl.vertexAttribDivisor(aPosLoc, 0);

    const rotationBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, rotationBuffer);
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

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, color, gl.STATIC_DRAW);
    gl.vertexAttribPointer(
      aColorLoc,
      4,
      gl.FLOAT,
      false,
      4 * Float32Array.BYTES_PER_ELEMENT,
      0,
    );
    gl.enableVertexAttribArray(aColorLoc);
    gl.vertexAttribDivisor(aColorLoc, 1);

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

    gl.bindVertexArray(null);

    this.vao = vao;
    this.vbo.translationBuffer = translationBuffer;
  }

  public updateRender(
    gl: WebGL2RenderingContext,
    canvas: HTMLCanvasElement,
  ): void {
    if (!this.vao) return;
    gl.bindVertexArray(this.vao);

    const { x: x0, y: y0 } = this.getInitialPosInWorld(canvas);

    const x = Transform.x[this.id];
    const y = Transform.y[this.id];

    // calculate the translation
    const xT = ((x - x0) * 2) / canvas.clientWidth;
    const yT = ((y0 - y) * 2) / canvas.clientHeight;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo.translationBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array([xT, yT]));

    gl.drawArraysInstanced(gl.TRIANGLE_FAN, 0, settings.BALL_ROUNDNESS + 2, 1);

    gl.bindVertexArray(this.vao);
  }
}
