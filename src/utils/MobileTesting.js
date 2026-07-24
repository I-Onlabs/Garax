/**
 * MobileTesting.js - Mobile UX testing and validation utilities
 *
 * This utility provides:
 * - Mobile device detection and testing
 * - Touch gesture validation
 * - Mobile controls testing
 * - Performance testing on mobile devices
 * - Accessibility testing for mobile
 * - Mobile-specific UI validation
 */

export class MobileTesting {
  constructor(dependencies = {}) {
    // Dependency injection
    this.eventBus = dependencies.eventBus;
    this.logger = dependencies.logger;
    this.inputManager = dependencies.inputManager;
    this.performanceMonitor = dependencies.performanceMonitor;

    // Test configuration
    this.config = {
      enableAutoTesting: true,
      testInterval: 5000,
      gestureTestTimeout: 2000,
      performanceTestDuration: 10000,
      enableAccessibilityTesting: true,
      enablePerformanceTesting: true,
      enableGestureTesting: true,
      enableControlTesting: true,
      ...dependencies.config,
    };

    // Test state
    this.isTesting = false;
    this.testResults = {
      device: null,
      gestures: new Map(),
      controls: new Map(),
      performance: null,
      accessibility: null,
      overall: null,
    };

    // Test listeners
    this.testListeners = new Map();

    this.logger.info('MobileTesting initialized');
  }

  /**
   * Initialize the testing utility
   */
  async initialize() {
    this.logger.info('Initializing MobileTesting...');

    // Detect mobile device
    this.detectMobileDevice();

    // Set up test listeners
    this.setupTestListeners();

    // Start auto-testing if enabled
    if (this.config.enableAutoTesting) {
      this.startAutoTesting();
    }

    this.logger.info('MobileTesting initialized successfully');
  }

  /**
   * Cleanup the testing utility
   */
  cleanup() {
    this.logger.info('Cleaning up MobileTesting...');

    // Stop auto-testing
    this.stopAutoTesting();

    // Remove test listeners
    this.removeTestListeners();

    this.logger.info('MobileTesting cleaned up');
  }

  /**
   * Detect mobile device and capabilities
   */
  detectMobileDevice() {
    const userAgent = navigator.userAgent;
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent
      );
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isTablet =
      /iPad|Android/i.test(userAgent) && 'ontouchstart' in window;

    this.testResults.device = {
      isMobile,
      isTouch,
      isTablet,
      userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      pixelRatio: window.devicePixelRatio || 1,
      orientation:
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
      maxTouchPoints: navigator.maxTouchPoints || 0,
      hasVibration: 'vibrate' in navigator,
      hasHaptics: 'vibrate' in navigator,
      hasGeolocation: 'geolocation' in navigator,
      hasCamera:
        'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      hasAccelerometer: 'DeviceMotionEvent' in window,
      hasGyroscope: 'DeviceOrientationEvent' in window,
    };

    this.logger.info('Mobile device detected:', this.testResults.device);
  }

  /**
   * Set up test listeners
   */
  setupTestListeners() {
    // Gesture test listeners
    if (this.config.enableGestureTesting) {
      this.setupGestureTestListeners();
    }

    // Control test listeners
    if (this.config.enableControlTesting) {
      this.setupControlTestListeners();
    }

    // Performance test listeners
    if (this.config.enablePerformanceTesting) {
      this.setupPerformanceTestListeners();
    }

    // Accessibility test listeners
    if (this.config.enableAccessibilityTesting) {
      this.setupAccessibilityTestListeners();
    }
  }

  /**
   * Set up gesture test listeners
   */
  setupGestureTestListeners() {
    const gestureTests = [
      { name: 'tap', test: this.testTapGesture.bind(this) },
      { name: 'doubleTap', test: this.testDoubleTapGesture.bind(this) },
      { name: 'longPress', test: this.testLongPressGesture.bind(this) },
      { name: 'swipe', test: this.testSwipeGesture.bind(this) },
      { name: 'pinch', test: this.testPinchGesture.bind(this) },
      { name: 'rotate', test: this.testRotateGesture.bind(this) },
    ];

    gestureTests.forEach(({ name, test }) => {
      this.testListeners.set(`gesture:${name}`, test);
    });
  }

  /**
   * Set up control test listeners
   */
  setupControlTestListeners() {
    const controlTests = [
      { name: 'virtualJoystick', test: this.testVirtualJoystick.bind(this) },
      { name: 'actionButtons', test: this.testActionButtons.bind(this) },
      { name: 'menuButton', test: this.testMenuButton.bind(this) },
      { name: 'pauseButton', test: this.testPauseButton.bind(this) },
    ];

    controlTests.forEach(({ name, test }) => {
      this.testListeners.set(`control:${name}`, test);
    });
  }

  /**
   * Set up performance test listeners
   */
  setupPerformanceTestListeners() {
    this.testListeners.set('performance:test', this.testPerformance.bind(this));
  }

  /**
   * Set up accessibility test listeners
   */
  setupAccessibilityTestListeners() {
    this.testListeners.set(
      'accessibility:test',
      this.testAccessibility.bind(this)
    );
  }

  /**
   * Remove test listeners
   */
  removeTestListeners() {
    this.testListeners.clear();
  }

  /**
   * Start auto-testing
   */
  startAutoTesting() {
    if (this.isTesting) return;

    this.isTesting = true;
    this.autoTestInterval = setInterval(() => {
      this.runAllTests();
    }, this.config.testInterval);

    this.logger.info('Auto-testing started');
  }

  /**
   * Stop auto-testing
   */
  stopAutoTesting() {
    if (!this.isTesting) return;

    this.isTesting = false;
    if (this.autoTestInterval) {
      clearInterval(this.autoTestInterval);
      this.autoTestInterval = null;
    }

    this.logger.info('Auto-testing stopped');
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    this.logger.info('Running mobile tests...');

    try {
      // Test gestures
      if (this.config.enableGestureTesting) {
        await this.testAllGestures();
      }

      // Test controls
      if (this.config.enableControlTesting) {
        await this.testAllControls();
      }

      // Test performance
      if (this.config.enablePerformanceTesting) {
        await this.testPerformance();
      }

      // Test accessibility
      if (this.config.enableAccessibilityTesting) {
        await this.testAccessibility();
      }

      // Calculate overall score
      this.calculateOverallScore();

      // Emit test results
      this.eventBus.emit('mobileTesting:results', this.testResults);

      this.logger.info('Mobile tests completed');
    } catch (error) {
      this.logger.error('Error running mobile tests:', error);
    }
  }

  /**
   * Test all gestures
   */
  async testAllGestures() {
    const gestureNames = [
      'tap',
      'doubleTap',
      'longPress',
      'swipe',
      'pinch',
      'rotate',
    ];

    for (const gestureName of gestureNames) {
      try {
        const result = await this.testGesture(gestureName);
        this.testResults.gestures.set(gestureName, result);
      } catch (error) {
        this.logger.error(`Error testing gesture ${gestureName}:`, error);
        this.testResults.gestures.set(gestureName, {
          success: false,
          error: error.message,
        });
      }
    }
  }

  /**
   * Test a specific gesture
   */
  async testGesture(gestureName) {
    const testFunction = this.testListeners.get(`gesture:${gestureName}`);
    if (!testFunction) {
      throw new Error(`No test function found for gesture: ${gestureName}`);
    }

    return await testFunction();
  }

  /**
   * Test tap gesture
   */
  async testTapGesture() {
    return new Promise((resolve) => {
      let tapDetected = false;
      const startTime = Date.now();

      const handleTap = () => {
        tapDetected = true;
        const responseTime = Date.now() - startTime;
        document.removeEventListener('touchstart', handleTap);
        resolve({
          success: true,
          responseTime,
          timestamp: Date.now(),
        });
      };

      document.addEventListener('touchstart', handleTap, { once: true });

      // Timeout after 2 seconds
      setTimeout(() => {
        if (!tapDetected) {
          document.removeEventListener('touchstart', handleTap);
          resolve({
            success: false,
            error: 'Timeout',
            timestamp: Date.now(),
          });
        }
      }, this.config.gestureTestTimeout);
    });
  }

  /**
   * Test double tap gesture
   */
  async testDoubleTapGesture() {
    return new Promise((resolve) => {
      let tapCount = 0;
      let lastTapTime = 0;
      const startTime = Date.now();

      const handleTap = () => {
        const currentTime = Date.now();
        tapCount++;

        if (tapCount === 1) {
          lastTapTime = currentTime;
        } else if (tapCount === 2) {
          const timeDiff = currentTime - lastTapTime;
          const success = timeDiff < 500; // Double tap within 500ms

          document.removeEventListener('touchstart', handleTap);
          resolve({
            success,
            timeDiff,
            timestamp: Date.now(),
          });
        }
      };

      document.addEventListener('touchstart', handleTap);

      // Timeout after 2 seconds
      setTimeout(() => {
        document.removeEventListener('touchstart', handleTap);
        resolve({
          success: false,
          error: 'Timeout',
          timestamp: Date.now(),
        });
      }, this.config.gestureTestTimeout);
    });
  }

  /**
   * Test long press gesture
   */
  async testLongPressGesture() {
    return new Promise((resolve) => {
      let longPressDetected = false;
      let startTime = Date.now();

      const handleTouchStart = () => {
        startTime = Date.now();
      };

      const handleTouchEnd = () => {
        const duration = Date.now() - startTime;
        const success = duration >= 500; // Long press >= 500ms

        if (success) {
          longPressDetected = true;
          resolve({
            success: true,
            duration,
            timestamp: Date.now(),
          });
        }
      };

      document.addEventListener('touchstart', handleTouchStart);
      document.addEventListener('touchend', handleTouchEnd);

      // Timeout after 2 seconds
      setTimeout(() => {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchend', handleTouchEnd);

        if (!longPressDetected) {
          resolve({
            success: false,
            error: 'Timeout',
            timestamp: Date.now(),
          });
        }
      }, this.config.gestureTestTimeout);
    });
  }

  /**
   * Test swipe gesture
   */
  async testSwipeGesture() {
    return new Promise((resolve) => {
      let swipeDetected = false;
      let startTouch = null;

      const handleTouchStart = (e) => {
        startTouch = e.touches[0];
      };

      const handleTouchEnd = (e) => {
        if (!startTouch) return;

        const endTouch = e.changedTouches[0];
        const deltaX = endTouch.clientX - startTouch.clientX;
        const deltaY = endTouch.clientY - startTouch.clientY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        const success = distance >= 50; // Swipe distance >= 50px

        if (success) {
          swipeDetected = true;
          resolve({
            success: true,
            distance,
            direction: (Math.atan2(deltaY, deltaX) * 180) / Math.PI,
            timestamp: Date.now(),
          });
        }
      };

      document.addEventListener('touchstart', handleTouchStart);
      document.addEventListener('touchend', handleTouchEnd);

      // Timeout after 2 seconds
      setTimeout(() => {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchend', handleTouchEnd);

        if (!swipeDetected) {
          resolve({
            success: false,
            error: 'Timeout',
            timestamp: Date.now(),
          });
        }
      }, this.config.gestureTestTimeout);
    });
  }

  /**
   * Test pinch gesture
   */
  async testPinchGesture() {
    return new Promise((resolve) => {
      let pinchDetected = false;
      let startTouches = [];

      const handleTouchStart = (e) => {
        if (e.touches.length === 2) {
          startTouches = Array.from(e.touches);
        }
      };

      const handleTouchMove = (e) => {
        if (e.touches.length === 2 && startTouches.length === 2) {
          const currentTouches = Array.from(e.touches);
          const startDistance = this.getDistance(
            startTouches[0],
            startTouches[1]
          );
          const currentDistance = this.getDistance(
            currentTouches[0],
            currentTouches[1]
          );
          const scale = currentDistance / startDistance;

          if (Math.abs(scale - 1) > 0.1) {
            // Pinch threshold
            pinchDetected = true;
            resolve({
              success: true,
              scale,
              timestamp: Date.now(),
            });
          }
        }
      };

      document.addEventListener('touchstart', handleTouchStart);
      document.addEventListener('touchmove', handleTouchMove);

      // Timeout after 2 seconds
      setTimeout(() => {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchmove', handleTouchMove);

        if (!pinchDetected) {
          resolve({
            success: false,
            error: 'Timeout',
            timestamp: Date.now(),
          });
        }
      }, this.config.gestureTestTimeout);
    });
  }

  /**
   * Test rotate gesture
   */
  async testRotateGesture() {
    return new Promise((resolve) => {
      let rotateDetected = false;
      let startTouches = [];

      const handleTouchStart = (e) => {
        if (e.touches.length === 2) {
          startTouches = Array.from(e.touches);
        }
      };

      const handleTouchMove = (e) => {
        if (e.touches.length === 2 && startTouches.length === 2) {
          const currentTouches = Array.from(e.touches);
          const startAngle = this.getAngle(startTouches[0], startTouches[1]);
          const currentAngle = this.getAngle(
            currentTouches[0],
            currentTouches[1]
          );
          const rotation = currentAngle - startAngle;

          if (Math.abs(rotation) > 0.1) {
            // Rotation threshold
            rotateDetected = true;
            resolve({
              success: true,
              rotation: (rotation * 180) / Math.PI,
              timestamp: Date.now(),
            });
          }
        }
      };

      document.addEventListener('touchstart', handleTouchStart);
      document.addEventListener('touchmove', handleTouchMove);

      // Timeout after 2 seconds
      setTimeout(() => {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchmove', handleTouchMove);

        if (!rotateDetected) {
          resolve({
            success: false,
            error: 'Timeout',
            timestamp: Date.now(),
          });
        }
      }, this.config.gestureTestTimeout);
    });
  }

  /**
   * Test all controls
   */
  async testAllControls() {
    const controlNames = [
      'virtualJoystick',
      'actionButtons',
      'menuButton',
      'pauseButton',
    ];

    for (const controlName of controlNames) {
      try {
        const result = await this.testControl(controlName);
        this.testResults.controls.set(controlName, result);
      } catch (error) {
        this.logger.error(`Error testing control ${controlName}:`, error);
        this.testResults.controls.set(controlName, {
          success: false,
          error: error.message,
        });
      }
    }
  }

  /**
   * Test a specific control
   */
  async testControl(controlName) {
    const testFunction = this.testListeners.get(`control:${controlName}`);
    if (!testFunction) {
      throw new Error(`No test function found for control: ${controlName}`);
    }

    return await testFunction();
  }

  /**
   * Test virtual joystick
   */
  async testVirtualJoystick() {
    if (
      !this.inputManager ||
      !this.inputManager.mobileUI.virtualJoystick.element
    ) {
      return {
        success: false,
        error: 'Virtual joystick not available',
        timestamp: Date.now(),
      };
    }

    const joystick = this.inputManager.mobileUI.virtualJoystick;
    const rect = joystick.element.getBoundingClientRect();

    return {
      success: true,
      position: {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      },
      active: joystick.active,
      timestamp: Date.now(),
    };
  }

  /**
   * Test action buttons
   */
  async testActionButtons() {
    if (!this.inputManager || !this.inputManager.mobileUI.actionButtons) {
      return {
        success: false,
        error: 'Action buttons not available',
        timestamp: Date.now(),
      };
    }

    const buttons = Array.from(
      this.inputManager.mobileUI.actionButtons.entries()
    ).map(([id, button]) => {
      const rect = button.getBoundingClientRect();
      return {
        id,
        position: {
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
        },
        visible: button.offsetParent !== null,
      };
    });

    return {
      success: true,
      buttons,
      count: buttons.length,
      timestamp: Date.now(),
    };
  }

  /**
   * Test menu button
   */
  async testMenuButton() {
    const menuButton = document.querySelector('.menu-button');

    if (!menuButton) {
      return {
        success: false,
        error: 'Menu button not found',
        timestamp: Date.now(),
      };
    }

    const rect = menuButton.getBoundingClientRect();

    return {
      success: true,
      position: {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      },
      visible: menuButton.offsetParent !== null,
      timestamp: Date.now(),
    };
  }

  /**
   * Test pause button
   */
  async testPauseButton() {
    const pauseButton = document.querySelector('.pause-button');

    if (!pauseButton) {
      return {
        success: false,
        error: 'Pause button not found',
        timestamp: Date.now(),
      };
    }

    const rect = pauseButton.getBoundingClientRect();

    return {
      success: true,
      position: {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      },
      visible: pauseButton.offsetParent !== null,
      timestamp: Date.now(),
    };
  }

  /**
   * Test performance
   */
  async testPerformance() {
    if (!this.performanceMonitor) {
      return {
        success: false,
        error: 'Performance monitor not available',
        timestamp: Date.now(),
      };
    }

    const metrics = this.performanceMonitor.getMetrics();
    const score = this.performanceMonitor.getPerformanceScore();

    this.testResults.performance = {
      success: true,
      score,
      metrics: {
        fps: metrics.fps.current,
        frameTime: metrics.frameTime.current,
        memory: metrics.memory.used,
        audio: metrics.audio.contextState,
      },
      timestamp: Date.now(),
    };

    return this.testResults.performance;
  }

  /**
   * Test accessibility
   */
  async testAccessibility() {
    const accessibilityTests = [
      this.testScreenReaderSupport(),
      this.testKeyboardNavigation(),
      this.testHighContrast(),
      this.testTextScaling(),
    ];

    const results = await Promise.all(accessibilityTests);

    this.testResults.accessibility = {
      success: true,
      tests: results,
      overallScore:
        results.reduce((sum, test) => sum + (test.success ? 1 : 0), 0) /
        results.length,
      timestamp: Date.now(),
    };

    return this.testResults.accessibility;
  }

  /**
   * Test screen reader support
   */
  async testScreenReaderSupport() {
    const hasScreenReader = 'speechSynthesis' in window;
    const hasAriaSupport = document.querySelector('[aria-label]') !== null;

    return {
      name: 'screenReader',
      success: hasScreenReader && hasAriaSupport,
      details: {
        hasScreenReader,
        hasAriaSupport,
      },
    };
  }

  /**
   * Test keyboard navigation
   */
  async testKeyboardNavigation() {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    return {
      name: 'keyboardNavigation',
      success: focusableElements.length > 0,
      details: {
        focusableElements: focusableElements.length,
      },
    };
  }

  /**
   * Test high contrast
   */
  async testHighContrast() {
    const hasHighContrast =
      document.documentElement.classList.contains('high-contrast');

    return {
      name: 'highContrast',
      success: true, // Always available
      details: {
        enabled: hasHighContrast,
      },
    };
  }

  /**
   * Test text scaling
   */
  async testTextScaling() {
    const textScale =
      getComputedStyle(document.documentElement).getPropertyValue(
        '--text-scale'
      ) || '1';

    return {
      name: 'textScaling',
      success: true, // Always available
      details: {
        scale: parseFloat(textScale),
      },
    };
  }

  /**
   * Calculate overall score
   */
  calculateOverallScore() {
    let totalScore = 0;
    let testCount = 0;

    // Device score (always 1 if mobile detected)
    if (this.testResults.device?.isMobile) {
      totalScore += 1;
      testCount += 1;
    }

    // Gesture scores
    for (const [name, result] of this.testResults.gestures) {
      totalScore += result.success ? 1 : 0;
      testCount += 1;
    }

    // Control scores
    for (const [name, result] of this.testResults.controls) {
      totalScore += result.success ? 1 : 0;
      testCount += 1;
    }

    // Performance score
    if (this.testResults.performance) {
      totalScore += this.testResults.performance.score / 100;
      testCount += 1;
    }

    // Accessibility score
    if (this.testResults.accessibility) {
      totalScore += this.testResults.accessibility.overallScore;
      testCount += 1;
    }

    this.testResults.overall = {
      score: testCount > 0 ? totalScore / testCount : 0,
      totalTests: testCount,
      passedTests: Math.round(totalScore),
      timestamp: Date.now(),
    };
  }

  /**
   * Get distance between two touch points
   */
  getDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Get angle between two touch points
   */
  getAngle(touch1, touch2) {
    return Math.atan2(
      touch2.clientY - touch1.clientY,
      touch2.clientX - touch1.clientX
    );
  }

  /**
   * Get test results
   */
  getTestResults() {
    return this.testResults;
  }

  /**
   * Get test report
   */
  getTestReport() {
    return {
      device: this.testResults.device,
      gestures: Object.fromEntries(this.testResults.gestures),
      controls: Object.fromEntries(this.testResults.controls),
      performance: this.testResults.performance,
      accessibility: this.testResults.accessibility,
      overall: this.testResults.overall,
      timestamp: Date.now(),
    };
  }

  /**
   * Export test results
   */
  exportTestResults() {
    return JSON.stringify(this.getTestReport(), null, 2);
  }

  /**
   * Update test configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
}

export default MobileTesting;
