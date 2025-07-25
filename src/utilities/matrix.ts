export const mat2 = {
  identity: () => [1, 0, 0, 1],
  rotation: (angleRadians: number) => [
    Math.cos(angleRadians),
    -Math.sin(angleRadians),
    Math.sin(angleRadians),
    Math.cos(angleRadians),
  ],
};
