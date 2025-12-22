# 🎮 Tutorial: Your First Game in 30 Minutes

This tutorial shows you how to build a simple space shooter using Garax's infrastructure. You'll learn how to:
- Create a moving player
- Spawn enemies
- Handle collisions
- Add scoring
- Use the EventBus for communication

By the end, you'll have a working game and understand how to use Garax's systems.

---

## Prerequisites

Already have Garax running? Great! If not:

```bash
git clone https://github.com/I-Onlabs/Garax.git
cd Garax
npm install
npm run dev
```

Open http://localhost:5173 - you should see the game framework running.

---

## Step 1: Create Your Player Entity (5 minutes)

Create a new file `src/objects/SimplePlayer.js`:

```javascript
/**
 * SimplePlayer - Your controllable spaceship
 */
export class SimplePlayer {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 40;
    this.speed = 200; // pixels per second
    this.health = 3;
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

    // Keep player on screen
    this.x = Math.max(0, Math.min(800 - this.width, this.x));
    this.y = Math.max(0, Math.min(600 - this.height, this.y));
  }

  /**
   * Draw player to canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  draw(ctx) {
    if (!this.active) return;

    // Draw simple spaceship (triangle)
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.moveTo(this.x + this.width / 2, this.y); // Top point
    ctx.lineTo(this.x, this.y + this.height); // Bottom left
    ctx.lineTo(this.x + this.width, this.y + this.height); // Bottom right
    ctx.closePath();
    ctx.fill();

    // Draw health bar
    ctx.fillStyle = '#f44336';
    ctx.fillRect(this.x, this.y - 10, this.width * (this.health / 3), 5);
  }

  /**
   * Get bounding box for collision detection
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
   */
  onCollision(other) {
    if (other.type === 'enemy') {
      this.health--;
      if (this.health <= 0) {
        this.active = false;
      }
    }
  }
}
```

**What you learned:**
- How to create a game entity with position, size, and state
- How to read input from Garax's InputManager
- How to implement update/draw pattern
- How to prepare for collision detection

---

## Step 2: Create Simple Enemies (5 minutes)

Create `src/objects/SimpleEnemy.js`:

```javascript
/**
 * SimpleEnemy - Falling asteroids/enemies
 */
export class SimpleEnemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 30;
    this.speed = 100; // pixels per second
    this.active = true;
    this.type = 'enemy';
  }

  /**
   * Move enemy downward
   */
  update(deltaTime) {
    if (!this.active) return;

    this.y += this.speed * deltaTime;

    // Deactivate if off screen
    if (this.y > 600) {
      this.active = false;
    }
  }

  /**
   * Draw enemy
   */
  draw(ctx) {
    if (!this.active) return;

    ctx.fillStyle = '#f44336';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  /**
   * Get bounding box
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
   * Mark enemy as destroyed
   */
  destroy() {
    this.active = false;
  }
}
```

---

## Step 3: Wire It Into Garax's GameLoop (10 minutes)

Now let's integrate with Garax's existing systems. Create `src/examples/SimpleGame.js`:

```javascript
import { SimplePlayer } from '../objects/SimplePlayer.js';
import { SimpleEnemy } from '../objects/SimpleEnemy.js';

/**
 * SimpleGame - Demonstrates using Garax infrastructure
 */
export class SimpleGame {
  constructor(dependencies = {}) {
    // Use Garax's Dependency Injection pattern
    this.eventBus = dependencies.eventBus;
    this.inputManager = dependencies.inputManager;
    this.logger = dependencies.logger || console;

    // Validate dependencies
    if (!this.eventBus) throw new Error('SimpleGame requires eventBus');
    if (!this.inputManager) throw new Error('SimpleGame requires inputManager');

    // Game state
    this.canvas = null;
    this.ctx = null;
    this.player = null;
    this.enemies = [];
    this.score = 0;
    this.gameOver = false;

    // Enemy spawning
    this.spawnTimer = 0;
    this.spawnInterval = 2.0; // Spawn enemy every 2 seconds

    this.logger.info('SimpleGame initialized');
  }

  /**
   * Initialize game (called once)
   */
  async initialize() {
    // Get canvas
    this.canvas = document.getElementById('game-canvas');
    if (!this.canvas) {
      throw new Error('Canvas element #game-canvas not found');
    }

    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 800;
    this.canvas.height = 600;

    // Create player at bottom center
    this.player = new SimplePlayer(380, 500);

    // Subscribe to events using Garax EventBus
    this.eventBus.on('game:pause', () => {
      this.logger.info('Game paused');
    });

    this.eventBus.on('game:resume', () => {
      this.logger.info('Game resumed');
    });

    this.logger.info('SimpleGame ready to play');
  }

  /**
   * Update game state (called every frame)
   * @param {number} deltaTime - Time since last frame (seconds)
   */
  update(deltaTime) {
    if (this.gameOver) return;

    // Update player
    const inputState = this.inputManager.getInputState();
    this.player.update(deltaTime, inputState);

    // Check if player died
    if (!this.player.active) {
      this.gameOver = true;
      this.eventBus.emit('game:over', { score: this.score });
      return;
    }

    // Update enemies
    this.enemies = this.enemies.filter(enemy => enemy.active);
    this.enemies.forEach(enemy => enemy.update(deltaTime));

    // Spawn enemies
    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnEnemy();
      this.spawnTimer = 0;
    }

    // Check collisions
    this.checkCollisions();
  }

  /**
   * Spawn a new enemy at random X position
   */
  spawnEnemy() {
    const x = Math.random() * (800 - 30);
    const enemy = new SimpleEnemy(x, -30);
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

      // Simple AABB collision detection
      if (this.checkAABB(playerBounds, enemyBounds)) {
        this.player.onCollision(enemy);
        enemy.destroy();

        // Emit event for UI updates
        this.eventBus.emit('player:hit', { health: this.player.health });
      }
    });
  }

  /**
   * AABB collision detection
   */
  checkAABB(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }

  /**
   * Draw everything (called every frame)
   */
  draw() {
    // Clear screen
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw player
    this.player.draw(this.ctx);

    // Draw enemies
    this.enemies.forEach(enemy => enemy.draw(this.ctx));

    // Draw UI
    this.drawUI();
  }

  /**
   * Draw score and game over message
   */
  drawUI() {
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`Health: ${this.player.health}`, 10, 30);
    this.ctx.fillText(`Enemies Avoided: ${this.score}`, 10, 60);

    if (this.gameOver) {
      this.ctx.font = '48px Arial';
      this.ctx.fillStyle = '#f44336';
      this.ctx.fillText('GAME OVER', 250, 300);
      this.ctx.font = '20px Arial';
      this.ctx.fillStyle = '#fff';
      this.ctx.fillText('Press R to restart', 290, 350);
    }
  }

  /**
   * Cleanup (called when game ends)
   */
  cleanup() {
    this.eventBus.off('game:pause');
    this.eventBus.off('game:resume');
    this.logger.info('SimpleGame cleaned up');
  }
}
```

**What you learned:**
- How to use Garax's Dependency Injection pattern
- How to integrate with EventBus for communication
- How to use InputManager for player control
- How to implement game loop (update/draw pattern)
- How to handle collision detection

---

## Step 4: Integrate with Garax Main Game (5 minutes)

Modify `src/GameRefactored.js` to use your simple game. Find the `initialize()` method and add:

```javascript
// After existing initialization, add:
import { SimpleGame } from './examples/SimpleGame.js';

// In the initialize() method, create and start your game:
async initialize() {
  // ... existing initialization code ...

  // Add your simple game
  this.simpleGame = new SimpleGame({
    eventBus: this.eventBus,
    inputManager: this.inputManager,
    logger: this.logger
  });

  await this.simpleGame.initialize();

  // ... rest of initialization ...
}
```

And in the game loop update method:

```javascript
update(deltaTime) {
  // ... existing update code ...

  if (this.simpleGame) {
    this.simpleGame.update(deltaTime);
    this.simpleGame.draw();
  }

  // ... rest of update code ...
}
```

---

## Step 5: Test Your Game! (5 minutes)

1. Save all files
2. The dev server should auto-reload
3. Open http://localhost:5173
4. Use **arrow keys or WASD** to move
5. Avoid the falling red enemies!

**Congratulations!** You just built your first game with Garax! 🎉

---

## What You Accomplished

✅ Created game entities (Player, Enemy)
✅ Used Garax's InputManager for controls
✅ Used Garax's EventBus for communication
✅ Implemented collision detection
✅ Created a complete game loop
✅ Followed Garax's architecture patterns (DI, update/draw)

---

## Next Steps

### Enhance Your Game

1. **Add Shooting**
   - Create a `Projectile` class
   - Press spacebar to shoot
   - Destroy enemies on hit
   - Add score when enemy destroyed

2. **Add Sound**
   - Use Garax's AudioSystem
   - Play sound on collision
   - Add background music

3. **Add Powerups**
   - Create `Powerup` class
   - Spawn randomly
   - Increase speed/health/shield

4. **Add Visual Effects**
   - Explosion particles
   - Screen shake on hit
   - Enemy death animation

5. **Use Object Pooling**
   - Leverage Garax's built-in ObjectPool
   - Reduce garbage collection
   - Improve performance

### Explore Garax Systems

- **PerformanceMonitor** - Track FPS and memory
- **AccessibilitySystem** - Add screen reader support
- **AchievementManager** - Add achievements
- **SaveSystem** - Persist high scores
- **PhysicsSystem** - Add realistic physics

### Study the Tests

Look at `tests/` to see how each system should work:
- `InputManager.test.js` - Input handling examples
- `GameLoop.test.js` - Game loop patterns
- `CollisionSystem.test.js` - Collision detection
- `EntitySpawner.test.js` - Object pooling

---

## Common Issues

**"Canvas not found"**
- Make sure `index.html` has `<canvas id="game-canvas"></canvas>`

**"Player not moving"**
- Check browser console for errors
- Verify InputManager is initialized
- Check that update() is being called

**"Collisions not working"**
- Verify getBounds() returns correct values
- Check AABB logic
- Add debug drawing to visualize bounds

**"Game is laggy"**
- Use PerformanceMonitor to track FPS
- Reduce enemy spawn rate
- Use object pooling for enemies
- Profile with browser dev tools

---

## Get Help

- Check `docs/CODEBASE_AUDIT.md` for architecture details
- Review existing test files for patterns
- Open an issue on GitHub
- Read CONTRIBUTING.md for development tips

**Happy game building!** 🚀
