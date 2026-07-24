/**
 * ConfigManager.js - Centralized configuration management
 *
 * This manager handles:
 * - Configuration loading and validation
 * - Environment-specific settings
 * - User preferences
 * - Runtime configuration updates
 * - Configuration persistence
 */

export class ConfigManager {
  constructor() {
    this.config = {};
    this.defaults = {};
    this.validators = new Map();
    this.watchers = new Map();

    // Initialize default configuration
    this.initializeDefaults();

    // Set up configuration validation
    this.setupValidation();
  }

  /**
   * Initialize default configuration
   */
  initializeDefaults() {
    this.defaults = {
      // Game settings
      game: {
        debug: false,
        enableAchievements: true,
        enableDailyChallenges: true,
        enableAccessibility: true,
        maxFPS: 60,
        targetFPS: 60,
        enableVSync: true,
        enableFullscreen: false,
        enableSound: true,
        enableMusic: true,
        masterVolume: 1.0,
        sfxVolume: 0.8,
        musicVolume: 0.6,
      },

      // Graphics settings
      graphics: {
        resolution: 'auto',
        quality: 'high',
        enableShadows: true,
        enableParticles: true,
        enablePostProcessing: true,
        antiAliasing: true,
        textureQuality: 'high',
        renderDistance: 1000,
      },

      // Input settings
      input: {
        mouseSensitivity: 1.0,
        keyboardLayout: 'qwerty',
        enableMouseLook: true,
        enableKeyboardNavigation: true,
        enableGamepad: true,
        invertY: false,
        enableTouchControls: true,
      },

      // Accessibility settings
      accessibility: {
        screenReader: false,
        highContrast: false,
        colorblindMode: 'none',
        keyboardNavigation: false,
        audioCues: true,
        audioDescriptions: false,
        textScaling: 1.0,
        motionReduction: false,
        reducedAnimations: false,
        largeText: false,
        focusIndicators: true,
        enableSubtitles: true,
        subtitleSize: 'medium',
        enableHighDPI: true,
      },

      // Performance settings
      performance: {
        enableProfiling: false,
        enableMetrics: true,
        logLevel: 'info',
        enableCrashReporting: true,
        enableAnalytics: false,
        maxLogHistory: 1000,
        enableMemoryMonitoring: true,
        enableFPSMonitoring: true,
      },

      // Network settings
      network: {
        enableMultiplayer: false,
        serverURL: 'ws://localhost:8080',
        connectionTimeout: 10000,
        enableReconnection: true,
        maxReconnectAttempts: 5,
        enableCompression: true,
      },

      // UI settings
      ui: {
        theme: 'auto',
        language: 'en',
        enableAnimations: true,
        enableTooltips: true,
        enableNotifications: true,
        notificationDuration: 5000,
        enableKeyboardShortcuts: true,
        enableContextMenus: true,
      },
    };
  }

  /**
   * Set up configuration validation
   */
  setupValidation() {
    // Game settings validation
    this.validators.set('game.debug', (value) => typeof value === 'boolean');
    this.validators.set(
      'game.enableAchievements',
      (value) => typeof value === 'boolean'
    );
    this.validators.set(
      'game.enableDailyChallenges',
      (value) => typeof value === 'boolean'
    );
    this.validators.set(
      'game.enableAccessibility',
      (value) => typeof value === 'boolean'
    );
    this.validators.set(
      'game.maxFPS',
      (value) => typeof value === 'number' && value > 0 && value <= 240
    );
    this.validators.set(
      'game.targetFPS',
      (value) => typeof value === 'number' && value > 0 && value <= 240
    );
    this.validators.set(
      'game.masterVolume',
      (value) => typeof value === 'number' && value >= 0 && value <= 1
    );
    this.validators.set(
      'game.sfxVolume',
      (value) => typeof value === 'number' && value >= 0 && value <= 1
    );
    this.validators.set(
      'game.musicVolume',
      (value) => typeof value === 'number' && value >= 0 && value <= 1
    );

    // Graphics settings validation
    this.validators.set(
      'graphics.resolution',
      (value) =>
        typeof value === 'string' &&
        ['auto', '720p', '1080p', '1440p', '4k'].includes(value)
    );
    this.validators.set(
      'graphics.quality',
      (value) =>
        typeof value === 'string' &&
        ['low', 'medium', 'high', 'ultra'].includes(value)
    );
    this.validators.set(
      'graphics.textureQuality',
      (value) =>
        typeof value === 'string' &&
        ['low', 'medium', 'high', 'ultra'].includes(value)
    );

    // Accessibility settings validation
    this.validators.set(
      'accessibility.colorblindMode',
      (value) =>
        typeof value === 'string' &&
        ['none', 'protanopia', 'deuteranopia', 'tritanopia'].includes(value)
    );
    this.validators.set(
      'accessibility.textScaling',
      (value) => typeof value === 'number' && value >= 0.5 && value <= 3.0
    );
    this.validators.set(
      'accessibility.subtitleSize',
      (value) =>
        typeof value === 'string' &&
        ['small', 'medium', 'large', 'extra-large'].includes(value)
    );

    // Performance settings validation
    this.validators.set(
      'performance.logLevel',
      (value) =>
        typeof value === 'string' &&
        ['error', 'warn', 'info', 'debug', 'trace'].includes(value)
    );
    this.validators.set(
      'performance.maxLogHistory',
      (value) => typeof value === 'number' && value > 0 && value <= 10000
    );

    // UI settings validation
    this.validators.set(
      'ui.theme',
      (value) =>
        typeof value === 'string' && ['auto', 'light', 'dark'].includes(value)
    );
    this.validators.set(
      'ui.language',
      (value) => typeof value === 'string' && value.length === 2
    );
    this.validators.set(
      'ui.notificationDuration',
      (value) => typeof value === 'number' && value >= 1000 && value <= 30000
    );
  }

  /**
   * Load configuration from multiple sources
   */
  async load() {
    try {
      // Start with defaults
      this.config = this.deepClone(this.defaults);

      // Load from localStorage
      await this.loadFromStorage();

      // Load from URL parameters
      this.loadFromURL();

      // Load from environment variables
      this.loadFromEnvironment();

      // Validate configuration
      this.validateConfig();

      console.log('Configuration loaded successfully');
    } catch (error) {
      console.error('Failed to load configuration:', error);
      // Fall back to defaults
      this.config = this.deepClone(this.defaults);
    }
  }

  /**
   * Load configuration from localStorage
   */
  async loadFromStorage() {
    try {
      const stored = localStorage.getItem('gameConfig');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.config = this.deepMerge(this.config, parsed);
      }
    } catch (error) {
      console.warn('Failed to load configuration from storage:', error);
    }
  }

  /**
   * Load configuration from URL parameters
   */
  loadFromURL() {
    const urlParams = new URLSearchParams(window.location.search);

    for (const [key, value] of urlParams) {
      const configPath = this.parseConfigPath(key);
      if (configPath) {
        this.setConfigValue(configPath, this.parseConfigValue(value));
      }
    }
  }

  /**
   * Load configuration from environment variables
   */
  loadFromEnvironment() {
    // In a real application, this would load from process.env or similar
    // For now, we'll check for any environment-specific overrides
    if (typeof window !== 'undefined' && window.GAME_CONFIG) {
      this.config = this.deepMerge(this.config, window.GAME_CONFIG);
    }
  }

  /**
   * Parse configuration path from URL parameter
   */
  parseConfigPath(key) {
    // Convert URL parameter names to config paths
    const pathMap = {
      debug: 'game.debug',
      achievements: 'game.enableAchievements',
      challenges: 'game.enableDailyChallenges',
      accessibility: 'game.enableAccessibility',
      fps: 'game.targetFPS',
      volume: 'game.masterVolume',
      quality: 'graphics.quality',
      resolution: 'graphics.resolution',
      theme: 'ui.theme',
      language: 'ui.language',
    };

    return pathMap[key] || null;
  }

  /**
   * Parse configuration value from string
   */
  parseConfigValue(value) {
    // Try to parse as JSON first
    try {
      return JSON.parse(value);
    } catch {
      // If not JSON, try to infer type
      if (value === 'true') return true;
      if (value === 'false') return false;
      if (value === 'null') return null;
      if (!isNaN(value) && !isNaN(parseFloat(value))) {
        return parseFloat(value);
      }
      return value;
    }
  }

  /**
   * Validate configuration
   */
  validateConfig() {
    for (const [path, validator] of this.validators) {
      const value = this.getConfigValue(path);
      if (value !== undefined && !validator(value)) {
        console.warn(`Invalid configuration value for ${path}:`, value);
        // Reset to default
        this.setConfigValue(path, this.getDefaultValue(path));
      }
    }
  }

  /**
   * Get configuration value by path
   */
  getConfigValue(path) {
    return this.getNestedValue(this.config, path);
  }

  /**
   * Set configuration value by path
   */
  setConfigValue(path, value) {
    this.setNestedValue(this.config, path, value);
    this.notifyWatchers(path, value);
  }

  /**
   * Get default value by path
   */
  getDefaultValue(path) {
    return this.getNestedValue(this.defaults, path);
  }

  /**
   * Get nested value from object
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Set nested value in object
   */
  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  /**
   * Watch for configuration changes
   */
  watch(path, callback) {
    if (!this.watchers.has(path)) {
      this.watchers.set(path, []);
    }
    this.watchers.get(path).push(callback);
  }

  /**
   * Unwatch configuration changes
   */
  unwatch(path, callback) {
    if (this.watchers.has(path)) {
      const callbacks = this.watchers.get(path);
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Notify watchers of configuration changes
   */
  notifyWatchers(path, value) {
    if (this.watchers.has(path)) {
      this.watchers.get(path).forEach((callback) => {
        try {
          callback(value, path);
        } catch (error) {
          console.error('Error in configuration watcher:', error);
        }
      });
    }
  }

  /**
   * Save configuration to storage
   */
  async save() {
    try {
      localStorage.setItem('gameConfig', JSON.stringify(this.config));
      console.log('Configuration saved to storage');
    } catch (error) {
      console.error('Failed to save configuration:', error);
    }
  }

  /**
   * Reset configuration to defaults
   */
  reset() {
    this.config = this.deepClone(this.defaults);
    this.notifyWatchers('*', this.config);
    console.log('Configuration reset to defaults');
  }

  /**
   * Get all configuration
   */
  getAll() {
    return this.deepClone(this.config);
  }

  /**
   * Set multiple configuration values
   */
  setMultiple(updates) {
    for (const [path, value] of Object.entries(updates)) {
      this.setConfigValue(path, value);
    }
  }

  /**
   * Deep clone an object
   */
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }

    if (obj instanceof Array) {
      return obj.map((item) => this.deepClone(item));
    }

    const cloned = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = this.deepClone(obj[key]);
      }
    }

    return cloned;
  }

  /**
   * Deep merge two objects
   */
  deepMerge(target, source) {
    const result = { ...target };

    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        if (
          source[key] &&
          typeof source[key] === 'object' &&
          !Array.isArray(source[key])
        ) {
          result[key] = this.deepMerge(target[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }

    return result;
  }

  /**
   * Export configuration
   */
  export() {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * Import configuration
   */
  import(configString) {
    try {
      const imported = JSON.parse(configString);
      this.config = this.deepMerge(this.defaults, imported);
      this.validateConfig();
      this.notifyWatchers('*', this.config);
      console.log('Configuration imported successfully');
    } catch (error) {
      console.error('Failed to import configuration:', error);
      throw error;
    }
  }

  /**
   * Get configuration schema
   */
  getSchema() {
    return {
      game: {
        type: 'object',
        properties: {
          debug: { type: 'boolean', default: false },
          enableAchievements: { type: 'boolean', default: true },
          enableDailyChallenges: { type: 'boolean', default: true },
          enableAccessibility: { type: 'boolean', default: true },
          maxFPS: { type: 'number', minimum: 1, maximum: 240, default: 60 },
          targetFPS: { type: 'number', minimum: 1, maximum: 240, default: 60 },
          masterVolume: {
            type: 'number',
            minimum: 0,
            maximum: 1,
            default: 1.0,
          },
        },
      },
      graphics: {
        type: 'object',
        properties: {
          resolution: {
            type: 'string',
            enum: ['auto', '720p', '1080p', '1440p', '4k'],
            default: 'auto',
          },
          quality: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'ultra'],
            default: 'high',
          },
          textureQuality: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'ultra'],
            default: 'high',
          },
        },
      },
      accessibility: {
        type: 'object',
        properties: {
          screenReader: { type: 'boolean', default: false },
          highContrast: { type: 'boolean', default: false },
          colorblindMode: {
            type: 'string',
            enum: ['none', 'protanopia', 'deuteranopia', 'tritanopia'],
            default: 'none',
          },
          textScaling: {
            type: 'number',
            minimum: 0.5,
            maximum: 3.0,
            default: 1.0,
          },
        },
      },
    };
  }
}

export default ConfigManager;
