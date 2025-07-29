export function worldToClipSpaceCoordinate(
  x: number,
  y: number,
  canvas: HTMLCanvasElement,
) {
  const xc = (x / canvas.clientWidth) * 2 - 1;
  const yc = (y / canvas.clientHeight) * 2 - 1;

  return {
    x: xc,
    y: yc,
  };
}

export function clipSpaceToWorldCoordinate(
  x: number,
  y: number,
  canvas: HTMLCanvasElement,
) {
  const xw = ((x + 1) / 2) * canvas.clientWidth;
  const yw = ((y + 1) / 2) * canvas.clientHeight;

  return { x: xw, y: yw };
}
