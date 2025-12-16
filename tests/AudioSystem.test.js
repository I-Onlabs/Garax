/**
 * AudioSystem Tests
 * TODO: Add comprehensive tests for AudioManager
 */

import { AudioManager } from '../src/AudioSystem/AudioManager.js';

// Mock AudioContext and Audio
global.AudioContext = jest.fn(() => ({
  close: jest.fn()
}));

global.Audio = jest.fn(() => ({
  play: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn(),
  cloneNode: jest.fn().mockReturnThis(),
  preload: 'auto',
  volume: 1,
  currentTime: 0
}));

describe('AudioManager', () => {
  let audioManager;
  let mockEventBus;
  let mockLogger;
  let mockConfig;

  beforeEach(() => {
    mockEventBus = {
      emit: jest.fn()
    };
    mockLogger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };
    mockConfig = {
      enableAudio: true
    };

    audioManager = new AudioManager({
      eventBus: mockEventBus,
      logger: mockLogger,
      config: mockConfig
    });
  });

  afterEach(() => {
    audioManager.cleanup();
  });

  test('should initialize with default values', () => {
    expect(audioManager.audioContext).toBeNull();
    expect(audioManager.sounds).toBeInstanceOf(Map);
    expect(audioManager.music).toBeInstanceOf(Map);
    expect(audioManager.audioPools).toBeInstanceOf(Map);
    expect(audioManager.volumeSettings).toEqual({
      master: 1.0,
      music: 0.8,
      sfx: 1.0,
      voice: 0.9
    });
  });

  test('should set volume for different types', () => {
    audioManager.setVolume('master', 0.5);
    audioManager.setVolume('music', 0.7);
    audioManager.setVolume('sfx', 0.9);
    
    expect(audioManager.getVolume('master')).toBe(0.5);
    expect(audioManager.getVolume('music')).toBe(0.7);
    expect(audioManager.getVolume('sfx')).toBe(0.9);
  });

  test('should clamp volume values between 0 and 1', () => {
    audioManager.setVolume('master', -0.5);
    audioManager.setVolume('music', 1.5);
    
    expect(audioManager.getVolume('master')).toBe(0);
    expect(audioManager.getVolume('music')).toBe(1);
  });

  test('should mute all audio', () => {
    audioManager.mute();
    expect(audioManager.volumeSettings.master).toBe(0);
  });

  test('should unmute all audio', () => {
    audioManager.mute();
    audioManager.unmute();
    expect(audioManager.volumeSettings.master).toBe(1);
  });

  test('should play sound effect', () => {
    // Mock sound in sounds map
    const mockSound = {
      play: jest.fn().mockResolvedValue(undefined),
      currentTime: 0,
      volume: 1
    };
    audioManager.sounds.set('jump', mockSound);
    
    audioManager.playSound('jump');
    
    expect(mockSound.play).toHaveBeenCalled();
    expect(mockSound.currentTime).toBe(0);
  });

  test('should play sound with options', () => {
    const mockSound = {
      play: jest.fn().mockResolvedValue(undefined),
      currentTime: 0,
      volume: 1,
      playbackRate: 1
    };
    audioManager.sounds.set('jump', mockSound);
    
    audioManager.playSound('jump', { volume: 0.5, pitch: 1.5 });
    
    expect(mockSound.volume).toBe(0.5);
    expect(mockSound.playbackRate).toBe(1.5);
  });

  test('should play background music', () => {
    const mockMusic = {
      play: jest.fn().mockResolvedValue(undefined),
      pause: jest.fn(),
      volume: 0.8,
      loop: true
    };
    audioManager.music.set('main_theme', mockMusic);
    
    audioManager.playMusic('main_theme');
    
    expect(mockMusic.play).toHaveBeenCalled();
  });

  test('should stop background music', () => {
    const mockMusic = {
      play: jest.fn().mockResolvedValue(undefined),
      pause: jest.fn(),
      currentTime: 0,
      volume: 0.8
    };
    audioManager.music.set('main_theme', mockMusic);
    
    // Start music first
    audioManager.playMusic('main_theme');
    audioManager.stopMusic();
    
    expect(mockMusic.pause).toHaveBeenCalled();
    expect(mockMusic.currentTime).toBe(0);
  });

  test('should handle unknown sound gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    audioManager.playSound('unknown_sound');
    
    expect(consoleSpy).toHaveBeenCalledWith('Sound not found: unknown_sound');
    consoleSpy.mockRestore();
  });

  test('should handle unknown music gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    audioManager.playMusic('unknown_music');
    
    expect(consoleSpy).toHaveBeenCalledWith('Music not found: unknown_music');
    consoleSpy.mockRestore();
  });

  test('should get sound from pool', () => {
    const mockSound = { play: jest.fn() };
    audioManager.audioPools.set('jump', [mockSound]);
    
    const sound = audioManager.getSoundFromPool('jump');
    expect(sound).toBe(mockSound);
  });

  test('should return null for empty pool', () => {
    audioManager.audioPools.set('jump', []);
    
    const sound = audioManager.getSoundFromPool('jump');
    expect(sound).toBeNull();
  });

  test('should return sound to pool', () => {
    const mockSound = { pause: jest.fn(), currentTime: 0 };
    audioManager.audioPools.set('jump', []);
    
    audioManager.returnSoundToPool('jump', mockSound);
    
    expect(audioManager.audioPools.get('jump')).toContain(mockSound);
    expect(mockSound.pause).toHaveBeenCalled();
    expect(mockSound.currentTime).toBe(0);
  });

  test('should not return sound to full pool', () => {
    const mockSound = { pause: jest.fn() };
    const fullPool = [1, 2, 3, 4, 5]; // Max size is 5
    audioManager.audioPools.set('jump', fullPool);
    
    audioManager.returnSoundToPool('jump', mockSound);
    
    expect(audioManager.audioPools.get('jump')).toHaveLength(5);
    expect(audioManager.audioPools.get('jump')).not.toContain(mockSound);
  });

  // TODO: Add more comprehensive tests
  // - Test audio context initialization
  // - Test audio asset loading
  // - Test fade in/out functionality
  // - Test 3D audio features
  // - Test spatial audio
  // - Test event emission
  // - Test cleanup functionality
});