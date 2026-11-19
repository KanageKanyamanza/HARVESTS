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

// Délai de garde entre la livraison et le reversement (Jour 81, décision
// utilisateur du 13/11/2026) : 72 h pendant lesquelles un litige ou un
// remboursement (Jour 83) peut encore être traité avant que les fonds ne
// quittent le float HARVESTS.
const DEFAULT_PAYOUT_HOLD_HOURS = 72;

/**
 * Délai de garde en heures : HARVESTS_PAYOUT_HOLD_HOURS si c'est un nombre fini
 * ≥ 0, sinon 72. Une valeur invalide ne doit jamais produire un délai aberrant
 * (un délai négatif rendrait toute commande exigible immédiatement).
 * @param {object} [env=process.env]
 * @returns {number}
 */
const getPayoutHoldHours = (env = process.env) => {
	const raw = env?.HARVESTS_PAYOUT_HOLD_HOURS;
	if (raw === undefined || raw === null || String(raw).trim() === "") return DEFAULT_PAYOUT_HOLD_HOURS;
	const hours = Number(raw);
	if (!Number.isFinite(hours) || hours < 0) return DEFAULT_PAYOUT_HOLD_HOURS;
	return hours;
};

// Taux de conversion XOF → XAF (Jour 81, décision utilisateur du 13/11/2026) :
// les commandes sont libellées en XOF, les vendeurs des pays XAF (CM, GA, CG,
// TD, CF) sont payés en XAF. Par défaut 1 (parité de fait entre les deux
// francs CFA), surchargeable sans toucher au code.
const DEFAULT_XOF_TO_XAF_RATE = 1;

/**
 * Taux XOF → XAF : HARVESTS_XOF_TO_XAF_RATE s'il s'agit d'un nombre fini > 0,
 * sinon 1. Un taux ≤ 0 ou non numérique est refusé : il inverserait le sens du
 * reversement ou produirait un montant aberrant.
 * @param {object} [env=process.env]
 * @returns {number}
 */
const getXofToXafRate = (env = process.env) => {
	const raw = env?.HARVESTS_XOF_TO_XAF_RATE;
	if (raw === undefined || raw === null || String(raw).trim() === "") return DEFAULT_XOF_TO_XAF_RATE;
	const rate = Number(raw);
	if (!Number.isFinite(rate) || rate <= 0) return DEFAULT_XOF_TO_XAF_RATE;
	return rate;
};

module.exports = {
	DEFAULT_COMMISSION_RATE,
	getCommissionRate,
	DEFAULT_PAYOUT_HOLD_HOURS,
	getPayoutHoldHours,
	DEFAULT_XOF_TO_XAF_RATE,
	getXofToXafRate,
	PAYOUT_STATUSES,
	PAYOUT_SELLER_TYPES,
	PAYOUT_CURRENCIES,
	COUNTRY_PAYOUT_CURRENCY,
	SETTLED_PAYMENT_STATUSES,
	DELIVERED_STATUSES,
	EXCLUDED_ORDER_STATUSES,
	EXCLUDED_ITEM_STATUSES,
};
