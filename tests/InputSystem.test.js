/**
 * InputSystem Tests
 * TODO: Add comprehensive tests for InputHandler
 */

import { InputHandler } from '../src/InputSystem/InputHandler.js';

describe('InputHandler', () => {
  let inputHandler;
  let mockEventBus;
  let mockLogger;
  let mockConfig;

  beforeEach(() => {
    mockEventBus = {
      emit: jest.fn(),
    };
    mockLogger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };
    mockConfig = {
      enableKeyboard: true,
      enableMouse: true,
      enableTouch: true,
    };

    inputHandler = new InputHandler({
      eventBus: mockEventBus,
      logger: mockLogger,
      config: mockConfig,
    });
  });

  afterEach(() => {
    inputHandler.cleanup();
  });

  test('should initialize with default values', () => {
    expect(inputHandler.inputMap).toBeInstanceOf(Map);
    expect(inputHandler.inputBuffer).toEqual([]);
    expect(inputHandler.maxBufferSize).toBe(10);
    expect(inputHandler.inputState).toHaveProperty('keys');
    expect(inputHandler.inputState).toHaveProperty('mouse');
    expect(inputHandler.inputState).toHaveProperty('touch');
    expect(inputHandler.inputState).toHaveProperty('gamepad');
  });

  test('should check if key is pressed', () => {
    inputHandler.inputState.keys.set('Space', {
      pressed: true,
      timestamp: Date.now(),
    });

    expect(inputHandler.isKeyPressed('Space')).toBe(true);
    expect(inputHandler.isKeyPressed('Enter')).toBe(false);
  });

  test('should check if mouse button is pressed', () => {
    inputHandler.inputState.mouse.buttons.set(0, {
      pressed: true,
      timestamp: Date.now(),
    });

    expect(inputHandler.isMouseButtonPressed(0)).toBe(true);
    expect(inputHandler.isMouseButtonPressed(1)).toBe(false);
  });

  test('should get mouse position', () => {
    inputHandler.inputState.mouse.x = 100;
    inputHandler.inputState.mouse.y = 200;

    const position = inputHandler.getMousePosition();
    expect(position).toEqual({ x: 100, y: 200 });
  });

  test('should get input buffer', () => {
    inputHandler.inputBuffer = [
      { type: 'keydown', data: 'Space', timestamp: Date.now() },
      { type: 'keyup', data: 'Space', timestamp: Date.now() },
    ];

    const buffer = inputHandler.getInputBuffer();
    expect(buffer).toHaveLength(2);
    expect(buffer[0].type).toBe('keydown');
    expect(buffer[1].type).toBe('keyup');
  });

  test('should clear input buffer', () => {
    inputHandler.inputBuffer = [
      { type: 'keydown', data: 'Space', timestamp: Date.now() },
    ];

    inputHandler.clearInputBuffer();
    expect(inputHandler.inputBuffer).toHaveLength(0);
  });

  test('should check if key is a game key', () => {
    expect(inputHandler.isGameKey('ArrowUp')).toBe(true);
    expect(inputHandler.isGameKey('Space')).toBe(true);
    expect(inputHandler.isGameKey('Enter')).toBe(true);
    expect(inputHandler.isGameKey('Escape')).toBe(true);
    expect(inputHandler.isGameKey('Tab')).toBe(false);
  });

  test('should handle key down events', () => {
    const event = new KeyboardEvent('keydown', { code: 'Space' });
    inputHandler.handleKeyDown(event);

    const keyState = inputHandler.inputState.keys.get('Space');
    expect(keyState.pressed).toBe(true);
    // repeat may be undefined on first press, which is falsy
    expect(keyState.repeat).toBeFalsy();
  });

  test('should handle key up events', () => {
    const event = new KeyboardEvent('keyup', { code: 'Space' });
    inputHandler.handleKeyUp(event);

    const keyState = inputHandler.inputState.keys.get('Space');
    expect(keyState.pressed).toBe(false);
    // repeat may be undefined on first press, which is falsy
    expect(keyState.repeat).toBeFalsy();
  });

  test('should handle mouse move events', () => {
    const event = new MouseEvent('mousemove', { clientX: 100, clientY: 200 });
    inputHandler.handleMouseMove(event);

    expect(inputHandler.inputState.mouse.x).toBe(100);
    expect(inputHandler.inputState.mouse.y).toBe(200);
  });

  test('should handle mouse down events', () => {
    const event = new MouseEvent('mousedown', {
      button: 0,
      clientX: 100,
      clientY: 200,
    });
    inputHandler.handleMouseDown(event);

    expect(inputHandler.inputState.mouse.buttons.get(0)).toMatchObject({
      pressed: true,
    });
  });

  test('should handle mouse up events', () => {
    const event = new MouseEvent('mouseup', {
      button: 0,
      clientX: 100,
      clientY: 200,
    });
    inputHandler.handleMouseUp(event);

    expect(inputHandler.inputState.mouse.buttons.get(0)).toMatchObject({
      pressed: false,
    });
  });

  test('should add input to buffer when enabled', () => {
    inputHandler.inputConfig.bufferInputs = true;

    const event = new KeyboardEvent('keydown', { code: 'Space' });
    inputHandler.handleKeyDown(event);

    expect(inputHandler.inputBuffer).toHaveLength(1);
    expect(inputHandler.inputBuffer[0].type).toBe('keydown');
    expect(inputHandler.inputBuffer[0].data).toBe('Space');
  });

  test('should not add input to buffer when disabled', () => {
    inputHandler.inputConfig.bufferInputs = false;

    const event = new KeyboardEvent('keydown', { code: 'Space' });
    inputHandler.handleKeyDown(event);

    expect(inputHandler.inputBuffer).toHaveLength(0);
  });

  // TODO: Add more comprehensive tests
  // - Test touch event handling
  // - Test gamepad event handling
  // - Test input mapping
  // - Test gesture recognition
  // - Test event emission
  // - Test cleanup functionality
});
