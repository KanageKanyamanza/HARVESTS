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

