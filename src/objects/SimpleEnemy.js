/**
 * SimpleEnemy - Tutorial example falling asteroid/enemy
 *
 * This is a complete, working example showing how to create
 * a simple enemy entity.
 *
 * See docs/TUTORIAL_YOUR_FIRST_GAME.md for full tutorial
 */
export class SimpleEnemy {
  constructor(x, y, speed = 100) {
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 30;
    this.speed = speed; // pixels per second
    this.active = true;
    this.type = 'enemy';
  }

  /**
   * Move enemy downward
   * @param {number} deltaTime - Time since last frame (seconds)
   */
  update(deltaTime) {
    if (!this.active) return;

    this.y += this.speed * deltaTime;

    // Deactivate if off screen
    if (this.y > 650) {
      // A bit past screen edge
      this.active = false;
    }
  }

  /**
   * Draw enemy as a red square
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  draw(ctx) {
    if (!this.active) return;

    // Draw red square enemy
    ctx.fillStyle = '#f44336';
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Add white border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  }

  /**
   * Get bounding box for collision detection
   * @returns {{x: number, y: number, width: number, height: number}}
   */
  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  /**
   * Mark enemy as destroyed
   */
  destroy() {
    this.active = false;
  }

  /**
   * Check if enemy is still active
   * @returns {boolean}
   */
  isActive() {
    return this.active;
  }
}
