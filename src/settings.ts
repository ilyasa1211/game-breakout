export default {
  BACKGROUND_COLOR: [71, 125, 125, 255],
  BALL_ROUNDNESS: 12,
  BALL_RADIUS: 15,
  PLAYER_SPEED: 1200,
  /**
   * In pixel
   */
  ENEMY_WIDTH: 100,
  /**
   * In pixel
   */
  ENEMY_HEIGHT: 30,
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
    [255, 255, 0, 255], // yellow
    [0, 255, 0, 255], // green
    [0, 0, 255, 255], // blue
    [255, 0, 255, 255], // purple
  ],
} as const;
