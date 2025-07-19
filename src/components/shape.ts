import { defineComponent, Types } from "bitecs";

export const Rectangle = defineComponent({
  width: Types.ui32,
  height: Types.ui32,
});

export const Circle = defineComponent({
  radius: Types.ui32,
});
