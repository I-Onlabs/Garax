/**
 * GameLoop Tests
 * TODO: Add comprehensive tests for GameLoopManager
 */

import { GameLoopManager } from '../src/GameLoop/GameLoopManager.js';

describe('GameLoopManager', () => {
  let gameLoop;
  let mockEventBus;
  let mockLogger;
  let mockConfig;

  beforeEach(() => {
    mockEventBus = {
      emit: jest.fn(),
    };
    mockLogger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };
    mockConfig = {
      frameRate: 60,
    };

    gameLoop = new GameLoopManager({
      eventBus: mockEventBus,
      logger: mockLogger,
      config: mockConfig,
    });
  });

  afterEach(() => {
    gameLoop.cleanup();
  });

  test('should initialize with default values', () => {
    expect(gameLoop.isRunning).toBe(false);
    expect(gameLoop.isPaused).toBe(false);
    expect(gameLoop.frameRate).toBe(60);
    expect(gameLoop.targetFrameTime).toBe(1000 / 60);
  });

  test('should initialize with custom frame rate', () => {
    const customGameLoop = new GameLoopManager({
      frameRate: 30,
      eventBus: mockEventBus,
      logger: mockLogger,
      config: mockConfig,
    });

    expect(customGameLoop.frameRate).toBe(30);
    expect(customGameLoop.targetFrameTime).toBe(1000 / 30);
  });

  test('should start game loop', () => {
    gameLoop.start();
    expect(gameLoop.isRunning).toBe(true);
    expect(gameLoop.isPaused).toBe(false);
  });

  test('should pause game loop', () => {
    gameLoop.start();
    gameLoop.pause();
    expect(gameLoop.isRunning).toBe(true);
    expect(gameLoop.isPaused).toBe(true);
  });

  test('should resume game loop', () => {
    gameLoop.start();
    gameLoop.pause();
    gameLoop.resume();
    expect(gameLoop.isRunning).toBe(true);
    expect(gameLoop.isPaused).toBe(false);
  });

  test('should stop game loop', () => {
    gameLoop.start();
    gameLoop.stop();
    expect(gameLoop.isRunning).toBe(false);
    expect(gameLoop.isPaused).toBe(false);
  });

  test('should get game state', () => {
    const state = gameLoop.getGameState();
    expect(state).toHaveProperty('currentLevel');
    expect(state).toHaveProperty('score');
    expect(state).toHaveProperty('lives');
    expect(state).toHaveProperty('isGameOver');
  });

  test('should update game state', () => {
    const newState = { score: 100, lives: 2 };
    gameLoop.updateGameState(newState);

    const state = gameLoop.getGameState();
    expect(state.score).toBe(100);
    expect(state.lives).toBe(2);
  });

  // TODO: Add more comprehensive tests
  // - Test game loop timing
  // - Test event emission
  // - Test delta time calculations
  // - Test performance monitoring
});
