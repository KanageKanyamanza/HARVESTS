const i18n = require('i18n');
const path = require('path');

// Configuration i18n
i18n.configure({
  // Langues supportées
  locales: ['fr', 'en'],
  
  // Langue par défaut
  defaultLocale: 'fr',
  
  // Répertoire des fichiers de traduction
  directory: path.join(__dirname, '../locales'),
  
  // Extension des fichiers
  extension: '.json',
  
  // Auto-reload des fichiers en développement
  autoReload: process.env.NODE_ENV === 'development',
  
  // Mise à jour automatique des fichiers manquants
  updateFiles: process.env.NODE_ENV === 'development',
  
  // Synchronisation des fichiers
  syncFiles: true,
  
  // Format des clés manquantes
  missingKeyFn: function(locale, value) {
    return `[${locale}:${value}]`;
  },
  
  // Détection de la langue via headers
  queryParameter: 'lang',
  directoryPermissions: '755',
  
  // Objets à étendre
  objectNotation: true,
  
  // Préfixe pour les cookies
  cookie: 'harvests_lang',
  
  // Durée de vie du cookie (30 jours)
  cookieMaxAge: 1000 * 60 * 60 * 24 * 30,
  
  // Sécurité cookie
  cookieSecure: process.env.NODE_ENV === 'production',
  cookieHttpOnly: true,
  cookieSameSite: 'strict'
});

// Middleware pour détecter la langue
const detectLanguage = (req, res, next) => {
  // 1. Vérifier le paramètre de requête ?lang=
  if (req.query.lang && ['fr', 'en'].includes(req.query.lang)) {
    req.language = req.query.lang;
    res.cookie('harvests_lang', req.language, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  }
  // 2. Vérifier le cookie
  else if (req.cookies.harvests_lang && ['fr', 'en'].includes(req.cookies.harvests_lang)) {
    req.language = req.cookies.harvests_lang;
  }
  // 3. Vérifier le header Accept-Language
  else if (req.headers['accept-language']) {
    const acceptedLanguages = req.headers['accept-language'].split(',');
    const preferredLang = acceptedLanguages[0].split('-')[0];
    req.language = ['fr', 'en'].includes(preferredLang) ? preferredLang : 'fr';
  }
  // 4. Par défaut français
  else {
    req.language = 'fr';
  }
  
  // Configurer i18n pour cette requête
  i18n.setLocale(req, req.language);
  res.locals.language = req.language;
  
  next();
};

// Fonction utilitaire pour obtenir les traductions
const getTranslations = (locale = 'fr') => {
  return {
    t: (key, params = {}) => {
      i18n.setLocale(locale);
      return i18n.__(key, params);
    },
    locale
  };
};

// Fonction pour traduire selon la région/pays
const getRegionalSettings = (country = 'CM', language = 'fr') => {
  const settings = {
    // Cameroun
    'CM': {
      currency: 'XAF',
      currencySymbol: 'FCFA',
      phoneFormat: '+237',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h'
    },
    // Sénégal
    'SN': {
      currency: 'XOF',
      currencySymbol: 'FCFA',
      phoneFormat: '+221',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h'
    },
    // Côte d'Ivoire
    'CI': {
      currency: 'XOF',
      currencySymbol: 'FCFA',
      phoneFormat: '+225',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h'
    },
    // Ghana (anglophone)
    'GH': {
      currency: 'GHS',
      currencySymbol: '₵',
      phoneFormat: '+233',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h'
    },
    // Nigeria (anglophone)
    'NG': {
      currency: 'NGN',
      currencySymbol: '₦',
      phoneFormat: '+234',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h'
    },
    // Kenya (anglophone)
    'KE': {
      currency: 'KES',
      currencySymbol: 'KSh',
      phoneFormat: '+254',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h'
    }
  };
  
  return settings[country] || settings['CM'];
};

module.exports = {
  i18n,
  detectLanguage,
  getTranslations,
  getRegionalSettings
};
