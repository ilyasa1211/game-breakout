import { defineQuery } from "bitecs";
import { Player } from "../components/player.ts";
import { Circle, Rectangle } from "../components/shape.ts";
import { Transform } from "../components/transform.ts";
import { Velocity } from "../components/velocity.ts";
import { Weapon } from "../components/weapon.ts";
import { Control, Direction } from "../enums.ts";
import settings from "../settings.ts";
import type { IGameWorld, ISystem } from "../types.ts";
import { clamp } from "../utilities/common.ts";

const movementPlayerQuery = defineQuery([Transform, Player]);
const movementWeaponQuery = defineQuery([Transform, Velocity, Weapon]);
const hasTouched = new Map<string, boolean>();

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

    player: if (typeof playerId !== "undefined") {
      const x = Transform.x[playerId];
      const w = Rectangle.width[playerId];

      if (x < 0) {
        Transform.x[playerId] = 0;
        break player;
      }

      if (Math.ceil(x + w) > this.canvas.clientWidth) {
        Transform.x[playerId] = this.canvas.clientWidth - Math.ceil(w);
        break player;
      }

      Transform.x[playerId] += direction * settings.PLAYER_SPEED * deltaTime;
    }

    ball: if (typeof ballId !== "undefined") {
      const x = Transform.x[ballId];
      const y = Transform.y[ballId];
      const r = Circle.radius[ballId];
      const xV = Velocity.x[ballId];
      const yV = Velocity.y[ballId];

      // follow the player if it hasn't started
      if (!isStarted && typeof playerId !== "undefined") {
        Transform.x[ballId] = Transform.x[playerId] + Rectangle.width[playerId] / 2;
        break ball;
      }

      borderCollision: {
        const checkedKey = {
          top: 'border-top',
          left: 'border-left',
          right: 'border-right',
        };

        if (Math.ceil(x + r) > this.canvas.clientWidth && !(hasTouched.get(checkedKey.right) ?? false)) {
          hasTouched.set(checkedKey.right, true);
          Velocity.x[ballId] = -xV;
          break borderCollision;
        }
        hasTouched.set(checkedKey.right, false);

        if (x - r < 0 && !(hasTouched.get(checkedKey.left) ?? false)) {
          hasTouched.set(checkedKey.left, true);
          Velocity.x[ballId] = -xV;
          break borderCollision;
        }
        hasTouched.set(checkedKey.left, false);

        // if (y > this.canvas.clientHeight) {
        //   Transform.x[ballId] = this.canvas.clientWidth - Math.ceil(r);
        //   break borderCollision;
        // }

        if (y - r < 0 && !(hasTouched.get(checkedKey.top) ?? false)) {
          hasTouched.set(checkedKey.top, true);
          Velocity.y[ballId] = -yV;
          break borderCollision;
        }
        hasTouched.set(checkedKey.top, false);
      }

      playerCollision: if (typeof playerId !== "undefined") {
        const checkedKey = `player-${playerId}`;
        const player = {
          x: Transform.x[playerId],
          y: Transform.y[playerId],
          w: Rectangle.width[playerId],
          h: Rectangle.height[playerId],
        };

        const nearestX = clamp(player.x, x, player.x + player.w);
        const nearestY = clamp(player.y, y, player.y + player.h);

        const dx = x - nearestX;
        const dy = y - nearestY;

        const distanceSq = dx * dx + dy * dy;

        if (distanceSq <= r * r && !(hasTouched.get(checkedKey) ?? false)) {
          hasTouched.set(checkedKey, true);
          Velocity.x[ballId] = (player.x + player.w / 2 - x) * -10;
          Velocity.y[ballId] = -yV;
          break playerCollision;
        }

        hasTouched.set(checkedKey, false);
      }

      Transform.x[ballId] += Velocity.x[ballId] * deltaTime;
      Transform.y[ballId] += Velocity.y[ballId] * deltaTime;
    }

    return world;
  }
}
