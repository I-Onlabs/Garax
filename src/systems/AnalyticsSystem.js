/**
 * AnalyticsSystem.js - Player Analytics and Telemetry System
 *
 * This system handles:
 * - Player behavior tracking and analysis
 * - Performance metrics and optimization data
 * - User engagement and retention analytics
 * - Error tracking and crash reporting
 * - A/B testing and feature flagging
 * - Privacy-compliant data collection
 */

export class AnalyticsSystem {
  constructor(dependencies = {}) {
    // Dependency injection
    this.eventBus = dependencies.eventBus;
    this.logger = dependencies.logger;
    this.config = dependencies.config;

    // Validate required dependencies
    if (!this.eventBus) {
      throw new Error('AnalyticsSystem requires eventBus dependency');
    }
    if (!this.logger) {
      throw new Error('AnalyticsSystem requires logger dependency');
    }

    // Analytics system state
    this.analyticsState = {
      enabled: true,
      consentGiven: false,
      dataCollection: {
        behavior: true,
        performance: true,
        errors: true,
        crashes: true,
        engagement: true,
        retention: true,
      },
      events: [],
      metrics: new Map(),
      sessions: new Map(),
      users: new Map(),
      experiments: new Map(),
      featureFlags: new Map(),
      privacy: {
        anonymize: true,
        retention: 90, // days
        gdprCompliant: true,
        ccpaCompliant: true,
      },
      endpoints: {
        analytics: 'https://analytics.example.com/api',
        errors: 'https://errors.example.com/api',
        performance: 'https://performance.example.com/api',
      },
      batchSize: 100,
      flushInterval: 30000, // 30 seconds
      maxRetries: 3,
      currentSession: null,
      lastFlush: 0,
    };

    // Analytics system configuration
    this.analyticsConfig = {
      maxEvents: 10000,
      maxSessions: 1000,
      maxUsers: 10000,
      eventTypes: {
        pageView: 'page_view',
        userAction: 'user_action',
        gameEvent: 'game_event',
        performance: 'performance',
        error: 'error',
        crash: 'crash',
        custom: 'custom',
      },
      metricTypes: {
        counter: 'counter',
        gauge: 'gauge',
        histogram: 'histogram',
        timer: 'timer',
      },
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      heartbeatInterval: 60 * 1000, // 1 minute
      retryDelay: 1000, // 1 second
      maxRetryDelay: 30000, // 30 seconds
      compressionEnabled: true,
      encryptionEnabled: false,
    };

    // Initialize analytics system
    this.initializeEventTypes();
    this.initializeMetrics();
    this.initializeSessions();
    this.initializeExperiments();
    this.initializeFeatureFlags();

    // Event handlers
    this.setupEventHandlers();

    this.logger.info('AnalyticsSystem initialized');
  }

  /**
   * Initialize the system
   */
  async initialize() {
    this.logger.info('Initializing AnalyticsSystem...');

    // Check for consent
    await this.checkConsent();

    // Initialize current session
    this.initializeCurrentSession();

    // Start heartbeat
    this.startHeartbeat();

    // Start flush timer
    this.startFlushTimer();

    this.logger.info('AnalyticsSystem initialized successfully');
  }

  /**
   * Cleanup the system
   */
  cleanup() {
    this.logger.info('Cleaning up AnalyticsSystem...');

    // Flush remaining events
    this.flushEvents();

    // Stop heartbeat
    this.stopHeartbeat();

    // Stop flush timer
    this.stopFlushTimer();

    // Clear state
    this.analyticsState.events = [];
    this.analyticsState.metrics.clear();
    this.analyticsState.sessions.clear();
    this.analyticsState.users.clear();
    this.analyticsState.experiments.clear();
    this.analyticsState.featureFlags.clear();

    // Remove event listeners
    this.removeEventHandlers();

    this.logger.info('AnalyticsSystem cleaned up');
  }

  /**
   * Update the system
   */
  update(deltaTime, gameState) {
    // Update current session
    this.updateCurrentSession(deltaTime);

    // Update metrics
    this.updateMetrics(deltaTime);

    // Update experiments
    this.updateExperiments(deltaTime);

    // Update feature flags
    this.updateFeatureFlags(deltaTime);

    // Check for flush
    this.checkFlush(deltaTime);
  }

  /**
   * Initialize event types
   */
  initializeEventTypes() {
    this.eventTypes = {
      // Page events
      pageView: {
        name: 'Page View',
        description: 'User viewed a page',
        properties: ['url', 'title', 'referrer', 'timestamp'],
      },
      pageExit: {
        name: 'Page Exit',
        description: 'User left a page',
        properties: ['url', 'timeOnPage', 'timestamp'],
      },

      // User events
      userAction: {
        name: 'User Action',
        description: 'User performed an action',
        properties: ['action', 'element', 'value', 'timestamp'],
      },
      userClick: {
        name: 'User Click',
        description: 'User clicked an element',
        properties: ['element', 'position', 'timestamp'],
      },
      userHover: {
        name: 'User Hover',
        description: 'User hovered over an element',
        properties: ['element', 'duration', 'timestamp'],
      },
      userScroll: {
        name: 'User Scroll',
        description: 'User scrolled the page',
        properties: ['direction', 'position', 'timestamp'],
      },

      // Game events
      gameStart: {
        name: 'Game Start',
        description: 'User started the game',
        properties: ['gameMode', 'difficulty', 'timestamp'],
      },
      gameEnd: {
        name: 'Game End',
        description: 'User ended the game',
        properties: ['score', 'duration', 'reason', 'timestamp'],
      },
      levelStart: {
        name: 'Level Start',
        description: 'User started a level',
        properties: ['level', 'difficulty', 'timestamp'],
      },
      levelEnd: {
        name: 'Level End',
        description: 'User ended a level',
        properties: ['level', 'score', 'duration', 'success', 'timestamp'],
      },
      playerDeath: {
        name: 'Player Death',
        description: 'Player died',
        properties: ['level', 'cause', 'timeAlive', 'timestamp'],
      },
      itemPickup: {
        name: 'Item Pickup',
        description: 'Player picked up an item',
        properties: ['item', 'rarity', 'value', 'timestamp'],
      },
      skillUsed: {
        name: 'Skill Used',
        description: 'Player used a skill',
        properties: ['skill', 'level', 'target', 'timestamp'],
      },
      tradeCompleted: {
        name: 'Trade Completed',
        description: 'Player completed a trade',
        properties: ['partner', 'items', 'value', 'timestamp'],
      },

      // Performance events
      performance: {
        name: 'Performance',
        description: 'Performance metrics',
        properties: ['metric', 'value', 'unit', 'timestamp'],
      },
      frameRate: {
        name: 'Frame Rate',
        description: 'Frame rate measurement',
        properties: ['fps', 'timestamp'],
      },
      memoryUsage: {
        name: 'Memory Usage',
        description: 'Memory usage measurement',
        properties: ['used', 'total', 'percentage', 'timestamp'],
      },
      loadTime: {
        name: 'Load Time',
        description: 'Load time measurement',
        properties: ['duration', 'resource', 'timestamp'],
      },

      // Error events
      error: {
        name: 'Error',
        description: 'Application error',
        properties: ['message', 'stack', 'severity', 'timestamp'],
      },
      crash: {
        name: 'Crash',
        description: 'Application crash',
        properties: ['reason', 'stack', 'timestamp'],
      },
      warning: {
        name: 'Warning',
        description: 'Application warning',
        properties: ['message', 'context', 'timestamp'],
      },

      // Custom events
      custom: {
        name: 'Custom',
        description: 'Custom event',
        properties: ['name', 'data', 'timestamp'],
      },
    };
  }

  /**
   * Initialize metrics
   */
  initializeMetrics() {
    this.metrics = {
      // User metrics
      totalUsers: { type: 'counter', value: 0 },
      activeUsers: { type: 'gauge', value: 0 },
      newUsers: { type: 'counter', value: 0 },
      returningUsers: { type: 'counter', value: 0 },

      // Session metrics
      totalSessions: { type: 'counter', value: 0 },
      averageSessionDuration: { type: 'gauge', value: 0 },
      sessionBounceRate: { type: 'gauge', value: 0 },

      // Game metrics
      gamesPlayed: { type: 'counter', value: 0 },
      gamesCompleted: { type: 'counter', value: 0 },
      averageGameDuration: { type: 'gauge', value: 0 },
      averageScore: { type: 'gauge', value: 0 },

      // Performance metrics
      averageFrameRate: { type: 'gauge', value: 0 },
      averageMemoryUsage: { type: 'gauge', value: 0 },
      averageLoadTime: { type: 'gauge', value: 0 },

      // Error metrics
      totalErrors: { type: 'counter', value: 0 },
      errorRate: { type: 'gauge', value: 0 },
      crashRate: { type: 'gauge', value: 0 },
    };
  }

  /**
   * Initialize sessions
   */
  initializeSessions() {
    this.sessionManager = {
      sessions: new Map(),
      currentSession: null,
      sessionTimeout: this.analyticsConfig.sessionTimeout,
      heartbeatInterval: this.analyticsConfig.heartbeatInterval,
    };
  }

  /**
   * Initialize experiments
   */
  initializeExperiments() {
    this.experimentManager = {
      experiments: new Map(),
      activeExperiments: new Map(),
      variants: new Map(),
      results: new Map(),
    };
  }

  /**
   * Initialize feature flags
   */
  initializeFeatureFlags() {
    this.featureFlagManager = {
      flags: new Map(),
      enabledFlags: new Set(),
      disabledFlags: new Set(),
    };
  }

  /**
   * Set up event handlers
   */
  setupEventHandlers() {
    // Analytics events
    this.eventBus.on('analytics:track', this.trackEvent.bind(this));
    this.eventBus.on('analytics:metric', this.recordMetric.bind(this));
    this.eventBus.on('analytics:identify', this.identifyUser.bind(this));
    this.eventBus.on('analytics:alias', this.aliasUser.bind(this));
    this.eventBus.on('analytics:group', this.groupUser.bind(this));

    // Game events
    this.eventBus.on('game:start', this.handleGameStart.bind(this));
    this.eventBus.on('game:end', this.handleGameEnd.bind(this));
    this.eventBus.on('game:pause', this.handleGamePause.bind(this));
    this.eventBus.on('game:resume', this.handleGameResume.bind(this));

    // Player events
    this.eventBus.on('player:levelUp', this.handlePlayerLevelUp.bind(this));
    this.eventBus.on('player:death', this.handlePlayerDeath.bind(this));
    this.eventBus.on('player:itemPickup', this.handleItemPickup.bind(this));
    this.eventBus.on('player:skillUsed', this.handleSkillUsed.bind(this));

    // UI events
    this.eventBus.on('ui:click', this.handleUIClick.bind(this));
    this.eventBus.on('ui:hover', this.handleUIHover.bind(this));
    this.eventBus.on('ui:scroll', this.handleUIScroll.bind(this));

    // Performance events
    this.eventBus.on('performance:frameRate', this.handleFrameRate.bind(this));
    this.eventBus.on('performance:memory', this.handleMemoryUsage.bind(this));
    this.eventBus.on('performance:loadTime', this.handleLoadTime.bind(this));

    // Error events
    this.eventBus.on('error:occurred', this.handleError.bind(this));
    this.eventBus.on('error:crash', this.handleCrash.bind(this));
  }

  /**
   * Remove event handlers
   */
  removeEventHandlers() {
    this.eventBus.removeListener('analytics:track', this.trackEvent.bind(this));
    this.eventBus.removeListener(
      'analytics:metric',
      this.recordMetric.bind(this)
    );
    this.eventBus.removeListener(
      'analytics:identify',
      this.identifyUser.bind(this)
    );
    this.eventBus.removeListener('analytics:alias', this.aliasUser.bind(this));
    this.eventBus.removeListener('analytics:group', this.groupUser.bind(this));
    this.eventBus.removeListener('game:start', this.handleGameStart.bind(this));
    this.eventBus.removeListener('game:end', this.handleGameEnd.bind(this));
    this.eventBus.removeListener('game:pause', this.handleGamePause.bind(this));
    this.eventBus.removeListener(
      'game:resume',
      this.handleGameResume.bind(this)
    );
    this.eventBus.removeListener(
      'player:levelUp',
      this.handlePlayerLevelUp.bind(this)
    );
    this.eventBus.removeListener(
      'player:death',
      this.handlePlayerDeath.bind(this)
    );
    this.eventBus.removeListener(
      'player:itemPickup',
      this.handleItemPickup.bind(this)
    );
    this.eventBus.removeListener(
      'player:skillUsed',
      this.handleSkillUsed.bind(this)
    );
    this.eventBus.removeListener('ui:click', this.handleUIClick.bind(this));
    this.eventBus.removeListener('ui:hover', this.handleUIHover.bind(this));
    this.eventBus.removeListener('ui:scroll', this.handleUIScroll.bind(this));
    this.eventBus.removeListener(
      'performance:frameRate',
      this.handleFrameRate.bind(this)
    );
    this.eventBus.removeListener(
      'performance:memory',
      this.handleMemoryUsage.bind(this)
    );
    this.eventBus.removeListener(
      'performance:loadTime',
      this.handleLoadTime.bind(this)
    );
    this.eventBus.removeListener('error:occurred', this.handleError.bind(this));
    this.eventBus.removeListener('error:crash', this.handleCrash.bind(this));
  }

  /**
   * Check consent
   */
  async checkConsent() {
    const consent = localStorage.getItem('analyticsConsent');
    if (consent === 'true') {
      this.analyticsState.consentGiven = true;
    } else if (consent === 'false') {
      this.analyticsState.consentGiven = false;
      this.analyticsState.enabled = false;
    } else {
      // Show consent dialog
      this.showConsentDialog();
    }
  }

  /**
   * Show consent dialog
   */
  showConsentDialog() {
    const dialog = document.createElement('div');
    dialog.className = 'analytics-consent-dialog';
    dialog.innerHTML = `
      <div class="consent-content">
        <h2>Analytics Consent</h2>
        <p>We collect anonymous analytics data to improve your gaming experience. This includes:</p>
        <ul>
          <li>Game performance metrics</li>
          <li>User behavior patterns</li>
          <li>Error reports</li>
          <li>Feature usage statistics</li>
        </ul>
        <p>All data is anonymized and used only for improving the game.</p>
        <div class="consent-actions">
          <button class="consent-accept">Accept</button>
          <button class="consent-decline">Decline</button>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    dialog.querySelector('.consent-accept').addEventListener('click', () => {
      this.acceptConsent();
      dialog.remove();
    });

    dialog.querySelector('.consent-decline').addEventListener('click', () => {
      this.declineConsent();
      dialog.remove();
    });
  }

  /**
   * Accept consent
   */
  acceptConsent() {
    this.analyticsState.consentGiven = true;
    this.analyticsState.enabled = true;
    localStorage.setItem('analyticsConsent', 'true');

    this.eventBus.emit('analytics:consentAccepted', {
      timestamp: Date.now(),
    });
  }

  /**
   * Decline consent
   */
  declineConsent() {
    this.analyticsState.consentGiven = false;
    this.analyticsState.enabled = false;
    localStorage.setItem('analyticsConsent', 'false');

    this.eventBus.emit('analytics:consentDeclined', {
      timestamp: Date.now(),
    });
  }

  /**
   * Track event
   */
  trackEvent(data) {
    if (!this.analyticsState.enabled || !this.analyticsState.consentGiven) {
      return;
    }

    const event = {
      id: this.generateEventId(),
      type: data.type || 'custom',
      name: data.name,
      properties: data.properties || {},
      timestamp: Date.now(),
      sessionId: this.analyticsState.currentSession?.id,
      userId: this.getCurrentUserId(),
    };

    this.analyticsState.events.push(event);

    // Check if we need to flush
    if (this.analyticsState.events.length >= this.analyticsState.batchSize) {
      this.flushEvents();
    }

    this.logger.debug(`Event tracked: ${event.name}`);
  }

  /**
   * Record metric
   */
  recordMetric(data) {
    if (!this.analyticsState.enabled || !this.analyticsState.consentGiven) {
      return;
    }

    const { name, value, type = 'gauge' } = data;

    if (this.metrics[name]) {
      this.metrics[name].value = value;
      this.metrics[name].lastUpdated = Date.now();
    } else {
      this.metrics[name] = {
        type: type,
        value: value,
        lastUpdated: Date.now(),
      };
    }

    this.analyticsState.metrics.set(name, this.metrics[name]);
  }

  /**
   * Identify user
   */
  identifyUser(data) {
    const { userId, traits } = data;

    this.analyticsState.users.set(userId, {
      id: userId,
      traits: traits || {},
      firstSeen: Date.now(),
      lastSeen: Date.now(),
    });

    this.eventBus.emit('analytics:userIdentified', {
      userId,
      traits,
      timestamp: Date.now(),
    });
  }

  /**
   * Alias user
   */
  aliasUser(data) {
    const { userId, alias } = data;

    const user = this.analyticsState.users.get(userId);
    if (user) {
      user.aliases = user.aliases || [];
      user.aliases.push(alias);
    }

    this.eventBus.emit('analytics:userAliased', {
      userId,
      alias,
      timestamp: Date.now(),
    });
  }

  /**
   * Group user
   */
  groupUser(data) {
    const { userId, groupId, traits } = data;

    const user = this.analyticsState.users.get(userId);
    if (user) {
      user.groups = user.groups || [];
      user.groups.push({
        id: groupId,
        traits: traits || {},
        joinedAt: Date.now(),
      });
    }

    this.eventBus.emit('analytics:userGrouped', {
      userId,
      groupId,
      traits,
      timestamp: Date.now(),
    });
  }

  /**
   * Initialize current session
   */
  initializeCurrentSession() {
    const sessionId = this.generateSessionId();
    const session = {
      id: sessionId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      events: [],
      properties: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenResolution: {
          width: screen.width,
          height: screen.height,
        },
        viewportSize: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      },
    };

    this.analyticsState.currentSession = session;
    this.analyticsState.sessions.set(sessionId, session);

    this.trackEvent({
      type: 'session',
      name: 'Session Start',
      properties: {
        sessionId: sessionId,
      },
    });
  }

  /**
   * Update current session
   */
  updateCurrentSession(deltaTime) {
    if (!this.analyticsState.currentSession) {
      return;
    }

    this.analyticsState.currentSession.lastActivity = Date.now();

    // Check for session timeout
    const timeSinceActivity =
      Date.now() - this.analyticsState.currentSession.lastActivity;
    if (timeSinceActivity > this.analyticsConfig.sessionTimeout) {
      this.endSession();
    }
  }

  /**
   * End session
   */
  endSession() {
    if (!this.analyticsState.currentSession) {
      return;
    }

    const session = this.analyticsState.currentSession;
    session.endTime = Date.now();
    session.duration = session.endTime - session.startTime;

    this.trackEvent({
      type: 'session',
      name: 'Session End',
      properties: {
        sessionId: session.id,
        duration: session.duration,
      },
    });

    this.analyticsState.currentSession = null;
  }

  /**
   * Start heartbeat
   */
  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
    }, this.analyticsConfig.heartbeatInterval);
  }

  /**
   * Stop heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Send heartbeat
   */
  sendHeartbeat() {
    if (!this.analyticsState.currentSession) {
      return;
    }

    this.trackEvent({
      type: 'session',
      name: 'Heartbeat',
      properties: {
        sessionId: this.analyticsState.currentSession.id,
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Start flush timer
   */
  startFlushTimer() {
    this.flushTimer = setInterval(() => {
      this.flushEvents();
    }, this.analyticsState.flushInterval);
  }

  /**
   * Stop flush timer
   */
  stopFlushTimer() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Check flush
   */
  checkFlush(deltaTime) {
    const now = Date.now();
    if (
      now - this.analyticsState.lastFlush >=
      this.analyticsState.flushInterval
    ) {
      this.flushEvents();
    }
  }

  /**
   * Flush events
   */
  async flushEvents() {
    if (this.analyticsState.events.length === 0) {
      return;
    }

    const events = [...this.analyticsState.events];
    this.analyticsState.events = [];

    try {
      await this.sendEvents(events);
      this.analyticsState.lastFlush = Date.now();

      this.logger.debug(`Flushed ${events.length} events`);
    } catch (error) {
      this.logger.error('Failed to flush events:', error);

      // Re-add events to queue
      this.analyticsState.events.unshift(...events);
    }
  }

  /**
   * Send events
   */
  async sendEvents(events) {
    const payload = {
      events: events,
      sessionId: this.analyticsState.currentSession?.id,
      userId: this.getCurrentUserId(),
      timestamp: Date.now(),
    };

    const response = await fetch(this.analyticsState.endpoints.analytics, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.getApiKey()}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to send events: ${response.status}`);
    }
  }

  /**
   * Generate event ID
   */
  generateEventId() {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate session ID
   */
  generateSessionId() {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current user ID
   */
  getCurrentUserId() {
    return this.analyticsState.currentSession?.userId || 'anonymous';
  }

  /**
   * Get API key
   */
  getApiKey() {
    return this.config.analyticsApiKey || 'default-key';
  }

  /**
   * Handle game start
   */
  handleGameStart(data) {
    this.trackEvent({
      type: 'game',
      name: 'Game Start',
      properties: {
        gameMode: data.gameMode,
        difficulty: data.difficulty,
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Handle game end
   */
  handleGameEnd(data) {
    this.trackEvent({
      type: 'game',
      name: 'Game End',
      properties: {
        score: data.score,
        duration: data.duration,
        reason: data.reason,
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Handle game pause
   */
  handleGamePause(data) {
    this.trackEvent({
      type: 'game',
      name: 'Game Pause',
      properties: {
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Handle game resume
   */
  handleGameResume(data) {
    this.trackEvent({
      type: 'game',
      name: 'Game Resume',
      properties: {
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Handle player level up
   */
  handlePlayerLevelUp(data) {
    this.trackEvent({
      type: 'player',
      name: 'Player Level Up',
      properties: {
        level: data.level,
        experience: data.experience,
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Handle player death
   */
  handlePlayerDeath(data) {
    this.trackEvent({
      type: 'player',
      name: 'Player Death',
      properties: {
        level: data.level,
        cause: data.cause,
        timeAlive: data.timeAlive,
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Handle item pickup
   */
  handleItemPickup(data) {
    this.trackEvent({
      type: 'player',
      name: 'Item Pickup',
      properties: {
        item: data.item,
        rarity: data.rarity,
        value: data.value,
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Handle skill used
   */
  handleSkillUsed(data) {
    this.trackEvent({
      type: 'player',
      name: 'Skill Used',
      properties: {
        skill: data.skill,
        level: data.level,
        target: data.target,
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Handle UI click
   */
  handleUIClick(data) {
    this.trackEvent({
      type: 'ui',
      name: 'UI Click',
      properties: {
        element: data.element,
        position: data.position,
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Handle UI hover
   */
  handleUIHover(data) {
    this.trackEvent({
      type: 'ui',
      name: 'UI Hover',
      properties: {
        element: data.element,
        duration: data.duration,
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Handle UI scroll
   */
  handleUIScroll(data) {
    this.trackEvent({
      type: 'ui',
      name: 'UI Scroll',
      properties: {
        direction: data.direction,
        position: data.position,
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Handle frame rate
   */
  handleFrameRate(data) {
    this.recordMetric({
      name: 'frameRate',
      value: data.fps,
      type: 'gauge',
    });
  }

  /**
   * Handle memory usage
   */
  handleMemoryUsage(data) {
    this.recordMetric({
      name: 'memoryUsage',
      value: data.percentage,
      type: 'gauge',
    });
  }

  /**
   * Handle load time
   */
  handleLoadTime(data) {
    this.recordMetric({
      name: 'loadTime',
      value: data.duration,
      type: 'gauge',
    });
  }

  /**
   * Handle error
   */
  handleError(data) {
    this.trackEvent({
      type: 'error',
      name: 'Error',
      properties: {
        message: data.message,
        stack: data.stack,
        severity: data.severity,
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Handle crash
   */
  handleCrash(data) {
    this.trackEvent({
      type: 'error',
      name: 'Crash',
      properties: {
        reason: data.reason,
        stack: data.stack,
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Update metrics
   */
  updateMetrics(deltaTime) {
    // Update metrics logic
  }

  /**
   * Update experiments
   */
  updateExperiments(deltaTime) {
    // Update experiments logic
  }

  /**
   * Update feature flags
   */
  updateFeatureFlags(deltaTime) {
    // Update feature flags logic
  }

  /**
   * Get analytics state
   */
  getAnalyticsState() {
    return { ...this.analyticsState };
  }

  /**
   * Get metrics
   */
  getMetrics() {
    return Array.from(this.analyticsState.metrics.entries());
  }

  /**
   * Get events
   */
  getEvents() {
    return [...this.analyticsState.events];
  }

  /**
   * Get sessions
   */
  getSessions() {
    return Array.from(this.analyticsState.sessions.values());
  }

  /**
   * Get users
   */
  getUsers() {
    return Array.from(this.analyticsState.users.values());
  }

  /**
   * Is enabled
   */
  isEnabled() {
    return this.analyticsState.enabled && this.analyticsState.consentGiven;
  }

  /**
   * Enable analytics
   */
  enableAnalytics() {
    this.analyticsState.enabled = true;
  }

  /**
   * Disable analytics
   */
  disableAnalytics() {
    this.analyticsState.enabled = false;
  }

  /**
   * Set data collection
   */
  setDataCollection(category, enabled) {
    if (this.analyticsState.dataCollection.hasOwnProperty(category)) {
      this.analyticsState.dataCollection[category] = enabled;
    }
  }

  /**
   * Get data collection settings
   */
  getDataCollectionSettings() {
    return { ...this.analyticsState.dataCollection };
  }
}

export default AnalyticsSystem;
