/**
 * Utilitaire frontend pour mapper les codes pays vers les noms complets
 * et normaliser les pays
 */

const COUNTRY_CODE_TO_NAME = {
  'CM': 'Cameroun',
  'SN': 'Sénégal',
  'CI': 'Côte d\'Ivoire',
  'GH': 'Ghana',
  'NG': 'Nigeria',
  'KE': 'Kenya',
  'BF': 'Burkina Faso',
  'ML': 'Mali',
  'NE': 'Niger',
  'TD': 'Tchad',
  'CF': 'République centrafricaine',
  'GA': 'Gabon',
  'CG': 'Congo',
  'CD': 'République démocratique du Congo',
  'AO': 'Angola',
  'ZM': 'Zambie',
  'ZW': 'Zimbabwe',
  'ZA': 'Afrique du Sud',
  'EG': 'Égypte',
  'MA': 'Maroc',
  'TN': 'Tunisie',
  'DZ': 'Algérie',
  'LY': 'Libye',
  'SD': 'Soudan',
  'ET': 'Éthiopie',
  'UG': 'Ouganda',
  'TZ': 'Tanzanie',
  'RW': 'Rwanda',
  'BI': 'Burundi',
  'MW': 'Malawi',
  'MZ': 'Mozambique',
  'MG': 'Madagascar',
  'MU': 'Maurice',
  'SC': 'Seychelles',
  'KM': 'Comores',
  'DJ': 'Djibouti',
  'SO': 'Somalie',
  'ER': 'Érythrée',
  'SS': 'Soudan du Sud',
  // Variantes de noms
  'Cameroon': 'Cameroun',
  'cameroun': 'Cameroun',
  'Senegal': 'Sénégal',
  'senegal': 'Sénégal',
  'Côte d\'Ivoire': 'Côte d\'Ivoire',
  'côte d\'ivoire': 'Côte d\'Ivoire',
  'Ivory Coast': 'Côte d\'Ivoire',
  'Ghana': 'Ghana',
  'ghana': 'Ghana',
  'Nigeria': 'Nigeria',
  'nigeria': 'Nigeria',
  'Kenya': 'Kenya',
  'kenya': 'Kenya'
};

/**
 * Convertit un code pays en nom complet
 * Si c'est déjà un nom complet, le retourne tel quel
 * @param {string} countryCode - Code pays (ex: 'SN', 'CM') ou nom de pays
 * @returns {string} Nom complet du pays
 */
export function getCountryName(countryCode) {
  if (!countryCode) return 'Sénégal'; // Valeur par défaut
  
  // Si c'est déjà un nom complet (plus de 2 caractères et pas un code)
  if (countryCode.length > 2 && !/^[A-Z]{2}$/.test(countryCode)) {
    // Vérifier si c'est un nom valide dans notre mapping
    const normalized = countryCode.trim();
    if (COUNTRY_CODE_TO_NAME[normalized]) {
      return COUNTRY_CODE_TO_NAME[normalized];
    }
    // Si c'est déjà un nom complet valide, le retourner tel quel
    if (Object.values(COUNTRY_CODE_TO_NAME).includes(normalized)) {
      return normalized;
    }
    // Sinon, retourner tel quel (peut être un nom non listé)
    return normalized;
  }
  
  // Si c'est un code à 2 lettres, le convertir
  const code = countryCode.toUpperCase().trim();
  return COUNTRY_CODE_TO_NAME[code] || countryCode;
}

/**
 * Convertit un nom de pays en code pays (2 lettres)
 * @param {string} countryName - Nom du pays
 * @returns {string} Code pays à 2 lettres
 */
export function getCountryCode(countryName) {
  if (!countryName) return 'SN'; // Valeur par défaut
  
  // Si c'est déjà un code à 2 lettres
  if (countryName.length === 2 && /^[A-Z]{2}$/.test(countryName)) {
    return countryName;
  }
  
  // Mapping inverse
  const COUNTRY_NAME_TO_CODE = {
    'Cameroun': 'CM',
    'Sénégal': 'SN',
    'Côte d\'Ivoire': 'CI',
    'Ghana': 'GH',
    'Nigeria': 'NG',
    'Kenya': 'KE',
    'Burkina Faso': 'BF',
    'Mali': 'ML',
    'Niger': 'NE',
    'Tchad': 'TD',
    'République centrafricaine': 'CF',
    'Gabon': 'GA',
    'Congo': 'CG',
    'République démocratique du Congo': 'CD',
    'Angola': 'AO',
    'Zambie': 'ZM',
    'Zimbabwe': 'ZW',
    'Afrique du Sud': 'ZA',
    'Égypte': 'EG',
    'Maroc': 'MA',
    'Tunisie': 'TN',
    'Algérie': 'DZ',
    'Libye': 'LY',
    'Soudan': 'SD',
    'Éthiopie': 'ET',
    'Ouganda': 'UG',
    'Tanzanie': 'TZ',
    'Rwanda': 'RW',
    'Burundi': 'BI',
    'Malawi': 'MW',
    'Mozambique': 'MZ',
    'Madagascar': 'MG',
    'Maurice': 'MU',
    'Seychelles': 'SC',
    'Comores': 'KM',
    'Djibouti': 'DJ',
    'Somalie': 'SO',
    'Érythrée': 'ER',
    'Soudan du Sud': 'SS'
  };
  
  const normalized = countryName.trim();
  return COUNTRY_NAME_TO_CODE[normalized] || 'SN';
}

/**
 * Normalise un pays (convertit toujours en nom complet)
 * @param {string} country - Code ou nom de pays
 * @returns {string} Nom complet du pays
 */
export function normalizeCountry(country) {
  return getCountryName(country);
}

/**
 * Liste de tous les noms de pays supportés
 * @returns {Array<string>} Liste des noms de pays
 */
export function getAllCountryNames() {
  return Object.values(COUNTRY_CODE_TO_NAME).filter((name, index, self) => 
    self.indexOf(name) === index && name.length > 2
  );
}

