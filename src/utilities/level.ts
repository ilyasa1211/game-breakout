import LevelMetadata from "../levels/metadata.json" with { type: "json" };
import levelType from "../levels/level.typescript.example.json" with { type: "json"};
import settings from "../settings.ts";
import { mat2 } from "../utilities/matrix.ts";
import { clipSpaceToWorldCoordinate } from "../utilities/coordinate.ts";
import type { IGameWorld, IRenderable } from "../types.ts";
import { addComponent, addEntity } from "bitecs";
import { Transform } from "../components/transform.ts";
import { Color } from "../components/color.ts";
import { Rectangle } from "../components/shape.ts";
import { Touhgness } from "../components/toughness.ts";

export async function generateEnemiesFromLevel<T extends IGameWorld>(level: number, world: T, canvas: HTMLCanvasElement): Promise<IRenderable> {
  const levelMeta = LevelMetadata.levels.find(l => l.level === level);

  if (typeof levelMeta === "undefined") {
    throw new Error(`level ${level} is not found in metadata`);
  }

  const levelData: Omit<typeof levelType, "$schema"> = await import(`../levels/${levelMeta.path}.json`, {
    with: {
      type: "json"
    }
  });

  /**
   * Multiple enemies class
   */
  return new (class <T extends IGameWorld = IGameWorld> implements IRenderable {
    private vao: WebGLVertexArrayObject | undefined;
    private entityIds: number[] = [];
    // private readonly gapXPx;
    // private readonly gapYPx;
    // private readonly maxEnemiesPerRow;
    private readonly widthPxEachEntity;
    private readonly heightPxEachEntity;

    public constructor(world: T, canvas: HTMLCanvasElement, {
      maxEnemiesPerRow = settings.MAX_ENEMIES_PER_ROW,
      maxEnemiesPerColumn = settings.MAX_ENEMIES_PER_COLUMN,
      gapXPx = settings.ENEMIES_GAP_X,
      gapYPx = settings.ENEMIES_GAP_Y,
    }: Partial<{
      /**
       * Horizontal gap between enemies in pixel
       */
      gapXPx: number,
      /**
       * Vertical gap between enemies in pixel
       */
      gapYPx: number,
      maxEnemiesPerRow: number,
      maxEnemiesPerColumn: number
    }> = {}) {
      // I'm trying to create 10 blocks for each row and have 4 rows
      // this.maxEnemiesPerRow = maxEnemiesPerRow;
      this.widthPxEachEntity = (canvas.clientWidth - gapXPx * maxEnemiesPerRow) / maxEnemiesPerRow;
      this.heightPxEachEntity = (canvas.clientHeight - gapYPx * maxEnemiesPerColumn) / maxEnemiesPerColumn;
      // this.gapXPx = gapXPx;
      // this.gapYPx = gapYPx;

      for (const [i, toughness] of levelData.blocks.entries()) {
        const id = addEntity(world);

        const row = Math.floor(i / maxEnemiesPerRow);
        const column = (i % maxEnemiesPerRow);

        const x = column * (this.widthPxEachEntity + gapXPx) + gapXPx / 2;
        const y = row * (this.heightPxEachEntity + gapYPx) + gapYPx / 2;

        addComponent(world, Transform, id);
        addComponent(world, Color, id);
        addComponent(world, Rectangle, id);

        Touhgness.t[id] = toughness;
        Transform.x[id] = x;
        Transform.y[id] = y;

        this.entityIds.push(id);
      }
    }

    public initRender(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement, attribute: { aTransLoc: GLint; aPosLoc: GLint; aColorLoc: GLint; aRotationLoc: GLint; }): void {
      const {
        aColorLoc,
        aPosLoc,
        aRotationLoc,
        aTransLoc
      } = attribute;

      const enemiesCount = this.entityIds.length;

      const x0 = 0;
      const y0 = 0;
      const { x: x0Px, y: y0Px } = clipSpaceToWorldCoordinate(x0, y0, canvas);

      const x1 = (x0Px + this.widthPxEachEntity) / canvas.clientWidth * 2 - 1;
      const y1 = 1 - (y0Px + this.heightPxEachEntity) / canvas.clientHeight * 2;

      const rectangle = new Float32Array([
        x0, y0,
        x1, y0,
        x1, y1,
        x0, y1,
      ]);

      const indices = new Uint8Array([
        0, 1, 2,
        0, 2, 3
      ]);

      const translations = new Float32Array(enemiesCount * 2); // 2 element: x, y
      const colors = new Float32Array(enemiesCount * 4);

      for (const [i, id] of this.entityIds.entries()) {
        const x = Transform.x[id];
        const y = Transform.y[id];
        const toughness = Touhgness.t[id];

        const xT = (x - x0Px) * 2 / canvas.clientWidth;
        const yT = (y0Px - y) * 2 / canvas.clientHeight;

        const color = (settings.BLOCK_COLORS.at(toughness) ?? settings.BLOCK_COLORS.at(-1))?.map(c => c / 255) as number[];

        translations.set(
          [xT, yT],
          i * 2
        );

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
      gl.enableVertexAttribArray(aPosLoc)
      gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 2 * rectangle.BYTES_PER_ELEMENT, 0);
      gl.vertexAttribDivisor(aPosLoc, 0);

      const colorBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(aColorLoc);
      gl.vertexAttribPointer(aColorLoc, 4, gl.FLOAT, false, 4 * colors.BYTES_PER_ELEMENT, 0);
      gl.vertexAttribDivisor(aColorLoc, 1);

      const rotationBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, rotationBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mat2.identity()), gl.STATIC_DRAW);

      const matrixSize = 2;

      for (let i = 0; i < matrixSize; i++) {
        const loc = aRotationLoc + i;
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 2 * Float32Array.BYTES_PER_ELEMENT, i * 2 * Float32Array.BYTES_PER_ELEMENT);
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribDivisor(loc, this.entityIds.length);
      }

      const translationBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, translationBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, translations, gl.STATIC_DRAW);
      gl.vertexAttribPointer(aTransLoc, 2, gl.FLOAT, false, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
      gl.enableVertexAttribArray(aTransLoc);
      gl.vertexAttribDivisor(aTransLoc, 1);

      gl.bindVertexArray(null);

      this.vao = vao;
    }

    public updateRender(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement): void {
      if (typeof this.vao === "undefined") return;

      gl.bindVertexArray(this.vao);
      gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0, this.entityIds.length);
    }
  })(world, canvas);
}