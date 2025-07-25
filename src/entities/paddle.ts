import { addComponent, addEntity, type IWorld } from "bitecs";
import { Color } from "../components/color.ts";
import { Player } from "../components/player.ts";
import { Rectangle } from "../components/shape.ts";
import { Transform } from "../components/transform.ts";

export default function Paddle<
  T extends IWorld,
  U extends {
    x: number;
    y: number;
    width: number;
    height: number;
    color: {
      r: number;
      g: number;
      b: number;
      a: number;
    };
  },
>(world: T, props: U) {
  const entity = addEntity(world);

  addComponent(world, Transform, entity);
  addComponent(world, Rectangle, entity);
  addComponent(world, Color, entity);
  addComponent(world, Player, entity);

  const { x, y, width, height, color } = props;

  Transform.x[entity] = x;
  Transform.y[entity] = y;
  Transform.translationX[entity] = 0;
  Transform.translationY[entity] = 0;
  Rectangle.width[entity] = width;
  Rectangle.height[entity] = height;
  Color.r[entity] = color.r;
  Color.g[entity] = color.g;
  Color.b[entity] = color.b;
  Color.a[entity] = color.a;

  return entity;
}
