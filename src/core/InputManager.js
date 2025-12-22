/**
 * InputManager.js - Comprehensive input handling with accessibility support
 *
 * This manager handles:
 * - Keyboard input with accessibility support
 * - Mouse input and touch events
 * - Gamepad support
 * - Input mapping and customization
 * - Accessibility features (keyboard navigation, focus management)
 * - Input event normalization
 */

export class InputManager {
  constructor(dependencies = {}) {
    // Dependency injection
    this.eventBus = dependencies.eventBus;
    this.logger = dependencies.logger;
    this.config = dependencies.config;

    // Validate required dependencies
    if (!this.eventBus) {
      throw new Error('InputManager requires eventBus dependency');
    }
    if (!this.logger) {
      throw new Error('InputManager requires logger dependency');
    }

    // Input state
    this.keys = new Map();
    this.mouse = {
      x: 0,
      y: 0,
      buttons: new Map(),
      wheel: 0,
    };
    this.touch = {
      touches: new Map(),
      gestures: new Map(),
      activeGestures: new Map(),
      lastTapTime: 0,
      lastTapPosition: { x: 0, y: 0 },
      longPressTimer: null,
      doubleTapTimer: null,
    };

    // Mobile UI state
    this.mobileUI = {
      virtualJoystick: {
        active: false,
        center: { x: 0, y: 0 },
        position: { x: 0, y: 0 },
        radius: 60,
        touchId: null,
      },
      actionButtons: new Map(),
      isVisible: false,
      orientation: 'portrait',
    };
    this.gamepad = {
      controllers: new Map(),
      lastUpdate: 0,
    };

    // Input mapping
    this.keyMappings = new Map();
    this.mouseMappings = new Map();
    this.gamepadMappings = new Map();
    this.touchMappings = new Map();

    // Accessibility features
    this.accessibility = {
      keyboardNavigation: false,
      focusManagement: true,
      tabOrder: [],
      currentFocusIndex: 0,
      focusableElements: new Set(),
      skipLinks: new Map(),
    };

    // Input configuration
    this.settings = {
      mouseSensitivity: 1.0,
      keyboardLayout: 'qwerty',
      enableMouseLook: true,
      enableKeyboardNavigation: true,
      enableGamepad: true,
      enableTouch: true,
      invertY: false,
      deadzone: 0.1,
      repeatDelay: 500,
      repeatRate: 50,
      // Mobile-specific settings
      mobileControls: {
        enabled: true,
        layout: 'default', // 'default', 'compact', 'custom'
        size: 'medium', // 'small', 'medium', 'large'
        opacity: 0.8,
        position: 'bottom', // 'bottom', 'top', 'left', 'right', 'custom'
        showLabels: true,
        hapticFeedback: true,
        gestureSensitivity: 1.0,
        touchDeadzone: 0.05,
        multiTouch: true,
        pinchToZoom: true,
        swipeThreshold: 50,
        longPressDelay: 500,
        doubleTapDelay: 300,
      },
      // Touch gesture settings
      gestures: {
        enableSwipe: true,
        enablePinch: true,
        enableRotate: true,
        enableLongPress: true,
        enableDoubleTap: true,
        swipeDirections: ['up', 'down', 'left', 'right'],
        pinchThreshold: 0.1,
        rotateThreshold: 5, // degrees
      },
      // Mobile UI controls
      mobileUI: {
        showVirtualJoystick: true,
        showActionButtons: true,
        showMenuButton: true,
        showPauseButton: true,
        buttonSpacing: 10,
        buttonSize: 60,
        joystickSize: 120,
        joystickDeadzone: 0.1,
        buttonOpacity: 0.8,
        buttonPressScale: 0.9,
        enableButtonHaptics: true,
      },
    };

    // Event handling
    this.boundHandlers = new Map();
    this.isEnabled = true;
    this.isCaptured = false;

    // Initialize input system
    this.initializeInputMappings();
    this.setupEventHandlers();
    this.setupAccessibility();
    this.setupMobileControls();

    this.logger.info('InputManager initialized');
  }

  /**
   * Initialize the manager
   */
  async initialize() {
    this.logger.info('Initializing InputManager...');

    // Load input settings from config
    if (this.config) {
      this.loadSettingsFromConfig();
    }

    // Set up focus management
    this.setupFocusManagement();

    this.logger.info('InputManager initialized successfully');
  }

  /**
   * Cleanup the manager
   */
  cleanup() {
    this.logger.info('Cleaning up InputManager...');

    // Remove event listeners
    this.removeEventHandlers();

    // Clear state
    this.keys.clear();
    this.mouse.buttons.clear();
    this.touch.touches.clear();
    this.gamepad.controllers.clear();

    this.logger.info('InputManager cleaned up');
  }

  /**
   * Update the manager
   */
  update(deltaTime) {
    if (!this.isEnabled) return;

    // Update gamepad state
    this.updateGamepadState();

    // Update accessibility features
    this.updateAccessibilityFeatures();

    // Process input events
    this.processInputEvents();
  }

  /**
   * Initialize input mappings
   */
  initializeInputMappings() {
    // Keyboard mappings
    this.keyMappings.set('moveUp', ['KeyW', 'ArrowUp']);
    this.keyMappings.set('moveDown', ['KeyS', 'ArrowDown']);
    this.keyMappings.set('moveLeft', ['KeyA', 'ArrowLeft']);
    this.keyMappings.set('moveRight', ['KeyD', 'ArrowRight']);
    this.keyMappings.set('jump', ['Space']);
    this.keyMappings.set('crouch', ['KeyC', 'ShiftLeft']);
    this.keyMappings.set('run', ['ShiftLeft']);
    this.keyMappings.set('interact', ['KeyE', 'Enter']);
    this.keyMappings.set('pause', ['Escape', 'KeyP']);
    this.keyMappings.set('inventory', ['KeyI', 'Tab']);
    this.keyMappings.set('menu', ['Escape', 'KeyM']);
    this.keyMappings.set('confirm', ['Enter', 'Space']);
    this.keyMappings.set('cancel', ['Escape', 'Backspace']);
    this.keyMappings.set('next', ['Tab', 'ArrowDown']);
    this.keyMappings.set('previous', ['ShiftLeft+Tab', 'ArrowUp']);

    // Mouse mappings
    this.mouseMappings.set('leftClick', [0]);
    this.mouseMappings.set('rightClick', [2]);
    this.mouseMappings.set('middleClick', [1]);
    this.mouseMappings.set('scrollUp', ['wheelUp']);
    this.mouseMappings.set('scrollDown', ['wheelDown']);

    // Gamepad mappings
    this.gamepadMappings.set('moveUp', ['dpadUp']);
    this.gamepadMappings.set('moveDown', ['dpadDown']);
    this.gamepadMappings.set('moveLeft', ['dpadLeft']);
    this.gamepadMappings.set('moveRight', ['dpadRight']);
    this.gamepadMappings.set('jump', ['buttonA']);
    this.gamepadMappings.set('interact', ['buttonX']);
    this.gamepadMappings.set('pause', ['buttonStart']);
    this.gamepadMappings.set('menu', ['buttonSelect']);
    this.gamepadMappings.set('confirm', ['buttonA']);
    this.gamepadMappings.set('cancel', ['buttonB']);

    // Touch mappings
    this.touchMappings.set('tap', ['tap']);
    this.touchMappings.set('doubleTap', ['doubleTap']);
    this.touchMappings.set('longPress', ['longPress']);
    this.touchMappings.set('swipe', ['swipe']);
    this.touchMappings.set('pinch', ['pinch']);
    this.touchMappings.set('rotate', ['rotate']);
  }

  /**
   * Set up event handlers
   */
  setupEventHandlers() {
    // Keyboard events
    this.boundHandlers.set('keydown', this.handleKeyDown.bind(this));
    this.boundHandlers.set('keyup', this.handleKeyUp.bind(this));
    this.boundHandlers.set('keypress', this.handleKeyPress.bind(this));

    // Mouse events
    this.boundHandlers.set('mousedown', this.handleMouseDown.bind(this));
    this.boundHandlers.set('mouseup', this.handleMouseUp.bind(this));
    this.boundHandlers.set('mousemove', this.handleMouseMove.bind(this));
    this.boundHandlers.set('wheel', this.handleWheel.bind(this));
    this.boundHandlers.set('contextmenu', this.handleContextMenu.bind(this));

    // Touch events
    this.boundHandlers.set('touchstart', this.handleTouchStart.bind(this));
    this.boundHandlers.set('touchend', this.handleTouchEnd.bind(this));
    this.boundHandlers.set('touchmove', this.handleTouchMove.bind(this));
    this.boundHandlers.set('touchcancel', this.handleTouchCancel.bind(this));

    // Gamepad events
    this.boundHandlers.set(
      'gamepadconnected',
      this.handleGamepadConnected.bind(this)
    );
    this.boundHandlers.set(
      'gamepaddisconnected',
      this.handleGamepadDisconnected.bind(this)
    );

    // Focus events
    this.boundHandlers.set('focusin', this.handleFocusIn.bind(this));
    this.boundHandlers.set('focusout', this.handleFocusOut.bind(this));

    // Add event listeners
    this.addEventListeners();
  }

  /**
   * Add event listeners
   */
  addEventListeners() {
    for (const [event, handler] of this.boundHandlers) {
      document.addEventListener(event, handler, { passive: false });
    }
  }

  /**
   * Remove event handlers
   */
  removeEventHandlers() {
    for (const [event, handler] of this.boundHandlers) {
      document.removeEventListener(event, handler);
    }
    this.boundHandlers.clear();
  }

  /**
   * Set up accessibility features
   */
  setupAccessibility() {
    // Set up keyboard navigation
    if (this.settings.enableKeyboardNavigation) {
      this.accessibility.keyboardNavigation = true;
    }

    // Set up focus management
    this.setupFocusManagement();
  }

  /**
   * Set up focus management
   */
  setupFocusManagement() {
    // Find all focusable elements
    this.updateFocusableElements();

    // Set up tab order
    this.updateTabOrder();

    // Set up skip links
    this.setupSkipLinks();
  }

  /**
   * Update focusable elements
   */
  updateFocusableElements() {
    this.accessibility.focusableElements.clear();

    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([disabled])',
      '[role="link"]',
      '[role="menuitem"]',
      '[role="tab"]',
      '[role="option"]',
    ];

    const elements = document.querySelectorAll(focusableSelectors.join(', '));
    elements.forEach((element) => {
      this.accessibility.focusableElements.add(element);
    });
  }

  /**
   * Update tab order
   */
  updateTabOrder() {
    this.accessibility.tabOrder = Array.from(
      this.accessibility.focusableElements
    ).sort((a, b) => {
      const aTabIndex = parseInt(a.getAttribute('tabindex') || '0');
      const bTabIndex = parseInt(b.getAttribute('tabindex') || '0');
      return aTabIndex - bTabIndex;
    });
  }

  /**
   * Set up skip links
   */
  setupSkipLinks() {
    // Create skip links for accessibility
    const skipLinks = [
      { id: 'skip-main', text: 'Skip to main content', target: 'main' },
      { id: 'skip-nav', text: 'Skip to navigation', target: 'nav' },
      { id: 'skip-content', text: 'Skip to content', target: 'content' },
    ];

    skipLinks.forEach((link) => {
      this.accessibility.skipLinks.set(link.id, link);
    });
  }

  /**
   * Set up mobile controls
   */
  setupMobileControls() {
    if (!this.settings.enableTouch || !this.settings.mobileControls.enabled) {
      return;
    }

    // Skip mobile controls setup in test environments
    if (typeof window !== 'undefined' && window.navigator && window.navigator.userAgent.includes('jsdom')) {
      this.logger.info('Skipping mobile controls setup in test environment');
      return;
    }

    // Detect mobile device
    this.detectMobileDevice();

    // Create mobile UI elements
    this.createMobileUI();

    // Set up orientation handling
    this.setupOrientationHandling();

    // Set up gesture recognition
    this.setupGestureRecognition();

    this.logger.info('Mobile controls initialized');
  }

  /**
   * Detect mobile device
   */
  detectMobileDevice() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    this.isMobile = isMobile || isTouch;
    
    if (this.isMobile) {
      this.logger.info('Mobile device detected');
    }
  }

  /**
   * Create mobile UI elements
   */
  createMobileUI() {
    if (!this.isMobile) return;

    // Create mobile controls container
    this.mobileControlsContainer = document.createElement('div');
    this.mobileControlsContainer.id = 'mobile-controls';
    this.mobileControlsContainer.className = 'mobile-controls';
    this.mobileControlsContainer.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 200px;
      pointer-events: none;
      z-index: 1000;
      display: ${this.settings.mobileControls.enabled ? 'block' : 'none'};
    `;
    
    // Ensure the element is properly initialized
    if (!this.mobileControlsContainer.nodeType) {
      this.mobileControlsContainer = null;
      return;
    }

    // Create virtual joystick
    if (this.settings.mobileUI.showVirtualJoystick) {
      this.createVirtualJoystick();
    }

    // Create action buttons
    if (this.settings.mobileUI.showActionButtons) {
      this.createActionButtons();
    }

    // Create menu button
    if (this.settings.mobileUI.showMenuButton) {
      this.createMenuButton();
    }

    // Create pause button
    if (this.settings.mobileUI.showPauseButton) {
      this.createPauseButton();
    }

    if (document.body) {
      document.body.appendChild(this.mobileControlsContainer);
    }
  }

  /**
   * Create virtual joystick
   */
  createVirtualJoystick() {
    const joystickContainer = document.createElement('div');
    joystickContainer.className = 'virtual-joystick';
    joystickContainer.style.cssText = `
      position: absolute;
      left: 20px;
      bottom: 20px;
      width: ${this.settings.mobileUI.joystickSize}px;
      height: ${this.settings.mobileUI.joystickSize}px;
      pointer-events: auto;
    `;

    const joystickBase = document.createElement('div');
    joystickBase.className = 'joystick-base';
    joystickBase.style.cssText = `
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: rgba(255, 255, 255, ${this.settings.mobileUI.buttonOpacity});
      border: 2px solid rgba(0, 0, 0, 0.3);
      position: relative;
    `;

    const joystickKnob = document.createElement('div');
    joystickKnob.className = 'joystick-knob';
    joystickKnob.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.5);
      transform: translate(-50%, -50%);
      transition: transform 0.1s ease;
    `;

    joystickBase.appendChild(joystickKnob);
    joystickContainer.appendChild(joystickBase);
    if (this.mobileControlsContainer) {
      this.mobileControlsContainer.appendChild(joystickContainer);
    }

    // Store references
    this.mobileUI.virtualJoystick.element = joystickContainer;
    this.mobileUI.virtualJoystick.base = joystickBase;
    this.mobileUI.virtualJoystick.knob = joystickKnob;
    this.mobileUI.virtualJoystick.center = {
      x: this.settings.mobileUI.joystickSize / 2,
      y: this.settings.mobileUI.joystickSize / 2,
    };
  }

  /**
   * Create action buttons
   */
  createActionButtons() {
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'action-buttons';
    buttonContainer.style.cssText = `
      position: absolute;
      right: 20px;
      bottom: 20px;
      display: flex;
      flex-direction: column;
      gap: ${this.settings.mobileUI.buttonSpacing}px;
      pointer-events: auto;
    `;

    const buttons = [
      { id: 'jump', label: 'Jump', key: 'Space' },
      { id: 'interact', label: 'Interact', key: 'KeyE' },
      { id: 'crouch', label: 'Crouch', key: 'KeyC' },
      { id: 'run', label: 'Run', key: 'ShiftLeft' },
    ];

    buttons.forEach((button) => {
      const buttonElement = document.createElement('button');
      buttonElement.className = `action-button ${button.id}`;
      buttonElement.textContent = this.settings.mobileControls.showLabels ? button.label : '';
      buttonElement.style.cssText = `
        width: ${this.settings.mobileUI.buttonSize}px;
        height: ${this.settings.mobileUI.buttonSize}px;
        border-radius: 50%;
        background: rgba(255, 255, 255, ${this.settings.mobileUI.buttonOpacity});
        border: 2px solid rgba(0, 0, 0, 0.3);
        color: #000;
        font-size: 12px;
        font-weight: bold;
        cursor: pointer;
        user-select: none;
        transition: transform 0.1s ease;
      `;

      // Add touch event handlers
      buttonElement.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.handleMobileButtonPress(button.id, button.key, 'down');
        buttonElement.style.transform = `scale(${this.settings.mobileUI.buttonPressScale})`;
      });

      buttonElement.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.handleMobileButtonPress(button.id, button.key, 'up');
        buttonElement.style.transform = 'scale(1)';
      });

      buttonContainer.appendChild(buttonElement);
      this.mobileUI.actionButtons.set(button.id, buttonElement);
    });

    if (this.mobileControlsContainer) {
      this.mobileControlsContainer.appendChild(buttonContainer);
    }
  }

  /**
   * Create menu button
   */
  createMenuButton() {
    const menuButton = document.createElement('button');
    menuButton.className = 'menu-button';
    menuButton.innerHTML = '☰';
    menuButton.style.cssText = `
      position: absolute;
      top: 20px;
      right: 20px;
      width: ${this.settings.mobileUI.buttonSize}px;
      height: ${this.settings.mobileUI.buttonSize}px;
      border-radius: 50%;
      background: rgba(255, 255, 255, ${this.settings.mobileUI.buttonOpacity});
      border: 2px solid rgba(0, 0, 0, 0.3);
      color: #000;
      font-size: 20px;
      cursor: pointer;
      pointer-events: auto;
      user-select: none;
    `;

    menuButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.handleMobileButtonPress('menu', 'KeyM', 'down');
    });

    if (this.mobileControlsContainer) {
      this.mobileControlsContainer.appendChild(menuButton);
    }
  }

  /**
   * Create pause button
   */
  createPauseButton() {
    const pauseButton = document.createElement('button');
    pauseButton.className = 'pause-button';
    pauseButton.innerHTML = '⏸';
    pauseButton.style.cssText = `
      position: absolute;
      top: 20px;
      left: 20px;
      width: ${this.settings.mobileUI.buttonSize}px;
      height: ${this.settings.mobileUI.buttonSize}px;
      border-radius: 50%;
      background: rgba(255, 255, 255, ${this.settings.mobileUI.buttonOpacity});
      border: 2px solid rgba(0, 0, 0, 0.3);
      color: #000;
      font-size: 20px;
      cursor: pointer;
      pointer-events: auto;
      user-select: none;
    `;

    pauseButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.handleMobileButtonPress('pause', 'Escape', 'down');
    });

    if (this.mobileControlsContainer) {
      this.mobileControlsContainer.appendChild(pauseButton);
    }
  }

  /**
   * Set up orientation handling
   */
  setupOrientationHandling() {
    const updateOrientation = () => {
      const isPortrait = window.innerHeight > window.innerWidth;
      this.mobileUI.orientation = isPortrait ? 'portrait' : 'landscape';
      
      // Adjust mobile controls for orientation
      this.adjustMobileControlsForOrientation();
    };

    window.addEventListener('orientationchange', updateOrientation);
    window.addEventListener('resize', updateOrientation);
    updateOrientation();
  }

  /**
   * Adjust mobile controls for orientation
   */
  adjustMobileControlsForOrientation() {
    if (!this.mobileControlsContainer) return;

    if (this.mobileUI.orientation === 'landscape') {
      // Adjust for landscape mode
      this.mobileControlsContainer.style.height = '150px';
    } else {
      // Adjust for portrait mode
      this.mobileControlsContainer.style.height = '200px';
    }
  }

  /**
   * Set up gesture recognition
   */
  setupGestureRecognition() {
    if (!this.settings.gestures.enableSwipe && 
        !this.settings.gestures.enablePinch && 
        !this.settings.gestures.enableRotate) {
      return;
    }

    // This would integrate with a gesture recognition library
    // For now, we'll implement basic gesture detection
    this.setupBasicGestureDetection();
  }

  /**
   * Set up basic gesture detection
   */
  setupBasicGestureDetection() {
    let startTouches = [];
    let startDistance = 0;
    let startAngle = 0;

    const handleTouchStart = (e) => {
      startTouches = Array.from(e.touches);
      if (startTouches.length === 2) {
        startDistance = this.getDistance(startTouches[0], startTouches[1]);
        startAngle = this.getAngle(startTouches[0], startTouches[1]);
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 2 && this.settings.gestures.enablePinch) {
        const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
        const scale = currentDistance / startDistance;
        
        if (Math.abs(scale - 1) > this.settings.gestures.pinchThreshold) {
          this.handlePinchGesture(scale);
        }
      }

      if (e.touches.length === 2 && this.settings.gestures.enableRotate) {
        const currentAngle = this.getAngle(e.touches[0], e.touches[1]);
        const rotation = currentAngle - startAngle;
        
        if (Math.abs(rotation) > this.settings.gestures.rotateThreshold) {
          this.handleRotateGesture(rotation);
        }
      }
    };

    const handleTouchEnd = (e) => {
      if (e.touches.length === 0 && startTouches.length === 1) {
        // Single touch ended - check for swipe
        this.checkForSwipe(startTouches[0], e.changedTouches[0]);
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
  }

  /**
   * Handle keyboard down events
   */
  handleKeyDown(event) {
    if (!this.isEnabled) return;

    const key = event.code;
    const keyName = this.getKeyName(key);

    // Update key state
    this.keys.set(key, {
      pressed: true,
      timestamp: Date.now(),
      repeat: this.keys.has(key),
    });

    // Handle accessibility features
    if (this.accessibility.keyboardNavigation) {
      this.handleAccessibilityKeyDown(event);
    }

    // Emit input event
    this.eventBus.emit('input:keyDown', {
      key,
      keyName,
      code: event.code,
      keyCode: event.keyCode,
      repeat: this.keys.get(key).repeat,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
      timestamp: Date.now(),
    });

    // Handle mapped actions
    this.handleMappedAction('keyboard', key, 'down', event);
  }

  /**
   * Handle keyboard up events
   */
  handleKeyUp(event) {
    if (!this.isEnabled) return;

    const key = event.code;
    const keyName = this.getKeyName(key);

    // Update key state
    this.keys.set(key, {
      pressed: false,
      timestamp: Date.now(),
      repeat: false,
    });

    // Emit input event
    this.eventBus.emit('input:keyUp', {
      key,
      keyName,
      code: event.code,
      keyCode: event.keyCode,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
      timestamp: Date.now(),
    });

    // Handle mapped actions
    this.handleMappedAction('keyboard', key, 'up', event);
  }

  /**
   * Handle keyboard press events
   */
  handleKeyPress(event) {
    if (!this.isEnabled) return;

    const key = event.key;
    const charCode = event.charCode;

    // Emit input event
    this.eventBus.emit('input:keyPress', {
      key,
      charCode,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
      timestamp: Date.now(),
    });
  }

  /**
   * Handle mouse down events
   */
  handleMouseDown(event) {
    if (!this.isEnabled) return;

    const button = event.button;
    const buttonName = this.getMouseButtonName(button);

    // Update mouse state
    this.mouse.buttons.set(button, {
      pressed: true,
      timestamp: Date.now(),
    });

    // Update mouse position
    this.mouse.x = event.clientX;
    this.mouse.y = event.clientY;

    // Emit input event
    this.eventBus.emit('input:mouseDown', {
      button,
      buttonName,
      x: event.clientX,
      y: event.clientY,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
      timestamp: Date.now(),
    });

    // Handle mapped actions
    this.handleMappedAction('mouse', button, 'down', event);
  }

  /**
   * Handle mouse up events
   */
  handleMouseUp(event) {
    if (!this.isEnabled) return;

    const button = event.button;
    const buttonName = this.getMouseButtonName(button);

    // Update mouse state
    this.mouse.buttons.set(button, {
      pressed: false,
      timestamp: Date.now(),
    });

    // Update mouse position
    this.mouse.x = event.clientX;
    this.mouse.y = event.clientY;

    // Emit input event
    this.eventBus.emit('input:mouseUp', {
      button,
      buttonName,
      x: event.clientX,
      y: event.clientY,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
      timestamp: Date.now(),
    });

    // Handle mapped actions
    this.handleMappedAction('mouse', button, 'up', event);
  }

  /**
   * Handle mouse move events
   */
  handleMouseMove(event) {
    if (!this.isEnabled) return;

    // Update mouse position
    const deltaX = event.clientX - this.mouse.x;
    const deltaY = event.clientY - this.mouse.y;

    this.mouse.x = event.clientX;
    this.mouse.y = event.clientY;

    // Apply sensitivity
    const sensitivity = this.settings.mouseSensitivity;
    const adjustedDeltaX = deltaX * sensitivity;
    const adjustedDeltaY = this.settings.invertY
      ? -deltaY * sensitivity
      : deltaY * sensitivity;

    // Emit input event
    this.eventBus.emit('input:mouseMove', {
      x: event.clientX,
      y: event.clientY,
      deltaX: adjustedDeltaX,
      deltaY: adjustedDeltaY,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
      timestamp: Date.now(),
    });
  }

  /**
   * Handle wheel events
   */
  handleWheel(event) {
    if (!this.isEnabled) return;

    const deltaY = event.deltaY;
    const direction = deltaY > 0 ? 'down' : 'up';

    this.mouse.wheel = deltaY;

    // Emit input event
    this.eventBus.emit('input:wheel', {
      deltaY,
      direction,
      x: event.clientX,
      y: event.clientY,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
      timestamp: Date.now(),
    });

    // Handle mapped actions
    this.handleMappedAction('mouse', direction, 'wheel', event);
  }

  /**
   * Handle context menu events
   */
  handleContextMenu(event) {
    if (!this.isEnabled) return;

    // Prevent context menu if needed
    if (this.isCaptured) {
      event.preventDefault();
    }

    // Emit input event
    this.eventBus.emit('input:contextMenu', {
      x: event.clientX,
      y: event.clientY,
      timestamp: Date.now(),
    });
  }

  /**
   * Handle touch start events
   */
  handleTouchStart(event) {
    if (!this.isEnabled || !this.settings.enableTouch) return;

    // Prevent default to avoid mouse events
    event.preventDefault();

    // Update touch state
    for (const touch of event.changedTouches) {
      this.touch.touches.set(touch.identifier, {
        x: touch.clientX,
        y: touch.clientY,
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now(),
        pressure: touch.force || 1.0,
      });

      // Handle mobile-specific touch events
      if (this.isMobile) {
        this.handleMobileTouchStart(touch, event);
      }
    }

    // Emit input event
    this.eventBus.emit('input:touchStart', {
      touches: Array.from(event.changedTouches).map((touch) => ({
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        pressure: touch.force || 1.0,
      })),
      timestamp: Date.now(),
    });
  }

  /**
   * Handle touch end events
   */
  handleTouchEnd(event) {
    if (!this.isEnabled || !this.settings.enableTouch) return;

    // Prevent default
    event.preventDefault();

    // Update touch state
    for (const touch of event.changedTouches) {
      // Handle mobile-specific touch events
      if (this.isMobile) {
        this.handleMobileTouchEnd(touch, event);
      }

      this.touch.touches.delete(touch.identifier);
    }

    // Emit input event
    this.eventBus.emit('input:touchEnd', {
      touches: Array.from(event.changedTouches).map((touch) => ({
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
      })),
      timestamp: Date.now(),
    });
  }

  /**
   * Handle touch move events
   */
  handleTouchMove(event) {
    if (!this.isEnabled || !this.settings.enableTouch) return;

    // Prevent default to avoid scrolling
    event.preventDefault();

    // Update touch state
    for (const touch of event.changedTouches) {
      if (this.touch.touches.has(touch.identifier)) {
        const touchData = this.touch.touches.get(touch.identifier);
        touchData.x = touch.clientX;
        touchData.y = touch.clientY;

        // Handle mobile-specific touch events
        if (this.isMobile) {
          this.handleMobileTouchMove(touch, event);
        }
      }
    }

    // Emit input event
    this.eventBus.emit('input:touchMove', {
      touches: Array.from(event.changedTouches).map((touch) => ({
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        pressure: touch.force || 1.0,
      })),
      timestamp: Date.now(),
    });
  }

  /**
   * Handle touch cancel events
   */
  handleTouchCancel(event) {
    if (!this.isEnabled || !this.settings.enableTouch) return;

    // Update touch state
    for (const touch of event.changedTouches) {
      this.touch.touches.delete(touch.identifier);
    }

    // Emit input event
    this.eventBus.emit('input:touchCancel', {
      touches: Array.from(event.changedTouches).map((touch) => ({
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
      })),
      timestamp: Date.now(),
    });
  }

  /**
   * Handle gamepad connected events
   */
  handleGamepadConnected(event) {
    if (!this.settings.enableGamepad) return;

    const gamepad = event.gamepad;
    this.gamepad.controllers.set(gamepad.index, {
      id: gamepad.id,
      index: gamepad.index,
      connected: true,
      buttons: new Map(),
      axes: new Map(),
    });

    this.logger.info(`Gamepad connected: ${gamepad.id}`);

    // Emit input event
    this.eventBus.emit('input:gamepadConnected', {
      id: gamepad.id,
      index: gamepad.index,
      timestamp: Date.now(),
    });
  }

  /**
   * Handle gamepad disconnected events
   */
  handleGamepadDisconnected(event) {
    const gamepad = event.gamepad;
    this.gamepad.controllers.delete(gamepad.index);

    this.logger.info(`Gamepad disconnected: ${gamepad.id}`);

    // Emit input event
    this.eventBus.emit('input:gamepadDisconnected', {
      id: gamepad.id,
      index: gamepad.index,
      timestamp: Date.now(),
    });
  }

  /**
   * Handle focus in events
   */
  handleFocusIn(event) {
    if (!this.accessibility.focusManagement) return;

    const element = event.target;
    const index = this.accessibility.tabOrder.indexOf(element);

    if (index !== -1) {
      this.accessibility.currentFocusIndex = index;
    }

    // Emit input event
    this.eventBus.emit('input:focusIn', {
      element,
      index,
      timestamp: Date.now(),
    });
  }

  /**
   * Handle focus out events
   */
  handleFocusOut(event) {
    if (!this.accessibility.focusManagement) return;

    const element = event.target;

    // Emit input event
    this.eventBus.emit('input:focusOut', {
      element,
      timestamp: Date.now(),
    });
  }

  /**
   * Handle accessibility key down events
   */
  handleAccessibilityKeyDown(event) {
    const key = event.key;

    switch (key) {
      case 'Tab':
        this.handleTabNavigation(event);
        break;
      case 'Enter':
      case ' ':
        this.handleActivation(event);
        break;
      case 'Escape':
        this.handleEscape(event);
        break;
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        this.handleArrowNavigation(event);
        break;
    }
  }

  /**
   * Handle tab navigation
   */
  handleTabNavigation(event) {
    if (this.accessibility.tabOrder.length === 0) return;

    const direction = event.shiftKey ? -1 : 1;
    const newIndex =
      (this.accessibility.currentFocusIndex +
        direction +
        this.accessibility.tabOrder.length) %
      this.accessibility.tabOrder.length;

    const nextElement = this.accessibility.tabOrder[newIndex];
    if (nextElement) {
      nextElement.focus();
      this.accessibility.currentFocusIndex = newIndex;
    }
  }

  /**
   * Handle activation
   */
  handleActivation(event) {
    const element = document.activeElement;
    if (element && element.click) {
      element.click();
    }
  }

  /**
   * Handle escape key
   */
  handleEscape(event) {
    // Emit escape event for game to handle
    this.eventBus.emit('input:escape', {
      timestamp: Date.now(),
    });
  }

  /**
   * Handle arrow navigation
   */
  handleArrowNavigation(event) {
    // Emit arrow navigation event
    this.eventBus.emit('input:arrowNavigation', {
      direction: event.key.replace('Arrow', '').toLowerCase(),
      timestamp: Date.now(),
    });
  }

  /**
   * Update gamepad state
   */
  updateGamepadState() {
    if (!this.settings.enableGamepad) return;

    const gamepads = navigator.getGamepads();

    for (let i = 0; i < gamepads.length; i++) {
      const gamepad = gamepads[i];
      if (!gamepad) continue;

      const controller = this.gamepad.controllers.get(i);
      if (!controller) continue;

      // Update button states
      for (let j = 0; j < gamepad.buttons.length; j++) {
        const button = gamepad.buttons[j];
        const wasPressed = controller.buttons.get(j)?.pressed || false;
        const isPressed = button.pressed;

        if (isPressed !== wasPressed) {
          controller.buttons.set(j, {
            pressed: isPressed,
            value: button.value,
            timestamp: Date.now(),
          });

          // Emit button event
          this.eventBus.emit('input:gamepadButton', {
            controller: i,
            button: j,
            pressed: isPressed,
            value: button.value,
            timestamp: Date.now(),
          });
        }
      }

      // Update axis states
      for (let j = 0; j < gamepad.axes.length; j++) {
        const axis = gamepad.axes[j];
        const previousAxis = controller.axes.get(j) || 0;

        // Apply deadzone
        const deadzone = this.settings.deadzone;
        const adjustedAxis = Math.abs(axis) < deadzone ? 0 : axis;

        if (Math.abs(adjustedAxis - previousAxis) > 0.01) {
          controller.axes.set(j, adjustedAxis);

          // Emit axis event
          this.eventBus.emit('input:gamepadAxis', {
            controller: i,
            axis: j,
            value: adjustedAxis,
            timestamp: Date.now(),
          });
        }
      }
    }
  }

  /**
   * Update accessibility features
   */
  updateAccessibilityFeatures() {
    // Update focusable elements if DOM has changed
    this.updateFocusableElements();
    this.updateTabOrder();
  }

  /**
   * Process input events
   */
  processInputEvents() {
    // Process any queued input events
    // This could include input buffering, input prediction, etc.
  }

  /**
   * Handle mapped actions
   */
  handleMappedAction(inputType, input, action, event) {
    let mapping;

    switch (inputType) {
      case 'keyboard':
        mapping = this.keyMappings;
        break;
      case 'mouse':
        mapping = this.mouseMappings;
        break;
      case 'gamepad':
        mapping = this.gamepadMappings;
        break;
      case 'touch':
        mapping = this.touchMappings;
        break;
      default:
        return;
    }

    // Find mapped action
    for (const [actionName, inputs] of mapping) {
      if (inputs.includes(input)) {
        this.eventBus.emit('input:action', {
          action: actionName,
          inputType,
          input,
          state: action,
          event,
          timestamp: Date.now(),
        });
      }
    }
  }

  /**
   * Get key name from key code
   */
  getKeyName(keyCode) {
    const keyNames = {
      KeyA: 'A',
      KeyB: 'B',
      KeyC: 'C',
      KeyD: 'D',
      KeyE: 'E',
      KeyF: 'F',
      KeyG: 'G',
      KeyH: 'H',
      KeyI: 'I',
      KeyJ: 'J',
      KeyK: 'K',
      KeyL: 'L',
      KeyM: 'M',
      KeyN: 'N',
      KeyO: 'O',
      KeyP: 'P',
      KeyQ: 'Q',
      KeyR: 'R',
      KeyS: 'S',
      KeyT: 'T',
      KeyU: 'U',
      KeyV: 'V',
      KeyW: 'W',
      KeyX: 'X',
      KeyY: 'Y',
      KeyZ: 'Z',
      Digit0: '0',
      Digit1: '1',
      Digit2: '2',
      Digit3: '3',
      Digit4: '4',
      Digit5: '5',
      Digit6: '6',
      Digit7: '7',
      Digit8: '8',
      Digit9: '9',
      Space: 'Space',
      Enter: 'Enter',
      Escape: 'Escape',
      Backspace: 'Backspace',
      Tab: 'Tab',
      ShiftLeft: 'Left Shift',
      ShiftRight: 'Right Shift',
      ControlLeft: 'Left Ctrl',
      ControlRight: 'Right Ctrl',
      AltLeft: 'Left Alt',
      AltRight: 'Right Alt',
      ArrowUp: 'Up Arrow',
      ArrowDown: 'Down Arrow',
      ArrowLeft: 'Left Arrow',
      ArrowRight: 'Right Arrow',
    };

    return keyNames[keyCode] || keyCode;
  }

  /**
   * Get mouse button name
   */
  getMouseButtonName(button) {
    const buttonNames = {
      0: 'Left',
      1: 'Middle',
      2: 'Right',
      3: 'Back',
      4: 'Forward',
    };

    return buttonNames[button] || `Button ${button}`;
  }

  /**
   * Load settings from config
   */
  loadSettingsFromConfig() {
    if (!this.config || typeof this.config.getConfigValue !== 'function') return;

    this.settings = {
      ...this.settings,
      mouseSensitivity:
        this.config.getConfigValue('input.mouseSensitivity') ||
        this.settings.mouseSensitivity,
      keyboardLayout:
        this.config.getConfigValue('input.keyboardLayout') ||
        this.settings.keyboardLayout,
      enableMouseLook:
        this.config.getConfigValue('input.enableMouseLook') ??
        this.settings.enableMouseLook,
      enableKeyboardNavigation:
        this.config.getConfigValue('input.enableKeyboardNavigation') ??
        this.settings.enableKeyboardNavigation,
      enableGamepad:
        this.config.getConfigValue('input.enableGamepad') ??
        this.settings.enableGamepad,
      enableTouch:
        this.config.getConfigValue('input.enableTouch') ??
        this.settings.enableTouch,
      invertY:
        this.config.getConfigValue('input.invertY') ?? this.settings.invertY,
      deadzone:
        this.config.getConfigValue('input.deadzone') || this.settings.deadzone,
    };
  }

  /**
   * Enable input
   */
  enable() {
    this.isEnabled = true;
    this.logger.info('Input enabled');
  }

  /**
   * Disable input
   */
  disable() {
    this.isEnabled = false;
    this.logger.info('Input disabled');
  }

  /**
   * Capture input
   */
  capture() {
    this.isCaptured = true;
    document.body.style.cursor = 'none';
    this.logger.info('Input captured');
  }

  /**
   * Release input
   */
  release() {
    this.isCaptured = false;
    document.body.style.cursor = 'default';
    this.logger.info('Input released');
  }

  /**
   * Get input state
   */
  getInputState() {
    return {
      keyboard: Object.fromEntries(this.keys),
      mouse: this.mouse,
      touch: Object.fromEntries(this.touch.touches),
      gamepad: Object.fromEntries(this.gamepad.controllers),
      accessibility: this.accessibility,
    };
  }

  /**
   * Set key mapping
   */
  setKeyMapping(action, keys) {
    this.keyMappings.set(action, keys);
  }

  /**
   * Get key mapping
   */
  getKeyMapping(action) {
    return this.keyMappings.get(action) || [];
  }

  /**
   * Check if key is pressed
   */
  isKeyPressed(key) {
    const keyState = this.keys.get(key);
    return keyState ? keyState.pressed : false;
  }

  /**
   * Check if mouse button is pressed
   */
  isMouseButtonPressed(button) {
    const buttonState = this.mouse.buttons.get(button);
    return buttonState ? buttonState.pressed : false;
  }

  /**
   * Get mouse position
   */
  getMousePosition() {
    return { x: this.mouse.x, y: this.mouse.y };
  }

  /**
   * Get gamepad state
   */
  getGamepadState(index) {
    return this.gamepad.controllers.get(index);
  }

  /**
   * Get all gamepads
   */
  getAllGamepads() {
    return Array.from(this.gamepad.controllers.values());
  }

  /**
   * Handle mobile touch start
   */
  handleMobileTouchStart(touch, event) {
    // Check if touch is on virtual joystick
    if (this.isTouchOnVirtualJoystick(touch)) {
      this.activateVirtualJoystick(touch);
      return;
    }

    // Check if touch is on action buttons
    const button = this.getTouchedButton(touch);
    if (button) {
      this.handleMobileButtonPress(button.id, button.key, 'down');
      return;
    }

    // Handle gesture recognition
    this.handleGestureStart(touch, event);
  }

  /**
   * Handle mobile touch move
   */
  handleMobileTouchMove(touch, event) {
    // Update virtual joystick if active
    if (this.mobileUI.virtualJoystick.active && 
        this.mobileUI.virtualJoystick.touchId === touch.identifier) {
      this.updateVirtualJoystick(touch);
    }

    // Handle gesture recognition
    this.handleGestureMove(touch, event);
  }

  /**
   * Handle mobile touch end
   */
  handleMobileTouchEnd(touch, event) {
    // Deactivate virtual joystick if it was active
    if (this.mobileUI.virtualJoystick.active && 
        this.mobileUI.virtualJoystick.touchId === touch.identifier) {
      this.deactivateVirtualJoystick();
    }

    // Handle gesture recognition
    this.handleGestureEnd(touch, event);
  }

  /**
   * Check if touch is on virtual joystick
   */
  isTouchOnVirtualJoystick(touch) {
    if (!this.mobileUI.virtualJoystick.element) return false;

    const rect = this.mobileUI.virtualJoystick.element.getBoundingClientRect();
    return touch.clientX >= rect.left && 
           touch.clientX <= rect.right && 
           touch.clientY >= rect.top && 
           touch.clientY <= rect.bottom;
  }

  /**
   * Activate virtual joystick
   */
  activateVirtualJoystick(touch) {
    this.mobileUI.virtualJoystick.active = true;
    this.mobileUI.virtualJoystick.touchId = touch.identifier;
    
    const rect = this.mobileUI.virtualJoystick.element.getBoundingClientRect();
    this.mobileUI.virtualJoystick.center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    this.logger.info('Virtual joystick activated');
  }

  /**
   * Update virtual joystick
   */
  updateVirtualJoystick(touch) {
    if (!this.mobileUI.virtualJoystick.active) return;

    const center = this.mobileUI.virtualJoystick.center;
    const deltaX = touch.clientX - center.x;
    const deltaY = touch.clientY - center.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = this.settings.mobileUI.joystickSize / 2;

    // Clamp to joystick radius
    const clampedDistance = Math.min(distance, maxDistance);
    const angle = Math.atan2(deltaY, deltaX);

    const knobX = Math.cos(angle) * clampedDistance;
    const knobY = Math.sin(angle) * clampedDistance;

    // Update knob position
    if (this.mobileUI.virtualJoystick.knob) {
      this.mobileUI.virtualJoystick.knob.style.transform = 
        `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;
    }

    // Calculate normalized values
    const normalizedX = deltaX / maxDistance;
    const normalizedY = deltaY / maxDistance;

    // Apply deadzone
    const deadzone = this.settings.mobileUI.joystickDeadzone;
    const finalX = Math.abs(normalizedX) < deadzone ? 0 : normalizedX;
    const finalY = Math.abs(normalizedY) < deadzone ? 0 : normalizedY;

    // Emit joystick movement event
    this.eventBus.emit('input:joystickMove', {
      x: finalX,
      y: finalY,
      angle: angle * 180 / Math.PI,
      distance: clampedDistance / maxDistance,
      timestamp: Date.now(),
    });

    // Map to keyboard events for compatibility
    this.mapJoystickToKeyboard(finalX, finalY);
  }

  /**
   * Deactivate virtual joystick
   */
  deactivateVirtualJoystick() {
    this.mobileUI.virtualJoystick.active = false;
    this.mobileUI.virtualJoystick.touchId = null;

    // Reset knob position
    if (this.mobileUI.virtualJoystick.knob) {
      this.mobileUI.virtualJoystick.knob.style.transform = 'translate(-50%, -50%)';
    }

    // Emit joystick release event
    this.eventBus.emit('input:joystickRelease', {
      timestamp: Date.now(),
    });

    this.logger.info('Virtual joystick deactivated');
  }

  /**
   * Map joystick movement to keyboard events
   */
  mapJoystickToKeyboard(x, y) {
    const threshold = 0.3;

    // Horizontal movement
    if (x > threshold) {
      this.handleMappedAction('keyboard', 'KeyD', 'down', { synthetic: true });
    } else if (x < -threshold) {
      this.handleMappedAction('keyboard', 'KeyA', 'down', { synthetic: true });
    }

    // Vertical movement
    if (y > threshold) {
      this.handleMappedAction('keyboard', 'KeyS', 'down', { synthetic: true });
    } else if (y < -threshold) {
      this.handleMappedAction('keyboard', 'KeyW', 'down', { synthetic: true });
    }
  }

  /**
   * Get touched button
   */
  getTouchedButton(touch) {
    for (const [id, button] of this.mobileUI.actionButtons) {
      const rect = button.getBoundingClientRect();
      if (touch.clientX >= rect.left && 
          touch.clientX <= rect.right && 
          touch.clientY >= rect.top && 
          touch.clientY <= rect.bottom) {
        return { id, key: this.getButtonKey(id) };
      }
    }
    return null;
  }

  /**
   * Get button key mapping
   */
  getButtonKey(buttonId) {
    const keyMap = {
      jump: 'Space',
      interact: 'KeyE',
      crouch: 'KeyC',
      run: 'ShiftLeft',
      menu: 'KeyM',
      pause: 'Escape',
    };
    return keyMap[buttonId] || null;
  }

  /**
   * Handle mobile button press
   */
  handleMobileButtonPress(buttonId, key, action) {
    // Emit haptic feedback if enabled
    if (this.settings.mobileControls.hapticFeedback && navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Emit input event
    this.eventBus.emit('input:mobileButton', {
      buttonId,
      key,
      action,
      timestamp: Date.now(),
    });

    // Map to keyboard event for compatibility
    if (key) {
      this.handleMappedAction('keyboard', key, action, { synthetic: true });
    }

    this.logger.info(`Mobile button ${action}: ${buttonId}`);
  }

  /**
   * Handle gesture start
   */
  handleGestureStart(touch, event) {
    const currentTime = Date.now();
    
    // Check for double tap
    if (this.settings.gestures.enableDoubleTap) {
      const timeDiff = currentTime - this.touch.lastTapTime;
      const distance = this.getDistance(touch, this.touch.lastTapPosition);
      
      if (timeDiff < this.settings.mobileControls.doubleTapDelay && distance < 50) {
        this.handleDoubleTap(touch);
        return;
      }
    }

    // Set up long press timer
    if (this.settings.gestures.enableLongPress) {
      this.touch.longPressTimer = setTimeout(() => {
        this.handleLongPress(touch);
      }, this.settings.mobileControls.longPressDelay);
    }

    // Update last tap info
    this.touch.lastTapTime = currentTime;
    this.touch.lastTapPosition = { x: touch.clientX, y: touch.clientY };
  }

  /**
   * Handle gesture move
   */
  handleGestureMove(touch, event) {
    // Clear long press timer if moving
    if (this.touch.longPressTimer) {
      clearTimeout(this.touch.longPressTimer);
      this.touch.longPressTimer = null;
    }
  }

  /**
   * Handle gesture end
   */
  handleGestureEnd(touch, event) {
    // Clear long press timer
    if (this.touch.longPressTimer) {
      clearTimeout(this.touch.longPressTimer);
      this.touch.longPressTimer = null;
    }

    // Check for swipe
    if (this.settings.gestures.enableSwipe) {
      this.checkForSwipe(touch, touch);
    }
  }

  /**
   * Check for swipe gesture
   */
  checkForSwipe(startTouch, endTouch) {
    const deltaX = endTouch.clientX - startTouch.startX;
    const deltaY = endTouch.clientY - startTouch.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance < this.settings.mobileControls.swipeThreshold) {
      return; // Not a swipe
    }

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

    if (this.settings.gestures.swipeDirections.includes(direction)) {
      this.handleSwipeGesture(direction, distance);
    }
  }

  /**
   * Handle swipe gesture
   */
  handleSwipeGesture(direction, distance) {
    this.eventBus.emit('input:swipe', {
      direction,
      distance,
      timestamp: Date.now(),
    });

    this.logger.info(`Swipe detected: ${direction}`);
  }

  /**
   * Handle pinch gesture
   */
  handlePinchGesture(scale) {
    this.eventBus.emit('input:pinch', {
      scale,
      timestamp: Date.now(),
    });

    this.logger.info(`Pinch detected: ${scale.toFixed(2)}`);
  }

  /**
   * Handle rotate gesture
   */
  handleRotateGesture(rotation) {
    this.eventBus.emit('input:rotate', {
      rotation,
      timestamp: Date.now(),
    });

    this.logger.info(`Rotate detected: ${rotation.toFixed(2)}°`);
  }

  /**
   * Handle double tap
   */
  handleDoubleTap(touch) {
    this.eventBus.emit('input:doubleTap', {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    });

    this.logger.info('Double tap detected');
  }

  /**
   * Handle long press
   */
  handleLongPress(touch) {
    this.eventBus.emit('input:longPress', {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    });

    this.logger.info('Long press detected');
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
    return Math.atan2(touch2.clientY - touch1.clientY, touch2.clientX - touch1.clientX);
  }

  /**
   * Update mobile controls visibility
   */
  updateMobileControlsVisibility(visible) {
    this.mobileUI.isVisible = visible;
    
    if (this.mobileControlsContainer) {
      this.mobileControlsContainer.style.display = visible ? 'block' : 'none';
    }
  }

  /**
   * Update mobile controls settings
   */
  updateMobileSettings(newSettings) {
    this.settings.mobileControls = { ...this.settings.mobileControls, ...newSettings };
    this.settings.gestures = { ...this.settings.gestures, ...newSettings.gestures };
    this.settings.mobileUI = { ...this.settings.mobileUI, ...newSettings.mobileUI };

    // Recreate mobile UI if needed
    if (this.mobileControlsContainer) {
      this.mobileControlsContainer.remove();
      this.createMobileUI();
    }

    this.logger.info('Mobile settings updated');
  }

  /**
   * Get mobile controls state
   */
  getMobileControlsState() {
    return {
      isMobile: this.isMobile,
      isVisible: this.mobileUI.isVisible,
      orientation: this.mobileUI.orientation,
      virtualJoystick: {
        active: this.mobileUI.virtualJoystick.active,
        position: this.mobileUI.virtualJoystick.position,
      },
      settings: {
        mobileControls: this.settings.mobileControls,
        gestures: this.settings.gestures,
        mobileUI: this.settings.mobileUI,
      },
    };
  }
}

export default InputManager;
