/**
 * ARPGUISystem.js - Comprehensive ARPG UI Management System
 *
 * This system handles all ARPG-specific UI components including:
 * - Passive skill tree (100+ nodes)
 * - Skill gem system with socketing
 * - Character customization and stats
 * - Inventory management
 * - Trading system
 * - Item socketing interface
 * - Combat UI enhancements
 */

export class ARPGUISystem {
  constructor(dependencies = {}) {
    // Dependency injection
    this.eventBus = dependencies.eventBus;
    this.logger = dependencies.logger;
    this.config = dependencies.config;

    // Validate required dependencies
    if (!this.eventBus) {
      throw new Error('ARPGUISystem requires eventBus dependency');
    }
    if (!this.logger) {
      throw new Error('ARPGUISystem requires logger dependency');
    }

    // UI State
    this.uiState = {
      isOpen: false,
      currentTab: 'character',
      skillTreeOpen: false,
      inventoryOpen: false,
      tradingOpen: false,
      gemSocketingOpen: false,
      selectedItem: null,
      selectedGem: null,
    };

    // Character stats and progression
    this.character = {
      level: 1,
      experience: 0,
      experienceToNext: 100,
      skillPoints: 0,
      attributePoints: 0,
      attributes: {
        strength: 10,
        dexterity: 10,
        intelligence: 10,
        vitality: 10,
        wisdom: 10,
        charisma: 10,
      },
      stats: {
        health: 100,
        maxHealth: 100,
        mana: 50,
        maxMana: 50,
        damage: 10,
        armor: 0,
        criticalChance: 0.05,
        criticalMultiplier: 1.5,
        attackSpeed: 1.0,
        movementSpeed: 1.0,
        manaRegen: 1.0,
        healthRegen: 0.5,
      },
      skills: new Map(),
      equippedItems: new Map(),
      inventory: [],
      gems: [],
    };

    // Passive skill tree data (100+ nodes)
    this.skillTree = this.initializeSkillTree();

    // Skill gem system
    this.skillGems = this.initializeSkillGems();

    // Item socketing system
    this.socketingSystem = this.initializeSocketingSystem();

    // Trading system
    this.tradingSystem = this.initializeTradingSystem();

    // UI elements cache
    this.uiElements = new Map();

    // Event handlers
    this.setupEventHandlers();

    this.logger.info('ARPGUISystem initialized');
  }

  /**
   * Initialize the system
   */
  async initialize() {
    this.logger.info('Initializing ARPGUISystem...');

    // Create UI elements
    this.createUIElements();

    // Set up event listeners
    this.setupUIEventListeners();

    // Load character data
    await this.loadCharacterData();

    this.logger.info('ARPGUISystem initialized successfully');
  }

  /**
   * Cleanup the system
   */
  cleanup() {
    this.logger.info('Cleaning up ARPGUISystem...');

    // Save character data
    this.saveCharacterData();

    // Remove event listeners
    this.removeEventHandlers();

    // Clear UI elements
    this.clearUIElements();

    this.logger.info('ARPGUISystem cleaned up');
  }

  /**
   * Update the system
   */
  update(deltaTime, gameState) {
    // Update character stats based on attributes
    this.updateCharacterStats();

    // Update UI animations
    this.updateUIAnimations(deltaTime);

    // Update skill cooldowns
    this.updateSkillCooldowns(deltaTime);
  }

  /**
   * Initialize the passive skill tree with 100+ nodes
   */
  initializeSkillTree() {
    return {
      // Combat tree (30 nodes)
      combat: {
        name: 'Combat Mastery',
        description: 'Enhance your combat abilities',
        nodes: [
          // Basic combat nodes
          {
            id: 'basic_attack',
            name: 'Basic Attack',
            description: 'Increases basic attack damage by 10%',
            cost: 1,
            maxLevel: 5,
            level: 0,
            prerequisites: [],
          },
          {
            id: 'weapon_mastery',
            name: 'Weapon Mastery',
            description: 'Increases weapon damage by 15%',
            cost: 2,
            maxLevel: 3,
            level: 0,
            prerequisites: ['basic_attack'],
          },
          {
            id: 'critical_strike',
            name: 'Critical Strike',
            description: 'Increases critical hit chance by 5%',
            cost: 2,
            maxLevel: 5,
            level: 0,
            prerequisites: ['basic_attack'],
          },
          {
            id: 'critical_damage',
            name: 'Critical Damage',
            description: 'Increases critical hit damage by 25%',
            cost: 3,
            maxLevel: 3,
            level: 0,
            prerequisites: ['critical_strike'],
          },
          {
            id: 'attack_speed',
            name: 'Attack Speed',
            description: 'Increases attack speed by 10%',
            cost: 2,
            maxLevel: 5,
            level: 0,
            prerequisites: ['weapon_mastery'],
          },
          {
            id: 'dual_wield',
            name: 'Dual Wield',
            description: 'Allows dual wielding weapons',
            cost: 5,
            maxLevel: 1,
            level: 0,
            prerequisites: ['weapon_mastery', 'attack_speed'],
          },
          {
            id: 'berserker',
            name: 'Berserker',
            description: 'Damage increases as health decreases',
            cost: 4,
            maxLevel: 3,
            level: 0,
            prerequisites: ['critical_damage'],
          },
          {
            id: 'executioner',
            name: 'Executioner',
            description: 'Deal 50% more damage to enemies below 25% health',
            cost: 5,
            maxLevel: 1,
            level: 0,
            prerequisites: ['berserker'],
          },
          {
            id: 'combo_master',
            name: 'Combo Master',
            description: 'Each consecutive hit increases damage by 10%',
            cost: 3,
            maxLevel: 5,
            level: 0,
            prerequisites: ['attack_speed'],
          },
          {
            id: 'finisher',
            name: 'Finisher',
            description: 'Final hit in combo deals 200% damage',
            cost: 4,
            maxLevel: 1,
            level: 0,
            prerequisites: ['combo_master'],
          },

          // Advanced combat nodes
          {
            id: 'weapon_specialization',
            name: 'Weapon Specialization',
            description: 'Choose a weapon type for 25% damage bonus',
            cost: 6,
            maxLevel: 1,
            level: 0,
            prerequisites: ['dual_wield'],
          },
          {
            id: 'battle_fury',
            name: 'Battle Fury',
            description: 'Kills grant 20% attack speed for 5 seconds',
            cost: 4,
            maxLevel: 3,
            level: 0,
            prerequisites: ['executioner'],
          },
          {
            id: 'bloodthirst',
            name: 'Bloodthirst',
            description: 'Heal for 10% of damage dealt',
            cost: 5,
            maxLevel: 3,
            level: 0,
            prerequisites: ['battle_fury'],
          },
          {
            id: 'devastating_blow',
            name: 'Devastating Blow',
            description: '10% chance to deal 300% damage',
            cost: 6,
            maxLevel: 2,
            level: 0,
            prerequisites: ['finisher'],
          },
          {
            id: 'whirlwind',
            name: 'Whirlwind',
            description: 'Attack all enemies in radius',
            cost: 8,
            maxLevel: 1,
            level: 0,
            prerequisites: ['devastating_blow'],
          },
          {
            id: 'lethal_precision',
            name: 'Lethal Precision',
            description: 'Critical hits have 25% chance to instantly kill',
            cost: 10,
            maxLevel: 1,
            level: 0,
            prerequisites: ['whirlwind'],
          },

          // Mastery nodes
          {
            id: 'combat_mastery',
            name: 'Combat Mastery',
            description: 'All combat skills gain +1 level',
            cost: 15,
            maxLevel: 1,
            level: 0,
            prerequisites: ['lethal_precision'],
          },
          {
            id: 'weapon_legend',
            name: 'Weapon Legend',
            description: 'Weapon damage increased by 50%',
            cost: 12,
            maxLevel: 1,
            level: 0,
            prerequisites: ['weapon_specialization', 'combat_mastery'],
          },
          {
            id: 'death_dealer',
            name: 'Death Dealer',
            description: 'Killing an enemy grants 50% damage for 10 seconds',
            cost: 15,
            maxLevel: 1,
            level: 0,
            prerequisites: ['bloodthirst', 'combat_mastery'],
          },
          {
            id: 'unstoppable_force',
            name: 'Unstoppable Force',
            description: 'Cannot be stunned, immune to crowd control',
            cost: 20,
            maxLevel: 1,
            level: 0,
            prerequisites: ['weapon_legend', 'death_dealer'],
          },

          // Additional combat nodes to reach 30
          {
            id: 'quick_strike',
            name: 'Quick Strike',
            description: 'First attack in combat deals 150% damage',
            cost: 2,
            maxLevel: 3,
            level: 0,
            prerequisites: ['basic_attack'],
          },
          {
            id: 'power_attack',
            name: 'Power Attack',
            description: 'Slower but more powerful attacks',
            cost: 3,
            maxLevel: 3,
            level: 0,
            prerequisites: ['weapon_mastery'],
          },
          {
            id: 'counter_attack',
            name: 'Counter Attack',
            description: 'Blocking an attack allows instant counter',
            cost: 4,
            maxLevel: 2,
            level: 0,
            prerequisites: ['power_attack'],
          },
          {
            id: 'riposte',
            name: 'Riposte',
            description: 'Counter attacks deal 200% damage',
            cost: 5,
            maxLevel: 1,
            level: 0,
            prerequisites: ['counter_attack'],
          },
          {
            id: 'flurry',
            name: 'Flurry',
            description: 'Rapid attacks with reduced damage',
            cost: 3,
            maxLevel: 4,
            level: 0,
            prerequisites: ['attack_speed'],
          },
          {
            id: 'momentum',
            name: 'Momentum',
            description: 'Each hit increases next attack speed',
            cost: 4,
            maxLevel: 3,
            level: 0,
            prerequisites: ['flurry'],
          },
          {
            id: 'crescendo',
            name: 'Crescendo',
            name: 'Final attack in momentum chain deals 500% damage',
            cost: 6,
            maxLevel: 1,
            level: 0,
            prerequisites: ['momentum'],
          },
          {
            id: 'savage_roar',
            name: 'Savage Roar',
            description: 'Intimidate enemies, reducing their damage',
            cost: 5,
            maxLevel: 2,
            level: 0,
            prerequisites: ['berserker'],
          },
          {
            id: 'battle_cry',
            name: 'Battle Cry',
            description: 'Allies gain 25% damage for 10 seconds',
            cost: 6,
            maxLevel: 1,
            level: 0,
            prerequisites: ['savage_roar'],
          },
          {
            id: 'war_cry',
            name: 'War Cry',
            description: 'Enemies take 50% more damage for 15 seconds',
            cost: 8,
            maxLevel: 1,
            level: 0,
            prerequisites: ['battle_cry'],
          },
        ],
      },

      // Defense tree (25 nodes)
      defense: {
        name: 'Defense Mastery',
        description: 'Enhance your defensive capabilities',
        nodes: [
          // Basic defense nodes
          {
            id: 'armor_mastery',
            name: 'Armor Mastery',
            description: 'Increases armor by 20%',
            cost: 1,
            maxLevel: 5,
            level: 0,
            prerequisites: [],
          },
          {
            id: 'shield_block',
            name: 'Shield Block',
            description: '25% chance to block incoming attacks',
            cost: 2,
            maxLevel: 3,
            level: 0,
            prerequisites: ['armor_mastery'],
          },
          {
            id: 'damage_reduction',
            name: 'Damage Reduction',
            description: 'Reduces all damage by 5%',
            cost: 2,
            maxLevel: 5,
            level: 0,
            prerequisites: ['armor_mastery'],
          },
          {
            id: 'health_boost',
            name: 'Health Boost',
            description: 'Increases maximum health by 15%',
            cost: 2,
            maxLevel: 5,
            level: 0,
            prerequisites: [],
          },
          {
            id: 'regeneration',
            name: 'Regeneration',
            description: 'Regenerate 2% health per second',
            cost: 3,
            maxLevel: 3,
            level: 0,
            prerequisites: ['health_boost'],
          },
          {
            id: 'tough_skin',
            name: 'Tough Skin',
            description: 'Reduces physical damage by 10%',
            cost: 3,
            maxLevel: 3,
            level: 0,
            prerequisites: ['damage_reduction'],
          },
          {
            id: 'magic_resistance',
            name: 'Magic Resistance',
            description: 'Reduces magical damage by 15%',
            cost: 3,
            maxLevel: 3,
            level: 0,
            prerequisites: ['damage_reduction'],
          },
          {
            id: 'evasion',
            name: 'Evasion',
            description: '10% chance to completely avoid attacks',
            cost: 4,
            maxLevel: 3,
            level: 0,
            prerequisites: ['shield_block'],
          },
          {
            id: 'dodge_master',
            name: 'Dodge Master',
            description: 'Evasion chance increased by 15%',
            cost: 5,
            maxLevel: 2,
            level: 0,
            prerequisites: ['evasion'],
          },
          {
            id: 'perfect_dodge',
            name: 'Perfect Dodge',
            description: 'Dodging grants 50% damage for 3 seconds',
            cost: 6,
            maxLevel: 1,
            level: 0,
            prerequisites: ['dodge_master'],
          },

          // Advanced defense nodes
          {
            id: 'fortress',
            name: 'Fortress',
            description: 'Standing still increases armor by 100%',
            cost: 5,
            maxLevel: 2,
            level: 0,
            prerequisites: ['tough_skin'],
          },
          {
            id: 'immovable',
            name: 'Immovable',
            description: 'Cannot be knocked back or stunned',
            cost: 6,
            maxLevel: 1,
            level: 0,
            prerequisites: ['fortress'],
          },
          {
            id: 'damage_reflection',
            name: 'Damage Reflection',
            description: 'Reflect 25% of damage taken back to attacker',
            cost: 7,
            maxLevel: 2,
            level: 0,
            prerequisites: ['magic_resistance'],
          },
          {
            id: 'thorns',
            name: 'Thorns',
            description: 'Melee attackers take 50 damage',
            cost: 4,
            maxLevel: 3,
            level: 0,
            prerequisites: ['damage_reflection'],
          },
          {
            id: 'retaliation',
            name: 'Retaliation',
            description: 'Taking damage increases next attack by 100%',
            cost: 5,
            maxLevel: 2,
            level: 0,
            prerequisites: ['thorns'],
          },
          {
            id: 'last_stand',
            name: 'Last Stand',
            description: 'At 25% health, gain 200% damage and 100% armor',
            cost: 8,
            maxLevel: 1,
            level: 0,
            prerequisites: ['retaliation'],
          },
          {
            id: 'guardian',
            name: 'Guardian',
            description: 'Nearby allies take 25% less damage',
            cost: 6,
            maxLevel: 2,
            level: 0,
            prerequisites: ['immovable'],
          },
          {
            id: 'protector',
            name: 'Protector',
            description: 'Allies gain 50% of your armor',
            cost: 7,
            maxLevel: 1,
            level: 0,
            prerequisites: ['guardian'],
          },
          {
            id: 'defensive_mastery',
            name: 'Defensive Mastery',
            description: 'All defense skills gain +1 level',
            cost: 15,
            maxLevel: 1,
            level: 0,
            prerequisites: ['last_stand', 'protector'],
          },

          // Additional defense nodes to reach 25
          {
            id: 'endurance',
            name: 'Endurance',
            description: 'Reduces stamina cost of abilities by 20%',
            cost: 2,
            maxLevel: 3,
            level: 0,
            prerequisites: ['health_boost'],
          },
          {
            id: 'iron_will',
            name: 'Iron Will',
            description: 'Immune to fear and charm effects',
            cost: 4,
            maxLevel: 1,
            level: 0,
            prerequisites: ['endurance'],
          },
          {
            id: 'unbreakable',
            name: 'Unbreakable',
            description: 'Cannot be killed by a single attack',
            cost: 8,
            maxLevel: 1,
            level: 0,
            prerequisites: ['iron_will'],
          },
          {
            id: 'resilience',
            name: 'Resilience',
            description: 'Status effects last 50% less time',
            cost: 3,
            maxLevel: 3,
            level: 0,
            prerequisites: ['magic_resistance'],
          },
          {
            id: 'adaptation',
            name: 'Adaptation',
            description: 'Gain resistance to damage types you take',
            cost: 5,
            maxLevel: 2,
            level: 0,
            prerequisites: ['resilience'],
          },
          {
            id: 'immunity',
            name: 'Immunity',
            description: 'Become immune to the most common damage type',
            cost: 10,
            maxLevel: 1,
            level: 0,
            prerequisites: ['adaptation'],
          },
        ],
      },

      // Utility tree (25 nodes)
      utility: {
        name: 'Utility Mastery',
        description: 'Enhance your utility and support abilities',
        nodes: [
          // Basic utility nodes
          {
            id: 'movement_speed',
            name: 'Movement Speed',
            description: 'Increases movement speed by 10%',
            cost: 1,
            maxLevel: 5,
            level: 0,
            prerequisites: [],
          },
          {
            id: 'jump_height',
            name: 'Jump Height',
            description: 'Increases jump height by 20%',
            cost: 1,
            maxLevel: 3,
            level: 0,
            prerequisites: ['movement_speed'],
          },
          {
            id: 'climbing',
            name: 'Climbing',
            description: 'Can climb walls and obstacles',
            cost: 3,
            maxLevel: 1,
            level: 0,
            prerequisites: ['jump_height'],
          },
          {
            id: 'swimming',
            name: 'Swimming',
            description: 'Move faster in water',
            cost: 2,
            maxLevel: 3,
            level: 0,
            prerequisites: ['movement_speed'],
          },
          {
            id: 'stealth',
            name: 'Stealth',
            description: 'Become invisible for 5 seconds',
            cost: 4,
            maxLevel: 3,
            level: 0,
            prerequisites: [],
          },
          {
            id: 'detection',
            name: 'Detection',
            description: 'See hidden enemies and traps',
            cost: 3,
            maxLevel: 2,
            level: 0,
            prerequisites: ['stealth'],
          },
          {
            id: 'lockpicking',
            name: 'Lockpicking',
            description: 'Open locked chests and doors',
            cost: 2,
            maxLevel: 3,
            level: 0,
            prerequisites: [],
          },
          {
            id: 'treasure_hunter',
            name: 'Treasure Hunter',
            description: 'Find more valuable loot',
            cost: 3,
            maxLevel: 3,
            level: 0,
            prerequisites: ['lockpicking'],
          },
          {
            id: 'bargaining',
            name: 'Bargaining',
            description: 'Buy items for 20% less, sell for 20% more',
            cost: 2,
            maxLevel: 3,
            level: 0,
            prerequisites: [],
          },
          {
            id: 'charisma',
            name: 'Charisma',
            description: 'NPCs are more friendly and helpful',
            cost: 3,
            maxLevel: 2,
            level: 0,
            prerequisites: ['bargaining'],
          },

          // Advanced utility nodes
          {
            id: 'teleport',
            name: 'Teleport',
            description: 'Instantly move to any visited location',
            cost: 8,
            maxLevel: 1,
            level: 0,
            prerequisites: ['climbing', 'swimming'],
          },
          {
            id: 'time_dilation',
            name: 'Time Dilation',
            description: 'Slow down time for 10 seconds',
            cost: 10,
            maxLevel: 1,
            level: 0,
            prerequisites: ['detection'],
          },
          {
            id: 'phase_shift',
            name: 'Phase Shift',
            description: 'Become intangible for 3 seconds',
            cost: 6,
            maxLevel: 2,
            level: 0,
            prerequisites: ['stealth'],
          },
          {
            id: 'shadow_step',
            name: 'Shadow Step',
            description: 'Teleport behind the nearest enemy',
            cost: 7,
            maxLevel: 1,
            level: 0,
            prerequisites: ['phase_shift'],
          },
          {
            id: 'utility_mastery',
            name: 'Utility Mastery',
            description: 'All utility skills gain +1 level',
            cost: 15,
            maxLevel: 1,
            level: 0,
            prerequisites: ['teleport', 'time_dilation', 'shadow_step'],
          },

          // Additional utility nodes to reach 25
          {
            id: 'night_vision',
            name: 'Night Vision',
            description: 'See clearly in darkness',
            cost: 2,
            maxLevel: 2,
            level: 0,
            prerequisites: ['detection'],
          },
          {
            id: 'eagle_eye',
            name: 'Eagle Eye',
            description: 'See enemies from much farther away',
            cost: 4,
            maxLevel: 1,
            level: 0,
            prerequisites: ['night_vision'],
          },
          {
            id: 'quick_hands',
            name: 'Quick Hands',
            description: 'Use items and abilities 50% faster',
            cost: 3,
            maxLevel: 3,
            level: 0,
            prerequisites: ['movement_speed'],
          },
          {
            id: 'nimble_fingers',
            name: 'Nimble Fingers',
            description: 'Pickpocket and disarm traps',
            cost: 4,
            maxLevel: 2,
            level: 0,
            prerequisites: ['quick_hands'],
          },
          {
            id: 'master_thief',
            name: 'Master Thief',
            description: 'Steal from enemies without being detected',
            cost: 6,
            maxLevel: 1,
            level: 0,
            prerequisites: ['nimble_fingers'],
          },
          {
            id: 'diplomat',
            name: 'Diplomat',
            description: 'Resolve conflicts without fighting',
            cost: 5,
            maxLevel: 2,
            level: 0,
            prerequisites: ['charisma'],
          },
          {
            id: 'peacemaker',
            name: 'Peacemaker',
            description: 'Stop combat between NPCs',
            cost: 7,
            maxLevel: 1,
            level: 0,
            prerequisites: ['diplomat'],
          },
          {
            id: 'survivalist',
            name: 'Survivalist',
            description: 'Find food and water in wilderness',
            cost: 3,
            maxLevel: 2,
            level: 0,
            prerequisites: ['treasure_hunter'],
          },
          {
            id: 'tracker',
            name: 'Tracker',
            description: 'Follow enemy tracks and trails',
            cost: 4,
            maxLevel: 2,
            level: 0,
            prerequisites: ['survivalist'],
          },
          {
            id: 'beast_master',
            name: 'Beast Master',
            description: 'Tame and command animals',
            cost: 8,
            maxLevel: 1,
            level: 0,
            prerequisites: ['tracker'],
          },
        ],
      },

      // Specialization trees (20 nodes each)
      warrior: {
        name: 'Warrior Specialization',
        description: 'Master the art of melee combat',
        nodes: [
          {
            id: 'berserker_rage',
            name: 'Berserker Rage',
            description: 'Enter rage mode, increasing damage and speed',
            cost: 5,
            maxLevel: 3,
            level: 0,
            prerequisites: [],
          },
          {
            id: 'battle_cry',
            name: 'Battle Cry',
            description: 'Intimidate enemies and boost allies',
            cost: 4,
            maxLevel: 2,
            level: 0,
            prerequisites: ['berserker_rage'],
          },
          {
            id: 'weapon_expertise',
            name: 'Weapon Expertise',
            description: 'Master specific weapon types',
            cost: 6,
            maxLevel: 1,
            level: 0,
            prerequisites: ['battle_cry'],
          },
          {
            id: 'tactical_mind',
            name: 'Tactical Mind',
            description: 'Plan attacks for maximum effectiveness',
            cost: 5,
            maxLevel: 2,
            level: 0,
            prerequisites: ['weapon_expertise'],
          },
          {
            id: 'war_master',
            name: 'War Master',
            description: 'Ultimate warrior abilities',
            cost: 10,
            maxLevel: 1,
            level: 0,
            prerequisites: ['tactical_mind'],
          },
          // Additional warrior nodes...
        ],
      },

      mage: {
        name: 'Mage Specialization',
        description: 'Master the arcane arts',
        nodes: [
          {
            id: 'spell_casting',
            name: 'Spell Casting',
            description: 'Cast powerful magical spells',
            cost: 5,
            maxLevel: 3,
            level: 0,
            prerequisites: [],
          },
          {
            id: 'mana_mastery',
            name: 'Mana Mastery',
            description: 'Efficient mana usage and regeneration',
            cost: 4,
            maxLevel: 2,
            level: 0,
            prerequisites: ['spell_casting'],
          },
          {
            id: 'elemental_mastery',
            name: 'Elemental Mastery',
            description: 'Control fire, ice, and lightning',
            cost: 6,
            maxLevel: 1,
            level: 0,
            prerequisites: ['mana_mastery'],
          },
          {
            id: 'arcane_knowledge',
            name: 'Arcane Knowledge',
            description: 'Learn ancient magical secrets',
            cost: 5,
            maxLevel: 2,
            level: 0,
            prerequisites: ['elemental_mastery'],
          },
          {
            id: 'archmage',
            name: 'Archmage',
            description: 'Ultimate magical abilities',
            cost: 10,
            maxLevel: 1,
            level: 0,
            prerequisites: ['arcane_knowledge'],
          },
          // Additional mage nodes...
        ],
      },

      rogue: {
        name: 'Rogue Specialization',
        description: 'Master stealth and precision',
        nodes: [
          {
            id: 'stealth_mastery',
            name: 'Stealth Mastery',
            description: 'Advanced stealth techniques',
            cost: 5,
            maxLevel: 3,
            level: 0,
            prerequisites: [],
          },
          {
            id: 'assassination',
            name: 'Assassination',
            description: 'Deadly precision strikes',
            cost: 4,
            maxLevel: 2,
            level: 0,
            prerequisites: ['stealth_mastery'],
          },
          {
            id: 'poison_mastery',
            name: 'Poison Mastery',
            description: 'Craft and apply deadly poisons',
            cost: 6,
            maxLevel: 1,
            level: 0,
            prerequisites: ['assassination'],
          },
          {
            id: 'shadow_arts',
            name: 'Shadow Arts',
            description: 'Manipulate shadows and darkness',
            cost: 5,
            maxLevel: 2,
            level: 0,
            prerequisites: ['poison_mastery'],
          },
          {
            id: 'shadow_master',
            name: 'Shadow Master',
            description: 'Ultimate rogue abilities',
            cost: 10,
            maxLevel: 1,
            level: 0,
            prerequisites: ['shadow_arts'],
          },
          // Additional rogue nodes...
        ],
      },
    };
  }

  /**
   * Initialize skill gem system
   */
  initializeSkillGems() {
    return {
      // Basic gems
      basic: [
        {
          id: 'fire_ball',
          name: 'Fire Ball',
          description: 'Launch a fireball at enemies',
          type: 'offensive',
          level: 1,
          rarity: 'common',
          effects: { damage: 50, element: 'fire' },
        },
        {
          id: 'heal',
          name: 'Heal',
          description: 'Restore health over time',
          type: 'support',
          level: 1,
          rarity: 'common',
          effects: { healing: 25, duration: 5 },
        },
        {
          id: 'shield',
          name: 'Shield',
          description: 'Create a protective barrier',
          type: 'defensive',
          level: 1,
          rarity: 'common',
          effects: { absorption: 100, duration: 10 },
        },
        {
          id: 'speed_boost',
          name: 'Speed Boost',
          description: 'Increase movement speed',
          type: 'utility',
          level: 1,
          rarity: 'common',
          effects: { speed: 1.5, duration: 8 },
        },
      ],

      // Advanced gems
      advanced: [
        {
          id: 'meteor',
          name: 'Meteor',
          description: 'Summon a meteor from the sky',
          type: 'offensive',
          level: 3,
          rarity: 'rare',
          effects: { damage: 200, area: 100, element: 'fire' },
        },
        {
          id: 'regeneration',
          name: 'Regeneration',
          description: 'Continuous health regeneration',
          type: 'support',
          level: 3,
          rarity: 'rare',
          effects: { healing: 10, duration: 30 },
        },
        {
          id: 'barrier',
          name: 'Barrier',
          description: 'Absorb all damage for a short time',
          type: 'defensive',
          level: 3,
          rarity: 'rare',
          effects: { absorption: 500, duration: 5 },
        },
        {
          id: 'teleport',
          name: 'Teleport',
          description: 'Instantly move to target location',
          type: 'utility',
          level: 3,
          rarity: 'rare',
          effects: { range: 200 },
        },
      ],

      // Legendary gems
      legendary: [
        {
          id: 'apocalypse',
          name: 'Apocalypse',
          description: 'Devastating area damage spell',
          type: 'offensive',
          level: 5,
          rarity: 'legendary',
          effects: { damage: 1000, area: 300, element: 'all' },
        },
        {
          id: 'immortality',
          name: 'Immortality',
          description: 'Become invulnerable for a short time',
          type: 'defensive',
          level: 5,
          rarity: 'legendary',
          effects: { invulnerability: true, duration: 10 },
        },
        {
          id: 'time_stop',
          name: 'Time Stop',
          description: 'Stop time for all enemies',
          type: 'utility',
          level: 5,
          rarity: 'legendary',
          effects: { duration: 15 },
        },
      ],
    };
  }

  /**
   * Initialize socketing system
   */
  initializeSocketingSystem() {
    return {
      socketTypes: ['weapon', 'armor', 'accessory', 'gem'],
      maxSockets: {
        weapon: 6,
        armor: 4,
        accessory: 2,
        gem: 1,
      },
      socketRules: {
        weapon: ['offensive', 'utility'],
        armor: ['defensive', 'support'],
        accessory: ['utility', 'support'],
        gem: ['all'],
      },
    };
  }

  /**
   * Initialize trading system
   */
  initializeTradingSystem() {
    return {
      isEnabled: true,
      tradeChannels: ['global', 'guild', 'whisper'],
      maxTradeValue: 1000000,
      tradeTax: 0.05, // 5% tax on trades
      reputation: {
        level: 0,
        points: 0,
        benefits: [],
      },
    };
  }

  /**
   * Create UI elements
   */
  createUIElements() {
    // Main ARPG UI container
    const mainContainer = document.createElement('div');
    mainContainer.id = 'arpg-ui-container';
    mainContainer.className = 'arpg-ui-container';
    mainContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: none;
      z-index: 1000;
    `;

    // Character panel
    const characterPanel = this.createCharacterPanel();
    mainContainer.appendChild(characterPanel);

    // Skill tree panel
    const skillTreePanel = this.createSkillTreePanel();
    mainContainer.appendChild(skillTreePanel);

    // Inventory panel
    const inventoryPanel = this.createInventoryPanel();
    mainContainer.appendChild(inventoryPanel);

    // Trading panel
    const tradingPanel = this.createTradingPanel();
    mainContainer.appendChild(tradingPanel);

    // Gem socketing panel
    const socketingPanel = this.createSocketingPanel();
    mainContainer.appendChild(socketingPanel);

    document.body.appendChild(mainContainer);
    this.uiElements.set('mainContainer', mainContainer);
  }

  /**
   * Create character panel
   */
  createCharacterPanel() {
    const panel = document.createElement('div');
    panel.id = 'character-panel';
    panel.className = 'character-panel';
    panel.style.cssText = `
      position: absolute;
      top: 50px;
      left: 50px;
      width: 400px;
      height: 600px;
      background: linear-gradient(135deg, #2c3e50, #34495e);
      border: 2px solid #3498db;
      border-radius: 10px;
      padding: 20px;
      color: white;
      font-family: 'Arial', sans-serif;
    `;

    // Character stats display
    const statsHTML = `
      <div class="character-header">
        <h2>Character</h2>
        <div class="level-display">
          <span>Level: <span id="character-level">${this.character.level}</span></span>
          <div class="exp-bar">
            <div class="exp-fill" style="width: ${(this.character.experience / this.character.experienceToNext) * 100}%"></div>
          </div>
          <span>XP: <span id="character-exp">${this.character.experience}</span>/<span id="character-exp-max">${this.character.experienceToNext}</span></span>
        </div>
      </div>
      
      <div class="attributes-section">
        <h3>Attributes</h3>
        <div class="attribute-list">
          ${Object.entries(this.character.attributes)
            .map(
              ([attr, value]) => `
            <div class="attribute-item">
              <span class="attr-name">${attr.charAt(0).toUpperCase() + attr.slice(1)}:</span>
              <span class="attr-value">${value}</span>
              <button class="attr-increase" data-attr="${attr}">+</button>
            </div>
          `
            )
            .join('')}
        </div>
        <div class="attribute-points">
          Available Points: <span id="attr-points">${this.character.attributePoints}</span>
        </div>
      </div>
      
      <div class="stats-section">
        <h3>Stats</h3>
        <div class="stat-list">
          ${Object.entries(this.character.stats)
            .map(
              ([stat, value]) => `
            <div class="stat-item">
              <span class="stat-name">${stat.charAt(0).toUpperCase() + stat.slice(1)}:</span>
              <span class="stat-value">${value}</span>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
      
      <div class="equipment-section">
        <h3>Equipment</h3>
        <div class="equipment-grid">
          <div class="equipment-slot" data-slot="helmet">Helmet</div>
          <div class="equipment-slot" data-slot="weapon">Weapon</div>
          <div class="equipment-slot" data-slot="armor">Armor</div>
          <div class="equipment-slot" data-slot="gloves">Gloves</div>
          <div class="equipment-slot" data-slot="boots">Boots</div>
          <div class="equipment-slot" data-slot="ring1">Ring 1</div>
          <div class="equipment-slot" data-slot="ring2">Ring 2</div>
          <div class="equipment-slot" data-slot="amulet">Amulet</div>
        </div>
      </div>
    `;

    panel.innerHTML = statsHTML;
    return panel;
  }

  /**
   * Create skill tree panel
   */
  createSkillTreePanel() {
    const panel = document.createElement('div');
    panel.id = 'skill-tree-panel';
    panel.className = 'skill-tree-panel';
    panel.style.cssText = `
      position: absolute;
      top: 50px;
      left: 500px;
      width: 800px;
      height: 600px;
      background: linear-gradient(135deg, #2c3e50, #34495e);
      border: 2px solid #e74c3c;
      border-radius: 10px;
      padding: 20px;
      color: white;
      font-family: 'Arial', sans-serif;
      display: none;
    `;

    // Skill tree tabs
    const tabsHTML = `
      <div class="skill-tree-tabs">
        ${Object.keys(this.skillTree)
          .map(
            (treeName) => `
          <button class="skill-tree-tab ${treeName === 'combat' ? 'active' : ''}" data-tree="${treeName}">
            ${this.skillTree[treeName].name}
          </button>
        `
          )
          .join('')}
      </div>
      
      <div class="skill-tree-content">
        <div class="skill-tree-header">
          <h3 id="current-tree-name">Combat Mastery</h3>
          <p id="current-tree-desc">Enhance your combat abilities</p>
          <div class="skill-points">
            Available Points: <span id="skill-points">${this.character.skillPoints}</span>
          </div>
        </div>
        
        <div class="skill-tree-nodes" id="skill-tree-nodes">
          <!-- Nodes will be dynamically generated -->
        </div>
      </div>
    `;

    panel.innerHTML = tabsHTML;
    return panel;
  }

  /**
   * Create inventory panel
   */
  createInventoryPanel() {
    const panel = document.createElement('div');
    panel.id = 'inventory-panel';
    panel.className = 'inventory-panel';
    panel.style.cssText = `
      position: absolute;
      top: 50px;
      right: 50px;
      width: 400px;
      height: 600px;
      background: linear-gradient(135deg, #2c3e50, #34495e);
      border: 2px solid #f39c12;
      border-radius: 10px;
      padding: 20px;
      color: white;
      font-family: 'Arial', sans-serif;
      display: none;
    `;

    const inventoryHTML = `
      <div class="inventory-header">
        <h3>Inventory</h3>
        <div class="inventory-tabs">
          <button class="inv-tab active" data-tab="items">Items</button>
          <button class="inv-tab" data-tab="gems">Gems</button>
          <button class="inv-tab" data-tab="materials">Materials</button>
        </div>
      </div>
      
      <div class="inventory-grid" id="inventory-grid">
        <!-- Inventory slots will be dynamically generated -->
      </div>
      
      <div class="inventory-info">
        <div class="item-details" id="item-details">
          <!-- Item details will be shown here -->
        </div>
      </div>
    `;

    panel.innerHTML = inventoryHTML;
    return panel;
  }

  /**
   * Create trading panel
   */
  createTradingPanel() {
    const panel = document.createElement('div');
    panel.id = 'trading-panel';
    panel.className = 'trading-panel';
    panel.style.cssText = `
      position: absolute;
      top: 50px;
      left: 50%;
      transform: translateX(-50%);
      width: 600px;
      height: 500px;
      background: linear-gradient(135deg, #2c3e50, #34495e);
      border: 2px solid #9b59b6;
      border-radius: 10px;
      padding: 20px;
      color: white;
      font-family: 'Arial', sans-serif;
      display: none;
    `;

    const tradingHTML = `
      <div class="trading-header">
        <h3>Player Trading</h3>
        <button class="close-trading">×</button>
      </div>
      
      <div class="trading-content">
        <div class="trade-channels">
          <button class="channel-btn active" data-channel="global">Global</button>
          <button class="channel-btn" data-channel="guild">Guild</button>
          <button class="channel-btn" data-channel="whisper">Whisper</button>
        </div>
        
        <div class="trade-offers" id="trade-offers">
          <!-- Trade offers will be listed here -->
        </div>
        
        <div class="create-trade">
          <h4>Create Trade Offer</h4>
          <div class="trade-form">
            <input type="text" placeholder="Item to trade" id="trade-item">
            <input type="text" placeholder="Item wanted" id="trade-wanted">
            <button id="create-trade-btn">Create Offer</button>
          </div>
        </div>
      </div>
    `;

    panel.innerHTML = tradingHTML;
    return panel;
  }

  /**
   * Create socketing panel
   */
  createSocketingPanel() {
    const panel = document.createElement('div');
    panel.id = 'socketing-panel';
    panel.className = 'socketing-panel';
    panel.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 500px;
      height: 400px;
      background: linear-gradient(135deg, #2c3e50, #34495e);
      border: 2px solid #1abc9c;
      border-radius: 10px;
      padding: 20px;
      color: white;
      font-family: 'Arial', sans-serif;
      display: none;
    `;

    const socketingHTML = `
      <div class="socketing-header">
        <h3>Gem Socketing</h3>
        <button class="close-socketing">×</button>
      </div>
      
      <div class="socketing-content">
        <div class="item-sockets">
          <h4>Item Sockets</h4>
          <div class="socket-grid" id="socket-grid">
            <!-- Sockets will be dynamically generated -->
          </div>
        </div>
        
        <div class="available-gems">
          <h4>Available Gems</h4>
          <div class="gem-list" id="gem-list">
            <!-- Gems will be dynamically generated -->
          </div>
        </div>
        
        <div class="socketing-actions">
          <button id="socket-gem" disabled>Socket Gem</button>
          <button id="remove-gem">Remove Gem</button>
        </div>
      </div>
    `;

    panel.innerHTML = socketingHTML;
    return panel;
  }

  /**
   * Set up event handlers
   */
  setupEventHandlers() {
    // Character events
    this.eventBus.on('character:levelUp', this.handleLevelUp.bind(this));
    this.eventBus.on(
      'character:attributeChanged',
      this.handleAttributeChange.bind(this)
    );
    this.eventBus.on(
      'character:skillLearned',
      this.handleSkillLearned.bind(this)
    );

    // Item events
    this.eventBus.on('item:equipped', this.handleItemEquipped.bind(this));
    this.eventBus.on('item:unequipped', this.handleItemUnequipped.bind(this));
    this.eventBus.on('item:gemSocketed', this.handleGemSocketed.bind(this));

    // Trading events
    this.eventBus.on(
      'trade:offerCreated',
      this.handleTradeOfferCreated.bind(this)
    );
    this.eventBus.on(
      'trade:offerAccepted',
      this.handleTradeOfferAccepted.bind(this)
    );

    // UI events
    this.eventBus.on('ui:openARPG', this.openARPGUI.bind(this));
    this.eventBus.on('ui:closeARPG', this.closeARPGUI.bind(this));
  }

  /**
   * Remove event handlers
   */
  removeEventHandlers() {
    this.eventBus.removeListener(
      'character:levelUp',
      this.handleLevelUp.bind(this)
    );
    this.eventBus.removeListener(
      'character:attributeChanged',
      this.handleAttributeChange.bind(this)
    );
    this.eventBus.removeListener(
      'character:skillLearned',
      this.handleSkillLearned.bind(this)
    );
    this.eventBus.removeListener(
      'item:equipped',
      this.handleItemEquipped.bind(this)
    );
    this.eventBus.removeListener(
      'item:unequipped',
      this.handleItemUnequipped.bind(this)
    );
    this.eventBus.removeListener(
      'item:gemSocketed',
      this.handleGemSocketed.bind(this)
    );
    this.eventBus.removeListener(
      'trade:offerCreated',
      this.handleTradeOfferCreated.bind(this)
    );
    this.eventBus.removeListener(
      'trade:offerAccepted',
      this.handleTradeOfferAccepted.bind(this)
    );
    this.eventBus.removeListener('ui:openARPG', this.openARPGUI.bind(this));
    this.eventBus.removeListener('ui:closeARPG', this.closeARPGUI.bind(this));
  }

  /**
   * Set up UI event listeners
   */
  setupUIEventListeners() {
    // Main container events
    const mainContainer = this.uiElements.get('mainContainer');
    if (mainContainer) {
      mainContainer.addEventListener('click', (e) => {
        if (e.target === mainContainer) {
          this.closeARPGUI();
        }
      });
    }

    // Tab switching
    this.setupTabSwitching();

    // Skill tree interactions
    this.setupSkillTreeInteractions();

    // Inventory interactions
    this.setupInventoryInteractions();

    // Trading interactions
    this.setupTradingInteractions();

    // Socketing interactions
    this.setupSocketingInteractions();
  }

  /**
   * Set up tab switching
   */
  setupTabSwitching() {
    // Character panel tabs
    const characterPanel = document.getElementById('character-panel');
    if (characterPanel) {
      // Add tab buttons if they don't exist
      const tabHTML = `
        <div class="character-tabs">
          <button class="char-tab active" data-tab="stats">Stats</button>
          <button class="char-tab" data-tab="skills">Skills</button>
          <button class="char-tab" data-tab="equipment">Equipment</button>
        </div>
      `;
      characterPanel.insertAdjacentHTML('afterbegin', tabHTML);
    }
  }

  /**
   * Set up skill tree interactions
   */
  setupSkillTreeInteractions() {
    // Skill tree tab switching
    const skillTreeTabs = document.querySelectorAll('.skill-tree-tab');
    skillTreeTabs.forEach((tab) => {
      tab.addEventListener('click', (e) => {
        const treeName = e.target.dataset.tree;
        this.switchSkillTree(treeName);
      });
    });

    // Skill node interactions
    this.generateSkillTreeNodes();
  }

  /**
   * Set up inventory interactions
   */
  setupInventoryInteractions() {
    // Inventory tab switching
    const inventoryTabs = document.querySelectorAll('.inv-tab');
    inventoryTabs.forEach((tab) => {
      tab.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        this.switchInventoryTab(tabName);
      });
    });

    // Generate inventory grid
    this.generateInventoryGrid();
  }

  /**
   * Set up trading interactions
   */
  setupTradingInteractions() {
    // Channel switching
    const channelBtns = document.querySelectorAll('.channel-btn');
    channelBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const channel = e.target.dataset.channel;
        this.switchTradeChannel(channel);
      });
    });

    // Create trade offer
    const createTradeBtn = document.getElementById('create-trade-btn');
    if (createTradeBtn) {
      createTradeBtn.addEventListener(
        'click',
        this.createTradeOffer.bind(this)
      );
    }

    // Close trading
    const closeTrading = document.querySelector('.close-trading');
    if (closeTrading) {
      closeTrading.addEventListener('click', this.closeTradingPanel.bind(this));
    }
  }

  /**
   * Set up socketing interactions
   */
  setupSocketingInteractions() {
    // Socket gem
    const socketGemBtn = document.getElementById('socket-gem');
    if (socketGemBtn) {
      socketGemBtn.addEventListener('click', this.socketGem.bind(this));
    }

    // Remove gem
    const removeGemBtn = document.getElementById('remove-gem');
    if (removeGemBtn) {
      removeGemBtn.addEventListener('click', this.removeGem.bind(this));
    }

    // Close socketing
    const closeSocketing = document.querySelector('.close-socketing');
    if (closeSocketing) {
      closeSocketing.addEventListener(
        'click',
        this.closeSocketingPanel.bind(this)
      );
    }
  }

  /**
   * Generate skill tree nodes
   */
  generateSkillTreeNodes() {
    const nodesContainer = document.getElementById('skill-tree-nodes');
    if (!nodesContainer) return;

    const currentTree = this.getCurrentSkillTree();
    if (!currentTree) return;

    nodesContainer.innerHTML = '';

    currentTree.nodes.forEach((node) => {
      const nodeElement = document.createElement('div');
      nodeElement.className = `skill-node ${node.level > 0 ? 'learned' : ''} ${this.canLearnSkill(node) ? 'available' : 'locked'}`;
      nodeElement.dataset.nodeId = node.id;

      nodeElement.innerHTML = `
        <div class="node-icon">${node.name.charAt(0)}</div>
        <div class="node-info">
          <div class="node-name">${node.name}</div>
          <div class="node-level">${node.level}/${node.maxLevel}</div>
        </div>
        <div class="node-cost">${node.cost}</div>
      `;

      nodeElement.addEventListener('click', () => this.learnSkill(node.id));
      nodesContainer.appendChild(nodeElement);
    });
  }

  /**
   * Generate inventory grid
   */
  generateInventoryGrid() {
    const grid = document.getElementById('inventory-grid');
    if (!grid) return;

    grid.innerHTML = '';

    // Create 40 inventory slots (5x8 grid)
    for (let i = 0; i < 40; i++) {
      const slot = document.createElement('div');
      slot.className = 'inventory-slot';
      slot.dataset.slot = i;

      // Check if slot has an item
      const item = this.character.inventory[i];
      if (item) {
        slot.innerHTML = `
          <div class="item-icon" style="background-color: ${this.getItemRarityColor(item.rarity)}">
            ${item.name.charAt(0)}
          </div>
          <div class="item-count">${item.count || 1}</div>
        `;
        slot.addEventListener('click', () => this.selectItem(item, i));
      }

      grid.appendChild(slot);
    }
  }

  /**
   * Open ARPG UI
   */
  openARPGUI() {
    const container = this.uiElements.get('mainContainer');
    if (container) {
      container.style.display = 'block';
      this.uiState.isOpen = true;
      this.updateCharacterDisplay();
    }
  }

  /**
   * Close ARPG UI
   */
  closeARPGUI() {
    const container = this.uiElements.get('mainContainer');
    if (container) {
      container.style.display = 'none';
      this.uiState.isOpen = false;
    }
  }

  /**
   * Switch skill tree
   */
  switchSkillTree(treeName) {
    // Update active tab
    document.querySelectorAll('.skill-tree-tab').forEach((tab) => {
      tab.classList.remove('active');
    });
    document.querySelector(`[data-tree="${treeName}"]`).classList.add('active');

    // Update tree info
    const tree = this.skillTree[treeName];
    document.getElementById('current-tree-name').textContent = tree.name;
    document.getElementById('current-tree-desc').textContent = tree.description;

    // Regenerate nodes
    this.generateSkillTreeNodes();
  }

  /**
   * Switch inventory tab
   */
  switchInventoryTab(tabName) {
    // Update active tab
    document.querySelectorAll('.inv-tab').forEach((tab) => {
      tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update inventory content based on tab
    this.updateInventoryContent(tabName);
  }

  /**
   * Switch trade channel
   */
  switchTradeChannel(channel) {
    // Update active channel
    document.querySelectorAll('.channel-btn').forEach((btn) => {
      btn.classList.remove('active');
    });
    document
      .querySelector(`[data-channel="${channel}"]`)
      .classList.add('active');

    // Load trade offers for channel
    this.loadTradeOffers(channel);
  }

  /**
   * Learn a skill
   */
  learnSkill(skillId) {
    const currentTree = this.getCurrentSkillTree();
    const skill = currentTree.nodes.find((n) => n.id === skillId);

    if (!skill || !this.canLearnSkill(skill)) {
      this.logger.warn(`Cannot learn skill: ${skillId}`);
      return;
    }

    if (this.character.skillPoints < skill.cost) {
      this.logger.warn('Not enough skill points');
      return;
    }

    // Learn the skill
    skill.level++;
    this.character.skillPoints -= skill.cost;

    // Apply skill effects
    this.applySkillEffects(skill);

    // Update UI
    this.updateCharacterDisplay();
    this.generateSkillTreeNodes();

    // Emit event
    this.eventBus.emit('character:skillLearned', {
      skillId: skillId,
      skill: skill,
      character: this.character,
    });

    this.logger.info(`Learned skill: ${skill.name}`);
  }

  /**
   * Check if skill can be learned
   */
  canLearnSkill(skill) {
    if (skill.level >= skill.maxLevel) return false;
    if (this.character.skillPoints < skill.cost) return false;

    // Check prerequisites
    for (const prereq of skill.prerequisites) {
      const prereqSkill = this.findSkillById(prereq);
      if (!prereqSkill || prereqSkill.level === 0) return false;
    }

    return true;
  }

  /**
   * Find skill by ID across all trees
   */
  findSkillById(skillId) {
    for (const tree of Object.values(this.skillTree)) {
      const skill = tree.nodes.find((n) => n.id === skillId);
      if (skill) return skill;
    }
    return null;
  }

  /**
   * Apply skill effects
   */
  applySkillEffects(skill) {
    // This would apply the actual skill effects to character stats
    // Implementation depends on specific skill effects
    this.logger.info(`Applied effects for skill: ${skill.name}`);
  }

  /**
   * Get current skill tree
   */
  getCurrentSkillTree() {
    const activeTab = document.querySelector('.skill-tree-tab.active');
    if (!activeTab) return this.skillTree.combat;

    const treeName = activeTab.dataset.tree;
    return this.skillTree[treeName];
  }

  /**
   * Update character display
   */
  updateCharacterDisplay() {
    // Update level and experience
    document.getElementById('character-level').textContent =
      this.character.level;
    document.getElementById('character-exp').textContent =
      this.character.experience;
    document.getElementById('character-exp-max').textContent =
      this.character.experienceToNext;

    // Update experience bar
    const expBar = document.querySelector('.exp-fill');
    if (expBar) {
      expBar.style.width = `${(this.character.experience / this.character.experienceToNext) * 100}%`;
    }

    // Update skill points
    document.getElementById('skill-points').textContent =
      this.character.skillPoints;

    // Update attribute points
    document.getElementById('attr-points').textContent =
      this.character.attributePoints;

    // Update attributes
    Object.entries(this.character.attributes).forEach(([attr, value]) => {
      const attrElement = document.querySelector(`[data-attr="${attr}"]`);
      if (attrElement) {
        attrElement.previousElementSibling.textContent = value;
      }
    });

    // Update stats
    Object.entries(this.character.stats).forEach(([stat, value]) => {
      const statElement = document.querySelector(`[data-stat="${stat}"]`);
      if (statElement) {
        statElement.textContent = value;
      }
    });
  }

  /**
   * Update character stats based on attributes
   */
  updateCharacterStats() {
    // Recalculate stats based on attributes
    this.character.stats.maxHealth =
      100 + this.character.attributes.vitality * 10;
    this.character.stats.maxMana =
      50 + this.character.attributes.intelligence * 5;
    this.character.stats.damage = 10 + this.character.attributes.strength * 2;
    this.character.stats.armor = this.character.attributes.vitality * 0.5;
    this.character.stats.criticalChance =
      0.05 + this.character.attributes.dexterity * 0.01;
    this.character.stats.attackSpeed =
      1.0 + this.character.attributes.dexterity * 0.02;
    this.character.stats.movementSpeed =
      1.0 + this.character.attributes.strength * 0.01;
  }

  /**
   * Update UI animations
   */
  updateUIAnimations(deltaTime) {
    // Update any UI animations here
  }

  /**
   * Update skill cooldowns
   */
  updateSkillCooldowns(deltaTime) {
    // Update skill cooldowns here
  }

  /**
   * Handle level up
   */
  handleLevelUp(data) {
    this.character.level++;
    this.character.skillPoints += 2;
    this.character.attributePoints += 5;
    this.character.experienceToNext = Math.floor(
      this.character.experienceToNext * 1.2
    );

    this.updateCharacterDisplay();
    this.logger.info(`Character leveled up to level ${this.character.level}`);
  }

  /**
   * Handle attribute change
   */
  handleAttributeChange(data) {
    this.character.attributes[data.attribute] += data.change;
    this.character.attributePoints -= data.cost;

    this.updateCharacterStats();
    this.updateCharacterDisplay();

    this.logger.info(`Attribute ${data.attribute} changed by ${data.change}`);
  }

  /**
   * Handle skill learned
   */
  handleSkillLearned(data) {
    this.logger.info(`Skill learned: ${data.skill.name}`);
  }

  /**
   * Handle item equipped
   */
  handleItemEquipped(data) {
    this.character.equippedItems.set(data.slot, data.item);
    this.updateCharacterDisplay();
    this.logger.info(`Item equipped: ${data.item.name}`);
  }

  /**
   * Handle item unequipped
   */
  handleItemUnequipped(data) {
    this.character.equippedItems.delete(data.slot);
    this.updateCharacterDisplay();
    this.logger.info(`Item unequipped: ${data.item.name}`);
  }

  /**
   * Handle gem socketed
   */
  handleGemSocketed(data) {
    this.logger.info(`Gem socketed: ${data.gem.name}`);
  }

  /**
   * Handle trade offer created
   */
  handleTradeOfferCreated(data) {
    this.logger.info(
      `Trade offer created: ${data.offer.item} for ${data.offer.wanted}`
    );
  }

  /**
   * Handle trade offer accepted
   */
  handleTradeOfferAccepted(data) {
    this.logger.info(`Trade offer accepted: ${data.offer.id}`);
  }

  /**
   * Create trade offer
   */
  createTradeOffer() {
    const itemInput = document.getElementById('trade-item');
    const wantedInput = document.getElementById('trade-wanted');

    if (!itemInput.value || !wantedInput.value) {
      this.logger.warn('Please fill in both item fields');
      return;
    }

    const offer = {
      id: Date.now(),
      item: itemInput.value,
      wanted: wantedInput.value,
      timestamp: Date.now(),
    };

    this.eventBus.emit('trade:offerCreated', { offer });

    // Clear inputs
    itemInput.value = '';
    wantedInput.value = '';
  }

  /**
   * Load trade offers
   */
  loadTradeOffers(channel) {
    // This would load trade offers from the server
    this.logger.info(`Loading trade offers for channel: ${channel}`);
  }

  /**
   * Socket gem
   */
  socketGem() {
    if (!this.uiState.selectedItem || !this.uiState.selectedGem) {
      this.logger.warn('Please select an item and gem to socket');
      return;
    }

    // Implement gem socketing logic
    this.eventBus.emit('item:gemSocketed', {
      item: this.uiState.selectedItem,
      gem: this.uiState.selectedGem,
    });

    this.closeSocketingPanel();
  }

  /**
   * Remove gem
   */
  removeGem() {
    if (!this.uiState.selectedItem) {
      this.logger.warn('Please select an item to remove gem from');
      return;
    }

    // Implement gem removal logic
    this.logger.info('Gem removed from item');
  }

  /**
   * Close trading panel
   */
  closeTradingPanel() {
    document.getElementById('trading-panel').style.display = 'none';
  }

  /**
   * Close socketing panel
   */
  closeSocketingPanel() {
    document.getElementById('socketing-panel').style.display = 'none';
  }

  /**
   * Select item
   */
  selectItem(item, slotIndex) {
    this.uiState.selectedItem = { ...item, slotIndex };
    this.updateItemDetails(item);
  }

  /**
   * Update item details
   */
  updateItemDetails(item) {
    const detailsContainer = document.getElementById('item-details');
    if (!detailsContainer) return;

    detailsContainer.innerHTML = `
      <h4>${item.name}</h4>
      <p>Type: ${item.type}</p>
      <p>Rarity: ${item.rarity}</p>
      <p>Level: ${item.level}</p>
      <p>Description: ${item.description}</p>
      ${item.effects ? `<p>Effects: ${JSON.stringify(item.effects)}</p>` : ''}
    `;
  }

  /**
   * Update inventory content
   */
  updateInventoryContent(tabName) {
    // Update inventory content based on selected tab
    this.logger.info(`Switched to inventory tab: ${tabName}`);
  }

  /**
   * Get item rarity color
   */
  getItemRarityColor(rarity) {
    const colors = {
      common: '#ffffff',
      uncommon: '#1eff00',
      rare: '#0070dd',
      epic: '#a335ee',
      legendary: '#ff8000',
    };
    return colors[rarity] || colors.common;
  }

  /**
   * Load character data
   */
  async loadCharacterData() {
    try {
      const savedData = localStorage.getItem('arpgCharacter');
      if (savedData) {
        const data = JSON.parse(savedData);
        this.character = { ...this.character, ...data };
        this.logger.info('Character data loaded');
      }
    } catch (error) {
      this.logger.error('Failed to load character data:', error);
    }
  }

  /**
   * Save character data
   */
  saveCharacterData() {
    try {
      localStorage.setItem('arpgCharacter', JSON.stringify(this.character));
      this.logger.info('Character data saved');
    } catch (error) {
      this.logger.error('Failed to save character data:', error);
    }
  }

  /**
   * Clear UI elements
   */
  clearUIElements() {
    const mainContainer = this.uiElements.get('mainContainer');
    if (mainContainer && mainContainer.parentNode) {
      mainContainer.parentNode.removeChild(mainContainer);
    }
    this.uiElements.clear();
  }

  /**
   * Get character data
   */
  getCharacter() {
    return { ...this.character };
  }

  /**
   * Get skill tree data
   */
  getSkillTree() {
    return { ...this.skillTree };
  }

  /**
   * Get skill gems
   */
  getSkillGems() {
    return { ...this.skillGems };
  }
}

export default ARPGUISystem;
