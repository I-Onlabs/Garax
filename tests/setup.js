/**
 * Jest test setup file
 */

/**
 * Custom Jest matchers for EventBus callback testing.
 *
 * The EventBus passes TWO arguments to callbacks:
 *   1. data - the actual event payload
 *   2. eventData - metadata object { event, data, timestamp, id }
 *
 * These matchers help test EventBus callbacks by focusing on the first argument (data).
 */
expect.extend({
  /**
   * Checks if a mock was called with the expected data as the first argument.
   * Use this instead of toHaveBeenCalledWith when testing EventBus callbacks.
   *
   * @example
   * const callback = jest.fn();
   * eventBus.on('game:scored', callback);
   * eventBus.emit('game:scored', { score: 100 });
   * expect(callback).toHaveBeenCalledWithEventData({ score: 100 });
   */
  toHaveBeenCalledWithEventData(received, expected) {
    if (!jest.isMockFunction(received)) {
      return {
        pass: false,
        message: () => 'Expected value to be a mock function',
      };
    }

    const calls = received.mock.calls;
    if (calls.length === 0) {
      return {
        pass: false,
        message: () => 'Expected mock function to have been called, but it was not called',
      };
    }

    // Check if any call's first argument matches the expected value
    const matchingCall = calls.find(call => {
      const firstArg = call[0];
      try {
        expect(firstArg).toEqual(expect.objectContaining(expected));
        return true;
      } catch {
        return false;
      }
    });

    if (matchingCall) {
      return {
        pass: true,
        message: () => `Expected mock not to have been called with event data matching ${JSON.stringify(expected)}`,
      };
    }

    // Build a helpful error message showing what was actually received
    const receivedFirstArgs = calls.map(call => call[0]);
    return {
      pass: false,
      message: () =>
        `Expected mock to have been called with event data matching:\n` +
        `  ${JSON.stringify(expected)}\n\n` +
        `Received first arguments:\n` +
        `  ${receivedFirstArgs.map(arg => JSON.stringify(arg)).join('\n  ')}`,
    };
  },
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

global.sessionStorage = sessionStorageMock;

// Mock fetch
global.fetch = jest.fn();

// Mock performance
global.performance = {
  now: jest.fn(() => Date.now()),
  memory: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
    jsHeapSizeLimit: 4000000,
  },
};

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn((id) => clearTimeout(id));

// Mock AudioContext
global.AudioContext = jest.fn(() => ({
  createOscillator: jest.fn(() => ({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    frequency: { setValueAtTime: jest.fn() },
  })),
  createGain: jest.fn(() => ({
    connect: jest.fn(),
    gain: { setValueAtTime: jest.fn(), linearRampToValueAtTime: jest.fn() },
  })),
  destination: {},
  currentTime: 0,
  close: jest.fn(),
  resume: jest.fn().mockResolvedValue(undefined),
  state: 'running',
}));
global.webkitAudioContext = global.AudioContext;

// Mock Audio element - immediately fires canplaythrough event
global.Audio = jest.fn().mockImplementation((src) => {
  const eventListeners = {};
  const audioMock = {
    src: src || '',
    preload: 'auto',
    loop: false,
    volume: 1,
    currentTime: 0,
    duration: 1,
    paused: true,
    ended: false,
    muted: false,
    addEventListener: jest.fn((event, handler) => {
      eventListeners[event] = eventListeners[event] || [];
      eventListeners[event].push(handler);
      // Immediately fire canplaythrough event for audio loading
      if (event === 'canplaythrough') {
        setTimeout(() => handler(), 0);
      }
    }),
    removeEventListener: jest.fn((event, handler) => {
      if (eventListeners[event]) {
        eventListeners[event] = eventListeners[event].filter(h => h !== handler);
      }
    }),
    play: jest.fn().mockResolvedValue(undefined),
    pause: jest.fn(),
    load: jest.fn(),
  };
  return audioMock;
});

// Mock gamepad API
global.navigator.getGamepads = jest.fn(() => []);

// Mock URLSearchParams
global.URLSearchParams = jest.fn(() => ({
  get: jest.fn(),
  set: jest.fn(),
  has: jest.fn(),
  delete: jest.fn(),
  entries: jest.fn(() => []),
}));

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock Blob
global.Blob = class Blob {
  constructor(parts, options = {}) {
    this.parts = parts;
    this.type = options.type || '';
    this.size = parts ? parts.reduce((acc, part) => acc + (part.length || 0), 0) : 0;
  }
  arrayBuffer() {
    return Promise.resolve(new ArrayBuffer(0));
  }
  text() {
    return Promise.resolve('');
  }
};

// Mock ResizeObserver
global.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock MutationObserver
global.MutationObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  takeRecords: jest.fn(() => []),
}));

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock window.location methods (avoid replacing the whole location object in jsdom)
// jsdom's window.location is non-configurable, so we only mock the methods we need
try {
  window.location.assign = jest.fn();
  window.location.replace = jest.fn();
  window.location.reload = jest.fn();
} catch {
  // jsdom may throw if location methods are not writable - ignore
}

// Mock window.history
window.history = {
  pushState: jest.fn(),
  replaceState: jest.fn(),
  go: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
};

// Mock window.navigator
window.navigator = {
  ...window.navigator,
  userAgent: 'Mozilla/5.0 (compatible; Test Browser)',
  language: 'en-US',
  languages: ['en-US', 'en'],
  platform: 'Test Platform',
  onLine: true,
  cookieEnabled: true,
  getGamepads: jest.fn(() => []),
};

// Mock window.screen
window.screen = {
  width: 1920,
  height: 1080,
  availWidth: 1920,
  availHeight: 1040,
  colorDepth: 24,
  pixelDepth: 24,
};

// Mock window.matchMedia
window.matchMedia = jest.fn((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}));

// Mock window.getComputedStyle
window.getComputedStyle = jest.fn(() => ({
  getPropertyValue: jest.fn(() => ''),
  setProperty: jest.fn(),
  removeProperty: jest.fn(),
}));

// Note: We do NOT mock document.createElement or other document methods
// because jsdom provides a full DOM implementation that the game code depends on.
// Mocking these would break DOM manipulation that uses real Node/Element APIs.

// Only mock document.body if it doesn't exist (for headless environments)
if (!document.body) {
  const mockBody = document.createElement('body');
  document.documentElement.appendChild(mockBody);
}

// Mock HTMLElement
global.HTMLElement = class HTMLElement {
  constructor() {
    this.className = '';
    this.id = '';
    this.style = {};
    this.attributes = {};
    this.children = [];
    this.parentNode = null;
  }

  appendChild() {}
  removeChild() {}
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() {}
  focus() {}
  blur() {}
  click() {}
  getAttribute() {}
  setAttribute() {}
  removeAttribute() {}
  hasAttribute() {}
  querySelector() {}
  querySelectorAll() {
    return [];
  }
  getBoundingClientRect() {
    return {
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      width: 0,
      height: 0,
    };
  }
};

// Mock Event
global.Event = class Event {
  constructor(type, options = {}) {
    this.type = type;
    this.bubbles = options.bubbles || false;
    this.cancelable = options.cancelable || false;
    this.target = options.target || null;
    this.currentTarget = null;
    this.defaultPrevented = false;
    this.preventDefault = jest.fn();
    this.stopPropagation = jest.fn();
    this.stopImmediatePropagation = jest.fn();
  }
};

// Mock CustomEvent
global.CustomEvent = class CustomEvent extends Event {
  constructor(type, options = {}) {
    super(type, options);
    this.detail = options.detail || null;
  }
};

// Mock KeyboardEvent
global.KeyboardEvent = class KeyboardEvent extends Event {
  constructor(type, options = {}) {
    super(type, options);
    this.key = options.key || '';
    this.code = options.code || '';
    this.keyCode = options.keyCode || 0;
    this.which = options.which || 0;
    this.ctrlKey = options.ctrlKey || false;
    this.shiftKey = options.shiftKey || false;
    this.altKey = options.altKey || false;
    this.metaKey = options.metaKey || false;
  }
};

// Mock MouseEvent
global.MouseEvent = class MouseEvent extends Event {
  constructor(type, options = {}) {
    super(type, options);
    this.clientX = options.clientX || 0;
    this.clientY = options.clientY || 0;
    this.screenX = options.screenX || 0;
    this.screenY = options.screenY || 0;
    this.button = options.button || 0;
    this.buttons = options.buttons || 0;
    this.ctrlKey = options.ctrlKey || false;
    this.shiftKey = options.shiftKey || false;
    this.altKey = options.altKey || false;
    this.metaKey = options.metaKey || false;
  }
};

// Mock TouchEvent
global.TouchEvent = class TouchEvent extends Event {
  constructor(type, options = {}) {
    super(type, options);
    this.touches = options.touches || [];
    this.changedTouches = options.changedTouches || [];
    this.targetTouches = options.targetTouches || [];
    this.ctrlKey = options.ctrlKey || false;
    this.shiftKey = options.shiftKey || false;
    this.altKey = options.altKey || false;
    this.metaKey = options.metaKey || false;
  }
};

// Mock Touch
global.Touch = class Touch {
  constructor(options = {}) {
    this.identifier = options.identifier || 0;
    this.target = options.target || null;
    this.clientX = options.clientX || 0;
    this.clientY = options.clientY || 0;
    this.screenX = options.screenX || 0;
    this.screenY = options.screenY || 0;
    this.pageX = options.pageX || 0;
    this.pageY = options.pageY || 0;
    this.force = options.force || 1.0;
  }
};

// Mock WheelEvent
global.WheelEvent = class WheelEvent extends Event {
  constructor(type, options = {}) {
    super(type, options);
    this.deltaX = options.deltaX || 0;
    this.deltaY = options.deltaY || 0;
    this.deltaZ = options.deltaZ || 0;
    this.deltaMode = options.deltaMode || 0;
    this.clientX = options.clientX || 0;
    this.clientY = options.clientY || 0;
    this.ctrlKey = options.ctrlKey || false;
    this.shiftKey = options.shiftKey || false;
    this.altKey = options.altKey || false;
    this.metaKey = options.metaKey || false;
  }
};

// Mock GamepadEvent
global.GamepadEvent = class GamepadEvent extends Event {
  constructor(type, options = {}) {
    super(type, options);
    this.gamepad = options.gamepad || null;
  }
};

// Mock Gamepad
global.Gamepad = class Gamepad {
  constructor(options = {}) {
    this.id = options.id || 'Test Gamepad';
    this.index = options.index || 0;
    this.connected = options.connected || true;
    this.buttons = options.buttons || [];
    this.axes = options.axes || [];
    this.mapping = options.mapping || 'standard';
    this.hand = options.hand || 'unknown';
    this.pose = options.pose || null;
    this.hapticActuators = options.hapticActuators || [];
  }
};

// Mock GamepadButton
global.GamepadButton = class GamepadButton {
  constructor(options = {}) {
    this.pressed = options.pressed || false;
    this.touched = options.touched || false;
    this.value = options.value || 0;
  }
};

// Mock FocusEvent
global.FocusEvent = class FocusEvent extends Event {
  constructor(type, options = {}) {
    super(type, options);
    this.relatedTarget = options.relatedTarget || null;
  }
};

// Mock ErrorEvent
global.ErrorEvent = class ErrorEvent extends Event {
  constructor(type, options = {}) {
    super(type, options);
    this.message = options.message || '';
    this.filename = options.filename || '';
    this.lineno = options.lineno || 0;
    this.colno = options.colno || 0;
    this.error = options.error || null;
  }
};

// Mock Promise rejection handler
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('UnhandledPromiseRejectionWarning')
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
  sessionStorageMock.clear();
  fetch.mockClear();
  if (performance.now.mockClear) {
    performance.now.mockClear();
  }
  requestAnimationFrame.mockClear();
  cancelAnimationFrame.mockClear();
});
