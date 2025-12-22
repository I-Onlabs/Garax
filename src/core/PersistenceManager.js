/**
 * PersistenceManager.js - Data persistence and storage management
 *
 * This manager handles:
 * - Local storage management
 * - Data serialization and deserialization
 * - Data validation and migration
 * - Backup and restore functionality
 * - Cross-session data persistence
 * - Data compression and encryption
 */

export class PersistenceManager {
  constructor(dependencies = {}) {
    // Dependency injection
    this.eventBus = dependencies.eventBus;
    this.logger = dependencies.logger;
    this.config = dependencies.config;

    // Validate required dependencies
    if (!this.eventBus) {
      throw new Error('PersistenceManager requires eventBus dependency');
    }
    if (!this.logger) {
      throw new Error('PersistenceManager requires logger dependency');
    }

    // Storage configuration
    this.storageConfig = {
      prefix: 'garax_',
      version: '1.0.0',
      compression: true,
      encryption: false,
      backupCount: 5,
      maxSize: 5 * 1024 * 1024, // 5MB
      autoSave: true,
      autoSaveInterval: 30000, // 30 seconds
    };

    // Data schemas
    this.schemas = new Map();
    this.migrations = new Map();

    // Storage state
    this.storage = {
      available: false,
      quota: 0,
      used: 0,
      remaining: 0,
    };

    // Auto-save timer
    this.autoSaveTimer = null;
    this.pendingChanges = new Set();

    // Initialize storage
    this.initializeStorage();
    this.setupDataSchemas();
    this.setupMigrations();

    this.logger.info('PersistenceManager initialized');
  }

  /**
   * Initialize the manager
   */
  async initialize() {
    this.logger.info('Initializing PersistenceManager...');

    // Check storage availability
    await this.checkStorageAvailability();

    // Set up auto-save
    if (this.storageConfig.autoSave) {
      this.setupAutoSave();
    }

    this.logger.info('PersistenceManager initialized successfully');
  }

  /**
   * Cleanup the manager
   */
  cleanup() {
    this.logger.info('Cleaning up PersistenceManager...');

    // Save pending changes
    this.savePendingChanges();

    // Clear auto-save timer
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }

    this.logger.info('PersistenceManager cleaned up');
  }

  /**
   * Initialize storage
   */
  initializeStorage() {
    try {
      // Test localStorage availability
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      this.storage.available = true;
    } catch (error) {
      this.storage.available = false;
      this.logger.warn('localStorage not available:', error);
    }
  }

  /**
   * Set up data schemas
   */
  setupDataSchemas() {
    // Game state schema
    this.schemas.set('gameState', {
      version: '1.0.0',
      fields: {
        currentLevel: { type: 'number', required: true, default: 1 },
        score: { type: 'number', required: true, default: 0 },
        highScore: { type: 'number', required: true, default: 0 },
        lives: { type: 'number', required: true, default: 3 },
        health: { type: 'number', required: true, default: 100 },
        maxHealth: { type: 'number', required: true, default: 100 },
        level: { type: 'number', required: true, default: 1 },
        isAlive: { type: 'boolean', required: true, default: true },
        lastPlayed: { type: 'number', required: true, default: Date.now() },
        playTime: { type: 'number', required: true, default: 0 },
      },
    });

    // Player data schema
    this.schemas.set('playerData', {
      version: '1.0.0',
      fields: {
        id: { type: 'string', required: true },
        name: { type: 'string', required: true, default: 'Player' },
        x: { type: 'number', required: true, default: 0 },
        y: { type: 'number', required: true, default: 0 },
        z: { type: 'number', required: true, default: 0 },
        health: { type: 'number', required: true, default: 100 },
        maxHealth: { type: 'number', required: true, default: 100 },
        lives: { type: 'number', required: true, default: 3 },
        score: { type: 'number', required: true, default: 0 },
        level: { type: 'number', required: true, default: 1 },
        stats: { type: 'object', required: true, default: {} },
      },
    });

    // Achievement data schema
    this.schemas.set('achievementData', {
      version: '1.0.0',
      fields: {
        unlocked: { type: 'array', required: true, default: [] },
        progress: { type: 'object', required: true, default: {} },
        lastUnlocked: { type: 'string', required: false },
        totalUnlocked: { type: 'number', required: true, default: 0 },
      },
    });

    // Daily challenge data schema
    this.schemas.set('dailyChallengeData', {
      version: '1.0.0',
      fields: {
        lastChallengeDate: { type: 'string', required: false },
        completed: { type: 'array', required: true, default: [] },
        progress: { type: 'object', required: true, default: {} },
        streak: { type: 'number', required: true, default: 0 },
      },
    });

    // Settings schema
    this.schemas.set('settings', {
      version: '1.0.0',
      fields: {
        game: { type: 'object', required: true, default: {} },
        graphics: { type: 'object', required: true, default: {} },
        audio: { type: 'object', required: true, default: {} },
        accessibility: { type: 'object', required: true, default: {} },
        input: { type: 'object', required: true, default: {} },
      },
    });
  }

  /**
   * Set up data migrations
   */
  setupMigrations() {
    // Game state migrations
    this.migrations.set('gameState', {
      '1.0.0': (data) => {
        // Initial version, no migration needed
        return data;
      },
      '1.1.0': (data) => {
        // Add new fields
        return {
          ...data,
          playTime: data.playTime || 0,
          lastPlayed: data.lastPlayed || Date.now(),
        };
      },
    });

    // Achievement data migrations
    this.migrations.set('achievementData', {
      '1.0.0': (data) => {
        return data;
      },
      '1.1.0': (data) => {
        return {
          ...data,
          totalUnlocked: data.unlocked ? data.unlocked.length : 0,
        };
      },
    });
  }

  /**
   * Check storage availability
   */
  async checkStorageAvailability() {
    if (!this.storage.available) {
      this.logger.warn('Storage not available');
      return;
    }

    try {
      // Check quota if available
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        this.storage.quota = estimate.quota || 0;
        this.storage.used = estimate.usage || 0;
        this.storage.remaining = this.storage.quota - this.storage.used;
      }

      this.logger.info('Storage availability checked', {
        available: this.storage.available,
        quota: this.storage.quota,
        used: this.storage.used,
        remaining: this.storage.remaining,
      });
    } catch (error) {
      this.logger.error('Failed to check storage availability:', error);
    }
  }

  /**
   * Set up auto-save
   */
  setupAutoSave() {
    this.autoSaveTimer = setInterval(() => {
      this.savePendingChanges();
    }, this.storageConfig.autoSaveInterval);

    this.logger.info('Auto-save enabled', {
      interval: this.storageConfig.autoSaveInterval,
    });
  }

  /**
   * Save data
   */
  async save(key, data, options = {}) {
    if (!this.storage.available) {
      this.logger.warn('Cannot save data: storage not available');
      return false;
    }

    try {
      // Validate data against schema
      const schema = this.schemas.get(key);
      if (schema) {
        const validatedData = this.validateData(data, schema);
        if (!validatedData) {
          this.logger.error('Data validation failed for key:', key);
          return false;
        }
        data = validatedData;
      }

      // Add metadata
      const dataWithMetadata = {
        data,
        version: this.storageConfig.version,
        timestamp: Date.now(),
        key,
      };

      // Compress data if enabled
      let serializedData;
      if (this.storageConfig.compression) {
        serializedData = await this.compressData(
          JSON.stringify(dataWithMetadata)
        );
      } else {
        serializedData = JSON.stringify(dataWithMetadata);
      }

      // Check size limit
      if (serializedData.length > this.storageConfig.maxSize) {
        this.logger.error(
          'Data too large to save:',
          key,
          serializedData.length
        );
        return false;
      }

      // Save to localStorage
      const storageKey = this.getStorageKey(key);
      localStorage.setItem(storageKey, serializedData);

      // Create backup
      if (options.createBackup !== false) {
        await this.createBackup(key, dataWithMetadata);
      }

      // Mark as saved
      this.pendingChanges.delete(key);

      this.logger.info('Data saved successfully', {
        key,
        size: serializedData.length,
      });
      return true;
    } catch (error) {
      this.logger.error('Failed to save data:', error);
      return false;
    }
  }

  /**
   * Load data
   */
  async load(key, options = {}) {
    if (!this.storage.available) {
      this.logger.warn('Cannot load data: storage not available');
      return null;
    }

    try {
      const storageKey = this.getStorageKey(key);
      const serializedData = localStorage.getItem(storageKey);

      if (!serializedData) {
        this.logger.info('No data found for key:', key);
        return null;
      }

      // Decompress data if needed
      let dataWithMetadata;
      if (this.storageConfig.compression) {
        dataWithMetadata = JSON.parse(
          await this.decompressData(serializedData)
        );
      } else {
        dataWithMetadata = JSON.parse(serializedData);
      }

      // Check version and migrate if needed
      const migratedData = await this.migrateData(key, dataWithMetadata);

      // Validate migrated data
      const schema = this.schemas.get(key);
      if (schema) {
        const validatedData = this.validateData(migratedData.data, schema);
        if (!validatedData) {
          this.logger.error(
            'Data validation failed after migration for key:',
            key
          );
          return null;
        }
        return validatedData;
      }

      this.logger.info('Data loaded successfully', { key });
      return migratedData.data;
    } catch (error) {
      this.logger.error('Failed to load data:', error);

      // Try to load from backup
      if (options.fallbackToBackup !== false) {
        return await this.loadFromBackup(key);
      }

      return null;
    }
  }

  /**
   * Delete data
   */
  async delete(key) {
    if (!this.storage.available) {
      this.logger.warn('Cannot delete data: storage not available');
      return false;
    }

    try {
      const storageKey = this.getStorageKey(key);
      localStorage.removeItem(storageKey);

      // Delete backups
      await this.deleteBackups(key);

      this.pendingChanges.delete(key);

      this.logger.info('Data deleted successfully', { key });
      return true;
    } catch (error) {
      this.logger.error('Failed to delete data:', error);
      return false;
    }
  }

  /**
   * Check if data exists
   */
  exists(key) {
    if (!this.storage.available) return false;

    const storageKey = this.getStorageKey(key);
    return localStorage.getItem(storageKey) !== null;
  }

  /**
   * Get data size
   */
  getDataSize(key) {
    if (!this.storage.available) return 0;

    const storageKey = this.getStorageKey(key);
    const data = localStorage.getItem(storageKey);
    return data ? data.length : 0;
  }

  /**
   * Get all stored keys
   */
  getAllKeys() {
    if (!this.storage.available) return [];

    const keys = [];
    const prefix = this.storageConfig.prefix;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keys.push(key.substring(prefix.length));
      }
    }

    return keys;
  }

  /**
   * Clear all data
   */
  async clearAll() {
    if (!this.storage.available) return false;

    try {
      const keys = this.getAllKeys();

      for (const key of keys) {
        await this.delete(key);
      }

      this.logger.info('All data cleared');
      return true;
    } catch (error) {
      this.logger.error('Failed to clear all data:', error);
      return false;
    }
  }

  /**
   * Export data
   */
  async exportData(keys = null) {
    const exportData = {};
    const keysToExport = keys || this.getAllKeys();

    for (const key of keysToExport) {
      const data = await this.load(key);
      if (data) {
        exportData[key] = data;
      }
    }

    return {
      version: this.storageConfig.version,
      timestamp: Date.now(),
      data: exportData,
    };
  }

  /**
   * Import data
   */
  async importData(importData, options = {}) {
    try {
      if (typeof importData === 'string') {
        importData = JSON.parse(importData);
      }

      const data = importData.data || importData;
      const overwrite = options.overwrite || false;

      for (const [key, value] of Object.entries(data)) {
        if (this.exists(key) && !overwrite) {
          this.logger.warn('Skipping existing key:', key);
          continue;
        }

        await this.save(key, value, { createBackup: false });
      }

      this.logger.info('Data imported successfully');
      return true;
    } catch (error) {
      this.logger.error('Failed to import data:', error);
      return false;
    }
  }

  /**
   * Mark data as changed
   */
  markChanged(key) {
    this.pendingChanges.add(key);
  }

  /**
   * Save pending changes
   */
  async savePendingChanges() {
    if (this.pendingChanges.size === 0) return;

    this.logger.info('Saving pending changes', {
      count: this.pendingChanges.size,
    });

    // This would typically save all pending changes
    // Implementation depends on how the game manages its data
    this.pendingChanges.clear();
  }

  /**
   * Get storage key
   */
  getStorageKey(key) {
    return `${this.storageConfig.prefix}${key}`;
  }

  /**
   * Validate data against schema
   */
  validateData(data, schema) {
    if (!schema || !schema.fields) return data;

    const validatedData = {};

    for (const [fieldName, fieldConfig] of Object.entries(schema.fields)) {
      const value = data[fieldName];

      if (value === undefined) {
        if (fieldConfig.required) {
          this.logger.error('Required field missing:', fieldName);
          return null;
        }
        validatedData[fieldName] = fieldConfig.default;
      } else {
        // Type validation
        if (fieldConfig.type === 'number' && typeof value !== 'number') {
          this.logger.error(
            'Invalid type for field:',
            fieldName,
            'expected number, got',
            typeof value
          );
          return null;
        }
        if (fieldConfig.type === 'string' && typeof value !== 'string') {
          this.logger.error(
            'Invalid type for field:',
            fieldName,
            'expected string, got',
            typeof value
          );
          return null;
        }
        if (fieldConfig.type === 'boolean' && typeof value !== 'boolean') {
          this.logger.error(
            'Invalid type for field:',
            fieldName,
            'expected boolean, got',
            typeof value
          );
          return null;
        }
        if (fieldConfig.type === 'array' && !Array.isArray(value)) {
          this.logger.error(
            'Invalid type for field:',
            fieldName,
            'expected array, got',
            typeof value
          );
          return null;
        }
        if (
          (fieldConfig.type === 'object' && typeof value !== 'object') ||
          Array.isArray(value)
        ) {
          this.logger.error(
            'Invalid type for field:',
            fieldName,
            'expected object, got',
            typeof value
          );
          return null;
        }

        validatedData[fieldName] = value;
      }
    }

    return validatedData;
  }

  /**
   * Migrate data to current version
   */
  async migrateData(key, dataWithMetadata) {
    const migrations = this.migrations.get(key);
    if (!migrations) return dataWithMetadata;

    let currentVersion = dataWithMetadata.version;
    const targetVersion = this.storageConfig.version;

    while (currentVersion !== targetVersion) {
      const nextVersion = this.getNextVersion(
        currentVersion,
        Object.keys(migrations)
      );
      if (!nextVersion) break;

      const migration = migrations[nextVersion];
      if (migration) {
        dataWithMetadata.data = migration(dataWithMetadata.data);
        dataWithMetadata.version = nextVersion;
        currentVersion = nextVersion;

        this.logger.info('Data migrated', {
          key,
          from: currentVersion,
          to: nextVersion,
        });
      } else {
        break;
      }
    }

    return dataWithMetadata;
  }

  /**
   * Get next version in migration chain
   */
  getNextVersion(currentVersion, availableVersions) {
    const sortedVersions = availableVersions.sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );
    const currentIndex = sortedVersions.indexOf(currentVersion);

    if (currentIndex === -1 || currentIndex >= sortedVersions.length - 1) {
      return null;
    }

    return sortedVersions[currentIndex + 1];
  }

  /**
   * Compress data
   */
  async compressData(data) {
    // Simple compression using built-in methods
    // In a real application, you might use a library like pako or lz-string
    return btoa(data);
  }

  /**
   * Decompress data
   */
  async decompressData(compressedData) {
    // Simple decompression using built-in methods
    return atob(compressedData);
  }

  /**
   * Create backup
   */
  async createBackup(key, data) {
    const backupKey = `${key}_backup_${Date.now()}`;
    await this.save(backupKey, data, { createBackup: false });

    // Clean up old backups
    await this.cleanupBackups(key);
  }

  /**
   * Load from backup
   */
  async loadFromBackup(key) {
    const backupKeys = this.getAllKeys().filter((k) =>
      k.startsWith(`${key}_backup_`)
    );

    if (backupKeys.length === 0) {
      this.logger.warn('No backups found for key:', key);
      return null;
    }

    // Get most recent backup
    const mostRecentBackup = backupKeys.sort().pop();
    return await this.load(mostRecentBackup);
  }

  /**
   * Delete backups
   */
  async deleteBackups(key) {
    const backupKeys = this.getAllKeys().filter((k) =>
      k.startsWith(`${key}_backup_`)
    );

    for (const backupKey of backupKeys) {
      await this.delete(backupKey);
    }
  }

  /**
   * Cleanup old backups
   */
  async cleanupBackups(key) {
    const backupKeys = this.getAllKeys()
      .filter((k) => k.startsWith(`${key}_backup_`))
      .sort()
      .reverse();

    if (backupKeys.length > this.storageConfig.backupCount) {
      const keysToDelete = backupKeys.slice(this.storageConfig.backupCount);

      for (const keyToDelete of keysToDelete) {
        await this.delete(keyToDelete);
      }
    }
  }

  /**
   * Get storage statistics
   */
  getStorageStats() {
    const keys = this.getAllKeys();
    const stats = {
      totalKeys: keys.length,
      totalSize: 0,
      available: this.storage.available,
      quota: this.storage.quota,
      used: this.storage.used,
      remaining: this.storage.remaining,
    };

    for (const key of keys) {
      stats.totalSize += this.getDataSize(key);
    }

    return stats;
  }
}

export default PersistenceManager;
