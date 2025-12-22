/**
 * SimplePlayer - Tutorial example spaceship
 *
 * This is a complete, working example showing how to create
 * a player entity that integrates with Garax's systems.
 *
 * See docs/TUTORIAL_YOUR_FIRST_GAME.md for full tutorial
 */
export class SimplePlayer {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 40;
    this.speed = 200; // pixels per second
    this.health = 3;
    this.maxHealth = 3;
    this.score = 0;
    this.active = true;
  }

  /**
   * Update player based on input
   * @param {number} deltaTime - Time since last frame (seconds)
   * @param {Object} inputState - Current input state from InputManager
   */
  update(deltaTime, inputState) {
    if (!this.active) return;

    // Movement using arrow keys or WASD
    if (inputState.keys.ArrowLeft || inputState.keys.KeyA) {
      this.x -= this.speed * deltaTime;
    }
    if (inputState.keys.ArrowRight || inputState.keys.KeyD) {
      this.x += this.speed * deltaTime;
    }
    if (inputState.keys.ArrowUp || inputState.keys.KeyW) {
      this.y -= this.speed * deltaTime;
    }
    if (inputState.keys.ArrowDown || inputState.keys.KeyS) {
      this.y += this.speed * deltaTime;
    }

    // Keep player on screen (assuming 800x600 canvas)
    this.x = Math.max(0, Math.min(800 - this.width, this.x));
    this.y = Math.max(0, Math.min(600 - this.height, this.y));
  }

  /**
   * Draw player to canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  draw(ctx) {
    if (!this.active) return;

    // Draw simple spaceship (triangle pointing up)
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.moveTo(this.x + this.width / 2, this.y); // Top point
    ctx.lineTo(this.x, this.y + this.height); // Bottom left
    ctx.lineTo(this.x + this.width, this.y + this.height); // Bottom right
    ctx.closePath();
    ctx.fill();

    // Draw health bar above ship
    const healthBarWidth = this.width * (this.health / this.maxHealth);
    ctx.fillStyle = this.health > 1 ? '#4CAF50' : '#f44336';
    ctx.fillRect(this.x, this.y - 10, healthBarWidth, 5);

    // Health bar outline
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x, this.y - 10, this.width, 5);
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
      height: this.height
    };
  }

  /**
   * Handle collision with another object
   * @param {Object} other - The object we collided with
   */
  onCollision(other) {
    if (other.type === 'enemy') {
      this.health--;
      if (this.health <= 0) {
        this.active = false;
      }
    }
  }

  /**
   * Reset player to starting state
   */
  reset() {
    this.x = 380;
    this.y = 500;
    this.health = this.maxHealth;
    this.score = 0;
    this.active = true;
  }
}
