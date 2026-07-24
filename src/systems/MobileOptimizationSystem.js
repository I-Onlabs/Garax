/**
 * MobileOptimizationSystem.js - Mobile Optimization and Touch Controls System
 *
 * This system handles:
 * - Touch controls and gestures
 * - Responsive UI design
 * - Mobile performance optimization
 * - Device-specific adaptations
 * - Touch-friendly interactions
 * - Mobile-specific features
 */

export class MobileOptimizationSystem {
  constructor(dependencies = {}) {
    // Dependency injection
    this.eventBus = dependencies.eventBus;
    this.logger = dependencies.logger;
    this.config = dependencies.config;

    // Validate required dependencies
    if (!this.eventBus) {
      throw new Error('MobileOptimizationSystem requires eventBus dependency');
    }
    if (!this.logger) {
      throw new Error('MobileOptimizationSystem requires logger dependency');
    }

    // Mobile optimization state
    this.mobileState = {
      isMobile: false,
      deviceType: 'desktop',
      screenSize: { width: 0, height: 0 },
      orientation: 'portrait',
      touchCapable: false,
      performanceLevel: 'high',
      batteryLevel: 1.0,
      networkType: 'unknown',
      touchControls: new Map(),
      gestureRecognizers: new Map(),
      responsiveBreakpoints: new Map(),
      mobileFeatures: new Map(),
    };

    // Mobile configuration
    this.mobileConfig = {
      touchSensitivity: 1.0,
      gestureThreshold: 10,
      doubleTapDelay: 300,
      longPressDelay: 500,
      swipeThreshold: 50,
      pinchThreshold: 0.1,
      rotationThreshold: 15,
      responsiveBreakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1200,
      },
      performanceLevels: {
        low: { maxFPS: 30, quality: 0.5, effects: false },
        medium: { maxFPS: 45, quality: 0.7, effects: true },
        high: { maxFPS: 60, quality: 1.0, effects: true },
      },
      touchZones: {
        left: { x: 0, y: 0, width: 0.3, height: 1.0 },
        right: { x: 0.7, y: 0, width: 0.3, height: 1.0 },
        center: { x: 0.3, y: 0, width: 0.4, height: 1.0 },
      },
    };

    // Initialize mobile systems
    this.initializeMobileDetection();
    this.initializeTouchControls();
    this.initializeGestureRecognition();
    this.initializeResponsiveDesign();
    this.initializeMobileFeatures();

    // Event handlers
    this.setupEventHandlers();

    this.logger.info('MobileOptimizationSystem initialized');
  }

  /**
   * Initialize the system
   */
  async initialize() {
    this.logger.info('Initializing MobileOptimizationSystem...');

    // Detect mobile device
    this.detectMobileDevice();

    // Set up responsive design
    this.setupResponsiveDesign();

    // Initialize touch controls
    this.setupTouchControls();

    // Set up mobile-specific features
    this.setupMobileFeatures();

    this.logger.info('MobileOptimizationSystem initialized successfully');
  }

  /**
   * Cleanup the system
   */
  cleanup() {
    this.logger.info('Cleaning up MobileOptimizationSystem...');

    // Remove touch event listeners
    this.removeTouchEventListeners();

    // Remove responsive design listeners
    this.removeResponsiveDesignListeners();

    // Clear state
    this.mobileState.touchControls.clear();
    this.mobileState.gestureRecognizers.clear();
    this.mobileState.responsiveBreakpoints.clear();
    this.mobileState.mobileFeatures.clear();

    // Remove event listeners
    this.removeEventHandlers();

    this.logger.info('MobileOptimizationSystem cleaned up');
  }

  /**
   * Update the system
   */
  update(deltaTime, gameState) {
    // Update touch controls
    this.updateTouchControls(deltaTime);

    // Update gesture recognition
    this.updateGestureRecognition(deltaTime);

    // Update responsive design
    this.updateResponsiveDesign(deltaTime);

    // Update mobile features
    this.updateMobileFeatures(deltaTime);
  }

  /**
   * Initialize mobile detection
   */
  initializeMobileDetection() {
    this.mobileDetector = {
      userAgent: navigator.userAgent,
      touchCapable: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      screenSize: { width: window.innerWidth, height: window.innerHeight },
      orientation:
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
    };
  }

  /**
   * Initialize touch controls
   */
  initializeTouchControls() {
    this.touchControls = {
      virtualJoystick: {
        active: false,
        position: { x: 0, y: 0 },
        radius: 50,
        deadZone: 10,
        sensitivity: 1.0,
      },
      virtualButtons: new Map(),
      touchZones: new Map(),
      touchHistory: [],
      maxTouchHistory: 10,
    };
  }

  /**
   * Initialize gesture recognition
   */
  initializeGestureRecognition() {
    this.gestureRecognizers = {
      tap: {
        enabled: true,
        threshold: 10,
        maxDuration: 300,
      },
      doubleTap: {
        enabled: true,
        threshold: 10,
        maxDuration: 300,
        maxDelay: 500,
      },
      longPress: {
        enabled: true,
        threshold: 10,
        minDuration: 500,
      },
      swipe: {
        enabled: true,
        threshold: 50,
        minVelocity: 0.3,
      },
      pinch: {
        enabled: true,
        threshold: 0.1,
      },
      rotation: {
        enabled: true,
        threshold: 15,
      },
    };
  }

  /**
   * Initialize responsive design
   */
  initializeResponsiveDesign() {
    this.responsiveDesign = {
      currentBreakpoint: 'desktop',
      breakpoints: this.mobileConfig.responsiveBreakpoints,
      mediaQueries: new Map(),
      responsiveElements: new Map(),
      layoutMode: 'desktop',
    };
  }

  /**
   * Initialize mobile features
   */
  initializeMobileFeatures() {
    this.mobileFeatures = {
      hapticFeedback: 'vibrate' in navigator,
      deviceOrientation: 'DeviceOrientationEvent' in window,
      deviceMotion: 'DeviceMotionEvent' in window,
      fullscreen: 'requestFullscreen' in document.documentElement,
      webAppManifest: 'serviceWorker' in navigator,
      pushNotifications: 'PushManager' in window,
      geolocation: 'geolocation' in navigator,
      camera: 'getUserMedia' in navigator.mediaDevices,
    };
  }

  /**
   * Set up event handlers
   */
  setupEventHandlers() {
    // Touch events
    this.eventBus.on('touch:start', this.handleTouchStart.bind(this));
    this.eventBus.on('touch:move', this.handleTouchMove.bind(this));
    this.eventBus.on('touch:end', this.handleTouchEnd.bind(this));
    this.eventBus.on('touch:cancel', this.handleTouchCancel.bind(this));

    // Gesture events
    this.eventBus.on('gesture:tap', this.handleTap.bind(this));
    this.eventBus.on('gesture:doubleTap', this.handleDoubleTap.bind(this));
    this.eventBus.on('gesture:longPress', this.handleLongPress.bind(this));
    this.eventBus.on('gesture:swipe', this.handleSwipe.bind(this));
    this.eventBus.on('gesture:pinch', this.handlePinch.bind(this));
    this.eventBus.on('gesture:rotation', this.handleRotation.bind(this));

    // Mobile events
    this.eventBus.on(
      'mobile:orientationChange',
      this.handleOrientationChange.bind(this)
    );
    this.eventBus.on('mobile:resize', this.handleResize.bind(this));
    this.eventBus.on(
      'mobile:visibilityChange',
      this.handleVisibilityChange.bind(this)
    );
    this.eventBus.on(
      'mobile:batteryChange',
      this.handleBatteryChange.bind(this)
    );

    // Performance events
    this.eventBus.on(
      'performance:levelChange',
      this.handlePerformanceLevelChange.bind(this)
    );
  }

  /**
   * Remove event handlers
   */
  removeEventHandlers() {
    this.eventBus.removeListener(
      'touch:start',
      this.handleTouchStart.bind(this)
    );
    this.eventBus.removeListener('touch:move', this.handleTouchMove.bind(this));
    this.eventBus.removeListener('touch:end', this.handleTouchEnd.bind(this));
    this.eventBus.removeListener(
      'touch:cancel',
      this.handleTouchCancel.bind(this)
    );
    this.eventBus.removeListener('gesture:tap', this.handleTap.bind(this));
    this.eventBus.removeListener(
      'gesture:doubleTap',
      this.handleDoubleTap.bind(this)
    );
    this.eventBus.removeListener(
      'gesture:longPress',
      this.handleLongPress.bind(this)
    );
    this.eventBus.removeListener('gesture:swipe', this.handleSwipe.bind(this));
    this.eventBus.removeListener('gesture:pinch', this.handlePinch.bind(this));
    this.eventBus.removeListener(
      'gesture:rotation',
      this.handleRotation.bind(this)
    );
    this.eventBus.removeListener(
      'mobile:orientationChange',
      this.handleOrientationChange.bind(this)
    );
    this.eventBus.removeListener('mobile:resize', this.handleResize.bind(this));
    this.eventBus.removeListener(
      'mobile:visibilityChange',
      this.handleVisibilityChange.bind(this)
    );
    this.eventBus.removeListener(
      'mobile:batteryChange',
      this.handleBatteryChange.bind(this)
    );
    this.eventBus.removeListener(
      'performance:levelChange',
      this.handlePerformanceLevelChange.bind(this)
    );
  }

  /**
   * Detect mobile device
   */
  detectMobileDevice() {
    const userAgent = navigator.userAgent;
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent
      );
    const isTablet =
      /iPad|Android/i.test(userAgent) && 'ontouchstart' in window;

    this.mobileState.isMobile = isMobile;
    this.mobileState.touchCapable =
      'ontouchstart' in window || navigator.maxTouchPoints > 0;
    this.mobileState.deviceType = isTablet
      ? 'tablet'
      : isMobile
        ? 'mobile'
        : 'desktop';
    this.mobileState.screenSize = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    this.mobileState.orientation =
      window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';

    // Detect performance level
    this.detectPerformanceLevel();

    this.logger.info(`Mobile device detected: ${this.mobileState.deviceType}`);
  }

  /**
   * Detect performance level
   */
  detectPerformanceLevel() {
    const screenSize = this.mobileState.screenSize;
    const isLowEnd = screenSize.width < 768 || screenSize.height < 768;
    const isHighEnd = screenSize.width >= 1200 && screenSize.height >= 800;

    if (isLowEnd) {
      this.mobileState.performanceLevel = 'low';
    } else if (isHighEnd) {
      this.mobileState.performanceLevel = 'high';
    } else {
      this.mobileState.performanceLevel = 'medium';
    }

    this.logger.info(
      `Performance level detected: ${this.mobileState.performanceLevel}`
    );
  }

  /**
   * Set up responsive design
   */
  setupResponsiveDesign() {
    // Set up media queries
    this.setupMediaQueries();

    // Set up responsive elements
    this.setupResponsiveElements();

    // Set up layout mode
    this.setupLayoutMode();

    // Add resize listener
    window.addEventListener('resize', this.handleResize.bind(this));

    // Add orientation change listener
    window.addEventListener(
      'orientationchange',
      this.handleOrientationChange.bind(this)
    );
  }

  /**
   * Set up media queries
   */
  setupMediaQueries() {
    const breakpoints = this.mobileConfig.responsiveBreakpoints;

    Object.entries(breakpoints).forEach(([name, width]) => {
      const mediaQuery = window.matchMedia(`(max-width: ${width}px)`);
      this.responsiveDesign.mediaQueries.set(name, mediaQuery);

      mediaQuery.addListener((e) => {
        if (e.matches) {
          this.handleBreakpointChange(name);
        }
      });
    });
  }

  /**
   * Set up responsive elements
   */
  setupResponsiveElements() {
    // Find all responsive elements
    const responsiveElements = document.querySelectorAll('[data-responsive]');

    responsiveElements.forEach((element) => {
      const breakpoints = element.dataset.responsive.split(',');
      this.responsiveDesign.responsiveElements.set(element, breakpoints);
    });
  }

  /**
   * Set up layout mode
   */
  setupLayoutMode() {
    const currentBreakpoint = this.getCurrentBreakpoint();
    this.responsiveDesign.currentBreakpoint = currentBreakpoint;
    this.responsiveDesign.layoutMode = this.getLayoutMode(currentBreakpoint);

    this.applyLayoutMode(this.responsiveDesign.layoutMode);
  }

  /**
   * Get current breakpoint
   */
  getCurrentBreakpoint() {
    const width = window.innerWidth;
    const breakpoints = this.mobileConfig.responsiveBreakpoints;

    if (width < breakpoints.mobile) {
      return 'mobile';
    } else if (width < breakpoints.tablet) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }

  /**
   * Get layout mode
   */
  getLayoutMode(breakpoint) {
    const layoutModes = {
      mobile: 'mobile',
      tablet: 'tablet',
      desktop: 'desktop',
    };

    return layoutModes[breakpoint] || 'desktop';
  }

  /**
   * Apply layout mode
   */
  applyLayoutMode(layoutMode) {
    document.body.className = document.body.className.replace(
      /layout-\w+/g,
      ''
    );
    document.body.classList.add(`layout-${layoutMode}`);

    this.eventBus.emit('mobile:layoutModeChanged', {
      layoutMode,
      timestamp: Date.now(),
    });
  }

  /**
   * Set up touch controls
   */
  setupTouchControls() {
    if (!this.mobileState.touchCapable) {
      return;
    }

    // Add touch event listeners
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), {
      passive: false,
    });
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), {
      passive: false,
    });
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), {
      passive: false,
    });
    document.addEventListener(
      'touchcancel',
      this.handleTouchCancel.bind(this),
      { passive: false }
    );

    // Set up virtual joystick
    this.setupVirtualJoystick();

    // Set up virtual buttons
    this.setupVirtualButtons();

    // Set up touch zones
    this.setupTouchZones();
  }

  /**
   * Set up virtual joystick
   */
  setupVirtualJoystick() {
    const joystick = document.createElement('div');
    joystick.id = 'virtual-joystick';
    joystick.className = 'virtual-joystick';
    joystick.style.cssText = `
      position: fixed;
      left: 50px;
      bottom: 50px;
      width: 100px;
      height: 100px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.3);
      z-index: 1000;
      display: ${this.mobileState.isMobile ? 'block' : 'none'};
    `;

    const knob = document.createElement('div');
    knob.className = 'joystick-knob';
    knob.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 30px;
      height: 30px;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: transform 0.1s ease;
    `;

    joystick.appendChild(knob);
    document.body.appendChild(joystick);

    this.touchControls.virtualJoystick.element = joystick;
    this.touchControls.virtualJoystick.knob = knob;
  }

  /**
   * Set up virtual buttons
   */
  setupVirtualButtons() {
    const buttonConfigs = [
      {
        id: 'jump',
        label: 'Jump',
        position: { right: '50px', bottom: '50px' },
      },
      {
        id: 'attack',
        label: 'Attack',
        position: { right: '50px', bottom: '120px' },
      },
      {
        id: 'interact',
        label: 'Interact',
        position: { right: '50px', bottom: '190px' },
      },
      { id: 'menu', label: 'Menu', position: { right: '50px', top: '50px' } },
    ];

    buttonConfigs.forEach((config) => {
      const button = document.createElement('button');
      button.id = `virtual-button-${config.id}`;
      button.className = 'virtual-button';
      button.textContent = config.label;
      button.style.cssText = `
        position: fixed;
        ${config.position.right ? `right: ${config.position.right};` : ''}
        ${config.position.left ? `left: ${config.position.left};` : ''}
        ${config.position.top ? `top: ${config.position.top};` : ''}
        ${config.position.bottom ? `bottom: ${config.position.bottom};` : ''}
        width: 60px;
        height: 60px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.3);
        color: white;
        font-size: 12px;
        z-index: 1000;
        display: ${this.mobileState.isMobile ? 'block' : 'none'};
        touch-action: manipulation;
      `;

      button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.handleVirtualButtonPress(config.id);
      });

      button.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.handleVirtualButtonRelease(config.id);
      });

      document.body.appendChild(button);
      this.touchControls.virtualButtons.set(config.id, button);
    });
  }

  /**
   * Set up touch zones
   */
  setupTouchZones() {
    const zones = this.mobileConfig.touchZones;

    Object.entries(zones).forEach(([name, zone]) => {
      const element = document.createElement('div');
      element.className = `touch-zone touch-zone-${name}`;
      element.style.cssText = `
        position: fixed;
        left: ${zone.x * 100}%;
        top: ${zone.y * 100}%;
        width: ${zone.width * 100}%;
        height: ${zone.height * 100}%;
        z-index: 999;
        display: ${this.mobileState.isMobile ? 'block' : 'none'};
        pointer-events: auto;
      `;

      element.addEventListener('touchstart', (e) => {
        this.handleTouchZoneStart(name, e);
      });

      element.addEventListener('touchmove', (e) => {
        this.handleTouchZoneMove(name, e);
      });

      element.addEventListener('touchend', (e) => {
        this.handleTouchZoneEnd(name, e);
      });

      document.body.appendChild(element);
      this.touchControls.touchZones.set(name, element);
    });
  }

  /**
   * Set up mobile features
   */
  setupMobileFeatures() {
    // Set up haptic feedback
    if (this.mobileFeatures.hapticFeedback) {
      this.setupHapticFeedback();
    }

    // Set up device orientation
    if (this.mobileFeatures.deviceOrientation) {
      this.setupDeviceOrientation();
    }

    // Set up device motion
    if (this.mobileFeatures.deviceMotion) {
      this.setupDeviceMotion();
    }

    // Set up fullscreen
    if (this.mobileFeatures.fullscreen) {
      this.setupFullscreen();
    }

    // Set up push notifications
    if (this.mobileFeatures.pushNotifications) {
      this.setupPushNotifications();
    }

    // Set up geolocation
    if (this.mobileFeatures.geolocation) {
      this.setupGeolocation();
    }
  }

  /**
   * Set up haptic feedback
   */
  setupHapticFeedback() {
    this.hapticFeedback = {
      light: () => navigator.vibrate(10),
      medium: () => navigator.vibrate(50),
      heavy: () => navigator.vibrate(100),
      pattern: (pattern) => navigator.vibrate(pattern),
    };
  }

  /**
   * Set up device orientation
   */
  setupDeviceOrientation() {
    window.addEventListener('deviceorientation', (event) => {
      this.handleDeviceOrientation(event);
    });
  }

  /**
   * Set up device motion
   */
  setupDeviceMotion() {
    window.addEventListener('devicemotion', (event) => {
      this.handleDeviceMotion(event);
    });
  }

  /**
   * Set up fullscreen
   */
  setupFullscreen() {
    this.fullscreen = {
      enter: () => {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        }
      },
      exit: () => {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      },
      toggle: () => {
        if (document.fullscreenElement) {
          this.fullscreen.exit();
        } else {
          this.fullscreen.enter();
        }
      },
    };
  }

  /**
   * Set up push notifications
   */
  setupPushNotifications() {
    this.pushNotifications = {
      requestPermission: async () => {
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          return permission === 'granted';
        }
        return false;
      },
      show: (title, options) => {
        if (Notification.permission === 'granted') {
          new Notification(title, options);
        }
      },
    };
  }

  /**
   * Set up geolocation
   */
  setupGeolocation() {
    this.geolocation = {
      getCurrentPosition: () => {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
      },
      watchPosition: (callback) => {
        return navigator.geolocation.watchPosition(callback);
      },
      clearWatch: (id) => {
        navigator.geolocation.clearWatch(id);
      },
    };
  }

  /**
   * Handle touch start
   */
  handleTouchStart(event) {
    event.preventDefault();

    const touches = Array.from(event.touches);
    const touch = touches[0];

    if (touch) {
      this.touchControls.touchHistory.push({
        type: 'start',
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now(),
      });

      // Limit touch history
      if (
        this.touchControls.touchHistory.length >
        this.touchControls.maxTouchHistory
      ) {
        this.touchControls.touchHistory.shift();
      }

      // Check for virtual joystick interaction
      if (this.isPointInJoystick(touch.clientX, touch.clientY)) {
        this.touchControls.virtualJoystick.active = true;
        this.touchControls.virtualJoystick.startPosition = {
          x: touch.clientX,
          y: touch.clientY,
        };
      }

      this.eventBus.emit('touch:start', {
        touch,
        touches,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Handle touch move
   */
  handleTouchMove(event) {
    event.preventDefault();

    const touches = Array.from(event.touches);
    const touch = touches[0];

    if (touch) {
      this.touchControls.touchHistory.push({
        type: 'move',
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now(),
      });

      // Update virtual joystick
      if (this.touchControls.virtualJoystick.active) {
        this.updateVirtualJoystick(touch.clientX, touch.clientY);
      }

      this.eventBus.emit('touch:move', {
        touch,
        touches,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Handle touch end
   */
  handleTouchEnd(event) {
    event.preventDefault();

    const touches = Array.from(event.touches);
    const changedTouches = Array.from(event.changedTouches);
    const touch = changedTouches[0];

    if (touch) {
      this.touchControls.touchHistory.push({
        type: 'end',
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now(),
      });

      // Reset virtual joystick
      if (this.touchControls.virtualJoystick.active) {
        this.resetVirtualJoystick();
      }

      // Recognize gestures
      this.recognizeGestures();

      this.eventBus.emit('touch:end', {
        touch,
        touches,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Handle touch cancel
   */
  handleTouchCancel(event) {
    event.preventDefault();

    // Reset virtual joystick
    if (this.touchControls.virtualJoystick.active) {
      this.resetVirtualJoystick();
    }

    this.eventBus.emit('touch:cancel', {
      timestamp: Date.now(),
    });
  }

  /**
   * Handle tap
   */
  handleTap(data) {
    this.logger.info('Tap gesture recognized');

    // Trigger haptic feedback
    if (this.hapticFeedback) {
      this.hapticFeedback.light();
    }

    this.eventBus.emit('gesture:tap', data);
  }

  /**
   * Handle double tap
   */
  handleDoubleTap(data) {
    this.logger.info('Double tap gesture recognized');

    // Trigger haptic feedback
    if (this.hapticFeedback) {
      this.hapticFeedback.medium();
    }

    this.eventBus.emit('gesture:doubleTap', data);
  }

  /**
   * Handle long press
   */
  handleLongPress(data) {
    this.logger.info('Long press gesture recognized');

    // Trigger haptic feedback
    if (this.hapticFeedback) {
      this.hapticFeedback.heavy();
    }

    this.eventBus.emit('gesture:longPress', data);
  }

  /**
   * Handle swipe
   */
  handleSwipe(data) {
    this.logger.info(`Swipe gesture recognized: ${data.direction}`);

    // Trigger haptic feedback
    if (this.hapticFeedback) {
      this.hapticFeedback.medium();
    }

    this.eventBus.emit('gesture:swipe', data);
  }

  /**
   * Handle pinch
   */
  handlePinch(data) {
    this.logger.info(`Pinch gesture recognized: ${data.scale}`);

    this.eventBus.emit('gesture:pinch', data);
  }

  /**
   * Handle rotation
   */
  handleRotation(data) {
    this.logger.info(`Rotation gesture recognized: ${data.rotation}`);

    this.eventBus.emit('gesture:rotation', data);
  }

  /**
   * Handle orientation change
   */
  handleOrientationChange(event) {
    const newOrientation =
      window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';

    if (newOrientation !== this.mobileState.orientation) {
      this.mobileState.orientation = newOrientation;

      this.eventBus.emit('mobile:orientationChange', {
        orientation: newOrientation,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Handle resize
   */
  handleResize(event) {
    const newScreenSize = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    if (
      newScreenSize.width !== this.mobileState.screenSize.width ||
      newScreenSize.height !== this.mobileState.screenSize.height
    ) {
      this.mobileState.screenSize = newScreenSize;

      // Update responsive design
      this.updateResponsiveDesign();

      this.eventBus.emit('mobile:resize', {
        screenSize: newScreenSize,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Handle visibility change
   */
  handleVisibilityChange(event) {
    const isVisible = !document.hidden;

    this.eventBus.emit('mobile:visibilityChange', {
      visible: isVisible,
      timestamp: Date.now(),
    });
  }

  /**
   * Handle battery change
   */
  handleBatteryChange(event) {
    const batteryLevel = event.level;

    this.mobileState.batteryLevel = batteryLevel;

    // Adjust performance based on battery level
    if (batteryLevel < 0.2) {
      this.setPerformanceLevel('low');
    } else if (batteryLevel < 0.5) {
      this.setPerformanceLevel('medium');
    } else {
      this.setPerformanceLevel('high');
    }

    this.eventBus.emit('mobile:batteryChange', {
      batteryLevel,
      timestamp: Date.now(),
    });
  }

  /**
   * Handle performance level change
   */
  handlePerformanceLevelChange(data) {
    const { level } = data;

    this.mobileState.performanceLevel = level;

    // Apply performance settings
    this.applyPerformanceSettings(level);

    this.logger.info(`Performance level changed to: ${level}`);
  }

  /**
   * Update touch controls
   */
  updateTouchControls(deltaTime) {
    // Update virtual joystick
    if (this.touchControls.virtualJoystick.active) {
      this.updateVirtualJoystickPosition(deltaTime);
    }
  }

  /**
   * Update gesture recognition
   */
  updateGestureRecognition(deltaTime) {
    // Process touch history for gesture recognition
    this.processTouchHistory();
  }

  /**
   * Update responsive design
   */
  updateResponsiveDesign(deltaTime) {
    // Check for breakpoint changes
    const currentBreakpoint = this.getCurrentBreakpoint();

    if (currentBreakpoint !== this.responsiveDesign.currentBreakpoint) {
      this.handleBreakpointChange(currentBreakpoint);
    }
  }

  /**
   * Update mobile features
   */
  updateMobileFeatures(deltaTime) {
    // Update mobile-specific features
  }

  /**
   * Check if point is in joystick
   */
  isPointInJoystick(x, y) {
    const joystick = this.touchControls.virtualJoystick.element;
    if (!joystick) return false;

    const rect = joystick.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

    return distance <= rect.width / 2;
  }

  /**
   * Update virtual joystick
   */
  updateVirtualJoystick(x, y) {
    const joystick = this.touchControls.virtualJoystick.element;
    const knob = this.touchControls.virtualJoystick.knob;

    if (!joystick || !knob) return;

    const rect = joystick.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = x - centerX;
    const deltaY = y - centerY;
    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
    const maxDistance = rect.width / 2 - 15; // Account for knob radius

    if (distance > maxDistance) {
      const angle = Math.atan2(deltaY, deltaX);
      const newX = Math.cos(angle) * maxDistance;
      const newY = Math.sin(angle) * maxDistance;

      knob.style.transform = `translate(${newX - 15}px, ${newY - 15}px)`;

      // Calculate joystick input
      this.touchControls.virtualJoystick.position = {
        x: newX / maxDistance,
        y: newY / maxDistance,
      };
    } else {
      knob.style.transform = `translate(${deltaX - 15}px, ${deltaY - 15}px)`;

      // Calculate joystick input
      this.touchControls.virtualJoystick.position = {
        x: deltaX / maxDistance,
        y: deltaY / maxDistance,
      };
    }

    // Emit joystick input
    this.eventBus.emit('input:joystick', {
      position: this.touchControls.virtualJoystick.position,
      timestamp: Date.now(),
    });
  }

  /**
   * Reset virtual joystick
   */
  resetVirtualJoystick() {
    const knob = this.touchControls.virtualJoystick.knob;

    if (knob) {
      knob.style.transform = 'translate(-50%, -50%)';
    }

    this.touchControls.virtualJoystick.active = false;
    this.touchControls.virtualJoystick.position = { x: 0, y: 0 };
  }

  /**
   * Handle virtual button press
   */
  handleVirtualButtonPress(buttonId) {
    this.eventBus.emit('input:buttonPress', {
      button: buttonId,
      timestamp: Date.now(),
    });
  }

  /**
   * Handle virtual button release
   */
  handleVirtualButtonRelease(buttonId) {
    this.eventBus.emit('input:buttonRelease', {
      button: buttonId,
      timestamp: Date.now(),
    });
  }

  /**
   * Handle touch zone start
   */
  handleTouchZoneStart(zoneName, event) {
    this.eventBus.emit('input:zoneStart', {
      zone: zoneName,
      touch: event.touches[0],
      timestamp: Date.now(),
    });
  }

  /**
   * Handle touch zone move
   */
  handleTouchZoneMove(zoneName, event) {
    this.eventBus.emit('input:zoneMove', {
      zone: zoneName,
      touch: event.touches[0],
      timestamp: Date.now(),
    });
  }

  /**
   * Handle touch zone end
   */
  handleTouchZoneEnd(zoneName, event) {
    this.eventBus.emit('input:zoneEnd', {
      zone: zoneName,
      touch: event.changedTouches[0],
      timestamp: Date.now(),
    });
  }

  /**
   * Recognize gestures
   */
  recognizeGestures() {
    const history = this.touchControls.touchHistory;

    if (history.length < 2) return;

    const lastTouch = history[history.length - 1];
    const firstTouch = history[0];

    // Recognize tap
    if (this.isTap(history)) {
      this.handleTap({ touch: lastTouch });
    }

    // Recognize double tap
    if (this.isDoubleTap(history)) {
      this.handleDoubleTap({ touch: lastTouch });
    }

    // Recognize long press
    if (this.isLongPress(history)) {
      this.handleLongPress({ touch: lastTouch });
    }

    // Recognize swipe
    if (this.isSwipe(history)) {
      const direction = this.getSwipeDirection(history);
      this.handleSwipe({ touch: lastTouch, direction });
    }
  }

  /**
   * Check if gesture is tap
   */
  isTap(history) {
    const lastTouch = history[history.length - 1];
    const firstTouch = history[0];

    if (lastTouch.type !== 'end') return false;

    const duration = lastTouch.timestamp - firstTouch.timestamp;
    const distance = Math.sqrt(
      (lastTouch.x - firstTouch.x) ** 2 + (lastTouch.y - firstTouch.y) ** 2
    );

    return (
      duration < this.gestureRecognizers.tap.maxDuration &&
      distance < this.gestureRecognizers.tap.threshold
    );
  }

  /**
   * Check if gesture is double tap
   */
  isDoubleTap(history) {
    // This is a simplified implementation
    // In a real implementation, you'd need to track multiple taps
    return false;
  }

  /**
   * Check if gesture is long press
   */
  isLongPress(history) {
    const lastTouch = history[history.length - 1];
    const firstTouch = history[0];

    const duration = lastTouch.timestamp - firstTouch.timestamp;

    return duration >= this.gestureRecognizers.longPress.minDuration;
  }

  /**
   * Check if gesture is swipe
   */
  isSwipe(history) {
    const lastTouch = history[history.length - 1];
    const firstTouch = history[0];

    if (lastTouch.type !== 'end') return false;

    const distance = Math.sqrt(
      (lastTouch.x - firstTouch.x) ** 2 + (lastTouch.y - firstTouch.y) ** 2
    );

    return distance >= this.gestureRecognizers.swipe.threshold;
  }

  /**
   * Get swipe direction
   */
  getSwipeDirection(history) {
    const lastTouch = history[history.length - 1];
    const firstTouch = history[0];

    const deltaX = lastTouch.x - firstTouch.x;
    const deltaY = lastTouch.y - firstTouch.y;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }

  /**
   * Handle breakpoint change
   */
  handleBreakpointChange(breakpoint) {
    this.responsiveDesign.currentBreakpoint = breakpoint;
    this.responsiveDesign.layoutMode = this.getLayoutMode(breakpoint);

    this.applyLayoutMode(this.responsiveDesign.layoutMode);

    this.logger.info(`Breakpoint changed to: ${breakpoint}`);
  }

  /**
   * Set performance level
   */
  setPerformanceLevel(level) {
    this.mobileState.performanceLevel = level;

    this.applyPerformanceSettings(level);

    this.eventBus.emit('performance:levelChange', {
      level,
      timestamp: Date.now(),
    });
  }

  /**
   * Apply performance settings
   */
  applyPerformanceSettings(level) {
    const settings = this.mobileConfig.performanceLevels[level];

    if (settings) {
      // Apply performance settings
      this.logger.info(`Applied performance settings for level: ${level}`);
    }
  }

  /**
   * Remove touch event listeners
   */
  removeTouchEventListeners() {
    document.removeEventListener('touchstart', this.handleTouchStart);
    document.removeEventListener('touchmove', this.handleTouchMove);
    document.removeEventListener('touchend', this.handleTouchEnd);
    document.removeEventListener('touchcancel', this.handleTouchCancel);
  }

  /**
   * Remove responsive design listeners
   */
  removeResponsiveDesignListeners() {
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener(
      'orientationchange',
      this.handleOrientationChange
    );
  }

  /**
   * Get mobile state
   */
  getMobileState() {
    return { ...this.mobileState };
  }

  /**
   * Get touch controls
   */
  getTouchControls() {
    return { ...this.touchControls };
  }

  /**
   * Get responsive design
   */
  getResponsiveDesign() {
    return { ...this.responsiveDesign };
  }

  /**
   * Get mobile features
   */
  getMobileFeatures() {
    return { ...this.mobileFeatures };
  }

  /**
   * Enable mobile mode
   */
  enableMobileMode() {
    this.mobileState.isMobile = true;
    this.setupTouchControls();
    this.setupMobileFeatures();
  }

  /**
   * Disable mobile mode
   */
  disableMobileMode() {
    this.mobileState.isMobile = false;
    this.removeTouchEventListeners();
  }
}

export default MobileOptimizationSystem;
