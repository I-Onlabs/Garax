/**
 * TradingSystem.js - Player-Driven Economy and Trading System
 *
 * This system handles:
 * - Player-to-player trading
 * - Auction house functionality
 * - Market pricing and valuation
 * - Trade history and reputation
 * - Currency exchange
 * - Item valuation and appraisal
 */

export class TradingSystem {
  constructor(dependencies = {}) {
    // Dependency injection
    this.eventBus = dependencies.eventBus;
    this.logger = dependencies.logger;
    this.config = dependencies.config;

    // Validate required dependencies
    if (!this.eventBus) {
      throw new Error('TradingSystem requires eventBus dependency');
    }
    if (!this.logger) {
      throw new Error('TradingSystem requires logger dependency');
    }

    // Trading state
    this.tradingState = {
      activeTrades: new Map(),
      tradeHistory: new Map(),
      auctionHouse: new Map(),
      marketPrices: new Map(),
      playerReputation: new Map(),
      currencyRates: new Map(),
      tradeChannels: new Map(),
      pendingTrades: new Map(),
    };

    // Trading configuration
    this.tradingConfig = {
      maxTradeValue: 1000000,
      tradeTax: 0.05, // 5% tax on trades
      auctionTax: 0.1, // 10% tax on auctions
      maxAuctionDuration: 7 * 24 * 60 * 60 * 1000, // 7 days
      minAuctionDuration: 60 * 60 * 1000, // 1 hour
      reputationDecay: 0.01, // 1% reputation decay per day
      maxPendingTrades: 10,
      tradeTimeout: 300000, // 5 minutes
    };

    // Initialize trading systems
    this.initializeCurrencies();
    this.initializeTradeChannels();
    this.initializeMarketData();
    this.initializeReputationSystem();

    // Event handlers
    this.setupEventHandlers();

    this.logger.info('TradingSystem initialized');
  }

  /**
   * Initialize the system
   */
  async initialize() {
    this.logger.info('Initializing TradingSystem...');

    // Load trading data
    await this.loadTradingData();

    // Start market updates
    this.startMarketUpdates();

    this.logger.info('TradingSystem initialized successfully');
  }

  /**
   * Cleanup the system
   */
  cleanup() {
    this.logger.info('Cleaning up TradingSystem...');

    // Save trading data
    this.saveTradingData();

    // Stop market updates
    this.stopMarketUpdates();

    // Clear state
    this.tradingState.activeTrades.clear();
    this.tradingState.tradeHistory.clear();
    this.tradingState.auctionHouse.clear();
    this.tradingState.marketPrices.clear();
    this.tradingState.playerReputation.clear();
    this.tradingState.currencyRates.clear();
    this.tradingState.tradeChannels.clear();
    this.tradingState.pendingTrades.clear();

    // Remove event listeners
    this.removeEventHandlers();

    this.logger.info('TradingSystem cleaned up');
  }

  /**
   * Update the system
   */
  update(deltaTime, gameState) {
    // Update active trades
    this.updateActiveTrades(deltaTime);

    // Update auction house
    this.updateAuctionHouse(deltaTime);

    // Update market prices
    this.updateMarketPrices(deltaTime);

    // Update reputation decay
    this.updateReputationDecay(deltaTime);
  }

  /**
   * Initialize currencies
   */
  initializeCurrencies() {
    this.tradingState.currencyRates.set('gold', {
      name: 'Gold',
      symbol: 'G',
      baseValue: 1,
      decimals: 0,
    });

    this.tradingState.currencyRates.set('silver', {
      name: 'Silver',
      symbol: 'S',
      baseValue: 0.1,
      decimals: 2,
    });

    this.tradingState.currencyRates.set('copper', {
      name: 'Copper',
      symbol: 'C',
      baseValue: 0.01,
      decimals: 2,
    });

    this.tradingState.currencyRates.set('platinum', {
      name: 'Platinum',
      symbol: 'P',
      baseValue: 10,
      decimals: 0,
    });

    this.tradingState.currencyRates.set('gems', {
      name: 'Gems',
      symbol: '💎',
      baseValue: 100,
      decimals: 0,
    });
  }

  /**
   * Initialize trade channels
   */
  initializeTradeChannels() {
    this.tradingState.tradeChannels.set('global', {
      id: 'global',
      name: 'Global Trade',
      description: 'Worldwide trading channel',
      maxPlayers: 1000,
      taxRate: 0.05,
      minLevel: 1,
      active: true,
    });

    this.tradingState.tradeChannels.set('guild', {
      id: 'guild',
      name: 'Guild Trade',
      description: 'Guild-only trading channel',
      maxPlayers: 100,
      taxRate: 0.02,
      minLevel: 10,
      active: true,
    });

    this.tradingState.tradeChannels.set('whisper', {
      id: 'whisper',
      name: 'Private Trade',
      description: 'Direct player-to-player trading',
      maxPlayers: 2,
      taxRate: 0.01,
      minLevel: 1,
      active: true,
    });

    this.tradingState.tradeChannels.set('premium', {
      id: 'premium',
      name: 'Premium Trade',
      description: 'High-value trading channel',
      maxPlayers: 500,
      taxRate: 0.03,
      minLevel: 50,
      active: true,
    });
  }

  /**
   * Initialize market data
   */
  initializeMarketData() {
    // Initialize market prices for common items
    this.tradingState.marketPrices.set('health_potion', {
      item: 'health_potion',
      basePrice: 10,
      currentPrice: 10,
      volatility: 0.1,
      lastUpdate: Date.now(),
      volume: 0,
      trend: 'stable',
    });

    this.tradingState.marketPrices.set('mana_potion', {
      item: 'mana_potion',
      basePrice: 15,
      currentPrice: 15,
      volatility: 0.1,
      lastUpdate: Date.now(),
      volume: 0,
      trend: 'stable',
    });

    this.tradingState.marketPrices.set('iron_sword', {
      item: 'iron_sword',
      basePrice: 100,
      currentPrice: 100,
      volatility: 0.2,
      lastUpdate: Date.now(),
      volume: 0,
      trend: 'stable',
    });

    this.tradingState.marketPrices.set('magic_ring', {
      item: 'magic_ring',
      basePrice: 500,
      currentPrice: 500,
      volatility: 0.3,
      lastUpdate: Date.now(),
      volume: 0,
      trend: 'stable',
    });
  }

  /**
   * Initialize reputation system
   */
  initializeReputationSystem() {
    this.reputationSystem = {
      levels: [
        { name: 'Hated', min: -1000, max: -500, color: '#ff0000' },
        { name: 'Disliked', min: -500, max: -100, color: '#ff8000' },
        { name: 'Neutral', min: -100, max: 100, color: '#ffff00' },
        { name: 'Liked', min: 100, max: 500, color: '#80ff00' },
        { name: 'Respected', min: 500, max: 1000, color: '#00ff00' },
        { name: 'Honored', min: 1000, max: 2000, color: '#00ff80' },
        { name: 'Revered', min: 2000, max: 5000, color: '#0080ff' },
        { name: 'Exalted', min: 5000, max: 10000, color: '#8000ff' },
      ],
      decayRate: 0.01, // 1% per day
      maxReputation: 10000,
      minReputation: -1000,
    };
  }

  /**
   * Set up event handlers
   */
  setupEventHandlers() {
    // Trading events
    this.eventBus.on('trade:initiate', this.initiateTrade.bind(this));
    this.eventBus.on('trade:accept', this.acceptTrade.bind(this));
    this.eventBus.on('trade:decline', this.declineTrade.bind(this));
    this.eventBus.on('trade:modify', this.modifyTrade.bind(this));
    this.eventBus.on('trade:complete', this.completeTrade.bind(this));
    this.eventBus.on('trade:cancel', this.cancelTrade.bind(this));

    // Auction events
    this.eventBus.on('auction:list', this.listAuction.bind(this));
    this.eventBus.on('auction:bid', this.placeBid.bind(this));
    this.eventBus.on('auction:buyout', this.buyoutAuction.bind(this));
    this.eventBus.on('auction:expire', this.expireAuction.bind(this));

    // Market events
    this.eventBus.on('market:priceUpdate', this.updateItemPrice.bind(this));
    this.eventBus.on('market:search', this.searchMarket.bind(this));

    // Reputation events
    this.eventBus.on('reputation:update', this.updateReputation.bind(this));
  }

  /**
   * Remove event handlers
   */
  removeEventHandlers() {
    this.eventBus.removeListener(
      'trade:initiate',
      this.initiateTrade.bind(this)
    );
    this.eventBus.removeListener('trade:accept', this.acceptTrade.bind(this));
    this.eventBus.removeListener('trade:decline', this.declineTrade.bind(this));
    this.eventBus.removeListener('trade:modify', this.modifyTrade.bind(this));
    this.eventBus.removeListener(
      'trade:complete',
      this.completeTrade.bind(this)
    );
    this.eventBus.removeListener('trade:cancel', this.cancelTrade.bind(this));
    this.eventBus.removeListener('auction:list', this.listAuction.bind(this));
    this.eventBus.removeListener('auction:bid', this.placeBid.bind(this));
    this.eventBus.removeListener(
      'auction:buyout',
      this.buyoutAuction.bind(this)
    );
    this.eventBus.removeListener(
      'auction:expire',
      this.expireAuction.bind(this)
    );
    this.eventBus.removeListener(
      'market:priceUpdate',
      this.updateItemPrice.bind(this)
    );
    this.eventBus.removeListener('market:search', this.searchMarket.bind(this));
    this.eventBus.removeListener(
      'reputation:update',
      this.updateReputation.bind(this)
    );
  }

  /**
   * Initiate trade
   */
  initiateTrade(data) {
    const { fromPlayer, toPlayer, items, currency, channel } = data;

    // Validate trade
    if (!this.validateTrade(fromPlayer, toPlayer, items, currency)) {
      this.logger.warn('Invalid trade request');
      return;
    }

    // Check if players can trade
    if (!this.canPlayersTrade(fromPlayer, toPlayer)) {
      this.logger.warn('Players cannot trade');
      return;
    }

    // Create trade
    const trade = this.createTrade(
      fromPlayer,
      toPlayer,
      items,
      currency,
      channel
    );

    this.tradingState.activeTrades.set(trade.id, trade);

    this.eventBus.emit('trade:initiated', {
      trade,
      timestamp: Date.now(),
    });
  }

  /**
   * Accept trade
   */
  acceptTrade(data) {
    const { tradeId, playerId } = data;
    const trade = this.tradingState.activeTrades.get(tradeId);

    if (!trade) {
      this.logger.error(`Trade not found: ${tradeId}`);
      return;
    }

    if (trade.toPlayer.id !== playerId) {
      this.logger.warn('Player cannot accept this trade');
      return;
    }

    trade.status = 'accepted';
    trade.acceptedAt = Date.now();

    // Start trade completion timer
    this.startTradeCompletionTimer(trade);

    this.eventBus.emit('trade:accepted', {
      trade,
      timestamp: Date.now(),
    });
  }

  /**
   * Decline trade
   */
  declineTrade(data) {
    const { tradeId, playerId, reason } = data;
    const trade = this.tradingState.activeTrades.get(tradeId);

    if (!trade) {
      this.logger.error(`Trade not found: ${tradeId}`);
      return;
    }

    if (trade.toPlayer.id !== playerId) {
      this.logger.warn('Player cannot decline this trade');
      return;
    }

    trade.status = 'declined';
    trade.declinedAt = Date.now();
    trade.declineReason = reason;

    // Remove from active trades
    this.tradingState.activeTrades.delete(tradeId);

    this.eventBus.emit('trade:declined', {
      trade,
      reason,
      timestamp: Date.now(),
    });
  }

  /**
   * Modify trade
   */
  modifyTrade(data) {
    const { tradeId, playerId, newItems, newCurrency } = data;
    const trade = this.tradingState.activeTrades.get(tradeId);

    if (!trade) {
      this.logger.error(`Trade not found: ${tradeId}`);
      return;
    }

    if (trade.fromPlayer.id !== playerId) {
      this.logger.warn('Player cannot modify this trade');
      return;
    }

    // Update trade
    trade.items = newItems;
    trade.currency = newCurrency;
    trade.modifiedAt = Date.now();

    this.eventBus.emit('trade:modified', {
      trade,
      timestamp: Date.now(),
    });
  }

  /**
   * Complete trade
   */
  completeTrade(data) {
    const { tradeId } = data;
    const trade = this.tradingState.activeTrades.get(tradeId);

    if (!trade) {
      this.logger.error(`Trade not found: ${tradeId}`);
      return;
    }

    if (trade.status !== 'accepted') {
      this.logger.warn('Trade not accepted');
      return;
    }

    // Execute trade
    this.executeTrade(trade);

    // Update reputation
    this.updateTradeReputation(trade);

    // Add to trade history
    this.addToTradeHistory(trade);

    // Remove from active trades
    this.tradingState.activeTrades.delete(tradeId);

    this.eventBus.emit('trade:completed', {
      trade,
      timestamp: Date.now(),
    });
  }

  /**
   * Cancel trade
   */
  cancelTrade(data) {
    const { tradeId, playerId, reason } = data;
    const trade = this.tradingState.activeTrades.get(tradeId);

    if (!trade) {
      this.logger.error(`Trade not found: ${tradeId}`);
      return;
    }

    if (trade.fromPlayer.id !== playerId) {
      this.logger.warn('Player cannot cancel this trade');
      return;
    }

    trade.status = 'cancelled';
    trade.cancelledAt = Date.now();
    trade.cancelReason = reason;

    // Remove from active trades
    this.tradingState.activeTrades.delete(tradeId);

    this.eventBus.emit('trade:cancelled', {
      trade,
      reason,
      timestamp: Date.now(),
    });
  }

  /**
   * List auction
   */
  listAuction(data) {
    const { playerId, item, startingPrice, buyoutPrice, duration, channel } =
      data;

    // Validate auction
    if (
      !this.validateAuction(
        playerId,
        item,
        startingPrice,
        buyoutPrice,
        duration
      )
    ) {
      this.logger.warn('Invalid auction request');
      return;
    }

    // Create auction
    const auction = this.createAuction(
      playerId,
      item,
      startingPrice,
      buyoutPrice,
      duration,
      channel
    );

    this.tradingState.auctionHouse.set(auction.id, auction);

    this.eventBus.emit('auction:listed', {
      auction,
      timestamp: Date.now(),
    });
  }

  /**
   * Place bid
   */
  placeBid(data) {
    const { auctionId, playerId, bidAmount } = data;
    const auction = this.tradingState.auctionHouse.get(auctionId);

    if (!auction) {
      this.logger.error(`Auction not found: ${auctionId}`);
      return;
    }

    if (auction.status !== 'active') {
      this.logger.warn('Auction not active');
      return;
    }

    if (bidAmount <= auction.currentBid) {
      this.logger.warn('Bid too low');
      return;
    }

    // Update auction
    auction.currentBid = bidAmount;
    auction.currentBidder = playerId;
    auction.bidCount++;
    auction.lastBidAt = Date.now();

    this.eventBus.emit('auction:bidPlaced', {
      auction,
      bidAmount,
      playerId,
      timestamp: Date.now(),
    });
  }

  /**
   * Buyout auction
   */
  buyoutAuction(data) {
    const { auctionId, playerId } = data;
    const auction = this.tradingState.auctionHouse.get(auctionId);

    if (!auction) {
      this.logger.error(`Auction not found: ${auctionId}`);
      return;
    }

    if (auction.status !== 'active') {
      this.logger.warn('Auction not active');
      return;
    }

    if (!auction.buyoutPrice) {
      this.logger.warn('Auction has no buyout price');
      return;
    }

    // Complete auction
    this.completeAuction(auction, playerId, auction.buyoutPrice);

    this.eventBus.emit('auction:buyout', {
      auction,
      playerId,
      timestamp: Date.now(),
    });
  }

  /**
   * Expire auction
   */
  expireAuction(data) {
    const { auctionId } = data;
    const auction = this.tradingState.auctionHouse.get(auctionId);

    if (!auction) {
      this.logger.error(`Auction not found: ${auctionId}`);
      return;
    }

    auction.status = 'expired';
    auction.expiredAt = Date.now();

    // Process auction result
    if (auction.currentBidder) {
      this.completeAuction(auction, auction.currentBidder, auction.currentBid);
    } else {
      this.returnAuctionItem(auction);
    }

    this.eventBus.emit('auction:expired', {
      auction,
      timestamp: Date.now(),
    });
  }

  /**
   * Update item price
   */
  updateItemPrice(data) {
    const { item, newPrice, volume } = data;
    const priceData = this.tradingState.marketPrices.get(item);

    if (!priceData) {
      this.logger.error(`Price data not found for item: ${item}`);
      return;
    }

    // Update price with market dynamics
    const oldPrice = priceData.currentPrice;
    priceData.currentPrice = newPrice;
    priceData.volume += volume || 1;
    priceData.lastUpdate = Date.now();

    // Calculate trend
    if (newPrice > oldPrice) {
      priceData.trend = 'rising';
    } else if (newPrice < oldPrice) {
      priceData.trend = 'falling';
    } else {
      priceData.trend = 'stable';
    }

    this.eventBus.emit('market:priceUpdated', {
      item,
      oldPrice,
      newPrice,
      trend: priceData.trend,
      timestamp: Date.now(),
    });
  }

  /**
   * Search market
   */
  searchMarket(data) {
    const { query, filters, sortBy, limit } = data;

    let results = [];

    // Search active trades
    for (const trade of this.tradingState.activeTrades.values()) {
      if (this.matchesSearchCriteria(trade, query, filters)) {
        results.push({
          type: 'trade',
          id: trade.id,
          item: trade.items[0],
          price: trade.currency,
          player: trade.fromPlayer,
          timestamp: trade.createdAt,
        });
      }
    }

    // Search auctions
    for (const auction of this.tradingState.auctionHouse.values()) {
      if (
        auction.status === 'active' &&
        this.matchesSearchCriteria(auction, query, filters)
      ) {
        results.push({
          type: 'auction',
          id: auction.id,
          item: auction.item,
          price: auction.currentBid,
          buyoutPrice: auction.buyoutPrice,
          player: auction.seller,
          timeLeft: auction.endTime - Date.now(),
          timestamp: auction.createdAt,
        });
      }
    }

    // Sort results
    results = this.sortSearchResults(results, sortBy);

    // Limit results
    if (limit) {
      results = results.slice(0, limit);
    }

    this.eventBus.emit('market:searchResults', {
      query,
      results,
      timestamp: Date.now(),
    });
  }

  /**
   * Update reputation
   */
  updateReputation(data) {
    const { playerId, change, reason } = data;

    const currentRep = this.tradingState.playerReputation.get(playerId) || 0;
    const newRep = Math.max(
      this.reputationSystem.minReputation,
      Math.min(this.reputationSystem.maxReputation, currentRep + change)
    );

    this.tradingState.playerReputation.set(playerId, newRep);

    this.eventBus.emit('reputation:updated', {
      playerId,
      oldReputation: currentRep,
      newReputation: newRep,
      change,
      reason,
      timestamp: Date.now(),
    });
  }

  /**
   * Update active trades
   */
  updateActiveTrades(deltaTime) {
    const now = Date.now();

    for (const [tradeId, trade] of this.tradingState.activeTrades) {
      // Check for trade timeout
      if (now - trade.createdAt > this.tradingConfig.tradeTimeout) {
        this.timeoutTrade(trade);
      }
    }
  }

  /**
   * Update auction house
   */
  updateAuctionHouse(deltaTime) {
    const now = Date.now();

    for (const [auctionId, auction] of this.tradingState.auctionHouse) {
      if (auction.status === 'active' && now >= auction.endTime) {
        this.expireAuction({ auctionId });
      }
    }
  }

  /**
   * Update market prices
   */
  updateMarketPrices(deltaTime) {
    // Update market prices based on supply and demand
    for (const [item, priceData] of this.tradingState.marketPrices) {
      this.updateMarketPrice(priceData, deltaTime);
    }
  }

  /**
   * Update reputation decay
   */
  updateReputationDecay(deltaTime) {
    const decayAmount =
      (this.tradingConfig.reputationDecay * deltaTime) / (24 * 60 * 60 * 1000);

    for (const [playerId, reputation] of this.tradingState.playerReputation) {
      const newRep = Math.max(
        this.reputationSystem.minReputation,
        reputation - decayAmount
      );

      if (newRep !== reputation) {
        this.tradingState.playerReputation.set(playerId, newRep);
      }
    }
  }

  /**
   * Validate trade
   */
  validateTrade(fromPlayer, toPlayer, items, currency) {
    // Check if players exist
    if (!fromPlayer || !toPlayer) {
      return false;
    }

    // Check if players are different
    if (fromPlayer.id === toPlayer.id) {
      return false;
    }

    // Check if items are valid
    if (!items || items.length === 0) {
      return false;
    }

    // Check if currency is valid
    if (!currency || currency.amount <= 0) {
      return false;
    }

    // Check trade value limits
    const totalValue = this.calculateTradeValue(items, currency);
    if (totalValue > this.tradingConfig.maxTradeValue) {
      return false;
    }

    return true;
  }

  /**
   * Check if players can trade
   */
  canPlayersTrade(fromPlayer, toPlayer) {
    // Check if players are online
    if (!fromPlayer.online || !toPlayer.online) {
      return false;
    }

    // Check if players are in the same area
    if (fromPlayer.areaId !== toPlayer.areaId) {
      return false;
    }

    // Check if players are not in combat
    if (fromPlayer.inCombat || toPlayer.inCombat) {
      return false;
    }

    return true;
  }

  /**
   * Create trade
   */
  createTrade(fromPlayer, toPlayer, items, currency, channel) {
    return {
      id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fromPlayer: fromPlayer,
      toPlayer: toPlayer,
      items: items,
      currency: currency,
      channel: channel,
      status: 'pending',
      createdAt: Date.now(),
      acceptedAt: null,
      declinedAt: null,
      completedAt: null,
      cancelledAt: null,
    };
  }

  /**
   * Execute trade
   */
  executeTrade(trade) {
    // Transfer items from seller to buyer
    this.transferItems(trade.fromPlayer, trade.toPlayer, trade.items);

    // Transfer currency from buyer to seller
    this.transferCurrency(trade.toPlayer, trade.fromPlayer, trade.currency);

    // Apply trade tax
    this.applyTradeTax(trade);

    trade.status = 'completed';
    trade.completedAt = Date.now();
  }

  /**
   * Transfer items
   */
  transferItems(fromPlayer, toPlayer, items) {
    // This would transfer items between players
    this.logger.info(
      `Transferred ${items.length} items from ${fromPlayer.id} to ${toPlayer.id}`
    );
  }

  /**
   * Transfer currency
   */
  transferCurrency(fromPlayer, toPlayer, currency) {
    // This would transfer currency between players
    this.logger.info(
      `Transferred ${currency.amount} ${currency.type} from ${fromPlayer.id} to ${toPlayer.id}`
    );
  }

  /**
   * Apply trade tax
   */
  applyTradeTax(trade) {
    const channel = this.tradingState.tradeChannels.get(trade.channel);
    if (channel) {
      const taxAmount = trade.currency.amount * channel.taxRate;
      // Apply tax to the trade
      this.logger.info(`Applied ${taxAmount} tax to trade ${trade.id}`);
    }
  }

  /**
   * Update trade reputation
   */
  updateTradeReputation(trade) {
    // Update reputation based on trade completion
    this.updateReputation({
      playerId: trade.fromPlayer.id,
      change: 10,
      reason: 'successful_trade',
    });

    this.updateReputation({
      playerId: trade.toPlayer.id,
      change: 10,
      reason: 'successful_trade',
    });
  }

  /**
   * Add to trade history
   */
  addToTradeHistory(trade) {
    this.tradingState.tradeHistory.set(trade.id, {
      ...trade,
      historyType: 'completed',
    });
  }

  /**
   * Start trade completion timer
   */
  startTradeCompletionTimer(trade) {
    // Start timer for trade completion
    setTimeout(() => {
      if (trade.status === 'accepted') {
        this.completeTrade({ tradeId: trade.id });
      }
    }, 30000); // 30 seconds
  }

  /**
   * Timeout trade
   */
  timeoutTrade(trade) {
    trade.status = 'timeout';
    trade.timeoutAt = Date.now();

    this.tradingState.activeTrades.delete(trade.id);

    this.eventBus.emit('trade:timeout', {
      trade,
      timestamp: Date.now(),
    });
  }

  /**
   * Validate auction
   */
  validateAuction(playerId, item, startingPrice, buyoutPrice, duration) {
    // Check if player exists
    if (!playerId) {
      return false;
    }

    // Check if item is valid
    if (!item) {
      return false;
    }

    // Check if prices are valid
    if (startingPrice <= 0) {
      return false;
    }

    if (buyoutPrice && buyoutPrice <= startingPrice) {
      return false;
    }

    // Check if duration is valid
    if (
      duration < this.tradingConfig.minAuctionDuration ||
      duration > this.tradingConfig.maxAuctionDuration
    ) {
      return false;
    }

    return true;
  }

  /**
   * Create auction
   */
  createAuction(playerId, item, startingPrice, buyoutPrice, duration, channel) {
    return {
      id: `auction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      seller: playerId,
      item: item,
      startingPrice: startingPrice,
      currentBid: startingPrice,
      buyoutPrice: buyoutPrice,
      currentBidder: null,
      bidCount: 0,
      channel: channel,
      status: 'active',
      createdAt: Date.now(),
      endTime: Date.now() + duration,
      lastBidAt: null,
      completedAt: null,
      expiredAt: null,
    };
  }

  /**
   * Complete auction
   */
  completeAuction(auction, buyerId, finalPrice) {
    auction.status = 'completed';
    auction.completedAt = Date.now();
    auction.finalPrice = finalPrice;
    auction.buyer = buyerId;

    // Transfer item and currency
    this.transferAuctionItem(auction);
    this.transferAuctionCurrency(auction);

    // Apply auction tax
    this.applyAuctionTax(auction);
  }

  /**
   * Return auction item
   */
  returnAuctionItem(auction) {
    // Return item to seller
    this.logger.info(`Returned auction item to seller ${auction.seller}`);
  }

  /**
   * Transfer auction item
   */
  transferAuctionItem(auction) {
    // Transfer item from seller to buyer
    this.logger.info(
      `Transferred auction item from ${auction.seller} to ${auction.buyer}`
    );
  }

  /**
   * Transfer auction currency
   */
  transferAuctionCurrency(auction) {
    // Transfer currency from buyer to seller
    this.logger.info(
      `Transferred ${auction.finalPrice} currency for auction ${auction.id}`
    );
  }

  /**
   * Apply auction tax
   */
  applyAuctionTax(auction) {
    const taxAmount = auction.finalPrice * this.tradingConfig.auctionTax;
    this.logger.info(`Applied ${taxAmount} tax to auction ${auction.id}`);
  }

  /**
   * Calculate trade value
   */
  calculateTradeValue(items, currency) {
    let totalValue = 0;

    // Add item values
    items.forEach((item) => {
      const priceData = this.tradingState.marketPrices.get(item.type);
      if (priceData) {
        totalValue += priceData.currentPrice * item.quantity;
      }
    });

    // Add currency value
    totalValue += currency.amount;

    return totalValue;
  }

  /**
   * Matches search criteria
   */
  matchesSearchCriteria(item, query, filters) {
    // Check query match
    if (query && !item.item.name.toLowerCase().includes(query.toLowerCase())) {
      return false;
    }

    // Check filters
    if (filters) {
      if (filters.minPrice && item.price < filters.minPrice) {
        return false;
      }

      if (filters.maxPrice && item.price > filters.maxPrice) {
        return false;
      }

      if (filters.itemType && item.item.type !== filters.itemType) {
        return false;
      }

      if (filters.rarity && item.item.rarity !== filters.rarity) {
        return false;
      }
    }

    return true;
  }

  /**
   * Sort search results
   */
  sortSearchResults(results, sortBy) {
    switch (sortBy) {
      case 'price_asc':
        return results.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return results.sort((a, b) => b.price - a.price);
      case 'time_asc':
        return results.sort((a, b) => a.timestamp - b.timestamp);
      case 'time_desc':
        return results.sort((a, b) => b.timestamp - a.timestamp);
      default:
        return results;
    }
  }

  /**
   * Update market price
   */
  updateMarketPrice(priceData, deltaTime) {
    // Simple market dynamics simulation
    const volatility = priceData.volatility;
    const change = ((Math.random() - 0.5) * volatility * deltaTime) / 1000;

    priceData.currentPrice = Math.max(1, priceData.currentPrice + change);
  }

  /**
   * Start market updates
   */
  startMarketUpdates() {
    this.marketUpdateTimer = setInterval(() => {
      this.updateAllMarketPrices();
    }, 60000); // Update every minute
  }

  /**
   * Stop market updates
   */
  stopMarketUpdates() {
    if (this.marketUpdateTimer) {
      clearInterval(this.marketUpdateTimer);
    }
  }

  /**
   * Update all market prices
   */
  updateAllMarketPrices() {
    for (const [item, priceData] of this.tradingState.marketPrices) {
      this.updateMarketPrice(priceData, 60000);
    }
  }

  /**
   * Load trading data
   */
  async loadTradingData() {
    try {
      const savedData = localStorage.getItem('tradingData');
      if (savedData) {
        const data = JSON.parse(savedData);
        this.tradingState = { ...this.tradingState, ...data };
        this.logger.info('Trading data loaded from storage');
      }
    } catch (error) {
      this.logger.error('Failed to load trading data:', error);
    }
  }

  /**
   * Save trading data
   */
  saveTradingData() {
    try {
      const data = {
        tradeHistory: Array.from(this.tradingState.tradeHistory.entries()),
        marketPrices: Array.from(this.tradingState.marketPrices.entries()),
        playerReputation: Array.from(
          this.tradingState.playerReputation.entries()
        ),
        timestamp: Date.now(),
      };
      localStorage.setItem('tradingData', JSON.stringify(data));
      this.logger.info('Trading data saved to storage');
    } catch (error) {
      this.logger.error('Failed to save trading data:', error);
    }
  }

  /**
   * Get active trades
   */
  getActiveTrades() {
    return Array.from(this.tradingState.activeTrades.values());
  }

  /**
   * Get auction house
   */
  getAuctionHouse() {
    return Array.from(this.tradingState.auctionHouse.values());
  }

  /**
   * Get market prices
   */
  getMarketPrices() {
    return Array.from(this.tradingState.marketPrices.values());
  }

  /**
   * Get player reputation
   */
  getPlayerReputation(playerId) {
    return this.tradingState.playerReputation.get(playerId) || 0;
  }

  /**
   * Get trade history
   */
  getTradeHistory(playerId) {
    const history = [];
    for (const trade of this.tradingState.tradeHistory.values()) {
      if (trade.fromPlayer.id === playerId || trade.toPlayer.id === playerId) {
        history.push(trade);
      }
    }
    return history;
  }
}

export default TradingSystem;
