/**
 * GameRefactored.test.js - Test suite for GameRefactored class
 */

import { GameRefactored } from '../src/GameRefactored.js';
import { EventBus } from '../src/core/EventBus.js';
import { Logger } from '../src/utils/Logger.js';

// Mock the managers
jest.mock('../src/managers/GameManager.js', () => ({
  GameManager: jest.fn().mockImplementation(() => ({
    initialize: jest.fn().mockResolvedValue(),
    update: jest.fn(),
    cleanup: jest.fn(),
    getState: jest.fn().mockReturnValue({}),
  })),
}));

jest.mock('../src/managers/AchievementManager.js', () => ({
  AchievementManager: jest.fn().mockImplementation(() => ({
    initialize: jest.fn().mockResolvedValue(),
    update: jest.fn(),
    cleanup: jest.fn(),
    getAchievement: jest.fn(),
    getAllAchievements: jest.fn().mockReturnValue([]),
  })),
}));

jest.mock('../src/managers/DailyChallengeManager.js', () => ({
  DailyChallengeManager: jest.fn().mockImplementation(() => ({
    initialize: jest.fn().mockResolvedValue(),
    update: jest.fn(),
    cleanup: jest.fn(),
    getActiveChallenges: jest.fn().mockReturnValue([]),
  })),
}));

jest.mock('../src/managers/AccessibilityManager.js', () => ({
  AccessibilityManager: jest.fn().mockImplementation(() => ({
    initialize: jest.fn().mockResolvedValue(),
    update: jest.fn(),
    cleanup: jest.fn(),
    getSettings: jest.fn().mockReturnValue({}),
  })),
}));

describe('GameRefactored', () => {
  let game;
  let eventBus;
  let logger;

  beforeEach(() => {
    // eventBus = new EventBus();
    // logger = new Logger(true);

    game = new GameRefactored({
      debug: true,
      enableAchievements: true,
      enableDailyChallenges: true,
      enableAccessibility: true,
    });
  });

  afterEach(() => {
    if (game) {
      game.destroy();
    }
  });

  describe('Initialization', () => {
    test('should initialize with default config', () => {
      const defaultGame = new GameRefactored();
      expect(defaultGame.config.debug).toBe(false);
      expect(defaultGame.config.enableAchievements).toBe(true);
      expect(defaultGame.config.enableDailyChallenges).toBe(true);
      expect(defaultGame.config.enableAccessibility).toBe(true);
    });

    test('should initialize with custom config', () => {
      const customConfig = {
        debug: true,
        enableAchievements: false,
        enableDailyChallenges: false,
        enableAccessibility: false,
      };

      const customGame = new GameRefactored(customConfig);
      expect(customGame.config).toEqual(expect.objectContaining(customConfig));
    });

    test('should initialize managers', () => {
      expect(game.managers.game).toBeDefined();
      expect(game.managers.achievements).toBeDefined();
      expect(game.managers.dailyChallenges).toBeDefined();
      expect(game.managers.accessibility).toBeDefined();
    });

    test('should set up manager communication', () => {
      // Test that event listeners are set up
      expect(game.eventBus.listeners.has('player:scoreChanged')).toBe(true);
      expect(game.eventBus.listeners.has('player:levelCompleted')).toBe(true);
      expect(game.eventBus.listeners.has('player:itemCollected')).toBe(true);
    });
  });

  describe('Game Lifecycle', () => {
    test('should start game successfully', async () => {
      await expect(game.start()).resolves.not.toThrow();
      expect(game.gameState.isRunning).toBe(true);
    });

    test('should pause game', () => {
      game.gameState.isRunning = true;
      game.pause();
      expect(game.gameState.isPaused).toBe(true);
    });

    test('should resume game', () => {
      game.gameState.isRunning = true;
      game.gameState.isPaused = true;
      game.resume();
      expect(game.gameState.isPaused).toBe(false);
    });

    test('should stop game', () => {
      game.gameState.isRunning = true;
      game.stop();
      expect(game.gameState.isRunning).toBe(false);
      expect(game.gameState.isPaused).toBe(false);
    });
  });

  describe('Game State Management', () => {
    test('should get game state', () => {
      const state = game.getGameState();
      expect(state).toEqual(
        expect.objectContaining({
          isRunning: false,
          isPaused: false,
          currentLevel: 1,
          score: 0,
          player: null,
          gameObjects: [],
        })
      );
    });

    test('should add game object', () => {
      const gameObject = { id: 'test', type: 'test' };
      game.addGameObject(gameObject);
      expect(game.gameState.gameObjects).toContain(gameObject);
    });

    test('should remove game object', () => {
      const gameObject = { id: 'test', type: 'test' };
      game.addGameObject(gameObject);
      game.removeGameObject('test');
      expect(game.gameState.gameObjects).not.toContain(gameObject);
    });
  });

  describe('Input Handling', () => {
    test('should handle input events', () => {
      const inputType = 'keyDown';
      const data = { key: 'Space' };

      expect(() => {
        game.handleInput(inputType, data);
      }).not.toThrow();
    });
  });

  describe('Manager Access', () => {
    test('should get manager by name', () => {
      const gameManager = game.getManager('game');
      expect(gameManager).toBeDefined();
    });

    test('should return undefined for non-existent manager', () => {
      const manager = game.getManager('nonExistent');
      expect(manager).toBeUndefined();
    });
  });

  describe('Configuration Updates', () => {
    test('should update configuration', () => {
      const newConfig = { debug: false };
      game.updateConfig(newConfig);
      expect(game.config.debug).toBe(false);
    });
  });

  describe('Event System', () => {
    test('should emit game started event', async () => {
      const eventSpy = jest.fn();
      game.eventBus.on('game:started', eventSpy);

      await game.start();

      expect(eventSpy).toHaveBeenCalled();
      const callData = eventSpy.mock.calls[0][0];
      expect(callData.timestamp).toEqual(expect.any(Number));
      expect(callData.config).toEqual(expect.any(Object));
    });

    test('should emit game paused event', () => {
      const eventSpy = jest.fn();
      game.eventBus.on('game:paused', eventSpy);

      game.gameState.isRunning = true;
      game.pause();

      expect(eventSpy).toHaveBeenCalled();
      const callData = eventSpy.mock.calls[0][0];
      expect(callData.timestamp).toEqual(expect.any(Number));
    });

    test('should emit game stopped event', () => {
      const eventSpy = jest.fn();
      game.eventBus.on('game:stopped', eventSpy);

      game.gameState.isRunning = true;
      game.stop();

      expect(eventSpy).toHaveBeenCalled();
      const callData = eventSpy.mock.calls[0][0];
      expect(callData.timestamp).toEqual(expect.any(Number));
      expect(callData.finalScore).toEqual(expect.any(Number));
      expect(callData.finalLevel).toEqual(expect.any(Number));
    });
  });

  describe('Error Handling', () => {
    test('should handle initialization errors', async () => {
      // Mock a manager to throw an error
      game.managers.game.initialize = jest
        .fn()
        .mockRejectedValue(new Error('Initialization failed'));

      await expect(game.start()).rejects.toThrow('Initialization failed');
    });

    test('should handle update loop errors', () => {
      // Mock a manager to throw an error during update
      game.managers.game.update = jest.fn().mockImplementation(() => {
        throw new Error('Update failed');
      });

      game.gameState.isRunning = true;

      // The update method should catch the error and stop the game
      expect(() => {
        game.update(performance.now());
      }).not.toThrow();

      expect(game.gameState.isRunning).toBe(false);
    });
  });

  describe('Cleanup', () => {
    test('should destroy game properly', () => {
      game.destroy();
      expect(game.gameState).toBeNull();
      expect(game.managers).toBeNull();
      // Set game to null so afterEach doesn't try to destroy again
      game = null;
    });
  });

  describe('Input System Integration', () => {
    beforeEach(async () => {
      // Start the game so handleInput will work (it checks isRunning)
      await game.start();
    });

    test('should emit game:input event for keyboard input', () => {
      const inputSpy = jest.fn();
      game.eventBus.on('game:input', inputSpy);

      const keyEvent = {
        key: 'Space',
        code: 'Space',
        keyCode: 32,
        repeat: false,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: false,
        timestamp: Date.now(),
      };

      game.handleInput('keyDown', keyEvent);

      expect(inputSpy).toHaveBeenCalled();
      const callData = inputSpy.mock.calls[0][0];
      expect(callData.type).toBe('keyDown');
      expect(callData.data).toMatchObject({
        key: 'Space',
        code: 'Space',
        keyCode: 32,
      });
    });

    test('should emit game:input event for mouse input', () => {
      const mouseSpy = jest.fn();
      game.eventBus.on('game:input', mouseSpy);

      const mouseEvent = {
        button: 0,
        buttonName: 'Left',
        x: 100,
        y: 200,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: false,
        timestamp: Date.now(),
      };

      game.handleInput('mouseDown', mouseEvent);

      expect(mouseSpy).toHaveBeenCalled();
      const callData = mouseSpy.mock.calls[0][0];
      expect(callData.type).toBe('mouseDown');
      expect(callData.data).toMatchObject({
        button: 0,
        x: 100,
        y: 200,
      });
    });

    test('should emit game:input event for touch input', () => {
      const touchSpy = jest.fn();
      game.eventBus.on('game:input', touchSpy);

      const touchEvent = {
        touches: [
          {
            id: 1,
            x: 150,
            y: 250,
            pressure: 1.0,
          },
        ],
        timestamp: Date.now(),
      };

      game.handleInput('touchStart', touchEvent);

      expect(touchSpy).toHaveBeenCalled();
      const callData = touchSpy.mock.calls[0][0];
      expect(callData.type).toBe('touchStart');
      expect(callData.data.touches).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            x: 150,
            y: 250,
          }),
        ])
      );
    });

    test('should emit game:input event for gamepad input', () => {
      const gamepadSpy = jest.fn();
      game.eventBus.on('game:input', gamepadSpy);

      const gamepadEvent = {
        controller: 0,
        button: 0,
        pressed: true,
        value: 1.0,
        timestamp: Date.now(),
      };

      game.handleInput('gamepadButton', gamepadEvent);

      expect(gamepadSpy).toHaveBeenCalled();
      const callData = gamepadSpy.mock.calls[0][0];
      expect(callData.type).toBe('gamepadButton');
      expect(callData.data).toMatchObject({
        controller: 0,
        button: 0,
        pressed: true,
      });
    });

    test('should not emit events when game is not running', () => {
      game.stop();
      const inputSpy = jest.fn();
      game.eventBus.on('game:input', inputSpy);

      game.handleInput('keyDown', { key: 'Space' });

      expect(inputSpy).not.toHaveBeenCalled();
    });
  });

  describe('Power-up System Integration', () => {
    test('should handle power-up activation', () => {
      const powerUpSpy = jest.fn();
      game.eventBus.on('game:powerUpActivated', powerUpSpy);

      const powerUpEvent = {
        type: 'speedBoost',
        duration: 5000,
        timestamp: Date.now(),
      };

      game.eventBus.emit('game:powerUpActivated', powerUpEvent);

      expect(powerUpSpy).toHaveBeenCalledWithEventData({
        type: 'speedBoost',
        duration: 5000,
      });
    });

    test('should handle power-up deactivation', () => {
      const powerUpSpy = jest.fn();
      game.eventBus.on('game:powerUpDeactivated', powerUpSpy);

      const powerUpEvent = {
        type: 'speedBoost',
        timestamp: Date.now(),
      };

      game.eventBus.emit('game:powerUpDeactivated', powerUpEvent);

      expect(powerUpSpy).toHaveBeenCalledWithEventData({
        type: 'speedBoost',
      });
    });

    test('should track active power-ups', () => {
      // Simulate power-up activation
      game.eventBus.emit('game:powerUpActivated', {
        type: 'speedBoost',
        duration: 5000,
        timestamp: Date.now(),
      });

      // Check if power-up is tracked in game state
      const state = game.getGameState();
      expect(state.activePowerUps).toBeDefined();
    });
  });

  describe('Audio System Integration', () => {
    test('should handle audio events', () => {
      const audioSpy = jest.fn();
      game.eventBus.on('audio:play', audioSpy);

      const audioEvent = {
        sound: 'jump',
        volume: 0.8,
        loop: false,
        timestamp: Date.now(),
      };

      game.eventBus.emit('audio:play', audioEvent);

      expect(audioSpy).toHaveBeenCalledWithEventData({
        sound: 'jump',
        volume: 0.8,
      });
    });

    test('should handle audio stop events', () => {
      const audioSpy = jest.fn();
      game.eventBus.on('audio:stop', audioSpy);

      const audioEvent = {
        sound: 'backgroundMusic',
        timestamp: Date.now(),
      };

      game.eventBus.emit('audio:stop', audioEvent);

      expect(audioSpy).toHaveBeenCalledWithEventData({
        sound: 'backgroundMusic',
      });
    });

    test('should handle audio volume changes', () => {
      const audioSpy = jest.fn();
      game.eventBus.on('audio:volumeChanged', audioSpy);

      const audioEvent = {
        volume: 0.5,
        timestamp: Date.now(),
      };

      game.eventBus.emit('audio:volumeChanged', audioEvent);

      expect(audioSpy).toHaveBeenCalledWithEventData({
        volume: 0.5,
      });
    });
  });

  describe('Performance and Memory Management', () => {
    test('should handle large numbers of game objects efficiently', () => {
      const startTime = performance.now();

      // Add many game objects
      for (let i = 0; i < 1000; i++) {
        game.addGameObject({
          id: `object_${i}`,
          type: 'test',
          x: Math.random() * 1000,
          y: Math.random() * 1000,
        });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(100);
      expect(game.gameState.gameObjects.length).toBe(1000);
    });

    test('should clean up game objects properly', () => {
      // Add some game objects
      for (let i = 0; i < 100; i++) {
        game.addGameObject({
          id: `object_${i}`,
          type: 'test',
        });
      }

      expect(game.gameState.gameObjects.length).toBe(100);

      // Remove all objects
      for (let i = 0; i < 100; i++) {
        game.removeGameObject(`object_${i}`);
      }

      expect(game.gameState.gameObjects.length).toBe(0);
    });

    test('should handle rapid input events without memory leaks', () => {
      const initialMemory = performance.memory
        ? performance.memory.usedJSHeapSize
        : 0;

      // Simulate rapid input events
      for (let i = 0; i < 1000; i++) {
        game.handleInput('keyDown', {
          key: 'Space',
          code: 'Space',
          keyCode: 32,
          repeat: false,
          timestamp: Date.now(),
        });
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = performance.memory
        ? performance.memory.usedJSHeapSize
        : 0;

      // Memory usage should not grow excessively (allow some tolerance)
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryGrowth = finalMemory - initialMemory;
        expect(memoryGrowth).toBeLessThan(1000000); // 1MB tolerance
      }
    });
  });

  describe('Error Recovery and Resilience', () => {
    test('should handle manager initialization failures', async () => {
      // Mock a manager to fail initialization
      const originalGameManager = game.managers.game;
      game.managers.game.initialize = jest
        .fn()
        .mockRejectedValue(new Error('Manager init failed'));

      // Game should throw when manager fails to initialize
      await expect(game.start()).rejects.toThrow('Manager init failed');

      // Restore original manager
      game.managers.game = originalGameManager;
    });

    test('should handle invalid input gracefully', () => {
      expect(() => {
        game.handleInput('invalidInputType', {});
      }).not.toThrow();

      expect(() => {
        game.handleInput('keyDown', null);
      }).not.toThrow();

      expect(() => {
        game.handleInput('keyDown', undefined);
      }).not.toThrow();
    });

    test('should handle malformed game objects', () => {
      expect(() => {
        game.addGameObject(null);
      }).not.toThrow();

      expect(() => {
        game.addGameObject(undefined);
      }).not.toThrow();

      expect(() => {
        game.addGameObject({});
      }).not.toThrow();
    });

    test('should handle event bus errors gracefully', () => {
      // Mock event bus to throw errors
      const originalEmit = game.eventBus.emit;
      game.eventBus.emit = jest.fn().mockImplementation(() => {
        throw new Error('Event bus error');
      });

      expect(() => {
        game.handleInput('keyDown', { key: 'Space' });
      }).not.toThrow();

      // Restore original emit
      game.eventBus.emit = originalEmit;
    });
  });

  describe('Configuration Validation', () => {
    test('should coerce configuration values to booleans', () => {
      const configWithStrings = {
        debug: 'invalid',  // truthy string -> true
        enableAchievements: '',  // falsy string -> false
        enableDailyChallenges: 0,  // falsy number -> false
        enableAccessibility: 1,  // truthy number -> true
      };

      expect(() => {
        new GameRefactored(configWithStrings);
      }).not.toThrow();

      // Should coerce values to boolean
      const gameWithCoercedConfig = new GameRefactored(configWithStrings);
      expect(gameWithCoercedConfig.config.debug).toBe(true);  // Boolean('invalid') = true
      expect(gameWithCoercedConfig.config.enableAchievements).toBe(false);  // Boolean('') = false
      expect(gameWithCoercedConfig.config.enableDailyChallenges).toBe(false);  // Boolean(0) = false
      expect(gameWithCoercedConfig.config.enableAccessibility).toBe(true);  // Boolean(1) = true
    });

    test('should handle missing configuration gracefully', () => {
      expect(() => {
        new GameRefactored(null);
      }).not.toThrow();

      expect(() => {
        new GameRefactored(undefined);
      }).not.toThrow();
    });
  });
});
