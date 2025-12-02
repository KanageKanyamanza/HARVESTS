/**
 * Utilitaires pour améliorer la recherche de produits
 */

/**
 * Normalise une chaîne pour la recherche (enlève accents, met en minuscule)
 */
function normalizeSearchTerm(term) {
  if (!term) return '';
  return term
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlève les accents
    .replace(/[^\w\s]/g, ' '); // Remplace les caractères spéciaux par des espaces
}

/**
 * Génère des variantes de recherche pour gérer le pluriel/singulier
 */
function generateSearchVariants(term) {
  const normalized = normalizeSearchTerm(term);
  const variants = [normalized];
  
  // Règles de pluriel français
  // Si le terme se termine par 'es' (ex: tomates, pommes, oranges)
  if (normalized.endsWith('es') && normalized.length > 3) {
    // Pour les mots en 'es', le singulier peut être soit avec 'e' soit sans
    // Ex: tomates -> tomate, pommes -> pomme
    const withoutEs = normalized.slice(0, -2); // Enlève 'es'
    
    // Si enlever 'es' donne un mot qui se termine déjà par 'e', c'est le singulier
    if (withoutEs.endsWith('e')) {
      variants.push(withoutEs); // pommes -> pomme, oranges -> orange
    } else {
      // Sinon, le singulier est probablement avec 'e' ajouté
      variants.push(withoutEs + 'e'); // tomates -> tomate
    }
  } 
  // Si le terme se termine par 's' mais pas 'es' (ex: légumes, fruits)
  else if (normalized.endsWith('s') && !normalized.endsWith('es') && normalized.length > 1) {
    const singular = normalized.slice(0, -1); // Enlève 's' -> légume, fruit
    variants.push(singular);
    // Si le singulier se termine par 'e', on peut aussi chercher avec 'es'
    if (singular.endsWith('e')) {
      variants.push(singular + 'es'); // légume -> légumes
    }
  } 
  // Si le terme se termine par 'x' (rare en français)
  else if (normalized.endsWith('x') && normalized.length > 1) {
    variants.push(normalized.slice(0, -1)); // Enlève 'x'
  } 
  // Si pas de pluriel détecté, on ajoute les versions plurielles
  else {
    // Ajouter 's' pour la plupart des mots
    variants.push(normalized + 's');
    // Ajouter 'es' pour les mots qui se terminent par 'e', 'a', 'i', 'o', 'u'
    if (normalized.endsWith('e') || normalized.endsWith('a') || normalized.endsWith('i') || normalized.endsWith('o') || normalized.endsWith('u')) {
      variants.push(normalized + 'es');
    }
  }
  
  // Retirer les doublons et les variantes trop courtes (minimum 2 caractères)
  return [...new Set(variants)].filter(v => v.length >= 2);
}

/**
 * Crée une requête de recherche flexible pour MongoDB
 * Gère le pluriel/singulier et les variations
 */
function buildFlexibleSearchQuery(searchTerm, fields = ['name', 'description', 'shortDescription', 'tags', 'subcategory']) {
  if (!searchTerm || !searchTerm.trim()) {
    return {};
  }
  
  const variants = generateSearchVariants(searchTerm);
  const searchRegexes = variants.map(v => new RegExp(v, 'i'));
  
  // Construire les conditions $or pour chaque champ
  const orConditions = [];
  
  fields.forEach(field => {
    // Pour chaque variante, créer une condition regex
    searchRegexes.forEach(regex => {
      orConditions.push({ [field]: regex });
    });
  });
  
  // Si tags est dans les champs, ajouter aussi une recherche dans le tableau
  if (fields.includes('tags')) {
    searchRegexes.forEach(regex => {
      orConditions.push({ tags: { $in: [regex] } });
    });
  }
  
  return {
    $or: orConditions
  };
}

/**
 * Crée une requête de recherche pour les noms qui peuvent être des strings ou des objets {fr, en}
 */
function buildNameSearchQuery(searchTerm) {
  if (!searchTerm || !searchTerm.trim()) {
    return {};
  }
  
  const variants = generateSearchVariants(searchTerm);
  const searchRegexes = variants.map(v => new RegExp(v, 'i'));
  
  const orConditions = [];
  
  // Recherche dans name (string)
  searchRegexes.forEach(regex => {
    orConditions.push({ name: regex });
  });
  
  // Recherche dans name.fr (si c'est un objet)
  searchRegexes.forEach(regex => {
    orConditions.push({ 'name.fr': regex });
  });
  
  // Recherche dans name.en (si c'est un objet)
  searchRegexes.forEach(regex => {
    orConditions.push({ 'name.en': regex });
  });
  
  return {
    $or: orConditions
  };
}

/**
 * Liste des villes et régions connues (Cameroun, Sénégal, etc.)
 * Toutes les variantes sont normalisées (sans accents) pour la recherche
 */
const KNOWN_LOCATIONS = {
  // Villes du Cameroun (avec toutes les variantes)
  villes: [
    'yaounde', 'yaoundé', 'douala', 'bafoussam', 'garoua', 'maroua', 'bamenda', 
    'buea', 'kribi', 'limbe', 'dschang', 'dschang', 'kousseri', 'nanga eboko', 'ebolowa',
    'kumba', 'bafang', 'foumban', 'bertoua', 'edea', 'sangmelima', 'mbalmayo',
    'wum', 'nkongsamba', 'bafia', 'nkambe', 'tiko', 'mamfe', 'akono', 'bandjoun',
    'bafoussam', 'foumban', 'nkongsamba', 'nkambe'
  ],
  // Régions du Cameroun
  regions: [
    'centre', 'littoral', 'ouest', 'nord', 'extreme-nord', 'extreme nord', 'nord-ouest', 'nord ouest',
    'sud-ouest', 'sud ouest', 'sud', 'est', 'adamaoua', 'adamaoua'
  ],
  // Villes du Sénégal (avec toutes les variantes)
  villesSenegal: [
    'dakar', 'thies', 'thiès', 'saint-louis', 'saint louis', 'kaolack', 'ziguinchor', 
    'tambacounda', 'kolda', 'matam', 'fatick', 'kaffrine', 'kedougou', 'sedhiou', 
    'louga', 'diourbel', 'rufisque', 'mbour', 'touba', 'richard toll', 'richard-toll',
    'joal', 'mekhe', 'mekhe', 'thies', 'thiès'
  ],
  // Régions du Sénégal
  regionsSenegal: [
    'dakar', 'thies', 'thiès', 'saint-louis', 'saint louis', 'kaolack', 'ziguinchor', 
    'tambacounda', 'kolda', 'matam', 'fatick', 'kaffrine', 'kedougou', 'sedhiou', 
    'louga', 'diourbel'
  ]
};

/**
 * Détecte et extrait les termes géographiques d'une recherche
 * @param {string} searchTerm - Terme de recherche
 * @returns {object} { location: { city, region }, searchTerms: string[] }
 */
function extractLocationFromSearch(searchTerm) {
  if (!searchTerm) {
    return { location: null, searchTerms: [] };
  }

  const normalized = normalizeSearchTerm(searchTerm);
  const words = normalized.split(/\s+/).filter(w => w.length > 2);
  
  const location = {
    city: null,
    region: null
  };
  
  const searchTerms = [];
  const locationKeywords = ['a', 'dans', 'de', 'sur', 'vers', 'pres', 'près', 'autour', 'proche'];
  
  // Parcourir les mots pour détecter les localisations
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const nextWord = i < words.length - 1 ? words[i + 1] : null;
    const combined = nextWord ? `${word} ${nextWord}` : word;
    
    // Normaliser pour la comparaison (sans accents)
    const normalizedWord = normalizeSearchTerm(word);
    const normalizedCombined = normalizeSearchTerm(combined);
    
    // Vérifier si c'est une ville (comparer avec les variantes normalisées)
    const allVilles = [...KNOWN_LOCATIONS.villes, ...KNOWN_LOCATIONS.villesSenegal];
    const villeMatch = allVilles.find(v => {
      const normalizedV = normalizeSearchTerm(v);
      return normalizedV === normalizedWord || normalizedV === normalizedCombined;
    });
    
    if (villeMatch) {
      // Utiliser le nom original de la ville (première occurrence dans la liste)
      location.city = villeMatch;
      if (nextWord && normalizedCombined !== normalizedWord) i++; // Skip next word si combiné
      continue;
    }
    
    // Vérifier si c'est une région
    const allRegions = [...KNOWN_LOCATIONS.regions, ...KNOWN_LOCATIONS.regionsSenegal];
    const regionMatch = allRegions.find(r => {
      const normalizedR = normalizeSearchTerm(r);
      return normalizedR === normalizedWord || normalizedR === normalizedCombined;
    });
    
    if (regionMatch) {
      // Utiliser le nom original de la région (première occurrence dans la liste)
      location.region = regionMatch;
      if (nextWord && normalizedCombined !== normalizedWord) i++; // Skip next word si combiné
      continue;
    }
    
    // Si c'est un mot-clé de localisation, ignorer
    if (locationKeywords.includes(word)) {
      continue;
    }
    
    // Sinon, c'est un terme de recherche
    searchTerms.push(word);
  }
  
  // Si aucun terme de recherche mais une localisation, garder tout comme terme de recherche
  if (searchTerms.length === 0 && (location.city || location.region)) {
    searchTerms.push(...words.filter(w => 
      w !== location.city && 
      w !== location.region && 
      !locationKeywords.includes(w)
    ));
  }
  
  return {
    location: (location.city || location.region) ? location : null,
    searchTerms: searchTerms.join(' ')
  };
}

/**
 * Crée une requête de recherche avec filtrage géographique
 * @param {string} searchTerm - Terme de recherche complet
 * @param {array} fields - Champs à rechercher
 * @param {object} locationFilter - Filtre de localisation à appliquer
 * @returns {object} { searchQuery: object, locationQuery: object }
 */
function buildSearchWithLocation(searchTerm, fields = ['name', 'description', 'shortDescription', 'tags', 'subcategory'], locationFilter = null) {
  const { location, searchTerms } = extractLocationFromSearch(searchTerm);
  
  // Construire la requête de recherche textuelle
  let searchQuery = {};
  if (searchTerms && searchTerms.trim()) {
    searchQuery = buildFlexibleSearchQuery(searchTerms, fields);
  }
  
  // Construire la requête de localisation
  let locationQuery = {};
  
  // Priorité au filtre de localisation fourni
  if (locationFilter) {
    locationQuery = locationFilter;
  } 
  // Sinon utiliser la localisation extraite de la recherche
  else if (location) {
    const { buildLocationQuery } = require('./locationService');
    const normalizedLocation = {
      city: location.city,
      region: location.region,
      country: null
    };
    locationQuery = buildLocationQuery(normalizedLocation, {
      prioritizeRegion: true,
      prioritizeCity: true
    }, 'producer');
  }
  
  return {
    searchQuery,
    locationQuery,
    extractedLocation: location
  };
}

module.exports = {
  normalizeSearchTerm,
  generateSearchVariants,
  buildFlexibleSearchQuery,
  buildNameSearchQuery,
  extractLocationFromSearch,
  buildSearchWithLocation,
  KNOWN_LOCATIONS
};

