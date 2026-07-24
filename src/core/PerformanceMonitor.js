/**
 * PerformanceMonitor.js - Comprehensive performance monitoring and optimization system
 *
 * This monitor handles:
 * - FPS monitoring and frame time analysis
 * - Memory usage tracking and leak detection
 * - Audio context performance monitoring
 * - Rendering performance analysis
 * - Input lag measurement
 * - Network performance tracking
 * - Performance bottleneck identification
 * - Automatic optimization suggestions
 */

export class PerformanceMonitor {
  constructor(dependencies = {}) {
    // Dependency injection
    this.eventBus = dependencies.eventBus;
    this.logger = dependencies.logger;
    this.config = dependencies.config;

    // Validate required dependencies
    if (!this.eventBus) {
      throw new Error('PerformanceMonitor requires eventBus dependency');
    }
    if (!this.logger) {
      throw new Error('PerformanceMonitor requires logger dependency');
    }

    // Performance configuration
    this.config = {
      enableFPSMonitoring: true,
      enableMemoryMonitoring: true,
      enableAudioMonitoring: true,
      enableRenderingMonitoring: true,
      enableInputMonitoring: true,
      enableNetworkMonitoring: true,
      enableAutoOptimization: true,
      fpsTarget: 60,
      fpsWarningThreshold: 45,
      fpsCriticalThreshold: 30,
      memoryWarningThreshold: 100 * 1024 * 1024, // 100MB
      memoryCriticalThreshold: 200 * 1024 * 1024, // 200MB
      frameTimeWarningThreshold: 16.67, // 60fps = 16.67ms per frame
      frameTimeCriticalThreshold: 33.33, // 30fps = 33.33ms per frame
      reportInterval: 5000, // Report every 5 seconds
      maxHistorySize: 1000,
      ...dependencies.config,
    };

    // Performance metrics
    this.metrics = {
      fps: {
        current: 0,
        average: 0,
        min: Infinity,
        max: 0,
        history: [],
        droppedFrames: 0,
      },
      frameTime: {
        current: 0,
        average: 0,
        min: Infinity,
        max: 0,
        history: [],
      },
      memory: {
        used: 0,
        total: 0,
        available: 0,
        history: [],
        leakDetected: false,
        leakCount: 0,
      },
      audio: {
        contextState: 'suspended',
        contextRecreations: 0,
        bufferUnderruns: 0,
        latency: 0,
        performanceScore: 0,
      },
      rendering: {
        drawCalls: 0,
        triangles: 0,
        textures: 0,
        shaders: 0,
        batchCount: 0,
        cullingTime: 0,
        lightingTime: 0,
        postProcessingTime: 0,
      },
      input: {
        lag: 0,
        eventCount: 0,
        droppedEvents: 0,
        averageResponseTime: 0,
      },
      network: {
        latency: 0,
        bandwidth: 0,
        packetLoss: 0,
        connectionQuality: 'good',
      },
    };

    // Performance state
    this.isMonitoring = false;
    this.lastFrameTime = 0;
    this.frameCount = 0;
    this.lastReportTime = 0;
    this.optimizationSuggestions = [];
    this.performanceAlerts = [];

    // Performance observers
    this.observers = {
      fps: null,
      memory: null,
      audio: null,
      rendering: null,
      input: null,
      network: null,
    };

    // Set up performance monitoring
    this.setupPerformanceMonitoring();
    this.setupEventHandlers();

    this.logger.info('PerformanceMonitor initialized');
  }

  /**
   * Initialize the monitor
   */
  async initialize() {
    this.logger.info('Initializing PerformanceMonitor...');

    // Start monitoring if enabled
    if (this.config.enableFPSMonitoring || this.config.enableMemoryMonitoring) {
      this.startMonitoring();
    }

    this.logger.info('PerformanceMonitor initialized successfully');
  }

  /**
   * Cleanup the monitor
   */
  cleanup() {
    this.logger.info('Cleaning up PerformanceMonitor...');

    // Stop monitoring
    this.stopMonitoring();

    // Disconnect observers
    this.disconnectObservers();

    this.logger.info('PerformanceMonitor cleaned up');
  }

  /**
   * Set up performance monitoring
   */
  setupPerformanceMonitoring() {
    // Set up FPS monitoring
    if (this.config.enableFPSMonitoring) {
      this.setupFPSMonitoring();
    }

    // Set up memory monitoring
    if (this.config.enableMemoryMonitoring) {
      this.setupMemoryMonitoring();
    }

    // Set up audio monitoring
    if (this.config.enableAudioMonitoring) {
      this.setupAudioMonitoring();
    }

    // Set up rendering monitoring
    if (this.config.enableRenderingMonitoring) {
      this.setupRenderingMonitoring();
    }

    // Set up input monitoring
    if (this.config.enableInputMonitoring) {
      this.setupInputMonitoring();
    }

    // Set up network monitoring
    if (this.config.enableNetworkMonitoring) {
      this.setupNetworkMonitoring();
    }
  }

  /**
   * Set up event handlers
   */
  setupEventHandlers() {
    // Game events
    this.eventBus.on('game:started', this.handleGameStarted.bind(this));
    this.eventBus.on('game:paused', this.handleGamePaused.bind(this));
    this.eventBus.on('game:resumed', this.handleGameResumed.bind(this));
    this.eventBus.on('game:stopped', this.handleGameStopped.bind(this));

    // Performance events
    this.eventBus.on('performance:frame', this.handleFrame.bind(this));
    this.eventBus.on('performance:memory', this.handleMemoryUpdate.bind(this));
    this.eventBus.on('performance:audio', this.handleAudioUpdate.bind(this));
    this.eventBus.on(
      'performance:rendering',
      this.handleRenderingUpdate.bind(this)
    );
    this.eventBus.on('performance:input', this.handleInputUpdate.bind(this));
    this.eventBus.on(
      'performance:network',
      this.handleNetworkUpdate.bind(this)
    );
  }

  /**
   * Set up FPS monitoring
   */
  setupFPSMonitoring() {
    this.lastFrameTime = performance.now();
    this.frameCount = 0;

    const measureFPS = (currentTime) => {
      if (!this.isMonitoring) return;

      const deltaTime = currentTime - this.lastFrameTime;
      this.lastFrameTime = currentTime;

      // Calculate FPS
      const fps = 1000 / deltaTime;
      this.updateFPSMetrics(fps, deltaTime);

      // Continue monitoring
      requestAnimationFrame(measureFPS);
    };

    this.observers.fps = measureFPS;
  }

  /**
   * Set up memory monitoring
   */
  setupMemoryMonitoring() {
    if (!performance.memory) {
      this.logger.warn('Performance.memory API not available');
      return;
    }

    const measureMemory = () => {
      if (!this.isMonitoring) return;

      const memory = performance.memory;
      this.updateMemoryMetrics(memory);

      // Check for memory leaks
      this.detectMemoryLeaks();

      // Continue monitoring
      setTimeout(measureMemory, 1000);
    };

    this.observers.memory = measureMemory;
  }

  /**
   * Set up audio monitoring
   */
  setupAudioMonitoring() {
    // Monitor audio context state
    const measureAudio = () => {
      if (!this.isMonitoring) return;

      // Check for audio context recreations
      this.checkAudioContextHealth();

      // Continue monitoring
      setTimeout(measureAudio, 2000);
    };

    this.observers.audio = measureAudio;
  }

  /**
   * Set up rendering monitoring
   */
  setupRenderingMonitoring() {
    // This would integrate with the rendering system
    // For now, we'll set up basic monitoring
    const measureRendering = () => {
      if (!this.isMonitoring) return;

      // Monitor rendering performance
      this.updateRenderingMetrics();

      // Continue monitoring
      requestAnimationFrame(measureRendering);
    };

    this.observers.rendering = measureRendering;
  }

  /**
   * Set up input monitoring
   */
  setupInputMonitoring() {
    let inputEventCount = 0;
    let lastInputTime = 0;

    const measureInput = (event) => {
      if (!this.isMonitoring) return;

      const currentTime = performance.now();
      const responseTime = currentTime - lastInputTime;

      inputEventCount++;
      this.updateInputMetrics(responseTime);

      lastInputTime = currentTime;
    };

    // Listen for input events
    document.addEventListener('keydown', measureInput);
    document.addEventListener('mousedown', measureInput);
    document.addEventListener('touchstart', measureInput);

    this.observers.input = measureInput;
  }

  /**
   * Set up network monitoring
   */
  setupNetworkMonitoring() {
    const measureNetwork = () => {
      if (!this.isMonitoring) return;

      // Monitor network performance
      this.updateNetworkMetrics();

      // Continue monitoring
      setTimeout(measureNetwork, 5000);
    };

    this.observers.network = measureNetwork;
  }

  /**
   * Start monitoring
   */
  startMonitoring() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.lastReportTime = performance.now();

    // Start FPS monitoring
    if (this.observers.fps) {
      requestAnimationFrame(this.observers.fps);
    }

    // Start other monitoring
    if (this.observers.memory) {
      this.observers.memory();
    }
    if (this.observers.audio) {
      this.observers.audio();
    }
    if (this.observers.rendering) {
      requestAnimationFrame(this.observers.rendering);
    }
    if (this.observers.network) {
      this.observers.network();
    }

    this.logger.info('Performance monitoring started');
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;

    this.logger.info('Performance monitoring stopped');
  }

  /**
   * Disconnect observers
   */
  disconnectObservers() {
    // Remove input event listeners
    if (this.observers.input) {
      document.removeEventListener('keydown', this.observers.input);
      document.removeEventListener('mousedown', this.observers.input);
      document.removeEventListener('touchstart', this.observers.input);
    }
  }

  /**
   * Update FPS metrics
   */
  updateFPSMetrics(fps, frameTime) {
    this.metrics.fps.current = fps;
    this.metrics.fps.history.push(fps);
    this.metrics.fps.min = Math.min(this.metrics.fps.min, fps);
    this.metrics.fps.max = Math.max(this.metrics.fps.max, fps);

    // Calculate average FPS
    if (this.metrics.fps.history.length > 0) {
      this.metrics.fps.average =
        this.metrics.fps.history.reduce((a, b) => a + b, 0) /
        this.metrics.fps.history.length;
    }

    // Update frame time metrics
    this.metrics.frameTime.current = frameTime;
    this.metrics.frameTime.history.push(frameTime);
    this.metrics.frameTime.min = Math.min(
      this.metrics.frameTime.min,
      frameTime
    );
    this.metrics.frameTime.max = Math.max(
      this.metrics.frameTime.max,
      frameTime
    );

    if (this.metrics.frameTime.history.length > 0) {
      this.metrics.frameTime.average =
        this.metrics.frameTime.history.reduce((a, b) => a + b, 0) /
        this.metrics.frameTime.history.length;
    }

    // Check for dropped frames
    if (frameTime > this.config.frameTimeCriticalThreshold) {
      this.metrics.fps.droppedFrames++;
    }

    // Maintain history size
    if (this.metrics.fps.history.length > this.config.maxHistorySize) {
      this.metrics.fps.history.shift();
      this.metrics.frameTime.history.shift();
    }

    // Check for performance issues
    this.checkFPSPerformance();
  }

  /**
   * Update memory metrics
   */
  updateMemoryMetrics(memory) {
    this.metrics.memory.used = memory.usedJSHeapSize;
    this.metrics.memory.total = memory.totalJSHeapSize;
    this.metrics.memory.available =
      memory.jsHeapSizeLimit - memory.usedJSHeapSize;

    this.metrics.memory.history.push({
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      timestamp: performance.now(),
    });

    // Maintain history size
    if (this.metrics.memory.history.length > this.config.maxHistorySize) {
      this.metrics.memory.history.shift();
    }

    // Check for memory issues
    this.checkMemoryPerformance();
  }

  /**
   * Update audio metrics
   */
  updateAudioMetrics(audioData) {
    this.metrics.audio = { ...this.metrics.audio, ...audioData };

    // Check for audio performance issues
    this.checkAudioPerformance();
  }

  /**
   * Update rendering metrics
   */
  updateRenderingMetrics() {
    // This would be populated by the rendering system
    // For now, we'll use placeholder values
    this.metrics.rendering.drawCalls = 0;
    this.metrics.rendering.triangles = 0;
    this.metrics.rendering.textures = 0;
    this.metrics.rendering.shaders = 0;
  }

  /**
   * Update input metrics
   */
  updateInputMetrics(responseTime) {
    this.metrics.input.eventCount++;
    this.metrics.input.lag = responseTime;

    // Calculate average response time
    if (this.metrics.input.eventCount > 0) {
      this.metrics.input.averageResponseTime =
        (this.metrics.input.averageResponseTime *
          (this.metrics.input.eventCount - 1) +
          responseTime) /
        this.metrics.input.eventCount;
    }

    // Check for input performance issues
    this.checkInputPerformance();
  }

  /**
   * Update network metrics
   */
  updateNetworkMetrics() {
    // This would integrate with network monitoring
    // For now, we'll use placeholder values
    this.metrics.network.latency = 0;
    this.metrics.network.bandwidth = 0;
    this.metrics.network.packetLoss = 0;
    this.metrics.network.connectionQuality = 'good';
  }

  /**
   * Check FPS performance
   */
  checkFPSPerformance() {
    const fps = this.metrics.fps.current;
    const frameTime = this.metrics.frameTime.current;

    if (fps < this.config.fpsCriticalThreshold) {
      this.addPerformanceAlert('critical', 'FPS critically low', {
        fps,
        threshold: this.config.fpsCriticalThreshold,
      });
      this.suggestOptimization(
        'fps',
        'Consider reducing graphics quality or disabling non-essential features'
      );
    } else if (fps < this.config.fpsWarningThreshold) {
      this.addPerformanceAlert('warning', 'FPS below target', {
        fps,
        threshold: this.config.fpsWarningThreshold,
      });
    }

    if (frameTime > this.config.frameTimeCriticalThreshold) {
      this.addPerformanceAlert('critical', 'Frame time too high', {
        frameTime,
        threshold: this.config.frameTimeCriticalThreshold,
      });
    } else if (frameTime > this.config.frameTimeWarningThreshold) {
      this.addPerformanceAlert('warning', 'Frame time above target', {
        frameTime,
        threshold: this.config.frameTimeWarningThreshold,
      });
    }
  }

  /**
   * Check memory performance
   */
  checkMemoryPerformance() {
    const used = this.metrics.memory.used;

    if (used > this.config.memoryCriticalThreshold) {
      this.addPerformanceAlert('critical', 'Memory usage critically high', {
        used,
        threshold: this.config.memoryCriticalThreshold,
      });
      this.suggestOptimization(
        'memory',
        'Consider reducing texture quality or clearing unused assets'
      );
    } else if (used > this.config.memoryWarningThreshold) {
      this.addPerformanceAlert('warning', 'Memory usage high', {
        used,
        threshold: this.config.memoryWarningThreshold,
      });
    }
  }

  /**
   * Check audio performance
   */
  checkAudioPerformance() {
    if (this.metrics.audio.contextRecreations > 5) {
      this.addPerformanceAlert(
        'warning',
        'Audio context recreated multiple times',
        { recreations: this.metrics.audio.contextRecreations }
      );
      this.suggestOptimization(
        'audio',
        'Consider implementing audio context pooling or lazy initialization'
      );
    }

    if (this.metrics.audio.bufferUnderruns > 10) {
      this.addPerformanceAlert('warning', 'Audio buffer underruns detected', {
        underruns: this.metrics.audio.bufferUnderruns,
      });
    }
  }

  /**
   * Check input performance
   */
  checkInputPerformance() {
    const lag = this.metrics.input.lag;

    if (lag > 100) {
      this.addPerformanceAlert('warning', 'Input lag detected', { lag });
      this.suggestOptimization(
        'input',
        'Consider optimizing input handling or reducing input processing overhead'
      );
    }
  }

  /**
   * Detect memory leaks
   */
  detectMemoryLeaks() {
    const history = this.metrics.memory.history;
    if (history.length < 10) return;

    // Check if memory usage is consistently increasing
    const recent = history.slice(-10);
    const isIncreasing = recent.every((entry, index) => {
      if (index === 0) return true;
      return entry.used > recent[index - 1].used;
    });

    if (isIncreasing) {
      this.metrics.memory.leakDetected = true;
      this.metrics.memory.leakCount++;
      this.addPerformanceAlert('warning', 'Potential memory leak detected', {
        leakCount: this.metrics.memory.leakCount,
      });
      this.suggestOptimization(
        'memory',
        'Check for circular references or unremoved event listeners'
      );
    }
  }

  /**
   * Check audio context health
   */
  checkAudioContextHealth() {
    // This would check the actual audio context state
    // For now, we'll simulate the check
    const contextState = 'running'; // This would be the actual context state

    if (contextState !== this.metrics.audio.contextState) {
      if (
        this.metrics.audio.contextState === 'suspended' &&
        contextState === 'running'
      ) {
        this.metrics.audio.contextRecreations++;
        this.addPerformanceAlert('info', 'Audio context recreated', {
          recreations: this.metrics.audio.contextRecreations,
        });
      }
      this.metrics.audio.contextState = contextState;
    }
  }

  /**
   * Add performance alert
   */
  addPerformanceAlert(level, message, data) {
    const alert = {
      level,
      message,
      data,
      timestamp: performance.now(),
    };

    this.performanceAlerts.push(alert);

    // Emit alert event
    this.eventBus.emit('performance:alert', alert);

    // Log alert
    switch (level) {
      case 'critical':
        this.logger.error(`Performance Alert: ${message}`, data);
        break;
      case 'warning':
        this.logger.warn(`Performance Alert: ${message}`, data);
        break;
      case 'info':
        this.logger.info(`Performance Alert: ${message}`, data);
        break;
    }
  }

  /**
   * Suggest optimization
   */
  suggestOptimization(category, suggestion) {
    const optimization = {
      category,
      suggestion,
      timestamp: performance.now(),
    };

    this.optimizationSuggestions.push(optimization);

    // Emit optimization event
    this.eventBus.emit('performance:optimization', optimization);

    this.logger.info(`Performance Optimization: ${suggestion}`);
  }

  /**
   * Get performance report
   */
  getPerformanceReport() {
    return {
      metrics: this.metrics,
      alerts: this.performanceAlerts,
      suggestions: this.optimizationSuggestions,
      timestamp: performance.now(),
    };
  }

  /**
   * Get performance score
   */
  getPerformanceScore() {
    let score = 100;

    // FPS score
    const fps = this.metrics.fps.current;
    if (fps < this.config.fpsCriticalThreshold) {
      score -= 40;
    } else if (fps < this.config.fpsWarningThreshold) {
      score -= 20;
    }

    // Memory score
    const memoryUsage = this.metrics.memory.used / this.metrics.memory.total;
    if (memoryUsage > 0.9) {
      score -= 30;
    } else if (memoryUsage > 0.7) {
      score -= 15;
    }

    // Frame time score
    const frameTime = this.metrics.frameTime.current;
    if (frameTime > this.config.frameTimeCriticalThreshold) {
      score -= 20;
    } else if (frameTime > this.config.frameTimeWarningThreshold) {
      score -= 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Handle game started
   */
  handleGameStarted(data) {
    this.startMonitoring();
  }

  /**
   * Handle game paused
   */
  handleGamePaused(data) {
    // Continue monitoring but reduce frequency
  }

  /**
   * Handle game resumed
   */
  handleGameResumed(data) {
    // Resume normal monitoring
  }

  /**
   * Handle game stopped
   */
  handleGameStopped(data) {
    this.stopMonitoring();
  }

  /**
   * Handle frame event
   */
  handleFrame(data) {
    // This would be called by the rendering system
  }

  /**
   * Handle memory update
   */
  handleMemoryUpdate(data) {
    this.updateMemoryMetrics(data);
  }

  /**
   * Handle audio update
   */
  handleAudioUpdate(data) {
    this.updateAudioMetrics(data);
  }

  /**
   * Handle rendering update
   */
  handleRenderingUpdate(data) {
    this.metrics.rendering = { ...this.metrics.rendering, ...data };
  }

  /**
   * Handle input update
   */
  handleInputUpdate(data) {
    this.updateInputMetrics(data.responseTime);
  }

  /**
   * Handle network update
   */
  handleNetworkUpdate(data) {
    this.metrics.network = { ...this.metrics.network, ...data };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    return this.metrics;
  }

  /**
   * Get alerts
   */
  getAlerts() {
    return this.performanceAlerts;
  }

  /**
   * Get optimization suggestions
   */
  getOptimizationSuggestions() {
    return this.optimizationSuggestions;
  }

  /**
   * Clear alerts
   */
  clearAlerts() {
    this.performanceAlerts = [];
  }

  /**
   * Clear optimization suggestions
   */
  clearOptimizationSuggestions() {
    this.optimizationSuggestions = [];
  }
}

export default PerformanceMonitor;
