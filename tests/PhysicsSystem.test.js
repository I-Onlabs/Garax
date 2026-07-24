import { PhysicsSystem } from '../src/systems/PhysicsSystem.js';

class MockCollisionDetector {
  constructor() {
    this.registerCollisionObject = jest.fn();
    this.updateCollisionObject = jest.fn();
    this.checkCollisions = jest.fn();
    this.initialize = jest.fn().mockResolvedValue();
    this.cleanup = jest.fn();
    this.unregisterCollisionObject = jest.fn();
  }
}

describe('PhysicsSystem', () => {
  let physicsSystem;
  let mockEventBus;
  let mockCollisionDetector;

  beforeEach(() => {
    mockEventBus = {
      emit: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
    };

    mockCollisionDetector = new MockCollisionDetector();

    physicsSystem = new PhysicsSystem({
      eventBus: mockEventBus,
      collisionDetector: mockCollisionDetector,
    });
  });

  test('initialize should call collisionDetector.initialize', async () => {
    await physicsSystem.initialize();
    expect(mockCollisionDetector.initialize).toHaveBeenCalled();
  });

  test('update should sync player to collision detector', () => {
    const gameState = {
      player: {
        id: 'player1',
        x: 100,
        y: 200,
        width: 32,
        height: 32,
      },
      gameObjects: [],
    };

    physicsSystem.update(16, gameState);

    expect(mockCollisionDetector.registerCollisionObject).toHaveBeenCalledWith(
      'player1',
      expect.objectContaining({
        id: 'player1',
        position: { x: 100, y: 200 },
        size: { width: 32, height: 32 },
      })
    );
  });

  test('update should sync player exactly once per frame', () => {
    const gameState = {
      player: {
        id: 'player1',
        x: 100,
        y: 200,
        width: 32,
        height: 32,
      },
      gameObjects: [],
    };

    // First frame: one registration, no redundant position update
    physicsSystem.update(16, gameState);
    expect(mockCollisionDetector.registerCollisionObject).toHaveBeenCalledTimes(
      1
    );
    expect(mockCollisionDetector.updateCollisionObject).not.toHaveBeenCalled();

    // Second frame: exactly one position update
    gameState.player.x = 110;
    physicsSystem.update(16, gameState);
    expect(mockCollisionDetector.registerCollisionObject).toHaveBeenCalledTimes(
      1
    );
    expect(mockCollisionDetector.updateCollisionObject).toHaveBeenCalledTimes(
      1
    );
    expect(mockCollisionDetector.updateCollisionObject).toHaveBeenCalledWith(
      'player1',
      {
        x: 110,
        y: 200,
      }
    );
  });

  test('update should sync game objects to collision detector', () => {
    const gameState = {
      player: null,
      gameObjects: [
        {
          id: 'enemy1',
          x: 50,
          y: 60,
          width: 20,
          height: 20,
        },
      ],
    };

    physicsSystem.update(16, gameState);

    expect(mockCollisionDetector.registerCollisionObject).toHaveBeenCalledWith(
      'enemy1',
      expect.objectContaining({
        id: 'enemy1',
        position: { x: 50, y: 60 },
        size: { width: 20, height: 20 },
      })
    );
  });

  test('update should update existing objects instead of registering again', () => {
    const gameState = {
      player: {
        id: 'player1',
        x: 100,
        y: 200,
      },
      gameObjects: [],
    };

    // First update registers
    physicsSystem.update(16, gameState);
    expect(mockCollisionDetector.registerCollisionObject).toHaveBeenCalledTimes(
      1
    );

    // Change position
    gameState.player.x = 105;

    // Second update updates
    physicsSystem.update(16, gameState);
    expect(mockCollisionDetector.registerCollisionObject).toHaveBeenCalledTimes(
      1
    ); // No new registration
    expect(mockCollisionDetector.updateCollisionObject).toHaveBeenCalledWith(
      'player1',
      { x: 105, y: 200 }
    );
  });

  test('update should call checkCollisions', () => {
    physicsSystem.update(16, { gameObjects: [] });
    expect(mockCollisionDetector.checkCollisions).toHaveBeenCalled();
  });

  test('update should remove objects that are no longer in game state', () => {
    const gameState = {
      player: null,
      gameObjects: [
        {
          id: 'obj1',
          x: 0,
          y: 0,
        },
      ],
    };

    // Register obj1
    physicsSystem.update(16, gameState);
    expect(mockCollisionDetector.registerCollisionObject).toHaveBeenCalledWith(
      'obj1',
      expect.anything()
    );

    // Remove obj1 from game state
    gameState.gameObjects = [];

    // Update should trigger removal
    physicsSystem.update(16, gameState);
    expect(
      mockCollisionDetector.unregisterCollisionObject
    ).toHaveBeenCalledWith('obj1');
  });

  test('cleanup should call collisionDetector.cleanup', () => {
    physicsSystem.cleanup();
    expect(mockCollisionDetector.cleanup).toHaveBeenCalled();
  });
});
