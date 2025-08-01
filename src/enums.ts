export const KeyDown = {
  W: "w",
  A: "a",
  S: "s",
  D: "d",
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
  ARROW_UP: "ArrowUp",
  ARROW_DOWN: "ArrowDown",
  SPACE: " ",
} as const;

export const Control = {
  NONE: 0,
  LEFT: 1,
  RIGHT: 2,
} as const;

export const Direction = {
  NONE: 0,
  LEFT: -1,
  RIGHT: 1,
} as const;
