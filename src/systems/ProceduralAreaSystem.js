/**
 * ProceduralAreaSystem.js - Procedural Area and Dungeon Generation System
 *
 * This system handles:
 * - Procedural area generation
 * - Dungeon creation and layout
 * - Biome generation
 * - Loot placement
 * - Enemy spawning
 * - Exploration mechanics
 */

export class ProceduralAreaSystem {
  constructor(dependencies = {}) {
    // Dependency injection
    this.eventBus = dependencies.eventBus;
    this.logger = dependencies.logger;
    this.config = dependencies.config;

    // Validate required dependencies
    if (!this.eventBus) {
      throw new Error('ProceduralAreaSystem requires eventBus dependency');
    }
    if (!this.logger) {
      throw new Error('ProceduralAreaSystem requires logger dependency');
    }

    // Area generation state
    this.generationState = {
      currentArea: null,
      generatedAreas: new Map(),
      activeDungeons: new Map(),
      explorationData: new Map(),
      seed: Date.now(),
    };

    // Generation configuration
    this.generationConfig = {
      maxAreaSize: 2000,
      minAreaSize: 500,
      chunkSize: 100,
      maxDungeonDepth: 10,
      biomeTransitionSmoothness: 0.3,
      lootDensity: 0.1,
      enemyDensity: 0.05,
    };

    // Biome definitions
    this.biomes = this.initializeBiomes();

    // Dungeon templates
    this.dungeonTemplates = this.initializeDungeonTemplates();

    // Loot tables
    this.lootTables = this.initializeLootTables();

    // Enemy spawn tables
    this.enemySpawnTables = this.initializeEnemySpawnTables();

    // Event handlers
    this.setupEventHandlers();

    this.logger.info('ProceduralAreaSystem initialized');
  }

  /**
   * Initialize the system
   */
  async initialize() {
    this.logger.info('Initializing ProceduralAreaSystem...');

    // Set up random number generator with seed
    this.rng = this.createSeededRNG(this.generationState.seed);

    // Generate initial area
    await this.generateArea('starting_forest', 0, 0);

    this.logger.info('ProceduralAreaSystem initialized successfully');
  }

  /**
   * Cleanup the system
   */
  cleanup() {
    this.logger.info('Cleaning up ProceduralAreaSystem...');

    // Clear generated areas
    this.generationState.generatedAreas.clear();
    this.generationState.activeDungeons.clear();
    this.generationState.explorationData.clear();

    // Remove event listeners
    this.removeEventHandlers();

    this.logger.info('ProceduralAreaSystem cleaned up');
  }

  /**
   * Update the system
   */
  update(deltaTime, gameState) {
    // Update active dungeons
    this.updateActiveDungeons(deltaTime);

    // Update exploration data
    this.updateExplorationData(deltaTime);

    // Check for area transitions
    this.checkAreaTransitions(gameState);
  }

  /**
   * Initialize biomes
   */
  initializeBiomes() {
    return {
      forest: {
        name: 'Forest',
        description: 'A dense woodland with ancient trees',
        color: '#228B22',
        terrain: {
          ground: 'grass',
          obstacles: ['tree', 'rock', 'bush'],
          decorations: ['flower', 'mushroom', 'fallen_log'],
        },
        weather: {
          type: 'sunny',
          intensity: 0.5,
          effects: ['dappled_light', 'bird_sounds'],
        },
        loot: {
          common: ['herbs', 'berries', 'wood'],
          uncommon: ['rare_herbs', 'animal_pelt'],
          rare: ['magical_herbs', 'ancient_wood'],
        },
        enemies: ['goblin', 'wolf', 'spider'],
        ambientSounds: ['wind_through_trees', 'bird_chirping'],
        music: 'forest_ambient',
      },

      desert: {
        name: 'Desert',
        description: 'A vast expanse of sand and dunes',
        color: '#F4A460',
        terrain: {
          ground: 'sand',
          obstacles: ['cactus', 'rock_formation', 'sand_dune'],
          decorations: ['desert_flower', 'bone', 'ancient_ruins'],
        },
        weather: {
          type: 'hot',
          intensity: 0.8,
          effects: ['heat_haze', 'sand_storm'],
        },
        loot: {
          common: ['sand_crystal', 'desert_flower'],
          uncommon: ['ancient_coin', 'desert_artifact'],
          rare: ['pharaoh_treasure', 'sand_magic_crystal'],
        },
        enemies: ['scorpion', 'desert_nomad', 'sand_elemental'],
        ambientSounds: ['wind_across_sand', 'desert_silence'],
        music: 'desert_ambient',
      },

      mountain: {
        name: 'Mountain',
        description: 'Rugged peaks and rocky terrain',
        color: '#696969',
        terrain: {
          ground: 'stone',
          obstacles: ['boulder', 'cliff', 'snow_patch'],
          decorations: ['mountain_flower', 'crystal_formation', 'eagle_nest'],
        },
        weather: {
          type: 'cold',
          intensity: 0.7,
          effects: ['snow', 'fog', 'strong_winds'],
        },
        loot: {
          common: ['mountain_herbs', 'iron_ore'],
          uncommon: ['precious_gem', 'mountain_crystal'],
          rare: ['dragon_scale', 'mountain_pearl'],
        },
        enemies: ['mountain_troll', 'eagle', 'ice_elemental'],
        ambientSounds: ['wind_through_rocks', 'eagle_cry'],
        music: 'mountain_ambient',
      },

      swamp: {
        name: 'Swamp',
        description: 'A murky wetland with twisted trees',
        color: '#556B2F',
        terrain: {
          ground: 'mud',
          obstacles: ['swamp_tree', 'mud_pit', 'quicksand'],
          decorations: ['moss', 'lily_pad', 'ancient_statue'],
        },
        weather: {
          type: 'humid',
          intensity: 0.6,
          effects: ['fog', 'miasma', 'rain'],
        },
        loot: {
          common: ['swamp_moss', 'mud_crystal'],
          uncommon: ['swamp_herb', 'ancient_relic'],
          rare: ['swamp_magic_essence', 'cursed_artifact'],
        },
        enemies: ['swamp_monster', 'poison_frog', 'will_o_wisp'],
        ambientSounds: ['water_dripping', 'frog_croaking'],
        music: 'swamp_ambient',
      },

      arctic: {
        name: 'Arctic',
        description: 'Frozen wasteland with ice and snow',
        color: '#B0E0E6',
        terrain: {
          ground: 'ice',
          obstacles: ['ice_formation', 'snow_drift', 'frozen_lake'],
          decorations: ['ice_crystal', 'aurora', 'polar_bear_track'],
        },
        weather: {
          type: 'freezing',
          intensity: 0.9,
          effects: ['blizzard', 'ice_storm', 'northern_lights'],
        },
        loot: {
          common: ['ice_crystal', 'snow_essence'],
          uncommon: ['arctic_fur', 'ice_gem'],
          rare: ['aurora_crystal', 'ice_dragon_scale'],
        },
        enemies: ['polar_bear', 'ice_wolf', 'frost_giant'],
        ambientSounds: ['wind_across_ice', 'ice_cracking'],
        music: 'arctic_ambient',
      },

      volcanic: {
        name: 'Volcanic',
        description: 'A land of fire and molten rock',
        color: '#8B0000',
        terrain: {
          ground: 'lava_rock',
          obstacles: ['lava_pool', 'volcanic_rock', 'ash_pile'],
          decorations: ['lava_crystal', 'volcanic_glass', 'dragon_bone'],
        },
        weather: {
          type: 'scorching',
          intensity: 1.0,
          effects: ['lava_rain', 'ash_cloud', 'heat_waves'],
        },
        loot: {
          common: ['lava_crystal', 'volcanic_ash'],
          uncommon: ['fire_gem', 'dragon_scale'],
          rare: ['phoenix_feather', 'volcanic_core'],
        },
        enemies: ['fire_elemental', 'lava_golem', 'fire_dragon'],
        ambientSounds: ['lava_bubbling', 'volcanic_rumble'],
        music: 'volcanic_ambient',
      },
    };
  }

  /**
   * Initialize dungeon templates
   */
  initializeDungeonTemplates() {
    return {
      ancient_tomb: {
        name: 'Ancient Tomb',
        description: 'A mysterious burial chamber',
        levels: 3,
        rooms: {
          entrance: {
            type: 'entrance',
            size: { width: 200, height: 150 },
            enemies: ['skeleton', 'zombie'],
            loot: ['ancient_coin', 'tomb_relic'],
          },
          main_chamber: {
            type: 'boss',
            size: { width: 300, height: 200 },
            enemies: ['tomb_guardian'],
            loot: ['ancient_treasure', 'magical_artifact'],
          },
          treasure_room: {
            type: 'treasure',
            size: { width: 150, height: 150 },
            enemies: [],
            loot: ['gold_hoard', 'rare_gem', 'legendary_item'],
          },
        },
        connections: [
          { from: 'entrance', to: 'main_chamber' },
          { from: 'main_chamber', to: 'treasure_room' },
        ],
      },

      goblin_cave: {
        name: 'Goblin Cave',
        description: 'A network of tunnels inhabited by goblins',
        levels: 2,
        rooms: {
          cave_entrance: {
            type: 'entrance',
            size: { width: 180, height: 120 },
            enemies: ['goblin', 'goblin_warrior'],
            loot: ['goblin_ear', 'rusty_weapon'],
          },
          goblin_camp: {
            type: 'camp',
            size: { width: 250, height: 180 },
            enemies: ['goblin_chief', 'goblin_shaman'],
            loot: ['goblin_treasure', 'shaman_staff'],
          },
        },
        connections: [{ from: 'cave_entrance', to: 'goblin_camp' }],
      },

      dragon_lair: {
        name: 'Dragon Lair',
        description: 'The lair of a powerful dragon',
        levels: 5,
        rooms: {
          lair_entrance: {
            type: 'entrance',
            size: { width: 200, height: 150 },
            enemies: ['dragon_guardian', 'fire_elemental'],
            loot: ['dragon_scale', 'fire_gem'],
          },
          treasure_chamber: {
            type: 'treasure',
            size: { width: 300, height: 200 },
            enemies: ['dragon_hoard_guardian'],
            loot: ['dragon_gold', 'magical_weapon'],
          },
          dragon_throne: {
            type: 'boss',
            size: { width: 400, height: 300 },
            enemies: ['ancient_dragon'],
            loot: ['dragon_heart', 'legendary_armor', 'dragon_essence'],
          },
        },
        connections: [
          { from: 'lair_entrance', to: 'treasure_chamber' },
          { from: 'treasure_chamber', to: 'dragon_throne' },
        ],
      },
    };
  }

  /**
   * Initialize loot tables
   */
  initializeLootTables() {
    return {
      common: [
        { item: 'health_potion', weight: 30, value: 10 },
        { item: 'mana_potion', weight: 25, value: 10 },
        { item: 'gold_coin', weight: 20, value: 5 },
        { item: 'iron_ore', weight: 15, value: 8 },
        { item: 'basic_weapon', weight: 10, value: 15 },
      ],
      uncommon: [
        { item: 'greater_health_potion', weight: 25, value: 25 },
        { item: 'magic_scroll', weight: 20, value: 30 },
        { item: 'silver_coin', weight: 15, value: 20 },
        { item: 'steel_ore', weight: 15, value: 25 },
        { item: 'enchanted_weapon', weight: 15, value: 50 },
        { item: 'rare_gem', weight: 10, value: 40 },
      ],
      rare: [
        { item: 'elixir_of_life', weight: 20, value: 100 },
        { item: 'ancient_scroll', weight: 15, value: 150 },
        { item: 'gold_coin_pile', weight: 15, value: 75 },
        { item: 'mithril_ore', weight: 15, value: 100 },
        { item: 'legendary_weapon', weight: 15, value: 300 },
        { item: 'precious_gem', weight: 10, value: 200 },
        { item: 'magical_artifact', weight: 10, value: 500 },
      ],
      legendary: [
        { item: 'phoenix_elixir', weight: 15, value: 1000 },
        { item: 'dragon_scroll', weight: 10, value: 2000 },
        { item: 'treasure_chest', weight: 15, value: 500 },
        { item: 'adamantine_ore', weight: 10, value: 1000 },
        { item: 'mythical_weapon', weight: 15, value: 5000 },
        { item: 'dragon_gem', weight: 10, value: 3000 },
        { item: 'divine_artifact', weight: 10, value: 10000 },
        { item: 'world_essence', weight: 15, value: 5000 },
      ],
    };
  }

  /**
   * Initialize enemy spawn tables
   */
  initializeEnemySpawnTables() {
    return {
      forest: [
        { enemy: 'goblin', weight: 40, level: 1 },
        { enemy: 'wolf', weight: 30, level: 2 },
        { enemy: 'spider', weight: 20, level: 1 },
        { enemy: 'bear', weight: 10, level: 3 },
      ],
      desert: [
        { enemy: 'scorpion', weight: 35, level: 2 },
        { enemy: 'desert_nomad', weight: 30, level: 3 },
        { enemy: 'sand_elemental', weight: 20, level: 4 },
        { enemy: 'desert_dragon', weight: 15, level: 6 },
      ],
      mountain: [
        { enemy: 'mountain_troll', weight: 25, level: 4 },
        { enemy: 'eagle', weight: 30, level: 2 },
        { enemy: 'ice_elemental', weight: 25, level: 5 },
        { enemy: 'mountain_giant', weight: 20, level: 7 },
      ],
      swamp: [
        { enemy: 'swamp_monster', weight: 30, level: 3 },
        { enemy: 'poison_frog', weight: 25, level: 1 },
        { enemy: 'will_o_wisp', weight: 25, level: 4 },
        { enemy: 'swamp_dragon', weight: 20, level: 6 },
      ],
      arctic: [
        { enemy: 'polar_bear', weight: 30, level: 4 },
        { enemy: 'ice_wolf', weight: 25, level: 3 },
        { enemy: 'frost_giant', weight: 25, level: 6 },
        { enemy: 'ice_dragon', weight: 20, level: 8 },
      ],
      volcanic: [
        { enemy: 'fire_elemental', weight: 30, level: 5 },
        { enemy: 'lava_golem', weight: 25, level: 6 },
        { enemy: 'fire_dragon', weight: 25, level: 8 },
        { enemy: 'volcanic_titan', weight: 20, level: 10 },
      ],
    };
  }

  /**
   * Set up event handlers
   */
  setupEventHandlers() {
    // Area events
    this.eventBus.on('area:generate', this.generateArea.bind(this));
    this.eventBus.on('area:explore', this.exploreArea.bind(this));
    this.eventBus.on('area:transition', this.handleAreaTransition.bind(this));

    // Dungeon events
    this.eventBus.on('dungeon:enter', this.enterDungeon.bind(this));
    this.eventBus.on('dungeon:exit', this.exitDungeon.bind(this));
    this.eventBus.on('dungeon:complete', this.completeDungeon.bind(this));

    // Exploration events
    this.eventBus.on('exploration:discover', this.handleDiscovery.bind(this));
    this.eventBus.on('exploration:loot', this.handleLootDiscovery.bind(this));
  }

  /**
   * Remove event handlers
   */
  removeEventHandlers() {
    this.eventBus.removeListener('area:generate', this.generateArea.bind(this));
    this.eventBus.removeListener('area:explore', this.exploreArea.bind(this));
    this.eventBus.removeListener(
      'area:transition',
      this.handleAreaTransition.bind(this)
    );
    this.eventBus.removeListener('dungeon:enter', this.enterDungeon.bind(this));
    this.eventBus.removeListener('dungeon:exit', this.exitDungeon.bind(this));
    this.eventBus.removeListener(
      'dungeon:complete',
      this.completeDungeon.bind(this)
    );
    this.eventBus.removeListener(
      'exploration:discover',
      this.handleDiscovery.bind(this)
    );
    this.eventBus.removeListener(
      'exploration:loot',
      this.handleLootDiscovery.bind(this)
    );
  }

  /**
   * Create seeded random number generator
   */
  createSeededRNG(seed) {
    let state = seed;
    return {
      next: () => {
        state = (state * 9301 + 49297) % 233280;
        return state / 233280;
      },
      nextInt: (min, max) => {
        return Math.floor(this.rng.next() * (max - min + 1)) + min;
      },
      nextFloat: (min, max) => {
        return this.rng.next() * (max - min) + min;
      },
    };
  }

  /**
   * Generate area
   */
  async generateArea(areaType, x, y) {
    const areaId = `${areaType}_${x}_${y}`;

    if (this.generationState.generatedAreas.has(areaId)) {
      return this.generationState.generatedAreas.get(areaId);
    }

    this.logger.info(`Generating area: ${areaType} at (${x}, ${y})`);

    const area = {
      id: areaId,
      type: areaType,
      x: x,
      y: y,
      size: this.generateAreaSize(),
      biome: this.determineBiome(x, y),
      terrain: this.generateTerrain(x, y),
      loot: this.generateLoot(x, y),
      enemies: this.generateEnemies(x, y),
      dungeons: this.generateDungeons(x, y),
      exploration: this.initializeExplorationData(areaId),
      generatedAt: Date.now(),
    };

    this.generationState.generatedAreas.set(areaId, area);

    this.eventBus.emit('area:generated', {
      area,
      timestamp: Date.now(),
    });

    return area;
  }

  /**
   * Generate area size
   */
  generateAreaSize() {
    const minSize = this.generationConfig.minAreaSize;
    const maxSize = this.generationConfig.maxAreaSize;
    return {
      width: this.rng.nextInt(minSize, maxSize),
      height: this.rng.nextInt(minSize, maxSize),
    };
  }

  /**
   * Determine biome based on coordinates
   */
  determineBiome(x, y) {
    // Use noise function to determine biome
    const noise = this.noise2D(x * 0.01, y * 0.01);
    const biomeKeys = Object.keys(this.biomes);
    const biomeIndex = Math.floor((noise + 1) * 0.5 * biomeKeys.length);
    return biomeKeys[Math.min(biomeIndex, biomeKeys.length - 1)];
  }

  /**
   * Generate terrain
   */
  generateTerrain(x, y) {
    const biome = this.determineBiome(x, y);
    const biomeData = this.biomes[biome];

    const terrain = {
      ground: biomeData.terrain.ground,
      obstacles: [],
      decorations: [],
      heightMap: this.generateHeightMap(x, y),
      waterSources: this.generateWaterSources(x, y),
      caves: this.generateCaves(x, y),
    };

    // Generate obstacles
    const obstacleCount = this.rng.nextInt(10, 30);
    for (let i = 0; i < obstacleCount; i++) {
      const obstacle = this.generateObstacle(biomeData.terrain.obstacles, x, y);
      if (obstacle) terrain.obstacles.push(obstacle);
    }

    // Generate decorations
    const decorationCount = this.rng.nextInt(15, 40);
    for (let i = 0; i < decorationCount; i++) {
      const decoration = this.generateDecoration(
        biomeData.terrain.decorations,
        x,
        y
      );
      if (decoration) terrain.decorations.push(decoration);
    }

    return terrain;
  }

  /**
   * Generate height map
   */
  generateHeightMap(x, y) {
    const size = this.generationConfig.chunkSize;
    const heightMap = [];

    for (let i = 0; i < size; i++) {
      heightMap[i] = [];
      for (let j = 0; j < size; j++) {
        const worldX = x + i;
        const worldY = y + j;
        heightMap[i][j] = this.noise2D(worldX * 0.1, worldY * 0.1);
      }
    }

    return heightMap;
  }

  /**
   * Generate water sources
   */
  generateWaterSources(x, y) {
    const sources = [];
    const sourceCount = this.rng.nextInt(2, 8);

    for (let i = 0; i < sourceCount; i++) {
      sources.push({
        x: this.rng.nextInt(0, this.generationConfig.chunkSize),
        y: this.rng.nextInt(0, this.generationConfig.chunkSize),
        size: this.rng.nextInt(20, 80),
        type: this.rng.next() < 0.7 ? 'pond' : 'river',
      });
    }

    return sources;
  }

  /**
   * Generate caves
   */
  generateCaves(x, y) {
    const caves = [];
    const caveCount = this.rng.nextInt(1, 4);

    for (let i = 0; i < caveCount; i++) {
      caves.push({
        x: this.rng.nextInt(0, this.generationConfig.chunkSize),
        y: this.rng.nextInt(0, this.generationConfig.chunkSize),
        depth: this.rng.nextInt(1, 5),
        type: this.rng.next() < 0.5 ? 'natural' : 'dungeon',
      });
    }

    return caves;
  }

  /**
   * Generate obstacle
   */
  generateObstacle(obstacleTypes, x, y) {
    const obstacleType =
      obstacleTypes[Math.floor(this.rng.next() * obstacleTypes.length)];
    const size = this.rng.nextInt(20, 60);

    return {
      type: obstacleType,
      x: this.rng.nextInt(0, this.generationConfig.chunkSize),
      y: this.rng.nextInt(0, this.generationConfig.chunkSize),
      width: size,
      height: size,
      rotation: this.rng.next() * Math.PI * 2,
    };
  }

  /**
   * Generate decoration
   */
  generateDecoration(decorationTypes, x, y) {
    const decorationType =
      decorationTypes[Math.floor(this.rng.next() * decorationTypes.length)];
    const size = this.rng.nextInt(10, 30);

    return {
      type: decorationType,
      x: this.rng.nextInt(0, this.generationConfig.chunkSize),
      y: this.rng.nextInt(0, this.generationConfig.chunkSize),
      width: size,
      height: size,
      rotation: this.rng.next() * Math.PI * 2,
    };
  }

  /**
   * Generate loot
   */
  generateLoot(x, y) {
    const loot = [];
    const lootCount = Math.floor(this.rng.next() * 10) + 5;

    for (let i = 0; i < lootCount; i++) {
      const lootItem = this.generateLootItem(x, y);
      if (lootItem) loot.push(lootItem);
    }

    return loot;
  }

  /**
   * Generate loot item
   */
  generateLootItem(x, y) {
    const rarity = this.determineLootRarity();
    const lootTable = this.lootTables[rarity];

    if (!lootTable || lootTable.length === 0) return null;

    const totalWeight = lootTable.reduce((sum, item) => sum + item.weight, 0);
    let randomWeight = this.rng.next() * totalWeight;

    for (const item of lootTable) {
      randomWeight -= item.weight;
      if (randomWeight <= 0) {
        return {
          item: item.item,
          rarity: rarity,
          value: item.value,
          x: this.rng.nextInt(0, this.generationConfig.chunkSize),
          y: this.rng.nextInt(0, this.generationConfig.chunkSize),
          discovered: false,
        };
      }
    }

    return null;
  }

  /**
   * Determine loot rarity
   */
  determineLootRarity() {
    const roll = this.rng.next();

    if (roll < 0.6) return 'common';
    if (roll < 0.85) return 'uncommon';
    if (roll < 0.95) return 'rare';
    return 'legendary';
  }

  /**
   * Generate enemies
   */
  generateEnemies(x, y) {
    const biome = this.determineBiome(x, y);
    const spawnTable = this.enemySpawnTables[biome];

    if (!spawnTable) return [];

    const enemies = [];
    const enemyCount = Math.floor(this.rng.next() * 8) + 3;

    for (let i = 0; i < enemyCount; i++) {
      const enemy = this.generateEnemy(spawnTable, x, y);
      if (enemy) enemies.push(enemy);
    }

    return enemies;
  }

  /**
   * Generate enemy
   */
  generateEnemy(spawnTable, x, y) {
    const totalWeight = spawnTable.reduce(
      (sum, enemy) => sum + enemy.weight,
      0
    );
    let randomWeight = this.rng.next() * totalWeight;

    for (const enemyData of spawnTable) {
      randomWeight -= enemyData.weight;
      if (randomWeight <= 0) {
        return {
          type: enemyData.enemy,
          level: enemyData.level,
          x: this.rng.nextInt(0, this.generationConfig.chunkSize),
          y: this.rng.nextInt(0, this.generationConfig.chunkSize),
          spawned: false,
          defeated: false,
        };
      }
    }

    return null;
  }

  /**
   * Generate dungeons
   */
  generateDungeons(x, y) {
    const dungeons = [];
    const dungeonCount = this.rng.nextInt(0, 3);

    for (let i = 0; i < dungeonCount; i++) {
      const dungeon = this.generateDungeon(x, y);
      if (dungeon) dungeons.push(dungeon);
    }

    return dungeons;
  }

  /**
   * Generate dungeon
   */
  generateDungeon(x, y) {
    const templateKeys = Object.keys(this.dungeonTemplates);
    const templateKey =
      templateKeys[Math.floor(this.rng.next() * templateKeys.length)];
    const template = this.dungeonTemplates[templateKey];

    return {
      id: `dungeon_${x}_${y}_${Date.now()}`,
      template: templateKey,
      name: template.name,
      description: template.description,
      x: this.rng.nextInt(0, this.generationConfig.chunkSize),
      y: this.rng.nextInt(0, this.generationConfig.chunkSize),
      level: 1,
      maxLevel: template.levels,
      completed: false,
      discovered: false,
    };
  }

  /**
   * Initialize exploration data
   */
  initializeExplorationData(areaId) {
    return {
      explored: false,
      explorationProgress: 0,
      discoveries: [],
      secrets: [],
      landmarks: [],
      lastVisited: null,
    };
  }

  /**
   * Explore area
   */
  exploreArea(areaId, playerPosition) {
    const area = this.generationState.generatedAreas.get(areaId);
    if (!area) return;

    const exploration = area.exploration;
    exploration.explored = true;
    exploration.lastVisited = Date.now();

    // Check for discoveries
    this.checkForDiscoveries(area, playerPosition);

    // Update exploration progress
    this.updateExplorationProgress(area);

    this.eventBus.emit('area:explored', {
      areaId,
      exploration,
      timestamp: Date.now(),
    });
  }

  /**
   * Check for discoveries
   */
  checkForDiscoveries(area, playerPosition) {
    // Check for loot discoveries
    area.loot.forEach((loot) => {
      if (!loot.discovered) {
        const distance = this.getDistance(playerPosition, {
          x: loot.x,
          y: loot.y,
        });
        if (distance < 50) {
          loot.discovered = true;
          this.eventBus.emit('exploration:loot', {
            loot,
            areaId: area.id,
            timestamp: Date.now(),
          });
        }
      }
    });

    // Check for dungeon discoveries
    area.dungeons.forEach((dungeon) => {
      if (!dungeon.discovered) {
        const distance = this.getDistance(playerPosition, {
          x: dungeon.x,
          y: dungeon.y,
        });
        if (distance < 100) {
          dungeon.discovered = true;
          this.eventBus.emit('exploration:discover', {
            type: 'dungeon',
            discovery: dungeon,
            areaId: area.id,
            timestamp: Date.now(),
          });
        }
      }
    });
  }

  /**
   * Update exploration progress
   */
  updateExplorationProgress(area) {
    const totalDiscoveries = area.loot.length + area.dungeons.length;
    const discoveredCount =
      area.loot.filter((l) => l.discovered).length +
      area.dungeons.filter((d) => d.discovered).length;

    area.exploration.explorationProgress =
      totalDiscoveries > 0 ? (discoveredCount / totalDiscoveries) * 100 : 0;
  }

  /**
   * Enter dungeon
   */
  enterDungeon(dungeonId) {
    const dungeon = this.findDungeonById(dungeonId);
    if (!dungeon) return;

    const dungeonInstance = this.createDungeonInstance(dungeon);
    this.generationState.activeDungeons.set(dungeonId, dungeonInstance);

    this.eventBus.emit('dungeon:entered', {
      dungeonId,
      dungeon: dungeonInstance,
      timestamp: Date.now(),
    });
  }

  /**
   * Exit dungeon
   */
  exitDungeon(dungeonId) {
    const dungeon = this.generationState.activeDungeons.get(dungeonId);
    if (!dungeon) return;

    this.generationState.activeDungeons.delete(dungeonId);

    this.eventBus.emit('dungeon:exited', {
      dungeonId,
      timestamp: Date.now(),
    });
  }

  /**
   * Complete dungeon
   */
  completeDungeon(dungeonId) {
    const dungeon = this.generationState.activeDungeons.get(dungeonId);
    if (!dungeon) return;

    dungeon.completed = true;

    // Award completion rewards
    this.awardDungeonRewards(dungeon);

    this.eventBus.emit('dungeon:completed', {
      dungeonId,
      dungeon,
      timestamp: Date.now(),
    });
  }

  /**
   * Create dungeon instance
   */
  createDungeonInstance(dungeon) {
    const template = this.dungeonTemplates[dungeon.template];

    return {
      ...dungeon,
      rooms: this.generateDungeonRooms(template),
      currentRoom: 'entrance',
      completedRooms: [],
      enemies: this.generateDungeonEnemies(template),
      loot: this.generateDungeonLoot(template),
    };
  }

  /**
   * Generate dungeon rooms
   */
  generateDungeonRooms(template) {
    const rooms = {};

    Object.entries(template.rooms).forEach(([roomId, roomData]) => {
      rooms[roomId] = {
        ...roomData,
        id: roomId,
        explored: false,
        enemies: [...roomData.enemies],
        loot: [...roomData.loot],
      };
    });

    return rooms;
  }

  /**
   * Generate dungeon enemies
   */
  generateDungeonEnemies(template) {
    const enemies = [];

    Object.values(template.rooms).forEach((room) => {
      room.enemies.forEach((enemyType) => {
        enemies.push({
          type: enemyType,
          room: room.id,
          x: this.rng.nextInt(0, room.size.width),
          y: this.rng.nextInt(0, room.size.height),
          defeated: false,
        });
      });
    });

    return enemies;
  }

  /**
   * Generate dungeon loot
   */
  generateDungeonLoot(template) {
    const loot = [];

    Object.values(template.rooms).forEach((room) => {
      room.loot.forEach((lootType) => {
        loot.push({
          type: lootType,
          room: room.id,
          x: this.rng.nextInt(0, room.size.width),
          y: this.rng.nextInt(0, room.size.height),
          discovered: false,
        });
      });
    });

    return loot;
  }

  /**
   * Award dungeon rewards
   */
  awardDungeonRewards(dungeon) {
    const rewards = {
      experience: dungeon.level * 100,
      gold: dungeon.level * 50,
      items: [],
    };

    // Add loot from all rooms
    dungeon.loot.forEach((loot) => {
      if (loot.discovered) {
        rewards.items.push(loot.type);
      }
    });

    this.eventBus.emit('dungeon:rewards', {
      dungeonId: dungeon.id,
      rewards,
      timestamp: Date.now(),
    });
  }

  /**
   * Handle area transition
   */
  handleAreaTransition(data) {
    const { fromArea, toArea, playerPosition } = data;

    // Generate new area if needed
    this.generateArea(toArea.type, toArea.x, toArea.y);

    this.eventBus.emit('area:transitioned', {
      fromArea,
      toArea,
      playerPosition,
      timestamp: Date.now(),
    });
  }

  /**
   * Handle discovery
   */
  handleDiscovery(data) {
    const { type, discovery, areaId } = data;

    this.logger.info(`Discovered ${type}: ${discovery.name} in area ${areaId}`);
  }

  /**
   * Handle loot discovery
   */
  handleLootDiscovery(data) {
    const { loot, areaId } = data;

    this.logger.info(`Discovered loot: ${loot.item} in area ${areaId}`);
  }

  /**
   * Update active dungeons
   */
  updateActiveDungeons(deltaTime) {
    for (const [dungeonId, dungeon] of this.generationState.activeDungeons) {
      // Update dungeon state
      this.updateDungeonState(dungeon, deltaTime);
    }
  }

  /**
   * Update exploration data
   */
  updateExplorationData(deltaTime) {
    // Update exploration timers and effects
  }

  /**
   * Check area transitions
   */
  checkAreaTransitions(gameState) {
    if (!gameState.player) return;

    const player = gameState.player;
    const currentArea = this.getCurrentArea(player.x, player.y);

    if (
      currentArea &&
      currentArea.id !== this.generationState.currentArea?.id
    ) {
      this.generationState.currentArea = currentArea;
      this.exploreArea(currentArea.id, { x: player.x, y: player.y });
    }
  }

  /**
   * Get current area
   */
  getCurrentArea(x, y) {
    const areaX = Math.floor(x / this.generationConfig.chunkSize);
    const areaY = Math.floor(y / this.generationConfig.chunkSize);
    const areaId = `area_${areaX}_${areaY}`;

    return this.generationState.generatedAreas.get(areaId);
  }

  /**
   * Find dungeon by ID
   */
  findDungeonById(dungeonId) {
    for (const area of this.generationState.generatedAreas.values()) {
      const dungeon = area.dungeons.find((d) => d.id === dungeonId);
      if (dungeon) return dungeon;
    }
    return null;
  }

  /**
   * Update dungeon state
   */
  updateDungeonState(dungeon, deltaTime) {
    // Update dungeon-specific logic
  }

  /**
   * Get distance between two points
   */
  getDistance(point1, point2) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 2D noise function
   */
  noise2D(x, y) {
    // Simple noise function - in a real implementation, you'd use Perlin noise
    return Math.sin(x) * Math.cos(y) * 0.5 + 0.5;
  }

  /**
   * Get area data
   */
  getArea(areaId) {
    return this.generationState.generatedAreas.get(areaId);
  }

  /**
   * Get all areas
   */
  getAllAreas() {
    return Array.from(this.generationState.generatedAreas.values());
  }

  /**
   * Get active dungeons
   */
  getActiveDungeons() {
    return Array.from(this.generationState.activeDungeons.values());
  }

  /**
   * Get exploration data
   */
  getExplorationData(areaId) {
    const area = this.generationState.generatedAreas.get(areaId);
    return area ? area.exploration : null;
  }
}

export default ProceduralAreaSystem;
