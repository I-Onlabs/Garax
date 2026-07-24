/**
 * ItemizationSystem.js - Advanced Item and Loot Generation System
 *
 * This system handles:
 * - Item generation with random modifiers
 * - Rarity system and affix generation
 * - Item socketing and gem integration
 * - Loot tables and drop rates
 * - Item enhancement and crafting
 * - Set items and unique properties
 */

export class ItemizationSystem {
  constructor(dependencies = {}) {
    // Dependency injection
    this.eventBus = dependencies.eventBus;
    this.logger = dependencies.logger;
    this.config = dependencies.config;

    // Validate required dependencies
    if (!this.eventBus) {
      throw new Error('ItemizationSystem requires eventBus dependency');
    }
    if (!this.logger) {
      throw new Error('ItemizationSystem requires logger dependency');
    }

    // Item generation state
    this.itemState = {
      generatedItems: new Map(),
      itemTemplates: new Map(),
      affixDatabase: new Map(),
      setItems: new Map(),
      uniqueItems: new Map(),
      craftingRecipes: new Map(),
    };

    // Item configuration
    this.itemConfig = {
      maxAffixes: {
        common: 1,
        uncommon: 2,
        rare: 4,
        epic: 6,
        legendary: 8,
        unique: 10,
      },
      affixWeights: {
        common: 100,
        uncommon: 50,
        rare: 25,
        epic: 10,
        legendary: 5,
        unique: 1,
      },
      socketChances: {
        common: 0.1,
        uncommon: 0.2,
        rare: 0.3,
        epic: 0.4,
        legendary: 0.6,
        unique: 0.8,
      },
    };

    // Initialize item systems
    this.initializeItemTemplates();
    this.initializeAffixDatabase();
    this.initializeSetItems();
    this.initializeUniqueItems();
    this.initializeCraftingRecipes();

    // Event handlers
    this.setupEventHandlers();

    this.logger.info('ItemizationSystem initialized');
  }

  /**
   * Initialize the system
   */
  async initialize() {
    this.logger.info('Initializing ItemizationSystem...');

    // Load item data from storage
    await this.loadItemData();

    this.logger.info('ItemizationSystem initialized successfully');
  }

  /**
   * Cleanup the system
   */
  cleanup() {
    this.logger.info('Cleaning up ItemizationSystem...');

    // Save item data
    this.saveItemData();

    // Clear item state
    this.itemState.generatedItems.clear();

    // Remove event listeners
    this.removeEventHandlers();

    this.logger.info('ItemizationSystem cleaned up');
  }

  /**
   * Update the system
   */
  update(deltaTime, gameState) {
    // Update item effects
    this.updateItemEffects(deltaTime);

    // Update crafting timers
    this.updateCraftingTimers(deltaTime);
  }

  /**
   * Initialize item templates
   */
  initializeItemTemplates() {
    // Weapon templates
    this.itemState.itemTemplates.set('sword', {
      name: 'Sword',
      type: 'weapon',
      slot: 'main_hand',
      baseStats: {
        damage: { min: 10, max: 20 },
        attackSpeed: 1.0,
        range: 1.2,
      },
      requirements: {
        level: 1,
        strength: 10,
      },
      allowedAffixes: [
        'damage',
        'attack_speed',
        'critical_chance',
        'critical_damage',
        'elemental_damage',
      ],
      socketTypes: ['weapon'],
      maxSockets: 6,
    });

    this.itemState.itemTemplates.set('bow', {
      name: 'Bow',
      type: 'weapon',
      slot: 'main_hand',
      baseStats: {
        damage: { min: 8, max: 16 },
        attackSpeed: 1.2,
        range: 3.0,
      },
      requirements: {
        level: 1,
        dexterity: 12,
      },
      allowedAffixes: [
        'damage',
        'attack_speed',
        'critical_chance',
        'critical_damage',
        'elemental_damage',
        'piercing',
      ],
      socketTypes: ['weapon'],
      maxSockets: 6,
    });

    this.itemState.itemTemplates.set('staff', {
      name: 'Staff',
      type: 'weapon',
      slot: 'main_hand',
      baseStats: {
        damage: { min: 6, max: 12 },
        attackSpeed: 0.8,
        range: 1.5,
      },
      requirements: {
        level: 1,
        intelligence: 15,
      },
      allowedAffixes: [
        'damage',
        'spell_power',
        'mana',
        'mana_regeneration',
        'elemental_damage',
        'spell_critical',
      ],
      socketTypes: ['weapon'],
      maxSockets: 6,
    });

    // Armor templates
    this.itemState.itemTemplates.set('helmet', {
      name: 'Helmet',
      type: 'armor',
      slot: 'head',
      baseStats: {
        armor: 5,
        health: 20,
      },
      requirements: {
        level: 1,
      },
      allowedAffixes: [
        'armor',
        'health',
        'mana',
        'resistance',
        'critical_chance',
        'experience_gain',
      ],
      socketTypes: ['armor'],
      maxSockets: 4,
    });

    this.itemState.itemTemplates.set('chestplate', {
      name: 'Chestplate',
      type: 'armor',
      slot: 'chest',
      baseStats: {
        armor: 15,
        health: 50,
      },
      requirements: {
        level: 1,
      },
      allowedAffixes: [
        'armor',
        'health',
        'mana',
        'resistance',
        'damage_reduction',
        'health_regeneration',
      ],
      socketTypes: ['armor'],
      maxSockets: 4,
    });

    this.itemState.itemTemplates.set('boots', {
      name: 'Boots',
      type: 'armor',
      slot: 'feet',
      baseStats: {
        armor: 3,
        movementSpeed: 1.1,
      },
      requirements: {
        level: 1,
      },
      allowedAffixes: [
        'armor',
        'movement_speed',
        'health',
        'resistance',
        'stamina',
        'jump_height',
      ],
      socketTypes: ['armor'],
      maxSockets: 2,
    });

    // Accessory templates
    this.itemState.itemTemplates.set('ring', {
      name: 'Ring',
      type: 'accessory',
      slot: 'ring',
      baseStats: {
        health: 10,
        mana: 10,
      },
      requirements: {
        level: 1,
      },
      allowedAffixes: [
        'health',
        'mana',
        'damage',
        'armor',
        'resistance',
        'critical_chance',
        'experience_gain',
      ],
      socketTypes: ['accessory'],
      maxSockets: 2,
    });

    this.itemState.itemTemplates.set('amulet', {
      name: 'Amulet',
      type: 'accessory',
      slot: 'neck',
      baseStats: {
        health: 15,
        mana: 15,
      },
      requirements: {
        level: 1,
      },
      allowedAffixes: [
        'health',
        'mana',
        'damage',
        'armor',
        'resistance',
        'critical_chance',
        'experience_gain',
        'luck',
      ],
      socketTypes: ['accessory'],
      maxSockets: 2,
    });
  }

  /**
   * Initialize affix database
   */
  initializeAffixDatabase() {
    // Prefix affixes
    this.itemState.affixDatabase.set('mighty', {
      name: 'Mighty',
      type: 'prefix',
      rarity: 'common',
      stats: { damage: { min: 5, max: 10 } },
      level: 1,
      weight: 50,
    });

    this.itemState.affixDatabase.set('sharp', {
      name: 'Sharp',
      type: 'prefix',
      rarity: 'common',
      stats: { critical_chance: { min: 0.02, max: 0.05 } },
      level: 1,
      weight: 40,
    });

    this.itemState.affixDatabase.set('sturdy', {
      name: 'Sturdy',
      type: 'prefix',
      rarity: 'common',
      stats: { armor: { min: 3, max: 8 } },
      level: 1,
      weight: 45,
    });

    this.itemState.affixDatabase.set('vital', {
      name: 'Vital',
      type: 'prefix',
      rarity: 'common',
      stats: { health: { min: 15, max: 30 } },
      level: 1,
      weight: 35,
    });

    this.itemState.affixDatabase.set('arcane', {
      name: 'Arcane',
      type: 'prefix',
      rarity: 'uncommon',
      stats: { mana: { min: 20, max: 40 }, spell_power: { min: 5, max: 12 } },
      level: 5,
      weight: 25,
    });

    this.itemState.affixDatabase.set('legendary', {
      name: 'Legendary',
      type: 'prefix',
      rarity: 'legendary',
      stats: {
        damage: { min: 25, max: 50 },
        critical_chance: { min: 0.1, max: 0.2 },
        critical_damage: { min: 0.5, max: 1.0 },
      },
      level: 20,
      weight: 2,
    });

    // Suffix affixes
    this.itemState.affixDatabase.set('of_power', {
      name: 'of Power',
      type: 'suffix',
      rarity: 'common',
      stats: { damage: { min: 3, max: 7 } },
      level: 1,
      weight: 40,
    });

    this.itemState.affixDatabase.set('of_protection', {
      name: 'of Protection',
      type: 'suffix',
      rarity: 'common',
      stats: { armor: { min: 2, max: 5 } },
      level: 1,
      weight: 35,
    });

    this.itemState.affixDatabase.set('of_vitality', {
      name: 'of Vitality',
      type: 'suffix',
      rarity: 'common',
      stats: { health: { min: 10, max: 20 } },
      level: 1,
      weight: 30,
    });

    this.itemState.affixDatabase.set('of_swiftness', {
      name: 'of Swiftness',
      type: 'suffix',
      rarity: 'uncommon',
      stats: {
        attack_speed: { min: 0.1, max: 0.2 },
        movement_speed: { min: 0.05, max: 0.1 },
      },
      level: 5,
      weight: 20,
    });

    this.itemState.affixDatabase.set('of_destruction', {
      name: 'of Destruction',
      type: 'suffix',
      rarity: 'epic',
      stats: {
        damage: { min: 15, max: 30 },
        critical_damage: { min: 0.3, max: 0.6 },
      },
      level: 15,
      weight: 8,
    });

    this.itemState.affixDatabase.set('of_immortality', {
      name: 'of Immortality',
      type: 'suffix',
      rarity: 'legendary',
      stats: {
        health: { min: 100, max: 200 },
        health_regeneration: { min: 5, max: 10 },
        damage_reduction: { min: 0.1, max: 0.2 },
      },
      level: 25,
      weight: 1,
    });

    // Elemental affixes
    this.itemState.affixDatabase.set('flaming', {
      name: 'Flaming',
      type: 'prefix',
      rarity: 'uncommon',
      stats: { fire_damage: { min: 8, max: 15 } },
      level: 3,
      weight: 20,
    });

    this.itemState.affixDatabase.set('freezing', {
      name: 'Freezing',
      type: 'prefix',
      rarity: 'uncommon',
      stats: { ice_damage: { min: 8, max: 15 } },
      level: 3,
      weight: 20,
    });

    this.itemState.affixDatabase.set('shocking', {
      name: 'Shocking',
      type: 'prefix',
      rarity: 'uncommon',
      stats: { lightning_damage: { min: 8, max: 15 } },
      level: 3,
      weight: 20,
    });

    this.itemState.affixDatabase.set('poisonous', {
      name: 'Poisonous',
      type: 'prefix',
      rarity: 'uncommon',
      stats: { poison_damage: { min: 6, max: 12 } },
      level: 3,
      weight: 20,
    });
  }

  /**
   * Initialize set items
   */
  initializeSetItems() {
    this.itemState.setItems.set('warrior_set', {
      name: "Warrior's Set",
      pieces: ['helmet', 'chestplate', 'boots', 'gloves'],
      bonuses: {
        2: { damage: 20, armor: 10 },
        3: { health: 50, critical_chance: 0.05 },
        4: { damage: 50, armor: 25, health: 100 },
      },
      items: {
        helmet: {
          name: "Warrior's Helm",
          baseStats: { armor: 8, health: 30 },
          setBonus: 'warrior_set',
        },
        chestplate: {
          name: "Warrior's Plate",
          baseStats: { armor: 20, health: 60 },
          setBonus: 'warrior_set',
        },
        boots: {
          name: "Warrior's Boots",
          baseStats: { armor: 5, movementSpeed: 1.1 },
          setBonus: 'warrior_set',
        },
        gloves: {
          name: "Warrior's Gauntlets",
          baseStats: { armor: 6, damage: 5 },
          setBonus: 'warrior_set',
        },
      },
    });

    this.itemState.setItems.set('mage_set', {
      name: "Mage's Set",
      pieces: ['hat', 'robe', 'boots', 'gloves'],
      bonuses: {
        2: { mana: 40, spell_power: 15 },
        3: { mana_regeneration: 2, spell_critical: 0.1 },
        4: { mana: 100, spell_power: 40, spell_critical: 0.2 },
      },
      items: {
        hat: {
          name: "Mage's Hat",
          baseStats: { mana: 25, spell_power: 8 },
          setBonus: 'mage_set',
        },
        robe: {
          name: "Mage's Robe",
          baseStats: { mana: 50, spell_power: 15 },
          setBonus: 'mage_set',
        },
        boots: {
          name: "Mage's Boots",
          baseStats: { mana: 15, movementSpeed: 1.05 },
          setBonus: 'mage_set',
        },
        gloves: {
          name: "Mage's Gloves",
          baseStats: { mana: 20, spell_power: 10 },
          setBonus: 'mage_set',
        },
      },
    });
  }

  /**
   * Initialize unique items
   */
  initializeUniqueItems() {
    this.itemState.uniqueItems.set('excalibur', {
      name: 'Excalibur',
      type: 'weapon',
      slot: 'main_hand',
      rarity: 'unique',
      level: 30,
      baseStats: {
        damage: { min: 50, max: 100 },
        attackSpeed: 1.2,
        range: 1.5,
      },
      uniqueStats: {
        damage: 50,
        critical_chance: 0.15,
        critical_damage: 1.0,
        light_damage: 25,
      },
      uniqueProperties: [
        'Chance to cast Light Beam on critical hit',
        'Increases all light damage by 50%',
        'Grants immunity to darkness effects',
      ],
      requirements: {
        level: 30,
        strength: 25,
        dexterity: 20,
      },
      maxSockets: 8,
    });

    this.itemState.uniqueItems.set('crown_of_kings', {
      name: 'Crown of Kings',
      type: 'armor',
      slot: 'head',
      rarity: 'unique',
      level: 25,
      baseStats: {
        armor: 15,
        health: 100,
        mana: 50,
      },
      uniqueStats: {
        health: 100,
        mana: 50,
        experience_gain: 0.25,
        gold_find: 0.5,
      },
      uniqueProperties: [
        'Increases experience gain by 25%',
        'Increases gold find by 50%',
        'Grants +1 to all attributes',
      ],
      requirements: {
        level: 25,
      },
      maxSockets: 6,
    });

    this.itemState.uniqueItems.set('ring_of_power', {
      name: 'Ring of Power',
      type: 'accessory',
      slot: 'ring',
      rarity: 'unique',
      level: 20,
      baseStats: {
        health: 50,
        mana: 50,
      },
      uniqueStats: {
        damage: 30,
        armor: 20,
        health: 50,
        mana: 50,
        critical_chance: 0.1,
        critical_damage: 0.5,
      },
      uniqueProperties: [
        'Increases all damage by 30%',
        'Increases all resistances by 25%',
        'Grants immunity to status effects',
      ],
      requirements: {
        level: 20,
      },
      maxSockets: 4,
    });
  }

  /**
   * Initialize crafting recipes
   */
  initializeCraftingRecipes() {
    this.itemState.craftingRecipes.set('health_potion', {
      name: 'Health Potion',
      type: 'consumable',
      ingredients: [
        { item: 'healing_herb', quantity: 2 },
        { item: 'water', quantity: 1 },
      ],
      result: {
        item: 'health_potion',
        quantity: 1,
      },
      level: 1,
      time: 5000,
    });

    this.itemState.craftingRecipes.set('iron_sword', {
      name: 'Iron Sword',
      type: 'weapon',
      ingredients: [
        { item: 'iron_ore', quantity: 3 },
        { item: 'wood', quantity: 1 },
      ],
      result: {
        item: 'iron_sword',
        quantity: 1,
      },
      level: 5,
      time: 30000,
    });

    this.itemState.craftingRecipes.set('magic_ring', {
      name: 'Magic Ring',
      type: 'accessory',
      ingredients: [
        { item: 'gold_ore', quantity: 2 },
        { item: 'magic_crystal', quantity: 1 },
        { item: 'enchantment_scroll', quantity: 1 },
      ],
      result: {
        item: 'magic_ring',
        quantity: 1,
      },
      level: 10,
      time: 60000,
    });
  }

  /**
   * Set up event handlers
   */
  setupEventHandlers() {
    // Item events
    this.eventBus.on('item:generate', this.generateItem.bind(this));
    this.eventBus.on('item:identify', this.identifyItem.bind(this));
    this.eventBus.on('item:enhance', this.enhanceItem.bind(this));
    this.eventBus.on('item:socket', this.socketItem.bind(this));

    // Crafting events
    this.eventBus.on('crafting:start', this.startCrafting.bind(this));
    this.eventBus.on('crafting:complete', this.completeCrafting.bind(this));

    // Loot events
    this.eventBus.on('loot:drop', this.dropLoot.bind(this));
    this.eventBus.on('loot:pickup', this.pickupLoot.bind(this));
  }

  /**
   * Remove event handlers
   */
  removeEventHandlers() {
    this.eventBus.removeListener('item:generate', this.generateItem.bind(this));
    this.eventBus.removeListener('item:identify', this.identifyItem.bind(this));
    this.eventBus.removeListener('item:enhance', this.enhanceItem.bind(this));
    this.eventBus.removeListener('item:socket', this.socketItem.bind(this));
    this.eventBus.removeListener(
      'crafting:start',
      this.startCrafting.bind(this)
    );
    this.eventBus.removeListener(
      'crafting:complete',
      this.completeCrafting.bind(this)
    );
    this.eventBus.removeListener('loot:drop', this.dropLoot.bind(this));
    this.eventBus.removeListener('loot:pickup', this.pickupLoot.bind(this));
  }

  /**
   * Generate item
   */
  generateItem(data) {
    const { template, level, rarity, quality } = data;

    const itemTemplate = this.itemState.itemTemplates.get(template);
    if (!itemTemplate) {
      this.logger.error(`Unknown item template: ${template}`);
      return null;
    }

    const item = this.createItem(itemTemplate, level, rarity, quality);
    this.itemState.generatedItems.set(item.id, item);

    this.eventBus.emit('item:generated', {
      item,
      timestamp: Date.now(),
    });

    return item;
  }

  /**
   * Create item
   */
  createItem(template, level, rarity, quality) {
    const item = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      template: template.name,
      type: template.type,
      slot: template.slot,
      name: template.name,
      level: level || 1,
      rarity: rarity || this.determineRarity(),
      quality: quality || this.determineQuality(),
      baseStats: { ...template.baseStats },
      affixes: [],
      sockets: [],
      setBonus: null,
      uniqueProperties: [],
      requirements: { ...template.requirements },
      identified: false,
      enhanced: false,
      createdAt: Date.now(),
    };

    // Generate affixes
    this.generateAffixes(item, template);

    // Generate sockets
    this.generateSockets(item, template);

    // Apply set bonus if applicable
    this.applySetBonus(item);

    // Apply unique properties if unique item
    this.applyUniqueProperties(item);

    // Calculate final stats
    this.calculateFinalStats(item);

    return item;
  }

  /**
   * Determine item rarity
   */
  determineRarity() {
    const roll = Math.random() * 100;

    if (roll < 60) return 'common';
    if (roll < 85) return 'uncommon';
    if (roll < 95) return 'rare';
    if (roll < 99) return 'epic';
    return 'legendary';
  }

  /**
   * Determine item quality
   */
  determineQuality() {
    const roll = Math.random() * 100;

    if (roll < 40) return 'normal';
    if (roll < 70) return 'superior';
    if (roll < 90) return 'exceptional';
    return 'perfect';
  }

  /**
   * Generate affixes
   */
  generateAffixes(item, template) {
    const maxAffixes = this.itemConfig.maxAffixes[item.rarity];
    const affixCount = Math.floor(Math.random() * maxAffixes) + 1;

    const availableAffixes = this.getAvailableAffixes(
      template.allowedAffixes,
      item.level
    );

    for (let i = 0; i < affixCount; i++) {
      const affix = this.selectRandomAffix(availableAffixes, item.level);
      if (affix) {
        item.affixes.push(this.createAffixInstance(affix, item.level));
      }
    }
  }

  /**
   * Get available affixes
   */
  getAvailableAffixes(allowedAffixes, level) {
    const available = [];

    for (const [affixId, affix] of this.itemState.affixDatabase) {
      if (
        affix.level <= level &&
        this.isAffixCompatible(affix, allowedAffixes)
      ) {
        available.push(affix);
      }
    }

    return available;
  }

  /**
   * Check if affix is compatible
   */
  isAffixCompatible(affix, allowedAffixes) {
    // Check if affix stats are compatible with item type
    const affixStats = Object.keys(affix.stats);
    return affixStats.some((stat) => allowedAffixes.includes(stat));
  }

  /**
   * Select random affix
   */
  selectRandomAffix(availableAffixes, level) {
    if (availableAffixes.length === 0) return null;

    const totalWeight = availableAffixes.reduce(
      (sum, affix) => sum + affix.weight,
      0
    );
    let randomWeight = Math.random() * totalWeight;

    for (const affix of availableAffixes) {
      randomWeight -= affix.weight;
      if (randomWeight <= 0) {
        return affix;
      }
    }

    return availableAffixes[0];
  }

  /**
   * Create affix instance
   */
  createAffixInstance(affix, level) {
    const instance = {
      id: affix.name.toLowerCase().replace(/\s+/g, '_'),
      name: affix.name,
      type: affix.type,
      rarity: affix.rarity,
      stats: {},
    };

    // Generate stat values based on level
    Object.entries(affix.stats).forEach(([stat, range]) => {
      const min = range.min * (1 + level * 0.1);
      const max = range.max * (1 + level * 0.1);
      instance.stats[stat] = Math.floor(Math.random() * (max - min + 1)) + min;
    });

    return instance;
  }

  /**
   * Generate sockets
   */
  generateSockets(item, template) {
    const socketChance = this.itemConfig.socketChances[item.rarity];

    if (Math.random() < socketChance) {
      const socketCount = Math.floor(Math.random() * template.maxSockets) + 1;

      for (let i = 0; i < socketCount; i++) {
        item.sockets.push({
          id: `socket_${i}`,
          type: template.socketTypes[
            Math.floor(Math.random() * template.socketTypes.length)
          ],
          gem: null,
        });
      }
    }
  }

  /**
   * Apply set bonus
   */
  applySetBonus(item) {
    // Check if item is part of a set
    for (const [setId, setData] of this.itemState.setItems) {
      if (setData.items[item.template]) {
        item.setBonus = setId;
        break;
      }
    }
  }

  /**
   * Apply unique properties
   */
  applyUniqueProperties(item) {
    if (item.rarity === 'unique') {
      const uniqueItem = this.findUniqueItem(item.template);
      if (uniqueItem) {
        item.uniqueProperties = [...uniqueItem.uniqueProperties];
        item.uniqueStats = { ...uniqueItem.uniqueStats };
      }
    }
  }

  /**
   * Find unique item
   */
  findUniqueItem(template) {
    for (const [id, uniqueItem] of this.itemState.uniqueItems) {
      if (uniqueItem.name === template) {
        return uniqueItem;
      }
    }
    return null;
  }

  /**
   * Calculate final stats
   */
  calculateFinalStats(item) {
    item.finalStats = { ...item.baseStats };

    // Apply affix stats
    item.affixes.forEach((affix) => {
      Object.entries(affix.stats).forEach(([stat, value]) => {
        if (item.finalStats[stat]) {
          if (typeof item.finalStats[stat] === 'object') {
            item.finalStats[stat].min += value;
            item.finalStats[stat].max += value;
          } else {
            item.finalStats[stat] += value;
          }
        } else {
          item.finalStats[stat] = value;
        }
      });
    });

    // Apply unique stats
    if (item.uniqueStats) {
      Object.entries(item.uniqueStats).forEach(([stat, value]) => {
        if (item.finalStats[stat]) {
          if (typeof item.finalStats[stat] === 'object') {
            item.finalStats[stat].min += value;
            item.finalStats[stat].max += value;
          } else {
            item.finalStats[stat] += value;
          }
        } else {
          item.finalStats[stat] = value;
        }
      });
    }

    // Apply quality multiplier
    const qualityMultiplier = this.getQualityMultiplier(item.quality);
    Object.keys(item.finalStats).forEach((stat) => {
      if (typeof item.finalStats[stat] === 'number') {
        item.finalStats[stat] = Math.floor(
          item.finalStats[stat] * qualityMultiplier
        );
      } else if (typeof item.finalStats[stat] === 'object') {
        item.finalStats[stat].min = Math.floor(
          item.finalStats[stat].min * qualityMultiplier
        );
        item.finalStats[stat].max = Math.floor(
          item.finalStats[stat].max * qualityMultiplier
        );
      }
    });
  }

  /**
   * Get quality multiplier
   */
  getQualityMultiplier(quality) {
    const multipliers = {
      normal: 1.0,
      superior: 1.1,
      exceptional: 1.25,
      perfect: 1.5,
    };
    return multipliers[quality] || 1.0;
  }

  /**
   * Identify item
   */
  identifyItem(data) {
    const { itemId } = data;
    const item = this.itemState.generatedItems.get(itemId);

    if (!item) {
      this.logger.error(`Item not found: ${itemId}`);
      return;
    }

    item.identified = true;

    this.eventBus.emit('item:identified', {
      item,
      timestamp: Date.now(),
    });
  }

  /**
   * Enhance item
   */
  enhanceItem(data) {
    const { itemId, enhancementLevel } = data;
    const item = this.itemState.generatedItems.get(itemId);

    if (!item) {
      this.logger.error(`Item not found: ${itemId}`);
      return;
    }

    if (item.enhanced) {
      this.logger.warn('Item already enhanced');
      return;
    }

    // Apply enhancement bonuses
    const enhancementMultiplier = 1 + enhancementLevel * 0.1;
    Object.keys(item.finalStats).forEach((stat) => {
      if (typeof item.finalStats[stat] === 'number') {
        item.finalStats[stat] = Math.floor(
          item.finalStats[stat] * enhancementMultiplier
        );
      } else if (typeof item.finalStats[stat] === 'object') {
        item.finalStats[stat].min = Math.floor(
          item.finalStats[stat].min * enhancementMultiplier
        );
        item.finalStats[stat].max = Math.floor(
          item.finalStats[stat].max * enhancementMultiplier
        );
      }
    });

    item.enhanced = true;
    item.enhancementLevel = enhancementLevel;

    this.eventBus.emit('item:enhanced', {
      item,
      enhancementLevel,
      timestamp: Date.now(),
    });
  }

  /**
   * Socket item
   */
  socketItem(data) {
    const { itemId, socketId, gemId } = data;
    const item = this.itemState.generatedItems.get(itemId);

    if (!item) {
      this.logger.error(`Item not found: ${itemId}`);
      return;
    }

    const socket = item.sockets.find((s) => s.id === socketId);
    if (!socket) {
      this.logger.error(`Socket not found: ${socketId}`);
      return;
    }

    if (socket.gem) {
      this.logger.warn('Socket already has a gem');
      return;
    }

    // Socket the gem
    socket.gem = gemId;

    // Apply gem effects
    this.applyGemEffects(item, gemId);

    this.eventBus.emit('item:socketed', {
      item,
      socketId,
      gemId,
      timestamp: Date.now(),
    });
  }

  /**
   * Apply gem effects
   */
  applyGemEffects(item, gemId) {
    // This would apply the effects of the socketed gem
    // Implementation depends on gem system
    this.logger.info(`Applied gem effects: ${gemId}`);
  }

  /**
   * Start crafting
   */
  startCrafting(data) {
    const { recipeId, ingredients } = data;
    const recipe = this.itemState.craftingRecipes.get(recipeId);

    if (!recipe) {
      this.logger.error(`Recipe not found: ${recipeId}`);
      return;
    }

    // Check if player has required ingredients
    if (!this.hasRequiredIngredients(ingredients, recipe.ingredients)) {
      this.logger.warn('Missing required ingredients');
      return;
    }

    // Start crafting timer
    const craftingId = `crafting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const crafting = {
      id: craftingId,
      recipe: recipe,
      startTime: Date.now(),
      endTime: Date.now() + recipe.time,
      ingredients: ingredients,
      completed: false,
    };

    this.itemState.craftingRecipes.set(craftingId, crafting);

    this.eventBus.emit('crafting:started', {
      crafting,
      timestamp: Date.now(),
    });
  }

  /**
   * Complete crafting
   */
  completeCrafting(data) {
    const { craftingId } = data;
    const crafting = this.itemState.craftingRecipes.get(craftingId);

    if (!crafting) {
      this.logger.error(`Crafting not found: ${craftingId}`);
      return;
    }

    if (crafting.completed) {
      this.logger.warn('Crafting already completed');
      return;
    }

    crafting.completed = true;

    // Generate crafted item
    const item = this.generateItem({
      template: crafting.recipe.result.item,
      level: crafting.recipe.level,
    });

    this.eventBus.emit('crafting:completed', {
      crafting,
      item,
      timestamp: Date.now(),
    });
  }

  /**
   * Check if player has required ingredients
   */
  hasRequiredIngredients(playerIngredients, requiredIngredients) {
    for (const required of requiredIngredients) {
      const playerIngredient = playerIngredients.find(
        (ing) => ing.item === required.item
      );
      if (!playerIngredient || playerIngredient.quantity < required.quantity) {
        return false;
      }
    }
    return true;
  }

  /**
   * Drop loot
   */
  dropLoot(data) {
    const { position, lootTable, level } = data;

    const loot = this.generateLootFromTable(lootTable, level);

    this.eventBus.emit('loot:dropped', {
      loot,
      position,
      timestamp: Date.now(),
    });
  }

  /**
   * Generate loot from table
   */
  generateLootFromTable(lootTable, level) {
    const loot = [];

    for (const entry of lootTable) {
      if (Math.random() < entry.chance) {
        const item = this.generateItem({
          template: entry.item,
          level: level || entry.level,
          rarity: entry.rarity,
        });

        if (item) {
          loot.push({
            item: item,
            quantity: entry.quantity || 1,
            position: entry.position || { x: 0, y: 0 },
          });
        }
      }
    }

    return loot;
  }

  /**
   * Pickup loot
   */
  pickupLoot(data) {
    const { lootId } = data;

    this.eventBus.emit('loot:pickedUp', {
      lootId,
      timestamp: Date.now(),
    });
  }

  /**
   * Update item effects
   */
  updateItemEffects(deltaTime) {
    // Update any time-based item effects
  }

  /**
   * Update crafting timers
   */
  updateCraftingTimers(deltaTime) {
    for (const [craftingId, crafting] of this.itemState.craftingRecipes) {
      if (!crafting.completed && Date.now() >= crafting.endTime) {
        this.completeCrafting({ craftingId });
      }
    }
  }

  /**
   * Load item data
   */
  async loadItemData() {
    try {
      const savedData = localStorage.getItem('itemizationData');
      if (savedData) {
        const data = JSON.parse(savedData);
        // Restore item state
        this.logger.info('Item data loaded from storage');
      }
    } catch (error) {
      this.logger.error('Failed to load item data:', error);
    }
  }

  /**
   * Save item data
   */
  saveItemData() {
    try {
      const data = {
        generatedItems: Array.from(this.itemState.generatedItems.entries()),
        timestamp: Date.now(),
      };
      localStorage.setItem('itemizationData', JSON.stringify(data));
      this.logger.info('Item data saved to storage');
    } catch (error) {
      this.logger.error('Failed to save item data:', error);
    }
  }

  /**
   * Get item by ID
   */
  getItem(itemId) {
    return this.itemState.generatedItems.get(itemId);
  }

  /**
   * Get all items
   */
  getAllItems() {
    return Array.from(this.itemState.generatedItems.values());
  }

  /**
   * Get item templates
   */
  getItemTemplates() {
    return Array.from(this.itemState.itemTemplates.values());
  }

  /**
   * Get affix database
   */
  getAffixDatabase() {
    return Array.from(this.itemState.affixDatabase.values());
  }

  /**
   * Get set items
   */
  getSetItems() {
    return Array.from(this.itemState.setItems.values());
  }

  /**
   * Get unique items
   */
  getUniqueItems() {
    return Array.from(this.itemState.uniqueItems.values());
  }

  /**
   * Get crafting recipes
   */
  getCraftingRecipes() {
    return Array.from(this.itemState.craftingRecipes.values());
  }
}

export default ItemizationSystem;
