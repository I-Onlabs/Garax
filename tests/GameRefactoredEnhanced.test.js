/**
 * GameRefactoredEnhanced.test.js - Enhanced test suite for GameRefactored class with UI and Audio integration
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
    handleAchievementUnlock: jest.fn(),
    handleDailyChallengeCompletion: jest.fn(),
  })),
}));

jest.mock('../src/managers/AchievementManager.js', () => ({
  AchievementManager: jest.fn().mockImplementation(() => ({
    initialize: jest.fn().mockResolvedValue(),
    update: jest.fn(),
    cleanup: jest.fn(),
    getAchievement: jest.fn(),
    getAllAchievements: jest.fn().mockReturnValue([
      { id: 'first_achievement', name: 'First Steps', unlocked: true },
      { id: 'score_achievement', name: 'High Scorer', unlocked: false }
    ]),
    checkScoreAchievements: jest.fn(),
    checkLevelAchievements: jest.fn(),
    checkCollectionAchievements: jest.fn(),
  })),
}));

jest.mock('../src/managers/DailyChallengeManager.js', () => ({
  DailyChallengeManager: jest.fn().mockImplementation(() => ({
    initialize: jest.fn().mockResolvedValue(),
    update: jest.fn(),
    cleanup: jest.fn(),
    getActiveChallenges: jest.fn().mockReturnValue([
      { id: 'daily_1', name: 'Daily Challenge 1', completed: false }
    ]),
    checkLevelChallenge: jest.fn(),
    checkCollectionChallenge: jest.fn(),
  })),
}));

jest.mock('../src/managers/AccessibilityManager.js', () => ({
  AccessibilityManager: jest.fn().mockImplementation(() => ({
    initialize: jest.fn().mockResolvedValue(),
    update: jest.fn(),
    cleanup: jest.fn(),
    getSettings: jest.fn().mockReturnValue({}),
    announceStateChange: jest.fn(),
  })),
}));

// Mock UI and Audio systems
jest.mock('../src/ui/SettingsUI.js', () => ({
  SettingsUI: jest.fn().mockImplementation(() => ({
    toggle: jest.fn(),
    show: jest.fn(),
    hide: jest.fn(),
    cleanup: jest.fn(),
    getSettings: jest.fn().mockReturnValue({}),
    updateSetting: jest.fn(),
  })),
}));

jest.mock('../src/systems/AudioSystem.js', () => ({
  AudioSystem: jest.fn().mockImplementation(() => ({
    initialize: jest.fn().mockResolvedValue(),
    cleanup: jest.fn(),
    playMusic: jest.fn(),
    playSound: jest.fn(),
    muteAll: jest.fn(),
    unmuteAll: jest.fn(),
    setMasterVolume: jest.fn(),
    getAudioSettings: jest.fn().mockReturnValue({}),
  })),
}));

// Mock DOM
const mockContainer = {
  appendChild: jest.fn(),
  removeChild: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  querySelector: jest.fn(),
  querySelectorAll: jest.fn(() => []),
  style: {}
};

Object.defineProperty(document, 'body', {
  value: mockContainer,
  writable: true
});

Object.defineProperty(document, 'createElement', {
  value: jest.fn((tagName) => {
    const element = {
      tagName: tagName.toUpperCase(),
      className: '',
      style: {},
      textContent: '',
      innerHTML: '',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      appendChild: jest.fn(),
      removeChild: jest.fn(),
      querySelector: jest.fn(),
      querySelectorAll: jest.fn(() => []),
      value: '',
      checked: false,
      min: 0,
      max: 1,
      step: 0.1,
      type: 'text',
      parentNode: null
    };
    return element;
  }),
  writable: true
});

describe('GameRefactored Enhanced', () => {
  let game;
  let eventBus;
  let logger;

  beforeEach(() => {
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

  describe('Enhanced Initialization', () => {
    test('should initialize with UI and Audio systems', () => {
      expect(game.ui).toBeDefined();
      expect(game.ui.settings).toBeDefined();
      expect(game.systems).toBeDefined();
      expect(game.systems.audio).toBeDefined();
    });

    test('should throw error if SettingsUI initialization fails', () => {
      // Mock SettingsUI to throw error
      const { SettingsUI } = require('../src/ui/SettingsUI.js');
      SettingsUI.mockImplementationOnce(() => {
        throw new Error('SettingsUI init failed');
      });

      expect(() => {
        new GameRefactored({
          debug: true,
          enableAchievements: true,
          enableDailyChallenges: true,
          enableAccessibility: true,
        });
      }).toThrow('SettingsUI init failed');
    });

    test('should throw error if AudioSystem initialization fails', () => {
      // Mock AudioSystem to throw error
      const { AudioSystem } = require('../src/systems/AudioSystem.js');
      AudioSystem.mockImplementationOnce(() => {
        throw new Error('AudioSystem init failed');
      });

      expect(() => {
        new GameRefactored({
          debug: true,
          enableAchievements: true,
          enableDailyChallenges: true,
          enableAccessibility: true,
        });
      }).toThrow('AudioSystem init failed');
    });
  });

  describe('UI Integration', () => {
    test('should set up UI integration events', () => {
      const eventSpy = jest.spyOn(game.eventBus, 'on');
      
      // Re-initialize to trigger setupUIIntegration
      game.setupUIIntegration();
      
      expect(eventSpy).toHaveBeenCalledWith('settings:changed', expect.any(Function));
      expect(eventSpy).toHaveBeenCalledWith('game:stateChanged', expect.any(Function));
    });

    test('should handle settings changes', () => {
      const loggerSpy = jest.spyOn(game.logger, 'debug');
      
      game.eventBus.emit('settings:changed', {
        path: 'audio.masterVolume',
        value: 0.5
      });
      
      expect(loggerSpy).toHaveBeenCalledWith('Audio setting changed: audio.masterVolume = 0.5');
    });

    test('should update UI with game state changes', () => {
      const eventSpy = jest.spyOn(game.eventBus, 'emit');
      
      game.updateUI('score', 1000);
      
      expect(eventSpy).toHaveBeenCalledWith('ui:update', {
        type: 'score',
        data: 1000,
        timestamp: expect.any(Number)
      });
    });
  });

  describe('Console Integration', () => {
    test('should handle console commands', () => {
      const eventSpy = jest.spyOn(game.eventBus, 'emit');
      const loggerSpy = jest.spyOn(game.logger, 'info');
      
      game.handleConsoleCommand({
        command: 'setScore',
        args: ['5000']
      });
      
      expect(game.gameState.score).toBe(5000);
      expect(eventSpy).toHaveBeenCalledWith('player:scoreChanged', { score: 5000 });
      expect(loggerSpy).toHaveBeenCalledWith('Console: Score set to 5000');
    });

    test('should handle setLevel console command', () => {
      const eventSpy = jest.spyOn(game.eventBus, 'emit');
      const loggerSpy = jest.spyOn(game.logger, 'info');
      
      game.handleConsoleCommand({
        command: 'setLevel',
        args: ['5']
      });
      
      expect(game.gameState.currentLevel).toBe(5);
      expect(eventSpy).toHaveBeenCalledWith('player:levelCompleted', { level: 5 });
      expect(loggerSpy).toHaveBeenCalledWith('Console: Level set to 5');
    });

    test('should handle addPowerUp console command', () => {
      const eventSpy = jest.spyOn(game.eventBus, 'emit');
      const loggerSpy = jest.spyOn(game.logger, 'info');
      
      game.handleConsoleCommand({
        command: 'addPowerUp',
        args: ['speed']
      });
      
      expect(eventSpy).toHaveBeenCalledWith('powerup:activated', {
        type: 'speed',
        duration: 10000
      });
      expect(loggerSpy).toHaveBeenCalledWith('Console: Power-up speed added');
    });

    test('should handle unlockAchievement console command', () => {
      const eventSpy = jest.spyOn(game.eventBus, 'emit');
      const loggerSpy = jest.spyOn(game.logger, 'info');
      
      game.handleConsoleCommand({
        command: 'unlockAchievement',
        args: ['test_achievement']
      });
      
      expect(eventSpy).toHaveBeenCalledWith('achievement:unlocked', {
        name: 'test_achievement',
        description: 'Console unlocked achievement'
      });
      expect(loggerSpy).toHaveBeenCalledWith('Console: Achievement test_achievement unlocked');
    });

    test('should handle toggleSettings console command', () => {
      const toggleSpy = jest.spyOn(game.ui.settings, 'toggle');
      
      game.handleConsoleCommand({
        command: 'toggleSettings',
        args: []
      });
      
      expect(toggleSpy).toHaveBeenCalled();
    });

    test('should handle muteAudio console command', () => {
      const muteSpy = jest.spyOn(game.systems.audio, 'muteAll');
      
      game.handleConsoleCommand({
        command: 'muteAudio',
        args: []
      });
      
      expect(muteSpy).toHaveBeenCalled();
    });

    test('should handle unknown console commands', () => {
      const loggerSpy = jest.spyOn(game.logger, 'warn');
      
      game.handleConsoleCommand({
        command: 'unknownCommand',
        args: []
      });
      
      expect(loggerSpy).toHaveBeenCalledWith('Console: Unknown command: unknownCommand');
    });
  });

  describe('Play Integration', () => {
    test('should handle play actions', () => {
      const eventSpy = jest.spyOn(game.eventBus, 'emit');
      
      game.handlePlayAction({
        action: 'jump',
        params: { force: 10 }
      });
      
      expect(eventSpy).toHaveBeenCalledWith('player:jump', { force: 10 });
    });

    test('should handle collect play action', () => {
      const eventSpy = jest.spyOn(game.eventBus, 'emit');
      
      game.handlePlayAction({
        action: 'collect',
        params: { itemType: 'coin' }
      });
      
      expect(eventSpy).toHaveBeenCalledWith('player:collect', { itemType: 'coin' });
    });

    test('should handle pause play action', () => {
      const pauseSpy = jest.spyOn(game, 'pause');
      
      game.handlePlayAction({
        action: 'pause',
        params: {}
      });
      
      expect(pauseSpy).toHaveBeenCalled();
    });

    test('should handle resume play action', () => {
      const resumeSpy = jest.spyOn(game, 'resume');
      
      game.handlePlayAction({
        action: 'resume',
        params: {}
      });
      
      expect(resumeSpy).toHaveBeenCalled();
    });

    test('should handle restart play action', () => {
      const stopSpy = jest.spyOn(game, 'stop');
      const startSpy = jest.spyOn(game, 'start').mockResolvedValue();
      
      game.handlePlayAction({
        action: 'restart',
        params: {}
      });
      
      expect(stopSpy).toHaveBeenCalled();
      expect(startSpy).toHaveBeenCalled();
    });

    test('should handle unknown play actions', () => {
      const loggerSpy = jest.spyOn(game.logger, 'warn');
      
      game.handlePlayAction({
        action: 'unknownAction',
        params: {}
      });
      
      expect(loggerSpy).toHaveBeenCalledWith('Play: Unknown action: unknownAction');
    });
  });

  describe('Power-up Management', () => {
    test('should track active power-ups', () => {
      const eventSpy = jest.spyOn(game.eventBus, 'emit');
      
      game.eventBus.emit('powerup:activated', {
        type: 'speed',
        duration: 5000
      });
      
      expect(game.gameState.activePowerUps.has('speed')).toBe(true);
      expect(eventSpy).toHaveBeenCalledWith('powerup:activated', expect.any(Object));
    });

    test('should remove expired power-ups', () => {
      // Add a power-up
      game.eventBus.emit('powerup:activated', {
        type: 'speed',
        duration: 100 // Very short duration
      });
      
      // Wait for it to expire
      setTimeout(() => {
        const activePowerUps = game.getActivePowerUps();
        expect(activePowerUps).toHaveLength(0);
      }, 200);
    });

    test('should get active power-ups with remaining time', () => {
      game.eventBus.emit('powerup:activated', {
        type: 'speed',
        duration: 10000
      });
      
      const activePowerUps = game.getActivePowerUps();
      expect(activePowerUps).toHaveLength(1);
      expect(activePowerUps[0]).toMatchObject({
        type: 'speed',
        duration: 10000,
        remainingTime: expect.any(Number)
      });
    });
  });

  describe('Enhanced Game Statistics', () => {
    test('should get comprehensive game stats', () => {
      game.gameState.score = 1000;
      game.gameState.currentLevel = 3;
      game.gameState.isRunning = true;
      game.gameState.startTime = Date.now() - 5000; // 5 seconds ago
      
      const stats = game.getGameStats();
      
      expect(stats).toMatchObject({
        score: 1000,
        level: 3,
        isRunning: true,
        isPaused: false,
        gameTime: expect.any(Number),
        activePowerUps: expect.any(Array),
        achievements: expect.any(Array),
        challenges: expect.any(Array)
      });
      
      expect(stats.gameTime).toBeGreaterThan(4000); // Should be around 5000ms
    });
  });

  describe('Enhanced Start Method', () => {
    test('should initialize audio system on start', async () => {
      const audioInitSpy = jest.spyOn(game.systems.audio, 'initialize');
      const playMusicSpy = jest.spyOn(game.systems.audio, 'playMusic');
      
      await game.start();
      
      expect(audioInitSpy).toHaveBeenCalled();
      expect(playMusicSpy).toHaveBeenCalledWith('mainTheme');
    });
  });

  describe('Enhanced Destroy Method', () => {
    test('should cleanup UI and audio systems', () => {
      const settingsCleanupSpy = jest.spyOn(game.ui.settings, 'cleanup');
      const audioCleanupSpy = jest.spyOn(game.systems.audio, 'cleanup');

      game.destroy();

      expect(settingsCleanupSpy).toHaveBeenCalled();
      expect(audioCleanupSpy).toHaveBeenCalled();
      expect(game.ui).toBeNull();
      expect(game.systems).toBeNull();
      // Set game to null so afterEach doesn't try to destroy again
      game = null;
    });
  });

  describe('External API Methods', () => {
    test('should provide getUI method', () => {
      expect(game.getUI('settings')).toBe(game.ui.settings);
    });

    test('should provide getSystem method', () => {
      expect(game.getSystem('audio')).toBe(game.systems.audio);
    });

    test('should provide executeConsoleCommand method', () => {
      const eventSpy = jest.spyOn(game.eventBus, 'emit');
      
      game.executeConsoleCommand('setScore', '1000');
      
      expect(eventSpy).toHaveBeenCalledWith('console:command', {
        command: 'setScore',
        args: ['1000']
      });
    });

    test('should provide executePlayAction method', () => {
      const eventSpy = jest.spyOn(game.eventBus, 'emit');
      
      game.executePlayAction('jump', { force: 5 });
      
      expect(eventSpy).toHaveBeenCalledWith('play:action', {
        action: 'jump',
        params: { force: 5 }
      });
    });
  });

  describe('Cross-cutting Features Integration', () => {
    test('should integrate achievements with UI updates', () => {
      const updateUISpy = jest.spyOn(game, 'updateUI');
      
      game.eventBus.emit('achievement:unlocked', {
        name: 'Test Achievement',
        description: 'Test description'
      });
      
      expect(updateUISpy).toHaveBeenCalledWith('achievement', {
        name: 'Test Achievement',
        description: 'Test description'
      });
    });

    test('should integrate daily challenges with UI updates', () => {
      const updateUISpy = jest.spyOn(game, 'updateUI');
      
      game.eventBus.emit('dailyChallenge:completed', {
        name: 'Test Challenge',
        reward: '100 points'
      });
      
      expect(updateUISpy).toHaveBeenCalledWith('challenge', {
        name: 'Test Challenge',
        reward: '100 points'
      });
    });

    test('should integrate power-ups with UI updates', () => {
      const updateUISpy = jest.spyOn(game, 'updateUI');
      
      game.eventBus.emit('powerup:activated', {
        type: 'speed',
        duration: 10000
      });
      
      expect(updateUISpy).toHaveBeenCalledWith('powerup', {
        type: 'speed',
        duration: 10000
      });
    });
  });
});