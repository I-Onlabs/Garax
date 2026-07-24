/**
 * SoundSystem.js - Comprehensive Audio System
 *
 * This system handles:
 * - Background music and ambient sounds
 * - Sound effects for combat, UI, and environment
 * - Spatial audio with 3D positioning
 * - Audio mixing and volume control
 * - Audio streaming and caching
 * - Voice chat and communication
 */

export class SoundSystem {
  constructor(dependencies = {}) {
    // Dependency injection
    this.eventBus = dependencies.eventBus;
    this.logger = dependencies.logger;
    this.config = dependencies.config;

    // Validate required dependencies
    if (!this.eventBus) {
      throw new Error('SoundSystem requires eventBus dependency');
    }
    if (!this.logger) {
      throw new Error('SoundSystem requires logger dependency');
    }

    // Sound system state
    this.soundState = {
      audioContext: null,
      masterVolume: 1.0,
      musicVolume: 0.7,
      sfxVolume: 0.8,
      voiceVolume: 0.9,
      ambientVolume: 0.6,
      muted: false,
      currentMusic: null,
      activeSounds: new Map(),
      soundCache: new Map(),
      audioNodes: new Map(),
      spatialAudio: {
        enabled: true,
        listener: null,
        sources: new Map(),
      },
      voiceChat: {
        enabled: false,
        connected: false,
        participants: new Map(),
      },
    };

    // Sound system configuration
    this.soundConfig = {
      maxConcurrentSounds: 32,
      maxCacheSize: 50,
      audioFormats: ['mp3', 'ogg', 'wav', 'm4a'],
      spatialAudioDistance: 1000,
      reverbEnabled: true,
      compressionEnabled: true,
      streamingEnabled: true,
      voiceChatEnabled: false,
      audioQuality: 'high',
      sampleRate: 44100,
      bitDepth: 16,
      channels: 2,
    };

    // Initialize sound system
    this.initializeAudioContext();
    this.initializeSoundCategories();
    this.initializeAudioNodes();
    this.initializeSpatialAudio();
    this.initializeVoiceChat();

    // Event handlers
    this.setupEventHandlers();

    this.logger.info('SoundSystem initialized');
  }

  /**
   * Initialize the system
   */
  async initialize() {
    this.logger.info('Initializing SoundSystem...');

    // Initialize audio context
    await this.initializeAudioContext();

    // Load default sounds
    await this.loadDefaultSounds();

    // Set up audio nodes
    this.setupAudioNodes();

    // Initialize spatial audio
    this.setupSpatialAudio();

    this.logger.info('SoundSystem initialized successfully');
  }

  /**
   * Cleanup the system
   */
  cleanup() {
    this.logger.info('Cleaning up SoundSystem...');

    // Stop all sounds
    this.stopAllSounds();

    // Clear sound cache
    this.clearSoundCache();

    // Close audio context
    if (this.soundState.audioContext) {
      this.soundState.audioContext.close();
    }

    // Clear state
    this.soundState.activeSounds.clear();
    this.soundState.soundCache.clear();
    this.soundState.audioNodes.clear();
    this.soundState.spatialAudio.sources.clear();
    this.soundState.voiceChat.participants.clear();

    // Remove event listeners
    this.removeEventHandlers();

    this.logger.info('SoundSystem cleaned up');
  }

  /**
   * Update the system
   */
  update(deltaTime, gameState) {
    // Update active sounds
    this.updateActiveSounds(deltaTime);

    // Update spatial audio
    this.updateSpatialAudio(deltaTime);

    // Update voice chat
    this.updateVoiceChat(deltaTime);

    // Update audio nodes
    this.updateAudioNodes(deltaTime);
  }

  /**
   * Initialize audio context
   */
  async initializeAudioContext() {
    try {
      // Create audio context
      this.soundState.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)({
        sampleRate: this.soundConfig.sampleRate,
        latencyHint: 'interactive',
      });

      // Resume context if suspended
      if (this.soundState.audioContext.state === 'suspended') {
        await this.soundState.audioContext.resume();
      }

      this.logger.info('Audio context initialized');
    } catch (error) {
      this.logger.error('Failed to initialize audio context:', error);
      throw error;
    }
  }

  /**
   * Initialize sound categories
   */
  initializeSoundCategories() {
    this.soundCategories = {
      music: {
        name: 'Music',
        volume: 0.7,
        loop: true,
        priority: 1,
        fadeIn: 2000,
        fadeOut: 3000,
      },
      sfx: {
        name: 'Sound Effects',
        volume: 0.8,
        loop: false,
        priority: 2,
        fadeIn: 0,
        fadeOut: 0,
      },
      ambient: {
        name: 'Ambient',
        volume: 0.6,
        loop: true,
        priority: 3,
        fadeIn: 5000,
        fadeOut: 5000,
      },
      voice: {
        name: 'Voice',
        volume: 0.9,
        loop: false,
        priority: 4,
        fadeIn: 0,
        fadeOut: 0,
      },
      ui: {
        name: 'UI Sounds',
        volume: 0.7,
        loop: false,
        priority: 5,
        fadeIn: 0,
        fadeOut: 0,
      },
    };
  }

  /**
   * Initialize audio nodes
   */
  initializeAudioNodes() {
    const audioContext = this.soundState.audioContext;

    // Master gain node
    this.soundState.audioNodes.masterGain = audioContext.createGain();
    this.soundState.audioNodes.masterGain.connect(audioContext.destination);

    // Category gain nodes
    Object.keys(this.soundCategories).forEach((category) => {
      const gainNode = audioContext.createGain();
      gainNode.connect(this.soundState.audioNodes.masterGain);
      this.soundState.audioNodes[category] = gainNode;
    });

    // Reverb node
    if (this.soundConfig.reverbEnabled) {
      this.soundState.audioNodes.reverb = audioContext.createConvolver();
      this.soundState.audioNodes.reverb.connect(
        this.soundState.audioNodes.masterGain
      );
    }

    // Compressor node
    if (this.soundConfig.compressionEnabled) {
      this.soundState.audioNodes.compressor =
        audioContext.createDynamicsCompressor();
      this.soundState.audioNodes.compressor.connect(
        this.soundState.audioNodes.masterGain
      );
    }
  }

  /**
   * Initialize spatial audio
   */
  initializeSpatialAudio() {
    const audioContext = this.soundState.audioContext;

    // Create panner node for spatial audio
    this.soundState.spatialAudio.panner = audioContext.createPanner();
    this.soundState.spatialAudio.panner.panningModel = 'HRTF';
    this.soundState.spatialAudio.panner.distanceModel = 'exponential';
    this.soundState.spatialAudio.panner.maxDistance =
      this.soundConfig.spatialAudioDistance;
    this.soundState.spatialAudio.panner.rolloffFactor = 1;
    this.soundState.spatialAudio.panner.coneInnerAngle = 360;
    this.soundState.spatialAudio.panner.coneOuterAngle = 0;
    this.soundState.spatialAudio.panner.coneOuterGain = 0;

    // Create listener
    this.soundState.spatialAudio.listener = audioContext.listener;
  }

  /**
   * Initialize voice chat
   */
  initializeVoiceChat() {
    this.voiceChat = {
      enabled: this.soundConfig.voiceChatEnabled,
      connected: false,
      participants: new Map(),
      localStream: null,
      remoteStreams: new Map(),
      audioContext: null,
      mediaStreamSource: null,
      mediaStreamDestination: null,
    };
  }

  /**
   * Set up event handlers
   */
  setupEventHandlers() {
    // Sound events
    this.eventBus.on('sound:play', this.handlePlaySound.bind(this));
    this.eventBus.on('sound:stop', this.handleStopSound.bind(this));
    this.eventBus.on('sound:pause', this.handlePauseSound.bind(this));
    this.eventBus.on('sound:resume', this.handleResumeSound.bind(this));
    this.eventBus.on('sound:volume', this.handleVolumeChange.bind(this));

    // Music events
    this.eventBus.on('music:play', this.handlePlayMusic.bind(this));
    this.eventBus.on('music:stop', this.handleStopMusic.bind(this));
    this.eventBus.on('music:fade', this.handleFadeMusic.bind(this));

    // Spatial audio events
    this.eventBus.on('audio:position', this.handlePositionUpdate.bind(this));
    this.eventBus.on('audio:listener', this.handleListenerUpdate.bind(this));

    // Voice chat events
    this.eventBus.on('voice:join', this.handleVoiceJoin.bind(this));
    this.eventBus.on('voice:leave', this.handleVoiceLeave.bind(this));
    this.eventBus.on('voice:mute', this.handleVoiceMute.bind(this));
    this.eventBus.on('voice:unmute', this.handleVoiceUnmute.bind(this));
  }

  /**
   * Remove event handlers
   */
  removeEventHandlers() {
    this.eventBus.removeListener('sound:play', this.handlePlaySound.bind(this));
    this.eventBus.removeListener('sound:stop', this.handleStopSound.bind(this));
    this.eventBus.removeListener(
      'sound:pause',
      this.handlePauseSound.bind(this)
    );
    this.eventBus.removeListener(
      'sound:resume',
      this.handleResumeSound.bind(this)
    );
    this.eventBus.removeListener(
      'sound:volume',
      this.handleVolumeChange.bind(this)
    );
    this.eventBus.removeListener('music:play', this.handlePlayMusic.bind(this));
    this.eventBus.removeListener('music:stop', this.handleStopMusic.bind(this));
    this.eventBus.removeListener('music:fade', this.handleFadeMusic.bind(this));
    this.eventBus.removeListener(
      'audio:position',
      this.handlePositionUpdate.bind(this)
    );
    this.eventBus.removeListener(
      'audio:listener',
      this.handleListenerUpdate.bind(this)
    );
    this.eventBus.removeListener('voice:join', this.handleVoiceJoin.bind(this));
    this.eventBus.removeListener(
      'voice:leave',
      this.handleVoiceLeave.bind(this)
    );
    this.eventBus.removeListener('voice:mute', this.handleVoiceMute.bind(this));
    this.eventBus.removeListener(
      'voice:unmute',
      this.handleVoiceUnmute.bind(this)
    );
  }

  /**
   * Load default sounds
   */
  async loadDefaultSounds() {
    const defaultSounds = {
      // Music
      main_theme: { category: 'music', file: 'audio/music/main_theme.mp3' },
      combat_theme: { category: 'music', file: 'audio/music/combat_theme.mp3' },
      boss_theme: { category: 'music', file: 'audio/music/boss_theme.mp3' },
      victory_theme: {
        category: 'music',
        file: 'audio/music/victory_theme.mp3',
      },

      // Ambient
      forest_ambient: { category: 'ambient', file: 'audio/ambient/forest.mp3' },
      desert_ambient: { category: 'ambient', file: 'audio/ambient/desert.mp3' },
      mountain_ambient: {
        category: 'ambient',
        file: 'audio/ambient/mountain.mp3',
      },
      dungeon_ambient: {
        category: 'ambient',
        file: 'audio/ambient/dungeon.mp3',
      },

      // Combat SFX
      sword_hit: { category: 'sfx', file: 'audio/sfx/sword_hit.mp3' },
      bow_shoot: { category: 'sfx', file: 'audio/sfx/bow_shoot.mp3' },
      spell_cast: { category: 'sfx', file: 'audio/sfx/spell_cast.mp3' },
      explosion: { category: 'sfx', file: 'audio/sfx/explosion.mp3' },
      heal: { category: 'sfx', file: 'audio/sfx/heal.mp3' },
      critical_hit: { category: 'sfx', file: 'audio/sfx/critical_hit.mp3' },

      // UI SFX
      button_click: { category: 'ui', file: 'audio/sfx/button_click.mp3' },
      button_hover: { category: 'ui', file: 'audio/sfx/button_hover.mp3' },
      item_pickup: { category: 'ui', file: 'audio/sfx/item_pickup.mp3' },
      level_up: { category: 'ui', file: 'audio/sfx/level_up.mp3' },
      achievement: { category: 'ui', file: 'audio/sfx/achievement.mp3' },

      // Environmental SFX
      footstep_grass: { category: 'sfx', file: 'audio/sfx/footstep_grass.mp3' },
      footstep_stone: { category: 'sfx', file: 'audio/sfx/footstep_stone.mp3' },
      water_splash: { category: 'sfx', file: 'audio/sfx/water_splash.mp3' },
      wind: { category: 'sfx', file: 'audio/sfx/wind.mp3' },
      rain: { category: 'sfx', file: 'audio/sfx/rain.mp3' },
    };

    for (const [soundId, soundData] of Object.entries(defaultSounds)) {
      try {
        await this.loadSound(soundId, soundData.file, soundData.category);
      } catch (error) {
        this.logger.warn(`Failed to load sound ${soundId}:`, error);
      }
    }
  }

  /**
   * Load sound
   */
  async loadSound(soundId, filePath, category) {
    try {
      const audioBuffer = await this.fetchAudioBuffer(filePath);

      const sound = {
        id: soundId,
        filePath: filePath,
        category: category,
        buffer: audioBuffer,
        duration: audioBuffer.duration,
        loaded: true,
        loadTime: Date.now(),
      };

      this.soundState.soundCache.set(soundId, sound);

      this.logger.info(`Sound loaded: ${soundId}`);
      return sound;
    } catch (error) {
      this.logger.error(`Failed to load sound ${soundId}:`, error);
      throw error;
    }
  }

  /**
   * Fetch audio buffer
   */
  async fetchAudioBuffer(filePath) {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch audio file: ${filePath}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer =
      await this.soundState.audioContext.decodeAudioData(arrayBuffer);

    return audioBuffer;
  }

  /**
   * Play sound
   */
  playSound(soundId, options = {}) {
    const sound = this.soundState.soundCache.get(soundId);
    if (!sound) {
      this.logger.warn(`Sound not found: ${soundId}`);
      return null;
    }

    if (this.soundState.muted) {
      return null;
    }

    // Check concurrent sound limit
    if (
      this.soundState.activeSounds.size >= this.soundConfig.maxConcurrentSounds
    ) {
      this.logger.warn('Maximum concurrent sounds reached');
      return null;
    }

    const audioContext = this.soundState.audioContext;
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();

    // Configure source
    source.buffer = sound.buffer;
    source.loop = options.loop || this.soundCategories[sound.category].loop;

    // Configure gain
    const categoryVolume = this.soundCategories[sound.category].volume;
    const masterVolume = this.soundState.masterVolume;
    const soundVolume = options.volume || 1.0;

    gainNode.gain.value = categoryVolume * masterVolume * soundVolume;

    // Connect nodes
    source.connect(gainNode);

    // Apply spatial audio if enabled
    if (options.position && this.soundState.spatialAudio.enabled) {
      const panner = this.createPannerNode(options.position);
      gainNode.connect(panner);
      panner.connect(this.soundState.audioNodes[sound.category]);
    } else {
      gainNode.connect(this.soundState.audioNodes[sound.category]);
    }

    // Start playback
    source.start(0);

    // Create sound instance
    const soundInstance = {
      id: `sound_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      soundId: soundId,
      source: source,
      gainNode: gainNode,
      startTime: Date.now(),
      duration: sound.duration,
      volume: soundVolume,
      position: options.position || null,
      loop: source.loop,
      active: true,
    };

    this.soundState.activeSounds.set(soundInstance.id, soundInstance);

    // Handle end event
    source.onended = () => {
      this.soundState.activeSounds.delete(soundInstance.id);
    };

    return soundInstance;
  }

  /**
   * Stop sound
   */
  stopSound(soundInstanceId) {
    const soundInstance = this.soundState.activeSounds.get(soundInstanceId);
    if (!soundInstance) {
      return;
    }

    soundInstance.source.stop();
    soundInstance.active = false;
    this.soundState.activeSounds.delete(soundInstanceId);
  }

  /**
   * Pause sound
   */
  pauseSound(soundInstanceId) {
    const soundInstance = this.soundState.activeSounds.get(soundInstanceId);
    if (!soundInstance) {
      return;
    }

    soundInstance.gainNode.gain.value = 0;
    soundInstance.paused = true;
  }

  /**
   * Resume sound
   */
  resumeSound(soundInstanceId) {
    const soundInstance = this.soundState.activeSounds.get(soundInstanceId);
    if (!soundInstance) {
      return;
    }

    const categoryVolume = this.soundCategories[soundInstance.soundId].volume;
    const masterVolume = this.soundState.masterVolume;
    soundInstance.gainNode.gain.value =
      categoryVolume * masterVolume * soundInstance.volume;
    soundInstance.paused = false;
  }

  /**
   * Play music
   */
  playMusic(musicId, options = {}) {
    // Stop current music
    if (this.soundState.currentMusic) {
      this.stopMusic();
    }

    // Play new music
    const musicInstance = this.playSound(musicId, {
      ...options,
      category: 'music',
      loop: true,
    });

    if (musicInstance) {
      this.soundState.currentMusic = musicInstance;

      // Fade in
      if (this.soundCategories.music.fadeIn > 0) {
        this.fadeIn(musicInstance.id, this.soundCategories.music.fadeIn);
      }
    }

    return musicInstance;
  }

  /**
   * Stop music
   */
  stopMusic() {
    if (!this.soundState.currentMusic) {
      return;
    }

    // Fade out
    if (this.soundCategories.music.fadeOut > 0) {
      this.fadeOut(
        this.soundState.currentMusic.id,
        this.soundCategories.music.fadeOut
      );
    } else {
      this.stopSound(this.soundState.currentMusic.id);
    }

    this.soundState.currentMusic = null;
  }

  /**
   * Fade in
   */
  fadeIn(soundInstanceId, duration) {
    const soundInstance = this.soundState.activeSounds.get(soundInstanceId);
    if (!soundInstance) {
      return;
    }

    const gainNode = soundInstance.gainNode;
    const targetVolume = gainNode.gain.value;

    gainNode.gain.value = 0;
    gainNode.gain.linearRampToValueAtTime(
      targetVolume,
      this.soundState.audioContext.currentTime + duration / 1000
    );
  }

  /**
   * Fade out
   */
  fadeOut(soundInstanceId, duration) {
    const soundInstance = this.soundState.activeSounds.get(soundInstanceId);
    if (!soundInstance) {
      return;
    }

    const gainNode = soundInstance.gainNode;
    const currentVolume = gainNode.gain.value;

    gainNode.gain.linearRampToValueAtTime(
      0,
      this.soundState.audioContext.currentTime + duration / 1000
    );

    // Stop after fade out
    setTimeout(() => {
      this.stopSound(soundInstanceId);
    }, duration);
  }

  /**
   * Create panner node
   */
  createPannerNode(position) {
    const panner = this.soundState.audioContext.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'exponential';
    panner.maxDistance = this.soundConfig.spatialAudioDistance;
    panner.rolloffFactor = 1;

    panner.positionX.value = position.x;
    panner.positionY.value = position.y;
    panner.positionZ.value = position.z || 0;

    return panner;
  }

  /**
   * Update active sounds
   */
  updateActiveSounds(deltaTime) {
    const now = Date.now();

    for (const [id, soundInstance] of this.soundState.activeSounds) {
      // Check if sound has ended
      if (
        now - soundInstance.startTime > soundInstance.duration * 1000 &&
        !soundInstance.loop
      ) {
        this.soundState.activeSounds.delete(id);
      }
    }
  }

  /**
   * Update spatial audio
   */
  updateSpatialAudio(deltaTime) {
    if (!this.soundState.spatialAudio.enabled) {
      return;
    }

    // Update listener position
    if (this.soundState.spatialAudio.listener) {
      // Update listener position based on player position
      // This would be called from the game loop
    }

    // Update sound source positions
    for (const [id, soundInstance] of this.soundState.activeSounds) {
      if (soundInstance.position) {
        // Update sound position
        // This would be called when objects move
      }
    }
  }

  /**
   * Update voice chat
   */
  updateVoiceChat(deltaTime) {
    if (!this.voiceChat.enabled) {
      return;
    }

    // Update voice chat participants
    // This would handle voice chat updates
  }

  /**
   * Update audio nodes
   */
  updateAudioNodes(deltaTime) {
    // Update audio node parameters
    // This would handle dynamic audio processing
  }

  /**
   * Set master volume
   */
  setMasterVolume(volume) {
    this.soundState.masterVolume = Math.max(0, Math.min(1, volume));
    this.soundState.audioNodes.masterGain.gain.value =
      this.soundState.masterVolume;
  }

  /**
   * Set category volume
   */
  setCategoryVolume(category, volume) {
    if (this.soundCategories[category]) {
      this.soundCategories[category].volume = Math.max(0, Math.min(1, volume));
      this.soundState.audioNodes[category].gain.value =
        this.soundCategories[category].volume;
    }
  }

  /**
   * Mute all sounds
   */
  mute() {
    this.soundState.muted = true;
    this.soundState.audioNodes.masterGain.gain.value = 0;
  }

  /**
   * Unmute all sounds
   */
  unmute() {
    this.soundState.muted = false;
    this.soundState.audioNodes.masterGain.gain.value =
      this.soundState.masterVolume;
  }

  /**
   * Stop all sounds
   */
  stopAllSounds() {
    for (const [id, soundInstance] of this.soundState.activeSounds) {
      this.stopSound(id);
    }
  }

  /**
   * Clear sound cache
   */
  clearSoundCache() {
    this.soundState.soundCache.clear();
  }

  /**
   * Handle play sound
   */
  handlePlaySound(data) {
    const { soundId, options } = data;
    this.playSound(soundId, options);
  }

  /**
   * Handle stop sound
   */
  handleStopSound(data) {
    const { soundInstanceId } = data;
    this.stopSound(soundInstanceId);
  }

  /**
   * Handle pause sound
   */
  handlePauseSound(data) {
    const { soundInstanceId } = data;
    this.pauseSound(soundInstanceId);
  }

  /**
   * Handle resume sound
   */
  handleResumeSound(data) {
    const { soundInstanceId } = data;
    this.resumeSound(soundInstanceId);
  }

  /**
   * Handle volume change
   */
  handleVolumeChange(data) {
    const { category, volume } = data;

    if (category === 'master') {
      this.setMasterVolume(volume);
    } else {
      this.setCategoryVolume(category, volume);
    }
  }

  /**
   * Handle play music
   */
  handlePlayMusic(data) {
    const { musicId, options } = data;
    this.playMusic(musicId, options);
  }

  /**
   * Handle stop music
   */
  handleStopMusic(data) {
    this.stopMusic();
  }

  /**
   * Handle fade music
   */
  handleFadeMusic(data) {
    const { musicId, fadeIn, fadeOut } = data;

    if (fadeIn) {
      this.playMusic(musicId, { fadeIn: fadeIn });
    } else if (fadeOut) {
      this.fadeOut(this.soundState.currentMusic.id, fadeOut);
    }
  }

  /**
   * Handle position update
   */
  handlePositionUpdate(data) {
    const { soundInstanceId, position } = data;

    const soundInstance = this.soundState.activeSounds.get(soundInstanceId);
    if (soundInstance) {
      soundInstance.position = position;
      // Update panner node position
    }
  }

  /**
   * Handle listener update
   */
  handleListenerUpdate(data) {
    const { position, orientation } = data;

    if (this.soundState.spatialAudio.listener) {
      this.soundState.spatialAudio.listener.positionX.value = position.x;
      this.soundState.spatialAudio.listener.positionY.value = position.y;
      this.soundState.spatialAudio.listener.positionZ.value = position.z || 0;

      if (orientation) {
        this.soundState.spatialAudio.listener.forwardX.value =
          orientation.forward.x;
        this.soundState.spatialAudio.listener.forwardY.value =
          orientation.forward.y;
        this.soundState.spatialAudio.listener.forwardZ.value =
          orientation.forward.z;
        this.soundState.spatialAudio.listener.upX.value = orientation.up.x;
        this.soundState.spatialAudio.listener.upY.value = orientation.up.y;
        this.soundState.spatialAudio.listener.upZ.value = orientation.up.z;
      }
    }
  }

  /**
   * Handle voice join
   */
  handleVoiceJoin(data) {
    const { participantId, stream } = data;

    if (this.voiceChat.enabled) {
      this.voiceChat.participants.set(participantId, {
        id: participantId,
        stream: stream,
        muted: false,
        volume: 1.0,
      });
    }
  }

  /**
   * Handle voice leave
   */
  handleVoiceLeave(data) {
    const { participantId } = data;

    this.voiceChat.participants.delete(participantId);
  }

  /**
   * Handle voice mute
   */
  handleVoiceMute(data) {
    const { participantId } = data;

    const participant = this.voiceChat.participants.get(participantId);
    if (participant) {
      participant.muted = true;
    }
  }

  /**
   * Handle voice unmute
   */
  handleVoiceUnmute(data) {
    const { participantId } = data;

    const participant = this.voiceChat.participants.get(participantId);
    if (participant) {
      participant.muted = false;
    }
  }

  /**
   * Get sound state
   */
  getSoundState() {
    return { ...this.soundState };
  }

  /**
   * Get active sounds count
   */
  getActiveSoundsCount() {
    return this.soundState.activeSounds.size;
  }

  /**
   * Get sound cache size
   */
  getSoundCacheSize() {
    return this.soundState.soundCache.size;
  }

  /**
   * Get current music
   */
  getCurrentMusic() {
    return this.soundState.currentMusic;
  }

  /**
   * Is sound loaded
   */
  isSoundLoaded(soundId) {
    const sound = this.soundState.soundCache.get(soundId);
    return sound && sound.loaded;
  }

  /**
   * Get sound duration
   */
  getSoundDuration(soundId) {
    const sound = this.soundState.soundCache.get(soundId);
    return sound ? sound.duration : 0;
  }

  /**
   * Enable spatial audio
   */
  enableSpatialAudio() {
    this.soundState.spatialAudio.enabled = true;
  }

  /**
   * Disable spatial audio
   */
  disableSpatialAudio() {
    this.soundState.spatialAudio.enabled = false;
  }

  /**
   * Enable voice chat
   */
  enableVoiceChat() {
    this.voiceChat.enabled = true;
  }

  /**
   * Disable voice chat
   */
  disableVoiceChat() {
    this.voiceChat.enabled = false;
  }

  /**
   * Set audio quality
   */
  setAudioQuality(quality) {
    this.soundConfig.audioQuality = quality;

    switch (quality) {
      case 'low':
        this.soundConfig.sampleRate = 22050;
        this.soundConfig.bitDepth = 8;
        break;
      case 'medium':
        this.soundConfig.sampleRate = 44100;
        this.soundConfig.bitDepth = 16;
        break;
      case 'high':
        this.soundConfig.sampleRate = 48000;
        this.soundConfig.bitDepth = 24;
        break;
    }
  }
}

export default SoundSystem;
