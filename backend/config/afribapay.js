/**
 * Configuration AfriBaPay (Jour 75) : fondations du paiement mobile money,
 * payin encaissé auprès du client, payout versé aux vendeurs — intégrées
 * d'après le fonctionnement éprouvé dans AfricaSend (transaction.afribapay.js,
 * transaction.payout.js). Tout est centralisé ici : AfricaSend avait deux
 * jeux de valeurs par défaut divergents (controller payin en sandbox,
 * controller payout en production), exactement l'erreur que son fichier
 * afribapayOperator.js documente.
 */

const stripTrailingSlash = (url) => String(url || "").replace(/\/$/, "");

// Base payin : /token, /pay/payin, /status et /balance en sont dérivés.
const AFRIBAPAY_BASE_URL = stripTrailingSlash(
	process.env.AFRIBAPAY_BASE_URL || "https://api-sandbox.afribapay.com/v1",
);

// Endpoint complet du payout : l'API payout est distincte de la base payin
// (AfricaSend POSTe directement sur cet URL). Réglée en production par env,
// la valeur reprise ici est celle utilisée en LIVE par AfricaSend.
const AFRIBAPAY_PAYOUT_URL = stripTrailingSlash(
	process.env.AFRIBAPAY_PAYOUT_URL ||
		"https://api-payout.afribapay.com/v1/pay/payout",
);

const AFRIBAPAY_API_USER = process.env.AFRIBAPAY_API_USER;
const AFRIBAPAY_API_KEY = process.env.AFRIBAPAY_API_KEY;
const AFRIBAPAY_MERCHANT_KEY = process.env.AFRIBAPAY_MERCHANT_KEY;

// True dès que les credentials existent : disponible pour Jour 76 (refuser la
// méthode mobile_money plutôt que d'échouer au milieu d'une commande) et
// Jour 85 (afficher l'état d'activation dans le back-office).
const isAfribapayConfigured = () =>
	Boolean(AFRIBAPAY_API_USER && AFRIBAPAY_API_KEY && AFRIBAPAY_MERCHANT_KEY);

module.exports = {
	AFRIBAPAY_BASE_URL,
	AFRIBAPAY_PAYOUT_URL,
	AFRIBAPAY_API_USER,
	AFRIBAPAY_API_KEY,
	AFRIBAPAY_MERCHANT_KEY,
	isAfribapayConfigured,
};
