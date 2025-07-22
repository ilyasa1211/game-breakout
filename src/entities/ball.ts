import { addComponent, addEntity, type IWorld } from "bitecs";
import { Color } from "../components/color.ts";
import { Circle } from "../components/shape.ts";
import { Transform } from "../components/transform.ts";

export default class Ball<
  T extends IWorld,
  U extends {
    /**
     * x axis in grid unit not pixel
     */
    x: number;
    /**
     * y axis in grid unit not pixel
     */
    y: number;
    /**
     * radius
     */
    r: number;
  },
> {
  public constructor(world: T, props: U) {
    const entity = addEntity(world);

    addComponent(world, Transform, entity);
    addComponent(world, Color, entity);
    addComponent(world, Circle, entity);

    const { x, y, r } = props;

    Transform.x[entity] = x;
    Transform.y[entity] = y;
    Circle.radius[entity] = r;

    return entity;
  }
}
