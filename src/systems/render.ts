import { defineQuery } from "bitecs";
import { Color } from "../components/color.ts";
import { Player } from "../components/player.ts";
import { Circle, Rectangle } from "../components/shape.ts";
import { Transform } from "../components/transform.ts";
import settings from "../settings.ts";
import fragmentSource from "../shaders/fragment.glsl?raw";
import vertexSource from "../shaders/vertex.glsl?raw";
import strings from "../strings.ts";
import type { IGameWorld, ISystem } from "../types.ts";
import { mat2 } from "../utilities/matrix.ts";
import { createProgram, createShader } from "../utilities/webgl.ts";

const renderEnemyQuery = defineQuery([Rectangle, Transform]);
const renderPlayerQuery = defineQuery([Rectangle, Transform, Player]);
const renderBallQuery = defineQuery([Circle, Transform]);

export default class Render<T extends IGameWorld = IGameWorld>
  implements ISystem<T> {
  private readonly gl: WebGL2RenderingContext;
  private readonly canvas: HTMLCanvasElement;
  private readonly aTransLoc: GLint;
  private readonly aPosLoc: GLint;
  private readonly aColorLoc: GLint;
  private readonly aRotationLoc: GLint;

  public constructor(canvas: HTMLCanvasElement, world: T) {
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

    this.aTransLoc = gl.getAttribLocation(program, "aTranslation");
    this.aPosLoc = gl.getAttribLocation(program, "aPos");
    this.aColorLoc = gl.getAttribLocation(program, "aColor");
    this.aRotationLoc = gl.getAttribLocation(program, "aRotation");

    // this.initBall(world);
    // this.initEnemy(world);
    this.initPlayer(world);
  }

  public update(world: T): T {
    const { gl } = this;
    const { ball, player, enemy } = world.renderMeta;

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw Player
    if (player.vao) {
      gl.bindVertexArray(player.vao);

      const playerId = renderPlayerQuery(world).at(0) as number;

      const x = Transform.x[playerId];
      const y = Transform.y[playerId];

      const canvasWidth = this.canvas.clientWidth;
      const canvasHeight = this.canvas.clientHeight;

      const clipX = (x / canvasWidth) * 2 - 1;
      const clipY = 1 - (y / canvasHeight) * 2;

      // gl.bindBuffer(gl.ARRAY_BUFFER, player.translationBuffer);
      // gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array([clipX, clipY]));
      gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0, 1);
      gl.bindVertexArray(null);
    }

    // Draw Ball
    // if (ball.vao) {
    //   gl.bindVertexArray(ball.vao);
    //   // gl.bindBuffer(gl.ARRAY_BUFFER, ball.positionBuffer);
    //   const ballId = renderBallQuery(world).at(0) as number;
    //   const x = Transform.x[ballId];
    //   const y = Transform.y[ballId];
    //   gl.drawElementsInstanced(gl.TRIANGLES, settings.TRIANGLES_COUNT_FOR_FULL_CIRCLE * 3, gl.UNSIGNED_BYTE, 0, 1);
    // }

    // Draw Enemies
    // if (enemy.vao) {
    //   gl.bindVertexArray(enemy.vao);
    //   for (const enemyId of renderEnemyQuery(world)) {
    //   }
    //   gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0, 1);

    //   gl.bindVertexArray(null);
    // }

    return world;
  }

  private initEnemy(world: T) { }
  private initBall(world: T) {
    const { gl } = this;

    // TODO: change this later to real number
    const maximumEnemyCounts = 3;
    const triangleCounts = settings.TRIANGLES_COUNT_FOR_FULL_CIRCLE;

    const ballId = renderBallQuery(world).at(0) as number;

    const color = new Float32Array([
      Color.r[ballId],
      Color.g[ballId],
      Color.b[ballId],
      Color.a[ballId],
    ]);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    world.renderMeta.ball.vao = vao;

    // 2 * 2 matrix
    const matrixRotation = new Float32Array(triangleCounts * 2 * 2);
    const indices = [];
    for (let i = 0; i < triangleCounts; i++) {
      const rotationLoc = this.aRotationLoc + i;
      const numFloat = 2;
      matrixRotation.set(
        mat2.rotation((Math.PI * 2) / triangleCounts),
        i * numFloat,
      );
      gl.vertexAttribPointer(
        this.aRotationLoc,
        2,
        gl.FLOAT,
        false,
        2 * 2 * Float32Array.BYTES_PER_ELEMENT,
        i * 2 * Float32Array.BYTES_PER_ELEMENT,
      );
      gl.enableVertexAttribArray(rotationLoc);
      gl.vertexAttribDivisor(rotationLoc, 1);

      indices.push(0, 1, 2);
    }

    gl.enableVertexAttribArray(this.aPosLoc);
    gl.enableVertexAttribArray(this.aColorLoc);

    const matrixRotationBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, matrixRotationBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, matrixRotation, gl.STATIC_DRAW);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      maximumEnemyCounts * triangleCounts * Float32Array.BYTES_PER_ELEMENT,
      gl.DYNAMIC_DRAW,
    );

    gl.vertexAttribPointer(
      this.aPosLoc,
      2,
      gl.FLOAT,
      false,
      2 * Float32Array.BYTES_PER_ELEMENT,
      0,
    );
    gl.enableVertexAttribArray(this.aPosLoc);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, color, gl.STATIC_DRAW);

    gl.vertexAttribPointer(
      this.aColorLoc,
      4,
      gl.FLOAT,
      false,
      4 * Float32Array.BYTES_PER_ELEMENT,
      0,
    );
    gl.enableVertexAttribArray(this.aColorLoc);

    gl.vertexAttribDivisor(this.aColorLoc, 1);
  }

  private initPlayer(world: T) {
    const { gl } = this;

    const playerId = renderPlayerQuery(world).at(0) as number;

    const x = Transform.x[playerId];
    const y = Transform.y[playerId];
    const w = Rectangle.width[playerId];
    const h = Rectangle.height[playerId];

    const canvasWidth = this.canvas.clientWidth;
    const canvasHeight = this.canvas.clientHeight;

    // Top-left corner (x1, y1) in clip space
    const x1 = (x / canvasWidth) * 2 - 1;
    const y1 = 1 - (y / canvasHeight) * 2;

    // Bottom-right corner (x2, y2) in clip space
    const x2 = ((x + w) / canvasWidth) * 2 - 1;
    const y2 = 1 - ((y + h) / canvasHeight) * 2;

    const color = new Float32Array([
      Color.r[playerId] / 255,
      Color.g[playerId] / 255,
      Color.b[playerId] / 255,
      Color.a[playerId] / 255,
    ]);

    const shapePosition = new Float32Array([
      x1, y1,
      x2, y1,
      x1, y2,
      x2, y2
    ]);

    const indices = new Uint8Array([0, 1, 2, 2, 1, 3]);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, shapePosition, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(this.aPosLoc);
    gl.vertexAttribPointer(
      this.aPosLoc,
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
      const loc = this.aRotationLoc + i;
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
    gl.bufferData(
      gl.ARRAY_BUFFER,
      2 * Float32Array.BYTES_PER_ELEMENT,
      gl.DYNAMIC_DRAW,
    );
    gl.enableVertexAttribArray(this.aTransLoc);
    gl.vertexAttribPointer(
      this.aTransLoc,
      2,
      gl.FLOAT,
      false,
      2 * Float32Array.BYTES_PER_ELEMENT,
      0,
    );
    gl.vertexAttribDivisor(this.aTransLoc, 1);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, color, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(this.aColorLoc);
    gl.vertexAttribPointer(
      this.aColorLoc,
      4,
      gl.FLOAT,
      false,
      4 * Float32Array.BYTES_PER_ELEMENT,
      0,
    );
    gl.vertexAttribDivisor(this.aColorLoc, 1);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    gl.bindVertexArray(null);

    world.renderMeta.player.vao = vao;
    world.renderMeta.player.translationBuffer = translationBuffer;
  }
}
