const Email = require('./email/index');
const {
  envoyerEmailVerification,
  envoyerEmailBienvenue,
  envoyerEmailConfirmationCommande,
  envoyerEmailNouvelleCommande,
  envoyerEmailMiseAJourCommande,
  envoyerEmailNouvelAvis
} = require('./email/emailHelpers');

module.exports = Email;
module.exports.envoyerEmailVerification = envoyerEmailVerification;
module.exports.envoyerEmailBienvenue = envoyerEmailBienvenue;
module.exports.envoyerEmailConfirmationCommande = envoyerEmailConfirmationCommande;
module.exports.envoyerEmailNouvelleCommande = envoyerEmailNouvelleCommande;
module.exports.envoyerEmailMiseAJourCommande = envoyerEmailMiseAJourCommande;
module.exports.envoyerEmailNouvelAvis = envoyerEmailNouvelAvis;
