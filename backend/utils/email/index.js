const Email = require('./emailClass');
const {
  envoyerEmailVerification,
  envoyerEmailBienvenue,
  envoyerEmailConfirmationCommande,
  envoyerEmailNouvelleCommande,
  envoyerEmailMiseAJourCommande,
  envoyerEmailNouvelAvis
} = require('./emailHelpers');

// Exporter la classe Email comme export principal
module.exports = Email;

// Exporter les fonctions utilitaires
module.exports.envoyerEmailVerification = envoyerEmailVerification;
module.exports.envoyerEmailBienvenue = envoyerEmailBienvenue;
module.exports.envoyerEmailConfirmationCommande = envoyerEmailConfirmationCommande;
module.exports.envoyerEmailNouvelleCommande = envoyerEmailNouvelleCommande;
module.exports.envoyerEmailMiseAJourCommande = envoyerEmailMiseAJourCommande;
module.exports.envoyerEmailNouvelAvis = envoyerEmailNouvelAvis;

