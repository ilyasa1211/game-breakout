export default {
  BACKGROUND_COLOR: [69, 69, 69, 255],
  BALL_ROUNDNESS: 12,
  BALL_RADIUS: 15,
  BALL_COLOR: [255, 150, 150, 255],
  PLAYER_SPEED: 1200,
  PLAYER_COLOR: [255, 255, 255, 255],

  ENEMY_COUNT_PER_ROW: 10,
  /**
   * In pixel
   */
  ENEMY_GAP_X: 30,
  /**
   * In pixel
   */
  ENEMY_GAP_Y: 30,
  /**
   * Based on tougness of the enemy
   */
  ENEMY_COLOS: [
    [0, 0, 0, 0], // transparent
    [255, 255, 100, 255], // yellow
    [0, 255, 0, 255], // green
    [0, 0, 255, 255], // blue
    [255, 0, 255, 255], // purple
  ],
} as const;
