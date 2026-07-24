/**
 * UIManager.js - User Interface Manager
 *
 * Manages all UI components and updates them based on game state changes.
 * Acts as the central hub for UI interactions and event handling.
 */

import { SettingsUI } from '../ui/SettingsUI.js';

export class UIManager {
  constructor(dependencies = {}) {
    this.eventBus = dependencies.eventBus;
    this.logger = dependencies.logger;
    this.config = dependencies.config;

    if (!this.eventBus) {
      throw new Error('UIManager requires eventBus dependency');
    }
    if (!this.logger) {
      throw new Error('UIManager requires logger dependency');
    }

    // UI Components
    this.components = {
      settings: null,
      hud: null, // Placeholder for HUD
      menu: null, // Placeholder for Main Menu
      gameOver: null, // Placeholder for Game Over Screen
    };

    // State
    this.state = {
      isVisible: true,
      currentScreen: 'game', // 'menu', 'game', 'pause', 'gameOver'
    };

    // Bind methods for event handlers
    this.handleGameStarted = this.handleGameStarted.bind(this);
    this.handleGamePaused = this.handleGamePaused.bind(this);
    this.handleGameResumed = this.handleGameResumed.bind(this);
    this.handleGameStopped = this.handleGameStopped.bind(this);
    this.handleGameOver = this.handleGameOver.bind(this);
    this.handleUIUpdate = this.handleUIUpdate.bind(this);
    this.handleScoreChanged = this.handleScoreChanged.bind(this);
    this.handleLivesUpdated = this.handleLivesUpdated.bind(this);

    this.initialize();
  }

  /**
   * Initialize UI components
   */
  initialize() {
    this.logger.info('Initializing UIManager...');

    // Initialize Settings UI
    this.components.settings = new SettingsUI({
      eventBus: this.eventBus,
      logger: this.logger,
    });

    this.setupEventHandlers();

    this.logger.info('UIManager initialized successfully');
  }

  /**
   * Set up event handlers
   */
  setupEventHandlers() {
    // Game State Events
    this.eventBus.on('game:started', this.handleGameStarted);
    this.eventBus.on('game:paused', this.handleGamePaused);
    this.eventBus.on('game:resumed', this.handleGameResumed);
    this.eventBus.on('game:stopped', this.handleGameStopped);
    this.eventBus.on('game:gameOver', this.handleGameOver);

    // UI Update Events
    this.eventBus.on('ui:update', this.handleUIUpdate);

    // Player Events
    this.eventBus.on('player:scoreChanged', this.handleScoreChanged);
    this.eventBus.on('player:livesUpdated', this.handleLivesUpdated);
  }

  /**
   * Remove event handlers
   */
  removeEventHandlers() {
    this.eventBus.off('game:started', this.handleGameStarted);
    this.eventBus.off('game:paused', this.handleGamePaused);
    this.eventBus.off('game:resumed', this.handleGameResumed);
    this.eventBus.off('game:stopped', this.handleGameStopped);
    this.eventBus.off('game:gameOver', this.handleGameOver);
    this.eventBus.off('ui:update', this.handleUIUpdate);
    this.eventBus.off('player:scoreChanged', this.handleScoreChanged);
    this.eventBus.off('player:livesUpdated', this.handleLivesUpdated);
  }

  /**
   * Update method called every frame
   * @param {number} deltaTime - Time since last frame in milliseconds
   */
  update(deltaTime) {
    // Update animated UI elements
    // For now, we don't have animated elements, but this is where they would go
  }

  /**
   * Handle game started event
   */
  handleGameStarted(data) {
    this.state.currentScreen = 'game';
    this.logger.info('UI: Game started');
    // Initialize HUD values
    // this.updateHUD('score', 0);
  }

  /**
   * Handle game paused event
   */
  handleGamePaused(data) {
    this.state.currentScreen = 'pause';
    this.logger.info('UI: Game paused');
    // Show pause menu
  }

  /**
   * Handle game resumed event
   */
  handleGameResumed(data) {
    this.state.currentScreen = 'game';
    this.logger.info('UI: Game resumed');
    // Hide pause menu
  }

  /**
   * Handle game stopped event
   */
  handleGameStopped(data) {
    this.state.currentScreen = 'menu';
    this.logger.info('UI: Game stopped');
    // Show main menu
  }

  /**
   * Handle game over event
   */
  handleGameOver(data) {
    this.state.currentScreen = 'gameOver';
    this.logger.info('UI: Game Over');
    // Show game over screen
  }

  /**
   * Handle generic UI update event
   */
  handleUIUpdate(data) {
    const { type, payload } = data;
    switch (type) {
      case 'score':
      case 'lives':
      case 'level':
        this.updateHUD(type, payload);
        break;
      default:
        this.logger.debug(`UI: Unknown update type: ${type}`);
    }
  }

  /**
   * Handle score changed event
   */
  handleScoreChanged(data) {
    this.updateHUD('score', data.score);
  }

  /**
   * Handle lives updated event
   */
  handleLivesUpdated(data) {
    this.updateHUD('lives', data.lives);
  }

  /**
   * Update HUD elements
   */
  updateHUD(type, value) {
    // This would update the actual DOM elements or Canvas UI
    this.logger.debug(`UI: Updating HUD - ${type}: ${value}`);
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.removeEventHandlers();

    if (this.components.settings) {
      this.components.settings.cleanup();
    }

    this.logger.info('UIManager cleaned up');
  }
}
