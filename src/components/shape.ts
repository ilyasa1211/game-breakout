import { defineComponent, Types } from "bitecs";

export const Rectangle = defineComponent({
  width: Types.f32,
  height: Types.f32,
});

export const Circle = defineComponent({
  radius: Types.f32,
});
