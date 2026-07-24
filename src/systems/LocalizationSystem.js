/**
 * LocalizationSystem.js - Multi-Language Support and Localization System
 *
 * This system handles:
 * - Multi-language text translation
 * - RTL (Right-to-Left) language support
 * - Date, time, and number formatting
 * - Currency and measurement units
 * - Pluralization and gender agreement
 * - Dynamic content translation
 * - Translation management and updates
 */

export class LocalizationSystem {
  constructor(dependencies = {}) {
    // Dependency injection
    this.eventBus = dependencies.eventBus;
    this.logger = dependencies.logger;
    this.config = dependencies.config;

    // Validate required dependencies
    if (!this.eventBus) {
      throw new Error('LocalizationSystem requires eventBus dependency');
    }
    if (!this.logger) {
      throw new Error('LocalizationSystem requires logger dependency');
    }

    // Localization system state
    this.localizationState = {
      currentLanguage: 'en',
      fallbackLanguage: 'en',
      supportedLanguages: new Map(),
      translations: new Map(),
      loadedLanguages: new Set(),
      rtlLanguages: new Set(['ar', 'he', 'fa', 'ur']),
      pluralRules: new Map(),
      dateFormats: new Map(),
      numberFormats: new Map(),
      currencyFormats: new Map(),
      measurementUnits: new Map(),
      genderRules: new Map(),
      contextRules: new Map(),
      dynamicContent: new Map(),
      missingTranslations: new Set(),
      autoDetect: true,
      cacheEnabled: true,
      cache: new Map(),
      lastUpdate: 0,
    };

    // Localization system configuration
    this.localizationConfig = {
      defaultLanguage: 'en',
      supportedLanguages: [
        { code: 'en', name: 'English', nativeName: 'English', rtl: false },
        { code: 'es', name: 'Spanish', nativeName: 'Español', rtl: false },
        { code: 'fr', name: 'French', nativeName: 'Français', rtl: false },
        { code: 'de', name: 'German', nativeName: 'Deutsch', rtl: false },
        { code: 'it', name: 'Italian', nativeName: 'Italiano', rtl: false },
        { code: 'pt', name: 'Portuguese', nativeName: 'Português', rtl: false },
        { code: 'ru', name: 'Russian', nativeName: 'Русский', rtl: false },
        { code: 'ja', name: 'Japanese', nativeName: '日本語', rtl: false },
        { code: 'ko', name: 'Korean', nativeName: '한국어', rtl: false },
        { code: 'zh', name: 'Chinese', nativeName: '中文', rtl: false },
        { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true },
        { code: 'he', name: 'Hebrew', nativeName: 'עברית', rtl: true },
        { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', rtl: false },
        { code: 'th', name: 'Thai', nativeName: 'ไทย', rtl: false },
        {
          code: 'vi',
          name: 'Vietnamese',
          nativeName: 'Tiếng Việt',
          rtl: false,
        },
      ],
      translationPaths: {
        base: '/locales/',
        format: '{language}.json',
        fallback: '/locales/en.json',
      },
      pluralRules: {
        en: { one: 'one', other: 'other' },
        es: { one: 'one', other: 'other' },
        fr: { one: 'one', other: 'other' },
        de: { one: 'one', other: 'other' },
        ru: { one: 'one', few: 'few', many: 'many', other: 'other' },
        ar: {
          zero: 'zero',
          one: 'one',
          two: 'two',
          few: 'few',
          many: 'many',
          other: 'other',
        },
      },
      dateFormats: {
        en: { short: 'MM/dd/yyyy', long: 'MMMM dd, yyyy', time: 'h:mm a' },
        es: { short: 'dd/MM/yyyy', long: 'dd de MMMM de yyyy', time: 'H:mm' },
        fr: { short: 'dd/MM/yyyy', long: 'dd MMMM yyyy', time: 'HH:mm' },
        de: { short: 'dd.MM.yyyy', long: 'dd. MMMM yyyy', time: 'HH:mm' },
        ja: { short: 'yyyy/MM/dd', long: 'yyyy年M月d日', time: 'H:mm' },
        ko: { short: 'yyyy.MM.dd', long: 'yyyy년 M월 d일', time: 'a h:mm' },
        zh: { short: 'yyyy/MM/dd', long: 'yyyy年M月d日', time: 'H:mm' },
        ar: { short: 'dd/MM/yyyy', long: 'dd MMMM yyyy', time: 'h:mm a' },
      },
      numberFormats: {
        en: { decimal: '.', thousands: ',', currency: '$' },
        es: { decimal: ',', thousands: '.', currency: '€' },
        fr: { decimal: ',', thousands: ' ', currency: '€' },
        de: { decimal: ',', thousands: '.', currency: '€' },
        ja: { decimal: '.', thousands: ',', currency: '¥' },
        ko: { decimal: '.', thousands: ',', currency: '₩' },
        zh: { decimal: '.', thousands: ',', currency: '¥' },
        ar: { decimal: '.', thousands: ',', currency: 'د.إ' },
      },
      measurementUnits: {
        en: { distance: 'miles', weight: 'pounds', temperature: 'fahrenheit' },
        es: {
          distance: 'kilometers',
          weight: 'kilograms',
          temperature: 'celsius',
        },
        fr: {
          distance: 'kilometers',
          weight: 'kilograms',
          temperature: 'celsius',
        },
        de: {
          distance: 'kilometers',
          weight: 'kilograms',
          temperature: 'celsius',
        },
        ja: {
          distance: 'kilometers',
          weight: 'kilograms',
          temperature: 'celsius',
        },
        ko: {
          distance: 'kilometers',
          weight: 'kilograms',
          temperature: 'celsius',
        },
        zh: {
          distance: 'kilometers',
          weight: 'kilograms',
          temperature: 'celsius',
        },
        ar: {
          distance: 'kilometers',
          weight: 'kilograms',
          temperature: 'celsius',
        },
      },
    };

    // Initialize localization system
    this.initializeLanguages();
    this.initializeTranslations();
    this.initializeFormatters();
    this.initializePluralRules();
    this.initializeGenderRules();
    this.initializeContextRules();

    // Event handlers
    this.setupEventHandlers();

    this.logger.info('LocalizationSystem initialized');
  }

  /**
   * Initialize the system
   */
  async initialize() {
    this.logger.info('Initializing LocalizationSystem...');

    // Detect language
    await this.detectLanguage();

    // Load translations
    await this.loadTranslations();

    // Apply language
    this.applyLanguage();

    this.logger.info('LocalizationSystem initialized successfully');
  }

  /**
   * Cleanup the system
   */
  cleanup() {
    this.logger.info('Cleaning up LocalizationSystem...');

    // Save current language
    this.saveCurrentLanguage();

    // Clear state
    this.localizationState.supportedLanguages.clear();
    this.localizationState.translations.clear();
    this.localizationState.loadedLanguages.clear();
    this.localizationState.pluralRules.clear();
    this.localizationState.dateFormats.clear();
    this.localizationState.numberFormats.clear();
    this.localizationState.currencyFormats.clear();
    this.localizationState.measurementUnits.clear();
    this.localizationState.genderRules.clear();
    this.localizationState.contextRules.clear();
    this.localizationState.dynamicContent.clear();
    this.localizationState.missingTranslations.clear();
    this.localizationState.cache.clear();

    // Remove event listeners
    this.removeEventHandlers();

    this.logger.info('LocalizationSystem cleaned up');
  }

  /**
   * Update the system
   */
  update(deltaTime, gameState) {
    // Update dynamic content
    this.updateDynamicContent(deltaTime);

    // Update cache
    this.updateCache(deltaTime);

    // Update missing translations
    this.updateMissingTranslations(deltaTime);
  }

  /**
   * Initialize languages
   */
  initializeLanguages() {
    this.localizationConfig.supportedLanguages.forEach((lang) => {
      this.localizationState.supportedLanguages.set(lang.code, {
        code: lang.code,
        name: lang.name,
        nativeName: lang.nativeName,
        rtl: lang.rtl || false,
      });
    });
  }

  /**
   * Initialize translations
   */
  initializeTranslations() {
    // Initialize translation structure
    this.localizationState.translations.set('en', new Map());
  }

  /**
   * Initialize formatters
   */
  initializeFormatters() {
    // Initialize date formatters
    Object.entries(this.localizationConfig.dateFormats).forEach(
      ([lang, formats]) => {
        this.localizationState.dateFormats.set(lang, formats);
      }
    );

    // Initialize number formatters
    Object.entries(this.localizationConfig.numberFormats).forEach(
      ([lang, formats]) => {
        this.localizationState.numberFormats.set(lang, formats);
      }
    );

    // Initialize currency formatters
    Object.entries(this.localizationConfig.numberFormats).forEach(
      ([lang, formats]) => {
        this.localizationState.currencyFormats.set(lang, formats.currency);
      }
    );

    // Initialize measurement units
    Object.entries(this.localizationConfig.measurementUnits).forEach(
      ([lang, units]) => {
        this.localizationState.measurementUnits.set(lang, units);
      }
    );
  }

  /**
   * Initialize plural rules
   */
  initializePluralRules() {
    Object.entries(this.localizationConfig.pluralRules).forEach(
      ([lang, rules]) => {
        this.localizationState.pluralRules.set(lang, rules);
      }
    );
  }

  /**
   * Initialize gender rules
   */
  initializeGenderRules() {
    // Initialize gender rules for different languages
    this.localizationState.genderRules.set('en', {
      masculine: ['he', 'him', 'his'],
      feminine: ['she', 'her', 'hers'],
      neutral: ['they', 'them', 'theirs'],
    });

    this.localizationState.genderRules.set('es', {
      masculine: ['él', 'lo', 'su'],
      feminine: ['ella', 'la', 'su'],
      neutral: ['ellos', 'los', 'sus'],
    });

    this.localizationState.genderRules.set('fr', {
      masculine: ['il', 'le', 'son'],
      feminine: ['elle', 'la', 'sa'],
      neutral: ['ils', 'les', 'leurs'],
    });
  }

  /**
   * Initialize context rules
   */
  initializeContextRules() {
    // Initialize context rules for different languages
    this.localizationState.contextRules.set('en', {
      formal: 'formal',
      informal: 'informal',
      polite: 'polite',
    });

    this.localizationState.contextRules.set('ja', {
      formal: '敬語',
      informal: '普通語',
      polite: '丁寧語',
    });

    this.localizationState.contextRules.set('ko', {
      formal: '존댓말',
      informal: '반말',
      polite: '정중어',
    });
  }

  /**
   * Set up event handlers
   */
  setupEventHandlers() {
    // Localization events
    this.eventBus.on(
      'localization:changeLanguage',
      this.changeLanguage.bind(this)
    );
    this.eventBus.on('localization:translate', this.translate.bind(this));
    this.eventBus.on('localization:format', this.format.bind(this));
    this.eventBus.on('localization:pluralize', this.pluralize.bind(this));
    this.eventBus.on('localization:genderize', this.genderize.bind(this));

    // UI events
    this.eventBus.on('ui:elementCreated', this.handleElementCreated.bind(this));
    this.eventBus.on('ui:elementUpdated', this.handleElementUpdated.bind(this));
    this.eventBus.on(
      'ui:elementDestroyed',
      this.handleElementDestroyed.bind(this)
    );

    // Game events
    this.eventBus.on('game:stateChange', this.handleGameStateChange.bind(this));
    this.eventBus.on('game:event', this.handleGameEvent.bind(this));
  }

  /**
   * Remove event handlers
   */
  removeEventHandlers() {
    this.eventBus.removeListener(
      'localization:changeLanguage',
      this.changeLanguage.bind(this)
    );
    this.eventBus.removeListener(
      'localization:translate',
      this.translate.bind(this)
    );
    this.eventBus.removeListener('localization:format', this.format.bind(this));
    this.eventBus.removeListener(
      'localization:pluralize',
      this.pluralize.bind(this)
    );
    this.eventBus.removeListener(
      'localization:genderize',
      this.genderize.bind(this)
    );
    this.eventBus.removeListener(
      'ui:elementCreated',
      this.handleElementCreated.bind(this)
    );
    this.eventBus.removeListener(
      'ui:elementUpdated',
      this.handleElementUpdated.bind(this)
    );
    this.eventBus.removeListener(
      'ui:elementDestroyed',
      this.handleElementDestroyed.bind(this)
    );
    this.eventBus.removeListener(
      'game:stateChange',
      this.handleGameStateChange.bind(this)
    );
    this.eventBus.removeListener('game:event', this.handleGameEvent.bind(this));
  }

  /**
   * Detect language
   */
  async detectLanguage() {
    if (!this.localizationState.autoDetect) {
      return;
    }

    // Try to get language from various sources
    let detectedLanguage = null;

    // 1. Check URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang && this.isLanguageSupported(urlLang)) {
      detectedLanguage = urlLang;
    }

    // 2. Check localStorage
    if (!detectedLanguage) {
      const storedLang = localStorage.getItem('preferredLanguage');
      if (storedLang && this.isLanguageSupported(storedLang)) {
        detectedLanguage = storedLang;
      }
    }

    // 3. Check browser language
    if (!detectedLanguage) {
      const browserLang = navigator.language.split('-')[0];
      if (this.isLanguageSupported(browserLang)) {
        detectedLanguage = browserLang;
      }
    }

    // 4. Check browser languages
    if (!detectedLanguage) {
      for (const lang of navigator.languages) {
        const langCode = lang.split('-')[0];
        if (this.isLanguageSupported(langCode)) {
          detectedLanguage = langCode;
          break;
        }
      }
    }

    // 5. Fallback to default
    if (!detectedLanguage) {
      detectedLanguage = this.localizationConfig.defaultLanguage;
    }

    this.localizationState.currentLanguage = detectedLanguage;
    this.logger.info(`Language detected: ${detectedLanguage}`);
  }

  /**
   * Load translations
   */
  async loadTranslations() {
    const languagesToLoad = [this.localizationState.currentLanguage];

    // Add fallback language if different
    if (
      this.localizationState.fallbackLanguage !==
      this.localizationState.currentLanguage
    ) {
      languagesToLoad.push(this.localizationState.fallbackLanguage);
    }

    for (const langCode of languagesToLoad) {
      if (!this.localizationState.loadedLanguages.has(langCode)) {
        await this.loadLanguage(langCode);
      }
    }
  }

  /**
   * Load language
   */
  async loadLanguage(langCode) {
    try {
      const path = this.getTranslationPath(langCode);
      const response = await fetch(path);

      if (!response.ok) {
        throw new Error(
          `Failed to load translations for ${langCode}: ${response.status}`
        );
      }

      const translations = await response.json();
      this.localizationState.translations.set(
        langCode,
        new Map(Object.entries(translations))
      );
      this.localizationState.loadedLanguages.add(langCode);

      this.logger.info(`Translations loaded for ${langCode}`);
    } catch (error) {
      this.logger.error(`Failed to load translations for ${langCode}:`, error);

      // Try to load fallback language
      if (langCode !== this.localizationState.fallbackLanguage) {
        await this.loadLanguage(this.localizationState.fallbackLanguage);
      }
    }
  }

  /**
   * Get translation path
   */
  getTranslationPath(langCode) {
    const config = this.localizationConfig.translationPaths;
    return `${config.base}${config.format.replace('{language}', langCode)}`;
  }

  /**
   * Apply language
   */
  applyLanguage() {
    const langCode = this.localizationState.currentLanguage;
    const language = this.localizationState.supportedLanguages.get(langCode);

    if (!language) {
      this.logger.warn(`Language not supported: ${langCode}`);
      return;
    }

    // Set document language
    document.documentElement.lang = langCode;

    // Set RTL if needed
    if (language.rtl) {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }

    // Update all translatable elements
    this.updateTranslatableElements();

    this.eventBus.emit('localization:languageChanged', {
      language: langCode,
      rtl: language.rtl,
      timestamp: Date.now(),
    });

    this.logger.info(`Language applied: ${langCode}`);
  }

  /**
   * Update translatable elements
   */
  updateTranslatableElements() {
    const elements = document.querySelectorAll('[data-translate]');

    elements.forEach((element) => {
      const key = element.getAttribute('data-translate');
      const translation = this.translate(key);

      if (translation) {
        element.textContent = translation;
      }
    });
  }

  /**
   * Change language
   */
  async changeLanguage(langCode) {
    if (!this.isLanguageSupported(langCode)) {
      this.logger.warn(`Language not supported: ${langCode}`);
      return false;
    }

    // Load translations if not already loaded
    if (!this.localizationState.loadedLanguages.has(langCode)) {
      await this.loadLanguage(langCode);
    }

    // Change language
    this.localizationState.currentLanguage = langCode;

    // Apply language
    this.applyLanguage();

    // Save preference
    this.saveCurrentLanguage();

    return true;
  }

  /**
   * Translate text
   */
  translate(key, params = {}, options = {}) {
    const langCode = options.language || this.localizationState.currentLanguage;
    const translations = this.localizationState.translations.get(langCode);

    if (!translations) {
      this.logger.warn(`No translations loaded for ${langCode}`);
      return key;
    }

    let translation = translations.get(key);

    // Try fallback language if translation not found
    if (!translation && langCode !== this.localizationState.fallbackLanguage) {
      const fallbackTranslations = this.localizationState.translations.get(
        this.localizationState.fallbackLanguage
      );
      if (fallbackTranslations) {
        translation = fallbackTranslations.get(key);
      }
    }

    // Return key if no translation found
    if (!translation) {
      this.localizationState.missingTranslations.add(key);
      this.logger.warn(`Translation not found: ${key}`);
      return key;
    }

    // Apply parameters
    if (params && Object.keys(params).length > 0) {
      translation = this.applyParameters(translation, params);
    }

    // Apply pluralization
    if (options.count !== undefined) {
      translation = this.applyPluralization(
        translation,
        options.count,
        langCode
      );
    }

    // Apply gender agreement
    if (options.gender) {
      translation = this.applyGenderAgreement(
        translation,
        options.gender,
        langCode
      );
    }

    // Apply context
    if (options.context) {
      translation = this.applyContext(translation, options.context, langCode);
    }

    return translation;
  }

  /**
   * Apply parameters
   */
  applyParameters(text, params) {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match;
    });
  }

  /**
   * Apply pluralization
   */
  applyPluralization(text, count, langCode) {
    const pluralRules = this.localizationState.pluralRules.get(langCode);
    if (!pluralRules) {
      return text;
    }

    const pluralForm = this.getPluralForm(count, langCode);
    const pluralKey = `{${pluralForm}}`;

    if (text.includes(pluralKey)) {
      return text.replace(pluralKey, count.toString());
    }

    return text;
  }

  /**
   * Get plural form
   */
  getPluralForm(count, langCode) {
    const pluralRules = this.localizationState.pluralRules.get(langCode);
    if (!pluralRules) {
      return 'other';
    }

    // Simple plural rules implementation
    if (count === 1) {
      return 'one';
    } else if (count === 2 && pluralRules.two) {
      return 'two';
    } else if (count >= 3 && count <= 10 && pluralRules.few) {
      return 'few';
    } else if (count > 10 && pluralRules.many) {
      return 'many';
    } else {
      return 'other';
    }
  }

  /**
   * Apply gender agreement
   */
  applyGenderAgreement(text, gender, langCode) {
    const genderRules = this.localizationState.genderRules.get(langCode);
    if (!genderRules) {
      return text;
    }

    // Simple gender agreement implementation
    const genderForms = genderRules[gender];
    if (genderForms) {
      for (const [masculine, feminine] of Object.entries(genderForms)) {
        text = text.replace(new RegExp(masculine, 'g'), feminine);
      }
    }

    return text;
  }

  /**
   * Apply context
   */
  applyContext(text, context, langCode) {
    const contextRules = this.localizationState.contextRules.get(langCode);
    if (!contextRules) {
      return text;
    }

    // Simple context implementation
    const contextForm = contextRules[context];
    if (contextForm) {
      // Apply context-specific transformations
      // This would be language-specific
    }

    return text;
  }

  /**
   * Format date
   */
  formatDate(date, format = 'short', langCode = null) {
    const lang = langCode || this.localizationState.currentLanguage;
    const dateFormats = this.localizationState.dateFormats.get(lang);

    if (!dateFormats) {
      return date.toLocaleDateString();
    }

    const formatString = dateFormats[format] || dateFormats.short;
    return this.formatDateString(date, formatString);
  }

  /**
   * Format date string
   */
  formatDateString(date, format) {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };

    return date.toLocaleDateString(
      this.localizationState.currentLanguage,
      options
    );
  }

  /**
   * Format number
   */
  formatNumber(number, options = {}) {
    const lang = options.language || this.localizationState.currentLanguage;
    const numberFormats = this.localizationState.numberFormats.get(lang);

    if (!numberFormats) {
      return number.toString();
    }

    const { decimal, thousands } = numberFormats;
    const formatted = number.toLocaleString(lang, {
      minimumFractionDigits: options.decimals || 0,
      maximumFractionDigits: options.decimals || 0,
    });

    return formatted.replace('.', decimal).replace(',', thousands);
  }

  /**
   * Format currency
   */
  formatCurrency(amount, currency = 'USD', options = {}) {
    const lang = options.language || this.localizationState.currentLanguage;
    const currencyFormats = this.localizationState.currencyFormats.get(lang);

    if (!currencyFormats) {
      return `${currency} ${amount}`;
    }

    const formatted = amount.toLocaleString(lang, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: options.decimals || 2,
      maximumFractionDigits: options.decimals || 2,
    });

    return formatted;
  }

  /**
   * Format measurement
   */
  formatMeasurement(value, unit, options = {}) {
    const lang = options.language || this.localizationState.currentLanguage;
    const measurementUnits = this.localizationState.measurementUnits.get(lang);

    if (!measurementUnits) {
      return `${value} ${unit}`;
    }

    // Convert units if needed
    const convertedValue = this.convertMeasurement(
      value,
      unit,
      measurementUnits[unit]
    );
    const convertedUnit = this.getUnitName(measurementUnits[unit], lang);

    return `${convertedValue} ${convertedUnit}`;
  }

  /**
   * Convert measurement
   */
  convertMeasurement(value, fromUnit, toUnit) {
    // Simple conversion implementation
    const conversions = {
      miles: { kilometers: 1.60934 },
      kilometers: { miles: 0.621371 },
      pounds: { kilograms: 0.453592 },
      kilograms: { pounds: 2.20462 },
      fahrenheit: { celsius: (f) => ((f - 32) * 5) / 9 },
      celsius: { fahrenheit: (c) => (c * 9) / 5 + 32 },
    };

    if (conversions[fromUnit] && conversions[fromUnit][toUnit]) {
      const conversion = conversions[fromUnit][toUnit];
      return typeof conversion === 'function'
        ? conversion(value)
        : value * conversion;
    }

    return value;
  }

  /**
   * Get unit name
   */
  getUnitName(unit, langCode) {
    const unitNames = {
      miles: { en: 'miles', es: 'millas', fr: 'miles' },
      kilometers: { en: 'km', es: 'km', fr: 'km' },
      pounds: { en: 'lbs', es: 'libras', fr: 'livres' },
      kilograms: { en: 'kg', es: 'kg', fr: 'kg' },
      fahrenheit: { en: '°F', es: '°F', fr: '°F' },
      celsius: { en: '°C', es: '°C', fr: '°C' },
    };

    return unitNames[unit]?.[langCode] || unit;
  }

  /**
   * Pluralize
   */
  pluralize(singular, plural, count, langCode = null) {
    const lang = langCode || this.localizationState.currentLanguage;
    const pluralForm = this.getPluralForm(count, lang);

    if (pluralForm === 'one') {
      return singular;
    } else {
      return plural;
    }
  }

  /**
   * Genderize
   */
  genderize(masculine, feminine, gender, langCode = null) {
    const lang = langCode || this.localizationState.currentLanguage;

    if (gender === 'feminine') {
      return feminine;
    } else {
      return masculine;
    }
  }

  /**
   * Is language supported
   */
  isLanguageSupported(langCode) {
    return this.localizationState.supportedLanguages.has(langCode);
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages() {
    return Array.from(this.localizationState.supportedLanguages.values());
  }

  /**
   * Get current language
   */
  getCurrentLanguage() {
    return this.localizationState.currentLanguage;
  }

  /**
   * Get current language info
   */
  getCurrentLanguageInfo() {
    return this.localizationState.supportedLanguages.get(
      this.localizationState.currentLanguage
    );
  }

  /**
   * Is RTL language
   */
  isRTLLanguage(langCode = null) {
    const lang = langCode || this.localizationState.currentLanguage;
    const language = this.localizationState.supportedLanguages.get(lang);
    return language ? language.rtl : false;
  }

  /**
   * Update dynamic content
   */
  updateDynamicContent(deltaTime) {
    // Update dynamic content logic
  }

  /**
   * Update cache
   */
  updateCache(deltaTime) {
    // Update cache logic
  }

  /**
   * Update missing translations
   */
  updateMissingTranslations(deltaTime) {
    // Update missing translations logic
  }

  /**
   * Handle element created
   */
  handleElementCreated(event) {
    const element = event.element;
    if (element.hasAttribute('data-translate')) {
      this.updateElementTranslation(element);
    }
  }

  /**
   * Handle element updated
   */
  handleElementUpdated(event) {
    const element = event.element;
    if (element.hasAttribute('data-translate')) {
      this.updateElementTranslation(element);
    }
  }

  /**
   * Handle element destroyed
   */
  handleElementDestroyed(event) {
    // Handle element destroyed
  }

  /**
   * Handle game state change
   */
  handleGameStateChange(event) {
    // Handle game state change
  }

  /**
   * Handle game event
   */
  handleGameEvent(event) {
    // Handle game event
  }

  /**
   * Update element translation
   */
  updateElementTranslation(element) {
    const key = element.getAttribute('data-translate');
    const translation = this.translate(key);

    if (translation) {
      element.textContent = translation;
    }
  }

  /**
   * Save current language
   */
  saveCurrentLanguage() {
    localStorage.setItem(
      'preferredLanguage',
      this.localizationState.currentLanguage
    );
  }

  /**
   * Load current language
   */
  loadCurrentLanguage() {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage && this.isLanguageSupported(savedLanguage)) {
      this.localizationState.currentLanguage = savedLanguage;
    }
  }

  /**
   * Get missing translations
   */
  getMissingTranslations() {
    return Array.from(this.localizationState.missingTranslations);
  }

  /**
   * Clear missing translations
   */
  clearMissingTranslations() {
    this.localizationState.missingTranslations.clear();
  }

  /**
   * Get translation statistics
   */
  getTranslationStatistics() {
    const stats = {
      currentLanguage: this.localizationState.currentLanguage,
      loadedLanguages: Array.from(this.localizationState.loadedLanguages),
      totalTranslations: 0,
      missingTranslations: this.localizationState.missingTranslations.size,
      supportedLanguages: this.localizationState.supportedLanguages.size,
    };

    for (const translations of this.localizationState.translations.values()) {
      stats.totalTranslations += translations.size;
    }

    return stats;
  }

  /**
   * Set fallback language
   */
  setFallbackLanguage(langCode) {
    if (this.isLanguageSupported(langCode)) {
      this.localizationState.fallbackLanguage = langCode;
    }
  }

  /**
   * Get fallback language
   */
  getFallbackLanguage() {
    return this.localizationState.fallbackLanguage;
  }

  /**
   * Enable auto-detect
   */
  enableAutoDetect() {
    this.localizationState.autoDetect = true;
  }

  /**
   * Disable auto-detect
   */
  disableAutoDetect() {
    this.localizationState.autoDetect = false;
  }

  /**
   * Enable cache
   */
  enableCache() {
    this.localizationState.cacheEnabled = true;
  }

  /**
   * Disable cache
   */
  disableCache() {
    this.localizationState.cacheEnabled = false;
    this.localizationState.cache.clear();
  }

  /**
   * Get localization state
   */
  getLocalizationState() {
    return { ...this.localizationState };
  }
}

export default LocalizationSystem;
