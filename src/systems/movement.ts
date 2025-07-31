import { defineQuery } from "bitecs";
import { Player } from "../components/player.ts";
import { Rectangle } from "../components/shape.ts";
import { Transform } from "../components/transform.ts";
import { Velocity } from "../components/velocity.ts";
import { Weapon } from "../components/weapon.ts";
import { Control, Direction } from "../enums.ts";
import settings from "../settings.ts";
import type { IGameWorld, ISystem } from "../types.ts";

const movementPlayerQuery = defineQuery([Transform, Player]);
const movementWeaponQuery = defineQuery([Transform, Velocity, Weapon]);

export default class Movement<T extends IGameWorld = IGameWorld>
  implements ISystem<T> {
  private readonly canvas;

  public constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  public update(world: T): T {
    const { pressedKey, deltaTime, isStarted } = world;

    let direction: (typeof Direction)[keyof typeof Direction] = Direction.NONE;

    // if both key is pressed, just stay

    if (pressedKey[Control.RIGHT]) {
      direction += Direction.RIGHT;
    }
    if (pressedKey[Control.LEFT]) {
      direction += Direction.LEFT;
    }

    const playerId = movementPlayerQuery(world).at(0);
    const ballId = movementWeaponQuery(world).at(0);

    if (typeof playerId !== "undefined") {
      (() => {
        const x = Transform.x[playerId];
        const w = Rectangle.width[playerId];

        if (x < 0) {
          Transform.x[playerId] = 0;
          return;
        }

        if (x + w > this.canvas.clientWidth) {
          Transform.x[playerId] = this.canvas.clientWidth - w;
          return;
        }

        Transform.x[playerId] += direction * settings.PLAYER_SPEED * deltaTime;
      })();
    }

    if (typeof ballId !== "undefined") {
      (() => {
        const x = Transform.x[ballId];
        const y = Transform.y[ballId];

        // follow the player if it hasn't started
        if (!isStarted && typeof playerId !== "undefined") {
          Transform.x[ballId] = Transform.x[playerId] + Rectangle.width[playerId] / 2;
          return;
        }
      })();
    }

    return world;
  }
}
