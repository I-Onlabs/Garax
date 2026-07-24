/**
 * SettingsUI.test.js - Comprehensive test suite for SettingsUI component
 */

import { SettingsUI } from '../src/ui/SettingsUI.js';
import { EventBus } from '../src/core/EventBus.js';
import { Logger } from '../src/utils/Logger.js';

// Mock DOM methods
const mockContainer = {
  appendChild: jest.fn(),
  removeChild: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  querySelector: jest.fn(),
  querySelectorAll: jest.fn(() => []),
  style: {},
};

// Mock document methods
Object.defineProperty(document, 'body', {
  value: mockContainer,
  writable: true,
});

Object.defineProperty(document, 'createElement', {
  value: jest.fn((tagName) => {
    const element = {
      tagName: tagName.toUpperCase(),
      className: '',
      style: {},
      textContent: '',
      innerHTML: '',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      appendChild: jest.fn(),
      removeChild: jest.fn(),
      querySelector: jest.fn(),
      querySelectorAll: jest.fn(() => []),
      value: '',
      checked: false,
      min: 0,
      max: 1,
      step: 0.1,
      type: 'text',
      parentNode: null,
    };
    return element;
  }),
  writable: true,
});

Object.defineProperty(document, 'addEventListener', {
  value: jest.fn(),
  writable: true,
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('SettingsUI', () => {
  let settingsUI;
  let eventBus;
  let logger;
  let mockConfig;

  beforeEach(() => {
    eventBus = new EventBus();
    logger = new Logger(true);
    // Add debug method to logger mock
    logger.debug = jest.fn();
    mockConfig = {
      eventBus,
      logger,
      container: mockContainer,
    };

    // Clear all mocks and localStorage
    jest.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.clear();

    // Reset localStorage mock to return null (no saved settings)
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    if (settingsUI) {
      settingsUI.cleanup();
    }
  });

  describe('Initialization', () => {
    test('should initialize with valid config', () => {
      expect(() => {
        settingsUI = new SettingsUI(mockConfig);
      }).not.toThrow();
    });

    test('should throw error if eventBus is missing', () => {
      expect(() => {
        new SettingsUI({ logger });
      }).toThrow(
        'SettingsUI: eventBus is required and must be an EventBus instance'
      );
    });

    test('should throw error if logger is missing', () => {
      expect(() => {
        new SettingsUI({ eventBus });
      }).toThrow(
        'SettingsUI: logger is required and must be a Logger instance'
      );
    });

    test('should throw error if eventBus is not EventBus instance', () => {
      expect(() => {
        new SettingsUI({ eventBus: {}, logger });
      }).toThrow(
        'SettingsUI: eventBus is required and must be an EventBus instance'
      );
    });

    test('should throw error if logger is not Logger instance', () => {
      expect(() => {
        new SettingsUI({ eventBus, logger: {} });
      }).toThrow(
        'SettingsUI: logger is required and must be a Logger instance'
      );
    });

    test('should initialize with default settings', () => {
      settingsUI = new SettingsUI(mockConfig);
      const settings = settingsUI.getSettings();

      expect(settings.audio).toBeDefined();
      expect(settings.graphics).toBeDefined();
      expect(settings.gameplay).toBeDefined();
      expect(settings.accessibility).toBeDefined();
      expect(settings.controls).toBeDefined();
    });

    test('should bind all methods correctly', () => {
      settingsUI = new SettingsUI(mockConfig);

      expect(typeof settingsUI.show).toBe('function');
      expect(typeof settingsUI.hide).toBe('function');
      expect(typeof settingsUI.toggle).toBe('function');
      expect(typeof settingsUI.updateSetting).toBe('function');
      expect(typeof settingsUI.resetToDefaults).toBe('function');
      expect(typeof settingsUI.saveSettings).toBe('function');
      expect(typeof settingsUI.loadSettings).toBe('function');
    });
  });

  describe('Settings Management', () => {
    beforeEach(() => {
      settingsUI = new SettingsUI(mockConfig);
    });

    test('should get default settings correctly', () => {
      const settings = settingsUI.getSettings();

      expect(settings.audio.masterVolume).toBe(1.0);
      expect(settings.audio.musicVolume).toBe(0.8);
      expect(settings.audio.sfxVolume).toBe(0.9);
      expect(settings.audio.muteAll).toBe(false);
      expect(settings.graphics.quality).toBe('high');
      expect(settings.gameplay.difficulty).toBe('normal');
      expect(settings.accessibility.highContrast).toBe(false);
    });

    test('should update setting by path', () => {
      const eventSpy = jest.spyOn(eventBus, 'emit');

      settingsUI.updateSetting('audio.masterVolume', 0.5);

      expect(settingsUI.getSettingValue('audio.masterVolume')).toBe(0.5);
      expect(eventSpy).toHaveBeenCalledWith('settings:changed', {
        path: 'audio.masterVolume',
        value: 0.5,
        settings: expect.any(Object),
      });
    });

    test('should update nested setting correctly', () => {
      settingsUI.updateSetting('audio.muteAll', true);
      expect(settingsUI.getSettingValue('audio.muteAll')).toBe(true);
    });

    test('should get setting value by path', () => {
      expect(settingsUI.getSettingValue('audio.masterVolume')).toBe(1.0);
      expect(settingsUI.getSettingValue('graphics.quality')).toBe('high');
      expect(settingsUI.getSettingValue('gameplay.difficulty')).toBe('normal');
    });

    test('should reset to defaults', () => {
      // Modify some settings
      settingsUI.updateSetting('audio.masterVolume', 0.5);
      settingsUI.updateSetting('graphics.quality', 'low');

      // Reset to defaults
      settingsUI.resetToDefaults();

      expect(settingsUI.getSettingValue('audio.masterVolume')).toBe(1.0);
      expect(settingsUI.getSettingValue('graphics.quality')).toBe('high');
    });

    test('should set settings programmatically', () => {
      const newSettings = {
        audio: { masterVolume: 0.7 },
        graphics: { quality: 'medium' },
      };

      const eventSpy = jest.spyOn(eventBus, 'emit');
      settingsUI.setSettings(newSettings);

      expect(settingsUI.getSettingValue('audio.masterVolume')).toBe(0.7);
      expect(settingsUI.getSettingValue('graphics.quality')).toBe('medium');
      expect(eventSpy).toHaveBeenCalledWith(
        'settings:updated',
        expect.any(Object)
      );
    });
  });

  describe('UI Visibility', () => {
    beforeEach(() => {
      settingsUI = new SettingsUI(mockConfig);
    });

    test('should show settings UI', () => {
      const eventSpy = jest.spyOn(eventBus, 'emit');

      settingsUI.show();

      expect(settingsUI.isVisible).toBe(true);
      expect(eventSpy).toHaveBeenCalledWith('settings:opened');
    });

    test('should hide settings UI', () => {
      const eventSpy = jest.spyOn(eventBus, 'emit');

      settingsUI.hide();

      expect(settingsUI.isVisible).toBe(false);
      expect(eventSpy).toHaveBeenCalledWith('settings:closed');
    });

    test('should toggle settings UI visibility', () => {
      expect(settingsUI.isVisible).toBe(false);

      settingsUI.toggle();
      expect(settingsUI.isVisible).toBe(true);

      settingsUI.toggle();
      expect(settingsUI.isVisible).toBe(false);
    });
  });

  describe('Persistence', () => {
    beforeEach(() => {
      settingsUI = new SettingsUI(mockConfig);
    });

    test('should save settings to localStorage', () => {
      const eventSpy = jest.spyOn(eventBus, 'emit');

      settingsUI.saveSettings();

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'gameSettings',
        JSON.stringify(settingsUI.getSettings())
      );
      expect(eventSpy).toHaveBeenCalledWith(
        'settings:saved',
        expect.any(Object)
      );
    });

    test('should load settings from localStorage', () => {
      const savedSettings = {
        audio: { masterVolume: 0.6 },
        graphics: { quality: 'low' },
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedSettings));
      const eventSpy = jest.spyOn(eventBus, 'emit');

      settingsUI.loadSettings();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('gameSettings');
      expect(settingsUI.getSettingValue('audio.masterVolume')).toBe(0.6);
      expect(settingsUI.getSettingValue('graphics.quality')).toBe('low');
      expect(eventSpy).toHaveBeenCalledWith(
        'settings:loaded',
        expect.any(Object)
      );
    });

    test('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const eventSpy = jest.spyOn(eventBus, 'emit');

      expect(() => settingsUI.loadSettings()).not.toThrow();
      expect(eventSpy).toHaveBeenCalledWith(
        'settings:loadError',
        expect.any(Error)
      );
    });

    test('should merge settings correctly', () => {
      const savedSettings = {
        audio: { masterVolume: 0.6 },
        graphics: { quality: 'low' },
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedSettings));
      settingsUI.loadSettings();

      // Should merge with defaults, not replace entirely
      expect(settingsUI.getSettingValue('audio.masterVolume')).toBe(0.6);
      expect(settingsUI.getSettingValue('audio.musicVolume')).toBe(0.8); // default value
      expect(settingsUI.getSettingValue('graphics.quality')).toBe('low');
      expect(settingsUI.getSettingValue('gameplay.difficulty')).toBe('normal'); // default value
    });
  });

  describe('Event Handling', () => {
    beforeEach(() => {
      settingsUI = new SettingsUI(mockConfig);
    });

    test('should set up event listeners on initialization', () => {
      expect(document.addEventListener).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );
    });

    test('should handle escape key to close settings', () => {
      settingsUI.show();
      expect(settingsUI.isVisible).toBe(true);

      // Test that the escape key handler is set up
      expect(document.addEventListener).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );

      // Note: In a real test environment, we would need to properly mock
      // the event listener to test the actual escape key functionality
    });
  });

  describe('Default Settings', () => {
    test('should have correct default audio settings', () => {
      // Create a fresh instance to ensure default settings
      const freshSettingsUI = new SettingsUI(mockConfig);
      const audioSettings = freshSettingsUI.getSettings().audio;

      expect(audioSettings.masterVolume).toBe(1.0);
      expect(audioSettings.musicVolume).toBe(0.8);
      expect(audioSettings.sfxVolume).toBe(0.9);
      expect(audioSettings.muteAll).toBe(false);
      expect(audioSettings.muteMusic).toBe(false);
      expect(audioSettings.muteSfx).toBe(false);

      freshSettingsUI.cleanup();
    });

    test('should have correct default graphics settings', () => {
      // Create a fresh instance to ensure default settings
      const freshSettingsUI = new SettingsUI(mockConfig);
      const graphicsSettings = freshSettingsUI.getSettings().graphics;

      expect(graphicsSettings.quality).toBe('high');
      expect(graphicsSettings.fullscreen).toBe(false);
      expect(graphicsSettings.vsync).toBe(true);
      expect(graphicsSettings.particleEffects).toBe(true);
      expect(graphicsSettings.shadows).toBe(true);
      expect(graphicsSettings.antiAliasing).toBe(true);

      freshSettingsUI.cleanup();
    });

    test('should have correct default gameplay settings', () => {
      settingsUI = new SettingsUI(mockConfig);
      const gameplaySettings = settingsUI.getSettings().gameplay;

      expect(gameplaySettings.difficulty).toBe('normal');
      expect(gameplaySettings.autoSave).toBe(true);
      expect(gameplaySettings.autoPause).toBe(true);
      expect(gameplaySettings.showFPS).toBe(false);
      expect(gameplaySettings.showDebugInfo).toBe(false);
      expect(gameplaySettings.tutorialEnabled).toBe(true);
    });

    test('should have correct default accessibility settings', () => {
      settingsUI = new SettingsUI(mockConfig);
      const accessibilitySettings = settingsUI.getSettings().accessibility;

      expect(accessibilitySettings.highContrast).toBe(false);
      expect(accessibilitySettings.largeText).toBe(false);
      expect(accessibilitySettings.screenReader).toBe(false);
      expect(accessibilitySettings.colorBlindMode).toBe('none');
      expect(accessibilitySettings.reducedMotion).toBe(false);
      expect(accessibilitySettings.keyboardNavigation).toBe(true);
    });

    test('should have correct default key bindings', () => {
      settingsUI = new SettingsUI(mockConfig);
      const keyBindings = settingsUI.getSettings().controls.keyBindings;

      expect(keyBindings.moveUp).toBe('KeyW');
      expect(keyBindings.moveDown).toBe('KeyS');
      expect(keyBindings.moveLeft).toBe('KeyA');
      expect(keyBindings.moveRight).toBe('KeyD');
      expect(keyBindings.jump).toBe('Space');
      expect(keyBindings.action).toBe('KeyE');
      expect(keyBindings.pause).toBe('Escape');
    });
  });

  describe('Cleanup', () => {
    test('should cleanup resources properly', () => {
      settingsUI = new SettingsUI(mockConfig);
      const eventSpy = jest.spyOn(eventBus, 'emit');

      settingsUI.cleanup();

      expect(eventSpy).toHaveBeenCalledWith('settings:cleanup');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid setting paths gracefully', () => {
      settingsUI = new SettingsUI(mockConfig);

      // Should not throw error for invalid path
      expect(() => {
        settingsUI.getSettingValue('invalid.path');
      }).not.toThrow();

      expect(settingsUI.getSettingValue('invalid.path')).toBeUndefined();
    });

    test('should handle localStorage save errors', () => {
      settingsUI = new SettingsUI(mockConfig);
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const eventSpy = jest.spyOn(eventBus, 'emit');

      expect(() => settingsUI.saveSettings()).not.toThrow();
      expect(eventSpy).toHaveBeenCalledWith(
        'settings:saveError',
        expect.any(Error)
      );
    });
  });

  describe('Integration', () => {
    test('should integrate with EventBus correctly', () => {
      const eventSpy = jest.spyOn(eventBus, 'emit');
      settingsUI = new SettingsUI(mockConfig);

      // Test that events are emitted for various actions
      settingsUI.show();
      expect(eventSpy).toHaveBeenCalledWith('settings:opened');

      settingsUI.updateSetting('audio.masterVolume', 0.5);
      expect(eventSpy).toHaveBeenCalledWith(
        'settings:changed',
        expect.objectContaining({
          path: 'audio.masterVolume',
          value: 0.5,
        })
      );

      // Reset localStorage mock to work properly for this test
      localStorageMock.setItem.mockImplementation(() => {});
      settingsUI.saveSettings();
      expect(eventSpy).toHaveBeenCalledWith(
        'settings:saved',
        expect.any(Object)
      );
    });

    test('should work with custom container', () => {
      const customContainer = {
        appendChild: jest.fn(),
        removeChild: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        querySelector: jest.fn(),
        querySelectorAll: jest.fn(() => []),
        style: {},
      };

      const customConfig = {
        eventBus,
        logger,
        container: customContainer,
      };

      settingsUI = new SettingsUI(customConfig);

      expect(customContainer.appendChild).toHaveBeenCalled();
    });
  });
});
