import { addComponent, addEntity, defineQuery } from "bitecs";
import { Color } from "../components/color.ts";
import { Rectangle } from "../components/shape.ts";
import { Touhgness } from "../components/toughness.ts";
import { Transform } from "../components/transform.ts";
import LevelMetadata from "../levels/level.metadata.json";
import levelType from "../schemas/level.typescript.example.json" with {
  type: "json",
};
import settings from "../settings.ts";
import type { IGameWorld, IRenderable } from "../types.ts";
import { clipSpaceToWorldCoordinate } from "./coordinate.ts";
import { mat2 } from "./matrix.ts";

const enemyQuery = defineQuery([Transform, Touhgness, Rectangle]);

export async function generateEnemiesFromLevel<T extends IGameWorld>(
  level: number,
  world: T,
  canvas: HTMLCanvasElement,
): Promise<IRenderable> {
  const levelMeta = LevelMetadata.levels.find((l) => l.level === level);

  if (typeof levelMeta === "undefined") {
    throw new Error(`level ${level} is not found in metadata`);
  }

  const levelData: Omit<typeof levelType, "$schema"> = await import(
    `../levels/level-${levelMeta.path}.json`
  );

  /**
   * Multiple enemies class
   */
  return new (class<T extends IGameWorld = IGameWorld> implements IRenderable {
    private vao: WebGLVertexArrayObject | undefined;
    private entityIds: number[] = [];
    // private readonly gapXPx;
    // private readonly gapYPx;
    // private readonly maxEnemiesPerRow;
    private readonly enemyWidth;
    private readonly enemyHeight;
    private colorBuffer: WebGLBuffer | undefined;

    public constructor(
      world: T,
      canvas: HTMLCanvasElement,
      {
        enemyCountPerRow = settings.ENEMY_COUNT_PER_ROW,
        gapXPx = settings.ENEMY_GAP_X,
        gapYPx = settings.ENEMY_GAP_Y,
      }: Partial<{
        /**
         * Horizontal gap between enemies in pixel
         */
        gapXPx: number;
        /**
         * Vertical gap between enemies in pixel
         */
        gapYPx: number;
        enemyCountPerRow: number;
      }> = {},
    ) {
      this.enemyWidth = (canvas.clientWidth - gapXPx * enemyCountPerRow) / enemyCountPerRow;
      this.enemyHeight = this.enemyWidth / 3;

      for (const [i, toughness] of levelData.blocks.entries()) {
        const id = addEntity(world);

        const row = Math.floor(i / enemyCountPerRow);
        const column = i % enemyCountPerRow;

        const x = column * (this.enemyWidth + gapXPx) + gapXPx / 2;
        const y = row * (this.enemyHeight + gapYPx) + gapYPx / 2;

        addComponent(world, Transform, id);
        addComponent(world, Touhgness, id);
        addComponent(world, Color, id);
        addComponent(world, Rectangle, id);

        Touhgness.t[id] = toughness;
        Transform.x[id] = x;
        Transform.y[id] = y;
        Rectangle.width[id] = this.enemyWidth;
        Rectangle.height[id] = this.enemyHeight;

        this.entityIds.push(id);
      }
    }

    private getColorByToughness(toughness: number): number[] {
      return (
        settings.ENEMY_COLOS.at(toughness) ?? settings.ENEMY_COLOS.at(-1)
      )?.map((c) => c / 255) as number[];
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

      const enemiesCount = this.entityIds.length;

      const x0 = 0;
      const y0 = 0;
      const { x: x0Px, y: y0Px } = clipSpaceToWorldCoordinate(x0, y0, canvas);

      const x1 = ((x0Px + this.enemyWidth) / canvas.clientWidth) * 2 - 1;
      const y1 = 1 - ((y0Px + this.enemyHeight) / canvas.clientHeight) * 2;

      const rectangle = new Float32Array([x0, y0, x1, y0, x1, y1, x0, y1]);

      const indices = new Uint8Array([0, 1, 2, 0, 2, 3]);

      const translations = new Float32Array(enemiesCount * 2); // 2 element: x, y
      const colors = new Float32Array(enemiesCount * 4);

      for (const [i, id] of this.entityIds.entries()) {
        const x = Transform.x[id];
        const y = Transform.y[id];
        const toughness = Touhgness.t[id];

        const xT = ((x - x0Px) * 2) / canvas.clientWidth;
        const yT = ((y0Px - y) * 2) / canvas.clientHeight;

        const color = this.getColorByToughness(toughness);

        translations.set([xT, yT], i * 2);

        colors.set(color, i * color.length);
      }

      const vao = gl.createVertexArray();
      gl.bindVertexArray(vao);

      const indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, rectangle, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(aPosLoc);
      gl.vertexAttribPointer(
        aPosLoc,
        2,
        gl.FLOAT,
        false,
        2 * rectangle.BYTES_PER_ELEMENT,
        0,
      );
      gl.vertexAttribDivisor(aPosLoc, 0);

      const colorBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(aColorLoc);
      gl.vertexAttribPointer(
        aColorLoc,
        4,
        gl.FLOAT,
        false,
        4 * colors.BYTES_PER_ELEMENT,
        0,
      );
      gl.vertexAttribDivisor(aColorLoc, 1);

      const rotationBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, rotationBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(mat2.identity()),
        gl.STATIC_DRAW,
      );

      const matrixSize = 2;

      for (let i = 0; i < matrixSize; i++) {
        const loc = aRotationLoc + i;
        gl.vertexAttribPointer(
          loc,
          2,
          gl.FLOAT,
          false,
          2 * Float32Array.BYTES_PER_ELEMENT,
          i * 2 * Float32Array.BYTES_PER_ELEMENT,
        );
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribDivisor(loc, this.entityIds.length);
      }

      const translationBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, translationBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, translations, gl.STATIC_DRAW);
      gl.vertexAttribPointer(
        aTransLoc,
        2,
        gl.FLOAT,
        false,
        2 * Float32Array.BYTES_PER_ELEMENT,
        0,
      );
      gl.enableVertexAttribArray(aTransLoc);
      gl.vertexAttribDivisor(aTransLoc, 1);

      gl.bindVertexArray(null);

      this.vao = vao;
      this.colorBuffer = colorBuffer;
    }

    public updateRender(
      gl: WebGL2RenderingContext,
      _canvas: HTMLCanvasElement,
    ): void {
      if (typeof this.vao === "undefined") return;

      if (typeof this.colorBuffer === "undefined") {
        throw new Error("propery color buffer is undefined");
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);

      for (const [i, enemyId] of enemyQuery(world).entries()) {
        const toughness = Touhgness.t[enemyId];
        const color = this.getColorByToughness(toughness);

        gl.bufferSubData(
          gl.ARRAY_BUFFER,
          i * 4 * Float32Array.BYTES_PER_ELEMENT,
          new Float32Array(color),
        );
      }

      gl.bindVertexArray(this.vao);
      gl.drawElementsInstanced(
        gl.TRIANGLES,
        6,
        gl.UNSIGNED_BYTE,
        0,
        this.entityIds.length,
      );
    }
  })(world, canvas);
}
