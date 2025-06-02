import type { Vec2 } from "../types/position";
import type { Drawable } from "./interfaces/drawable";
import type { Rectangle } from "./interfaces/rectangle";

export default class Paddle implements Rectangle, Drawable {
    private position: Vec2;
    public constructor(position: Vec2) {
        this.position = position;
    }

    public draw(gl: WebGL2RenderingContext): void {
        const vertices = new Float32Array([
            -0.3, 0.3, 0.0,
            0.3, 0.3, 0.0,
            0.3, -0.3, 0.0,
            -0.3, -0.3, 0.0,
        ]);

        const vbo: number | null = null;
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(g.ARRAY_BUFFER, vertices.length, gl.STATIC_DRAW);

                
    }
}