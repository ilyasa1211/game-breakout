import { defineQuery } from "bitecs";
import { Player } from "../components/player.ts";
import { Transform } from "../components/transform.ts";
import { Control, Direction } from "../enums.ts";
import type { IGameWorld } from "../types.ts";

const movementPlayerQuery = defineQuery([Transform, Player]);

export default function Movement<T extends IGameWorld = IGameWorld>(world: T) {
  const { pressedKey } = world;

  let direction: (typeof Direction)[keyof typeof Direction] = Direction.NONE;

  // if both key is pressed, just stay

  if (pressedKey[Control.RIGHT]) {
    direction += Direction.RIGHT;
  }
  if (pressedKey[Control.LEFT]) {
    direction += Direction.LEFT;
  }

  for (const eid of movementPlayerQuery(world)) {
    Transform.x[eid] += direction / 10;
  }

  return world;
}
