import { defineQuery } from "bitecs";
import { Player } from "../components/player.ts";
import { Transform } from "../components/transform.ts";
import { Control, Direction } from "../enums.ts";
import settings from "../settings.ts";
import type { IGameWorld, ISystem } from "../types.ts";
import { Rectangle } from "../components/shape.ts";

const movementPlayerQuery = defineQuery([Transform, Player]);

export default class Movement<T extends IGameWorld = IGameWorld>
  implements ISystem<T>
{
  private readonly canvas;

  public constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  public update(world: T): T {
    const { pressedKey, deltaTime } = world;

    let direction: (typeof Direction)[keyof typeof Direction] = Direction.NONE;

    // if both key is pressed, just stay

    if (pressedKey[Control.RIGHT]) {
      direction += Direction.RIGHT;
    }
    if (pressedKey[Control.LEFT]) {
      direction += Direction.LEFT;
    }

    for (const eid of movementPlayerQuery(world)) {
      const x = Transform.x[eid];
      const w = Rectangle.width[eid];

      // if (x < 0) {
      //   Transform.x[eid] = 0;
      //   break;
      // }

      // if (x + w > this.canvas.clientWidth) {
      //   Transform.x[eid] = this.canvas.clientWidth - w;
      //   break;
      // }

      Transform.x[eid] += direction * settings.PLAYER_SPEED * deltaTime;
    }

    return world;
  }
}
