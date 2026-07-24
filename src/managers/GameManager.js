/**
 * GameManager.js - Core game management with explicit lifecycle and dependency injection
 *
 * This manager handles:
 * - Game state management
 * - Level progression
 * - Score management
 * - Player management
 * - Game object lifecycle
 */

export class GameManager {
  constructor(dependencies = {}) {
    // Dependency injection
    this.eventBus = dependencies.eventBus;
    this.logger = dependencies.logger;
    this.config = dependencies.config;

    // Validate required dependencies
    if (!this.eventBus) {
      throw new Error('GameManager requires eventBus dependency');
    }
    if (!this.logger) {
      throw new Error('GameManager requires logger dependency');
    }

    // Game state
    this.state = {
      currentLevel: 1,
      maxLevel: 10,
      score: 0,
      highScore: 0,
      lives: 3,
      levelStartTime: null,
      levelCompleted: false,
      gameOver: false,
    };

    // Level configuration
    this.levelConfigs = this.initializeLevelConfigs();

    // Event handlers
    this.setupEventHandlers();

    this.logger.info('GameManager initialized');
  }

  /**
   * Initialize the manager
   */
  async initialize() {
    this.logger.info('Initializing GameManager...');

    // Load saved game data
    await this.loadGameData();

    // Set up level
    this.setupLevel(this.state.currentLevel);

    this.logger.info('GameManager initialized successfully');
  }

  /**
   * Cleanup the manager
   */
  cleanup() {
    this.logger.info('Cleaning up GameManager...');

    // Save game data
    this.saveGameData();

    // Remove event listeners
    this.removeEventHandlers();

    this.logger.info('GameManager cleaned up');
  }

  /**
   * Update the manager
   */
  update(deltaTime, gameState) {
    // Update level timer
    if (this.state.levelStartTime && !this.state.levelCompleted) {
      const levelTime = Date.now() - this.state.levelStartTime;

      // Check for level timeout
      const levelConfig = this.levelConfigs[this.state.currentLevel - 1];
      if (levelConfig.timeLimit && levelTime > levelConfig.timeLimit) {
        this.handleLevelTimeout();
      }
    }

    // Update game objects based on level
    this.updateLevelSpecificLogic(deltaTime, gameState);
  }

  /**
   * Set up event handlers
   */
  setupEventHandlers() {
    // Player events
    this.eventBus.on('player:scoreChanged', this.handleScoreChange.bind(this));
    this.eventBus.on('player:damaged', this.handlePlayerDamaged.bind(this));
    this.eventBus.on(
      'player:itemCollected',
      this.handleItemCollected.bind(this)
    );
    this.eventBus.on(
      'player:levelCompleted',
      this.handleLevelCompleted.bind(this)
    );

    // Game events
    this.eventBus.on('game:input', this.handleGameInput.bind(this));
    this.eventBus.on('game:configChanged', this.handleConfigChange.bind(this));

    // Achievement events
    this.eventBus.on(
      'achievement:unlocked',
      this.handleAchievementUnlock.bind(this)
    );
    this.eventBus.on(
      'dailyChallenge:completed',
      this.handleDailyChallengeCompletion.bind(this)
    );
  }

  /**
   * Remove event handlers
   */
  removeEventHandlers() {
    this.eventBus.off('player:scoreChanged', this.handleScoreChange.bind(this));
    this.eventBus.off('player:damaged', this.handlePlayerDamaged.bind(this));
    this.eventBus.off(
      'player:itemCollected',
      this.handleItemCollected.bind(this)
    );
    this.eventBus.off(
      'player:levelCompleted',
      this.handleLevelCompleted.bind(this)
    );
    this.eventBus.off('game:input', this.handleGameInput.bind(this));
    this.eventBus.removeListener(
      'game:configChanged',
      this.handleConfigChange.bind(this)
    );
    this.eventBus.removeListener(
      'achievement:unlocked',
      this.handleAchievementUnlock.bind(this)
    );
    this.eventBus.removeListener(
      'dailyChallenge:completed',
      this.handleDailyChallengeCompletion.bind(this)
    );
  }

  /**
   * Initialize level configurations
   */
  initializeLevelConfigs() {
    return [
      { timeLimit: 60000, targetScore: 1000, difficulty: 'easy' },
      { timeLimit: 90000, targetScore: 2500, difficulty: 'easy' },
      { timeLimit: 120000, targetScore: 5000, difficulty: 'medium' },
      { timeLimit: 150000, targetScore: 7500, difficulty: 'medium' },
      { timeLimit: 180000, targetScore: 10000, difficulty: 'hard' },
      { timeLimit: 200000, targetScore: 15000, difficulty: 'hard' },
      { timeLimit: 220000, targetScore: 20000, difficulty: 'expert' },
      { timeLimit: 240000, targetScore: 25000, difficulty: 'expert' },
      { timeLimit: 260000, targetScore: 30000, difficulty: 'master' },
      { timeLimit: 300000, targetScore: 40000, difficulty: 'master' },
    ];
  }

  /**
   * Set up a level
   */
  setupLevel(levelNumber) {
    this.state.currentLevel = levelNumber;
    this.state.levelStartTime = Date.now();
    this.state.levelCompleted = false;
    this.state.gameOver = false;

    const levelConfig = this.levelConfigs[levelNumber - 1];
    if (!levelConfig) {
      this.logger.error(`Invalid level number: ${levelNumber}`);
      return;
    }

    this.logger.info(
      `Setting up level ${levelNumber} (${levelConfig.difficulty})`
    );

    // Emit level start event
    this.eventBus.emit('level:started', {
      level: levelNumber,
      config: levelConfig,
      timestamp: Date.now(),
    });
  }

  /**
   * Handle score changes
   */
  handleScoreChange(data) {
    this.state.score += data.scoreChange || 0;

    // Update high score
    if (this.state.score > this.state.highScore) {
      this.state.highScore = this.state.score;
    }

    // Check level completion based on score
    const levelConfig = this.levelConfigs[this.state.currentLevel - 1];
    if (
      levelConfig &&
      this.state.score >= levelConfig.targetScore &&
      !this.state.levelCompleted
    ) {
      this.completeLevel();
    }

    this.eventBus.emit('game:scoreUpdated', {
      score: this.state.score,
      highScore: this.state.highScore,
      timestamp: Date.now(),
    });
  }

  /**
   * Handle player damage
   */
  handlePlayerDamaged(data) {
    this.state.lives -= data.damage || 1;

    if (this.state.lives <= 0) {
      this.gameOver();
    } else {
      this.eventBus.emit('game:livesUpdated', {
        lives: this.state.lives,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Handle item collection
   */
  handleItemCollected(data) {
    const scoreValue = data.scoreValue || 0;
    this.handleScoreChange({ scoreChange: scoreValue });

    this.logger.info(`Item collected: ${data.itemType}, +${scoreValue} points`);
  }

  /**
   * Handle level completion
   */
  handleLevelCompleted(data) {
    this.completeLevel();
  }

  /**
   * Complete the current level
   */
  completeLevel() {
    if (this.state.levelCompleted) {
      return;
    }

    this.state.levelCompleted = true;
    const levelTime = Date.now() - this.state.levelStartTime;

    this.logger.info(
      `Level ${this.state.currentLevel} completed in ${levelTime}ms`
    );

    // Emit level completion event
    this.eventBus.emit('level:completed', {
      level: this.state.currentLevel,
      score: this.state.score,
      time: levelTime,
      timestamp: Date.now(),
    });

    // Check if game is complete
    if (this.state.currentLevel >= this.state.maxLevel) {
      this.completeGame();
    } else {
      // Advance to next level after delay
      setTimeout(() => {
        this.setupLevel(this.state.currentLevel + 1);
      }, 2000);
    }
  }

  /**
   * Handle level timeout
   */
  handleLevelTimeout() {
    this.logger.info(`Level ${this.state.currentLevel} timed out`);

    this.eventBus.emit('level:timeout', {
      level: this.state.currentLevel,
      timestamp: Date.now(),
    });

    // Lose a life and restart level
    this.handlePlayerDamaged({ damage: 1 });
    if (!this.state.gameOver) {
      this.setupLevel(this.state.currentLevel);
    }
  }

  /**
   * Complete the entire game
   */
  completeGame() {
    this.logger.info('Game completed!');

    this.eventBus.emit('game:completed', {
      finalScore: this.state.score,
      finalLevel: this.state.currentLevel,
      timestamp: Date.now(),
    });
  }

  /**
   * Handle game over
   */
  gameOver() {
    this.state.gameOver = true;

    this.logger.info('Game Over');

    this.eventBus.emit('game:gameOver', {
      finalScore: this.state.score,
      finalLevel: this.state.currentLevel,
      timestamp: Date.now(),
    });
  }

  /**
   * Handle game input
   */
  handleGameInput(data) {
    // Handle specific game inputs
    switch (data.type) {
      case 'restart':
        this.restartGame();
        break;
      case 'nextLevel':
        if (this.state.levelCompleted) {
          this.setupLevel(this.state.currentLevel + 1);
        }
        break;
      case 'pause':
        this.eventBus.emit('game:pauseRequested', { timestamp: Date.now() });
        break;
    }
  }

  /**
   * Handle config changes
   */
  handleConfigChange(data) {
    this.config = { ...this.config, ...data.config };
    this.logger.info('GameManager config updated');
  }

  /**
   * Handle achievement unlock
   */
  handleAchievementUnlock(data) {
    // Award bonus points for achievements
    const bonusScore = data.bonusScore || 0;
    if (bonusScore > 0) {
      this.handleScoreChange({ scoreChange: bonusScore });
    }

    // Apply achievement effects
    if (data.effects) {
      this.applyAchievementEffects(data.effects);
    }
  }

  /**
   * Handle daily challenge completion
   */
  handleDailyChallengeCompletion(data) {
    // Award bonus points for daily challenges
    const bonusScore = data.bonusScore || 0;
    if (bonusScore > 0) {
      this.handleScoreChange({ scoreChange: bonusScore });
    }

    // Apply challenge effects
    if (data.effects) {
      this.applyChallengeEffects(data.effects);
    }
  }

  /**
   * Apply achievement effects
   */
  applyAchievementEffects(effects) {
    if (effects.extraLives) {
      this.state.lives += effects.extraLives;
    }
    if (effects.scoreMultiplier) {
      // Apply score multiplier for a limited time
      this.temporaryScoreMultiplier = effects.scoreMultiplier;
      setTimeout(() => {
        this.temporaryScoreMultiplier = 1;
      }, effects.duration || 30000);
    }
  }

  /**
   * Apply challenge effects
   */
  applyChallengeEffects(effects) {
    if (effects.temporaryPowerUp) {
      this.eventBus.emit('game:powerUpActivated', {
        type: effects.temporaryPowerUp,
        duration: effects.duration || 30000,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Restart the game
   */
  restartGame() {
    this.state = {
      currentLevel: 1,
      maxLevel: 10,
      score: 0,
      highScore: this.state.highScore, // Keep high score
      lives: 3,
      levelStartTime: null,
      levelCompleted: false,
      gameOver: false,
    };

    this.setupLevel(1);

    this.eventBus.emit('game:restarted', {
      timestamp: Date.now(),
    });
  }

  /**
   * Update level-specific logic
   */
  updateLevelSpecificLogic(deltaTime, gameState) {
    const levelConfig = this.levelConfigs[this.state.currentLevel - 1];
    if (!levelConfig) return;

    // Level-specific behaviors based on difficulty
    switch (levelConfig.difficulty) {
      case 'easy':
        // Slower enemy spawn rates, easier patterns
        break;
      case 'medium':
        // Moderate difficulty
        break;
      case 'hard':
        // Faster spawn rates, complex patterns
        break;
      case 'expert':
        // Very challenging
        break;
      case 'master':
        // Maximum difficulty
        break;
    }
  }

  /**
   * Load game data from storage
   */
  async loadGameData() {
    try {
      const savedData = localStorage.getItem('gameData');
      if (savedData) {
        const data = JSON.parse(savedData);
        this.state.highScore = data.highScore || 0;
        this.logger.info('Game data loaded from storage');
      }
    } catch (error) {
      this.logger.error('Failed to load game data:', error);
    }
  }

  /**
   * Save game data to storage
   */
  saveGameData() {
    try {
      const data = {
        highScore: this.state.highScore,
        lastPlayed: Date.now(),
      };
      localStorage.setItem('gameData', JSON.stringify(data));
      this.logger.info('Game data saved to storage');
    } catch (error) {
      this.logger.error('Failed to save game data:', error);
    }
  }

  /**
   * Get current game state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Get level configuration
   */
  getLevelConfig(levelNumber) {
    return this.levelConfigs[levelNumber - 1];
  }

  /**
   * Set level configuration
   */
  setLevelConfig(levelNumber, config) {
    if (levelNumber >= 1 && levelNumber <= this.levelConfigs.length) {
      this.levelConfigs[levelNumber - 1] = {
        ...this.levelConfigs[levelNumber - 1],
        ...config,
      };
    }
  }
}

export default GameManager;
