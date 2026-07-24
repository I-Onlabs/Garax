/**
 * AudioSystem.js - Comprehensive audio management system
 *
 * Provides audio playback, volume control, and audio effects management
 * with proper integration with the UI system and game events.
 */

import { EventBus } from '../core/EventBus.js';
import { Logger } from '../utils/Logger.js';

export class AudioSystem {
  constructor(config = {}) {
    // Validate required dependencies
    if (!config.eventBus || !(config.eventBus instanceof EventBus)) {
      throw new Error(
        'AudioSystem: eventBus is required and must be an EventBus instance'
      );
    }
    if (!config.logger || !(config.logger instanceof Logger)) {
      throw new Error(
        'AudioSystem: logger is required and must be a Logger instance'
      );
    }

    this.eventBus = config.eventBus;
    this.logger = config.logger;
    this.audioContext = null;
    this.sounds = new Map();
    this.music = new Map();
    this.audioSettings = {
      masterVolume: 1.0,
      musicVolume: 0.8,
      sfxVolume: 0.9,
      muteAll: false,
      muteMusic: false,
      muteSfx: false,
    };
    this.currentMusic = null;
    this.isInitialized = false;

    // Bind methods
    this.initialize = this.initialize.bind(this);
    this.loadSound = this.loadSound.bind(this);
    this.loadMusic = this.loadMusic.bind(this);
    this.playSound = this.playSound.bind(this);
    this.playMusic = this.playMusic.bind(this);
    this.stopMusic = this.stopMusic.bind(this);
    this.pauseMusic = this.pauseMusic.bind(this);
    this.resumeMusic = this.resumeMusic.bind(this);
    this.setMasterVolume = this.setMasterVolume.bind(this);
    this.setMusicVolume = this.setMusicVolume.bind(this);
    this.setSfxVolume = this.setSfxVolume.bind(this);
    this.muteAll = this.muteAll.bind(this);
    this.unmuteAll = this.unmuteAll.bind(this);
    this.muteMusic = this.muteMusic.bind(this);
    this.unmuteMusic = this.unmuteMusic.bind(this);
    this.muteSfx = this.muteSfx.bind(this);
    this.unmuteSfx = this.unmuteSfx.bind(this);
    this.cleanup = this.cleanup.bind(this);

    this.logger.info('AudioSystem initialized');
  }

  /**
   * Initialize the audio system
   */
  async initialize() {
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      // Resume audio context if suspended (required for some browsers)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Set up event listeners
      this.setupEventListeners();

      // Load default audio assets
      await this.loadDefaultAssets();

      this.isInitialized = true;
      this.eventBus.emit('audio:initialized');
      this.logger.info('AudioSystem initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize AudioSystem:', error);
      this.eventBus.emit('audio:initializationError', error);
      throw error;
    }
  }

  /**
   * Set up event listeners for audio-related events
   */
  setupEventListeners() {
    // Settings changes
    this.eventBus.on('settings:changed', (data) => {
      this.handleSettingsChange(data);
    });

    // Game events that trigger sounds
    this.eventBus.on('player:jump', () => {
      this.playSound('jump');
    });

    this.eventBus.on('player:collect', (data) => {
      this.playSound('collect');
    });

    this.eventBus.on('player:damage', () => {
      this.playSound('damage');
    });

    this.eventBus.on('player:death', () => {
      this.playSound('death');
    });

    this.eventBus.on('game:levelComplete', () => {
      this.playSound('levelComplete');
    });

    this.eventBus.on('game:gameOver', () => {
      this.playSound('gameOver');
    });

    this.eventBus.on('achievement:unlocked', () => {
      this.playSound('achievement');
    });

    // Window events
    window.addEventListener('beforeunload', this.cleanup);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseMusic();
      } else {
        this.resumeMusic();
      }
    });
  }

  /**
   * Handle settings changes
   */
  handleSettingsChange(data) {
    const { path, value } = data;

    switch (path) {
      case 'audio.masterVolume':
        this.setMasterVolume(value);
        break;
      case 'audio.musicVolume':
        this.setMusicVolume(value);
        break;
      case 'audio.sfxVolume':
        this.setSfxVolume(value);
        break;
      case 'audio.muteAll':
        if (value) {
          this.muteAll();
        } else {
          this.unmuteAll();
        }
        break;
      case 'audio.muteMusic':
        if (value) {
          this.muteMusic();
        } else {
          this.unmuteMusic();
        }
        break;
      case 'audio.muteSfx':
        if (value) {
          this.muteSfx();
        } else {
          this.unmuteSfx();
        }
        break;
    }
  }

  /**
   * Load default audio assets
   */
  async loadDefaultAssets() {
    const defaultSounds = [
      'jump',
      'collect',
      'damage',
      'death',
      'levelComplete',
      'gameOver',
      'achievement',
      'buttonClick',
      'buttonHover',
      'error',
    ];

    const defaultMusic = [
      'mainTheme',
      'menuTheme',
      'gameplayTheme',
      'victoryTheme',
    ];

    // Load sounds (using placeholder data URLs for demo)
    for (const soundName of defaultSounds) {
      await this.loadSound(soundName, this.generatePlaceholderAudio(soundName));
    }

    // Load music
    for (const musicName of defaultMusic) {
      await this.loadMusic(
        musicName,
        this.generatePlaceholderAudio(musicName, true)
      );
    }

    this.logger.info('Default audio assets loaded');
  }

  /**
   * Generate placeholder audio data URL for demo purposes
   */
  generatePlaceholderAudio(name, isMusic = false) {
    // In a real implementation, this would load actual audio files
    // For demo purposes, we'll create a simple data URL
    const duration = isMusic ? 30 : 1; // 30 seconds for music, 1 second for sounds
    const sampleRate = 44100;
    const samples = sampleRate * duration;
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);

    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples * 2, true);

    // Generate simple sine wave
    for (let i = 0; i < samples; i++) {
      const sample = Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 0.1; // 440Hz tone
      view.setInt16(44 + i * 2, sample * 32767, true);
    }

    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  /**
   * Load a sound effect
   */
  async loadSound(name, url) {
    try {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.volume =
        this.audioSettings.sfxVolume * this.audioSettings.masterVolume;

      await new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', resolve);
        audio.addEventListener('error', reject);
      });

      this.sounds.set(name, audio);
      this.logger.debug(`Sound loaded: ${name}`);
    } catch (error) {
      this.logger.error(`Failed to load sound ${name}:`, error);
      throw error;
    }
  }

  /**
   * Load background music
   */
  async loadMusic(name, url) {
    try {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.loop = true;
      audio.volume =
        this.audioSettings.musicVolume * this.audioSettings.masterVolume;

      await new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', resolve);
        audio.addEventListener('error', reject);
      });

      this.music.set(name, audio);
      this.logger.debug(`Music loaded: ${name}`);
    } catch (error) {
      this.logger.error(`Failed to load music ${name}:`, error);
      throw error;
    }
  }

  /**
   * Play a sound effect
   */
  playSound(name, volume = 1.0) {
    if (!this.isInitialized) {
      this.logger.warn('AudioSystem not initialized, cannot play sound');
      return;
    }

    if (this.audioSettings.muteAll || this.audioSettings.muteSfx) {
      return;
    }

    const sound = this.sounds.get(name);
    if (!sound) {
      this.logger.warn(`Sound not found: ${name}`);
      return;
    }

    try {
      // Clone the audio to allow overlapping sounds
      const soundClone = sound.cloneNode();
      soundClone.volume = sound.volume * volume;
      soundClone.play();

      this.eventBus.emit('audio:soundPlayed', { name, volume });
      this.logger.debug(`Playing sound: ${name}`);
    } catch (error) {
      this.logger.error(`Failed to play sound ${name}:`, error);
    }
  }

  /**
   * Play background music
   */
  playMusic(name, fadeIn = true) {
    if (!this.isInitialized) {
      this.logger.warn('AudioSystem not initialized, cannot play music');
      return;
    }

    if (this.audioSettings.muteAll || this.audioSettings.muteMusic) {
      return;
    }

    const music = this.music.get(name);
    if (!music) {
      this.logger.warn(`Music not found: ${name}`);
      return;
    }

    try {
      // Stop current music if playing
      if (this.currentMusic && this.currentMusic !== music) {
        this.stopMusic();
      }

      this.currentMusic = music;

      if (fadeIn) {
        music.volume = 0;
        music.play();
        this.fadeIn(music);
      } else {
        music.play();
      }

      this.eventBus.emit('audio:musicStarted', { name });
      this.logger.debug(`Playing music: ${name}`);
    } catch (error) {
      this.logger.error(`Failed to play music ${name}:`, error);
    }
  }

  /**
   * Stop current music
   */
  stopMusic() {
    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic.currentTime = 0;
      this.eventBus.emit('audio:musicStopped');
      this.logger.debug('Music stopped');
    }
  }

  /**
   * Pause current music
   */
  pauseMusic() {
    if (this.currentMusic && !this.currentMusic.paused) {
      this.currentMusic.pause();
      this.eventBus.emit('audio:musicPaused');
      this.logger.debug('Music paused');
    }
  }

  /**
   * Resume current music
   */
  resumeMusic() {
    if (this.currentMusic && this.currentMusic.paused) {
      this.currentMusic.play();
      this.eventBus.emit('audio:musicResumed');
      this.logger.debug('Music resumed');
    }
  }

  /**
   * Fade in audio
   */
  fadeIn(audio, duration = 2000) {
    const startTime = Date.now();
    const startVolume = audio.volume;
    const targetVolume =
      this.audioSettings.musicVolume * this.audioSettings.masterVolume;

    const fade = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      audio.volume = startVolume + (targetVolume - startVolume) * progress;

      if (progress < 1) {
        requestAnimationFrame(fade);
      }
    };

    fade();
  }

  /**
   * Fade out audio
   */
  fadeOut(audio, duration = 2000) {
    const startTime = Date.now();
    const startVolume = audio.volume;

    const fade = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      audio.volume = startVolume * (1 - progress);

      if (progress < 1) {
        requestAnimationFrame(fade);
      } else {
        audio.pause();
        audio.currentTime = 0;
      }
    };

    fade();
  }

  /**
   * Set master volume
   */
  setMasterVolume(volume) {
    this.audioSettings.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
    this.eventBus.emit(
      'audio:masterVolumeChanged',
      this.audioSettings.masterVolume
    );
    this.logger.debug(
      `Master volume set to: ${this.audioSettings.masterVolume}`
    );
  }

  /**
   * Set music volume
   */
  setMusicVolume(volume) {
    this.audioSettings.musicVolume = Math.max(0, Math.min(1, volume));
    this.updateMusicVolumes();
    this.eventBus.emit(
      'audio:musicVolumeChanged',
      this.audioSettings.musicVolume
    );
    this.logger.debug(`Music volume set to: ${this.audioSettings.musicVolume}`);
  }

  /**
   * Set SFX volume
   */
  setSfxVolume(volume) {
    this.audioSettings.sfxVolume = Math.max(0, Math.min(1, volume));
    this.updateSfxVolumes();
    this.eventBus.emit('audio:sfxVolumeChanged', this.audioSettings.sfxVolume);
    this.logger.debug(`SFX volume set to: ${this.audioSettings.sfxVolume}`);
  }

  /**
   * Update all audio volumes
   */
  updateAllVolumes() {
    this.updateMusicVolumes();
    this.updateSfxVolumes();
  }

  /**
   * Update music volumes
   */
  updateMusicVolumes() {
    const volume =
      this.audioSettings.musicVolume * this.audioSettings.masterVolume;
    for (const music of this.music.values()) {
      music.volume = volume;
    }
  }

  /**
   * Update SFX volumes
   */
  updateSfxVolumes() {
    const volume =
      this.audioSettings.sfxVolume * this.audioSettings.masterVolume;
    for (const sound of this.sounds.values()) {
      sound.volume = volume;
    }
  }

  /**
   * Mute all audio
   */
  muteAll() {
    this.audioSettings.muteAll = true;
    this.updateAllVolumes();
    this.eventBus.emit('audio:muted', { type: 'all' });
    this.logger.debug('All audio muted');
  }

  /**
   * Unmute all audio
   */
  unmuteAll() {
    this.audioSettings.muteAll = false;
    this.updateAllVolumes();
    this.eventBus.emit('audio:unmuted', { type: 'all' });
    this.logger.debug('All audio unmuted');
  }

  /**
   * Mute music only
   */
  muteMusic() {
    this.audioSettings.muteMusic = true;
    this.updateMusicVolumes();
    this.eventBus.emit('audio:muted', { type: 'music' });
    this.logger.debug('Music muted');
  }

  /**
   * Unmute music only
   */
  unmuteMusic() {
    this.audioSettings.muteMusic = false;
    this.updateMusicVolumes();
    this.eventBus.emit('audio:unmuted', { type: 'music' });
    this.logger.debug('Music unmuted');
  }

  /**
   * Mute SFX only
   */
  muteSfx() {
    this.audioSettings.muteSfx = true;
    this.updateSfxVolumes();
    this.eventBus.emit('audio:muted', { type: 'sfx' });
    this.logger.debug('SFX muted');
  }

  /**
   * Unmute SFX only
   */
  unmuteSfx() {
    this.audioSettings.muteSfx = false;
    this.updateSfxVolumes();
    this.eventBus.emit('audio:unmuted', { type: 'sfx' });
    this.logger.debug('SFX unmuted');
  }

  /**
   * Get current audio settings
   */
  getAudioSettings() {
    return { ...this.audioSettings };
  }

  /**
   * Set audio settings
   */
  setAudioSettings(settings) {
    this.audioSettings = { ...this.audioSettings, ...settings };
    this.updateAllVolumes();
    this.eventBus.emit('audio:settingsChanged', this.audioSettings);
    this.logger.debug('Audio settings updated');
  }

  /**
   * Get list of loaded sounds
   */
  getLoadedSounds() {
    return Array.from(this.sounds.keys());
  }

  /**
   * Get list of loaded music
   */
  getLoadedMusic() {
    return Array.from(this.music.keys());
  }

  /**
   * Check if audio is playing
   */
  isPlaying(name, type = 'sound') {
    const audio =
      type === 'music' ? this.music.get(name) : this.sounds.get(name);
    return audio && !audio.paused;
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    // Stop all audio
    this.stopMusic();

    // Clean up audio context
    if (this.audioContext) {
      this.audioContext.close();
    }

    // Clear audio maps
    this.sounds.clear();
    this.music.clear();

    this.eventBus.emit('audio:cleanup');
    this.logger.info('AudioSystem cleaned up');
  }
}
