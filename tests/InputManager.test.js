/**
 * InputManager.test.js - Comprehensive test suite for InputManager class
 */

import { InputManager } from '../src/core/InputManager.js';
import { EventBus } from '../src/core/EventBus.js';
import { Logger } from '../src/utils/Logger.js';

// Mock DOM methods
Object.defineProperty(document, 'addEventListener', {
  value: jest.fn(),
  writable: true,
});

Object.defineProperty(document, 'removeEventListener', {
  value: jest.fn(),
  writable: true,
});

Object.defineProperty(document, 'querySelectorAll', {
  value: jest.fn().mockReturnValue([]),
  writable: true,
});

Object.defineProperty(navigator, 'getGamepads', {
  value: jest.fn().mockReturnValue([]),
  writable: true,
});

describe('InputManager', () => {
  let inputManager;
  let eventBus;
  let logger;

  beforeEach(() => {
    eventBus = new EventBus();
    logger = new Logger(true);

    inputManager = new InputManager({
      eventBus,
      logger,
      config: {
        getConfigValue: jest.fn(),
      },
    });
  });

  afterEach(() => {
    if (inputManager) {
      inputManager.cleanup();
    }
  });

  describe('Initialization', () => {
    test('should initialize with required dependencies', () => {
      expect(inputManager.eventBus).toBe(eventBus);
      expect(inputManager.logger).toBe(logger);
      expect(inputManager.config).toBeDefined();
    });

    test('should throw error when eventBus is missing', () => {
      expect(() => {
        new InputManager({ logger, config: {} });
      }).toThrow('InputManager requires eventBus dependency');
    });

    test('should throw error when logger is missing', () => {
      expect(() => {
        new InputManager({ eventBus, config: {} });
      }).toThrow('InputManager requires logger dependency');
    });

    test('should initialize with default settings', () => {
      expect(inputManager.settings.mouseSensitivity).toBe(1.0);
      expect(inputManager.settings.keyboardLayout).toBe('qwerty');
      expect(inputManager.settings.enableMouseLook).toBe(true);
      expect(inputManager.settings.enableKeyboardNavigation).toBe(true);
      expect(inputManager.settings.enableGamepad).toBe(true);
      expect(inputManager.settings.enableTouch).toBe(true);
    });

    test('should initialize input mappings', () => {
      expect(inputManager.keyMappings.has('moveUp')).toBe(true);
      expect(inputManager.keyMappings.has('jump')).toBe(true);
      expect(inputManager.mouseMappings.has('leftClick')).toBe(true);
      expect(inputManager.gamepadMappings.has('jump')).toBe(true);
      expect(inputManager.touchMappings.has('tap')).toBe(true);
    });

    test('should set up accessibility features', () => {
      expect(inputManager.accessibility.keyboardNavigation).toBeDefined();
      expect(inputManager.accessibility.focusManagement).toBe(true);
      expect(inputManager.accessibility.focusableElements).toBeInstanceOf(Set);
      expect(inputManager.accessibility.tabOrder).toBeInstanceOf(Array);
    });
  });

  describe('Keyboard Input Handling', () => {
    test('should handle key down events', () => {
      const eventSpy = jest.fn();
      inputManager.eventBus.on('input:keyDown', eventSpy);

      const mockEvent = {
        code: 'KeyA',
        key: 'a',
        keyCode: 65,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: false,
        preventDefault: jest.fn(),
      };

      inputManager.handleKeyDown(mockEvent);

      expect(inputManager.keys.has('KeyA')).toBe(true);
      expect(inputManager.keys.get('KeyA').pressed).toBe(true);
      expect(eventSpy).toHaveBeenCalledWithEventData({
        key: 'KeyA',
        keyName: 'A',
        code: 'KeyA',
        keyCode: 65,
      });
    });

    test('should handle key up events', () => {
      const eventSpy = jest.fn();
      inputManager.eventBus.on('input:keyUp', eventSpy);

      // First press the key
      inputManager.keys.set('KeyA', { pressed: true, timestamp: Date.now() });

      const mockEvent = {
        code: 'KeyA',
        key: 'a',
        keyCode: 65,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: false,
        preventDefault: jest.fn(),
      };

      inputManager.handleKeyUp(mockEvent);

      expect(inputManager.keys.get('KeyA').pressed).toBe(false);
      expect(eventSpy).toHaveBeenCalledWithEventData({
        key: 'KeyA',
        keyName: 'A',
      });
    });

    test('should handle key press events', () => {
      const eventSpy = jest.fn();
      inputManager.eventBus.on('input:keyPress', eventSpy);

      const mockEvent = {
        key: 'a',
        charCode: 97,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: false,
        preventDefault: jest.fn(),
      };

      inputManager.handleKeyPress(mockEvent);

      expect(eventSpy).toHaveBeenCalledWithEventData({
        key: 'a',
        charCode: 97,
      });
    });

    test('should track key repeat state', () => {
      const mockEvent = {
        code: 'KeyA',
        key: 'a',
        keyCode: 65,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: false,
        preventDefault: jest.fn(),
      };

      // First press
      inputManager.handleKeyDown(mockEvent);
      expect(inputManager.keys.get('KeyA').repeat).toBe(false);

      // Second press (repeat)
      inputManager.handleKeyDown(mockEvent);
      expect(inputManager.keys.get('KeyA').repeat).toBe(true);
    });

    test('should handle special keys correctly', () => {
      const specialKeys = [
        'Space',
        'Enter',
        'Escape',
        'Tab',
        'ArrowUp',
        'ArrowDown',
      ];

      specialKeys.forEach((keyCode) => {
        const mockEvent = {
          code: keyCode,
          key: keyCode,
          keyCode: 32,
          ctrlKey: false,
          shiftKey: false,
          altKey: false,
          metaKey: false,
          preventDefault: jest.fn(),
        };

        expect(() => {
          inputManager.handleKeyDown(mockEvent);
        }).not.toThrow();
      });
    });
  });

  describe('Mouse Input Handling', () => {
    test('should handle mouse down events', () => {
      const eventSpy = jest.fn();
      inputManager.eventBus.on('input:mouseDown', eventSpy);

      const mockEvent = {
        button: 0,
        clientX: 100,
        clientY: 200,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: false,
        preventDefault: jest.fn(),
      };

      inputManager.handleMouseDown(mockEvent);

      expect(inputManager.mouse.buttons.has(0)).toBe(true);
      expect(inputManager.mouse.buttons.get(0).pressed).toBe(true);
      expect(inputManager.mouse.x).toBe(100);
      expect(inputManager.mouse.y).toBe(200);
      expect(eventSpy).toHaveBeenCalledWithEventData({
        button: 0,
        buttonName: 'Left',
        x: 100,
        y: 200,
      });
    });

    test('should handle mouse up events', () => {
      const eventSpy = jest.fn();
      inputManager.eventBus.on('input:mouseUp', eventSpy);

      // First press the button
      inputManager.mouse.buttons.set(0, {
        pressed: true,
        timestamp: Date.now(),
      });

      const mockEvent = {
        button: 0,
        clientX: 150,
        clientY: 250,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: false,
        preventDefault: jest.fn(),
      };

      inputManager.handleMouseUp(mockEvent);

      expect(inputManager.mouse.buttons.get(0).pressed).toBe(false);
      expect(eventSpy).toHaveBeenCalledWithEventData({
        button: 0,
        buttonName: 'Left',
      });
    });

    test('should handle mouse move events', () => {
      const eventSpy = jest.fn();
      inputManager.eventBus.on('input:mouseMove', eventSpy);

      // Set initial position
      inputManager.mouse.x = 100;
      inputManager.mouse.y = 200;

      const mockEvent = {
        clientX: 150,
        clientY: 250,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: false,
        preventDefault: jest.fn(),
      };

      inputManager.handleMouseMove(mockEvent);

      expect(inputManager.mouse.x).toBe(150);
      expect(inputManager.mouse.y).toBe(250);
      expect(eventSpy).toHaveBeenCalledWithEventData({
        x: 150,
        y: 250,
        deltaX: 50,
        deltaY: 50,
      });
    });

    test('should handle wheel events', () => {
      const eventSpy = jest.fn();
      inputManager.eventBus.on('input:wheel', eventSpy);

      const mockEvent = {
        deltaY: 100,
        clientX: 100,
        clientY: 200,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: false,
        preventDefault: jest.fn(),
      };

      inputManager.handleWheel(mockEvent);

      expect(inputManager.mouse.wheel).toBe(100);
      expect(eventSpy).toHaveBeenCalledWithEventData({
        deltaY: 100,
        direction: 'down',
      });
    });

    test('should apply mouse sensitivity', () => {
      inputManager.settings.mouseSensitivity = 2.0;
      inputManager.mouse.x = 100;
      inputManager.mouse.y = 200;

      const mockEvent = {
        clientX: 150,
        clientY: 250,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: false,
        preventDefault: jest.fn(),
      };

      const eventSpy = jest.fn();
      inputManager.eventBus.on('input:mouseMove', eventSpy);

      inputManager.handleMouseMove(mockEvent);

      expect(eventSpy).toHaveBeenCalledWithEventData({
        deltaX: 100, // 50 * 2.0
        deltaY: 100, // 50 * 2.0
      });
    });

    test('should handle Y-axis inversion', () => {
      inputManager.settings.invertY = true;
      inputManager.mouse.x = 100;
      inputManager.mouse.y = 200;

      const mockEvent = {
        clientX: 150,
        clientY: 250,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: false,
        preventDefault: jest.fn(),
      };

      const eventSpy = jest.fn();
      inputManager.eventBus.on('input:mouseMove', eventSpy);

      inputManager.handleMouseMove(mockEvent);

      expect(eventSpy).toHaveBeenCalledWithEventData({
        deltaX: 50,
        deltaY: -50, // Inverted
      });
    });
  });

  describe('Touch Input Handling', () => {
    test('should handle touch start events', () => {
      const eventSpy = jest.fn();
      inputManager.eventBus.on('input:touchStart', eventSpy);

      const mockEvent = {
        changedTouches: [
          {
            identifier: 1,
            clientX: 100,
            clientY: 200,
            force: 0.8,
          },
        ],
        preventDefault: jest.fn(),
      };

      inputManager.handleTouchStart(mockEvent);

      expect(inputManager.touch.touches.has(1)).toBe(true);
      expect(inputManager.touch.touches.get(1).x).toBe(100);
      expect(inputManager.touch.touches.get(1).y).toBe(200);
      expect(inputManager.touch.touches.get(1).pressure).toBe(0.8);
      expect(eventSpy).toHaveBeenCalled();
      const callData = eventSpy.mock.calls[0][0];
      expect(callData.touches).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            x: 100,
            y: 200,
            pressure: 0.8,
          }),
        ])
      );
    });

    test('should handle touch end events', () => {
      const eventSpy = jest.fn();
      inputManager.eventBus.on('input:touchEnd', eventSpy);

      // First add a touch
      inputManager.touch.touches.set(1, {
        x: 100,
        y: 200,
        startX: 100,
        startY: 200,
        startTime: Date.now(),
        pressure: 1.0,
      });

      const mockEvent = {
        changedTouches: [
          {
            identifier: 1,
            clientX: 150,
            clientY: 250,
          },
        ],
        preventDefault: jest.fn(),
      };

      inputManager.handleTouchEnd(mockEvent);

      expect(inputManager.touch.touches.has(1)).toBe(false);
      expect(eventSpy).toHaveBeenCalled();
      const callData = eventSpy.mock.calls[0][0];
      expect(callData.touches).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            x: 150,
            y: 250,
          }),
        ])
      );
    });

    test('should handle touch move events', () => {
      const eventSpy = jest.fn();
      inputManager.eventBus.on('input:touchMove', eventSpy);

      // First add a touch
      inputManager.touch.touches.set(1, {
        x: 100,
        y: 200,
        startX: 100,
        startY: 200,
        startTime: Date.now(),
        pressure: 1.0,
      });

      const mockEvent = {
        changedTouches: [
          {
            identifier: 1,
            clientX: 150,
            clientY: 250,
            force: 0.9,
          },
        ],
        preventDefault: jest.fn(),
      };

      inputManager.handleTouchMove(mockEvent);

      expect(inputManager.touch.touches.get(1).x).toBe(150);
      expect(inputManager.touch.touches.get(1).y).toBe(250);
      expect(eventSpy).toHaveBeenCalled();
      const callData = eventSpy.mock.calls[0][0];
      expect(callData.touches).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            x: 150,
            y: 250,
            pressure: 0.9,
          }),
        ])
      );
    });

    test('should handle multiple touches', () => {
      const eventSpy = jest.fn();
      inputManager.eventBus.on('input:touchStart', eventSpy);

      const mockEvent = {
        changedTouches: [
          { identifier: 1, clientX: 100, clientY: 200, force: 1.0 },
          { identifier: 2, clientX: 300, clientY: 400, force: 0.8 },
        ],
        preventDefault: jest.fn(),
      };

      inputManager.handleTouchStart(mockEvent);

      expect(inputManager.touch.touches.size).toBe(2);
      expect(inputManager.touch.touches.has(1)).toBe(true);
      expect(inputManager.touch.touches.has(2)).toBe(true);
      expect(eventSpy).toHaveBeenCalled();
      const callData = eventSpy.mock.calls[0][0];
      expect(callData.touches).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 1 }),
          expect.objectContaining({ id: 2 }),
        ])
      );
    });
  });

  describe('Gamepad Input Handling', () => {
    test('should handle gamepad connected events', () => {
      const eventSpy = jest.fn();
      inputManager.eventBus.on('input:gamepadConnected', eventSpy);

      const mockEvent = {
        gamepad: {
          id: 'Test Gamepad',
          index: 0,
        },
      };

      inputManager.handleGamepadConnected(mockEvent);

      expect(inputManager.gamepad.controllers.has(0)).toBe(true);
      expect(inputManager.gamepad.controllers.get(0).id).toBe('Test Gamepad');
      expect(inputManager.gamepad.controllers.get(0).connected).toBe(true);
      expect(eventSpy).toHaveBeenCalledWithEventData({
        id: 'Test Gamepad',
        index: 0,
      });
    });

    test('should handle gamepad disconnected events', () => {
      const eventSpy = jest.fn();
      inputManager.eventBus.on('input:gamepadDisconnected', eventSpy);

      // First connect a gamepad
      inputManager.gamepad.controllers.set(0, {
        id: 'Test Gamepad',
        index: 0,
        connected: true,
        buttons: new Map(),
        axes: new Map(),
      });

      const mockEvent = {
        gamepad: {
          id: 'Test Gamepad',
          index: 0,
        },
      };

      inputManager.handleGamepadDisconnected(mockEvent);

      expect(inputManager.gamepad.controllers.has(0)).toBe(false);
      expect(eventSpy).toHaveBeenCalledWithEventData({
        id: 'Test Gamepad',
        index: 0,
      });
    });

    test('should update gamepad state', () => {
      // Mock navigator.getGamepads
      const mockGamepad = {
        buttons: [
          { pressed: true, value: 1.0 },
          { pressed: false, value: 0.0 },
        ],
        axes: [0.5, -0.3],
      };

      navigator.getGamepads = jest.fn().mockReturnValue([mockGamepad]);

      // Connect a gamepad first
      inputManager.gamepad.controllers.set(0, {
        id: 'Test Gamepad',
        index: 0,
        connected: true,
        buttons: new Map(),
        axes: new Map(),
      });

      const buttonSpy = jest.fn();
      const axisSpy = jest.fn();
      inputManager.eventBus.on('input:gamepadButton', buttonSpy);
      inputManager.eventBus.on('input:gamepadAxis', axisSpy);

      inputManager.updateGamepadState();

      expect(buttonSpy).toHaveBeenCalledWithEventData({
        controller: 0,
        button: 0,
        pressed: true,
        value: 1.0,
      });

      expect(axisSpy).toHaveBeenCalledWithEventData({
        controller: 0,
        axis: 0,
        value: 0.5,
      });
    });

    test('should apply deadzone to gamepad axes', () => {
      inputManager.settings.deadzone = 0.2;

      const mockGamepad = {
        buttons: [],
        axes: [0.1, 0.5], // First axis should be zeroed due to deadzone
      };

      navigator.getGamepads = jest.fn().mockReturnValue([mockGamepad]);

      inputManager.gamepad.controllers.set(0, {
        id: 'Test Gamepad',
        index: 0,
        connected: true,
        buttons: new Map(),
        axes: new Map(),
      });

      const axisSpy = jest.fn();
      inputManager.eventBus.on('input:gamepadAxis', axisSpy);

      inputManager.updateGamepadState();

      // First axis (0.1) is within deadzone (0.2), so no event emitted for it
      // Only axis 1 (0.5) should emit since it exceeds the deadzone
      expect(axisSpy).toHaveBeenCalledTimes(1);
      expect(axisSpy).toHaveBeenCalledWithEventData({
        controller: 0,
        axis: 1,
        value: 0.5, // Should pass through deadzone
      });
    });
  });

  describe('Accessibility Features', () => {
    test('should handle tab navigation', () => {
      const mockElement1 = { focus: jest.fn() };
      const mockElement2 = { focus: jest.fn() };

      inputManager.accessibility.tabOrder = [mockElement1, mockElement2];
      inputManager.accessibility.currentFocusIndex = 0;

      const mockEvent = {
        key: 'Tab',
        shiftKey: false,
        preventDefault: jest.fn(),
      };

      inputManager.handleTabNavigation(mockEvent);

      expect(mockElement2.focus).toHaveBeenCalled();
      expect(inputManager.accessibility.currentFocusIndex).toBe(1);
    });

    test('should handle shift+tab navigation', () => {
      const mockElement1 = { focus: jest.fn() };
      const mockElement2 = { focus: jest.fn() };

      inputManager.accessibility.tabOrder = [mockElement1, mockElement2];
      inputManager.accessibility.currentFocusIndex = 1;

      const mockEvent = {
        key: 'Tab',
        shiftKey: true,
        preventDefault: jest.fn(),
      };

      inputManager.handleTabNavigation(mockEvent);

      expect(mockElement1.focus).toHaveBeenCalled();
      expect(inputManager.accessibility.currentFocusIndex).toBe(0);
    });

    test('should handle element activation', () => {
      const mockElement = { click: jest.fn() };
      Object.defineProperty(document, 'activeElement', {
        value: mockElement,
        writable: true,
        configurable: true,
      });

      const mockEvent = {
        key: 'Enter',
        preventDefault: jest.fn(),
      };

      inputManager.handleActivation(mockEvent);

      expect(mockElement.click).toHaveBeenCalled();
    });

    test('should handle escape key', () => {
      const eventSpy = jest.fn();
      inputManager.eventBus.on('input:escape', eventSpy);

      const mockEvent = {
        key: 'Escape',
        preventDefault: jest.fn(),
      };

      inputManager.handleEscape(mockEvent);

      expect(eventSpy).toHaveBeenCalled();
      const callData = eventSpy.mock.calls[0][0];
      expect(callData.timestamp).toEqual(expect.any(Number));
    });

    test('should handle arrow navigation', () => {
      const eventSpy = jest.fn();
      inputManager.eventBus.on('input:arrowNavigation', eventSpy);

      const mockEvent = {
        key: 'ArrowUp',
        preventDefault: jest.fn(),
      };

      inputManager.handleArrowNavigation(mockEvent);

      expect(eventSpy).toHaveBeenCalledWithEventData({
        direction: 'up',
      });
    });
  });

  describe('Input Mapping', () => {
    test('should handle mapped keyboard actions', () => {
      const eventSpy = jest.fn();
      inputManager.eventBus.on('input:action', eventSpy);

      const mockEvent = {
        code: 'Space',
        key: ' ',
        keyCode: 32,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: false,
        preventDefault: jest.fn(),
      };

      inputManager.handleKeyDown(mockEvent);

      expect(eventSpy).toHaveBeenCalledWithEventData({
        action: 'jump',
        inputType: 'keyboard',
        input: 'Space',
        state: 'down',
      });
    });

    test('should handle mapped mouse actions', () => {
      const eventSpy = jest.fn();
      inputManager.eventBus.on('input:action', eventSpy);

      const mockEvent = {
        button: 0,
        clientX: 100,
        clientY: 200,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: false,
        preventDefault: jest.fn(),
      };

      inputManager.handleMouseDown(mockEvent);

      expect(eventSpy).toHaveBeenCalledWithEventData({
        action: 'leftClick',
        inputType: 'mouse',
        input: 0,
        state: 'down',
      });
    });

    test('should set and get key mappings', () => {
      inputManager.setKeyMapping('customAction', ['KeyF']);

      expect(inputManager.getKeyMapping('customAction')).toEqual(['KeyF']);
      expect(inputManager.getKeyMapping('nonExistent')).toEqual([]);
    });
  });

  describe('Input State Management', () => {
    test('should check if key is pressed', () => {
      inputManager.keys.set('KeyA', { pressed: true, timestamp: Date.now() });
      inputManager.keys.set('KeyB', { pressed: false, timestamp: Date.now() });

      expect(inputManager.isKeyPressed('KeyA')).toBe(true);
      expect(inputManager.isKeyPressed('KeyB')).toBe(false);
      expect(inputManager.isKeyPressed('KeyC')).toBe(false);
    });

    test('should check if mouse button is pressed', () => {
      inputManager.mouse.buttons.set(0, {
        pressed: true,
        timestamp: Date.now(),
      });
      inputManager.mouse.buttons.set(1, {
        pressed: false,
        timestamp: Date.now(),
      });

      expect(inputManager.isMouseButtonPressed(0)).toBe(true);
      expect(inputManager.isMouseButtonPressed(1)).toBe(false);
      expect(inputManager.isMouseButtonPressed(2)).toBe(false);
    });

    test('should get mouse position', () => {
      inputManager.mouse.x = 150;
      inputManager.mouse.y = 250;

      const position = inputManager.getMousePosition();
      expect(position).toEqual({ x: 150, y: 250 });
    });

    test('should get gamepad state', () => {
      const gamepadData = {
        id: 'Test Gamepad',
        index: 0,
        connected: true,
        buttons: new Map(),
        axes: new Map(),
      };

      inputManager.gamepad.controllers.set(0, gamepadData);

      expect(inputManager.getGamepadState(0)).toBe(gamepadData);
      expect(inputManager.getGamepadState(1)).toBeUndefined();
    });

    test('should get all gamepads', () => {
      const gamepad1 = {
        id: 'Gamepad 1',
        index: 0,
        connected: true,
        buttons: new Map(),
        axes: new Map(),
      };
      const gamepad2 = {
        id: 'Gamepad 2',
        index: 1,
        connected: true,
        buttons: new Map(),
        axes: new Map(),
      };

      inputManager.gamepad.controllers.set(0, gamepad1);
      inputManager.gamepad.controllers.set(1, gamepad2);

      const allGamepads = inputManager.getAllGamepads();
      expect(allGamepads).toHaveLength(2);
      expect(allGamepads).toContain(gamepad1);
      expect(allGamepads).toContain(gamepad2);
    });

    test('should get complete input state', () => {
      inputManager.keys.set('KeyA', { pressed: true, timestamp: Date.now() });
      inputManager.mouse.x = 100;
      inputManager.mouse.y = 200;

      const state = inputManager.getInputState();

      expect(state.keyboard).toBeDefined();
      expect(state.mouse).toBeDefined();
      expect(state.touch).toBeDefined();
      expect(state.gamepad).toBeDefined();
      expect(state.accessibility).toBeDefined();
    });
  });

  describe('Input Control', () => {
    test('should enable and disable input', () => {
      expect(inputManager.isEnabled).toBe(true);

      inputManager.disable();
      expect(inputManager.isEnabled).toBe(false);

      inputManager.enable();
      expect(inputManager.isEnabled).toBe(true);
    });

    test('should capture and release input', () => {
      expect(inputManager.isCaptured).toBe(false);

      inputManager.capture();
      expect(inputManager.isCaptured).toBe(true);

      inputManager.release();
      expect(inputManager.isCaptured).toBe(false);
    });

    test('should not process input when disabled', () => {
      const eventSpy = jest.fn();
      inputManager.eventBus.on('input:keyDown', eventSpy);

      inputManager.disable();

      const mockEvent = {
        code: 'KeyA',
        key: 'a',
        keyCode: 65,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: false,
        preventDefault: jest.fn(),
      };

      inputManager.handleKeyDown(mockEvent);

      expect(eventSpy).not.toHaveBeenCalled();
    });
  });

  describe('Utility Functions', () => {
    test('should get key name from key code', () => {
      expect(inputManager.getKeyName('KeyA')).toBe('A');
      expect(inputManager.getKeyName('Space')).toBe('Space');
      expect(inputManager.getKeyName('ArrowUp')).toBe('Up Arrow');
      expect(inputManager.getKeyName('UnknownKey')).toBe('UnknownKey');
    });

    test('should get mouse button name', () => {
      expect(inputManager.getMouseButtonName(0)).toBe('Left');
      expect(inputManager.getMouseButtonName(1)).toBe('Middle');
      expect(inputManager.getMouseButtonName(2)).toBe('Right');
      expect(inputManager.getMouseButtonName(3)).toBe('Back');
      expect(inputManager.getMouseButtonName(4)).toBe('Forward');
      expect(inputManager.getMouseButtonName(5)).toBe('Button 5');
    });
  });

  describe('Cleanup', () => {
    test('should clean up properly', () => {
      const removeEventListenerSpy = jest.spyOn(
        document,
        'removeEventListener'
      );

      inputManager.cleanup();

      expect(inputManager.keys.size).toBe(0);
      expect(inputManager.mouse.buttons.size).toBe(0);
      expect(inputManager.touch.touches.size).toBe(0);
      expect(inputManager.gamepad.controllers.size).toBe(0);
      expect(removeEventListenerSpy).toHaveBeenCalled();
    });
  });
});
