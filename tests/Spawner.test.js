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

  beforeEach(async () => {
    mockEventBus = {
      emit: jest.fn()
    };
    mockLogger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };
    mockConfig = {
      maxEntities: 100
    };

    spawner = new EntitySpawner({
      eventBus: mockEventBus,
      logger: mockLogger,
      config: mockConfig
    });

    await spawner.initialize();
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

  test('should load spawn patterns', () => {
    expect(spawner.spawnPatterns.has('single')).toBe(true);
    expect(spawner.spawnPatterns.has('line')).toBe(true);
    expect(spawner.spawnPatterns.has('circle')).toBe(true);
    expect(spawner.spawnPatterns.has('grid')).toBe(true);
    expect(spawner.spawnPatterns.has('random')).toBe(true);
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

  describe('spawnFromPattern', () => {
    test('should spawn single entity', () => {
      const entityIds = spawner.spawnFromPattern('single', {
        type: 'enemy',
        position: { x: 100, y: 100 }
      });
      expect(entityIds).toHaveLength(1);
      const entity = spawner.spawnedEntities.get(entityIds[0]);
      expect(entity.position).toEqual({ x: 100, y: 100 });
      expect(entity.type).toBe('enemy');
    });

    test('should spawn line of entities', () => {
      const entityIds = spawner.spawnFromPattern('line', {
        type: 'enemy',
        position: { x: 100, y: 100 },
        count: 3,
        spacing: 10,
        horizontal: true
      });
      expect(entityIds).toHaveLength(3);

      const entities = entityIds.map(id => spawner.spawnedEntities.get(id));
      expect(entities[0].position).toEqual({ x: 100, y: 100 });
      expect(entities[1].position).toEqual({ x: 110, y: 100 });
      expect(entities[2].position).toEqual({ x: 120, y: 100 });
    });

    test('should spawn circle of entities', () => {
      const count = 4;
      const radius = 100;
      const entityIds = spawner.spawnFromPattern('circle', {
        type: 'enemy',
        position: { x: 0, y: 0 },
        count: count,
        radius: radius
      });
      expect(entityIds).toHaveLength(count);

      // Check first entity (at angle 0)
      const entities = entityIds.map(id => spawner.spawnedEntities.get(id));
      expect(entities[0].position.x).toBeCloseTo(radius);
      expect(entities[0].position.y).toBeCloseTo(0);
    });

    test('should spawn grid of entities', () => {
      const rows = 2;
      const cols = 2;
      const entityIds = spawner.spawnFromPattern('grid', {
        type: 'enemy',
        position: { x: 0, y: 0 },
        rows: rows,
        cols: cols,
        spacingX: 10,
        spacingY: 10
      });
      expect(entityIds).toHaveLength(rows * cols);

      const entities = entityIds.map(id => spawner.spawnedEntities.get(id));
      expect(entities[0].position).toEqual({ x: 0, y: 0 });
      expect(entities[1].position).toEqual({ x: 10, y: 0 });
      expect(entities[2].position).toEqual({ x: 0, y: 10 });
      expect(entities[3].position).toEqual({ x: 10, y: 10 });
    });

    test('should spawn random entities', () => {
       const count = 5;
       const entityIds = spawner.spawnFromPattern('random', {
           type: 'enemy',
           position: { x: 100, y: 100 },
           count: count,
           radius: 50
       });
       expect(entityIds).toHaveLength(count);
       const entities = entityIds.map(id => spawner.spawnedEntities.get(id));
       entities.forEach(entity => {
           const dist = spawner.calculateDistance(entity.position, { x: 100, y: 100 });
           expect(dist).toBeLessThanOrEqual(50);
       });
    });

    test('should handle unknown pattern', () => {
      const entityIds = spawner.spawnFromPattern('unknown', {});
      expect(entityIds).toEqual([]);
      expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('Unknown spawn pattern'));
    });
  });
});