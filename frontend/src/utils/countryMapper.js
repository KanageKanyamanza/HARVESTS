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

// Jour 79 — l'adresse du checkout stocke un nom affiché (« Sénégal »), alors
// que le paiement mobile et AfriBaPay attendent un code ISO 2 lettres. Sans
// inverse, la caisse ne pouvait pas demander les opérateurs du bon pays.
const COUNTRY_NAME_TO_CODE = {
  'Sénégal': 'SN',
  'Senegal': 'SN',
  'Côte d\'Ivoire': 'CI',
  'Cote d\'Ivoire': 'CI',
  'Côte d’Ivoire': 'CI',
  'Ivory Coast': 'CI',
  'Cameroun': 'CM',
  'Cameroon': 'CM',
  'Burkina Faso': 'BF',
  'Mali': 'ML',
  'Ghana': 'GH',
  'Nigeria': 'NG',
  'Bénin': 'BJ',
  'Benin': 'BJ',
  'Togo': 'TG',
  'Gabon': 'GA',
  'Congo': 'CG',
  'République démocratique du Congo': 'CD',
  'République democratique du Congo': 'CD',
  'RD Congo': 'CD',
  'RDC': 'CD',
  'Kenya': 'KE',
  'Niger': 'NE',
  'Tchad': 'TD',
  'République centrafricaine': 'CF',
  'Centrafrique': 'CF',
  'Gambie': 'GM',
  'Guinée Conakry': 'GN',
  'Guinée-Bissau': 'GW'
};

/**
 * Convertit un code ISO ou un nom de pays (français/anglais) vers le code ISO
 * 2 lettres utilisé par les API de paiement. ''. retourné si inconnu : mieux
 * vaut masquer le mobile money que de proposer les opérateurs d'un autre pays.
 */
export function getCountryCode(input) {
  if (!input) return '';
  const trimmed = String(input).trim();
  const upper = trimmed.toUpperCase();
  if (SUPPORTED_COUNTRIES.some((country) => country.code === upper)) return upper;
  const match = Object.entries(COUNTRY_NAME_TO_CODE).find(
    ([name]) => name.toLowerCase() === trimmed.toLowerCase()
  );
  return match ? match[1] : '';
}
