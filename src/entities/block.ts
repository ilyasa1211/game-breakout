import { addComponent, addEntity, type IWorld } from "bitecs";
import { Color } from "../components/color.ts";
import { Rectangle } from "../components/shape.ts";
import { Transform } from "../components/transform.ts";

export default function Block<
  T extends IWorld,
  U extends {
    x: number;
    y: number;
    width: number;
    height: number;
  },
>(world: T, props: U) {
  const entity = addEntity(world);

  addComponent(world, Transform, entity);
  addComponent(world, Color, entity);
  addComponent(world, Rectangle, entity);

  const { x, y, width, height } = props;

  Transform.x[entity] = x;
  Transform.y[entity] = y;
  Rectangle.width[entity] = width;
  Rectangle.height[entity] = height;

  return entity;
}
