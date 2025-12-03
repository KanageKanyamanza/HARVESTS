// Fonction pour obtenir le préfixe du pays (code à 2 lettres)
function getCountryPrefix(countryName) {
  const { getCountryCode } = require('../../utils/countryMapper');
  return getCountryCode(countryName);
}

module.exports = { getCountryPrefix };

