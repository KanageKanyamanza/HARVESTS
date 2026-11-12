// Reversements vendeurs AfriBaPay (Jour 80) : constantes partagées par le
// modèle Payout et le service des vendeurs payables
// (services/payment/paymentPayoutService.js). Le Jour 80 ne fait que lister ce
// qui est dû ; l'envoi du payout (J81), son webhook (J82) et la capture des
// frais réels AfriBaPay (J84) s'appuieront sur ces mêmes listes.

// Commission HARVESTS : 7,5 % (décision utilisateur). Source unique du taux :
// la commission plateforme des commandes (models/order/orderMethods.js,
// calculateFees) et les reversements vendeurs lisent tous deux
// getCommissionRate().
const DEFAULT_COMMISSION_RATE = 0.075;

/**
 * Taux de commission en vigueur : HARVESTS_COMMISSION_RATE s'il s'agit d'un
 * nombre fini dans [0, 1[, sinon 7,5 %. Une valeur invalide ne doit jamais
 * produire un reversement aberrant (taux négatif ou ≥ 100 %).
 * @param {object} [env=process.env]
 * @returns {number}
 */
const getCommissionRate = (env = process.env) => {
	const raw = env?.HARVESTS_COMMISSION_RATE;
	if (raw === undefined || raw === null || String(raw).trim() === "") return DEFAULT_COMMISSION_RATE;
	const rate = Number(raw);
	if (!Number.isFinite(rate) || rate < 0 || rate >= 1) return DEFAULT_COMMISSION_RATE;
	return rate;
};

// Statuts d'un Payout. ambiguous / network_issue sont distingués dès
// maintenant pour le Jour 81 (enquête sans relance automatique vs relance).
const PAYOUT_STATUSES = [
	"pending",
	"processing",
	"succeeded",
	"failed",
	"ambiguous",
	"network_issue",
	"cancelled",
];

// Type de vendeur reversé : producteur, restaurateur, tout autre profil.
const PAYOUT_SELLER_TYPES = ["producer", "restaurateur", "other"];

// AfriBaPay ne reverse ici qu'en francs CFA (pas de centimes).
const PAYOUT_CURRENCIES = ["XOF", "XAF"];

// Devise de reversement par pays couvert (code ISO de config/afribapayOperators.js).
// Pays AfriBaPay absents (CD, GM, GN) : devise locale hors XOF/XAF, vendeur
// bloqué en « country_not_covered » tant que le reversement n'y est pas ouvert.
const COUNTRY_PAYOUT_CURRENCY = {
	SN: "XOF",
	CI: "XOF",
	BF: "XOF",
	ML: "XOF",
	BJ: "XOF",
	TG: "XOF",
	NE: "XOF",
	GW: "XOF",
	CM: "XAF",
	GA: "XAF",
	CG: "XAF",
	TD: "XAF",
	CF: "XAF",
};

// Encaissement acté (payin confirmé ou règlement de la livraison).
const SETTLED_PAYMENT_STATUSES = ["succeeded", "completed"];

// Commande ou segment vendeur livré.
const DELIVERED_STATUSES = ["delivered", "completed"];

// Commandes jamais reversées, même avec un segment livré.
const EXCLUDED_ORDER_STATUSES = ["cancelled", "refunded", "disputed"];

// Articles hors assiette du reversement.
const EXCLUDED_ITEM_STATUSES = ["cancelled", "rejected", "refunded", "disputed"];

module.exports = {
	DEFAULT_COMMISSION_RATE,
	getCommissionRate,
	PAYOUT_STATUSES,
	PAYOUT_SELLER_TYPES,
	PAYOUT_CURRENCIES,
	COUNTRY_PAYOUT_CURRENCY,
	SETTLED_PAYMENT_STATUSES,
	DELIVERED_STATUSES,
	EXCLUDED_ORDER_STATUSES,
	EXCLUDED_ITEM_STATUSES,
};
