/**
 * Logger.js - Centralized logging system
 *
 * This class provides:
 * - Multiple log levels
 * - Log filtering and formatting
 * - Performance monitoring
 * - Log persistence
 * - Debug utilities
 */

export class Logger {
  constructor(debugMode = false) {
    this.debugMode = debugMode;
    this.logLevel = debugMode ? 'debug' : 'info';
    this.logHistory = [];
    this.maxHistorySize = 1000;
    this.performanceMetrics = {
      totalLogs: 0,
      logsByLevel: new Map(),
      averageLogTime: 0,
    };

    // Log levels
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
      trace: 4,
    };

    // Initialize performance monitoring
    this.startTime = Date.now();
  }

  /**
   * Set log level
   */
  setLevel(level) {
    if (Object.prototype.hasOwnProperty.call(this.levels, level)) {
      this.logLevel = level;
    } else {
      this.warn(`Invalid log level: ${level}`);
    }
  }

  /**
   * Enable debug mode
   */
  enableDebug() {
    this.debugMode = true;
    this.setLevel('debug');
  }

  /**
   * Disable debug mode
   */
  disableDebug() {
    this.debugMode = false;
    this.setLevel('info');
  }

  /**
   * Check if log level should be processed
   */
  shouldLog(level) {
    return this.levels[level] <= this.levels[this.logLevel];
  }

  /**
   * Log a message
   */
  log(level, message, data = null, context = null) {
    if (!this.shouldLog(level)) {
      return;
    }

    const timestamp = Date.now();
    const logEntry = {
      level,
      message,
      data,
      context,
      timestamp,
      id: this.generateLogId(),
    };

    // Add to history
    this.addToHistory(logEntry);

    // Update performance metrics
    this.updatePerformanceMetrics(level);

    // Format and output log
    this.outputLog(logEntry);
  }

  /**
   * Add log entry to history
   */
  addToHistory(logEntry) {
    this.logHistory.push(logEntry);

    // Maintain history size limit
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }
  }

  /**
   * Update performance metrics
   */
  updatePerformanceMetrics(level) {
    this.performanceMetrics.totalLogs++;

    const count = this.performanceMetrics.logsByLevel.get(level) || 0;
    this.performanceMetrics.logsByLevel.set(level, count + 1);

    // Update average log time
    const totalTime =
      this.performanceMetrics.averageLogTime *
      (this.performanceMetrics.totalLogs - 1);
    this.performanceMetrics.averageLogTime =
      (totalTime + 1) / this.performanceMetrics.totalLogs;
  }

  /**
   * Output log to console
   */
  outputLog(logEntry) {
    const { level, message, data, context, timestamp } = logEntry;
    const timeString = new Date(timestamp).toISOString();
    const contextString = context ? `[${context}]` : '';
    const prefix = `[${timeString}] ${level.toUpperCase()}${contextString}`;

    switch (level) {
      case 'error':
        console.error(prefix, message, data || '');
        break;
      case 'warn':
        console.warn(prefix, message, data || '');
        break;
      case 'info':
        console.info(prefix, message, data || '');
        break;
      case 'debug':
        console.debug(prefix, message, data || '');
        break;
      case 'trace':
        console.trace(prefix, message, data || '');
        break;
      default:
        console.log(prefix, message, data || '');
    }
  }

  /**
   * Generate unique log ID
   */
  generateLogId() {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Error level logging
   */
  error(message, data = null, context = null) {
    this.log('error', message, data, context);
  }

  /**
   * Warning level logging
   */
  warn(message, data = null, context = null) {
    this.log('warn', message, data, context);
  }

  /**
   * Info level logging
   */
  info(message, data = null, context = null) {
    this.log('info', message, data, context);
  }

  /**
   * Debug level logging
   */
  debug(message, data = null, context = null) {
    this.log('debug', message, data, context);
  }

  /**
   * Trace level logging
   */
  trace(message, data = null, context = null) {
    this.log('trace', message, data, context);
  }

  /**
   * Log performance metrics
   */
  performance(operation, startTime, endTime = null) {
    const duration = (endTime || performance.now()) - startTime;
    this.debug(`Performance: ${operation} took ${duration.toFixed(2)}ms`);
    return duration;
  }

  /**
   * Log memory usage
   */
  memory() {
    if (performance.memory) {
      const memory = performance.memory;
      this.debug('Memory usage:', {
        used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`,
        total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`,
        limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB`,
      });
    }
  }

  /**
   * Log function execution
   */
  function(name, fn, context = null) {
    const startTime = performance.now();
    this.debug(`Function started: ${name}`, null, context);

    try {
      const result = fn();
      const duration = this.performance(name, startTime);
      this.debug(`Function completed: ${name}`, { duration }, context);
      return result;
    } catch (error) {
      const duration = this.performance(name, startTime);
      this.error(
        `Function failed: ${name}`,
        { error: error.message, duration },
        context
      );
      throw error;
    }
  }

  /**
   * Log async function execution
   */
  async functionAsync(name, fn, context = null) {
    const startTime = performance.now();
    this.debug(`Async function started: ${name}`, null, context);

    try {
      const result = await fn();
      const duration = this.performance(name, startTime);
      this.debug(`Async function completed: ${name}`, { duration }, context);
      return result;
    } catch (error) {
      const duration = this.performance(name, startTime);
      this.error(
        `Async function failed: ${name}`,
        { error: error.message, duration },
        context
      );
      throw error;
    }
  }

  /**
   * Log event
   */
  event(eventName, data = null, context = null) {
    this.debug(`Event: ${eventName}`, data, context);
  }

  /**
   * Log state change
   */
  stateChange(from, to, data = null, context = null) {
    this.info(`State changed: ${from} -> ${to}`, data, context);
  }

  /**
   * Log user action
   */
  userAction(action, data = null, context = null) {
    this.info(`User action: ${action}`, data, context);
  }

  /**
   * Log API call
   */
  apiCall(method, url, data = null, context = null) {
    this.debug(`API call: ${method} ${url}`, data, context);
  }

  /**
   * Log API response
   */
  apiResponse(method, url, status, data = null, context = null) {
    const level = status >= 400 ? 'error' : 'debug';
    this.log(
      level,
      `API response: ${method} ${url} - ${status}`,
      data,
      context
    );
  }

  /**
   * Log error with stack trace
   */
  errorWithStack(message, error, context = null) {
    this.error(
      message,
      {
        error: error.message,
        stack: error.stack,
      },
      context
    );
  }

  /**
   * Log group of related messages
   */
  group(name, fn, context = null) {
    const startTime = performance.now();
    this.debug(`Group started: ${name}`, null, context);

    try {
      const result = fn();
      const duration = this.performance(name, startTime);
      this.debug(`Group completed: ${name}`, { duration }, context);
      return result;
    } catch (error) {
      const duration = this.performance(name, startTime);
      this.error(
        `Group failed: ${name}`,
        { error: error.message, duration },
        context
      );
      throw error;
    }
  }

  /**
   * Log async group of related messages
   */
  async groupAsync(name, fn, context = null) {
    const startTime = performance.now();
    this.debug(`Async group started: ${name}`, null, context);

    try {
      const result = await fn();
      const duration = this.performance(name, startTime);
      this.debug(`Async group completed: ${name}`, { duration }, context);
      return result;
    } catch (error) {
      const duration = this.performance(name, startTime);
      this.error(
        `Async group failed: ${name}`,
        { error: error.message, duration },
        context
      );
      throw error;
    }
  }

  /**
   * Get log history
   */
  getHistory(filter = {}) {
    let history = [...this.logHistory];

    if (filter.level) {
      history = history.filter((entry) => entry.level === filter.level);
    }

    if (filter.context) {
      history = history.filter((entry) => entry.context === filter.context);
    }

    if (filter.since) {
      history = history.filter((entry) => entry.timestamp >= filter.since);
    }

    if (filter.until) {
      history = history.filter((entry) => entry.timestamp <= filter.until);
    }

    if (filter.limit) {
      history = history.slice(-filter.limit);
    }

    return history;
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      logsByLevel: Object.fromEntries(this.performanceMetrics.logsByLevel),
      uptime: Date.now() - this.startTime,
    };
  }

  /**
   * Clear log history
   */
  clearHistory() {
    this.logHistory = [];
    this.debug('Log history cleared');
  }

  /**
   * Reset performance metrics
   */
  resetMetrics() {
    this.performanceMetrics = {
      totalLogs: 0,
      logsByLevel: new Map(),
      averageLogTime: 0,
    };
    this.startTime = Date.now();
    this.debug('Performance metrics reset');
  }

  /**
   * Export logs to JSON
   */
  exportLogs(filter = {}) {
    const history = this.getHistory(filter);
    return JSON.stringify(history, null, 2);
  }

  /**
   * Import logs from JSON
   */
  importLogs(jsonString) {
    try {
      const logs = JSON.parse(jsonString);
      if (Array.isArray(logs)) {
        this.logHistory = logs;
        this.debug(`Imported ${logs.length} log entries`);
      }
    } catch (error) {
      this.error('Failed to import logs:', error);
    }
  }

  /**
   * Create a child logger with context
   */
  child(context) {
    const childLogger = new Logger(this.debugMode);
    childLogger.logLevel = this.logLevel;
    childLogger.context = context;
    return childLogger;
  }
}

export default Logger;
