/**
 * CombatSystem.js - Enhanced Hack-and-Slash Combat System
 *
 * This system handles:
 * - Fluid combat mechanics
 * - Enemy horde management
 * - Action-oriented combat
 * - Combo systems
 * - Damage calculation
 * - Combat effects and animations
 */

export class CombatSystem {
  constructor(dependencies = {}) {
    // Dependency injection
    this.eventBus = dependencies.eventBus;
    this.logger = dependencies.logger;
    this.config = dependencies.config;

    // Validate required dependencies
    if (!this.eventBus) {
      throw new Error('CombatSystem requires eventBus dependency');
    }
    if (!this.logger) {
      throw new Error('CombatSystem requires logger dependency');
    }

    // Combat state
    this.combatState = {
      isInCombat: false,
      combatStartTime: null,
      enemies: new Map(),
      projectiles: new Map(),
      effects: new Map(),
      combos: new Map(),
      lastAttackTime: 0,
      attackCooldown: 100, // ms
    };

    // Combat configuration
    this.combatConfig = {
      maxEnemies: 50,
      enemySpawnRate: 2000, // ms
      projectileSpeed: 300, // pixels per second
      effectDuration: 1000, // ms
      comboWindow: 2000, // ms
      criticalHitChance: 0.05,
      criticalHitMultiplier: 1.5,
      damageTypes: [
        'physical',
        'magical',
        'fire',
        'ice',
        'lightning',
        'poison',
      ],
      statusEffects: [
        'burning',
        'frozen',
        'shocked',
        'poisoned',
        'stunned',
        'slowed',
      ],
    };

    // Enemy types and behaviors
    this.enemyTypes = this.initializeEnemyTypes();

    // Combat abilities
    this.abilities = this.initializeAbilities();

    // Damage calculation system
    this.damageCalculator = this.initializeDamageCalculator();

    // Event handlers
    this.setupEventHandlers();

    this.logger.info('CombatSystem initialized');
  }

  /**
   * Initialize the system
   */
  async initialize() {
    this.logger.info('Initializing CombatSystem...');

    // Set up combat areas
    this.setupCombatAreas();

    // Initialize enemy spawner
    this.initializeEnemySpawner();

    this.logger.info('CombatSystem initialized successfully');
  }

  /**
   * Cleanup the system
   */
  cleanup() {
    this.logger.info('Cleaning up CombatSystem...');

    // Clear all combat entities
    this.clearAllCombatEntities();

    // Remove event listeners
    this.removeEventHandlers();

    this.logger.info('CombatSystem cleaned up');
  }

  /**
   * Update the system
   */
  update(deltaTime, gameState) {
    if (!this.combatState.isInCombat) return;

    // Update enemies
    this.updateEnemies(deltaTime);

    // Update projectiles
    this.updateProjectiles(deltaTime);

    // Update effects
    this.updateEffects(deltaTime);

    // Update combos
    this.updateCombos(deltaTime);

    // Check for combat end
    this.checkCombatEnd();

    // Spawn new enemies if needed
    this.spawnEnemies(deltaTime);
  }

  /**
   * Initialize enemy types
   */
  initializeEnemyTypes() {
    return {
      // Basic enemies
      goblin: {
        name: 'Goblin',
        health: 50,
        maxHealth: 50,
        damage: 10,
        speed: 80,
        size: { width: 24, height: 24 },
        ai: 'aggressive',
        loot: { gold: [1, 5], items: ['goblin_ear'] },
        abilities: ['basic_attack'],
        resistances: { physical: 0.1 },
        weaknesses: { fire: 0.2 },
      },

      orc: {
        name: 'Orc',
        health: 120,
        maxHealth: 120,
        damage: 25,
        speed: 60,
        size: { width: 32, height: 32 },
        ai: 'aggressive',
        loot: { gold: [5, 15], items: ['orc_tusk'] },
        abilities: ['heavy_attack', 'charge'],
        resistances: { physical: 0.2 },
        weaknesses: { magical: 0.15 },
      },

      skeleton: {
        name: 'Skeleton',
        health: 80,
        maxHealth: 80,
        damage: 15,
        speed: 70,
        size: { width: 28, height: 28 },
        ai: 'defensive',
        loot: { gold: [3, 10], items: ['bone_fragment'] },
        abilities: ['bone_throw', 'skeleton_rise'],
        resistances: { physical: 0.3, magical: 0.1 },
        weaknesses: { fire: 0.5 },
      },

      // Elite enemies
      troll: {
        name: 'Troll',
        health: 300,
        maxHealth: 300,
        damage: 40,
        speed: 40,
        size: { width: 48, height: 48 },
        ai: 'aggressive',
        loot: { gold: [20, 50], items: ['troll_blood', 'troll_claw'] },
        abilities: ['regeneration', 'ground_slam', 'berserker_rage'],
        resistances: { physical: 0.4, magical: 0.2 },
        weaknesses: { fire: 0.3 },
      },

      dragon: {
        name: 'Dragon',
        health: 1000,
        maxHealth: 1000,
        damage: 80,
        speed: 100,
        size: { width: 64, height: 64 },
        ai: 'boss',
        loot: { gold: [100, 200], items: ['dragon_scale', 'dragon_heart'] },
        abilities: ['fire_breath', 'wing_beat', 'dragon_roar', 'flight'],
        resistances: { physical: 0.6, magical: 0.4, fire: 0.8 },
        weaknesses: { ice: 0.4 },
      },

      // Special enemies
      shadow_assassin: {
        name: 'Shadow Assassin',
        health: 60,
        maxHealth: 60,
        damage: 35,
        speed: 120,
        size: { width: 20, height: 20 },
        ai: 'stealth',
        loot: { gold: [10, 25], items: ['shadow_cloak', 'assassin_blade'] },
        abilities: ['stealth', 'backstab', 'shadow_step', 'poison_dart'],
        resistances: { physical: 0.1, magical: 0.3 },
        weaknesses: { light: 0.5 },
      },
    };
  }

  /**
   * Initialize combat abilities
   */
  initializeAbilities() {
    return {
      // Basic attacks
      basic_attack: {
        name: 'Basic Attack',
        type: 'melee',
        damage: 1.0,
        cooldown: 1000,
        range: 50,
        effects: [],
        animation: 'slash',
      },

      heavy_attack: {
        name: 'Heavy Attack',
        type: 'melee',
        damage: 2.0,
        cooldown: 2000,
        range: 60,
        effects: ['knockback'],
        animation: 'heavy_slash',
      },

      // Ranged attacks
      fireball: {
        name: 'Fireball',
        type: 'projectile',
        damage: 1.5,
        cooldown: 1500,
        range: 200,
        speed: 300,
        effects: ['burning'],
        element: 'fire',
        animation: 'fireball_cast',
      },

      lightning_bolt: {
        name: 'Lightning Bolt',
        type: 'instant',
        damage: 2.5,
        cooldown: 3000,
        range: 150,
        effects: ['shocked'],
        element: 'lightning',
        animation: 'lightning_cast',
      },

      // Area attacks
      whirlwind: {
        name: 'Whirlwind',
        type: 'area',
        damage: 0.8,
        cooldown: 4000,
        range: 80,
        effects: ['knockback'],
        animation: 'whirlwind',
      },

      meteor: {
        name: 'Meteor',
        type: 'area',
        damage: 3.0,
        cooldown: 8000,
        range: 100,
        effects: ['burning', 'knockback'],
        element: 'fire',
        animation: 'meteor_cast',
      },

      // Support abilities
      heal: {
        name: 'Heal',
        type: 'support',
        healing: 50,
        cooldown: 5000,
        range: 0,
        effects: [],
        animation: 'heal_cast',
      },

      shield: {
        name: 'Shield',
        type: 'buff',
        absorption: 100,
        duration: 10000,
        cooldown: 15000,
        effects: ['damage_absorption'],
        animation: 'shield_cast',
      },

      // Special abilities
      berserker_rage: {
        name: 'Berserker Rage',
        type: 'buff',
        damageMultiplier: 2.0,
        speedMultiplier: 1.5,
        duration: 15000,
        cooldown: 60000,
        effects: ['damage_boost', 'speed_boost'],
        animation: 'rage_activation',
      },

      time_slow: {
        name: 'Time Slow',
        type: 'debuff',
        speedMultiplier: 0.3,
        duration: 5000,
        cooldown: 30000,
        range: 120,
        effects: ['slow'],
        animation: 'time_slow_cast',
      },
    };
  }

  /**
   * Initialize damage calculator
   */
  initializeDamageCalculator() {
    return {
      calculateDamage: (attacker, target, ability) => {
        let baseDamage = attacker.stats.damage || 10;

        // Apply ability damage multiplier
        if (ability.damage) {
          baseDamage *= ability.damage;
        }

        // Apply critical hit
        const critChance = attacker.stats.criticalChance || 0.05;
        const critMultiplier = attacker.stats.criticalMultiplier || 1.5;

        if (Math.random() < critChance) {
          baseDamage *= critMultiplier;
          this.eventBus.emit('combat:criticalHit', {
            attacker,
            target,
            damage: baseDamage,
          });
        }

        // Apply resistances and weaknesses
        if (ability.element) {
          const resistance = target.resistances?.[ability.element] || 0;
          const weakness = target.weaknesses?.[ability.element] || 0;
          baseDamage *= 1 - resistance + weakness;
        }

        // Apply armor
        const armor = target.stats.armor || 0;
        const damageReduction = armor / (armor + 100);
        baseDamage *= 1 - damageReduction;

        return Math.max(1, Math.floor(baseDamage));
      },

      calculateHealing: (healer, target, ability) => {
        let baseHealing = ability.healing || 0;

        // Apply healing bonuses
        const healingBonus = healer.stats.healingBonus || 0;
        baseHealing *= 1 + healingBonus;

        return Math.floor(baseHealing);
      },
    };
  }

  /**
   * Set up event handlers
   */
  setupEventHandlers() {
    // Combat events
    this.eventBus.on('combat:start', this.startCombat.bind(this));
    this.eventBus.on('combat:end', this.endCombat.bind(this));
    this.eventBus.on('combat:attack', this.handleAttack.bind(this));
    this.eventBus.on('combat:ability', this.handleAbility.bind(this));
    this.eventBus.on('combat:damage', this.handleDamage.bind(this));
    this.eventBus.on('combat:death', this.handleDeath.bind(this));

    // Player events
    this.eventBus.on('player:move', this.handlePlayerMove.bind(this));
    this.eventBus.on('player:ability', this.handlePlayerAbility.bind(this));
  }

  /**
   * Remove event handlers
   */
  removeEventHandlers() {
    this.eventBus.removeListener('combat:start', this.startCombat.bind(this));
    this.eventBus.removeListener('combat:end', this.endCombat.bind(this));
    this.eventBus.removeListener('combat:attack', this.handleAttack.bind(this));
    this.eventBus.removeListener(
      'combat:ability',
      this.handleAbility.bind(this)
    );
    this.eventBus.removeListener('combat:damage', this.handleDamage.bind(this));
    this.eventBus.removeListener('combat:death', this.handleDeath.bind(this));
    this.eventBus.removeListener(
      'player:move',
      this.handlePlayerMove.bind(this)
    );
    this.eventBus.removeListener(
      'player:ability',
      this.handlePlayerAbility.bind(this)
    );
  }

  /**
   * Set up combat areas
   */
  setupCombatAreas() {
    this.combatAreas = [
      {
        id: 'forest_clearing',
        name: 'Forest Clearing',
        bounds: { x: 0, y: 0, width: 800, height: 600 },
        enemyTypes: ['goblin', 'orc', 'skeleton'],
        spawnPoints: [
          { x: 100, y: 100 },
          { x: 700, y: 100 },
          { x: 100, y: 500 },
          { x: 700, y: 500 },
        ],
      },
      {
        id: 'cave_entrance',
        name: 'Cave Entrance',
        bounds: { x: 0, y: 0, width: 600, height: 400 },
        enemyTypes: ['skeleton', 'shadow_assassin'],
        spawnPoints: [
          { x: 50, y: 200 },
          { x: 550, y: 200 },
        ],
      },
      {
        id: 'dragon_lair',
        name: 'Dragon Lair',
        bounds: { x: 0, y: 0, width: 1000, height: 800 },
        enemyTypes: ['troll', 'dragon'],
        spawnPoints: [{ x: 500, y: 400 }],
      },
    ];
  }

  /**
   * Initialize enemy spawner
   */
  initializeEnemySpawner() {
    this.enemySpawner = {
      lastSpawnTime: 0,
      spawnInterval: this.combatConfig.enemySpawnRate,
      maxEnemies: this.combatConfig.maxEnemies,
      currentArea: null,
    };
  }

  /**
   * Start combat
   */
  startCombat(areaId) {
    if (this.combatState.isInCombat) return;

    this.combatState.isInCombat = true;
    this.combatState.combatStartTime = Date.now();
    this.enemySpawner.currentArea = this.combatAreas.find(
      (area) => area.id === areaId
    );

    this.logger.info(`Combat started in area: ${areaId}`);

    this.eventBus.emit('combat:started', {
      areaId,
      timestamp: this.combatState.combatStartTime,
    });
  }

  /**
   * End combat
   */
  endCombat() {
    if (!this.combatState.isInCombat) return;

    this.combatState.isInCombat = false;
    this.clearAllCombatEntities();

    const combatDuration = Date.now() - this.combatState.combatStartTime;

    this.logger.info(`Combat ended after ${combatDuration}ms`);

    this.eventBus.emit('combat:ended', {
      duration: combatDuration,
      timestamp: Date.now(),
    });
  }

  /**
   * Update enemies
   */
  updateEnemies(deltaTime) {
    for (const [id, enemy] of this.combatState.enemies) {
      // Update enemy AI
      this.updateEnemyAI(enemy, deltaTime);

      // Update enemy position
      this.updateEnemyPosition(enemy, deltaTime);

      // Update enemy abilities
      this.updateEnemyAbilities(enemy, deltaTime);

      // Check if enemy is dead
      if (enemy.health <= 0) {
        this.handleEnemyDeath(enemy);
        this.combatState.enemies.delete(id);
      }
    }
  }

  /**
   * Update enemy AI
   */
  updateEnemyAI(enemy, deltaTime) {
    const enemyType = this.enemyTypes[enemy.type];
    if (!enemyType) return;

    switch (enemyType.ai) {
      case 'aggressive':
        this.updateAggressiveAI(enemy, deltaTime);
        break;
      case 'defensive':
        this.updateDefensiveAI(enemy, deltaTime);
        break;
      case 'stealth':
        this.updateStealthAI(enemy, deltaTime);
        break;
      case 'boss':
        this.updateBossAI(enemy, deltaTime);
        break;
    }
  }

  /**
   * Update aggressive AI
   */
  updateAggressiveAI(enemy, deltaTime) {
    // Find nearest player
    const nearestPlayer = this.findNearestPlayer(enemy);
    if (!nearestPlayer) return;

    const distance = this.getDistance(enemy, nearestPlayer);

    // Move towards player
    if (distance > 30) {
      const angle = Math.atan2(
        nearestPlayer.y - enemy.y,
        nearestPlayer.x - enemy.x
      );
      enemy.velocityX = Math.cos(angle) * enemy.speed;
      enemy.velocityY = Math.sin(angle) * enemy.speed;
    } else {
      enemy.velocityX = 0;
      enemy.velocityY = 0;

      // Attack if in range
      if (Date.now() - enemy.lastAttackTime > enemy.attackCooldown) {
        this.enemyAttack(enemy, nearestPlayer);
      }
    }
  }

  /**
   * Update defensive AI
   */
  updateDefensiveAI(enemy, deltaTime) {
    // Find nearest player
    const nearestPlayer = this.findNearestPlayer(enemy);
    if (!nearestPlayer) return;

    const distance = this.getDistance(enemy, nearestPlayer);

    // Keep distance from player
    if (distance < 50) {
      const angle = Math.atan2(
        enemy.y - nearestPlayer.y,
        enemy.x - nearestPlayer.x
      );
      enemy.velocityX = Math.cos(angle) * enemy.speed * 0.5;
      enemy.velocityY = Math.sin(angle) * enemy.speed * 0.5;
    } else if (distance > 100) {
      const angle = Math.atan2(
        nearestPlayer.y - enemy.y,
        nearestPlayer.x - enemy.x
      );
      enemy.velocityX = Math.cos(angle) * enemy.speed * 0.3;
      enemy.velocityY = Math.sin(angle) * enemy.speed * 0.3;
    } else {
      enemy.velocityX = 0;
      enemy.velocityY = 0;
    }

    // Use ranged attacks
    if (
      distance > 30 &&
      distance < 150 &&
      Date.now() - enemy.lastAttackTime > enemy.attackCooldown
    ) {
      this.enemyRangedAttack(enemy, nearestPlayer);
    }
  }

  /**
   * Update stealth AI
   */
  updateStealthAI(enemy, deltaTime) {
    // Stealth behavior - move unpredictably and attack from behind
    if (enemy.stealthCooldown > 0) {
      enemy.stealthCooldown -= deltaTime;
    } else if (Math.random() < 0.1) {
      // Enter stealth
      enemy.isStealthed = true;
      enemy.stealthDuration = 3000;
    }

    if (enemy.isStealthed) {
      enemy.stealthDuration -= deltaTime;
      if (enemy.stealthDuration <= 0) {
        enemy.isStealthed = false;
        enemy.stealthCooldown = 5000;
      }
    }

    // Move towards player when stealthed
    if (enemy.isStealthed) {
      const nearestPlayer = this.findNearestPlayer(enemy);
      if (nearestPlayer) {
        const angle = Math.atan2(
          nearestPlayer.y - enemy.y,
          nearestPlayer.x - enemy.x
        );
        enemy.velocityX = Math.cos(angle) * enemy.speed * 1.2;
        enemy.velocityY = Math.sin(angle) * enemy.speed * 1.2;

        // Backstab if close enough
        const distance = this.getDistance(enemy, nearestPlayer);
        if (distance < 20) {
          this.enemyBackstab(enemy, nearestPlayer);
        }
      }
    }
  }

  /**
   * Update boss AI
   */
  updateBossAI(enemy, deltaTime) {
    // Boss has multiple phases and special abilities
    const healthPercentage = enemy.health / enemy.maxHealth;

    if (healthPercentage > 0.7) {
      // Phase 1: Basic attacks
      this.updateAggressiveAI(enemy, deltaTime);
    } else if (healthPercentage > 0.3) {
      // Phase 2: Special abilities
      this.updateBossPhase2(enemy, deltaTime);
    } else {
      // Phase 3: Enraged
      this.updateBossPhase3(enemy, deltaTime);
    }
  }

  /**
   * Update boss phase 2
   */
  updateBossPhase2(enemy, deltaTime) {
    // Use special abilities more frequently
    if (Date.now() - enemy.lastSpecialAbility > 5000) {
      const abilities = ['fire_breath', 'wing_beat'];
      const ability = abilities[Math.floor(Math.random() * abilities.length)];
      this.useEnemyAbility(enemy, ability);
      enemy.lastSpecialAbility = Date.now();
    }

    this.updateAggressiveAI(enemy, deltaTime);
  }

  /**
   * Update boss phase 3
   */
  updateBossPhase3(enemy, deltaTime) {
    // Enraged - faster, stronger, more abilities
    enemy.speed *= 1.5;
    enemy.damage *= 1.3;

    if (Date.now() - enemy.lastSpecialAbility > 2000) {
      const abilities = ['fire_breath', 'wing_beat', 'dragon_roar'];
      const ability = abilities[Math.floor(Math.random() * abilities.length)];
      this.useEnemyAbility(enemy, ability);
      enemy.lastSpecialAbility = Date.now();
    }

    this.updateAggressiveAI(enemy, deltaTime);
  }

  /**
   * Update enemy position
   */
  updateEnemyPosition(enemy, deltaTime) {
    enemy.x += (enemy.velocityX * deltaTime) / 1000;
    enemy.y += (enemy.velocityY * deltaTime) / 1000;

    // Keep enemy within bounds
    const area = this.enemySpawner.currentArea;
    if (area) {
      enemy.x = Math.max(
        area.bounds.x,
        Math.min(area.bounds.x + area.bounds.width, enemy.x)
      );
      enemy.y = Math.max(
        area.bounds.y,
        Math.min(area.bounds.y + area.bounds.height, enemy.y)
      );
    }
  }

  /**
   * Update enemy abilities
   */
  updateEnemyAbilities(enemy, deltaTime) {
    // Update ability cooldowns
    if (enemy.abilityCooldowns) {
      for (const [ability, cooldown] of enemy.abilityCooldowns) {
        if (cooldown > 0) {
          enemy.abilityCooldowns.set(ability, cooldown - deltaTime);
        }
      }
    }
  }

  /**
   * Update projectiles
   */
  updateProjectiles(deltaTime) {
    for (const [id, projectile] of this.combatState.projectiles) {
      // Update position
      projectile.x += (projectile.velocityX * deltaTime) / 1000;
      projectile.y += (projectile.velocityY * deltaTime) / 1000;

      // Check for collisions
      this.checkProjectileCollisions(projectile);

      // Remove if out of bounds or expired
      if (this.isProjectileExpired(projectile)) {
        this.combatState.projectiles.delete(id);
      }
    }
  }

  /**
   * Update effects
   */
  updateEffects(deltaTime) {
    for (const [id, effect] of this.combatState.effects) {
      effect.duration -= deltaTime;

      // Apply effect
      this.applyEffect(effect);

      // Remove if expired
      if (effect.duration <= 0) {
        this.removeEffect(effect);
        this.combatState.effects.delete(id);
      }
    }
  }

  /**
   * Update combos
   */
  updateCombos(deltaTime) {
    for (const [id, combo] of this.combatState.combos) {
      combo.timeSinceLastHit += deltaTime;

      // End combo if too much time has passed
      if (combo.timeSinceLastHit > this.combatConfig.comboWindow) {
        this.endCombo(combo);
        this.combatState.combos.delete(id);
      }
    }
  }

  /**
   * Spawn enemies
   */
  spawnEnemies(deltaTime) {
    if (!this.combatState.isInCombat || !this.enemySpawner.currentArea) return;

    this.enemySpawner.lastSpawnTime += deltaTime;

    if (
      this.enemySpawner.lastSpawnTime >= this.enemySpawner.spawnInterval &&
      this.combatState.enemies.size < this.enemySpawner.maxEnemies
    ) {
      this.spawnEnemy();
      this.enemySpawner.lastSpawnTime = 0;
    }
  }

  /**
   * Spawn a single enemy
   */
  spawnEnemy() {
    const area = this.enemySpawner.currentArea;
    const enemyType =
      area.enemyTypes[Math.floor(Math.random() * area.enemyTypes.length)];
    const spawnPoint =
      area.spawnPoints[Math.floor(Math.random() * area.spawnPoints.length)];

    const enemy = this.createEnemy(enemyType, spawnPoint.x, spawnPoint.y);
    this.combatState.enemies.set(enemy.id, enemy);

    this.logger.info(
      `Spawned ${enemyType} at (${spawnPoint.x}, ${spawnPoint.y})`
    );
  }

  /**
   * Create enemy
   */
  createEnemy(type, x, y) {
    const enemyType = this.enemyTypes[type];
    if (!enemyType) {
      throw new Error(`Unknown enemy type: ${type}`);
    }

    return {
      id: `enemy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type,
      name: enemyType.name,
      x: x,
      y: y,
      health: enemyType.health,
      maxHealth: enemyType.maxHealth,
      damage: enemyType.damage,
      speed: enemyType.speed,
      velocityX: 0,
      velocityY: 0,
      size: enemyType.size,
      ai: enemyType.ai,
      abilities: [...enemyType.abilities],
      resistances: { ...enemyType.resistances },
      weaknesses: { ...enemyType.weaknesses },
      lastAttackTime: 0,
      attackCooldown: 2000,
      lastSpecialAbility: 0,
      abilityCooldowns: new Map(),
      isStealthed: false,
      stealthCooldown: 0,
      stealthDuration: 0,
      loot: enemyType.loot,
    };
  }

  /**
   * Handle attack
   */
  handleAttack(data) {
    const { attacker, target, ability } = data;

    if (!this.canAttack(attacker, target)) return;

    const damage = this.damageCalculator.calculateDamage(
      attacker,
      target,
      ability
    );
    this.dealDamage(target, damage, attacker);

    // Update attack cooldown
    attacker.lastAttackTime = Date.now();

    // Create attack effect
    this.createAttackEffect(attacker, target, ability);

    // Update combo
    this.updateCombo(attacker, target);

    this.eventBus.emit('combat:attackExecuted', {
      attacker,
      target,
      damage,
      ability,
    });
  }

  /**
   * Handle ability
   */
  handleAbility(data) {
    const { caster, ability, target } = data;

    if (!this.canUseAbility(caster, ability)) return;

    this.useAbility(caster, ability, target);

    // Update ability cooldown
    if (caster.abilityCooldowns) {
      caster.abilityCooldowns.set(ability.id, ability.cooldown);
    }

    this.eventBus.emit('combat:abilityUsed', {
      caster,
      ability,
      target,
    });
  }

  /**
   * Handle damage
   */
  handleDamage(data) {
    const { target, damage, source, type } = data;

    target.health = Math.max(0, target.health - damage);

    // Create damage effect
    this.createDamageEffect(target, damage);

    // Apply status effects
    if (type && this.combatConfig.statusEffects.includes(type)) {
      this.applyStatusEffect(target, type);
    }

    this.eventBus.emit('combat:damageDealt', {
      target,
      damage,
      source,
      type,
    });
  }

  /**
   * Handle death
   */
  handleDeath(data) {
    const { entity } = data;

    // Drop loot
    this.dropLoot(entity);

    // Create death effect
    this.createDeathEffect(entity);

    // Award experience
    this.awardExperience(entity);

    this.eventBus.emit('combat:entityDied', {
      entity,
      timestamp: Date.now(),
    });
  }

  /**
   * Handle player move
   */
  handlePlayerMove(data) {
    // Update player position for enemy AI
    this.playerPosition = { x: data.x, y: data.y };
  }

  /**
   * Handle player ability
   */
  handlePlayerAbility(data) {
    const { ability, target } = data;

    // Use player ability
    this.usePlayerAbility(ability, target);
  }

  /**
   * Check if combat should end
   */
  checkCombatEnd() {
    if (this.combatState.enemies.size === 0) {
      this.endCombat();
    }
  }

  /**
   * Clear all combat entities
   */
  clearAllCombatEntities() {
    this.combatState.enemies.clear();
    this.combatState.projectiles.clear();
    this.combatState.effects.clear();
    this.combatState.combos.clear();
  }

  /**
   * Find nearest player
   */
  findNearestPlayer(enemy) {
    // This would find the nearest player in the game
    // For now, return a mock player position
    return this.playerPosition || { x: 400, y: 300 };
  }

  /**
   * Get distance between two entities
   */
  getDistance(entity1, entity2) {
    const dx = entity2.x - entity1.x;
    const dy = entity2.y - entity1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Check if entity can attack
   */
  canAttack(attacker, target) {
    const distance = this.getDistance(attacker, target);
    const range = attacker.attackRange || 50;

    return (
      distance <= range &&
      Date.now() - attacker.lastAttackTime > attacker.attackCooldown
    );
  }

  /**
   * Check if entity can use ability
   */
  canUseAbility(caster, ability) {
    if (caster.abilityCooldowns) {
      const cooldown = caster.abilityCooldowns.get(ability.id);
      if (cooldown && cooldown > 0) return false;
    }

    return caster.mana >= (ability.manaCost || 0);
  }

  /**
   * Deal damage to target
   */
  dealDamage(target, damage, source) {
    target.health = Math.max(0, target.health - damage);

    this.eventBus.emit('combat:damage', {
      target,
      damage,
      source,
      timestamp: Date.now(),
    });

    if (target.health <= 0) {
      this.eventBus.emit('combat:death', {
        entity: target,
        source,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Use ability
   */
  useAbility(caster, ability, target) {
    const abilityData = this.abilities[ability.id];
    if (!abilityData) return;

    switch (abilityData.type) {
      case 'melee':
        this.useMeleeAbility(caster, abilityData, target);
        break;
      case 'projectile':
        this.useProjectileAbility(caster, abilityData, target);
        break;
      case 'instant':
        this.useInstantAbility(caster, abilityData, target);
        break;
      case 'area':
        this.useAreaAbility(caster, abilityData, target);
        break;
      case 'support':
        this.useSupportAbility(caster, abilityData, target);
        break;
      case 'buff':
        this.useBuffAbility(caster, abilityData, target);
        break;
      case 'debuff':
        this.useDebuffAbility(caster, abilityData, target);
        break;
    }
  }

  /**
   * Use melee ability
   */
  useMeleeAbility(caster, ability, target) {
    if (!target) return;

    const damage = this.damageCalculator.calculateDamage(
      caster,
      target,
      ability
    );
    this.dealDamage(target, damage, caster);

    // Apply effects
    this.applyAbilityEffects(ability, target);
  }

  /**
   * Use projectile ability
   */
  useProjectileAbility(caster, ability, target) {
    const projectile = this.createProjectile(caster, ability, target);
    this.combatState.projectiles.set(projectile.id, projectile);
  }

  /**
   * Use instant ability
   */
  useInstantAbility(caster, ability, target) {
    if (!target) return;

    const damage = this.damageCalculator.calculateDamage(
      caster,
      target,
      ability
    );
    this.dealDamage(target, damage, caster);

    // Apply effects
    this.applyAbilityEffects(ability, target);
  }

  /**
   * Use area ability
   */
  useAreaAbility(caster, ability, target) {
    const centerX = target ? target.x : caster.x;
    const centerY = target ? target.y : caster.y;

    // Find all entities in range
    const entitiesInRange = this.getEntitiesInRange(
      centerX,
      centerY,
      ability.range
    );

    entitiesInRange.forEach((entity) => {
      const damage = this.damageCalculator.calculateDamage(
        caster,
        entity,
        ability
      );
      this.dealDamage(entity, damage, caster);
      this.applyAbilityEffects(ability, entity);
    });
  }

  /**
   * Use support ability
   */
  useSupportAbility(caster, ability, target) {
    if (!target) return;

    const healing = this.damageCalculator.calculateHealing(
      caster,
      target,
      ability
    );
    target.health = Math.min(target.maxHealth, target.health + healing);

    this.eventBus.emit('combat:healing', {
      target,
      healing,
      source: caster,
      timestamp: Date.now(),
    });
  }

  /**
   * Use buff ability
   */
  useBuffAbility(caster, ability, target) {
    if (!target) return;

    const effect = this.createEffect(ability, target, caster);
    this.combatState.effects.set(effect.id, effect);
  }

  /**
   * Use debuff ability
   */
  useDebuffAbility(caster, ability, target) {
    if (!target) return;

    const effect = this.createEffect(ability, target, caster);
    this.combatState.effects.set(effect.id, effect);
  }

  /**
   * Create projectile
   */
  createProjectile(caster, ability, target) {
    const angle = target
      ? Math.atan2(target.y - caster.y, target.x - caster.x)
      : caster.facing || 0;

    return {
      id: `projectile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      x: caster.x,
      y: caster.y,
      velocityX: Math.cos(angle) * ability.speed,
      velocityY: Math.sin(angle) * ability.speed,
      damage: ability.damage,
      caster: caster,
      ability: ability,
      lifetime: 5000,
      createdAt: Date.now(),
    };
  }

  /**
   * Create effect
   */
  createEffect(ability, target, caster) {
    return {
      id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: ability.id,
      target: target,
      caster: caster,
      duration: ability.duration || 5000,
      effects: ability.effects || [],
      createdAt: Date.now(),
    };
  }

  /**
   * Apply effect
   */
  applyEffect(effect) {
    // Apply effect to target based on effect type
    effect.effects.forEach((effectType) => {
      switch (effectType) {
        case 'damage_boost':
          effect.target.damageMultiplier =
            (effect.target.damageMultiplier || 1) * 1.2;
          break;
        case 'speed_boost':
          effect.target.speedMultiplier =
            (effect.target.speedMultiplier || 1) * 1.2;
          break;
        case 'slow':
          effect.target.speedMultiplier =
            (effect.target.speedMultiplier || 1) * 0.5;
          break;
        case 'burning':
          this.applyBurningEffect(effect.target);
          break;
        case 'frozen':
          this.applyFrozenEffect(effect.target);
          break;
        case 'shocked':
          this.applyShockedEffect(effect.target);
          break;
        case 'poisoned':
          this.applyPoisonedEffect(effect.target);
          break;
      }
    });
  }

  /**
   * Remove effect
   */
  removeEffect(effect) {
    // Remove effect from target
    effect.effects.forEach((effectType) => {
      switch (effectType) {
        case 'damage_boost':
          effect.target.damageMultiplier =
            (effect.target.damageMultiplier || 1) / 1.2;
          break;
        case 'speed_boost':
          effect.target.speedMultiplier =
            (effect.target.speedMultiplier || 1) / 1.2;
          break;
        case 'slow':
          effect.target.speedMultiplier =
            (effect.target.speedMultiplier || 1) / 0.5;
          break;
      }
    });
  }

  /**
   * Apply ability effects
   */
  applyAbilityEffects(ability, target) {
    if (!ability.effects) return;

    ability.effects.forEach((effect) => {
      switch (effect) {
        case 'knockback':
          this.applyKnockback(target, ability.knockbackForce || 100);
          break;
        case 'burning':
          this.applyBurningEffect(target);
          break;
        case 'frozen':
          this.applyFrozenEffect(target);
          break;
        case 'shocked':
          this.applyShockedEffect(target);
          break;
        case 'poisoned':
          this.applyPoisonedEffect(target);
          break;
        case 'stunned':
          this.applyStunnedEffect(target);
          break;
        case 'slowed':
          this.applySlowedEffect(target);
          break;
      }
    });
  }

  /**
   * Apply knockback
   */
  applyKnockback(target, force) {
    // Calculate knockback direction and apply velocity
    const angle = Math.atan2(
      target.y - this.playerPosition.y,
      target.x - this.playerPosition.x
    );
    target.velocityX = Math.cos(angle) * force;
    target.velocityY = Math.sin(angle) * force;
  }

  /**
   * Apply burning effect
   */
  applyBurningEffect(target) {
    target.statusEffects = target.statusEffects || new Set();
    target.statusEffects.add('burning');

    // Apply damage over time
    const burnDamage = 5;
    this.dealDamage(target, burnDamage, null);
  }

  /**
   * Apply frozen effect
   */
  applyFrozenEffect(target) {
    target.statusEffects = target.statusEffects || new Set();
    target.statusEffects.add('frozen');
    target.speedMultiplier = 0.1;
  }

  /**
   * Apply shocked effect
   */
  applyShockedEffect(target) {
    target.statusEffects = target.statusEffects || new Set();
    target.statusEffects.add('shocked');

    // Chance to stun
    if (Math.random() < 0.3) {
      this.applyStunnedEffect(target);
    }
  }

  /**
   * Apply poisoned effect
   */
  applyPoisonedEffect(target) {
    target.statusEffects = target.statusEffects || new Set();
    target.statusEffects.add('poisoned');

    // Apply damage over time
    const poisonDamage = 3;
    this.dealDamage(target, poisonDamage, null);
  }

  /**
   * Apply stunned effect
   */
  applyStunnedEffect(target) {
    target.statusEffects = target.statusEffects || new Set();
    target.statusEffects.add('stunned');
    target.velocityX = 0;
    target.velocityY = 0;
  }

  /**
   * Apply slowed effect
   */
  applySlowedEffect(target) {
    target.statusEffects = target.statusEffects || new Set();
    target.statusEffects.add('slowed');
    target.speedMultiplier = 0.5;
  }

  /**
   * Update combo
   */
  updateCombo(attacker, target) {
    const comboId = `${attacker.id}_${target.id}`;
    let combo = this.combatState.combos.get(comboId);

    if (!combo) {
      combo = {
        id: comboId,
        attacker: attacker,
        target: target,
        hits: 0,
        damage: 0,
        timeSinceLastHit: 0,
        startTime: Date.now(),
      };
      this.combatState.combos.set(comboId, combo);
    }

    combo.hits++;
    combo.timeSinceLastHit = 0;

    // Apply combo bonuses
    const comboMultiplier = 1 + combo.hits * 0.1;
    this.eventBus.emit('combat:comboHit', {
      combo,
      multiplier: comboMultiplier,
    });
  }

  /**
   * End combo
   */
  endCombo(combo) {
    this.eventBus.emit('combat:comboEnded', {
      combo,
      finalHits: combo.hits,
      totalDamage: combo.damage,
    });
  }

  /**
   * Get entities in range
   */
  getEntitiesInRange(x, y, range) {
    const entities = [];

    // Check enemies
    for (const enemy of this.combatState.enemies.values()) {
      const distance = this.getDistance({ x, y }, enemy);
      if (distance <= range) {
        entities.push(enemy);
      }
    }

    return entities;
  }

  /**
   * Check projectile collisions
   */
  checkProjectileCollisions(projectile) {
    // Check collision with enemies
    for (const enemy of this.combatState.enemies.values()) {
      const distance = this.getDistance(projectile, enemy);
      if (distance < 20) {
        this.dealDamage(enemy, projectile.damage, projectile.caster);
        this.combatState.projectiles.delete(projectile.id);
        return;
      }
    }
  }

  /**
   * Check if projectile is expired
   */
  isProjectileExpired(projectile) {
    return Date.now() - projectile.createdAt > projectile.lifetime;
  }

  /**
   * Create attack effect
   */
  createAttackEffect(attacker, target, ability) {
    // Create visual effect for attack
    this.eventBus.emit('combat:attackEffect', {
      attacker,
      target,
      ability,
      timestamp: Date.now(),
    });
  }

  /**
   * Create damage effect
   */
  createDamageEffect(target, damage) {
    // Create visual effect for damage
    this.eventBus.emit('combat:damageEffect', {
      target,
      damage,
      timestamp: Date.now(),
    });
  }

  /**
   * Create death effect
   */
  createDeathEffect(entity) {
    // Create visual effect for death
    this.eventBus.emit('combat:deathEffect', {
      entity,
      timestamp: Date.now(),
    });
  }

  /**
   * Drop loot
   */
  dropLoot(entity) {
    if (!entity.loot) return;

    const loot = {
      gold: this.calculateLootAmount(entity.loot.gold),
      items: this.calculateLootItems(entity.loot.items),
    };

    this.eventBus.emit('combat:lootDropped', {
      entity,
      loot,
      position: { x: entity.x, y: entity.y },
    });
  }

  /**
   * Calculate loot amount
   */
  calculateLootAmount(lootRange) {
    if (!lootRange || lootRange.length !== 2) return 0;
    return (
      Math.floor(Math.random() * (lootRange[1] - lootRange[0] + 1)) +
      lootRange[0]
    );
  }

  /**
   * Calculate loot items
   */
  calculateLootItems(itemList) {
    if (!itemList || itemList.length === 0) return [];

    const items = [];
    const dropChance = 0.3; // 30% chance to drop an item

    itemList.forEach((item) => {
      if (Math.random() < dropChance) {
        items.push(item);
      }
    });

    return items;
  }

  /**
   * Award experience
   */
  awardExperience(entity) {
    const experience = this.calculateExperience(entity);

    this.eventBus.emit('combat:experienceGained', {
      amount: experience,
      source: entity,
      timestamp: Date.now(),
    });
  }

  /**
   * Calculate experience
   */
  calculateExperience(entity) {
    const baseExp = entity.maxHealth * 0.1;
    const levelBonus = entity.level || 1;
    return Math.floor(baseExp * levelBonus);
  }

  /**
   * Enemy attack
   */
  enemyAttack(enemy, target) {
    const ability = this.abilities.basic_attack;
    this.handleAttack({
      attacker: enemy,
      target: target,
      ability: ability,
    });

    enemy.lastAttackTime = Date.now();
  }

  /**
   * Enemy ranged attack
   */
  enemyRangedAttack(enemy, target) {
    const ability = this.abilities.fireball;
    this.useProjectileAbility(enemy, ability, target);

    enemy.lastAttackTime = Date.now();
  }

  /**
   * Enemy backstab
   */
  enemyBackstab(enemy, target) {
    const ability = { ...this.abilities.basic_attack, damage: 3.0 };
    this.handleAttack({
      attacker: enemy,
      target: target,
      ability: ability,
    });

    enemy.lastAttackTime = Date.now();
  }

  /**
   * Use enemy ability
   */
  useEnemyAbility(enemy, abilityId) {
    const ability = this.abilities[abilityId];
    if (!ability) return;

    this.useAbility(enemy, ability, null);
  }

  /**
   * Use player ability
   */
  usePlayerAbility(ability, target) {
    this.useAbility(this.player, ability, target);
  }

  /**
   * Handle enemy death
   */
  handleEnemyDeath(enemy) {
    this.handleDeath({ entity: enemy });
  }

  /**
   * Get combat state
   */
  getCombatState() {
    return { ...this.combatState };
  }

  /**
   * Get enemy count
   */
  getEnemyCount() {
    return this.combatState.enemies.size;
  }

  /**
   * Is in combat
   */
  isInCombat() {
    return this.combatState.isInCombat;
  }
}

export default CombatSystem;
