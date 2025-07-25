import { defineComponent, Types } from "bitecs";

export const Transform = defineComponent({
  x: Types.f32,
  y: Types.f32,
  translationX: Types.f32,
  translationY: Types.f32,
});
