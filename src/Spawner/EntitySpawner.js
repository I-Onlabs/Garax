/**
 * EntitySpawner - Entity spawning and management
 * 
 * TODO: Extract from GameRefactored.js and systems
 * - Move entity creation logic here
 * - Implement object pooling
 * - Add spawn patterns and waves
 * - Handle entity lifecycle management
 */

import { Player } from '../objects/Player.js';
import { ObjectPool } from '../utils/ObjectPool.js';

export class EntitySpawner {
  constructor(options = {}) {
    this.spawnedEntities = new Map();
    this.entityPools = new Map();
    this.spawnPatterns = new Map();
    this.spawnTimers = new Map();
    
    // Initialize object pools immediately
    this.initializePools();

    // TODO: Inject dependencies
    this.eventBus = options.eventBus;
    this.logger = options.logger;
    this.config = options.config;
    
    // TODO: Add spawn configuration
    this.spawnConfig = {
      maxEntities: 100,
      spawnRate: 1.0, // entities per second
      spawnDistance: 1000,
      cleanupDistance: 1500
    };

  }

  /**
   * Initialize the spawner
   * TODO: Set up entity pools and spawn patterns
   */
  async initialize() {
    // TODO: Load spawn patterns
    // TODO: Set up spawn timers
    console.log('EntitySpawner initialized');
  }

  /**
   * Initialize object pools for different entity types
   */
  initializePools() {
    // Helper to reset common properties
    const resetCommon = (entity) => {
      entity.active = false;
      entity.id = null;
      entity.position = null;
      // Clean up optional properties that might linger
      delete entity.persistent;
      delete entity.health;
      delete entity.velocity;
      // Note: We don't delete all keys for performance,
      // but we ensure critical flags are cleared.
    };

    // Enemy pool
    this.entityPools.set('enemy', new ObjectPool(
      () => ({ type: 'enemy', active: false }),
      (enemy) => resetCommon(enemy),
      20 // Initial size
    ));

    // Powerup pool
    this.entityPools.set('powerup', new ObjectPool(
      () => ({ type: 'powerup', active: false }),
      (powerup) => resetCommon(powerup),
      10
    ));

    // Projectile pool
    this.entityPools.set('projectile', new ObjectPool(
      () => ({ type: 'projectile', active: false }),
      (projectile) => resetCommon(projectile),
      50
    ));
  }

  /**
   * Spawn a new entity
   * TODO: Extract from various systems
   */
  spawnEntity(type, position, options = {}) {
    const entityId = this.generateEntityId();
    const entity = this.createEntity(type, position, options);
    
    if (entity) {
      this.spawnedEntities.set(entityId, entity);
      // TODO: Emit spawn event
      this.eventBus?.emit('entity:spawned', { id: entityId, type, entity });
      return entityId;
    }
    
    return null;
  }

  /**
   * Create entity instance
   * TODO: Implement entity factory
   */
  createEntity(type, position, options) {
    // TODO: Implement entity creation based on type
    // TODO: Use object pooling when available
    switch (type) {
      case 'player':
        return this.createPlayer(position, options);
      case 'enemy':
        return this.createEnemy(position, options);
      case 'powerup':
        return this.createPowerup(position, options);
      case 'projectile':
        return this.createProjectile(position, options);
      default:
        console.warn(`Unknown entity type: ${type}`);
        return null;
    }
  }

  /**
   * Create player entity
   * TODO: Extract from Player.js
   */
  createPlayer(position, options) {
    const playerConfig = {
      x: position.x,
      y: position.y,
      z: position.z || 0,
      logger: this.logger,
      ...options
    };
    return new Player(playerConfig);
  }

  /**
   * Create enemy entity
   * TODO: Extract from enemy systems
   */
  createEnemy(position, options) {
    const pool = this.entityPools.get('enemy');
    const enemy = pool ? pool.acquire() : { type: 'enemy' };

    enemy.id = this.generateEntityId();
    enemy.type = 'enemy';
    enemy.position = position;
    enemy.active = true;

    Object.assign(enemy, options);

    return enemy;
  }

  /**
   * Create powerup entity
   * TODO: Extract from powerup systems
   */
  createPowerup(position, options) {
    const pool = this.entityPools.get('powerup');
    const powerup = pool ? pool.acquire() : { type: 'powerup' };

    powerup.id = this.generateEntityId();
    powerup.type = 'powerup';
    powerup.position = position;
    powerup.active = true;

    Object.assign(powerup, options);

    return powerup;
  }

  /**
   * Create projectile entity
   * TODO: Extract from combat systems
   */
  createProjectile(position, options) {
    const pool = this.entityPools.get('projectile');
    const projectile = pool ? pool.acquire() : { type: 'projectile' };

    projectile.id = this.generateEntityId();
    projectile.type = 'projectile';
    projectile.position = position;
    projectile.active = true;

    Object.assign(projectile, options);

    return projectile;
  }

  /**
   * Remove entity
   * TODO: Implement proper cleanup
   */
  removeEntity(entityId) {
    const entity = this.spawnedEntities.get(entityId);
    if (entity) {
      this.spawnedEntities.delete(entityId);

      // TODO: Emit removal event
      this.eventBus?.emit('entity:removed', { id: entityId, entity });

      // Return to pool if pooled
      const pool = this.entityPools.get(entity.type);
      if (pool) {
        pool.release(entity);
      }
      return true;
    }
    return false;
  }

  /**
   * Get all entities of a type
   * TODO: Optimize with spatial indexing
   */
  getEntitiesByType(type) {
    const entities = [];
    for (const [id, entity] of this.spawnedEntities) {
      if (entity.type === type) {
        entities.push({ id, ...entity });
      }
    }
    return entities;
  }

  /**
   * Get entities in range
   * TODO: Implement spatial queries
   */
  getEntitiesInRange(position, range) {
    const entities = [];
    for (const [id, entity] of this.spawnedEntities) {
      const distance = this.calculateDistance(position, entity.position);
      if (distance <= range) {
        entities.push({ id, ...entity, distance });
      }
    }
    return entities;
  }

  /**
   * Update spawner
   * TODO: Extract from game update loop
   */
  update(deltaTime) {
    // Update spawn timers
    for (const [id, timer] of this.spawnTimers) {
      timer.timeRemaining -= deltaTime;

      if (timer.timeRemaining <= 0) {
        // Trigger spawn callback
        if (typeof timer.callback === 'function') {
          timer.callback();
        }

        // Handle repeat or removal
        if (timer.repeat) {
          timer.timeRemaining += timer.interval;
        } else {
          this.spawnTimers.delete(id);
        }
      }
    }

    // TODO: Check spawn conditions

    // Clean up distant entities
    // Find player position for reference
    const player = Array.from(this.spawnedEntities.values()).find(e => e.type === 'player');
    if (player) {
      // Handle both position object and direct x,y coordinates (Player class uses x,y)
      const playerPos = player.position || { x: player.x, y: player.y };
      this.cleanupDistantEntities(playerPos);
    }

    // TODO: Update entity pools
  }

  /**
   * Clean up entities that are too far away
   * @param {Object} referencePosition - The position to check distance from (usually player position)
   */
  cleanupDistantEntities(referencePosition) {
    if (!referencePosition) return;

    const cleanupDistance = this.spawnConfig.cleanupDistance;

    for (const [id, entity] of this.spawnedEntities) {
      // Don't clean up the player
      if (entity.type === 'player') continue;

      // Don't clean up persistent entities
      if (entity.persistent) continue;

      const distance = this.calculateDistance(referencePosition, entity.position);
      if (distance > cleanupDistance) {
        this.removeEntity(id);
      }
    }
  }

  /**
   * Generate unique entity ID
   * TODO: Implement proper ID generation
   */
  generateEntityId() {
    return `entity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate distance between two positions
   * TODO: Move to utility functions
   */
  calculateDistance(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Cleanup resources
   * TODO: Implement proper cleanup
   */
  cleanup() {
    // TODO: Clear all entities
    // TODO: Clear pools
    // TODO: Clear timers
    this.spawnedEntities.clear();
    this.entityPools.clear();
    this.spawnPatterns.clear();
    this.spawnTimers.clear();
  }
}

export default EntitySpawner;