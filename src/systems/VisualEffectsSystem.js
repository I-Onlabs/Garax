/**
 * VisualEffectsSystem.js - Visual Effects and Animation System
 *
 * This system handles:
 * - Combat effects (spells, explosions, impacts)
 * - Environmental effects (weather, particles, lighting)
 * - UI animations and transitions
 * - Character animations and movement
 * - Particle systems and shaders
 * - Screen effects and post-processing
 */

export class VisualEffectsSystem {
  constructor(dependencies = {}) {
    // Dependency injection
    this.eventBus = dependencies.eventBus;
    this.logger = dependencies.logger;
    this.config = dependencies.config;

    // Validate required dependencies
    if (!this.eventBus) {
      throw new Error('VisualEffectsSystem requires eventBus dependency');
    }
    if (!this.logger) {
      throw new Error('VisualEffectsSystem requires logger dependency');
    }

    // Visual effects state
    this.effectsState = {
      activeEffects: new Map(),
      particleSystems: new Map(),
      animations: new Map(),
      shaders: new Map(),
      lighting: new Map(),
      weather: null,
      screenEffects: new Map(),
      uiAnimations: new Map(),
      performanceLevel: 'high',
      effectsEnabled: true,
      particlesEnabled: true,
      lightingEnabled: true,
      shadowsEnabled: true,
    };

    // Visual effects configuration
    this.effectsConfig = {
      maxActiveEffects: 100,
      maxParticles: 1000,
      maxAnimations: 50,
      effectLifetime: 5000,
      particleLifetime: 3000,
      animationSpeed: 1.0,
      lightingQuality: 'high',
      shadowQuality: 'high',
      weatherIntensity: 0.5,
      screenShakeIntensity: 1.0,
      performanceLevels: {
        low: { maxParticles: 100, effects: false, shadows: false },
        medium: { maxParticles: 500, effects: true, shadows: false },
        high: { maxParticles: 1000, effects: true, shadows: true },
      },
    };

    // Initialize visual effects
    this.initializeEffectTypes();
    this.initializeParticleSystems();
    this.initializeAnimations();
    this.initializeShaders();
    this.initializeLighting();
    this.initializeWeather();

    // Event handlers
    this.setupEventHandlers();

    this.logger.info('VisualEffectsSystem initialized');
  }

  /**
   * Initialize the system
   */
  async initialize() {
    this.logger.info('Initializing VisualEffectsSystem...');

    // Set up canvas and rendering context
    this.setupRenderingContext();

    // Initialize particle systems
    this.initializeParticleSystems();

    // Set up lighting system
    this.setupLightingSystem();

    // Initialize weather effects
    this.initializeWeatherEffects();

    this.logger.info('VisualEffectsSystem initialized successfully');
  }

  /**
   * Cleanup the system
   */
  cleanup() {
    this.logger.info('Cleaning up VisualEffectsSystem...');

    // Clear all effects
    this.clearAllEffects();

    // Clear particle systems
    this.clearParticleSystems();

    // Clear animations
    this.clearAnimations();

    // Clear shaders
    this.clearShaders();

    // Clear state
    this.effectsState.activeEffects.clear();
    this.effectsState.particleSystems.clear();
    this.effectsState.animations.clear();
    this.effectsState.shaders.clear();
    this.effectsState.lighting.clear();
    this.effectsState.screenEffects.clear();
    this.effectsState.uiAnimations.clear();

    // Remove event listeners
    this.removeEventHandlers();

    this.logger.info('VisualEffectsSystem cleaned up');
  }

  /**
   * Update the system
   */
  update(deltaTime, gameState) {
    // Update active effects
    this.updateActiveEffects(deltaTime);

    // Update particle systems
    this.updateParticleSystems(deltaTime);

    // Update animations
    this.updateAnimations(deltaTime);

    // Update lighting
    this.updateLighting(deltaTime);

    // Update weather
    this.updateWeather(deltaTime);

    // Update screen effects
    this.updateScreenEffects(deltaTime);

    // Update UI animations
    this.updateUIAnimations(deltaTime);
  }

  /**
   * Initialize effect types
   */
  initializeEffectTypes() {
    this.effectTypes = {
      // Combat effects
      EXPLOSION: 'explosion',
      FIREBALL: 'fireball',
      LIGHTNING: 'lightning',
      ICE_SHARD: 'ice_shard',
      POISON_CLOUD: 'poison_cloud',
      HEALING_AURA: 'healing_aura',
      SHIELD_BARRIER: 'shield_barrier',
      TELEPORT: 'teleport',

      // Environmental effects
      RAIN: 'rain',
      SNOW: 'snow',
      FOG: 'fog',
      DUST_STORM: 'dust_storm',
      LAVA_FLOW: 'lava_flow',
      WATER_SPLASH: 'water_splash',
      LEAF_FALL: 'leaf_fall',
      SPARKLE: 'sparkle',

      // UI effects
      FADE_IN: 'fade_in',
      FADE_OUT: 'fade_out',
      SLIDE_IN: 'slide_in',
      SLIDE_OUT: 'slide_out',
      SCALE_UP: 'scale_up',
      SCALE_DOWN: 'scale_down',
      ROTATE: 'rotate',
      PULSE: 'pulse',

      // Screen effects
      SCREEN_SHAKE: 'screen_shake',
      FLASH: 'flash',
      BLUR: 'blur',
      CHROMATIC_ABERRATION: 'chromatic_aberration',
      VIGNETTE: 'vignette',
      BLOOM: 'bloom',
    };
  }

  /**
   * Initialize particle systems
   */
  initializeParticleSystems() {
    this.particleSystems = {
      fire: {
        name: 'Fire',
        particleCount: 50,
        lifetime: 2000,
        color: '#ff4500',
        size: { min: 2, max: 8 },
        velocity: { x: 0, y: -50, variance: 20 },
        gravity: 0.1,
        fade: true,
        texture: 'fire_particle',
      },
      smoke: {
        name: 'Smoke',
        particleCount: 30,
        lifetime: 3000,
        color: '#808080',
        size: { min: 4, max: 12 },
        velocity: { x: 0, y: -30, variance: 15 },
        gravity: -0.05,
        fade: true,
        texture: 'smoke_particle',
      },
      sparkle: {
        name: 'Sparkle',
        particleCount: 20,
        lifetime: 1500,
        color: '#ffff00',
        size: { min: 1, max: 4 },
        velocity: { x: 0, y: 0, variance: 30 },
        gravity: 0,
        fade: true,
        texture: 'sparkle_particle',
      },
      blood: {
        name: 'Blood',
        particleCount: 15,
        lifetime: 1000,
        color: '#8b0000',
        size: { min: 3, max: 6 },
        velocity: { x: 0, y: 0, variance: 40 },
        gravity: 0.2,
        fade: true,
        texture: 'blood_particle',
      },
      magic: {
        name: 'Magic',
        particleCount: 25,
        lifetime: 2500,
        color: '#9370db',
        size: { min: 2, max: 6 },
        velocity: { x: 0, y: 0, variance: 25 },
        gravity: 0,
        fade: true,
        texture: 'magic_particle',
      },
    };
  }

  /**
   * Initialize animations
   */
  initializeAnimations() {
    this.animations = {
      // Character animations
      idle: {
        name: 'Idle',
        duration: 2000,
        frames: 4,
        loop: true,
        easing: 'linear',
      },
      walk: {
        name: 'Walk',
        duration: 1000,
        frames: 8,
        loop: true,
        easing: 'linear',
      },
      run: {
        name: 'Run',
        duration: 800,
        frames: 8,
        loop: true,
        easing: 'linear',
      },
      attack: {
        name: 'Attack',
        duration: 500,
        frames: 6,
        loop: false,
        easing: 'ease-out',
      },
      cast: {
        name: 'Cast',
        duration: 800,
        frames: 10,
        loop: false,
        easing: 'ease-in-out',
      },
      death: {
        name: 'Death',
        duration: 1500,
        frames: 12,
        loop: false,
        easing: 'ease-in',
      },

      // UI animations
      buttonHover: {
        name: 'Button Hover',
        duration: 200,
        properties: { scale: 1.1, opacity: 0.8 },
        easing: 'ease-out',
      },
      buttonClick: {
        name: 'Button Click',
        duration: 100,
        properties: { scale: 0.95 },
        easing: 'ease-in-out',
      },
      panelSlide: {
        name: 'Panel Slide',
        duration: 300,
        properties: { x: 0, y: 0 },
        easing: 'ease-out',
      },
      fadeIn: {
        name: 'Fade In',
        duration: 500,
        properties: { opacity: 1 },
        easing: 'ease-in',
      },
      fadeOut: {
        name: 'Fade Out',
        duration: 300,
        properties: { opacity: 0 },
        easing: 'ease-out',
      },
    };
  }

  /**
   * Initialize shaders
   */
  initializeShaders() {
    this.shaders = {
      // Basic shaders
      basic: {
        vertex: `
          attribute vec2 a_position;
          attribute vec2 a_texCoord;
          uniform vec2 u_resolution;
          varying vec2 v_texCoord;
          
          void main() {
            vec2 clipSpace = ((a_position / u_resolution) * 2.0) - 1.0;
            gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
            v_texCoord = a_texCoord;
          }
        `,
        fragment: `
          precision mediump float;
          uniform sampler2D u_texture;
          uniform vec4 u_color;
          varying vec2 v_texCoord;
          
          void main() {
            gl_FragColor = texture2D(u_texture, v_texCoord) * u_color;
          }
        `,
      },

      // Particle shader
      particle: {
        vertex: `
          attribute vec2 a_position;
          attribute float a_size;
          attribute float a_alpha;
          uniform vec2 u_resolution;
          varying float v_alpha;
          
          void main() {
            vec2 clipSpace = ((a_position / u_resolution) * 2.0) - 1.0;
            gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
            gl_PointSize = a_size;
            v_alpha = a_alpha;
          }
        `,
        fragment: `
          precision mediump float;
          uniform vec4 u_color;
          varying float v_alpha;
          
          void main() {
            gl_FragColor = u_color * v_alpha;
          }
        `,
      },

      // Post-processing shaders
      blur: {
        vertex: `
          attribute vec2 a_position;
          attribute vec2 a_texCoord;
          uniform vec2 u_resolution;
          varying vec2 v_texCoord;
          
          void main() {
            vec2 clipSpace = ((a_position / u_resolution) * 2.0) - 1.0;
            gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
            v_texCoord = a_texCoord;
          }
        `,
        fragment: `
          precision mediump float;
          uniform sampler2D u_texture;
          uniform vec2 u_resolution;
          uniform float u_blur;
          varying vec2 v_texCoord;
          
          void main() {
            vec4 color = vec4(0.0);
            float total = 0.0;
            
            for (float x = -u_blur; x <= u_blur; x += 1.0) {
              for (float y = -u_blur; y <= u_blur; y += 1.0) {
                vec2 offset = vec2(x, y) / u_resolution;
                color += texture2D(u_texture, v_texCoord + offset);
                total += 1.0;
              }
            }
            
            gl_FragColor = color / total;
          }
        `,
      },

      // Screen effects
      screenShake: {
        vertex: `
          attribute vec2 a_position;
          attribute vec2 a_texCoord;
          uniform vec2 u_resolution;
          uniform vec2 u_shake;
          varying vec2 v_texCoord;
          
          void main() {
            vec2 clipSpace = ((a_position / u_resolution) * 2.0) - 1.0;
            gl_Position = vec4((clipSpace + u_shake) * vec2(1, -1), 0, 1);
            v_texCoord = a_texCoord;
          }
        `,
        fragment: `
          precision mediump float;
          uniform sampler2D u_texture;
          varying vec2 v_texCoord;
          
          void main() {
            gl_FragColor = texture2D(u_texture, v_texCoord);
          }
        `,
      },
    };
  }

  /**
   * Initialize lighting
   */
  initializeLighting() {
    this.lighting = {
      ambient: {
        color: '#404040',
        intensity: 0.3,
      },
      directional: {
        color: '#ffffff',
        intensity: 0.7,
        direction: { x: 0.5, y: -0.5, z: 0.5 },
      },
      pointLights: new Map(),
      spotLights: new Map(),
      shadows: {
        enabled: true,
        resolution: 1024,
        bias: 0.001,
        samples: 16,
      },
    };
  }

  /**
   * Initialize weather
   */
  initializeWeather() {
    this.weather = {
      type: 'none',
      intensity: 0.0,
      duration: 0,
      startTime: 0,
      effects: new Map(),
      particles: new Map(),
    };
  }

  /**
   * Set up event handlers
   */
  setupEventHandlers() {
    // Combat effects
    this.eventBus.on('combat:spellCast', this.handleSpellCast.bind(this));
    this.eventBus.on('combat:damageDealt', this.handleDamageDealt.bind(this));
    this.eventBus.on('combat:healing', this.handleHealing.bind(this));
    this.eventBus.on('combat:explosion', this.handleExplosion.bind(this));

    // Environmental effects
    this.eventBus.on(
      'environment:weatherChange',
      this.handleWeatherChange.bind(this)
    );
    this.eventBus.on('environment:areaEnter', this.handleAreaEnter.bind(this));

    // UI effects
    this.eventBus.on('ui:elementShow', this.handleElementShow.bind(this));
    this.eventBus.on('ui:elementHide', this.handleElementHide.bind(this));
    this.eventBus.on('ui:buttonClick', this.handleButtonClick.bind(this));

    // Screen effects
    this.eventBus.on('screen:shake', this.handleScreenShake.bind(this));
    this.eventBus.on('screen:flash', this.handleScreenFlash.bind(this));
    this.eventBus.on('screen:blur', this.handleScreenBlur.bind(this));
  }

  /**
   * Remove event handlers
   */
  removeEventHandlers() {
    this.eventBus.removeListener(
      'combat:spellCast',
      this.handleSpellCast.bind(this)
    );
    this.eventBus.removeListener(
      'combat:damageDealt',
      this.handleDamageDealt.bind(this)
    );
    this.eventBus.removeListener(
      'combat:healing',
      this.handleHealing.bind(this)
    );
    this.eventBus.removeListener(
      'combat:explosion',
      this.handleExplosion.bind(this)
    );
    this.eventBus.removeListener(
      'environment:weatherChange',
      this.handleWeatherChange.bind(this)
    );
    this.eventBus.removeListener(
      'environment:areaEnter',
      this.handleAreaEnter.bind(this)
    );
    this.eventBus.removeListener(
      'ui:elementShow',
      this.handleElementShow.bind(this)
    );
    this.eventBus.removeListener(
      'ui:elementHide',
      this.handleElementHide.bind(this)
    );
    this.eventBus.removeListener(
      'ui:buttonClick',
      this.handleButtonClick.bind(this)
    );
    this.eventBus.removeListener(
      'screen:shake',
      this.handleScreenShake.bind(this)
    );
    this.eventBus.removeListener(
      'screen:flash',
      this.handleScreenFlash.bind(this)
    );
    this.eventBus.removeListener(
      'screen:blur',
      this.handleScreenBlur.bind(this)
    );
  }

  /**
   * Set up rendering context
   */
  setupRenderingContext() {
    // Create canvas for effects
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'effects-canvas';
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1000;
    `;
    document.body.appendChild(this.canvas);

    // Get rendering context
    this.ctx = this.canvas.getContext('2d');
    this.gl =
      this.canvas.getContext('webgl') ||
      this.canvas.getContext('experimental-webgl');

    // Set canvas size
    this.resizeCanvas();
    window.addEventListener('resize', this.resizeCanvas.bind(this));
  }

  /**
   * Resize canvas
   */
  resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  /**
   * Create effect
   */
  createEffect(type, position, options = {}) {
    if (!this.effectsState.effectsEnabled) {
      return null;
    }

    const effect = {
      id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type,
      position: position,
      options: options,
      startTime: Date.now(),
      duration: options.duration || this.effectsConfig.effectLifetime,
      active: true,
    };

    this.effectsState.activeEffects.set(effect.id, effect);

    // Create effect-specific implementation
    this.implementEffect(effect);

    return effect;
  }

  /**
   * Implement effect
   */
  implementEffect(effect) {
    switch (effect.type) {
      case this.effectTypes.EXPLOSION:
        this.createExplosionEffect(effect);
        break;
      case this.effectTypes.FIREBALL:
        this.createFireballEffect(effect);
        break;
      case this.effectTypes.LIGHTNING:
        this.createLightningEffect(effect);
        break;
      case this.effectTypes.ICE_SHARD:
        this.createIceShardEffect(effect);
        break;
      case this.effectTypes.POISON_CLOUD:
        this.createPoisonCloudEffect(effect);
        break;
      case this.effectTypes.HEALING_AURA:
        this.createHealingAuraEffect(effect);
        break;
      case this.effectTypes.SHIELD_BARRIER:
        this.createShieldBarrierEffect(effect);
        break;
      case this.effectTypes.TELEPORT:
        this.createTeleportEffect(effect);
        break;
      default:
        this.logger.warn(`Unknown effect type: ${effect.type}`);
    }
  }

  /**
   * Create explosion effect
   */
  createExplosionEffect(effect) {
    // Create particle system
    this.createParticleSystem('fire', effect.position, {
      particleCount: 30,
      lifetime: 1000,
      spread: 360,
      speed: 100,
    });

    // Create smoke particles
    this.createParticleSystem('smoke', effect.position, {
      particleCount: 20,
      lifetime: 2000,
      spread: 360,
      speed: 50,
    });

    // Screen shake
    this.createScreenEffect('screen_shake', {
      intensity: 0.5,
      duration: 300,
    });
  }

  /**
   * Create fireball effect
   */
  createFireballEffect(effect) {
    // Create fire particles
    this.createParticleSystem('fire', effect.position, {
      particleCount: 15,
      lifetime: 800,
      spread: 180,
      speed: 80,
    });

    // Create sparkle particles
    this.createParticleSystem('sparkle', effect.position, {
      particleCount: 10,
      lifetime: 600,
      spread: 360,
      speed: 30,
    });
  }

  /**
   * Create lightning effect
   */
  createLightningEffect(effect) {
    // Create lightning bolt
    this.createLightningBolt(effect.position, effect.options.target);

    // Create sparkle particles
    this.createParticleSystem('sparkle', effect.position, {
      particleCount: 20,
      lifetime: 500,
      spread: 360,
      speed: 40,
    });
  }

  /**
   * Create ice shard effect
   */
  createIceShardEffect(effect) {
    // Create ice particles
    this.createParticleSystem('ice', effect.position, {
      particleCount: 12,
      lifetime: 1200,
      spread: 180,
      speed: 60,
    });
  }

  /**
   * Create poison cloud effect
   */
  createPoisonCloudEffect(effect) {
    // Create poison particles
    this.createParticleSystem('poison', effect.position, {
      particleCount: 25,
      lifetime: 3000,
      spread: 360,
      speed: 20,
    });
  }

  /**
   * Create healing aura effect
   */
  createHealingAuraEffect(effect) {
    // Create healing particles
    this.createParticleSystem('healing', effect.position, {
      particleCount: 20,
      lifetime: 1500,
      spread: 360,
      speed: 30,
    });
  }

  /**
   * Create shield barrier effect
   */
  createShieldBarrierEffect(effect) {
    // Create shield particles
    this.createParticleSystem('shield', effect.position, {
      particleCount: 15,
      lifetime: 2000,
      spread: 360,
      speed: 10,
    });
  }

  /**
   * Create teleport effect
   */
  createTeleportEffect(effect) {
    // Create teleport particles
    this.createParticleSystem('teleport', effect.position, {
      particleCount: 30,
      lifetime: 1000,
      spread: 360,
      speed: 50,
    });
  }

  /**
   * Create particle system
   */
  createParticleSystem(type, position, options = {}) {
    if (!this.effectsState.particlesEnabled) {
      return null;
    }

    const system = this.particleSystems[type];
    if (!system) {
      this.logger.warn(`Unknown particle system type: ${type}`);
      return null;
    }

    const particleSystem = {
      id: `particles_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type,
      position: position,
      particles: [],
      startTime: Date.now(),
      duration: options.lifetime || system.lifetime,
      active: true,
      config: { ...system, ...options },
    };

    // Create particles
    for (let i = 0; i < particleSystem.config.particleCount; i++) {
      const particle = this.createParticle(particleSystem);
      particleSystem.particles.push(particle);
    }

    this.effectsState.particleSystems.set(particleSystem.id, particleSystem);

    return particleSystem;
  }

  /**
   * Create particle
   */
  createParticle(system) {
    const config = system.config;
    const angle = (config.spread / 360) * Math.PI * 2 * Math.random();
    const speed = config.velocity.variance * Math.random() + config.velocity.y;

    return {
      position: { ...system.position },
      velocity: {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
      },
      size:
        config.size.min + Math.random() * (config.size.max - config.size.min),
      color: config.color,
      alpha: 1.0,
      lifetime: config.lifetime,
      age: 0,
    };
  }

  /**
   * Create screen effect
   */
  createScreenEffect(type, options = {}) {
    const effect = {
      id: `screen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type,
      options: options,
      startTime: Date.now(),
      duration: options.duration || 1000,
      active: true,
    };

    this.effectsState.screenEffects.set(effect.id, effect);

    return effect;
  }

  /**
   * Create animation
   */
  createAnimation(target, animationType, options = {}) {
    const animation = this.animations[animationType];
    if (!animation) {
      this.logger.warn(`Unknown animation type: ${animationType}`);
      return null;
    }

    const anim = {
      id: `anim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      target: target,
      type: animationType,
      config: animation,
      options: options,
      startTime: Date.now(),
      duration: options.duration || animation.duration,
      active: true,
      progress: 0,
    };

    this.effectsState.animations.set(anim.id, anim);

    return anim;
  }

  /**
   * Update active effects
   */
  updateActiveEffects(deltaTime) {
    const now = Date.now();

    for (const [id, effect] of this.effectsState.activeEffects) {
      if (now - effect.startTime > effect.duration) {
        effect.active = false;
        this.effectsState.activeEffects.delete(id);
      }
    }
  }

  /**
   * Update particle systems
   */
  updateParticleSystems(deltaTime) {
    const now = Date.now();

    for (const [id, system] of this.effectsState.particleSystems) {
      if (now - system.startTime > system.duration) {
        system.active = false;
        this.effectsState.particleSystems.delete(id);
        continue;
      }

      // Update particles
      system.particles.forEach((particle) => {
        this.updateParticle(particle, deltaTime, system.config);
      });

      // Remove dead particles
      system.particles = system.particles.filter(
        (particle) => particle.age < particle.lifetime
      );
    }
  }

  /**
   * Update particle
   */
  updateParticle(particle, deltaTime, config) {
    particle.age += deltaTime;
    particle.alpha = 1 - particle.age / particle.lifetime;

    // Update position
    particle.position.x += (particle.velocity.x * deltaTime) / 1000;
    particle.position.y += (particle.velocity.y * deltaTime) / 1000;

    // Apply gravity
    particle.velocity.y += (config.gravity * deltaTime) / 1000;
  }

  /**
   * Update animations
   */
  updateAnimations(deltaTime) {
    const now = Date.now();

    for (const [id, animation] of this.effectsState.animations) {
      if (now - animation.startTime > animation.duration) {
        animation.active = false;
        this.effectsState.animations.delete(id);
        continue;
      }

      // Update animation progress
      animation.progress = (now - animation.startTime) / animation.duration;

      // Apply animation to target
      this.applyAnimation(animation);
    }
  }

  /**
   * Apply animation
   */
  applyAnimation(animation) {
    const target = animation.target;
    const progress = animation.progress;
    const config = animation.config;

    if (config.properties) {
      // Apply property animations
      Object.entries(config.properties).forEach(([property, value]) => {
        if (typeof value === 'number') {
          target.style[property] = value * progress;
        }
      });
    }

    if (config.frames) {
      // Apply frame-based animations
      const frameIndex = Math.floor(progress * config.frames);
      target.style.backgroundPosition = `-${frameIndex * 32}px 0`;
    }
  }

  /**
   * Update lighting
   */
  updateLighting(deltaTime) {
    // Update point lights
    for (const [id, light] of this.effectsState.lighting) {
      if (light.type === 'point') {
        this.updatePointLight(light, deltaTime);
      }
    }
  }

  /**
   * Update weather
   */
  updateWeather(deltaTime) {
    if (!this.weather.type || this.weather.type === 'none') {
      return;
    }

    const now = Date.now();
    if (now - this.weather.startTime > this.weather.duration) {
      this.stopWeather();
    }
  }

  /**
   * Update screen effects
   */
  updateScreenEffects(deltaTime) {
    const now = Date.now();

    for (const [id, effect] of this.effectsState.screenEffects) {
      if (now - effect.startTime > effect.duration) {
        effect.active = false;
        this.effectsState.screenEffects.delete(id);
        continue;
      }

      // Apply screen effect
      this.applyScreenEffect(effect);
    }
  }

  /**
   * Update UI animations
   */
  updateUIAnimations(deltaTime) {
    const now = Date.now();

    for (const [id, animation] of this.effectsState.uiAnimations) {
      if (now - animation.startTime > animation.duration) {
        animation.active = false;
        this.effectsState.uiAnimations.delete(id);
        continue;
      }

      // Apply UI animation
      this.applyUIAnimation(animation);
    }
  }

  /**
   * Render effects
   */
  render() {
    if (!this.ctx) return;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Render particle systems
    this.renderParticleSystems();

    // Render active effects
    this.renderActiveEffects();

    // Render screen effects
    this.renderScreenEffects();
  }

  /**
   * Render particle systems
   */
  renderParticleSystems() {
    for (const [id, system] of this.effectsState.particleSystems) {
      if (!system.active) continue;

      system.particles.forEach((particle) => {
        this.renderParticle(particle);
      });
    }
  }

  /**
   * Render particle
   */
  renderParticle(particle) {
    this.ctx.save();
    this.ctx.globalAlpha = particle.alpha;
    this.ctx.fillStyle = particle.color;
    this.ctx.beginPath();
    this.ctx.arc(
      particle.position.x,
      particle.position.y,
      particle.size,
      0,
      Math.PI * 2
    );
    this.ctx.fill();
    this.ctx.restore();
  }

  /**
   * Render active effects
   */
  renderActiveEffects() {
    for (const [id, effect] of this.effectsState.activeEffects) {
      if (!effect.active) continue;

      this.renderEffect(effect);
    }
  }

  /**
   * Render effect
   */
  renderEffect(effect) {
    // Effect-specific rendering
    switch (effect.type) {
      case this.effectTypes.EXPLOSION:
        this.renderExplosion(effect);
        break;
      case this.effectTypes.FIREBALL:
        this.renderFireball(effect);
        break;
      case this.effectTypes.LIGHTNING:
        this.renderLightning(effect);
        break;
      // Add more effect rendering methods
    }
  }

  /**
   * Render explosion
   */
  renderExplosion(effect) {
    const age = Date.now() - effect.startTime;
    const progress = age / effect.duration;
    const size = 50 * (1 - progress);

    this.ctx.save();
    this.ctx.globalAlpha = 1 - progress;
    this.ctx.fillStyle = '#ff4500';
    this.ctx.beginPath();
    this.ctx.arc(effect.position.x, effect.position.y, size, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  /**
   * Render fireball
   */
  renderFireball(effect) {
    const age = Date.now() - effect.startTime;
    const progress = age / effect.duration;
    const size = 20 * (1 - progress);

    this.ctx.save();
    this.ctx.globalAlpha = 1 - progress;
    this.ctx.fillStyle = '#ff4500';
    this.ctx.beginPath();
    this.ctx.arc(effect.position.x, effect.position.y, size, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  /**
   * Render lightning
   */
  renderLightning(effect) {
    this.ctx.save();
    this.ctx.strokeStyle = '#ffff00';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(effect.position.x, effect.position.y);
    this.ctx.lineTo(effect.options.target.x, effect.options.target.y);
    this.ctx.stroke();
    this.ctx.restore();
  }

  /**
   * Render screen effects
   */
  renderScreenEffects() {
    for (const [id, effect] of this.effectsState.screenEffects) {
      if (!effect.active) continue;

      this.renderScreenEffect(effect);
    }
  }

  /**
   * Render screen effect
   */
  renderScreenEffect(effect) {
    switch (effect.type) {
      case 'screen_shake':
        this.renderScreenShake(effect);
        break;
      case 'flash':
        this.renderFlash(effect);
        break;
      case 'blur':
        this.renderBlur(effect);
        break;
    }
  }

  /**
   * Render screen shake
   */
  renderScreenShake(effect) {
    const age = Date.now() - effect.startTime;
    const progress = age / effect.duration;
    const intensity = effect.options.intensity * (1 - progress);

    const shakeX = (Math.random() - 0.5) * intensity * 10;
    const shakeY = (Math.random() - 0.5) * intensity * 10;

    this.canvas.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
  }

  /**
   * Render flash
   */
  renderFlash(effect) {
    const age = Date.now() - effect.startTime;
    const progress = age / effect.duration;
    const alpha = (1 - progress) * 0.5;

    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
  }

  /**
   * Render blur
   */
  renderBlur(effect) {
    // Implement blur effect
    this.canvas.style.filter = `blur(${effect.options.intensity}px)`;
  }

  /**
   * Handle spell cast
   */
  handleSpellCast(data) {
    const { spell, position, target } = data;

    switch (spell.type) {
      case 'fireball':
        this.createEffect(this.effectTypes.FIREBALL, position, { target });
        break;
      case 'lightning':
        this.createEffect(this.effectTypes.LIGHTNING, position, { target });
        break;
      case 'ice_shard':
        this.createEffect(this.effectTypes.ICE_SHARD, position, { target });
        break;
      case 'poison_cloud':
        this.createEffect(this.effectTypes.POISON_CLOUD, position, { target });
        break;
    }
  }

  /**
   * Handle damage dealt
   */
  handleDamageDealt(data) {
    const { position, damage, type } = data;

    // Create blood particles
    this.createParticleSystem('blood', position, {
      particleCount: Math.min(10, Math.floor(damage / 10)),
      lifetime: 1000,
      spread: 360,
      speed: 40,
    });

    // Screen shake for high damage
    if (damage > 50) {
      this.createScreenEffect('screen_shake', {
        intensity: 0.3,
        duration: 200,
      });
    }
  }

  /**
   * Handle healing
   */
  handleHealing(data) {
    const { position, amount } = data;

    // Create healing particles
    this.createParticleSystem('healing', position, {
      particleCount: Math.min(15, Math.floor(amount / 20)),
      lifetime: 1500,
      spread: 360,
      speed: 30,
    });
  }

  /**
   * Handle explosion
   */
  handleExplosion(data) {
    const { position, radius } = data;

    this.createEffect(this.effectTypes.EXPLOSION, position, {
      radius: radius,
      duration: 1000,
    });
  }

  /**
   * Handle weather change
   */
  handleWeatherChange(data) {
    const { type, intensity, duration } = data;

    this.startWeather(type, intensity, duration);
  }

  /**
   * Handle area enter
   */
  handleAreaEnter(data) {
    const { area } = data;

    // Set area-specific effects
    if (area.weather) {
      this.startWeather(area.weather.type, area.weather.intensity, 0);
    }
  }

  /**
   * Handle element show
   */
  handleElementShow(data) {
    const { element, animation } = data;

    this.createUIAnimation(element, animation || 'fadeIn');
  }

  /**
   * Handle element hide
   */
  handleElementHide(data) {
    const { element, animation } = data;

    this.createUIAnimation(element, animation || 'fadeOut');
  }

  /**
   * Handle button click
   */
  handleButtonClick(data) {
    const { button } = data;

    this.createUIAnimation(button, 'buttonClick');
  }

  /**
   * Handle screen shake
   */
  handleScreenShake(data) {
    const { intensity, duration } = data;

    this.createScreenEffect('screen_shake', {
      intensity: intensity,
      duration: duration,
    });
  }

  /**
   * Handle screen flash
   */
  handleScreenFlash(data) {
    const { color, duration } = data;

    this.createScreenEffect('flash', {
      color: color,
      duration: duration,
    });
  }

  /**
   * Handle screen blur
   */
  handleScreenBlur(data) {
    const { intensity, duration } = data;

    this.createScreenEffect('blur', {
      intensity: intensity,
      duration: duration,
    });
  }

  /**
   * Start weather
   */
  startWeather(type, intensity, duration) {
    this.weather.type = type;
    this.weather.intensity = intensity;
    this.weather.duration = duration;
    this.weather.startTime = Date.now();

    // Create weather particles
    this.createWeatherParticles(type, intensity);
  }

  /**
   * Stop weather
   */
  stopWeather() {
    this.weather.type = 'none';
    this.weather.intensity = 0;
    this.weather.duration = 0;

    // Clear weather particles
    this.clearWeatherParticles();
  }

  /**
   * Create weather particles
   */
  createWeatherParticles(type, intensity) {
    const particleCount = Math.floor(intensity * 50);

    for (let i = 0; i < particleCount; i++) {
      const position = {
        x: Math.random() * this.canvas.width,
        y: -10,
      };

      this.createParticleSystem(type, position, {
        particleCount: 1,
        lifetime: 5000,
        spread: 0,
        speed: 50,
      });
    }
  }

  /**
   * Clear weather particles
   */
  clearWeatherParticles() {
    for (const [id, system] of this.effectsState.particleSystems) {
      if (system.type === this.weather.type) {
        system.active = false;
        this.effectsState.particleSystems.delete(id);
      }
    }
  }

  /**
   * Create UI animation
   */
  createUIAnimation(element, animationType) {
    const animation = this.createAnimation(element, animationType);
    if (animation) {
      this.effectsState.uiAnimations.set(animation.id, animation);
    }
    return animation;
  }

  /**
   * Apply screen effect
   */
  applyScreenEffect(effect) {
    switch (effect.type) {
      case 'screen_shake':
        this.applyScreenShake(effect);
        break;
      case 'flash':
        this.applyFlash(effect);
        break;
      case 'blur':
        this.applyBlur(effect);
        break;
    }
  }

  /**
   * Apply screen shake
   */
  applyScreenShake(effect) {
    const age = Date.now() - effect.startTime;
    const progress = age / effect.duration;
    const intensity = effect.options.intensity * (1 - progress);

    const shakeX = (Math.random() - 0.5) * intensity * 10;
    const shakeY = (Math.random() - 0.5) * intensity * 10;

    this.canvas.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
  }

  /**
   * Apply flash
   */
  applyFlash(effect) {
    const age = Date.now() - effect.startTime;
    const progress = age / effect.duration;
    const alpha = (1 - progress) * 0.5;

    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = effect.options.color || '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
  }

  /**
   * Apply blur
   */
  applyBlur(effect) {
    this.canvas.style.filter = `blur(${effect.options.intensity}px)`;
  }

  /**
   * Clear all effects
   */
  clearAllEffects() {
    this.effectsState.activeEffects.clear();
    this.effectsState.particleSystems.clear();
    this.effectsState.animations.clear();
    this.effectsState.screenEffects.clear();
    this.effectsState.uiAnimations.clear();
  }

  /**
   * Clear particle systems
   */
  clearParticleSystems() {
    this.effectsState.particleSystems.clear();
  }

  /**
   * Clear animations
   */
  clearAnimations() {
    this.effectsState.animations.clear();
  }

  /**
   * Clear shaders
   */
  clearShaders() {
    this.effectsState.shaders.clear();
  }

  /**
   * Set performance level
   */
  setPerformanceLevel(level) {
    this.effectsState.performanceLevel = level;

    const settings = this.effectsConfig.performanceLevels[level];
    if (settings) {
      this.effectsState.effectsEnabled = settings.effects;
      this.effectsState.particlesEnabled = settings.maxParticles > 0;
      this.effectsState.shadowsEnabled = settings.shadows;
    }
  }

  /**
   * Enable effects
   */
  enableEffects() {
    this.effectsState.effectsEnabled = true;
  }

  /**
   * Disable effects
   */
  disableEffects() {
    this.effectsState.effectsEnabled = false;
  }

  /**
   * Enable particles
   */
  enableParticles() {
    this.effectsState.particlesEnabled = true;
  }

  /**
   * Disable particles
   */
  disableParticles() {
    this.effectsState.particlesEnabled = false;
  }

  /**
   * Enable lighting
   */
  enableLighting() {
    this.effectsState.lightingEnabled = true;
  }

  /**
   * Disable lighting
   */
  disableLighting() {
    this.effectsState.lightingEnabled = false;
  }

  /**
   * Enable shadows
   */
  enableShadows() {
    this.effectsState.shadowsEnabled = true;
  }

  /**
   * Disable shadows
   */
  disableShadows() {
    this.effectsState.shadowsEnabled = false;
  }

  /**
   * Get effects state
   */
  getEffectsState() {
    return { ...this.effectsState };
  }

  /**
   * Get active effects count
   */
  getActiveEffectsCount() {
    return this.effectsState.activeEffects.size;
  }

  /**
   * Get particle systems count
   */
  getParticleSystemsCount() {
    return this.effectsState.particleSystems.size;
  }

  /**
   * Get animations count
   */
  getAnimationsCount() {
    return this.effectsState.animations.size;
  }
}

export default VisualEffectsSystem;
