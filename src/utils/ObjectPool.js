/**
 * Generic Object Pool implementation
 */
export class ObjectPool {
  /**
   * @param {Function} factory - Function that creates a new object
   * @param {Function} resetFn - Function that resets an object (optional)
   * @param {number} initialSize - Initial number of objects to create (optional)
   */
  constructor(factory, resetFn = null, initialSize = 0) {
    this.factory = factory;
    this.resetFn = resetFn;
    this.pool = [];

    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.factory());
    }
  }

  /**
   * Get an object from the pool or create a new one
   * @returns {Object}
   */
  acquire() {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    return this.factory();
  }

  /**
   * Return an object to the pool
   * @param {Object} item - The object to release
   */
  release(item) {
    if (this.resetFn) {
      this.resetFn(item);
    }
    this.pool.push(item);
  }

  /**
   * Get the current size of the pool
   * @returns {number}
   */
  get size() {
    return this.pool.length;
  }

  /**
   * Clear the pool
   */
  clear() {
    this.pool = [];
  }
}
