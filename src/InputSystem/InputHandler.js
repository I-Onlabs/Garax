/**
 * InputHandler - Input handling and mapping
 * 
 * TODO: Extract from InputManager.js and GameRefactored.js
 * - Move input handling logic here
 * - Implement input mapping system
 * - Add mobile touch controls
 * - Handle input buffering and queuing
 */

export class InputHandler {
  constructor(options = {}) {
    this.inputMap = new Map();
    this.inputBuffer = [];
    this.maxBufferSize = 10;
    this.inputState = {
      keys: new Map(),
      mouse: { x: 0, y: 0, buttons: new Map() },
      touch: { touches: [], gestures: [] },
      gamepad: { connected: false, buttons: [], axes: [] }
    };
    
    // Internal touch state for gesture recognition
    this.touchContext = {
      activeTouches: new Map(),
      startDistance: 0,
      startAngle: 0
    };

    // TODO: Inject dependencies
    this.eventBus = options.eventBus;
    this.logger = options.logger;
    this.config = options.config;
    
    // TODO: Add input configuration
    this.inputConfig = {
      enableKeyboard: true,
      enableMouse: true,
      enableTouch: true,
      enableGamepad: true,
      bufferInputs: true,
      inputRepeatDelay: 100,
      gestures: {
        enableSwipe: true,
        enablePinch: true,
        enableRotate: true,
        swipeThreshold: 50,
        swipeTimeThreshold: 500, // ms - max time for a swipe
        pinchThreshold: 0.1,
        rotateThreshold: 5,
        ...options.config?.gestures
      }
    };
  }

  /**
   * Initialize input handler
   * TODO: Set up event listeners and input mapping
   */
  async initialize() {
    // TODO: Set up keyboard event listeners
    // TODO: Set up mouse event listeners
    // TODO: Set up touch event listeners
    // TODO: Set up gamepad event listeners
    // TODO: Load input mapping configuration
    this.setupEventListeners();
    console.log('InputHandler initialized');
  }

  /**
   * Set up event listeners
   * TODO: Extract from InputManager setup
   */
  setupEventListeners() {
    if (this.inputConfig.enableKeyboard) {
      document.addEventListener('keydown', this.handleKeyDown.bind(this));
      document.addEventListener('keyup', this.handleKeyUp.bind(this));
    }
    
    if (this.inputConfig.enableMouse) {
      document.addEventListener('mousemove', this.handleMouseMove.bind(this));
      document.addEventListener('mousedown', this.handleMouseDown.bind(this));
      document.addEventListener('mouseup', this.handleMouseUp.bind(this));
      document.addEventListener('contextmenu', this.handleContextMenu.bind(this));
    }
    
    if (this.inputConfig.enableTouch) {
      document.addEventListener('touchstart', this.handleTouchStart.bind(this));
      document.addEventListener('touchmove', this.handleTouchMove.bind(this));
      document.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }
    
    if (this.inputConfig.enableGamepad) {
      window.addEventListener('gamepadconnected', this.handleGamepadConnected.bind(this));
      window.addEventListener('gamepaddisconnected', this.handleGamepadDisconnected.bind(this));
    }
  }

  /**
   * Handle key down events
   * TODO: Extract from InputManager key handling
   */
  handleKeyDown(event) {
    const key = event.code || event.key;
    this.inputState.keys.set(key, {
      pressed: true,
      timestamp: Date.now(),
      repeat: event.repeat
    });
    
    // TODO: Add to input buffer
    this.addToBuffer('keydown', key, event);
    
    // TODO: Emit input event
    this.eventBus?.emit('input:keydown', { key, event });
    
    // TODO: Prevent default for game keys
    if (this.isGameKey(key)) {
      event.preventDefault();
    }
  }

  /**
   * Handle key up events
   * TODO: Extract from InputManager key handling
   */
  handleKeyUp(event) {
    const key = event.code || event.key;
    this.inputState.keys.set(key, {
      pressed: false,
      timestamp: Date.now(),
      repeat: false
    });
    
    // TODO: Add to input buffer
    this.addToBuffer('keyup', key, event);
    
    // TODO: Emit input event
    this.eventBus?.emit('input:keyup', { key, event });
  }

  /**
   * Handle mouse move events
   * TODO: Extract from InputManager mouse handling
   */
  handleMouseMove(event) {
    this.inputState.mouse.x = event.clientX;
    this.inputState.mouse.y = event.clientY;
    
    // TODO: Emit mouse move event
    this.eventBus?.emit('input:mousemove', { x: event.clientX, y: event.clientY });
  }

  /**
   * Handle mouse down events
   * TODO: Extract from InputManager mouse handling
   */
  handleMouseDown(event) {
    const button = event.button;
    this.inputState.mouse.buttons.set(button, {
      pressed: true,
      timestamp: Date.now()
    });
    
    // TODO: Add to input buffer
    this.addToBuffer('mousedown', button, event);
    
    // TODO: Emit input event
    this.eventBus?.emit('input:mousedown', { button, x: event.clientX, y: event.clientY });
  }

  /**
   * Handle mouse up events
   * TODO: Extract from InputManager mouse handling
   */
  handleMouseUp(event) {
    const button = event.button;
    this.inputState.mouse.buttons.set(button, {
      pressed: false,
      timestamp: Date.now()
    });
    
    // TODO: Add to input buffer
    this.addToBuffer('mouseup', button, event);
    
    // TODO: Emit input event
    this.eventBus?.emit('input:mouseup', { button, x: event.clientX, y: event.clientY });
  }

  /**
   * Handle context menu events
   * TODO: Extract from InputManager context menu handling
   */
  handleContextMenu(event) {
    // TODO: Prevent context menu for game area
    if (this.isGameArea(event.target)) {
      event.preventDefault();
    }
  }

  /**
   * Handle touch start events
   * TODO: Extract from mobile controls
   */
  handleTouchStart(event) {
    event.preventDefault();
    const touches = Array.from(event.touches);
    this.inputState.touch.touches = touches;

    // Process touch gestures
    this.processTouchGestures('start', event, touches);
    
    // TODO: Add to input buffer
    this.addToBuffer('touchstart', touches, event);
    
    // TODO: Emit input event
    this.eventBus?.emit('input:touchstart', { touches });
  }

  /**
   * Handle touch move events
   * TODO: Extract from mobile controls
   */
  handleTouchMove(event) {
    event.preventDefault();
    const touches = Array.from(event.touches);
    this.inputState.touch.touches = touches;

    // Process touch gestures
    this.processTouchGestures('move', event, touches);
    
    // TODO: Add to input buffer
    this.addToBuffer('touchmove', touches, event);
    
    // TODO: Emit input event
    this.eventBus?.emit('input:touchmove', { touches });
  }

  /**
   * Handle touch end events
   * TODO: Extract from mobile controls
   */
  handleTouchEnd(event) {
    event.preventDefault();
    const touches = Array.from(event.touches);
    this.inputState.touch.touches = touches;

    // Process touch gestures
    this.processTouchGestures('end', event, touches);
    
    // TODO: Add to input buffer
    this.addToBuffer('touchend', touches, event);
    
    // TODO: Emit input event
    this.eventBus?.emit('input:touchend', { touches });
  }

  /**
   * Handle gamepad connected events
   * TODO: Extract from gamepad handling
   */
  handleGamepadConnected(event) {
    this.inputState.gamepad.connected = true;
    // TODO: Emit gamepad connected event
    this.eventBus?.emit('input:gamepadconnected', { gamepad: event.gamepad });
  }

  /**
   * Handle gamepad disconnected events
   * TODO: Extract from gamepad handling
   */
  handleGamepadDisconnected(event) {
    this.inputState.gamepad.connected = false;
    // TODO: Emit gamepad disconnected event
    this.eventBus?.emit('input:gamepaddisconnected', { gamepad: event.gamepad });
  }

  /**
   * Process touch gestures
   */
  processTouchGestures(eventType, event, touches) {
    if (eventType === 'start') {
      // Track new touches
      for (const touch of event.changedTouches) {
        this.touchContext.activeTouches.set(touch.identifier, {
          startX: touch.clientX,
          startY: touch.clientY,
          startTime: Date.now()
        });
      }

      // If we have exactly 2 touches, prepare for pinch/rotate
      if (touches.length === 2) {
        const [t1, t2] = touches;
        this.touchContext.startDistance = this.getDistance(t1, t2);
        this.touchContext.startAngle = this.getAngle(t1, t2);
      }
    } else if (eventType === 'move') {
      // Handle Pinch and Rotate
      if (touches.length === 2) {
        const [t1, t2] = touches;
        const currentDistance = this.getDistance(t1, t2);
        const currentAngle = this.getAngle(t1, t2);

        // Pinch
        if (this.inputConfig.gestures.enablePinch && this.touchContext.startDistance > 0) {
          const scale = currentDistance / this.touchContext.startDistance;
          if (Math.abs(scale - 1) > this.inputConfig.gestures.pinchThreshold) {
            this.eventBus?.emit('input:pinch', { scale });
          }
        }

        // Rotate
        if (this.inputConfig.gestures.enableRotate) {
          let rotation = currentAngle - this.touchContext.startAngle;

          // Handle wrap-around for rotation (e.g. 179 to -179 should be -2 degrees, not -358)
          if (rotation > 180) {
            rotation -= 360;
          } else if (rotation < -180) {
            rotation += 360;
          }

          if (Math.abs(rotation) > this.inputConfig.gestures.rotateThreshold) {
            this.eventBus?.emit('input:rotate', { rotation });
          }
        }
      }
    } else if (eventType === 'end') {
      // Handle Swipe
      if (this.inputConfig.gestures.enableSwipe) {
        for (const touch of event.changedTouches) {
          const startData = this.touchContext.activeTouches.get(touch.identifier);
          if (startData) {
            const deltaX = touch.clientX - startData.startX;
            const deltaY = touch.clientY - startData.startY;
            const timeDiff = Date.now() - startData.startTime;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            // Check for valid swipe (enough distance and short enough time)
            if (distance > this.inputConfig.gestures.swipeThreshold &&
                timeDiff < this.inputConfig.gestures.swipeTimeThreshold) {

              const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
              let direction = '';

              if (angle > -45 && angle <= 45) {
                direction = 'right';
              } else if (angle > 45 && angle <= 135) {
                direction = 'down';
              } else if (angle > 135 || angle <= -135) {
                direction = 'left';
              } else if (angle > -135 && angle <= -45) {
                direction = 'up';
              }

              if (direction) {
                this.eventBus?.emit('input:swipe', { direction, distance });
              }
            }
          }
          // Remove from active touches
          this.touchContext.activeTouches.delete(touch.identifier);
        }
      } else {
          // Just clean up
          for (const touch of event.changedTouches) {
             this.touchContext.activeTouches.delete(touch.identifier);
          }
      }
    }
  }

  getDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  getAngle(touch1, touch2) {
    return Math.atan2(touch2.clientY - touch1.clientY, touch2.clientX - touch1.clientX) * 180 / Math.PI;
  }

  /**
   * Add input to buffer
   * TODO: Implement input buffering
   */
  addToBuffer(type, data, event) {
    if (!this.inputConfig.bufferInputs) return;
    
    this.inputBuffer.push({
      type,
      data,
      timestamp: Date.now(),
      event
    });
    
    // TODO: Limit buffer size
    if (this.inputBuffer.length > this.maxBufferSize) {
      this.inputBuffer.shift();
    }
  }

  /**
   * Check if key is pressed
   * TODO: Extract from InputManager key checking
   */
  isKeyPressed(key) {
    const keyState = this.inputState.keys.get(key);
    return keyState ? keyState.pressed : false;
  }

  /**
   * Check if mouse button is pressed
   * TODO: Extract from InputManager mouse checking
   */
  isMouseButtonPressed(button) {
    const buttonState = this.inputState.mouse.buttons.get(button);
    return buttonState ? buttonState.pressed : false;
  }

  /**
   * Get mouse position
   * TODO: Extract from InputManager mouse position
   */
  getMousePosition() {
    return {
      x: this.inputState.mouse.x,
      y: this.inputState.mouse.y
    };
  }

  /**
   * Get input buffer
   * TODO: Implement input buffer retrieval
   */
  getInputBuffer() {
    return [...this.inputBuffer];
  }

  /**
   * Clear input buffer
   * TODO: Implement input buffer clearing
   */
  clearInputBuffer() {
    this.inputBuffer = [];
  }

  /**
   * Check if key is a game key
   * TODO: Extract from InputManager game key checking
   */
  isGameKey(key) {
    // TODO: Define game keys
    const gameKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Enter', 'Escape'];
    return gameKeys.includes(key);
  }

  /**
   * Check if target is in game area
   * TODO: Extract from InputManager area checking
   */
  isGameArea(target) {
    // TODO: Check if target is in game area
    return target.closest('#game-area') !== null;
  }

  /**
   * Update input handler
   * TODO: Extract from game update loop
   */
  update(deltaTime) {
    // TODO: Update gamepad state
    // TODO: Process input buffer
    // TODO: Handle input repeat
    this.updateGamepadState();
  }

  /**
   * Update gamepad state
   * TODO: Extract from gamepad handling
   */
  updateGamepadState() {
    if (!this.inputState.gamepad.connected) return;
    
    const gamepads = navigator.getGamepads();
    if (gamepads[0]) {
      // TODO: Update gamepad state
      this.inputState.gamepad.buttons = Array.from(gamepads[0].buttons);
      this.inputState.gamepad.axes = Array.from(gamepads[0].axes);
    }
  }

  /**
   * Cleanup resources
   * TODO: Implement proper cleanup
   */
  cleanup() {
    // TODO: Remove event listeners
    // TODO: Clear input state
    // TODO: Clear input buffer
    this.inputState.keys.clear();
    this.inputState.mouse.buttons.clear();
    this.inputState.touch.touches = [];
    this.inputBuffer = [];
    this.touchContext.activeTouches.clear();
  }
}

export default InputHandler;