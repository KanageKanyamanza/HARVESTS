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
const getRegionalSettings = (country = 'Sénégal', language = 'fr') => {
  // Configuration par défaut (Sénégal)
  const defaultSettings = {
    currency: 'XOF',
    currencySymbol: 'FCFA',
    phoneFormat: '+221',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h'
  };

  // Détection automatique des paramètres régionaux basée sur le nom du pays
  const countryLower = country.toLowerCase();
  
  // Pays francophones (Afrique de l'Ouest et Centrale)
  const francophoneCountries = ['sénégal', 'cameroun', 'côte d\'ivoire', 'mali', 'burkina faso', 'niger', 'tchad', 'madagascar', 'congo', 'gabon', 'togo', 'bénin', 'guinée', 'sénégal', 'cameroun', 'côte d\'ivoire', 'mali', 'burkina faso', 'niger', 'tchad', 'madagascar', 'congo', 'gabon', 'togo', 'bénin', 'guinée'];
  
  // Pays anglophones
  const anglophoneCountries = ['ghana', 'nigeria', 'kenya', 'uganda', 'tanzania', 'south africa', 'zambia', 'zimbabwe', 'botswana', 'namibia', 'malawi', 'zambia', 'zimbabwe', 'botswana', 'namibia', 'malawi'];
  
  // Pays lusophones
  const lusophoneCountries = ['angola', 'mozambique', 'guinée-bissau', 'cap-vert', 'são tomé-et-príncipe', 'angola', 'mozambique', 'guinée-bissau', 'cap-vert', 'são tomé-et-príncipe'];
  
  // Pays arabophones
  const arabophoneCountries = ['maroc', 'algérie', 'tunisie', 'égypte', 'libye', 'soudan', 'mauritanie', 'djibouti', 'somalie', 'maroc', 'algérie', 'tunisie', 'égypte', 'libye', 'soudan', 'mauritanie', 'djibouti', 'somalie'];

  let settings = { ...defaultSettings };

  // Détection de la langue basée sur le pays
  if (francophoneCountries.some(c => countryLower.includes(c))) {
    settings = {
      currency: 'XOF',
      currencySymbol: 'FCFA',
      phoneFormat: '+221',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h'
    };
  } else if (anglophoneCountries.some(c => countryLower.includes(c))) {
    settings = {
      currency: 'USD',
      currencySymbol: '$',
      phoneFormat: '+1',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h'
    };
  } else if (lusophoneCountries.some(c => countryLower.includes(c))) {
    settings = {
      currency: 'AOA',
      currencySymbol: 'Kz',
      phoneFormat: '+244',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h'
    };
  } else if (arabophoneCountries.some(c => countryLower.includes(c))) {
    settings = {
      currency: 'MAD',
      currencySymbol: 'د.م.',
      phoneFormat: '+212',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h'
    };
  }

  // Configuration spécifique pour certains pays
  if (countryLower.includes('sénégal') || countryLower.includes('senegal')) {
    settings = {
      currency: 'XOF',
      currencySymbol: 'FCFA',
      phoneFormat: '+221',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h'
    };
  } else if (countryLower.includes('cameroun') || countryLower.includes('cameroon')) {
    settings = {
      currency: 'XAF',
      currencySymbol: 'FCFA',
      phoneFormat: '+237',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h'
    };
  } else if (countryLower.includes('ghana')) {
    settings = {
      currency: 'GHS',
      currencySymbol: '₵',
      phoneFormat: '+233',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h'
    };
  } else if (countryLower.includes('nigeria')) {
    settings = {
      currency: 'NGN',
      currencySymbol: '₦',
      phoneFormat: '+234',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h'
    };
  } else if (countryLower.includes('kenya')) {
    settings = {
      currency: 'KES',
      currencySymbol: 'KSh',
      phoneFormat: '+254',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h'
    };
  }

  return settings;
};

module.exports = {
  i18n,
  detectLanguage,
  getTranslations,
  getRegionalSettings
};
