import { CollisionDetector } from '../CollisionSystem/CollisionDetector.js';

/**
 * PhysicsSystem - Manages physics updates and collision detection
 */
export class PhysicsSystem {
  constructor(options = {}) {
    this.eventBus = options.eventBus;
    this.logger = options.logger;
    this.config = options.config;

    // Track registered objects to prevent redundant registration
    this.registeredObjects = new Set();

    // Use provided collision detector or create a new one
    this.collisionDetector = options.collisionDetector || new CollisionDetector({
      eventBus: this.eventBus,
      logger: this.logger,
      config: this.config
    });
  }

  /**
   * Initialize the physics system
   */
  async initialize() {
    if (this.collisionDetector.initialize) {
      await this.collisionDetector.initialize();
    }
    this.logger?.info('PhysicsSystem initialized');
  }

  /**
   * Update physics simulation
   * @param {number} deltaTime - Time since last frame in ms
   * @param {Object} gameState - Current game state
   */
  update(deltaTime, gameState) {
    if (!gameState) return;

    // 1. Sync game objects with collision detector
    // This ensures collision detector has the latest positions
    if (gameState.player) {
      this.syncObject(gameState.player);
    }

    const activeIds = new Set();

    if (gameState.player) {
      this.syncObject(gameState.player);
      if (gameState.player.id) {
        activeIds.add(gameState.player.id);
      }
    }

    if (gameState.gameObjects && Array.isArray(gameState.gameObjects)) {
      gameState.gameObjects.forEach(obj => {
        this.syncObject(obj);
        if (obj.id) {
          activeIds.add(obj.id);
        }
      });
    }

    // Cleanup removed objects
    for (const id of this.registeredObjects) {
      if (!activeIds.has(id)) {
        this.collisionDetector.unregisterCollisionObject(id);
        this.registeredObjects.delete(id);
      }
    }

    // 2. Run collision detection
    // This will emit events for any detected collisions
    this.collisionDetector.checkCollisions();
  }

  /**
   * Sync a game object with the collision detector
   * @param {Object} obj - Game object to sync
   */
  syncObject(obj) {
    if (!obj.id) return;

    // Adapt object properties to CollisionDetector expected format
    // CollisionDetector expects: position: {x, y}, size: {width, height}
    // Most game objects have: x, y, width, height

    const position = { x: obj.x || 0, y: obj.y || 0 };
    if (obj.position) {
      position.x = obj.position.x;
      position.y = obj.position.y;
    }

    const size = { width: obj.width || 32, height: obj.height || 32 };
    if (obj.size) {
      size.width = obj.size.width;
      size.height = obj.size.height;
    }

    if (!this.registeredObjects.has(obj.id)) {
      // Register new object
      // We create a proxy object that satisfies CollisionDetector's expected structure
      const collisionObj = {
        ...obj,
        position,
        size
      };

      this.collisionDetector.registerCollisionObject(obj.id, collisionObj);
      this.registeredObjects.add(obj.id);
    } else {
      // Update existing object position
      this.collisionDetector.updateCollisionObject(obj.id, position);
    }
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.collisionDetector.cleanup) {
      this.collisionDetector.cleanup();
    }
    this.registeredObjects.clear();
  }
}

export default PhysicsSystem;
