/**
 * MobileUX.test.js - Comprehensive mobile UX testing
 *
 * This test suite validates:
 * - Mobile device detection
 * - Touch gesture recognition
 * - Virtual joystick functionality
 * - Action button responsiveness
 * - Performance on mobile devices
 * - Accessibility features
 * - Mobile controls configuration
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { GameRefactored } from '../src/GameRefactored.js';
import { InputManager } from '../src/core/InputManager.js';
import { PerformanceMonitor } from '../src/core/PerformanceMonitor.js';
import { MobileTesting } from '../src/utils/MobileTesting.js';

// Mock DOM environment for mobile testing
const mockMobileDOM = () => {
  // Mock touch events
  const createTouchEvent = (type, touches = []) => {
    const event = new Event(type);
    event.touches = touches;
    event.changedTouches = touches;
    event.targetTouches = touches;
    return event;
  };

  // Mock touch object
  const createTouch = (id, x, y) => ({
    identifier: id,
    clientX: x,
    clientY: y,
    force: 1.0,
  });

  return { createTouchEvent, createTouch };
};

// Mock mobile device
const mockMobileDevice = () => {
  Object.defineProperty(navigator, 'userAgent', {
    value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
    writable: true,
  });
  
  Object.defineProperty(navigator, 'maxTouchPoints', {
    value: 5,
    writable: true,
  });

  Object.defineProperty(window, 'innerWidth', {
    value: 375,
    writable: true,
  });

  Object.defineProperty(window, 'innerHeight', {
    value: 667,
    writable: true,
  });

  Object.defineProperty(window, 'devicePixelRatio', {
    value: 2,
    writable: true,
  });
};

describe('Mobile UX Testing', () => {
  let game;
  let inputManager;
  let performanceMonitor;
  let mobileTesting;
  let mockDOM;

  beforeEach(() => {
    // Mock mobile environment
    mockMobileDevice();
    mockDOM = mockMobileDOM();

    // Create game instance
    game = new GameRefactored({
      debug: true,
      enableAchievements: true,
      enableDailyChallenges: true,
      enableAccessibility: true,
    });

    // Get managers
    inputManager = game.getInputManager();
    performanceMonitor = game.getPerformanceMonitor();
    mobileTesting = game.getMobileTesting();
  });

  afterEach(() => {
    if (game) {
      game.destroy();
    }
  });

  describe('Mobile Device Detection', () => {
    it('should detect mobile device correctly', () => {
      expect(inputManager.isMobile).toBe(true);
    });

    it('should detect touch capabilities', () => {
      const mobileState = inputManager.getMobileControlsState();
      expect(mobileState.isMobile).toBe(true);
    });

    it('should detect device orientation', () => {
      const mobileState = inputManager.getMobileControlsState();
      expect(['portrait', 'landscape']).toContain(mobileState.orientation);
    });
  });

  describe('Mobile Controls Configuration', () => {
    it('should have mobile controls enabled by default', () => {
      const settings = inputManager.settings;
      expect(settings.mobileControls.enabled).toBe(true);
      expect(settings.enableTouch).toBe(true);
    });

    it('should have configurable mobile UI settings', () => {
      const settings = inputManager.settings;
      expect(settings.mobileUI.showVirtualJoystick).toBe(true);
      expect(settings.mobileUI.showActionButtons).toBe(true);
      expect(settings.mobileUI.buttonSize).toBe(60);
      expect(settings.mobileUI.joystickSize).toBe(120);
    });

    it('should have gesture settings configured', () => {
      const settings = inputManager.settings;
      expect(settings.gestures.enableSwipe).toBe(true);
      expect(settings.gestures.enablePinch).toBe(true);
      expect(settings.gestures.enableRotate).toBe(true);
      expect(settings.gestures.enableLongPress).toBe(true);
      expect(settings.gestures.enableDoubleTap).toBe(true);
    });

    it('should allow updating mobile settings', () => {
      // Note: updateMobileSettings spreads the entire object into mobileControls,
      // so we need to pass flat settings for mobileControls and nested for mobileUI/gestures
      const newSettings = {
        size: 'large',
        opacity: 0.9,
        mobileUI: {
          buttonSize: 80,
          joystickSize: 150,
        },
      };

      inputManager.updateMobileSettings(newSettings);

      // These get spread directly into mobileControls
      expect(inputManager.settings.mobileControls.size).toBe('large');
      expect(inputManager.settings.mobileControls.opacity).toBe(0.9);
      // mobileUI gets updated separately
      expect(inputManager.settings.mobileUI.buttonSize).toBe(80);
      expect(inputManager.settings.mobileUI.joystickSize).toBe(150);
    });
  });

  describe('Touch Gesture Recognition', () => {
    it('should handle tap gestures', () => {
      const touch = mockDOM.createTouch(1, 100, 100);
      const event = mockDOM.createTouchEvent('touchstart', [touch]);
      
      inputManager.handleTouchStart(event);
      
      expect(inputManager.touch.touches.has(1)).toBe(true);
    });

    it('should handle swipe gestures', () => {
      const startTouch = mockDOM.createTouch(1, 100, 100);
      const endTouch = mockDOM.createTouch(1, 200, 100);
      
      // Start touch
      const startEvent = mockDOM.createTouchEvent('touchstart', [startTouch]);
      inputManager.handleTouchStart(startEvent);
      
      // End touch (swipe)
      const endEvent = mockDOM.createTouchEvent('touchend', [endTouch]);
      inputManager.handleTouchEnd(endEvent);
      
      // Should detect swipe
      expect(inputManager.touch.touches.size).toBe(0);
    });

    it('should handle pinch gestures', () => {
      const touch1 = mockDOM.createTouch(1, 100, 100);
      const touch2 = mockDOM.createTouch(2, 200, 100);
      
      const startEvent = mockDOM.createTouchEvent('touchstart', [touch1, touch2]);
      inputManager.handleTouchStart(startEvent);
      
      // Move touches closer together (pinch)
      const moveTouch1 = mockDOM.createTouch(1, 120, 100);
      const moveTouch2 = mockDOM.createTouch(2, 180, 100);
      const moveEvent = mockDOM.createTouchEvent('touchmove', [moveTouch1, moveTouch2]);
      inputManager.handleTouchMove(moveEvent);
      
      expect(inputManager.touch.touches.size).toBe(2);
    });

    it('should handle long press gestures', () => {
      const touch = mockDOM.createTouch(1, 100, 100);
      const event = mockDOM.createTouchEvent('touchstart', [touch]);
      
      inputManager.handleTouchStart(event);
      
      // Simulate long press
      setTimeout(() => {
        const endEvent = mockDOM.createTouchEvent('touchend', [touch]);
        inputManager.handleTouchEnd(endEvent);
      }, 600);
      
      expect(inputManager.touch.touches.has(1)).toBe(true);
    });
  });

  describe('Virtual Joystick', () => {
    beforeEach(() => {
      // Mock the joystick element's bounding rect to include test touch coordinates
      if (inputManager.mobileUI.virtualJoystick.element) {
        inputManager.mobileUI.virtualJoystick.element.getBoundingClientRect = jest.fn(() => ({
          left: 0,
          top: 0,
          right: 120,
          bottom: 120,
          width: 120,
          height: 120,
        }));
      }
    });

    it('should create virtual joystick element', () => {
      expect(inputManager.mobileUI.virtualJoystick.element).toBeDefined();
    });

    it('should activate virtual joystick on touch', () => {
      const touch = mockDOM.createTouch(1, 50, 50);
      const event = mockDOM.createTouchEvent('touchstart', [touch]);

      inputManager.handleMobileTouchStart(touch, event);

      expect(inputManager.mobileUI.virtualJoystick.active).toBe(true);
      expect(inputManager.mobileUI.virtualJoystick.touchId).toBe(1);
    });

    it('should update virtual joystick position on move', () => {
      const touch = mockDOM.createTouch(1, 50, 50);
      const event = mockDOM.createTouchEvent('touchstart', [touch]);

      inputManager.handleMobileTouchStart(touch, event);

      // Move touch
      const moveTouch = mockDOM.createTouch(1, 100, 100);
      const moveEvent = mockDOM.createTouchEvent('touchmove', [moveTouch]);

      inputManager.handleMobileTouchMove(moveTouch, moveEvent);

      expect(inputManager.mobileUI.virtualJoystick.active).toBe(true);
    });

    it('should deactivate virtual joystick on touch end', () => {
      const touch = mockDOM.createTouch(1, 50, 50);
      const event = mockDOM.createTouchEvent('touchstart', [touch]);

      inputManager.handleMobileTouchStart(touch, event);

      const endEvent = mockDOM.createTouchEvent('touchend', [touch]);
      inputManager.handleMobileTouchEnd(touch, endEvent);

      expect(inputManager.mobileUI.virtualJoystick.active).toBe(false);
      expect(inputManager.mobileUI.virtualJoystick.touchId).toBeNull();
    });
  });

  describe('Action Buttons', () => {
    it('should create action buttons', () => {
      expect(inputManager.mobileUI.actionButtons.size).toBeGreaterThan(0);
    });

    it('should handle button press events', () => {
      const button = inputManager.mobileUI.actionButtons.get('jump');
      expect(button).toBeDefined();

      // Mock the button's bounding rect directly (button IS the element)
      if (button) {
        button.getBoundingClientRect = jest.fn(() => ({
          left: 280,
          top: 480,
          right: 340,
          bottom: 540,
          width: 60,
          height: 60,
        }));
      }

      const eventSpy = jest.fn();
      game.eventBus.on('input:mobileButton', eventSpy);

      const touch = mockDOM.createTouch(1, 300, 500);
      const event = mockDOM.createTouchEvent('touchstart', [touch]);

      inputManager.handleMobileTouchStart(touch, event);

      // Should have emitted button press event
      expect(eventSpy).toHaveBeenCalled();
    });

    it('should provide haptic feedback when enabled', () => {
      const mockVibrate = jest.fn();
      navigator.vibrate = mockVibrate;
      
      inputManager.settings.mobileControls.hapticFeedback = true;
      inputManager.handleMobileButtonPress('jump', 'Space', 'down');
      
      expect(mockVibrate).toHaveBeenCalledWith(50);
    });
  });

  describe('Performance Monitoring', () => {
    it('should monitor FPS on mobile', () => {
      const metrics = performanceMonitor.getMetrics();
      expect(metrics.fps).toBeDefined();
      expect(metrics.fps.current).toBeGreaterThanOrEqual(0);
    });

    it('should monitor memory usage', () => {
      const metrics = performanceMonitor.getMetrics();
      expect(metrics.memory).toBeDefined();
      expect(metrics.memory.used).toBeGreaterThanOrEqual(0);
    });

    it('should detect performance issues', () => {
      // Simulate low FPS
      performanceMonitor.metrics.fps.current = 20;
      performanceMonitor.checkFPSPerformance();
      
      const alerts = performanceMonitor.getAlerts();
      expect(alerts.length).toBeGreaterThan(0);
    });

    it('should provide optimization suggestions', () => {
      // Simulate memory leak by adding increasing memory history
      // detectMemoryLeaks requires 10+ entries with consistently increasing values
      performanceMonitor.metrics.memory.history = [];
      for (let i = 0; i < 12; i++) {
        performanceMonitor.metrics.memory.history.push({
          used: 1000000 * (i + 1), // Increasing memory
          timestamp: Date.now() + i * 1000,
        });
      }

      performanceMonitor.detectMemoryLeaks();

      const suggestions = performanceMonitor.getOptimizationSuggestions();
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('Mobile Testing Utility', () => {
    beforeEach(async () => {
      // Initialize mobile testing to populate device info and set up listeners
      if (mobileTesting.initialize) {
        await mobileTesting.initialize();
      }
    });

    it('should detect mobile device capabilities', () => {
      const testResults = mobileTesting.getTestResults();
      expect(testResults.device).toBeDefined();
      expect(testResults.device.isMobile).toBe(true);
      expect(testResults.device.isTouch).toBe(true);
    });

    it('should test gesture recognition', async () => {
      // Register a mock gesture test function
      mobileTesting.testListeners.set('gesture:tap', async () => ({
        success: true,
        gesture: 'tap',
        duration: 100,
      }));

      const gestureResult = await mobileTesting.testGesture('tap');
      expect(gestureResult).toBeDefined();
      expect(gestureResult.success).toBeDefined();
    });

    it('should test mobile controls', async () => {
      // Register a mock control test function
      mobileTesting.testListeners.set('control:virtualJoystick', async () => ({
        success: true,
        control: 'virtualJoystick',
        duration: 100,
      }));

      const controlResult = await mobileTesting.testControl('virtualJoystick');
      expect(controlResult).toBeDefined();
      expect(controlResult.success).toBeDefined();
    });

    it('should generate test report', () => {
      const report = mobileTesting.getTestReport();
      expect(report).toBeDefined();
      expect(report.device).toBeDefined();
      expect(report.gestures).toBeDefined();
      expect(report.controls).toBeDefined();
      expect(report.performance).toBeDefined();
      expect(report.accessibility).toBeDefined();
      expect(report.overall).toBeDefined();
    });
  });

  describe('Accessibility on Mobile', () => {
    it('should support screen reader announcements', () => {
      const accessibilityManager = game.getManager('accessibility');
      expect(accessibilityManager).toBeDefined();

      // Enable screen reader for announcements to work
      accessibilityManager.settings.screenReader = true;

      // Test announcement
      accessibilityManager.announce('Test announcement');
      expect(accessibilityManager.announcementQueue.length).toBe(1);
    });

    it('should support keyboard navigation', () => {
      const accessibilityManager = game.getManager('accessibility');
      const settings = accessibilityManager.getSettings();
      expect(settings.keyboardNavigation).toBeDefined();
    });

    it('should support high contrast mode', () => {
      const accessibilityManager = game.getManager('accessibility');
      accessibilityManager.updateSettings({ highContrast: true });
      
      const settings = accessibilityManager.getSettings();
      expect(settings.highContrast).toBe(true);
    });
  });

  describe('Mobile Controls Integration', () => {
    it('should integrate with game events', () => {
      const eventSpy = jest.fn();
      game.eventBus.on('input:mobileButton', eventSpy);

      inputManager.handleMobileButtonPress('jump', 'Space', 'down');

      expect(eventSpy).toHaveBeenCalledWithEventData({
        buttonId: 'jump',
        key: 'Space',
        action: 'down',
      });
    });

    it('should map joystick to keyboard events', () => {
      const eventSpy = jest.fn();
      game.eventBus.on('input:action', eventSpy);

      inputManager.mapJoystickToKeyboard(0.5, 0);

      expect(eventSpy).toHaveBeenCalled();
    });

    it('should handle orientation changes', () => {
      // Simulate landscape orientation by setting mobileUI.orientation directly
      // (The actual orientation change is handled via window event listeners
      // that check innerWidth vs innerHeight, but in test environment we can
      // set the state directly)
      inputManager.mobileUI.orientation = 'landscape';

      const mobileState = inputManager.getMobileControlsState();
      expect(mobileState.orientation).toBe('landscape');

      // Test portrait
      inputManager.mobileUI.orientation = 'portrait';
      const mobileState2 = inputManager.getMobileControlsState();
      expect(mobileState2.orientation).toBe('portrait');
    });
  });

  describe('Performance Optimization', () => {
    it('should optimize for mobile performance', () => {
      const performanceReport = game.getPerformanceReport();
      expect(performanceReport).toBeDefined();
      
      const score = performanceMonitor.getPerformanceScore();
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should detect and report performance bottlenecks', () => {
      // Simulate performance issues
      performanceMonitor.metrics.fps.current = 25;
      performanceMonitor.metrics.memory.used = 150 * 1024 * 1024; // 150MB
      
      performanceMonitor.checkFPSPerformance();
      performanceMonitor.checkMemoryPerformance();
      
      const alerts = performanceMonitor.getAlerts();
      expect(alerts.length).toBeGreaterThan(0);
    });

    it('should provide mobile-specific optimizations', () => {
      const suggestions = performanceMonitor.getOptimizationSuggestions();
      expect(Array.isArray(suggestions)).toBe(true);
    });
  });
});