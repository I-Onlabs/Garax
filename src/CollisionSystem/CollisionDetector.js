/**
 * CollisionDetector - Collision detection and response
 * 
 * TODO: Extract from GameRefactored.js and systems
 * - Move collision detection logic here
 * - Implement spatial partitioning
 * - Add collision response handling
 * - Optimize collision queries
 */

export class CollisionDetector {
  constructor(options = {}) {
    this.collisionObjects = new Map();
    this.spatialGrid = null;
    this.gridSize = 64; // Grid cell size for spatial partitioning
    
    // Inject dependencies
    this.eventBus = options.eventBus;
    this.logger = options.logger;
    this.config = options.config;
    
    // Add collision configuration
    this.collisionConfig = {
      enableSpatialPartitioning: true,
      broadPhase: true,
      narrowPhase: true,
      responseEnabled: true
    };
  }

  /**
   * Initialize collision system
   */
  async initialize() {
    this.spatialGrid = new Map();
    console.log('CollisionDetector initialized');
  }

  /**
   * Register collision object
   */
  registerCollisionObject(id, object) {
    const collisionObject = {
      id,
      position: object.position || { x: 0, y: 0 },
      size: object.size || { width: 32, height: 32 },
      type: object.type || 'default',
      layer: object.layer || 0,
      isStatic: object.isStatic || false,
      isTrigger: object.isTrigger || false,
      ...object,
      gridCells: new Set() // Track which grid cells this object is in
    };
    
    this.collisionObjects.set(id, collisionObject);
    this.addToSpatialGrid(id, collisionObject);
  }

  /**
   * Unregister collision object
   */
  unregisterCollisionObject(id) {
    const object = this.collisionObjects.get(id);
    if (object) {
      this.removeFromSpatialGrid(id, object);
      this.collisionObjects.delete(id);
    }
  }

  /**
   * Update collision object position
   */
  updateCollisionObject(id, newPosition) {
    const object = this.collisionObjects.get(id);
    if (object) {
      // Remove from grid based on old position/stored cells before updating position
      // However, removeFromSpatialGrid uses the current cells stored in gridCells, so we don't strictly need old position if we trust gridCells
      // But updateSpatialGrid usually needs to know if cells changed.

      // Strategy:
      // 1. Remove from current cells
      // 2. Update position
      // 3. Add to new cells

      this.removeFromSpatialGrid(id, object);
      object.position = newPosition;
      this.addToSpatialGrid(id, object);
    }
  }

  /**
   * Check for collisions
   */
  checkCollisions() {
    const collisions = [];
    
    if (this.collisionConfig.enableSpatialPartitioning && this.spatialGrid) {
      collisions.push(...this.checkCollisionsSpatial());
    } else {
      collisions.push(...this.checkCollisionsBruteForce());
    }
    
    this.processCollisionResponses(collisions);
    
    return collisions;
  }

  /**
   * Brute force collision detection
   */
  checkCollisionsBruteForce() {
    const collisions = [];
    const objects = Array.from(this.collisionObjects.values());
    
    for (let i = 0; i < objects.length; i++) {
      for (let j = i + 1; j < objects.length; j++) {
        const obj1 = objects[i];
        const obj2 = objects[j];
        
        if (this.objectsCanCollide(obj1, obj2) && this.checkAABBCollision(obj1, obj2)) {
          collisions.push({
            object1: obj1,
            object2: obj2,
            collisionPoint: this.calculateCollisionPoint(obj1, obj2)
          });
        }
      }
    }
    
    return collisions;
  }

  /**
   * Spatial partitioning collision detection
   */
  checkCollisionsSpatial() {
    const collisions = [];
    const checkedPairs = new Set();

    if (!this.spatialGrid) return [];

    // Iterate through all cells in the spatial grid
    for (const [cellKey, objectIds] of this.spatialGrid.entries()) {
        const ids = Array.from(objectIds);

        // Check collisions for all pairs in this cell
        for (let i = 0; i < ids.length; i++) {
            for (let j = i + 1; j < ids.length; j++) {
                const id1 = ids[i];
                const id2 = ids[j];

                // Sort IDs to ensure consistent key for checkedPairs
                const pairKey = id1 < id2 ? `${id1}-${id2}` : `${id2}-${id1}`;

                if (checkedPairs.has(pairKey)) continue;
                checkedPairs.add(pairKey);

                const obj1 = this.collisionObjects.get(id1);
                const obj2 = this.collisionObjects.get(id2);

                if (obj1 && obj2 && this.objectsCanCollide(obj1, obj2) && this.checkAABBCollision(obj1, obj2)) {
                    collisions.push({
                        object1: obj1,
                        object2: obj2,
                        collisionPoint: this.calculateCollisionPoint(obj1, obj2)
                    });
                }
            }
        }
    }

    return collisions;
  }

  /**
   * Check if two objects can collide
   */
  objectsCanCollide(obj1, obj2) {
    // TODO: Check collision layers
    // TODO: Check collision groups
    // TODO: Check static vs dynamic
    return true;
  }

  /**
   * Check AABB collision
   */
  checkAABBCollision(obj1, obj2) {
    const pos1 = obj1.position;
    const pos2 = obj2.position;
    const size1 = obj1.size;
    const size2 = obj2.size;
    
    return pos1.x < pos2.x + size2.width &&
           pos1.x + size1.width > pos2.x &&
           pos1.y < pos2.y + size2.height &&
           pos1.y + size1.height > pos2.y;
  }

  /**
   * Calculate collision point
   */
  calculateCollisionPoint(obj1, obj2) {
    // Basic midpoint approximation
    return {
      x: (obj1.position.x + obj2.position.x) / 2,
      y: (obj1.position.y + obj2.position.y) / 2
    };
  }

  /**
   * Process collision responses
   */
  processCollisionResponses(collisions) {
    for (const collision of collisions) {
      const { object1, object2, collisionPoint } = collision;
      
      this.eventBus?.emit('collision:detected', {
        object1: object1.id,
        object2: object2.id,
        collisionPoint,
        collisionType: this.getCollisionType(object1, object2)
      });
      
      if (object1.isTrigger || object2.isTrigger) {
        this.handleTriggerCollision(object1, object2, collisionPoint);
      } else {
        this.handlePhysicalCollision(object1, object2, collisionPoint);
      }
    }
  }

  /**
   * Handle trigger collisions
   */
  handleTriggerCollision(obj1, obj2, collisionPoint) {
    // console.log(`Trigger collision: ${obj1.id} <-> ${obj2.id}`);
  }

  /**
   * Handle physical collisions
   */
  handlePhysicalCollision(obj1, obj2, collisionPoint) {
    // console.log(`Physical collision: ${obj1.id} <-> ${obj2.id}`);
  }

  /**
   * Get collision type
   */
  getCollisionType(obj1, obj2) {
    return `${obj1.type}-${obj2.type}`;
  }

  /**
   * Get grid cells covered by an object
   */
  getCellsForObject(object) {
      const cells = [];
      const startCol = Math.floor(object.position.x / this.gridSize);
      const endCol = Math.floor((object.position.x + object.size.width) / this.gridSize);
      const startRow = Math.floor(object.position.y / this.gridSize);
      const endRow = Math.floor((object.position.y + object.size.height) / this.gridSize);

      for (let col = startCol; col <= endCol; col++) {
          for (let row = startRow; row <= endRow; row++) {
              cells.push(`${col},${row}`);
          }
      }
      return cells;
  }

  /**
   * Add object to spatial grid
   */
  addToSpatialGrid(id, object) {
    if (!this.spatialGrid) return;

    const cells = this.getCellsForObject(object);

    if (!object.gridCells) {
        object.gridCells = new Set();
    }

    for (const cellKey of cells) {
        if (!this.spatialGrid.has(cellKey)) {
            this.spatialGrid.set(cellKey, new Set());
        }
        this.spatialGrid.get(cellKey).add(id);
        object.gridCells.add(cellKey);
    }
  }

  /**
   * Remove object from spatial grid
   */
  removeFromSpatialGrid(id, object) {
    if (!this.spatialGrid || !object.gridCells) return;

    for (const cellKey of object.gridCells) {
        const cell = this.spatialGrid.get(cellKey);
        if (cell) {
            cell.delete(id);
            if (cell.size === 0) {
                this.spatialGrid.delete(cellKey);
            }
        }
    }
    object.gridCells.clear();
  }

  /**
   * Update object in spatial grid
   */
  updateSpatialGrid(id, object) {
      // This is now redundant as updateCollisionObject handles calling remove/add
      // But we can keep it for explicit grid updating if position wasn't changed via updateCollisionObject
      this.removeFromSpatialGrid(id, object);
      this.addToSpatialGrid(id, object);
  }

  /**
   * Update collision system
   */
  update(deltaTime) {
    this.checkCollisions();
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.collisionObjects.clear();
    if (this.spatialGrid) {
        this.spatialGrid.clear();
        this.spatialGrid = null;
    }
  }
}

export default CollisionDetector;