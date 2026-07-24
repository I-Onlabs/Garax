/**
 * SettingsUI.js - Settings user interface component
 *
 * Provides a comprehensive settings interface with proper UI-to-system contracts
 * for managing game settings, audio preferences, and accessibility options.
 */

import { EventBus } from '../core/EventBus.js';
import { Logger } from '../utils/Logger.js';

export class SettingsUI {
  constructor(config = {}) {
    // Validate required dependencies
    if (!config.eventBus || !(config.eventBus instanceof EventBus)) {
      throw new Error(
        'SettingsUI: eventBus is required and must be an EventBus instance'
      );
    }
    if (!config.logger || !(config.logger instanceof Logger)) {
      throw new Error(
        'SettingsUI: logger is required and must be a Logger instance'
      );
    }

    this.eventBus = config.eventBus;
    this.logger = config.logger;
    this.container = config.container || document.body;
    this.isVisible = false;
    this.settings = this.getDefaultSettings();

    // Bind methods
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.toggle = this.toggle.bind(this);
    this.updateSetting = this.updateSetting.bind(this);
    this.resetToDefaults = this.resetToDefaults.bind(this);
    this.saveSettings = this.saveSettings.bind(this);
    this.loadSettings = this.loadSettings.bind(this);

    // Initialize UI
    this.initializeUI();
    this.setupEventListeners();
    this.loadSettings();

    this.logger.info('SettingsUI initialized');
  }

  /**
   * Get default settings configuration
   */
  getDefaultSettings() {
    return {
      // Audio settings
      audio: {
        masterVolume: 1.0,
        musicVolume: 0.8,
        sfxVolume: 0.9,
        muteAll: false,
        muteMusic: false,
        muteSfx: false,
      },
      // Graphics settings
      graphics: {
        quality: 'high', // low, medium, high, ultra
        fullscreen: false,
        vsync: true,
        particleEffects: true,
        shadows: true,
        antiAliasing: true,
      },
      // Gameplay settings
      gameplay: {
        difficulty: 'normal', // easy, normal, hard, expert
        autoSave: true,
        autoPause: true,
        showFPS: false,
        showDebugInfo: false,
        tutorialEnabled: true,
      },
      // Accessibility settings
      accessibility: {
        highContrast: false,
        largeText: false,
        screenReader: false,
        colorBlindMode: 'none', // none, protanopia, deuteranopia, tritanopia
        reducedMotion: false,
        keyboardNavigation: true,
      },
      // Controls settings
      controls: {
        keyBindings: this.getDefaultKeyBindings(),
        mouseSensitivity: 1.0,
        invertY: false,
        autoAim: false,
      },
    };
  }

  /**
   * Get default key bindings
   */
  getDefaultKeyBindings() {
    return {
      moveUp: 'KeyW',
      moveDown: 'KeyS',
      moveLeft: 'KeyA',
      moveRight: 'KeyD',
      jump: 'Space',
      action: 'KeyE',
      pause: 'Escape',
      inventory: 'KeyI',
      map: 'KeyM',
      chat: 'KeyT',
    };
  }

  /**
   * Initialize the settings UI DOM structure
   */
  initializeUI() {
    // Create main settings container
    this.settingsContainer = document.createElement('div');
    this.settingsContainer.className = 'settings-container';
    this.settingsContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: none;
      z-index: 1000;
      overflow-y: auto;
    `;

    // Create settings panel
    this.settingsPanel = document.createElement('div');
    this.settingsPanel.className = 'settings-panel';
    this.settingsPanel.style.cssText = `
      position: relative;
      max-width: 800px;
      margin: 2rem auto;
      background: #1a1a1a;
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    `;

    // Create header
    this.createHeader();

    // Create settings sections
    this.createAudioSection();
    this.createGraphicsSection();
    this.createGameplaySection();
    this.createAccessibilitySection();
    this.createControlsSection();

    // Create footer with action buttons
    this.createFooter();

    this.settingsContainer.appendChild(this.settingsPanel);
    this.container.appendChild(this.settingsContainer);
  }

  /**
   * Create settings header
   */
  createHeader() {
    const header = document.createElement('div');
    header.className = 'settings-header';
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #333;
    `;

    const title = document.createElement('h2');
    title.textContent = 'Game Settings';
    title.style.cssText = `
      color: #fff;
      margin: 0;
      font-size: 1.5rem;
    `;

    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.className = 'settings-close';
    closeButton.style.cssText = `
      background: none;
      border: none;
      color: #fff;
      font-size: 2rem;
      cursor: pointer;
      padding: 0;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    closeButton.addEventListener('click', this.hide);

    header.appendChild(title);
    header.appendChild(closeButton);
    this.settingsPanel.appendChild(header);
  }

  /**
   * Create audio settings section
   */
  createAudioSection() {
    const section = this.createSection('Audio Settings', 'audio');

    // Master volume
    this.createSliderControl(
      section,
      'Master Volume',
      'audio.masterVolume',
      0,
      1,
      0.1
    );

    // Music volume
    this.createSliderControl(
      section,
      'Music Volume',
      'audio.musicVolume',
      0,
      1,
      0.1
    );

    // SFX volume
    this.createSliderControl(
      section,
      'SFX Volume',
      'audio.sfxVolume',
      0,
      1,
      0.1
    );

    // Mute options
    this.createCheckboxControl(section, 'Mute All', 'audio.muteAll');
    this.createCheckboxControl(section, 'Mute Music', 'audio.muteMusic');
    this.createCheckboxControl(section, 'Mute SFX', 'audio.muteSfx');
  }

  /**
   * Create graphics settings section
   */
  createGraphicsSection() {
    const section = this.createSection('Graphics Settings', 'graphics');

    // Quality preset
    this.createSelectControl(section, 'Quality Preset', 'graphics.quality', [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'ultra', label: 'Ultra' },
    ]);

    // Graphics options
    this.createCheckboxControl(section, 'Fullscreen', 'graphics.fullscreen');
    this.createCheckboxControl(section, 'VSync', 'graphics.vsync');
    this.createCheckboxControl(
      section,
      'Particle Effects',
      'graphics.particleEffects'
    );
    this.createCheckboxControl(section, 'Shadows', 'graphics.shadows');
    this.createCheckboxControl(
      section,
      'Anti-Aliasing',
      'graphics.antiAliasing'
    );
  }

  /**
   * Create gameplay settings section
   */
  createGameplaySection() {
    const section = this.createSection('Gameplay Settings', 'gameplay');

    // Difficulty
    this.createSelectControl(section, 'Difficulty', 'gameplay.difficulty', [
      { value: 'easy', label: 'Easy' },
      { value: 'normal', label: 'Normal' },
      { value: 'hard', label: 'Hard' },
      { value: 'expert', label: 'Expert' },
    ]);

    // Gameplay options
    this.createCheckboxControl(section, 'Auto Save', 'gameplay.autoSave');
    this.createCheckboxControl(section, 'Auto Pause', 'gameplay.autoPause');
    this.createCheckboxControl(section, 'Show FPS', 'gameplay.showFPS');
    this.createCheckboxControl(
      section,
      'Show Debug Info',
      'gameplay.showDebugInfo'
    );
    this.createCheckboxControl(
      section,
      'Tutorial Enabled',
      'gameplay.tutorialEnabled'
    );
  }

  /**
   * Create accessibility settings section
   */
  createAccessibilitySection() {
    const section = this.createSection(
      'Accessibility Settings',
      'accessibility'
    );

    // Accessibility options
    this.createCheckboxControl(
      section,
      'High Contrast',
      'accessibility.highContrast'
    );
    this.createCheckboxControl(
      section,
      'Large Text',
      'accessibility.largeText'
    );
    this.createCheckboxControl(
      section,
      'Screen Reader Support',
      'accessibility.screenReader'
    );
    this.createCheckboxControl(
      section,
      'Reduced Motion',
      'accessibility.reducedMotion'
    );
    this.createCheckboxControl(
      section,
      'Keyboard Navigation',
      'accessibility.keyboardNavigation'
    );

    // Color blind mode
    this.createSelectControl(
      section,
      'Color Blind Mode',
      'accessibility.colorBlindMode',
      [
        { value: 'none', label: 'None' },
        { value: 'protanopia', label: 'Protanopia' },
        { value: 'deuteranopia', label: 'Deuteranopia' },
        { value: 'tritanopia', label: 'Tritanopia' },
      ]
    );
  }

  /**
   * Create controls settings section
   */
  createControlsSection() {
    const section = this.createSection('Controls Settings', 'controls');

    // Mouse sensitivity
    this.createSliderControl(
      section,
      'Mouse Sensitivity',
      'controls.mouseSensitivity',
      0.1,
      3.0,
      0.1
    );

    // Control options
    this.createCheckboxControl(section, 'Invert Y Axis', 'controls.invertY');
    this.createCheckboxControl(section, 'Auto Aim', 'controls.autoAim');

    // Key bindings (simplified for now)
    const keyBindingsDiv = document.createElement('div');
    keyBindingsDiv.innerHTML =
      '<h4>Key Bindings</h4><p>Key binding customization coming soon...</p>';
    section.appendChild(keyBindingsDiv);
  }

  /**
   * Create a settings section container
   */
  createSection(title, id) {
    const section = document.createElement('div');
    section.className = `settings-section settings-section-${id}`;
    section.style.cssText = `
      margin-bottom: 2rem;
      padding: 1rem;
      background: #2a2a2a;
      border-radius: 4px;
    `;

    const sectionTitle = document.createElement('h3');
    sectionTitle.textContent = title;
    sectionTitle.style.cssText = `
      color: #fff;
      margin: 0 0 1rem 0;
      font-size: 1.2rem;
    `;

    section.appendChild(sectionTitle);
    this.settingsPanel.appendChild(section);
    return section;
  }

  /**
   * Create a slider control
   */
  createSliderControl(container, label, settingPath, min, max, step) {
    const controlDiv = document.createElement('div');
    controlDiv.className = 'settings-control';
    controlDiv.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    `;

    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    labelEl.style.cssText = `
      color: #fff;
      margin-right: 1rem;
      min-width: 150px;
    `;

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = min;
    slider.max = max;
    slider.step = step;
    slider.value = this.getSettingValue(settingPath);
    slider.style.cssText = `
      flex: 1;
      margin-right: 1rem;
    `;

    const valueDisplay = document.createElement('span');
    valueDisplay.textContent = slider.value;
    valueDisplay.style.cssText = `
      color: #fff;
      min-width: 50px;
      text-align: right;
    `;

    slider.addEventListener('input', (e) => {
      valueDisplay.textContent = e.target.value;
      this.updateSetting(settingPath, parseFloat(e.target.value));
    });

    controlDiv.appendChild(labelEl);
    controlDiv.appendChild(slider);
    controlDiv.appendChild(valueDisplay);
    container.appendChild(controlDiv);
  }

  /**
   * Create a checkbox control
   */
  createCheckboxControl(container, label, settingPath) {
    const controlDiv = document.createElement('div');
    controlDiv.className = 'settings-control';
    controlDiv.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    `;

    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    labelEl.style.cssText = `
      color: #fff;
      margin-right: 1rem;
      flex: 1;
    `;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = this.getSettingValue(settingPath);
    checkbox.style.cssText = `
      width: 20px;
      height: 20px;
    `;

    checkbox.addEventListener('change', (e) => {
      this.updateSetting(settingPath, e.target.checked);
    });

    controlDiv.appendChild(labelEl);
    controlDiv.appendChild(checkbox);
    container.appendChild(controlDiv);
  }

  /**
   * Create a select control
   */
  createSelectControl(container, label, settingPath, options) {
    const controlDiv = document.createElement('div');
    controlDiv.className = 'settings-control';
    controlDiv.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    `;

    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    labelEl.style.cssText = `
      color: #fff;
      margin-right: 1rem;
      min-width: 150px;
    `;

    const select = document.createElement('select');
    select.value = this.getSettingValue(settingPath);
    select.style.cssText = `
      flex: 1;
      padding: 0.5rem;
      background: #333;
      color: #fff;
      border: 1px solid #555;
      border-radius: 4px;
    `;

    options.forEach((option) => {
      const optionEl = document.createElement('option');
      optionEl.value = option.value;
      optionEl.textContent = option.label;
      select.appendChild(optionEl);
    });

    select.addEventListener('change', (e) => {
      this.updateSetting(settingPath, e.target.value);
    });

    controlDiv.appendChild(labelEl);
    controlDiv.appendChild(select);
    container.appendChild(controlDiv);
  }

  /**
   * Create footer with action buttons
   */
  createFooter() {
    const footer = document.createElement('div');
    footer.className = 'settings-footer';
    footer.style.cssText = `
      display: flex;
      justify-content: space-between;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #333;
    `;

    const resetButton = document.createElement('button');
    resetButton.textContent = 'Reset to Defaults';
    resetButton.className = 'settings-reset';
    resetButton.style.cssText = `
      background: #666;
      color: #fff;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
    `;
    resetButton.addEventListener('click', this.resetToDefaults);

    const buttonGroup = document.createElement('div');
    buttonGroup.style.cssText = `
      display: flex;
      gap: 1rem;
    `;

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.className = 'settings-cancel';
    cancelButton.style.cssText = `
      background: #666;
      color: #fff;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
    `;
    cancelButton.addEventListener('click', this.hide);

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save Settings';
    saveButton.className = 'settings-save';
    saveButton.style.cssText = `
      background: #4CAF50;
      color: #fff;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
    `;
    saveButton.addEventListener('click', this.saveSettings);

    buttonGroup.appendChild(cancelButton);
    buttonGroup.appendChild(saveButton);
    footer.appendChild(resetButton);
    footer.appendChild(buttonGroup);
    this.settingsPanel.appendChild(footer);
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });

    // Close on backdrop click
    this.settingsContainer.addEventListener('click', (e) => {
      if (e.target === this.settingsContainer) {
        this.hide();
      }
    });
  }

  /**
   * Get setting value by path
   */
  getSettingValue(path) {
    if (!path || typeof path !== 'string') {
      return undefined;
    }

    const keys = path.split('.');
    let value = this.settings;
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }
    return value;
  }

  /**
   * Update setting value by path
   */
  updateSetting(path, value) {
    const keys = path.split('.');
    let target = this.settings;
    for (let i = 0; i < keys.length - 1; i++) {
      target = target[keys[i]];
    }
    target[keys[keys.length - 1]] = value;

    // Emit setting change event
    this.eventBus.emit('settings:changed', {
      path,
      value,
      settings: this.settings,
    });

    this.logger.debug(`Setting updated: ${path} = ${value}`);
  }

  /**
   * Show settings UI
   */
  show() {
    this.settingsContainer.style.display = 'block';
    this.isVisible = true;
    this.eventBus.emit('settings:opened');
    this.logger.info('Settings UI opened');
  }

  /**
   * Hide settings UI
   */
  hide() {
    this.settingsContainer.style.display = 'none';
    this.isVisible = false;
    this.eventBus.emit('settings:closed');
    this.logger.info('Settings UI closed');
  }

  /**
   * Toggle settings UI visibility
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Reset all settings to defaults
   */
  resetToDefaults() {
    this.settings = this.getDefaultSettings();
    this.loadSettings();
    this.eventBus.emit('settings:reset');
    this.logger.info('Settings reset to defaults');
  }

  /**
   * Save settings to localStorage
   */
  saveSettings() {
    try {
      localStorage.setItem('gameSettings', JSON.stringify(this.settings));
      this.eventBus.emit('settings:saved', this.settings);
      this.logger.info('Settings saved successfully');
      this.hide();
    } catch (error) {
      this.logger.error('Failed to save settings:', error);
      this.eventBus.emit('settings:saveError', error);
    }
  }

  /**
   * Load settings from localStorage
   */
  loadSettings() {
    try {
      const saved = localStorage.getItem('gameSettings');
      if (saved) {
        const parsedSettings = JSON.parse(saved);
        this.settings = this.mergeSettings(this.settings, parsedSettings);
        this.eventBus.emit('settings:loaded', this.settings);
        this.logger.info('Settings loaded successfully');
      }
    } catch (error) {
      this.logger.error('Failed to load settings:', error);
      this.eventBus.emit('settings:loadError', error);
    }
  }

  /**
   * Merge settings objects
   */
  mergeSettings(defaults, saved) {
    const merged = { ...defaults };
    for (const key in saved) {
      if (typeof saved[key] === 'object' && !Array.isArray(saved[key])) {
        merged[key] = this.mergeSettings(defaults[key] || {}, saved[key]);
      } else {
        merged[key] = saved[key];
      }
    }
    return merged;
  }

  /**
   * Get current settings
   */
  getSettings() {
    return { ...this.settings };
  }

  /**
   * Update settings programmatically
   */
  setSettings(newSettings) {
    this.settings = this.mergeSettings(this.settings, newSettings);
    this.eventBus.emit('settings:updated', this.settings);
    this.logger.info('Settings updated programmatically');
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.settingsContainer && this.settingsContainer.parentNode) {
      this.settingsContainer.parentNode.removeChild(this.settingsContainer);
    }
    this.eventBus.emit('settings:cleanup');
    this.logger.info('SettingsUI cleaned up');
  }
}
