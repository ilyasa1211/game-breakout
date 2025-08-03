import { defineQuery } from "bitecs";
import { Circle } from "../components/shape.ts";
import { Touhgness } from "../components/toughness.ts";
import { Transform } from "../components/transform.ts";
import { Weapon } from "../components/weapon.ts";
import { GameOverStatus } from "../enums.ts";
import { GameOverEvent } from "../events/game.ts";
import type { IGameWorld, ISystem } from "../types.ts";

const enemyQuery = defineQuery([Transform, Touhgness]);
const weaponQuery = defineQuery([Transform, Circle, Weapon]);

export default class CheckSystem implements ISystem {
  private readonly canvas;

  public constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  update(world: IGameWorld): IGameWorld {
    const { eventTarget } = world;

    const ballId = weaponQuery(world).at(0);

    if (typeof ballId !== "undefined") {
      const y = Transform.y[ballId];
      const r = Circle.radius[ballId];

      if (y - r > this.canvas.clientHeight) {
        eventTarget.dispatchEvent(new GameOverEvent(GameOverStatus.LOSE));
      }
    }

    if (enemyQuery(world).every((enemyId) => Touhgness.t[enemyId] <= 0)) {
      eventTarget.dispatchEvent(new GameOverEvent(GameOverStatus.WIN));
    }

    return world;
  }
}
