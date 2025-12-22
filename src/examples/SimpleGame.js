/**
 * SimpleGame - Complete working example using Garax infrastructure
 *
 * This demonstrates:
 * - Dependency Injection pattern
 * - EventBus communication
 * - InputManager integration
 * - Game loop (update/draw)
 * - Collision detection
 * - State management
 *
 * See docs/TUTORIAL_YOUR_FIRST_GAME.md for full tutorial
 */
import { SimplePlayer } from '../objects/SimplePlayer.js';
import { SimpleEnemy } from '../objects/SimpleEnemy.js';

export class SimpleGame {
  constructor(dependencies = {}) {
    // Use Garax's Dependency Injection pattern
    this.eventBus = dependencies.eventBus;
    this.inputManager = dependencies.inputManager;
    this.logger = dependencies.logger || console;

    // Validate required dependencies
    if (!this.eventBus) {
      throw new Error('SimpleGame requires eventBus dependency');
    }
    if (!this.inputManager) {
      throw new Error('SimpleGame requires inputManager dependency');
    }

    // Game state
    this.canvas = null;
    this.ctx = null;
    this.player = null;
    this.enemies = [];
    this.score = 0;
    this.gameOver = false;
    this.paused = false;

    // Enemy spawning
    this.spawnTimer = 0;
    this.spawnInterval = 2.0; // Spawn enemy every 2 seconds
    this.enemySpeed = 100; // Increases over time

    // Score tracking
    this.scoreTimer = 0;
    this.scoreInterval = 1.0; // Add point every second

    this.logger.info('SimpleGame: Initialized');
  }

  /**
   * Initialize game (called once at startup)
   */
  async initialize() {
    this.logger.info('SimpleGame: Initializing...');

    // Get canvas element
    this.canvas = document.getElementById('game-canvas');
    if (!this.canvas) {
      throw new Error('Canvas element #game-canvas not found in DOM');
    }

    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 800;
    this.canvas.height = 600;

    // Create player at bottom center
    this.player = new SimplePlayer(380, 500);

    // Subscribe to Garax events
    this.setupEventListeners();

    // Announce to screen readers (accessibility)
    this.eventBus.emit('accessibility:announce', {
      message: 'Simple Space Shooter loaded. Use arrow keys or WASD to move. Avoid red enemies!',
      priority: 'polite'
    });

    this.logger.info('SimpleGame: Ready to play!');
  }

  /**
   * Set up event listeners for Garax systems
   */
  setupEventListeners() {
    this.eventBus.on('game:pause', () => {
      this.paused = true;
      this.logger.info('SimpleGame: Paused');
    });

    this.eventBus.on('game:resume', () => {
      this.paused = false;
      this.logger.info('SimpleGame: Resumed');
    });

    // Listen for restart key (R)
    this.eventBus.on('input:keyPress', (data) => {
      if (data.key === 'r' || data.key === 'R') {
        if (this.gameOver) {
          this.restart();
        }
      }
    });
  }

  /**
   * Update game state (called every frame)
   * @param {number} deltaTime - Time since last frame in seconds
   */
  update(deltaTime) {
    if (this.paused || this.gameOver) return;

    // Update player
    const inputState = this.inputManager.getInputState();
    this.player.update(deltaTime, inputState);

    // Check if player died
    if (!this.player.active) {
      this.handleGameOver();
      return;
    }

    // Update enemies
    this.updateEnemies(deltaTime);

    // Spawn enemies
    this.updateSpawning(deltaTime);

    // Update score
    this.updateScore(deltaTime);

    // Check collisions
    this.checkCollisions();
  }

  /**
   * Update all enemies
   */
  updateEnemies(deltaTime) {
    // Remove inactive enemies
    this.enemies = this.enemies.filter(enemy => enemy.active);

    // Update active enemies
    this.enemies.forEach(enemy => enemy.update(deltaTime));
  }

  /**
   * Handle enemy spawning
   */
  updateSpawning(deltaTime) {
    this.spawnTimer += deltaTime;

    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnEnemy();
      this.spawnTimer = 0;

      // Gradually increase difficulty
      if (this.score > 0 && this.score % 10 === 0) {
        this.enemySpeed += 10;
        this.spawnInterval = Math.max(0.5, this.spawnInterval - 0.1);
      }
    }
  }

  /**
   * Update score (points for survival)
   */
  updateScore(deltaTime) {
    this.scoreTimer += deltaTime;

    if (this.scoreTimer >= this.scoreInterval) {
      this.score++;
      this.scoreTimer = 0;

      // Emit event for UI updates
      this.eventBus.emit('score:updated', { score: this.score });
    }
  }

  /**
   * Spawn a new enemy at random X position
   */
  spawnEnemy() {
    const x = Math.random() * (800 - 30);
    const enemy = new SimpleEnemy(x, -30, this.enemySpeed);
    this.enemies.push(enemy);
  }

  /**
   * Check for collisions between player and enemies
   */
  checkCollisions() {
    const playerBounds = this.player.getBounds();

    this.enemies.forEach(enemy => {
      if (!enemy.active) return;

      const enemyBounds = enemy.getBounds();

      if (this.checkAABB(playerBounds, enemyBounds)) {
        // Player hit!
        this.player.onCollision(enemy);
        enemy.destroy();

        // Emit event for audio/visual feedback
        this.eventBus.emit('player:hit', {
          health: this.player.health,
          position: { x: this.player.x, y: this.player.y }
        });

        // Accessibility announcement
        this.eventBus.emit('accessibility:announce', {
          message: `Hit! Health: ${this.player.health}`,
          priority: 'assertive'
        });
      }
    });
  }

  /**
   * AABB (Axis-Aligned Bounding Box) collision detection
   * @param {Object} a - First bounding box
   * @param {Object} b - Second bounding box
   * @returns {boolean} True if boxes overlap
   */
  checkAABB(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }

  /**
   * Handle game over
   */
  handleGameOver() {
    this.gameOver = true;

    // Emit game over event
    this.eventBus.emit('game:over', {
      score: this.score,
      reason: 'player_died'
    });

    // Accessibility announcement
    this.eventBus.emit('accessibility:announce', {
      message: `Game Over! Final score: ${this.score}. Press R to restart.`,
      priority: 'assertive'
    });

    this.logger.info(`SimpleGame: Game Over - Score: ${this.score}`);
  }

  /**
   * Restart the game
   */
  restart() {
    this.logger.info('SimpleGame: Restarting...');

    this.player.reset();
    this.enemies = [];
    this.score = 0;
    this.gameOver = false;
    this.spawnTimer = 0;
    this.scoreTimer = 0;
    this.enemySpeed = 100;
    this.spawnInterval = 2.0;

    this.eventBus.emit('game:restart');
    this.eventBus.emit('accessibility:announce', {
      message: 'Game restarted',
      priority: 'polite'
    });
  }

  /**
   * Draw everything to canvas (called every frame)
   */
  draw() {
    // Clear screen with black background
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw stars/background
    this.drawBackground();

    // Draw player
    this.player.draw(this.ctx);

    // Draw enemies
    this.enemies.forEach(enemy => enemy.draw(this.ctx));

    // Draw UI overlay
    this.drawUI();
  }

  /**
   * Draw starfield background
   */
  drawBackground() {
    this.ctx.fillStyle = '#fff';
    // Simple static stars (in real game, could animate)
    for (let i = 0; i < 50; i++) {
      const x = (i * 37) % 800;
      const y = (i * 71) % 600;
      this.ctx.fillRect(x, y, 2, 2);
    }
  }

  /**
   * Draw UI elements (score, health, messages)
   */
  drawUI() {
    // Score and health display
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`Health: ${this.player.health}`, 10, 30);
    this.ctx.fillText(`Score: ${this.score}`, 10, 60);

    // Difficulty indicator
    const difficulty = Math.floor(this.score / 10) + 1;
    this.ctx.fillText(`Level: ${difficulty}`, 10, 90);

    // Game over overlay
    if (this.gameOver) {
      this.drawGameOver();
    }

    // Pause indicator
    if (this.paused) {
      this.ctx.font = '24px Arial';
      this.ctx.fillStyle = '#ffeb3b';
      this.ctx.fillText('PAUSED', 350, 30);
    }
  }

  /**
   * Draw game over screen
   */
  drawGameOver() {
    // Semi-transparent overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, 800, 600);

    // Game over text
    this.ctx.font = 'bold 64px Arial';
    this.ctx.fillStyle = '#f44336';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', 400, 250);

    // Final score
    this.ctx.font = '32px Arial';
    this.ctx.fillStyle = '#fff';
    this.ctx.fillText(`Final Score: ${this.score}`, 400, 320);

    // Restart instructions
    this.ctx.font = '20px Arial';
    this.ctx.fillStyle = '#4CAF50';
    this.ctx.fillText('Press R to Restart', 400, 380);

    // Reset text alignment
    this.ctx.textAlign = 'left';
  }

  /**
   * Cleanup when game is destroyed
   */
  cleanup() {
    // Remove event listeners
    this.eventBus.off('game:pause');
    this.eventBus.off('game:resume');
    this.eventBus.off('input:keyPress');

    this.logger.info('SimpleGame: Cleaned up');
  }
}
