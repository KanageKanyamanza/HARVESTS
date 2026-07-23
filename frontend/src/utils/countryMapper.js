/**
 * Utilitaire centralisé frontend pour la gestion des pays, codes ISO, et zones régionales
 */

export const SUPPORTED_COUNTRIES = [
  { code: 'SN', name: 'Sénégal', currency: 'XOF', flag: '🇸🇳', zone: 'West Africa' },
  { code: 'CI', name: "Côte d'Ivoire", currency: 'XOF', flag: '🇨🇮', zone: 'West Africa' },
  { code: 'CM', name: 'Cameroun', currency: 'XAF', flag: '🇨🇲', zone: 'Central Africa' },
  { code: 'BF', name: 'Burkina Faso', currency: 'XOF', flag: '🇧🇫', zone: 'West Africa' },
  { code: 'ML', name: 'Mali', currency: 'XOF', flag: '🇲🇱', zone: 'West Africa' },
  { code: 'GH', name: 'Ghana', currency: 'GHS', flag: '🇬🇭', zone: 'West Africa' },
  { code: 'NG', name: 'Nigeria', currency: 'NGN', flag: '🇳🇬', zone: 'West Africa' },
  { code: 'BJ', name: 'Bénin', currency: 'XOF', flag: '🇧🇯', zone: 'West Africa' },
  { code: 'TG', name: 'Togo', currency: 'XOF', flag: '🇹🇬', zone: 'West Africa' },
  { code: 'GA', name: 'Gabon', currency: 'XAF', flag: '🇬🇦', zone: 'Central Africa' },
  { code: 'CG', name: 'Congo', currency: 'XAF', flag: '🇨🇬', zone: 'Central Africa' },
  { code: 'CD', name: 'République démocratique du Congo', currency: 'CDF', flag: '🇨🇩', zone: 'Central Africa' },
];

export const REGIONAL_ZONES = [
  { id: 'West Africa', label: "Afrique de l'Ouest" },
  { id: 'Central Africa', label: "Afrique Centrale" }
];

const COUNTRY_CODE_TO_NAME = {
  'SN': 'Sénégal',
  'CI': "Côte d'Ivoire",
  'CM': 'Cameroun',
  'BF': 'Burkina Faso',
  'ML': 'Mali',
  'GH': 'Ghana',
  'NG': 'Nigeria',
  'BJ': 'Bénin',
  'TG': 'Togo',
  'GA': 'Gabon',
  'CG': 'Congo',
  'CD': 'République démocratique du Congo',
  'KE': 'Kenya',
  'NE': 'Niger',
  'TD': 'Tchad',
  'CF': 'République centrafricaine',
  
  // Synonymes et équivalences
  'Cameroon': 'Cameroun',
  'cameroun': 'Cameroun',
  'Senegal': 'Sénégal',
  'senegal': 'Sénégal',
  'Côte d\'Ivoire': "Côte d'Ivoire",
  'côte d\'ivoire': "Côte d'Ivoire",
  'Cote d\'Ivoire': "Côte d'Ivoire",
  'Ivory Coast': "Côte d'Ivoire",
  'Ghana': 'Ghana',
  'ghana': 'Ghana',
  'Nigeria': 'Nigeria',
  'nigeria': 'Nigeria',
  'Benin': 'Bénin',
  'benin': 'Bénin'
};

const COUNTRY_NAME_TO_CODE = {
  'Sénégal': 'SN',
  'Senegal': 'SN',
  "Côte d'Ivoire": 'CI',
  "Cote d'Ivoire": 'CI',
  'Ivory Coast': 'CI',
  'Cameroun': 'CM',
  'Cameroon': 'CM',
  'Burkina Faso': 'BF',
  'Burkina': 'BF',
  'Mali': 'ML',
  'Ghana': 'GH',
  'Nigeria': 'NG',
  'Bénin': 'BJ',
  'Benin': 'BJ',
  'Togo': 'TG',
  'Gabon': 'GA',
  'Congo': 'CG',
  'République démocratique du Congo': 'CD',
  'RDC': 'CD'
};

/**
 * Normalise et convertit tout identifiant pays (Code ISO ou Nom) vers le nom officiel en français
 */
export function getCountryName(input) {
  if (!input) return 'Sénégal';
  const trimmed = input.trim();
  if (COUNTRY_CODE_TO_NAME[trimmed]) return COUNTRY_CODE_TO_NAME[trimmed];
  if (COUNTRY_CODE_TO_NAME[trimmed.toUpperCase()]) return COUNTRY_CODE_TO_NAME[trimmed.toUpperCase()];
  return trimmed;
}

/**
 * Normalise et convertit tout nom ou code vers le code ISO à 2 lettres
 */
export function getCountryCode(input) {
  if (!input) return 'SN';
  const trimmed = input.trim();
  if (trimmed.length === 2 && /^[A-Z]{2}$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  return COUNTRY_NAME_TO_CODE[trimmed] || 'SN';
}

/**
 * Normalisation globale
 */
export function normalizeCountry(input) {
  return getCountryName(input);
}

/**
 * Liste de tous les noms officiels des pays supportés
 */
export function getAllCountryNames() {
  return SUPPORTED_COUNTRIES.map(c => c.name);
}
