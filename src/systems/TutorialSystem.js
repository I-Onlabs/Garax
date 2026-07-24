/**
 * TutorialSystem.js - Interactive Tutorial System for New Players
 *
 * This system handles:
 * - Step-by-step guided tutorials
 * - Interactive tooltips and highlights
 * - Progress tracking and completion
 * - Contextual help and hints
 * - Tutorial customization and skipping
 * - Multi-language tutorial support
 */

export class TutorialSystem {
  constructor(dependencies = {}) {
    // Dependency injection
    this.eventBus = dependencies.eventBus;
    this.logger = dependencies.logger;
    this.config = dependencies.config;

    // Validate required dependencies
    if (!this.eventBus) {
      throw new Error('TutorialSystem requires eventBus dependency');
    }
    if (!this.logger) {
      throw new Error('TutorialSystem requires logger dependency');
    }

    // Tutorial system state
    this.tutorialState = {
      activeTutorial: null,
      currentStep: 0,
      completedTutorials: new Set(),
      skippedTutorials: new Set(),
      tutorialProgress: new Map(),
      tooltips: new Map(),
      highlights: new Map(),
      overlays: new Map(),
      settings: {
        enabled: true,
        skipEnabled: true,
        hintsEnabled: true,
        voiceEnabled: false,
        autoAdvance: false,
        showProgress: true,
      },
      playerLevel: 1,
      isFirstTime: true,
      tutorialQueue: [],
      paused: false,
    };

    // Tutorial system configuration
    this.tutorialConfig = {
      maxTutorials: 50,
      maxSteps: 20,
      tooltipDuration: 10000, // 10 seconds
      highlightDuration: 5000, // 5 seconds
      autoAdvanceDelay: 3000, // 3 seconds
      hintCooldown: 30000, // 30 seconds
      tutorialCategories: {
        basic: 'Basic Controls',
        combat: 'Combat System',
        inventory: 'Inventory Management',
        skills: 'Skill System',
        trading: 'Trading System',
        exploration: 'Exploration',
        crafting: 'Crafting System',
        social: 'Social Features',
        advanced: 'Advanced Features',
      },
      stepTypes: {
        tooltip: 'tooltip',
        highlight: 'highlight',
        overlay: 'overlay',
        interaction: 'interaction',
        demonstration: 'demonstration',
        quiz: 'quiz',
        practice: 'practice',
      },
    };

    // Initialize tutorial system
    this.initializeTutorials();
    this.initializeTooltips();
    this.initializeHighlights();
    this.initializeOverlays();

    // Event handlers
    this.setupEventHandlers();

    this.logger.info('TutorialSystem initialized');
  }

  /**
   * Initialize the system
   */
  async initialize() {
    this.logger.info('Initializing TutorialSystem...');

    // Load tutorial progress
    await this.loadTutorialProgress();

    // Check if player is new
    this.checkIfNewPlayer();

    // Start initial tutorial if needed
    if (this.tutorialState.isFirstTime) {
      this.startTutorial('welcome');
    }

    this.logger.info('TutorialSystem initialized successfully');
  }

  /**
   * Cleanup the system
   */
  cleanup() {
    this.logger.info('Cleaning up TutorialSystem...');

    // Stop active tutorial
    this.stopTutorial();

    // Clear all tooltips and highlights
    this.clearAllTooltips();
    this.clearAllHighlights();
    this.clearAllOverlays();

    // Save tutorial progress
    this.saveTutorialProgress();

    // Clear state
    this.tutorialState.tutorialProgress.clear();
    this.tutorialState.tooltips.clear();
    this.tutorialState.highlights.clear();
    this.tutorialState.overlays.clear();
    this.tutorialState.tutorialQueue = [];

    // Remove event listeners
    this.removeEventHandlers();

    this.logger.info('TutorialSystem cleaned up');
  }

  /**
   * Update the system
   */
  update(deltaTime, gameState) {
    // Update active tutorial
    this.updateActiveTutorial(deltaTime);

    // Update tooltips
    this.updateTooltips(deltaTime);

    // Update highlights
    this.updateHighlights(deltaTime);

    // Update overlays
    this.updateOverlays(deltaTime);

    // Update tutorial queue
    this.updateTutorialQueue(deltaTime);
  }

  /**
   * Initialize tutorials
   */
  initializeTutorials() {
    // Welcome tutorial
    this.addTutorial({
      id: 'welcome',
      name: 'Welcome to ARPG',
      description: 'Learn the basics of the game',
      category: 'basic',
      level: 1,
      steps: [
        {
          id: 'welcome_message',
          type: 'overlay',
          title: 'Welcome!',
          message: "Welcome to the world of ARPG! Let's learn the basics.",
          action: 'next',
          duration: 5000,
        },
        {
          id: 'movement_tutorial',
          type: 'tooltip',
          target: 'movement_controls',
          title: 'Movement',
          message: 'Use WASD or arrow keys to move your character.',
          action: 'interact',
          duration: 10000,
        },
        {
          id: 'camera_tutorial',
          type: 'tooltip',
          target: 'camera_controls',
          title: 'Camera',
          message: 'Use the mouse to look around and right-click to interact.',
          action: 'interact',
          duration: 10000,
        },
        {
          id: 'inventory_tutorial',
          type: 'highlight',
          target: 'inventory_button',
          title: 'Inventory',
          message: 'Click here to open your inventory.',
          action: 'click',
          duration: 8000,
        },
      ],
    });

    // Combat tutorial
    this.addTutorial({
      id: 'combat_basics',
      name: 'Combat Basics',
      description: 'Learn how to fight enemies',
      category: 'combat',
      level: 2,
      steps: [
        {
          id: 'attack_tutorial',
          type: 'tooltip',
          target: 'attack_button',
          title: 'Attack',
          message: 'Click here to attack enemies.',
          action: 'click',
          duration: 8000,
        },
        {
          id: 'block_tutorial',
          type: 'tooltip',
          target: 'block_button',
          title: 'Block',
          message: 'Hold this to block incoming attacks.',
          action: 'hold',
          duration: 10000,
        },
        {
          id: 'dodge_tutorial',
          type: 'tooltip',
          target: 'dodge_button',
          title: 'Dodge',
          message: 'Press this to dodge attacks.',
          action: 'press',
          duration: 8000,
        },
        {
          id: 'spell_tutorial',
          type: 'tooltip',
          target: 'spell_button',
          title: 'Spells',
          message: 'Use spells to deal magical damage.',
          action: 'click',
          duration: 10000,
        },
      ],
    });

    // Inventory tutorial
    this.addTutorial({
      id: 'inventory_management',
      name: 'Inventory Management',
      description: 'Learn how to manage your inventory',
      category: 'inventory',
      level: 3,
      steps: [
        {
          id: 'inventory_open',
          type: 'highlight',
          target: 'inventory_panel',
          title: 'Inventory Panel',
          message: 'This is your inventory. Items are stored here.',
          action: 'observe',
          duration: 8000,
        },
        {
          id: 'item_drag',
          type: 'demonstration',
          target: 'inventory_item',
          title: 'Moving Items',
          message: 'Drag items to move them around.',
          action: 'drag',
          duration: 12000,
        },
        {
          id: 'item_equip',
          type: 'interaction',
          target: 'equipment_slot',
          title: 'Equipping Items',
          message: 'Drag items to equipment slots to equip them.',
          action: 'drag',
          duration: 15000,
        },
        {
          id: 'item_info',
          type: 'tooltip',
          target: 'item_tooltip',
          title: 'Item Information',
          message: 'Hover over items to see their stats.',
          action: 'hover',
          duration: 8000,
        },
      ],
    });

    // Skill tutorial
    this.addTutorial({
      id: 'skill_system',
      name: 'Skill System',
      description: 'Learn about the skill tree and abilities',
      category: 'skills',
      level: 5,
      steps: [
        {
          id: 'skill_tree_open',
          type: 'highlight',
          target: 'skill_tree_button',
          title: 'Skill Tree',
          message: 'Click here to open the skill tree.',
          action: 'click',
          duration: 8000,
        },
        {
          id: 'skill_node_explanation',
          type: 'tooltip',
          target: 'skill_node',
          title: 'Skill Nodes',
          message: 'Each node represents a skill you can learn.',
          action: 'observe',
          duration: 10000,
        },
        {
          id: 'skill_learning',
          type: 'interaction',
          target: 'learn_skill_button',
          title: 'Learning Skills',
          message: 'Click to learn a skill. You need skill points.',
          action: 'click',
          duration: 12000,
        },
        {
          id: 'skill_gems',
          type: 'tooltip',
          target: 'skill_gem_slot',
          title: 'Skill Gems',
          message: 'Socket gems to gain active abilities.',
          action: 'observe',
          duration: 10000,
        },
      ],
    });

    // Trading tutorial
    this.addTutorial({
      id: 'trading_system',
      name: 'Trading System',
      description: 'Learn how to trade with other players',
      category: 'trading',
      level: 10,
      steps: [
        {
          id: 'trade_button',
          type: 'highlight',
          target: 'trade_button',
          title: 'Trading',
          message: 'Click here to start trading with other players.',
          action: 'click',
          duration: 8000,
        },
        {
          id: 'trade_interface',
          type: 'overlay',
          title: 'Trade Interface',
          message: 'This is the trading interface. Drag items to trade them.',
          action: 'observe',
          duration: 12000,
        },
        {
          id: 'auction_house',
          type: 'highlight',
          target: 'auction_house_button',
          title: 'Auction House',
          message: 'Use the auction house to buy and sell items.',
          action: 'click',
          duration: 10000,
        },
      ],
    });

    // Exploration tutorial
    this.addTutorial({
      id: 'exploration',
      name: 'Exploration',
      description: 'Learn about exploring the world',
      category: 'exploration',
      level: 8,
      steps: [
        {
          id: 'map_tutorial',
          type: 'highlight',
          target: 'map_button',
          title: 'World Map',
          message: 'Open the map to see the world and plan your journey.',
          action: 'click',
          duration: 8000,
        },
        {
          id: 'area_discovery',
          type: 'tooltip',
          target: 'area_marker',
          title: 'Areas',
          message: 'Visit new areas to discover them on the map.',
          action: 'observe',
          duration: 10000,
        },
        {
          id: 'dungeon_entrance',
          type: 'highlight',
          target: 'dungeon_entrance',
          title: 'Dungeons',
          message: 'Enter dungeons for challenging content and better loot.',
          action: 'click',
          duration: 10000,
        },
      ],
    });
  }

  /**
   * Initialize tooltips
   */
  initializeTooltips() {
    this.tooltipSystem = {
      activeTooltips: new Map(),
      tooltipElement: null,
      tooltipStyle: {
        position: 'absolute',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '14px',
        maxWidth: '300px',
        zIndex: 10000,
        pointerEvents: 'none',
      },
    };
  }

  /**
   * Initialize highlights
   */
  initializeHighlights() {
    this.highlightSystem = {
      activeHighlights: new Map(),
      highlightStyle: {
        position: 'absolute',
        border: '3px solid #ffff00',
        borderRadius: '5px',
        backgroundColor: 'rgba(255, 255, 0, 0.1)',
        zIndex: 9999,
        pointerEvents: 'none',
        animation: 'pulse 1s infinite',
      },
    };
  }

  /**
   * Initialize overlays
   */
  initializeOverlays() {
    this.overlaySystem = {
      activeOverlays: new Map(),
      overlayElement: null,
      overlayStyle: {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 10001,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
    };
  }

  /**
   * Set up event handlers
   */
  setupEventHandlers() {
    // Tutorial events
    this.eventBus.on('tutorial:start', this.startTutorial.bind(this));
    this.eventBus.on('tutorial:stop', this.stopTutorial.bind(this));
    this.eventBus.on('tutorial:next', this.nextStep.bind(this));
    this.eventBus.on('tutorial:previous', this.previousStep.bind(this));
    this.eventBus.on('tutorial:skip', this.skipTutorial.bind(this));
    this.eventBus.on('tutorial:complete', this.completeTutorial.bind(this));

    // Game events
    this.eventBus.on('player:levelUp', this.handlePlayerLevelUp.bind(this));
    this.eventBus.on('player:firstKill', this.handlePlayerFirstKill.bind(this));
    this.eventBus.on('player:firstItem', this.handlePlayerFirstItem.bind(this));
    this.eventBus.on(
      'player:firstTrade',
      this.handlePlayerFirstTrade.bind(this)
    );
    this.eventBus.on(
      'player:firstDungeon',
      this.handlePlayerFirstDungeon.bind(this)
    );

    // UI events
    this.eventBus.on('ui:elementClick', this.handleElementClick.bind(this));
    this.eventBus.on('ui:elementHover', this.handleElementHover.bind(this));
    this.eventBus.on('ui:elementFocus', this.handleElementFocus.bind(this));
  }

  /**
   * Remove event handlers
   */
  removeEventHandlers() {
    this.eventBus.removeListener(
      'tutorial:start',
      this.startTutorial.bind(this)
    );
    this.eventBus.removeListener('tutorial:stop', this.stopTutorial.bind(this));
    this.eventBus.removeListener('tutorial:next', this.nextStep.bind(this));
    this.eventBus.removeListener(
      'tutorial:previous',
      this.previousStep.bind(this)
    );
    this.eventBus.removeListener('tutorial:skip', this.skipTutorial.bind(this));
    this.eventBus.removeListener(
      'tutorial:complete',
      this.completeTutorial.bind(this)
    );
    this.eventBus.removeListener(
      'player:levelUp',
      this.handlePlayerLevelUp.bind(this)
    );
    this.eventBus.removeListener(
      'player:firstKill',
      this.handlePlayerFirstKill.bind(this)
    );
    this.eventBus.removeListener(
      'player:firstItem',
      this.handlePlayerFirstItem.bind(this)
    );
    this.eventBus.removeListener(
      'player:firstTrade',
      this.handlePlayerFirstTrade.bind(this)
    );
    this.eventBus.removeListener(
      'player:firstDungeon',
      this.handlePlayerFirstDungeon.bind(this)
    );
    this.eventBus.removeListener(
      'ui:elementClick',
      this.handleElementClick.bind(this)
    );
    this.eventBus.removeListener(
      'ui:elementHover',
      this.handleElementHover.bind(this)
    );
    this.eventBus.removeListener(
      'ui:elementFocus',
      this.handleElementFocus.bind(this)
    );
  }

  /**
   * Add tutorial
   */
  addTutorial(tutorialData) {
    const tutorial = {
      id: tutorialData.id,
      name: tutorialData.name,
      description: tutorialData.description,
      category: tutorialData.category,
      level: tutorialData.level,
      steps: tutorialData.steps,
      completed: false,
      skipped: false,
      currentStep: 0,
      startTime: null,
      endTime: null,
    };

    this.tutorialState.tutorialProgress.set(tutorial.id, tutorial);
  }

  /**
   * Start tutorial
   */
  startTutorial(tutorialId) {
    if (!this.tutorialState.settings.enabled) {
      return;
    }

    const tutorial = this.tutorialState.tutorialProgress.get(tutorialId);
    if (!tutorial) {
      this.logger.warn(`Tutorial not found: ${tutorialId}`);
      return;
    }

    if (tutorial.completed || tutorial.skipped) {
      return;
    }

    // Stop current tutorial if any
    if (this.tutorialState.activeTutorial) {
      this.stopTutorial();
    }

    this.tutorialState.activeTutorial = tutorial;
    this.tutorialState.currentStep = 0;
    tutorial.startTime = Date.now();

    // Start first step
    this.startStep(tutorial.steps[0]);

    this.eventBus.emit('tutorial:started', {
      tutorial: tutorial,
      timestamp: Date.now(),
    });

    this.logger.info(`Tutorial started: ${tutorial.name}`);
  }

  /**
   * Stop tutorial
   */
  stopTutorial() {
    if (!this.tutorialState.activeTutorial) {
      return;
    }

    const tutorial = this.tutorialState.activeTutorial;

    // Clear all visual elements
    this.clearAllTooltips();
    this.clearAllHighlights();
    this.clearAllOverlays();

    this.tutorialState.activeTutorial = null;
    this.tutorialState.currentStep = 0;

    this.eventBus.emit('tutorial:stopped', {
      tutorial: tutorial,
      timestamp: Date.now(),
    });

    this.logger.info(`Tutorial stopped: ${tutorial.name}`);
  }

  /**
   * Next step
   */
  nextStep() {
    if (!this.tutorialState.activeTutorial) {
      return;
    }

    const tutorial = this.tutorialState.activeTutorial;
    const nextStepIndex = this.tutorialState.currentStep + 1;

    if (nextStepIndex >= tutorial.steps.length) {
      this.completeTutorial();
      return;
    }

    this.tutorialState.currentStep = nextStepIndex;
    this.startStep(tutorial.steps[nextStepIndex]);
  }

  /**
   * Previous step
   */
  previousStep() {
    if (!this.tutorialState.activeTutorial) {
      return;
    }

    const tutorial = this.tutorialState.activeTutorial;
    const prevStepIndex = this.tutorialState.currentStep - 1;

    if (prevStepIndex < 0) {
      return;
    }

    this.tutorialState.currentStep = prevStepIndex;
    this.startStep(tutorial.steps[prevStepIndex]);
  }

  /**
   * Skip tutorial
   */
  skipTutorial() {
    if (!this.tutorialState.activeTutorial) {
      return;
    }

    const tutorial = this.tutorialState.activeTutorial;
    tutorial.skipped = true;
    tutorial.endTime = Date.now();

    this.tutorialState.skippedTutorials.add(tutorial.id);

    this.stopTutorial();

    this.eventBus.emit('tutorial:skipped', {
      tutorial: tutorial,
      timestamp: Date.now(),
    });

    this.logger.info(`Tutorial skipped: ${tutorial.name}`);
  }

  /**
   * Complete tutorial
   */
  completeTutorial() {
    if (!this.tutorialState.activeTutorial) {
      return;
    }

    const tutorial = this.tutorialState.activeTutorial;
    tutorial.completed = true;
    tutorial.endTime = Date.now();

    this.tutorialState.completedTutorials.add(tutorial.id);

    this.stopTutorial();

    this.eventBus.emit('tutorial:completed', {
      tutorial: tutorial,
      timestamp: Date.now(),
    });

    this.logger.info(`Tutorial completed: ${tutorial.name}`);
  }

  /**
   * Start step
   */
  startStep(step) {
    if (!step) {
      return;
    }

    // Clear previous visual elements
    this.clearAllTooltips();
    this.clearAllHighlights();
    this.clearAllOverlays();

    switch (step.type) {
      case 'tooltip':
        this.showTooltip(step);
        break;
      case 'highlight':
        this.showHighlight(step);
        break;
      case 'overlay':
        this.showOverlay(step);
        break;
      case 'interaction':
        this.showInteraction(step);
        break;
      case 'demonstration':
        this.showDemonstration(step);
        break;
      case 'quiz':
        this.showQuiz(step);
        break;
      case 'practice':
        this.showPractice(step);
        break;
    }

    // Auto-advance if enabled
    if (this.tutorialState.settings.autoAdvance && step.duration) {
      setTimeout(() => {
        this.nextStep();
      }, step.duration);
    }
  }

  /**
   * Show tooltip
   */
  showTooltip(step) {
    const target = document.querySelector(`[data-tutorial="${step.target}"]`);
    if (!target) {
      this.logger.warn(`Tooltip target not found: ${step.target}`);
      return;
    }

    const tooltip = this.createTooltip(step.title, step.message);
    this.positionTooltip(tooltip, target);

    this.tooltipSystem.activeTooltips.set(step.id, tooltip);
    document.body.appendChild(tooltip);

    // Auto-remove after duration
    if (step.duration) {
      setTimeout(() => {
        this.removeTooltip(step.id);
      }, step.duration);
    }
  }

  /**
   * Show highlight
   */
  showHighlight(step) {
    const target = document.querySelector(`[data-tutorial="${step.target}"]`);
    if (!target) {
      this.logger.warn(`Highlight target not found: ${step.target}`);
      return;
    }

    const highlight = this.createHighlight();
    this.positionHighlight(highlight, target);

    this.highlightSystem.activeHighlights.set(step.id, highlight);
    document.body.appendChild(highlight);

    // Auto-remove after duration
    if (step.duration) {
      setTimeout(() => {
        this.removeHighlight(step.id);
      }, step.duration);
    }
  }

  /**
   * Show overlay
   */
  showOverlay(step) {
    const overlay = this.createOverlay(step.title, step.message);

    this.overlaySystem.activeOverlays.set(step.id, overlay);
    document.body.appendChild(overlay);

    // Auto-remove after duration
    if (step.duration) {
      setTimeout(() => {
        this.removeOverlay(step.id);
      }, step.duration);
    }
  }

  /**
   * Show interaction
   */
  showInteraction(step) {
    const target = document.querySelector(`[data-tutorial="${step.target}"]`);
    if (!target) {
      this.logger.warn(`Interaction target not found: ${step.target}`);
      return;
    }

    // Highlight the target
    this.showHighlight(step);

    // Add click listener
    const clickHandler = (event) => {
      event.preventDefault();
      this.removeHighlight(step.id);
      target.removeEventListener('click', clickHandler);
      this.nextStep();
    };

    target.addEventListener('click', clickHandler);
  }

  /**
   * Show demonstration
   */
  showDemonstration(step) {
    // Show tooltip with instructions
    this.showTooltip(step);

    // Simulate the action
    setTimeout(() => {
      this.simulateAction(step.action);
    }, 2000);
  }

  /**
   * Show quiz
   */
  showQuiz(step) {
    // Create quiz overlay
    const overlay = this.createQuizOverlay(step);

    this.overlaySystem.activeOverlays.set(step.id, overlay);
    document.body.appendChild(overlay);
  }

  /**
   * Show practice
   */
  showPractice(step) {
    // Show practice instructions
    this.showOverlay(step);

    // Enable practice mode
    this.enablePracticeMode(step);
  }

  /**
   * Create tooltip
   */
  createTooltip(title, message) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tutorial-tooltip';
    tooltip.innerHTML = `
      <div class="tooltip-title">${title}</div>
      <div class="tooltip-message">${message}</div>
    `;

    Object.assign(tooltip.style, this.tooltipSystem.tooltipStyle);

    return tooltip;
  }

  /**
   * Create highlight
   */
  createHighlight() {
    const highlight = document.createElement('div');
    highlight.className = 'tutorial-highlight';

    Object.assign(highlight.style, this.highlightSystem.highlightStyle);

    return highlight;
  }

  /**
   * Create overlay
   */
  createOverlay(title, message) {
    const overlay = document.createElement('div');
    overlay.className = 'tutorial-overlay';
    overlay.innerHTML = `
      <div class="overlay-content">
        <div class="overlay-title">${title}</div>
        <div class="overlay-message">${message}</div>
        <div class="overlay-actions">
          <button class="tutorial-next">Next</button>
          <button class="tutorial-skip">Skip</button>
        </div>
      </div>
    `;

    Object.assign(overlay.style, this.overlaySystem.overlayStyle);

    // Add event listeners
    overlay.querySelector('.tutorial-next').addEventListener('click', () => {
      this.nextStep();
    });

    overlay.querySelector('.tutorial-skip').addEventListener('click', () => {
      this.skipTutorial();
    });

    return overlay;
  }

  /**
   * Create quiz overlay
   */
  createQuizOverlay(step) {
    const overlay = document.createElement('div');
    overlay.className = 'tutorial-quiz';
    overlay.innerHTML = `
      <div class="quiz-content">
        <div class="quiz-title">${step.title}</div>
        <div class="quiz-question">${step.message}</div>
        <div class="quiz-options">
          ${step.options
            .map(
              (option, index) => `
            <button class="quiz-option" data-answer="${index}">${option}</button>
          `
            )
            .join('')}
        </div>
      </div>
    `;

    Object.assign(overlay.style, this.overlaySystem.overlayStyle);

    // Add event listeners
    overlay.querySelectorAll('.quiz-option').forEach((button) => {
      button.addEventListener('click', (event) => {
        const answer = event.target.dataset.answer;
        this.handleQuizAnswer(step, answer);
      });
    });

    return overlay;
  }

  /**
   * Position tooltip
   */
  positionTooltip(tooltip, target) {
    const targetRect = target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    let left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
    let top = targetRect.bottom + 10;

    // Adjust if tooltip goes off screen
    if (left < 0) left = 10;
    if (left + tooltipRect.width > window.innerWidth) {
      left = window.innerWidth - tooltipRect.width - 10;
    }
    if (top + tooltipRect.height > window.innerHeight) {
      top = targetRect.top - tooltipRect.height - 10;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  /**
   * Position highlight
   */
  positionHighlight(highlight, target) {
    const targetRect = target.getBoundingClientRect();

    highlight.style.left = `${targetRect.left - 3}px`;
    highlight.style.top = `${targetRect.top - 3}px`;
    highlight.style.width = `${targetRect.width + 6}px`;
    highlight.style.height = `${targetRect.height + 6}px`;
  }

  /**
   * Remove tooltip
   */
  removeTooltip(stepId) {
    const tooltip = this.tooltipSystem.activeTooltips.get(stepId);
    if (tooltip) {
      tooltip.remove();
      this.tooltipSystem.activeTooltips.delete(stepId);
    }
  }

  /**
   * Remove highlight
   */
  removeHighlight(stepId) {
    const highlight = this.highlightSystem.activeHighlights.get(stepId);
    if (highlight) {
      highlight.remove();
      this.highlightSystem.activeHighlights.delete(stepId);
    }
  }

  /**
   * Remove overlay
   */
  removeOverlay(stepId) {
    const overlay = this.overlaySystem.activeOverlays.get(stepId);
    if (overlay) {
      overlay.remove();
      this.overlaySystem.activeOverlays.delete(stepId);
    }
  }

  /**
   * Clear all tooltips
   */
  clearAllTooltips() {
    this.tooltipSystem.activeTooltips.forEach((tooltip) => tooltip.remove());
    this.tooltipSystem.activeTooltips.clear();
  }

  /**
   * Clear all highlights
   */
  clearAllHighlights() {
    this.highlightSystem.activeHighlights.forEach((highlight) =>
      highlight.remove()
    );
    this.highlightSystem.activeHighlights.clear();
  }

  /**
   * Clear all overlays
   */
  clearAllOverlays() {
    this.overlaySystem.activeOverlays.forEach((overlay) => overlay.remove());
    this.overlaySystem.activeOverlays.clear();
  }

  /**
   * Simulate action
   */
  simulateAction(action) {
    // Simulate different actions
    switch (action) {
      case 'click':
        // Simulate click
        break;
      case 'drag':
        // Simulate drag
        break;
      case 'hover':
        // Simulate hover
        break;
    }
  }

  /**
   * Enable practice mode
   */
  enablePracticeMode(step) {
    // Enable practice mode for the specific action
    this.eventBus.emit('tutorial:practiceMode', {
      step: step,
      enabled: true,
    });
  }

  /**
   * Handle quiz answer
   */
  handleQuizAnswer(step, answer) {
    const isCorrect = answer === step.correctAnswer;

    if (isCorrect) {
      this.nextStep();
    } else {
      // Show incorrect answer feedback
      this.showIncorrectAnswerFeedback();
    }
  }

  /**
   * Show incorrect answer feedback
   */
  showIncorrectAnswerFeedback() {
    // Show feedback for incorrect answer
    this.eventBus.emit('tutorial:incorrectAnswer', {
      timestamp: Date.now(),
    });
  }

  /**
   * Update active tutorial
   */
  updateActiveTutorial(deltaTime) {
    if (!this.tutorialState.activeTutorial) {
      return;
    }

    // Update tutorial logic
  }

  /**
   * Update tooltips
   */
  updateTooltips(deltaTime) {
    // Update tooltip logic
  }

  /**
   * Update highlights
   */
  updateHighlights(deltaTime) {
    // Update highlight logic
  }

  /**
   * Update overlays
   */
  updateOverlays(deltaTime) {
    // Update overlay logic
  }

  /**
   * Update tutorial queue
   */
  updateTutorialQueue(deltaTime) {
    // Process tutorial queue
    if (
      this.tutorialState.tutorialQueue.length > 0 &&
      !this.tutorialState.activeTutorial
    ) {
      const nextTutorial = this.tutorialState.tutorialQueue.shift();
      this.startTutorial(nextTutorial);
    }
  }

  /**
   * Handle player level up
   */
  handlePlayerLevelUp(data) {
    const { level } = data;
    this.tutorialState.playerLevel = level;

    // Check for level-based tutorials
    this.checkLevelBasedTutorials(level);
  }

  /**
   * Handle player first kill
   */
  handlePlayerFirstKill(data) {
    this.queueTutorial('combat_basics');
  }

  /**
   * Handle player first item
   */
  handlePlayerFirstItem(data) {
    this.queueTutorial('inventory_management');
  }

  /**
   * Handle player first trade
   */
  handlePlayerFirstTrade(data) {
    this.queueTutorial('trading_system');
  }

  /**
   * Handle player first dungeon
   */
  handlePlayerFirstDungeon(data) {
    this.queueTutorial('exploration');
  }

  /**
   * Handle element click
   */
  handleElementClick(data) {
    if (!this.tutorialState.activeTutorial) {
      return;
    }

    const step =
      this.tutorialState.activeTutorial.steps[this.tutorialState.currentStep];
    if (step && step.action === 'click' && data.element === step.target) {
      this.nextStep();
    }
  }

  /**
   * Handle element hover
   */
  handleElementHover(data) {
    if (!this.tutorialState.activeTutorial) {
      return;
    }

    const step =
      this.tutorialState.activeTutorial.steps[this.tutorialState.currentStep];
    if (step && step.action === 'hover' && data.element === step.target) {
      this.nextStep();
    }
  }

  /**
   * Handle element focus
   */
  handleElementFocus(data) {
    if (!this.tutorialState.activeTutorial) {
      return;
    }

    const step =
      this.tutorialState.activeTutorial.steps[this.tutorialState.currentStep];
    if (step && step.action === 'focus' && data.element === step.target) {
      this.nextStep();
    }
  }

  /**
   * Check if new player
   */
  checkIfNewPlayer() {
    const savedData = localStorage.getItem('tutorialData');
    if (!savedData) {
      this.tutorialState.isFirstTime = true;
    } else {
      this.tutorialState.isFirstTime = false;
    }
  }

  /**
   * Check level-based tutorials
   */
  checkLevelBasedTutorials(level) {
    for (const [id, tutorial] of this.tutorialState.tutorialProgress) {
      if (
        tutorial.level === level &&
        !tutorial.completed &&
        !tutorial.skipped
      ) {
        this.queueTutorial(id);
      }
    }
  }

  /**
   * Queue tutorial
   */
  queueTutorial(tutorialId) {
    if (!this.tutorialState.tutorialQueue.includes(tutorialId)) {
      this.tutorialState.tutorialQueue.push(tutorialId);
    }
  }

  /**
   * Save tutorial progress
   */
  saveTutorialProgress() {
    try {
      const data = {
        completedTutorials: Array.from(this.tutorialState.completedTutorials),
        skippedTutorials: Array.from(this.tutorialState.skippedTutorials),
        tutorialProgress: Array.from(
          this.tutorialState.tutorialProgress.entries()
        ),
        settings: this.tutorialState.settings,
        isFirstTime: this.tutorialState.isFirstTime,
        timestamp: Date.now(),
      };

      localStorage.setItem('tutorialData', JSON.stringify(data));
      this.logger.info('Tutorial progress saved');
    } catch (error) {
      this.logger.error('Failed to save tutorial progress:', error);
    }
  }

  /**
   * Load tutorial progress
   */
  async loadTutorialProgress() {
    try {
      const savedData = localStorage.getItem('tutorialData');
      if (savedData) {
        const data = JSON.parse(savedData);

        this.tutorialState.completedTutorials = new Set(
          data.completedTutorials || []
        );
        this.tutorialState.skippedTutorials = new Set(
          data.skippedTutorials || []
        );
        this.tutorialState.tutorialProgress = new Map(
          data.tutorialProgress || []
        );
        this.tutorialState.settings = {
          ...this.tutorialState.settings,
          ...data.settings,
        };
        this.tutorialState.isFirstTime =
          data.isFirstTime !== undefined ? data.isFirstTime : true;

        this.logger.info('Tutorial progress loaded');
      }
    } catch (error) {
      this.logger.error('Failed to load tutorial progress:', error);
    }
  }

  /**
   * Get tutorial
   */
  getTutorial(tutorialId) {
    return this.tutorialState.tutorialProgress.get(tutorialId);
  }

  /**
   * Get all tutorials
   */
  getAllTutorials() {
    return Array.from(this.tutorialState.tutorialProgress.values());
  }

  /**
   * Get tutorials by category
   */
  getTutorialsByCategory(category) {
    return Array.from(this.tutorialState.tutorialProgress.values()).filter(
      (tutorial) => tutorial.category === category
    );
  }

  /**
   * Get active tutorial
   */
  getActiveTutorial() {
    return this.tutorialState.activeTutorial;
  }

  /**
   * Is tutorial completed
   */
  isTutorialCompleted(tutorialId) {
    return this.tutorialState.completedTutorials.has(tutorialId);
  }

  /**
   * Is tutorial skipped
   */
  isTutorialSkipped(tutorialId) {
    return this.tutorialState.skippedTutorials.has(tutorialId);
  }

  /**
   * Get tutorial progress
   */
  getTutorialProgress() {
    return {
      completed: this.tutorialState.completedTutorials.size,
      total: this.tutorialState.tutorialProgress.size,
      percentage:
        (this.tutorialState.completedTutorials.size /
          this.tutorialState.tutorialProgress.size) *
        100,
    };
  }

  /**
   * Set tutorial setting
   */
  setTutorialSetting(setting, value) {
    if (this.tutorialState.settings.hasOwnProperty(setting)) {
      this.tutorialState.settings[setting] = value;
    }
  }

  /**
   * Get tutorial settings
   */
  getTutorialSettings() {
    return { ...this.tutorialState.settings };
  }

  /**
   * Reset tutorial progress
   */
  resetTutorialProgress() {
    this.tutorialState.completedTutorials.clear();
    this.tutorialState.skippedTutorials.clear();
    this.tutorialState.tutorialProgress.clear();
    this.tutorialState.isFirstTime = true;

    // Reinitialize tutorials
    this.initializeTutorials();
  }
}

export default TutorialSystem;
