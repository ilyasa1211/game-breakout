import { defineQuery, type IWorld } from "bitecs";
import { Circle, Rectangle } from "../components/shape.ts";
import { Transform } from "../components/transform.ts";

const renderRectQuery = defineQuery([Rectangle, Transform]);
const renderCircleQuery = defineQuery([Circle, Transform]);

export default function Render<T extends IWorld = IWorld>(world: T) {
  for (const eid of renderRectQuery(world)) {
    renderRect(
      Transform.x[eid],
      Transform.y[eid],
      Rectangle.width[eid],
      Rectangle.height[eid],
    );
  }

  for (const eid of renderCircleQuery(world)) {
    renderCircle(Transform.x[eid], Transform.y[eid], Circle.radius[eid]);
  }
}

function renderCircle(x: number, y: number, r: number) {}

function renderRect(x: number, y: number, width: number, height: number) {}
