/**
 * ErrorHandlingSystem.js - Comprehensive Error Handling and Validation System
 *
 * This system handles:
 * - Global error catching and logging
 * - Input validation and sanitization
 * - Error recovery and fallback mechanisms
 * - Performance monitoring and alerts
 * - User-friendly error messages
 * - Error reporting and analytics
 */

export class ErrorHandlingSystem {
  constructor(dependencies = {}) {
    // Dependency injection
    this.eventBus = dependencies.eventBus;
    this.logger = dependencies.logger;
    this.config = dependencies.config;

    // Validate required dependencies
    if (!this.eventBus) {
      throw new Error('ErrorHandlingSystem requires eventBus dependency');
    }
    if (!this.logger) {
      throw new Error('ErrorHandlingSystem requires logger dependency');
    }

    // Error handling state
    this.errorState = {
      errorCount: 0,
      lastError: null,
      errorHistory: [],
      performanceMetrics: new Map(),
      validationRules: new Map(),
      recoveryStrategies: new Map(),
      userNotifications: new Map(),
      errorThresholds: new Map(),
    };

    // Error handling configuration
    this.errorConfig = {
      maxErrorHistory: 1000,
      errorReportingEnabled: true,
      performanceMonitoringEnabled: true,
      autoRecoveryEnabled: true,
      userNotificationEnabled: true,
      errorThresholds: {
        critical: 5,
        warning: 10,
        info: 50,
      },
      performanceThresholds: {
        memoryUsage: 0.8, // 80%
        cpuUsage: 0.7, // 70%
        frameRate: 30, // FPS
        responseTime: 1000, // ms
      },
    };

    // Initialize error handling
    this.initializeErrorHandling();
    this.initializeValidationRules();
    this.initializeRecoveryStrategies();
    this.initializePerformanceMonitoring();

    // Event handlers
    this.setupEventHandlers();

    this.logger.info('ErrorHandlingSystem initialized');
  }

  /**
   * Initialize the system
   */
  async initialize() {
    this.logger.info('Initializing ErrorHandlingSystem...');

    // Set up global error handlers
    this.setupGlobalErrorHandlers();

    // Start performance monitoring
    this.startPerformanceMonitoring();

    // Load error data
    await this.loadErrorData();

    this.logger.info('ErrorHandlingSystem initialized successfully');
  }

  /**
   * Cleanup the system
   */
  cleanup() {
    this.logger.info('Cleaning up ErrorHandlingSystem...');

    // Save error data
    this.saveErrorData();

    // Stop performance monitoring
    this.stopPerformanceMonitoring();

    // Remove global error handlers
    this.removeGlobalErrorHandlers();

    // Clear state
    this.errorState.errorHistory.clear();
    this.errorState.performanceMetrics.clear();
    this.errorState.validationRules.clear();
    this.errorState.recoveryStrategies.clear();
    this.errorState.userNotifications.clear();
    this.errorState.errorThresholds.clear();

    // Remove event listeners
    this.removeEventHandlers();

    this.logger.info('ErrorHandlingSystem cleaned up');
  }

  /**
   * Update the system
   */
  update(deltaTime, gameState) {
    // Update performance metrics
    this.updatePerformanceMetrics(deltaTime);

    // Check error thresholds
    this.checkErrorThresholds();

    // Process error recovery
    this.processErrorRecovery(deltaTime);

    // Update user notifications
    this.updateUserNotifications(deltaTime);
  }

  /**
   * Initialize error handling
   */
  initializeErrorHandling() {
    // Set up error types
    this.errorTypes = {
      VALIDATION_ERROR: 'validation_error',
      NETWORK_ERROR: 'network_error',
      RUNTIME_ERROR: 'runtime_error',
      PERFORMANCE_ERROR: 'performance_error',
      USER_ERROR: 'user_error',
      SYSTEM_ERROR: 'system_error',
      UNKNOWN_ERROR: 'unknown_error',
    };

    // Set up error severity levels
    this.severityLevels = {
      CRITICAL: 'critical',
      HIGH: 'high',
      MEDIUM: 'medium',
      LOW: 'low',
      INFO: 'info',
    };

    // Set up error categories
    this.errorCategories = {
      INPUT_VALIDATION: 'input_validation',
      API_CALLS: 'api_calls',
      RENDERING: 'rendering',
      GAME_LOGIC: 'game_logic',
      MEMORY_MANAGEMENT: 'memory_management',
      NETWORK_COMMUNICATION: 'network_communication',
      FILE_OPERATIONS: 'file_operations',
      USER_INTERACTION: 'user_interaction',
    };
  }

  /**
   * Initialize validation rules
   */
  initializeValidationRules() {
    // Input validation rules
    this.errorState.validationRules.set('player_name', {
      required: true,
      minLength: 3,
      maxLength: 20,
      pattern: /^[a-zA-Z0-9_]+$/,
      message:
        'Player name must be 3-20 characters long and contain only letters, numbers, and underscores',
    });

    this.errorState.validationRules.set('email', {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address',
    });

    this.errorState.validationRules.set('password', {
      required: true,
      minLength: 8,
      maxLength: 128,
      pattern:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      message:
        'Password must be 8-128 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    });

    this.errorState.validationRules.set('item_id', {
      required: true,
      pattern: /^item_\d+_[a-zA-Z0-9]+$/,
      message: 'Invalid item ID format',
    });

    this.errorState.validationRules.set('trade_amount', {
      required: true,
      min: 1,
      max: 1000000,
      type: 'number',
      message: 'Trade amount must be between 1 and 1,000,000',
    });

    // Game-specific validation rules
    this.errorState.validationRules.set('character_level', {
      required: true,
      min: 1,
      max: 100,
      type: 'number',
      message: 'Character level must be between 1 and 100',
    });

    this.errorState.validationRules.set('skill_points', {
      required: true,
      min: 0,
      max: 1000,
      type: 'number',
      message: 'Skill points must be between 0 and 1000',
    });

    this.errorState.validationRules.set('coordinates', {
      required: true,
      type: 'object',
      properties: {
        x: { type: 'number', min: -10000, max: 10000 },
        y: { type: 'number', min: -10000, max: 10000 },
      },
      message: 'Coordinates must be valid numbers within the game world bounds',
    });
  }

  /**
   * Initialize recovery strategies
   */
  initializeRecoveryStrategies() {
    // Network error recovery
    this.errorState.recoveryStrategies.set('network_error', {
      maxRetries: 3,
      retryDelay: 1000,
      backoffMultiplier: 2,
      fallbackAction: 'offline_mode',
      recoverySteps: [
        'retry_request',
        'check_connection',
        'fallback_to_cached_data',
        'notify_user',
      ],
    });

    // Memory error recovery
    this.errorState.recoveryStrategies.set('memory_error', {
      maxRetries: 1,
      retryDelay: 0,
      fallbackAction: 'cleanup_memory',
      recoverySteps: [
        'clear_cache',
        'garbage_collect',
        'reduce_quality',
        'notify_user',
      ],
    });

    // Rendering error recovery
    this.errorState.recoveryStrategies.set('rendering_error', {
      maxRetries: 2,
      retryDelay: 100,
      fallbackAction: 'fallback_renderer',
      recoverySteps: [
        'retry_render',
        'clear_render_cache',
        'fallback_to_simple_renderer',
        'notify_user',
      ],
    });

    // Game logic error recovery
    this.errorState.recoveryStrategies.set('game_logic_error', {
      maxRetries: 1,
      retryDelay: 0,
      fallbackAction: 'reset_game_state',
      recoverySteps: [
        'validate_game_state',
        'reset_to_last_save',
        'notify_user',
      ],
    });
  }

  /**
   * Initialize performance monitoring
   */
  initializePerformanceMonitoring() {
    this.performanceMetrics = {
      memoryUsage: 0,
      cpuUsage: 0,
      frameRate: 0,
      responseTime: 0,
      errorRate: 0,
      lastUpdate: Date.now(),
    };

    this.performanceHistory = [];
    this.maxPerformanceHistory = 100;
  }

  /**
   * Set up event handlers
   */
  setupEventHandlers() {
    // Error events
    this.eventBus.on('error:occurred', this.handleError.bind(this));
    this.eventBus.on('error:recovered', this.handleErrorRecovery.bind(this));
    this.eventBus.on(
      'error:threshold_exceeded',
      this.handleThresholdExceeded.bind(this)
    );

    // Validation events
    this.eventBus.on(
      'validation:failed',
      this.handleValidationFailure.bind(this)
    );
    this.eventBus.on(
      'validation:passed',
      this.handleValidationSuccess.bind(this)
    );

    // Performance events
    this.eventBus.on(
      'performance:metric',
      this.handlePerformanceMetric.bind(this)
    );
    this.eventBus.on(
      'performance:threshold_exceeded',
      this.handlePerformanceThresholdExceeded.bind(this)
    );

    // Recovery events
    this.eventBus.on('recovery:started', this.handleRecoveryStarted.bind(this));
    this.eventBus.on(
      'recovery:completed',
      this.handleRecoveryCompleted.bind(this)
    );
    this.eventBus.on('recovery:failed', this.handleRecoveryFailed.bind(this));
  }

  /**
   * Remove event handlers
   */
  removeEventHandlers() {
    this.eventBus.removeListener('error:occurred', this.handleError.bind(this));
    this.eventBus.removeListener(
      'error:recovered',
      this.handleErrorRecovery.bind(this)
    );
    this.eventBus.removeListener(
      'error:threshold_exceeded',
      this.handleThresholdExceeded.bind(this)
    );
    this.eventBus.removeListener(
      'validation:failed',
      this.handleValidationFailure.bind(this)
    );
    this.eventBus.removeListener(
      'validation:passed',
      this.handleValidationSuccess.bind(this)
    );
    this.eventBus.removeListener(
      'performance:metric',
      this.handlePerformanceMetric.bind(this)
    );
    this.eventBus.removeListener(
      'performance:threshold_exceeded',
      this.handlePerformanceThresholdExceeded.bind(this)
    );
    this.eventBus.removeListener(
      'recovery:started',
      this.handleRecoveryStarted.bind(this)
    );
    this.eventBus.removeListener(
      'recovery:completed',
      this.handleRecoveryCompleted.bind(this)
    );
    this.eventBus.removeListener(
      'recovery:failed',
      this.handleRecoveryFailed.bind(this)
    );
  }

  /**
   * Set up global error handlers
   */
  setupGlobalErrorHandlers() {
    // Window error handler
    window.addEventListener('error', (event) => {
      this.handleGlobalError(
        event.error,
        event.filename,
        event.lineno,
        event.colno
      );
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.handleUnhandledRejection(event.reason, event.promise);
    });

    // Console error override
    const originalConsoleError = console.error;
    console.error = (...args) => {
      this.handleConsoleError(args);
      originalConsoleError.apply(console, args);
    };
  }

  /**
   * Remove global error handlers
   */
  removeGlobalErrorHandlers() {
    // Remove event listeners
    window.removeEventListener('error', this.handleGlobalError);
    window.removeEventListener(
      'unhandledrejection',
      this.handleUnhandledRejection
    );
  }

  /**
   * Handle error
   */
  handleError(data) {
    const { error, context, severity, category } = data;

    // Create error record
    const errorRecord = this.createErrorRecord(
      error,
      context,
      severity,
      category
    );

    // Add to error history
    this.addToErrorHistory(errorRecord);

    // Update error count
    this.errorState.errorCount++;
    this.errorState.lastError = errorRecord;

    // Log error
    this.logError(errorRecord);

    // Attempt recovery
    this.attemptRecovery(errorRecord);

    // Notify user if necessary
    this.notifyUser(errorRecord);

    // Report error if enabled
    if (this.errorConfig.errorReportingEnabled) {
      this.reportError(errorRecord);
    }
  }

  /**
   * Handle global error
   */
  handleGlobalError(error, filename, lineno, colno) {
    const errorRecord = {
      type: this.errorTypes.RUNTIME_ERROR,
      severity: this.severityLevels.HIGH,
      category: this.errorCategories.RENDERING,
      message: error.message || 'Unknown error',
      stack: error.stack,
      filename: filename,
      line: lineno,
      column: colno,
      timestamp: Date.now(),
      context: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: Date.now(),
      },
    };

    this.handleError({ error: errorRecord });
  }

  /**
   * Handle unhandled rejection
   */
  handleUnhandledRejection(reason, promise) {
    const errorRecord = {
      type: this.errorTypes.RUNTIME_ERROR,
      severity: this.severityLevels.MEDIUM,
      category: this.errorCategories.API_CALLS,
      message: reason.message || 'Unhandled promise rejection',
      stack: reason.stack,
      promise: promise,
      timestamp: Date.now(),
      context: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: Date.now(),
      },
    };

    this.handleError({ error: errorRecord });
  }

  /**
   * Handle console error
   */
  handleConsoleError(args) {
    const errorRecord = {
      type: this.errorTypes.RUNTIME_ERROR,
      severity: this.severityLevels.LOW,
      category: this.errorCategories.GAME_LOGIC,
      message: args.join(' '),
      timestamp: Date.now(),
      context: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: Date.now(),
      },
    };

    this.handleError({ error: errorRecord });
  }

  /**
   * Create error record
   */
  createErrorRecord(error, context, severity, category) {
    return {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: error.type || this.errorTypes.UNKNOWN_ERROR,
      severity: severity || this.severityLevels.MEDIUM,
      category: category || this.errorCategories.GAME_LOGIC,
      message: error.message || 'Unknown error',
      stack: error.stack,
      context: context || {},
      timestamp: Date.now(),
      resolved: false,
      recoveryAttempts: 0,
    };
  }

  /**
   * Add to error history
   */
  addToErrorHistory(errorRecord) {
    this.errorState.errorHistory.push(errorRecord);

    // Keep only the most recent errors
    if (
      this.errorState.errorHistory.length > this.errorConfig.maxErrorHistory
    ) {
      this.errorState.errorHistory = this.errorState.errorHistory.slice(
        -this.errorConfig.maxErrorHistory
      );
    }
  }

  /**
   * Log error
   */
  logError(errorRecord) {
    const logLevel = this.getLogLevel(errorRecord.severity);
    const logMessage = this.formatErrorMessage(errorRecord);

    switch (logLevel) {
      case 'error':
        this.logger.error(logMessage);
        break;
      case 'warn':
        this.logger.warn(logMessage);
        break;
      case 'info':
        this.logger.info(logMessage);
        break;
      default:
        this.logger.log(logMessage);
    }
  }

  /**
   * Get log level
   */
  getLogLevel(severity) {
    const levelMap = {
      [this.severityLevels.CRITICAL]: 'error',
      [this.severityLevels.HIGH]: 'error',
      [this.severityLevels.MEDIUM]: 'warn',
      [this.severityLevels.LOW]: 'info',
      [this.severityLevels.INFO]: 'info',
    };

    return levelMap[severity] || 'log';
  }

  /**
   * Format error message
   */
  formatErrorMessage(errorRecord) {
    return `[${errorRecord.type}] ${errorRecord.message} (${errorRecord.category})`;
  }

  /**
   * Attempt recovery
   */
  attemptRecovery(errorRecord) {
    if (!this.errorConfig.autoRecoveryEnabled) {
      return;
    }

    const strategy = this.errorState.recoveryStrategies.get(errorRecord.type);
    if (!strategy) {
      return;
    }

    if (errorRecord.recoveryAttempts >= strategy.maxRetries) {
      this.logger.warn(
        `Max recovery attempts reached for error ${errorRecord.id}`
      );
      return;
    }

    errorRecord.recoveryAttempts++;

    // Execute recovery steps
    this.executeRecoverySteps(errorRecord, strategy);
  }

  /**
   * Execute recovery steps
   */
  executeRecoverySteps(errorRecord, strategy) {
    strategy.recoverySteps.forEach((step, index) => {
      setTimeout(() => {
        this.executeRecoveryStep(errorRecord, step);
      }, index * strategy.retryDelay);
    });
  }

  /**
   * Execute recovery step
   */
  executeRecoveryStep(errorRecord, step) {
    switch (step) {
      case 'retry_request':
        this.retryRequest(errorRecord);
        break;
      case 'check_connection':
        this.checkConnection(errorRecord);
        break;
      case 'fallback_to_cached_data':
        this.fallbackToCachedData(errorRecord);
        break;
      case 'clear_cache':
        this.clearCache(errorRecord);
        break;
      case 'garbage_collect':
        this.garbageCollect(errorRecord);
        break;
      case 'reduce_quality':
        this.reduceQuality(errorRecord);
        break;
      case 'retry_render':
        this.retryRender(errorRecord);
        break;
      case 'clear_render_cache':
        this.clearRenderCache(errorRecord);
        break;
      case 'fallback_to_simple_renderer':
        this.fallbackToSimpleRenderer(errorRecord);
        break;
      case 'validate_game_state':
        this.validateGameState(errorRecord);
        break;
      case 'reset_to_last_save':
        this.resetToLastSave(errorRecord);
        break;
      case 'notify_user':
        this.notifyUser(errorRecord);
        break;
    }
  }

  /**
   * Notify user
   */
  notifyUser(errorRecord) {
    if (!this.errorConfig.userNotificationEnabled) {
      return;
    }

    const notification = this.createUserNotification(errorRecord);
    this.errorState.userNotifications.set(notification.id, notification);

    this.eventBus.emit('error:userNotification', {
      notification,
      timestamp: Date.now(),
    });
  }

  /**
   * Create user notification
   */
  createUserNotification(errorRecord) {
    return {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'error',
      severity: errorRecord.severity,
      title: this.getUserFriendlyTitle(errorRecord),
      message: this.getUserFriendlyMessage(errorRecord),
      timestamp: Date.now(),
      dismissed: false,
      actionRequired: this.isActionRequired(errorRecord),
    };
  }

  /**
   * Get user-friendly title
   */
  getUserFriendlyTitle(errorRecord) {
    const titleMap = {
      [this.errorTypes.VALIDATION_ERROR]: 'Input Error',
      [this.errorTypes.NETWORK_ERROR]: 'Connection Error',
      [this.errorTypes.RUNTIME_ERROR]: 'Application Error',
      [this.errorTypes.PERFORMANCE_ERROR]: 'Performance Issue',
      [this.errorTypes.USER_ERROR]: 'User Error',
      [this.errorTypes.SYSTEM_ERROR]: 'System Error',
      [this.errorTypes.UNKNOWN_ERROR]: 'Unknown Error',
    };

    return titleMap[errorRecord.type] || 'Error';
  }

  /**
   * Get user-friendly message
   */
  getUserFriendlyMessage(errorRecord) {
    const messageMap = {
      [this.errorTypes.VALIDATION_ERROR]:
        'Please check your input and try again.',
      [this.errorTypes.NETWORK_ERROR]:
        'Please check your internet connection and try again.',
      [this.errorTypes.RUNTIME_ERROR]:
        'An unexpected error occurred. Please refresh the page.',
      [this.errorTypes.PERFORMANCE_ERROR]:
        'The application is running slowly. Please try refreshing the page.',
      [this.errorTypes.USER_ERROR]: 'Please check your input and try again.',
      [this.errorTypes.SYSTEM_ERROR]:
        'A system error occurred. Please try again later.',
      [this.errorTypes.UNKNOWN_ERROR]:
        'An unknown error occurred. Please try again.',
    };

    return (
      messageMap[errorRecord.type] || 'An error occurred. Please try again.'
    );
  }

  /**
   * Check if action is required
   */
  isActionRequired(errorRecord) {
    return (
      errorRecord.severity === this.severityLevels.CRITICAL ||
      errorRecord.severity === this.severityLevels.HIGH
    );
  }

  /**
   * Validate input
   */
  validateInput(input, ruleName, value) {
    const rule = this.errorState.validationRules.get(ruleName);
    if (!rule) {
      this.logger.warn(`Validation rule not found: ${ruleName}`);
      return { valid: true };
    }

    const result = this.performValidation(value, rule);

    if (result.valid) {
      this.eventBus.emit('validation:passed', {
        ruleName,
        value,
        timestamp: Date.now(),
      });
    } else {
      this.eventBus.emit('validation:failed', {
        ruleName,
        value,
        errors: result.errors,
        timestamp: Date.now(),
      });
    }

    return result;
  }

  /**
   * Perform validation
   */
  performValidation(value, rule) {
    const errors = [];

    // Check required
    if (
      rule.required &&
      (value === null || value === undefined || value === '')
    ) {
      errors.push('This field is required');
      return { valid: false, errors };
    }

    // Check type
    if (rule.type && typeof value !== rule.type) {
      errors.push(`Expected ${rule.type}, got ${typeof value}`);
      return { valid: false, errors };
    }

    // Check min/max length
    if (rule.minLength && value.length < rule.minLength) {
      errors.push(`Minimum length is ${rule.minLength}`);
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      errors.push(`Maximum length is ${rule.maxLength}`);
    }

    // Check min/max value
    if (rule.min !== undefined && value < rule.min) {
      errors.push(`Minimum value is ${rule.min}`);
    }

    if (rule.max !== undefined && value > rule.max) {
      errors.push(`Maximum value is ${rule.max}`);
    }

    // Check pattern
    if (rule.pattern && !rule.pattern.test(value)) {
      errors.push(rule.message || 'Invalid format');
    }

    // Check object properties
    if (rule.properties && typeof value === 'object') {
      for (const [prop, propRule] of Object.entries(rule.properties)) {
        const propResult = this.performValidation(value[prop], propRule);
        if (!propResult.valid) {
          errors.push(`${prop}: ${propResult.errors.join(', ')}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : [rule.message || 'Invalid value'],
    };
  }

  /**
   * Update performance metrics
   */
  updatePerformanceMetrics(deltaTime) {
    if (!this.errorConfig.performanceMonitoringEnabled) {
      return;
    }

    // Update memory usage
    if (performance.memory) {
      this.performanceMetrics.memoryUsage =
        performance.memory.usedJSHeapSize / performance.memory.totalJSHeapSize;
    }

    // Update frame rate
    this.performanceMetrics.frameRate = 1000 / deltaTime;

    // Update response time
    this.performanceMetrics.responseTime = deltaTime;

    // Update error rate
    this.performanceMetrics.errorRate =
      (this.errorState.errorCount /
        (Date.now() - this.performanceMetrics.lastUpdate)) *
      1000;

    this.performanceMetrics.lastUpdate = Date.now();

    // Add to history
    this.performanceHistory.push({
      ...this.performanceMetrics,
      timestamp: Date.now(),
    });

    // Keep only recent history
    if (this.performanceHistory.length > this.maxPerformanceHistory) {
      this.performanceHistory = this.performanceHistory.slice(
        -this.maxPerformanceHistory
      );
    }

    // Check performance thresholds
    this.checkPerformanceThresholds();
  }

  /**
   * Check performance thresholds
   */
  checkPerformanceThresholds() {
    const thresholds = this.errorConfig.performanceThresholds;

    if (this.performanceMetrics.memoryUsage > thresholds.memoryUsage) {
      this.handlePerformanceThresholdExceeded(
        'memory',
        this.performanceMetrics.memoryUsage
      );
    }

    if (this.performanceMetrics.cpuUsage > thresholds.cpuUsage) {
      this.handlePerformanceThresholdExceeded(
        'cpu',
        this.performanceMetrics.cpuUsage
      );
    }

    if (this.performanceMetrics.frameRate < thresholds.frameRate) {
      this.handlePerformanceThresholdExceeded(
        'frameRate',
        this.performanceMetrics.frameRate
      );
    }

    if (this.performanceMetrics.responseTime > thresholds.responseTime) {
      this.handlePerformanceThresholdExceeded(
        'responseTime',
        this.performanceMetrics.responseTime
      );
    }
  }

  /**
   * Check error thresholds
   */
  checkErrorThresholds() {
    const thresholds = this.errorConfig.errorThresholds;

    if (this.errorState.errorCount > thresholds.critical) {
      this.handleThresholdExceeded('critical', this.errorState.errorCount);
    } else if (this.errorState.errorCount > thresholds.warning) {
      this.handleThresholdExceeded('warning', this.errorState.errorCount);
    } else if (this.errorState.errorCount > thresholds.info) {
      this.handleThresholdExceeded('info', this.errorState.errorCount);
    }
  }

  /**
   * Process error recovery
   */
  processErrorRecovery(deltaTime) {
    // Process pending recoveries
    for (const [errorId, errorRecord] of this.errorState.errorHistory) {
      if (!errorRecord.resolved && errorRecord.recoveryAttempts > 0) {
        // Check if recovery is complete
        this.checkRecoveryStatus(errorRecord);
      }
    }
  }

  /**
   * Update user notifications
   */
  updateUserNotifications(deltaTime) {
    const now = Date.now();

    for (const [notificationId, notification] of this.errorState
      .userNotifications) {
      // Auto-dismiss old notifications
      if (now - notification.timestamp > 30000) {
        // 30 seconds
        notification.dismissed = true;
      }
    }
  }

  /**
   * Start performance monitoring
   */
  startPerformanceMonitoring() {
    if (!this.errorConfig.performanceMonitoringEnabled) {
      return;
    }

    this.performanceTimer = setInterval(() => {
      this.updatePerformanceMetrics(16); // Assume 60 FPS
    }, 1000); // Update every second
  }

  /**
   * Stop performance monitoring
   */
  stopPerformanceMonitoring() {
    if (this.performanceTimer) {
      clearInterval(this.performanceTimer);
    }
  }

  /**
   * Handle error recovery
   */
  handleErrorRecovery(data) {
    const { errorId, success } = data;

    const errorRecord = this.errorState.errorHistory.find(
      (e) => e.id === errorId
    );
    if (errorRecord) {
      errorRecord.resolved = success;
      errorRecord.recoveryCompletedAt = Date.now();
    }
  }

  /**
   * Handle threshold exceeded
   */
  handleThresholdExceeded(data) {
    const { threshold, value } = data;

    this.logger.warn(`Error threshold exceeded: ${threshold} (${value})`);

    this.eventBus.emit('error:threshold_exceeded', {
      threshold,
      value,
      timestamp: Date.now(),
    });
  }

  /**
   * Handle validation failure
   */
  handleValidationFailure(data) {
    const { ruleName, value, errors } = data;

    this.logger.warn(`Validation failed for ${ruleName}: ${errors.join(', ')}`);
  }

  /**
   * Handle validation success
   */
  handleValidationSuccess(data) {
    const { ruleName, value } = data;

    this.logger.debug(`Validation passed for ${ruleName}`);
  }

  /**
   * Handle performance metric
   */
  handlePerformanceMetric(data) {
    const { metric, value } = data;

    this.performanceMetrics[metric] = value;
  }

  /**
   * Handle performance threshold exceeded
   */
  handlePerformanceThresholdExceeded(metric, value) {
    this.logger.warn(`Performance threshold exceeded: ${metric} (${value})`);

    this.eventBus.emit('performance:threshold_exceeded', {
      metric,
      value,
      timestamp: Date.now(),
    });
  }

  /**
   * Handle recovery started
   */
  handleRecoveryStarted(data) {
    const { errorId, strategy } = data;

    this.logger.info(
      `Recovery started for error ${errorId} using strategy ${strategy}`
    );
  }

  /**
   * Handle recovery completed
   */
  handleRecoveryCompleted(data) {
    const { errorId, success } = data;

    this.logger.info(
      `Recovery completed for error ${errorId}: ${success ? 'success' : 'failed'}`
    );
  }

  /**
   * Handle recovery failed
   */
  handleRecoveryFailed(data) {
    const { errorId, reason } = data;

    this.logger.error(`Recovery failed for error ${errorId}: ${reason}`);
  }

  /**
   * Load error data
   */
  async loadErrorData() {
    try {
      const savedData = localStorage.getItem('errorData');
      if (savedData) {
        const data = JSON.parse(savedData);
        this.errorState.errorCount = data.errorCount || 0;
        this.errorState.errorHistory = data.errorHistory || [];
        this.logger.info('Error data loaded from storage');
      }
    } catch (error) {
      this.logger.error('Failed to load error data:', error);
    }
  }

  /**
   * Save error data
   */
  saveErrorData() {
    try {
      const data = {
        errorCount: this.errorState.errorCount,
        errorHistory: this.errorState.errorHistory.slice(-100), // Keep only recent errors
        timestamp: Date.now(),
      };
      localStorage.setItem('errorData', JSON.stringify(data));
      this.logger.info('Error data saved to storage');
    } catch (error) {
      this.logger.error('Failed to save error data:', error);
    }
  }

  /**
   * Get error statistics
   */
  getErrorStatistics() {
    const stats = {
      totalErrors: this.errorState.errorCount,
      errorsByType: {},
      errorsBySeverity: {},
      errorsByCategory: {},
      recentErrors: this.errorState.errorHistory.slice(-10),
      performanceMetrics: this.performanceMetrics,
    };

    // Count errors by type
    this.errorState.errorHistory.forEach((error) => {
      stats.errorsByType[error.type] =
        (stats.errorsByType[error.type] || 0) + 1;
      stats.errorsBySeverity[error.severity] =
        (stats.errorsBySeverity[error.severity] || 0) + 1;
      stats.errorsByCategory[error.category] =
        (stats.errorsByCategory[error.category] || 0) + 1;
    });

    return stats;
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return {
      current: this.performanceMetrics,
      history: this.performanceHistory,
      thresholds: this.errorConfig.performanceThresholds,
    };
  }

  /**
   * Get user notifications
   */
  getUserNotifications() {
    return Array.from(this.errorState.userNotifications.values()).filter(
      (notification) => !notification.dismissed
    );
  }

  /**
   * Dismiss notification
   */
  dismissNotification(notificationId) {
    const notification = this.errorState.userNotifications.get(notificationId);
    if (notification) {
      notification.dismissed = true;
    }
  }

  /**
   * Clear error history
   */
  clearErrorHistory() {
    this.errorState.errorHistory = [];
    this.errorState.errorCount = 0;
    this.logger.info('Error history cleared');
  }

  /**
   * Reset performance metrics
   */
  resetPerformanceMetrics() {
    this.performanceMetrics = {
      memoryUsage: 0,
      cpuUsage: 0,
      frameRate: 0,
      responseTime: 0,
      errorRate: 0,
      lastUpdate: Date.now(),
    };
    this.performanceHistory = [];
    this.logger.info('Performance metrics reset');
  }
}

export default ErrorHandlingSystem;
