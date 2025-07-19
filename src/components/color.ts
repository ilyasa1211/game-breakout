import { defineComponent, Types } from "bitecs";

export const Color = defineComponent({
  r: Types.ui8,
  g: Types.ui8,
  b: Types.ui8,
  a: Types.ui8,
});
