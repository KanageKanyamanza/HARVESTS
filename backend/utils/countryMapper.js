/**
 * Utilitaire centralisé backend pour la gestion des pays, codes ISO, et filtres régionaux
 */

const SUPPORTED_COUNTRIES = [
  { code: 'SN', name: 'Sénégal', currency: 'XOF', zone: 'West Africa' },
  { code: 'CI', name: "Côte d'Ivoire", currency: 'XOF', zone: 'West Africa' },
  { code: 'CM', name: 'Cameroun', currency: 'XAF', zone: 'Central Africa' },
  { code: 'BF', name: 'Burkina Faso', currency: 'XOF', zone: 'West Africa' },
  { code: 'ML', name: 'Mali', currency: 'XOF', zone: 'West Africa' },
  { code: 'GH', name: 'Ghana', currency: 'GHS', zone: 'West Africa' },
  { code: 'NG', name: 'Nigeria', currency: 'NGN', zone: 'West Africa' },
  { code: 'BJ', name: 'Bénin', currency: 'XOF', zone: 'West Africa' },
  { code: 'TG', name: 'Togo', currency: 'XOF', zone: 'West Africa' },
  { code: 'GA', name: 'Gabon', currency: 'XAF', zone: 'Central Africa' },
  { code: 'CG', name: 'Congo', currency: 'XAF', zone: 'Central Africa' },
  { code: 'CD', name: 'République démocratique du Congo', currency: 'CDF', zone: 'Central Africa' },
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

const countrySynonyms = {
  'SN': ['SN', 'Sénégal', 'Senegal'],
  'Sénégal': ['SN', 'Sénégal', 'Senegal'],
  'Senegal': ['SN', 'Sénégal', 'Senegal'],
  'CM': ['CM', 'Cameroun', 'Cameroon'],
  'Cameroun': ['CM', 'Cameroun', 'Cameroon'],
  'Cameroon': ['CM', 'Cameroun', 'Cameroon'],
  'CI': ['CI', "Côte d'Ivoire", "Cote d'Ivoire", 'Ivory Coast'],
  "Côte d'Ivoire": ['CI', "Côte d'Ivoire", "Cote d'Ivoire", 'Ivory Coast'],
  "Cote d'Ivoire": ['CI', "Côte d'Ivoire", "Cote d'Ivoire", 'Ivory Coast'],
  'BF': ['BF', 'Burkina Faso', 'Burkina'],
  'Burkina Faso': ['BF', 'Burkina Faso', 'Burkina'],
  'ML': ['ML', 'Mali'],
  'Mali': ['ML', 'Mali'],
  'GH': ['GH', 'Ghana'],
  'Ghana': ['GH', 'Ghana'],
  'NG': ['NG', 'Nigeria'],
  'Nigeria': ['NG', 'Nigeria'],
  'BJ': ['BJ', 'Bénin', 'Benin'],
  'Bénin': ['BJ', 'Bénin', 'Benin'],
  'TG': ['TG', 'Togo'],
  'Togo': ['TG', 'Togo'],
  'GA': ['GA', 'Gabon'],
  'Gabon': ['GA', 'Gabon'],
  'CG': ['CG', 'Congo'],
  'Congo': ['CG', 'Congo'],
  'CD': ['CD', 'République démocratique du Congo', 'RDC'],
};

function getCountryName(input) {
  if (!input) return 'Sénégal';
  const trimmed = input.trim();
  if (COUNTRY_CODE_TO_NAME[trimmed]) return COUNTRY_CODE_TO_NAME[trimmed];
  if (COUNTRY_CODE_TO_NAME[trimmed.toUpperCase()]) return COUNTRY_CODE_TO_NAME[trimmed.toUpperCase()];
  return trimmed;
}

function getCountryCode(input) {
  if (!input) return 'SN';
  const trimmed = input.trim();
  if (trimmed.length === 2 && /^[A-Z]{2}$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  return COUNTRY_NAME_TO_CODE[trimmed] || 'SN';
}

function normalizeCountry(input) {
  return getCountryName(input);
}

function getCountryFilterList(country) {
  if (!country) return [];
  if (country === 'West Africa') {
    return ['SN', 'Sénégal', 'Senegal', 'CI', "Côte d'Ivoire", "Cote d'Ivoire", 'BF', 'Burkina Faso', 'ML', 'Mali', 'GH', 'Ghana', 'NG', 'Nigeria', 'NE', 'Niger', 'BJ', 'Bénin', 'Benin', 'TG', 'Togo'];
  }
  if (country === 'Central Africa') {
    return ['CM', 'Cameroun', 'Cameroon', 'GA', 'Gabon', 'CG', 'Congo', 'CD', 'République démocratique du Congo', 'TD', 'Tchad', 'CF', 'République centrafricaine'];
  }
  const normalized = country.trim();
  return countrySynonyms[normalized] || [normalized];
}

module.exports = {
  SUPPORTED_COUNTRIES,
  getCountryName,
  getCountryCode,
  normalizeCountry,
  getCountryFilterList,
  COUNTRY_CODE_TO_NAME,
  COUNTRY_NAME_TO_CODE,
  countrySynonyms
};
