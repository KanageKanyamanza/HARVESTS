const i18n = require('i18n');
const path = require('path');

const { apiCookieOptions, isProduction } = require('./cookies');

// Langues réellement gérées par l'API
const SUPPORTED_LOCALES = ['fr', 'en'];
const DEFAULT_LOCALE = 'fr';

// Nom du cookie qui mémorise la langue choisie par l'utilisateur (Jour 35)
const LANGUAGE_COOKIE = 'harvests_lang';
const LANGUAGE_COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 30;

/**
 * Normalise une valeur de langue ("en", "EN", "en-US", "fr_FR") vers une
 * locale gérée par l'API, ou null si elle ne l'est pas.
 */
const normalizeLocale = (raw) => {
  if (typeof raw !== 'string') return null;
  const primary = raw.trim().toLowerCase().split(/[-_]/)[0];
  return SUPPORTED_LOCALES.includes(primary) ? primary : null;
};

/**
 * Extrait la première locale gérée d'un en-tête Accept-Language, en tenant
 * compte des poids de qualité (q) : « de-DE,de;q=0.9,en-US;q=0.8 » → « en ».
 * Retourne null si aucune locale gérée n'est demandée.
 */
const localeFromAcceptLanguage = (header) => {
  if (typeof header !== 'string' || !header.trim()) return null;

  const candidates = header
    .split(',')
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(';');
      const qParam = params.find((param) => param.trim().startsWith('q='));
      const q = qParam ? parseFloat(qParam.trim().slice(2)) : 1;
      return { tag: tag.trim(), q: Number.isNaN(q) ? 0 : q, index };
    })
    .filter(({ tag, q }) => tag && q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index);

  for (const { tag } of candidates) {
    const locale = normalizeLocale(tag);
    if (locale) return locale;
  }
  return null;
};

/**
 * Attributs du cookie de langue.
 *
 * Jour 63 : le front (Vercel) et l'API (Render) sont sur des sites différents.
 * Un cookie SameSite=Strict n'est alors jamais renvoyé par le navigateur : le
 * backend retombait sur la langue du navigateur (Accept-Language) au lieu du
 * choix de l'utilisateur. La politique commune des cookies de l'API est
 * décrite dans config/cookies.js.
 */
const languageCookieOptions = (req) =>
  apiCookieOptions(req, {
    maxAge: LANGUAGE_COOKIE_MAX_AGE,
    httpOnly: true,
    path: "/",
  });

// Configuration i18n
i18n.configure({
  // Langues supportées
  locales: SUPPORTED_LOCALES,

  // Langue par défaut
  defaultLocale: DEFAULT_LOCALE,
  
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
  cookie: LANGUAGE_COOKIE,

  // Durée de vie du cookie (30 jours)
  cookieMaxAge: LANGUAGE_COOKIE_MAX_AGE,

  // Sécurité cookie
  cookieSecure: isProduction(),
  cookieHttpOnly: true,
  cookieSameSite: isProduction() ? 'none' : 'lax'
});

// Middleware pour détecter la langue
// Jour 63 : le cookie harvests_lang (choix explicite de l'utilisateur, Jour 35)
// est une source à part entière, prioritaire sur la langue du navigateur.
const detectLanguage = (req, res, next) => {
  // 1. Paramètre de requête ?lang= (choix explicite, mémorisé dans le cookie)
  const queryLocale = normalizeLocale(req.query?.lang);
  // 2. Header X-Language (choix explicite envoyé par le client sur la requête)
  const headerLocale = normalizeLocale(req.headers?.['x-language']);
  // 3. Cookie harvests_lang (choix mémorisé de l'utilisateur)
  const cookieLocale = normalizeLocale(req.cookies?.[LANGUAGE_COOKIE]);
  // 4. Header Accept-Language (langue du navigateur, dernier recours)
  const acceptLocale = localeFromAcceptLanguage(req.headers?.['accept-language']);

  const language =
    queryLocale || headerLocale || cookieLocale || acceptLocale || DEFAULT_LOCALE;

  req.language = language;

  // Le cookie n'est écrit que pour une langue demandée explicitement
  // (?lang= ou X-Language) : la langue déduite du navigateur n'est jamais
  // mémorisée, conformément à la bascule explicite décidée au Jour 33.
  const explicitLocale = queryLocale || headerLocale;
  if (explicitLocale && explicitLocale !== cookieLocale) {
    res.cookie(LANGUAGE_COOKIE, explicitLocale, languageCookieOptions(req));
  }

  // Configurer i18n pour cette requête
  i18n.setLocale(req, language);
  res.locals.language = language;

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
  getRegionalSettings,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LANGUAGE_COOKIE,
  normalizeLocale,
  localeFromAcceptLanguage,
  languageCookieOptions
};
