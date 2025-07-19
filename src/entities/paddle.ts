import { addComponent, addEntity, type IWorld } from "bitecs";
import { Color } from "../components/color.ts";
import { Rectangle } from "../components/shape.ts";
import { Transform } from "../components/transform.ts";

export const Paddle = (world: IWorld) => {
  const entity = addEntity(world);

  addComponent(world, Transform, entity);
  addComponent(world, Color, entity);
  addComponent(world, Rectangle, entity);

  return entity;
};
