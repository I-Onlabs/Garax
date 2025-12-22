# 🎮 Garax Examples

This directory contains complete, working examples showing how to build games using Garax's infrastructure.

## Available Examples

### 1. Simple Space Shooter (`SimpleGame.js`)

A complete working game demonstrating:
- Player movement with keyboard input
- Enemy spawning and AI
- Collision detection
- Scoring system
- Game over and restart
- EventBus communication
- Dependency Injection
- Accessibility integration

**Tutorial:** See `docs/TUTORIAL_YOUR_FIRST_GAME.md` for a step-by-step guide

**Run it:**
```bash
npm run dev
# Then navigate to http://localhost:5173
```

**Controls:**
- Arrow Keys or WASD: Move spaceship
- R: Restart (when game over)
- Escape: Pause/Resume

**Files:**
- `SimpleGame.js` - Main game logic
- `../objects/SimplePlayer.js` - Player entity
- `../objects/SimpleEnemy.js` - Enemy entity

## How to Use These Examples

### Learning Path

1. **Read the tutorial** - `docs/TUTORIAL_YOUR_FIRST_GAME.md`
2. **Study the code** - Read SimpleGame.js with comments
3. **Run the example** - See it in action
4. **Modify it** - Change speeds, colors, behavior
5. **Build your own** - Use these as a template

### Integration with Garax

These examples integrate with Garax's systems:

**EventBus** - Communication between systems
```javascript
this.eventBus.emit('player:hit', { health: this.player.health });
this.eventBus.on('game:pause', () => { this.paused = true; });
```

**InputManager** - Player controls
```javascript
const inputState = this.inputManager.getInputState();
if (inputState.keys.ArrowLeft) { ... }
```

**Logger** - Debug information
```javascript
this.logger.info('SimpleGame: Initialized');
```

**Accessibility** - Screen reader support
```javascript
this.eventBus.emit('accessibility:announce', {
  message: 'Game started!',
  priority: 'polite'
});
```

## Adding to GameRefactored

To run an example in the main game:

```javascript
// In src/GameRefactored.js
import { SimpleGame } from './examples/SimpleGame.js';

async initialize() {
  // ... existing code ...

  this.simpleGame = new SimpleGame({
    eventBus: this.eventBus,
    inputManager: this.inputManager,
    logger: this.logger
  });

  await this.simpleGame.initialize();
}

update(deltaTime) {
  // ... existing code ...

  if (this.simpleGame) {
    this.simpleGame.update(deltaTime);
    this.simpleGame.draw();
  }
}
```

## Next Steps

### Enhance the Simple Game

**Easy additions:**
- Add shooting (spacebar to shoot)
- Add powerups (health, shield, speed)
- Add particle effects on collision
- Add sound effects

**Medium additions:**
- Add boss enemies
- Add multiple enemy types
- Add upgrade system
- Add local high scores

**Advanced additions:**
- Use ObjectPool for performance
- Add procedural generation
- Add save/load system
- Add multiplayer

### Create Your Own Example

Use SimpleGame as a template:

1. Copy the structure
2. Modify entities (Player, Enemy)
3. Change game rules
4. Add your own systems
5. Test and iterate
6. Share with the community!

## Example Ideas

- **Platformer** - Jump and run
- **Puzzle Game** - Match-3 or Tetris
- **Tower Defense** - Place towers, stop waves
- **RPG Battle** - Turn-based combat
- **Endless Runner** - Obstacle avoidance

## Getting Help

- Read the tutorial: `docs/TUTORIAL_YOUR_FIRST_GAME.md`
- Check the tests: `tests/` directory
- Review architecture: `docs/CODEBASE_AUDIT.md`
- Open an issue: GitHub Issues
- Contribute: `CONTRIBUTING.md`

**Have fun building!** 🚀
