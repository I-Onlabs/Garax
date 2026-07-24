/**
 * ARPGIntegration.js - Complete ARPG System Integration
 *
 * This file integrates all ARPG systems and provides a unified interface:
 * - ARPG UI System with skill trees and character management
 * - Enhanced combat system with hordes and fluid movement
 * - Procedural area generation and exploration
 * - Advanced itemization with random modifiers
 * - Endgame content with replayable maps and PvP
 * - Player-driven economy with trading
 * - Comprehensive error handling and validation
 * - Mobile optimization and touch controls
 * - Performance optimization and monitoring
 */

import { ARPGUISystem } from './systems/ARPGUISystem.js';
import { CombatSystem } from './systems/CombatSystem.js';
import { ProceduralAreaSystem } from './systems/ProceduralAreaSystem.js';
import { ItemizationSystem } from './systems/ItemizationSystem.js';
import { EndgameSystem } from './systems/EndgameSystem.js';
import { TradingSystem } from './systems/TradingSystem.js';
import { ErrorHandlingSystem } from './systems/ErrorHandlingSystem.js';
import { MobileOptimizationSystem } from './systems/MobileOptimizationSystem.js';
import { PerformanceOptimizationSystem } from './systems/PerformanceOptimizationSystem.js';
import { EventBus } from './core/EventBus.js';
import { Logger } from './utils/Logger.js';

export class ARPGIntegration {
  constructor(config = {}) {
    // Validate and normalize config
    this.config = this.validateConfig({
      debug: false,
      enableARPG: true,
      enableCombat: true,
      enableProcedural: true,
      enableItemization: true,
      enableEndgame: true,
      enableTrading: true,
      enableErrorHandling: true,
      enableMobile: true,
      enablePerformance: true,
      ...config,
    });

    // Core systems
    this.eventBus = new EventBus();
    this.logger = new Logger(this.config.debug);

    // ARPG systems
    this.systems = {};
    this.initializeSystems();

    // Game state
    this.gameState = {
      isRunning: false,
      isPaused: false,
      currentArea: null,
      player: null,
      enemies: [],
      items: [],
      activeTrades: [],
      performanceMetrics: {},
      mobileState: {},
      errorCount: 0,
    };

    // Event handlers
    this.setupEventHandlers();

    this.logger.info('ARPGIntegration initialized');
  }

  /**
   * Initialize all ARPG systems
   */
  initializeSystems() {
    const dependencies = {
      eventBus: this.eventBus,
      logger: this.logger,
      config: this.config,
    };

    // Initialize systems based on configuration
    if (this.config.enableErrorHandling) {
      this.systems.errorHandling = new ErrorHandlingSystem(dependencies);
    }

    if (this.config.enablePerformance) {
      this.systems.performance = new PerformanceOptimizationSystem(
        dependencies
      );
    }

    if (this.config.enableMobile) {
      this.systems.mobile = new MobileOptimizationSystem(dependencies);
    }

    if (this.config.enableARPG) {
      this.systems.arpgUI = new ARPGUISystem(dependencies);
    }

    if (this.config.enableCombat) {
      this.systems.combat = new CombatSystem(dependencies);
    }

    if (this.config.enableProcedural) {
      this.systems.procedural = new ProceduralAreaSystem(dependencies);
    }

    if (this.config.enableItemization) {
      this.systems.itemization = new ItemizationSystem(dependencies);
    }

    if (this.config.enableEndgame) {
      this.systems.endgame = new EndgameSystem(dependencies);
    }

    if (this.config.enableTrading) {
      this.systems.trading = new TradingSystem(dependencies);
    }
  }

  /**
   * Validate configuration
   */
  validateConfig(config) {
    const validatedConfig = { ...config };

    // Validate boolean values
    Object.keys(validatedConfig).forEach((key) => {
      if (typeof validatedConfig[key] === 'boolean') {
        validatedConfig[key] = Boolean(validatedConfig[key]);
      }
    });

    return validatedConfig;
  }

  /**
   * Initialize the ARPG integration
   */
  async initialize() {
    this.logger.info('Initializing ARPG Integration...');

    try {
      // Initialize systems in order
      const initOrder = [
        'errorHandling',
        'performance',
        'mobile',
        'arpgUI',
        'combat',
        'procedural',
        'itemization',
        'endgame',
        'trading',
      ];

      for (const systemName of initOrder) {
        if (this.systems[systemName]) {
          await this.systems[systemName].initialize();
          this.logger.info(`${systemName} system initialized`);
        }
      }

      // Set up cross-system communication
      this.setupCrossSystemCommunication();

      this.logger.info('ARPG Integration initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize ARPG Integration:', error);
      throw error;
    }
  }

  /**
   * Set up cross-system communication
   */
  setupCrossSystemCommunication() {
    // Combat and UI integration
    if (this.systems.combat && this.systems.arpgUI) {
      this.eventBus.on('combat:enemyDefeated', (data) => {
        this.systems.arpgUI.handleEnemyDefeated(data);
      });

      this.eventBus.on('combat:playerDamaged', (data) => {
        this.systems.arpgUI.handlePlayerDamaged(data);
      });
    }

    // Itemization and UI integration
    if (this.systems.itemization && this.systems.arpgUI) {
      this.eventBus.on('item:generated', (data) => {
        this.systems.arpgUI.handleItemGenerated(data);
      });

      this.eventBus.on('item:equipped', (data) => {
        this.systems.arpgUI.handleItemEquipped(data);
      });
    }

    // Trading and UI integration
    if (this.systems.trading && this.systems.arpgUI) {
      this.eventBus.on('trade:initiated', (data) => {
        this.systems.arpgUI.handleTradeInitiated(data);
      });

      this.eventBus.on('trade:completed', (data) => {
        this.systems.arpgUI.handleTradeCompleted(data);
      });
    }

    // Procedural areas and combat integration
    if (this.systems.procedural && this.systems.combat) {
      this.eventBus.on('area:generated', (data) => {
        this.systems.combat.handleAreaGenerated(data);
      });

      this.eventBus.on('area:explored', (data) => {
        this.systems.combat.handleAreaExplored(data);
      });
    }

    // Endgame and combat integration
    if (this.systems.endgame && this.systems.combat) {
      this.eventBus.on('boss:spawned', (data) => {
        this.systems.combat.handleBossSpawned(data);
      });

      this.eventBus.on('boss:defeated', (data) => {
        this.systems.combat.handleBossDefeated(data);
      });
    }

    // Performance and all systems integration
    if (this.systems.performance) {
      this.eventBus.on('performance:thresholdExceeded', (data) => {
        this.handlePerformanceThresholdExceeded(data);
      });
    }

    // Error handling and all systems integration
    if (this.systems.errorHandling) {
      this.eventBus.on('error:occurred', (data) => {
        this.handleSystemError(data);
      });
    }
  }

  /**
   * Set up event handlers
   */
  setupEventHandlers() {
    // Game state events
    this.eventBus.on('game:start', this.startGame.bind(this));
    this.eventBus.on('game:pause', this.pauseGame.bind(this));
    this.eventBus.on('game:resume', this.resumeGame.bind(this));
    this.eventBus.on('game:stop', this.stopGame.bind(this));

    // Player events
    this.eventBus.on('player:created', this.handlePlayerCreated.bind(this));
    this.eventBus.on('player:levelUp', this.handlePlayerLevelUp.bind(this));
    this.eventBus.on('player:death', this.handlePlayerDeath.bind(this));

    // System events
    this.eventBus.on('system:error', this.handleSystemError.bind(this));
    this.eventBus.on(
      'system:performance',
      this.handleSystemPerformance.bind(this)
    );
  }

  /**
   * Start the game
   */
  async startGame() {
    if (this.gameState.isRunning) {
      this.logger.warn('Game is already running');
      return;
    }

    try {
      this.logger.info('Starting ARPG game...');

      // Initialize game state
      this.gameState.isRunning = true;
      this.gameState.isPaused = false;
      this.gameState.startTime = Date.now();

      // Start all systems
      for (const [name, system] of Object.entries(this.systems)) {
        if (system.start) {
          await system.start();
        }
      }

      // Start game loop
      this.startGameLoop();

      this.eventBus.emit('game:started', {
        timestamp: this.gameState.startTime,
        systems: Object.keys(this.systems),
      });

      this.logger.info('ARPG game started successfully');
    } catch (error) {
      this.logger.error('Failed to start ARPG game:', error);
      throw error;
    }
  }

  /**
   * Pause the game
   */
  pauseGame() {
    if (!this.gameState.isRunning || this.gameState.isPaused) {
      return;
    }

    this.gameState.isPaused = true;

    // Pause all systems
    for (const [name, system] of Object.entries(this.systems)) {
      if (system.pause) {
        system.pause();
      }
    }

    this.eventBus.emit('game:paused', {
      timestamp: Date.now(),
    });

    this.logger.info('ARPG game paused');
  }

  /**
   * Resume the game
   */
  resumeGame() {
    if (!this.gameState.isRunning || !this.gameState.isPaused) {
      return;
    }

    this.gameState.isPaused = false;

    // Resume all systems
    for (const [name, system] of Object.entries(this.systems)) {
      if (system.resume) {
        system.resume();
      }
    }

    this.eventBus.emit('game:resumed', {
      timestamp: Date.now(),
    });

    this.logger.info('ARPG game resumed');
  }

  /**
   * Stop the game
   */
  stopGame() {
    if (!this.gameState.isRunning) {
      return;
    }

    this.gameState.isRunning = false;
    this.gameState.isPaused = false;

    // Stop all systems
    for (const [name, system] of Object.entries(this.systems)) {
      if (system.stop) {
        system.stop();
      }
    }

    // Stop game loop
    this.stopGameLoop();

    this.eventBus.emit('game:stopped', {
      timestamp: Date.now(),
    });

    this.logger.info('ARPG game stopped');
  }

  /**
   * Start game loop
   */
  startGameLoop() {
    this.gameLoopId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  /**
   * Stop game loop
   */
  stopGameLoop() {
    if (this.gameLoopId) {
      cancelAnimationFrame(this.gameLoopId);
      this.gameLoopId = null;
    }
  }

  /**
   * Main game loop
   */
  gameLoop(currentTime) {
    if (!this.gameState.isRunning || this.gameState.isPaused) {
      return;
    }

    const deltaTime = currentTime - (this.lastUpdateTime || currentTime);
    this.lastUpdateTime = currentTime;

    try {
      // Update all systems
      for (const [name, system] of Object.entries(this.systems)) {
        if (system.update) {
          system.update(deltaTime, this.gameState);
        }
      }

      // Update game state
      this.updateGameState(deltaTime);

      // Continue game loop
      this.gameLoopId = requestAnimationFrame(this.gameLoop.bind(this));
    } catch (error) {
      this.logger.error('Error in game loop:', error);
      this.handleSystemError({ error, context: 'gameLoop' });
    }
  }

  /**
   * Update game state
   */
  updateGameState(deltaTime) {
    // Update performance metrics
    if (this.systems.performance) {
      this.gameState.performanceMetrics =
        this.systems.performance.getPerformanceMetrics();
    }

    // Update mobile state
    if (this.systems.mobile) {
      this.gameState.mobileState = this.systems.mobile.getMobileState();
    }

    // Update error count
    if (this.systems.errorHandling) {
      const errorStats = this.systems.errorHandling.getErrorStatistics();
      this.gameState.errorCount = errorStats.totalErrors;
    }
  }

  /**
   * Handle player created
   */
  handlePlayerCreated(data) {
    this.gameState.player = data.player;
    this.logger.info(`Player created: ${data.player.name}`);
  }

  /**
   * Handle player level up
   */
  handlePlayerLevelUp(data) {
    this.logger.info(`Player leveled up to level ${data.level}`);

    // Notify ARPG UI system
    if (this.systems.arpgUI) {
      this.systems.arpgUI.handlePlayerLevelUp(data);
    }
  }

  /**
   * Handle player death
   */
  handlePlayerDeath(data) {
    this.logger.info('Player died');

    // Notify all systems
    for (const [name, system] of Object.entries(this.systems)) {
      if (system.handlePlayerDeath) {
        system.handlePlayerDeath(data);
      }
    }
  }

  /**
   * Handle system error
   */
  handleSystemError(data) {
    this.logger.error('System error occurred:', data.error);

    // Notify error handling system
    if (this.systems.errorHandling) {
      this.systems.errorHandling.handleError(data);
    }
  }

  /**
   * Handle system performance
   */
  handleSystemPerformance(data) {
    // Update performance metrics
    if (this.systems.performance) {
      this.systems.performance.handlePerformanceMetric(data);
    }
  }

  /**
   * Handle performance threshold exceeded
   */
  handlePerformanceThresholdExceeded(data) {
    this.logger.warn(`Performance threshold exceeded: ${data.threshold}`);

    // Apply performance optimizations
    if (this.systems.performance) {
      this.systems.performance.handlePerformanceThreshold(data);
    }
  }

  /**
   * Get system by name
   */
  getSystem(name) {
    return this.systems[name];
  }

  /**
   * Get game state
   */
  getGameState() {
    return { ...this.gameState };
  }

  /**
   * Get all systems
   */
  getAllSystems() {
    return { ...this.systems };
  }

  /**
   * Get system status
   */
  getSystemStatus() {
    const status = {};

    for (const [name, system] of Object.entries(this.systems)) {
      status[name] = {
        initialized: !!system,
        running: system && system.isRunning ? system.isRunning() : false,
        errorCount: system && system.getErrorCount ? system.getErrorCount() : 0,
        performance:
          system && system.getPerformanceMetrics
            ? system.getPerformanceMetrics()
            : null,
      };
    }

    return status;
  }

  /**
   * Cleanup and destroy
   */
  destroy() {
    this.logger.info('Destroying ARPG Integration...');

    // Stop game
    this.stopGame();

    // Cleanup all systems
    for (const [name, system] of Object.entries(this.systems)) {
      if (system.cleanup) {
        system.cleanup();
      }
    }

    // Clear state
    this.systems = {};
    this.gameState = null;

    // Clear event bus
    this.eventBus.removeAllListeners();

    this.logger.info('ARPG Integration destroyed');
  }
}

export default ARPGIntegration;
