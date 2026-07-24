/**
 * Spawner Tests
 * TODO: Add comprehensive tests for EntitySpawner
 */

import { EntitySpawner } from '../src/Spawner/EntitySpawner.js';

describe('EntitySpawner', () => {
  let spawner;
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
      maxEntities: 100,
    };

    spawner = new EntitySpawner({
      eventBus: mockEventBus,
      logger: mockLogger,
      config: mockConfig,
    });
  });

  afterEach(() => {
    spawner.cleanup();
  });

  test('should initialize with default values', () => {
    expect(spawner.spawnedEntities).toBeInstanceOf(Map);
    expect(spawner.entityPools).toBeInstanceOf(Map);
    expect(spawner.spawnPatterns).toBeInstanceOf(Map);
    expect(spawner.spawnTimers).toBeInstanceOf(Map);
  });

  test('should spawn player entity', () => {
    const position = { x: 100, y: 100 };
    const entityId = spawner.spawnEntity('player', position);

    expect(entityId).toBeTruthy();
    expect(spawner.spawnedEntities.has(entityId)).toBe(true);
  });

  test('should spawn enemy entity', () => {
    const position = { x: 200, y: 200 };
    const entityId = spawner.spawnEntity('enemy', position);

    expect(entityId).toBeTruthy();
    expect(spawner.spawnedEntities.has(entityId)).toBe(true);
  });

  test('should spawn powerup entity', () => {
    const position = { x: 300, y: 300 };
    const entityId = spawner.spawnEntity('powerup', position);

    expect(entityId).toBeTruthy();
    expect(spawner.spawnedEntities.has(entityId)).toBe(true);
  });

  test('should spawn projectile entity', () => {
    const position = { x: 400, y: 400 };
    const entityId = spawner.spawnEntity('projectile', position);

    expect(entityId).toBeTruthy();
    expect(spawner.spawnedEntities.has(entityId)).toBe(true);
  });

  test('should remove entity', () => {
    const position = { x: 100, y: 100 };
    const entityId = spawner.spawnEntity('enemy', position);

    expect(spawner.removeEntity(entityId)).toBe(true);
    expect(spawner.spawnedEntities.has(entityId)).toBe(false);
  });

  test('should get entities by type', () => {
    spawner.spawnEntity('enemy', { x: 100, y: 100 });
    spawner.spawnEntity('enemy', { x: 200, y: 200 });
    spawner.spawnEntity('powerup', { x: 300, y: 300 });

    const enemies = spawner.getEntitiesByType('enemy');
    expect(enemies).toHaveLength(2);

    const powerups = spawner.getEntitiesByType('powerup');
    expect(powerups).toHaveLength(1);
  });

  test('should get entities in range', () => {
    spawner.spawnEntity('enemy', { x: 100, y: 100 });
    spawner.spawnEntity('enemy', { x: 200, y: 200 });
    spawner.spawnEntity('enemy', { x: 500, y: 500 });

    const nearbyEntities = spawner.getEntitiesInRange({ x: 150, y: 150 }, 200);
    expect(nearbyEntities).toHaveLength(2);
  });

  test('should generate unique entity IDs', () => {
    const id1 = spawner.generateEntityId();
    const id2 = spawner.generateEntityId();

    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^entity_\d+_[a-z0-9]+$/);
    expect(id2).toMatch(/^entity_\d+_[a-z0-9]+$/);
  });

  test('should calculate distance correctly', () => {
    const pos1 = { x: 0, y: 0 };
    const pos2 = { x: 3, y: 4 };

    const distance = spawner.calculateDistance(pos1, pos2);
    expect(distance).toBe(5);
  });

  test('should clean up distant entities', () => {
    // Setup player
    const playerPosition = { x: 0, y: 0 };
    spawner.spawnEntity('player', playerPosition);

    // Setup close entity (within cleanupDistance 1500)
    const closeEntityId = spawner.spawnEntity('enemy', { x: 1000, y: 0 });

    // Setup distant entity (beyond cleanupDistance 1500)
    const distantEntityId = spawner.spawnEntity('enemy', { x: 2000, y: 0 });

    // Setup persistent distant entity
    const persistentEntityId = spawner.spawnEntity(
      'enemy',
      { x: 2000, y: 0 },
      { persistent: true }
    );

    // Run update
    spawner.update(16);

    // Check results
    expect(spawner.spawnedEntities.has(closeEntityId)).toBe(true);
    expect(spawner.spawnedEntities.has(distantEntityId)).toBe(false);
    expect(spawner.spawnedEntities.has(persistentEntityId)).toBe(true);

    // Verify player still exists
    const player = Array.from(spawner.spawnedEntities.values()).find(
      (e) => e.type === 'player'
    );
    expect(player).toBeDefined();
  });

  // TODO: Add more comprehensive tests
  // - Test entity pooling
  // - Test spawn patterns
  // - Test spawn timers
  // - Test cleanup functionality
  // - Test event emission
});
