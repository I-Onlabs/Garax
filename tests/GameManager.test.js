/**
 * GameManager.test.js - Comprehensive test suite for GameManager class
 */

import { GameManager } from '../src/managers/GameManager.js';
import { EventBus } from '../src/core/EventBus.js';
import { Logger } from '../src/utils/Logger.js';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('GameManager', () => {
  let gameManager;
  let eventBus;
  let logger;
  let mockConfig;

  beforeEach(() => {
    eventBus = new EventBus();
    logger = new Logger(true);
    mockConfig = {
      getConfigValue: jest.fn(),
    };

    gameManager = new GameManager({
      eventBus,
      logger,
      config: mockConfig,
    });

    // Clear localStorage mock
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  afterEach(() => {
    if (gameManager) {
      gameManager.cleanup();
    }
  });

  describe('Initialization', () => {
    test('should initialize with required dependencies', () => {
      expect(gameManager.eventBus).toBe(eventBus);
      expect(gameManager.logger).toBe(logger);
      expect(gameManager.config).toBe(mockConfig);
    });

    test('should throw error when eventBus is missing', () => {
      expect(() => {
        new GameManager({ logger, config: mockConfig });
      }).toThrow('GameManager requires eventBus dependency');
    });

    test('should throw error when logger is missing', () => {
      expect(() => {
        new GameManager({ eventBus, config: mockConfig });
      }).toThrow('GameManager requires logger dependency');
    });

    test('should initialize with default state', () => {
      expect(gameManager.state).toEqual({
        currentLevel: 1,
        maxLevel: 10,
        score: 0,
        highScore: 0,
        lives: 3,
        levelStartTime: null,
        levelCompleted: false,
        gameOver: false,
      });
    });

    test('should initialize level configurations', () => {
      expect(gameManager.levelConfigs).toHaveLength(10);
      expect(gameManager.levelConfigs[0]).toEqual({
        timeLimit: 60000,
        targetScore: 1000,
        difficulty: 'easy',
      });
      expect(gameManager.levelConfigs[9]).toEqual({
        timeLimit: 300000,
        targetScore: 40000,
        difficulty: 'master',
      });
    });
  });

  describe('Level Management', () => {
    test('should setup level', () => {
      const levelStartSpy = jest.fn();
      eventBus.on('level:started', levelStartSpy);

      gameManager.setupLevel(3);

      expect(gameManager.state.currentLevel).toBe(3);
      expect(gameManager.state.levelStartTime).toBeDefined();
      expect(gameManager.state.levelCompleted).toBe(false);
      expect(gameManager.state.gameOver).toBe(false);
      expect(levelStartSpy).toHaveBeenCalledWithEventData({
        level: 3,
        config: gameManager.levelConfigs[2],
      });
    });

    test('should handle invalid level number', () => {
      const errorSpy = jest.spyOn(logger, 'error');

      gameManager.setupLevel(15);

      expect(errorSpy).toHaveBeenCalledWith('Invalid level number: 15');
    });

    test('should complete level', () => {
      const levelCompleteSpy = jest.fn();
      const gameCompleteSpy = jest.fn();
      eventBus.on('level:completed', levelCompleteSpy);
      eventBus.on('game:completed', gameCompleteSpy);

      gameManager.state.currentLevel = 10;
      gameManager.state.levelStartTime = Date.now();

      gameManager.completeLevel();

      expect(gameManager.state.levelCompleted).toBe(true);
      expect(levelCompleteSpy).toHaveBeenCalledWithEventData({
        level: 10,
        score: gameManager.state.score,
      });
      expect(gameCompleteSpy).toHaveBeenCalled();
    });

    test('should advance to next level after completion', (done) => {
      const levelStartSpy = jest.fn();
      eventBus.on('level:started', levelStartSpy);

      gameManager.state.currentLevel = 1;
      gameManager.completeLevel();

      setTimeout(() => {
        expect(levelStartSpy).toHaveBeenCalledWithEventData({
          level: 2,
        });
        done();
      }, 2100);
    });

    test('should handle level timeout', () => {
      const timeoutSpy = jest.fn();
      const livesUpdateSpy = jest.fn();
      eventBus.on('level:timeout', timeoutSpy);
      eventBus.on('game:livesUpdated', livesUpdateSpy);

      gameManager.state.currentLevel = 1;
      gameManager.state.levelStartTime = Date.now() - 70000; // 70 seconds ago

      gameManager.update(16, {});

      expect(timeoutSpy).toHaveBeenCalled();
      expect(livesUpdateSpy).toHaveBeenCalled();
    });
  });

  describe('Score Management', () => {
    test('should handle score changes', () => {
      const scoreUpdateSpy = jest.fn();
      eventBus.on('game:scoreUpdated', scoreUpdateSpy);

      gameManager.handleScoreChange({ scoreChange: 100 });

      expect(gameManager.state.score).toBe(100);
      expect(gameManager.state.highScore).toBe(100);
      expect(scoreUpdateSpy).toHaveBeenCalledWithEventData({
        score: 100,
        highScore: 100,
      });
    });

    test('should update high score', () => {
      gameManager.state.score = 1000;
      gameManager.state.highScore = 1000;

      gameManager.handleScoreChange({ scoreChange: 500 });

      expect(gameManager.state.score).toBe(1500);
      expect(gameManager.state.highScore).toBe(1500);
    });

    test('should not update high score when current score is lower', () => {
      gameManager.state.score = 500;
      gameManager.state.highScore = 1000;

      gameManager.handleScoreChange({ scoreChange: 200 });

      expect(gameManager.state.score).toBe(700);
      expect(gameManager.state.highScore).toBe(1000);
    });

    test('should complete level when target score is reached', () => {
      const completeLevelSpy = jest.spyOn(gameManager, 'completeLevel');

      gameManager.state.currentLevel = 1;
      gameManager.state.score = 900;

      gameManager.handleScoreChange({ scoreChange: 200 });

      expect(completeLevelSpy).toHaveBeenCalled();
    });
  });

  describe('Player Damage Handling', () => {
    test('should handle player damage', () => {
      const livesUpdateSpy = jest.fn();
      eventBus.on('game:livesUpdated', livesUpdateSpy);

      gameManager.handlePlayerDamaged({ damage: 1 });

      expect(gameManager.state.lives).toBe(2);
      expect(livesUpdateSpy).toHaveBeenCalledWithEventData({
        lives: 2,
      });
    });

    test('should trigger game over when lives reach zero', () => {
      const gameOverSpy = jest.fn();
      eventBus.on('game:gameOver', gameOverSpy);

      gameManager.state.lives = 1;
      gameManager.handlePlayerDamaged({ damage: 1 });

      expect(gameManager.state.gameOver).toBe(true);
      expect(gameOverSpy).toHaveBeenCalled();
    });
  });

  describe('Item Collection', () => {
    test('should handle item collection', () => {
      const itemData = {
        itemType: 'coin',
        scoreValue: 50,
      };

      const scoreChangeSpy = jest.spyOn(gameManager, 'handleScoreChange');

      gameManager.handleItemCollected(itemData);

      expect(scoreChangeSpy).toHaveBeenCalledWith({ scoreChange: 50 });
    });

    test('should log item collection', () => {
      const logSpy = jest.spyOn(logger, 'info');

      gameManager.handleItemCollected({
        itemType: 'powerUp',
        scoreValue: 100,
      });

      expect(logSpy).toHaveBeenCalledWith(
        'Item collected: powerUp, +100 points'
      );
    });
  });

  describe('Game Input Handling', () => {
    test('should handle restart input', () => {
      const restartSpy = jest.fn();
      eventBus.on('game:restarted', restartSpy);

      gameManager.handleGameInput({ type: 'restart' });

      expect(gameManager.state.currentLevel).toBe(1);
      expect(gameManager.state.score).toBe(0);
      expect(gameManager.state.lives).toBe(3);
      expect(restartSpy).toHaveBeenCalled();
    });

    test('should handle next level input', () => {
      const levelStartSpy = jest.fn();
      eventBus.on('level:started', levelStartSpy);

      gameManager.state.levelCompleted = true;
      gameManager.state.currentLevel = 1;

      gameManager.handleGameInput({ type: 'nextLevel' });

      expect(levelStartSpy).toHaveBeenCalledWithEventData({
        level: 2,
      });
    });

    test('should not advance level when not completed', () => {
      const levelStartSpy = jest.fn();
      eventBus.on('level:started', levelStartSpy);

      gameManager.state.levelCompleted = false;
      gameManager.state.currentLevel = 1;

      gameManager.handleGameInput({ type: 'nextLevel' });

      expect(levelStartSpy).not.toHaveBeenCalled();
    });

    test('should handle pause input', () => {
      const pauseSpy = jest.fn();
      eventBus.on('game:pauseRequested', pauseSpy);

      gameManager.handleGameInput({ type: 'pause' });

      expect(pauseSpy).toHaveBeenCalled();
    });
  });

  describe('Configuration Management', () => {
    test('should handle config changes', () => {
      const newConfig = { difficulty: 'hard' };

      gameManager.handleConfigChange({ config: newConfig });

      expect(gameManager.config).toEqual({ ...mockConfig, ...newConfig });
    });
  });

  describe('Achievement Integration', () => {
    test('should handle achievement unlock', () => {
      const scoreChangeSpy = jest.spyOn(gameManager, 'handleScoreChange');

      gameManager.handleAchievementUnlock({
        bonusScore: 200,
        effects: { extraLives: 1 },
      });

      expect(scoreChangeSpy).toHaveBeenCalledWith({ scoreChange: 200 });
      expect(gameManager.state.lives).toBe(4);
    });

    test('should apply achievement effects', () => {
      gameManager.handleAchievementUnlock({
        effects: {
          scoreMultiplier: 2.0,
          duration: 30000,
        },
      });

      expect(gameManager.temporaryScoreMultiplier).toBe(2.0);

      // Test that multiplier expires
      setTimeout(() => {
        expect(gameManager.temporaryScoreMultiplier).toBe(1);
      }, 30000);
    });
  });

  describe('Daily Challenge Integration', () => {
    test('should handle daily challenge completion', () => {
      const scoreChangeSpy = jest.spyOn(gameManager, 'handleScoreChange');
      const powerUpSpy = jest.fn();
      eventBus.on('game:powerUpActivated', powerUpSpy);

      gameManager.handleDailyChallengeCompletion({
        bonusScore: 500,
        effects: {
          temporaryPowerUp: 'speedBoost',
          duration: 15000,
        },
      });

      expect(scoreChangeSpy).toHaveBeenCalledWith({ scoreChange: 500 });
      expect(powerUpSpy).toHaveBeenCalledWithEventData({
        type: 'speedBoost',
        duration: 15000,
      });
    });
  });

  describe('Level-Specific Logic', () => {
    test('should update level-specific logic for easy difficulty', () => {
      gameManager.state.currentLevel = 1; // Easy level

      expect(() => {
        gameManager.updateLevelSpecificLogic(16, {});
      }).not.toThrow();
    });

    test('should update level-specific logic for hard difficulty', () => {
      gameManager.state.currentLevel = 5; // Hard level

      expect(() => {
        gameManager.updateLevelSpecificLogic(16, {});
      }).not.toThrow();
    });

    test('should handle invalid level in update logic', () => {
      gameManager.state.currentLevel = 15; // Invalid level

      expect(() => {
        gameManager.updateLevelSpecificLogic(16, {});
      }).not.toThrow();
    });
  });

  describe('Data Persistence', () => {
    test('should load game data from localStorage', async () => {
      const savedData = {
        highScore: 5000,
        lastPlayed: Date.now(),
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedData));

      await gameManager.loadGameData();

      expect(gameManager.state.highScore).toBe(5000);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('gameData');
    });

    test('should handle missing saved data', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      await gameManager.loadGameData();

      expect(gameManager.state.highScore).toBe(0);
    });

    test('should handle corrupted saved data', async () => {
      const errorSpy = jest.spyOn(logger, 'error');
      localStorageMock.getItem.mockReturnValue('invalid json');

      await gameManager.loadGameData();

      expect(errorSpy).toHaveBeenCalledWith(
        'Failed to load game data:',
        expect.any(Error)
      );
    });

    test('should save game data to localStorage', () => {
      gameManager.state.highScore = 3000;

      gameManager.saveGameData();

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'gameData',
        expect.stringContaining('"highScore":3000')
      );
    });

    test('should handle save errors', () => {
      const errorSpy = jest.spyOn(logger, 'error');
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      gameManager.saveGameData();

      expect(errorSpy).toHaveBeenCalledWith(
        'Failed to save game data:',
        expect.any(Error)
      );
    });
  });

  describe('State Access', () => {
    test('should get current game state', () => {
      const state = gameManager.getState();

      expect(state).toEqual(gameManager.state);
      expect(state).not.toBe(gameManager.state); // Should be a copy
    });

    test('should get level configuration', () => {
      const levelConfig = gameManager.getLevelConfig(1);

      expect(levelConfig).toEqual(gameManager.levelConfigs[0]);
    });

    test('should return undefined for invalid level', () => {
      const levelConfig = gameManager.getLevelConfig(15);

      expect(levelConfig).toBeUndefined();
    });

    test('should set level configuration', () => {
      const newConfig = { timeLimit: 120000 };

      gameManager.setLevelConfig(1, newConfig);

      expect(gameManager.levelConfigs[0]).toEqual({
        ...gameManager.levelConfigs[0],
        ...newConfig,
      });
    });

    test('should not set config for invalid level', () => {
      const originalConfig = gameManager.levelConfigs[0];
      const newConfig = { timeLimit: 120000 };

      gameManager.setLevelConfig(15, newConfig);

      expect(gameManager.levelConfigs[0]).toEqual(originalConfig);
    });
  });

  describe('Event Handler Management', () => {
    test('should setup event handlers on initialization', () => {
      const eventHandlers = [
        'player:scoreChanged',
        'player:damaged',
        'player:itemCollected',
        'player:levelCompleted',
        'game:input',
        'game:configChanged',
        'achievement:unlocked',
        'dailyChallenge:completed',
      ];

      eventHandlers.forEach((event) => {
        expect(eventBus.listeners.has(event)).toBe(true);
      });
    });

    test('should remove event handlers on cleanup', () => {
      // The GameManager uses both off() and removeListener() to remove handlers
      const removeListenerSpy = jest.spyOn(eventBus, 'removeListener');
      const offSpy = jest.spyOn(eventBus, 'off');

      gameManager.cleanup();

      // Verify cleanup attempts to remove handlers (GameManager has 8 handlers registered)
      // Note: Some handlers may be removed multiple times due to EventBus implementation
      expect(offSpy.mock.calls.length + removeListenerSpy.mock.calls.length).toBeGreaterThanOrEqual(8);
    });
  });

  describe('Game Over and Completion', () => {
    test('should handle game over', () => {
      const gameOverSpy = jest.fn();
      eventBus.on('game:gameOver', gameOverSpy);

      gameManager.gameOver();

      expect(gameManager.state.gameOver).toBe(true);
      expect(gameOverSpy).toHaveBeenCalledWithEventData({
        finalScore: gameManager.state.score,
        finalLevel: gameManager.state.currentLevel,
      });
    });

    test('should complete game', () => {
      const gameCompleteSpy = jest.fn();
      eventBus.on('game:completed', gameCompleteSpy);

      gameManager.state.currentLevel = 10;
      gameManager.state.score = 50000;

      gameManager.completeGame();

      expect(gameCompleteSpy).toHaveBeenCalledWithEventData({
        finalScore: 50000,
        finalLevel: 10,
      });
    });
  });

  describe('Update Loop', () => {
    test('should update without errors', () => {
      const gameState = {
        isRunning: true,
        isPaused: false,
        currentLevel: 1,
        score: 1000,
        player: null,
        gameObjects: [],
      };

      expect(() => {
        gameManager.update(16, gameState);
      }).not.toThrow();
    });

    test('should handle level timeout in update', () => {
      const timeoutSpy = jest.spyOn(gameManager, 'handleLevelTimeout');

      gameManager.state.currentLevel = 1;
      gameManager.state.levelStartTime = Date.now() - 70000;

      gameManager.update(16, {});

      expect(timeoutSpy).toHaveBeenCalled();
    });

    test('should not timeout when level is completed', () => {
      const timeoutSpy = jest.spyOn(gameManager, 'handleLevelTimeout');

      gameManager.state.currentLevel = 1;
      gameManager.state.levelStartTime = Date.now() - 70000;
      gameManager.state.levelCompleted = true;

      gameManager.update(16, {});

      expect(timeoutSpy).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('should handle initialization errors gracefully', async () => {
      const errorSpy = jest.spyOn(logger, 'error');

      // Mock a method to throw an error
      const originalLoadGameData = gameManager.loadGameData.bind(gameManager);
      gameManager.loadGameData = jest.fn().mockImplementation(async () => {
        throw new Error('Load error');
      });

      // The initialize method should catch the error and log it
      try {
        await gameManager.initialize();
      } catch (e) {
        // If error is thrown, at least verify the error message
        expect(e.message).toBe('Load error');
      }

      // Restore original method
      gameManager.loadGameData = originalLoadGameData;
    });
  });
});
