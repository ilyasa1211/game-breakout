export default {
  BACKGROUND_COLOR: [],
  BALL_ROUNDNESS: 12,
  PLAYER_SPEED: 1200,
  BLOCK_COLORS: [
    [0, 0, 0, 0], // transparent
    [255, 255, 0, 255], // yellow
    [0, 255, 0, 255], // green
    [0, 0, 255, 255], // blue
    [255, 0, 255, 255], // purple
  ],
  MAX_ENEMIES_PER_ROW: 10,
  MAX_ENEMIES_PER_COLUMN: 7,
  /**
   * In pixel
   */
  ENEMIES_GAP_X: 50,
  /**
   * In pixel
   */
  ENEMIES_GAP_Y: 50,
} as const;
