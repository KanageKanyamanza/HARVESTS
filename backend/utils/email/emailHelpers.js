// Fonctions utilitaires pour l'envoi d'emails
const Email = require('./emailClass');

const envoyerEmailVerification = async (user) => {
  const url = `${process.env.FRONTEND_URL}/verify-email/${user.emailVerificationToken}`;
  await new Email(user, url).sendWelcome();
};

const envoyerEmailBienvenue = async (user) => {
  const url = `${process.env.FRONTEND_URL}/dashboard`;
  await new Email(user, url).sendWelcome();
};

const envoyerEmailConfirmationCommande = async (order) => {
  const url = `${process.env.FRONTEND_URL}/orders/${order._id}`;
  // Simuler l'envoi
  console.log(`📧 Email confirmation commande envoyé à ${order.client.email}`);
};

const envoyerEmailNouvelleCommande = async (order) => {
  const url = `${process.env.FRONTEND_URL}/producer/orders/${order._id}`;
  // Simuler l'envoi
  console.log(`📧 Email nouvelle commande envoyé au producteur`);
};

const envoyerEmailMiseAJourCommande = async (order) => {
  const url = `${process.env.FRONTEND_URL}/orders/${order._id}`;
  // Simuler l'envoi
  console.log(`📧 Email mise à jour statut "${order.statut}" envoyé`);
};

const envoyerEmailNouvelAvis = async (review) => {
  const url = `${process.env.FRONTEND_URL}/reviews/${review._id}`;
  // Simuler l'envoi
  console.log(`📧 Email notification nouvel avis envoyé au producteur`);
};

module.exports = {
  envoyerEmailVerification,
  envoyerEmailBienvenue,
  envoyerEmailConfirmationCommande,
  envoyerEmailNouvelleCommande,
  envoyerEmailMiseAJourCommande,
  envoyerEmailNouvelAvis
};

