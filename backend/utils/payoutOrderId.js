// order_id des payouts AfriBaPay — calqué sur utils/payinOrderId.js (Jour 81).
// Doc AfriBaPay : un order_id ne doit JAMAIS être réutilisé, même après un
// échec. Le 1er envoi garde l'identifiant de base (`payout-<id>`), chaque
// relance reçoit le sien (`payout-<id>-r2`, `payout-<id>-r3`…). Le retry
// réseau automatique d'un MÊME envoi (withRetry du client) garde volontairement
// le même order_id : c'est ce qui permet à AfriBaPay de dédupliquer et d'éviter
// un double paiement.
const PREFIX = "payout-";
const SUFFIX = /^(.+)-r(\d+)$/;

/** Référence racine d'un payout (`payout-<id>`). */
const payoutReferenceFor = (payoutId) => `${PREFIX}${String(payoutId).trim()}`;

/** order_id de la n-ième tentative (1 = premier, sans suffixe). */
const payoutOrderIdFor = (payoutId, attempt = 1) =>
	Number(attempt) > 1 ? `${payoutReferenceFor(payoutId)}-r${Number(attempt)}` : payoutReferenceFor(payoutId);

/** Identifiant local du payout à partir d'un order_id (avec ou sans suffixe). */
const payoutIdFromPayoutOrderId = (orderId) => {
	const raw = String(orderId || "").trim();
	const withoutPrefix = raw.startsWith(PREFIX) ? raw.slice(PREFIX.length) : raw;
	const match = SUFFIX.exec(withoutPrefix);
	return match ? match[1] : withoutPrefix;
};

/** Numéro de tentative porté par un order_id (1 = premier, sans suffixe). */
const payoutAttemptNumber = (orderId) => {
	const raw = String(orderId || "").trim();
	const withoutPrefix = raw.startsWith(PREFIX) ? raw.slice(PREFIX.length) : raw;
	const match = SUFFIX.exec(withoutPrefix);
	return match ? Number(match[2]) : 1;
};

/**
 * Tous les order_ids couverts par un payout dont la dernière tentative envoyée
 * est `lastAttempt` (plafonné à 20 comme le payin) : /status?order_id= ne
 * renvoie parfois que le premier essai d'une relance. Utilisé par le webhook
 * payout (Jour 82).
 */
const allPayoutOrderIdsFor = (payoutId, lastAttempt = 1) => {
	const count = Math.min(20, Math.max(1, Number(lastAttempt) || 1));
	return Array.from({ length: count }, (_, i) => payoutOrderIdFor(payoutId, i + 1));
};

/**
 * Test d'appartenance pour le webhook payout : un order_id reçu doit
 * correspondre à NOTRE payout — sinon l'identifiant d'une autre transaction
 * AfriBaPay pourrait être rattaché au nôtre.
 */
const payoutOrderIdBelongsTo = (orderId, payoutId) => {
	if (!orderId || !payoutId) return false;
	return payoutIdFromPayoutOrderId(orderId) === String(payoutId).trim();
};

/**
 * L'order_id reçu est-il dépassé ? AfriBaPay notifie chaque tentative
 * séparément, et un webhook tardif peut annoncer l'échec de `payout-<id>-r2`
 * alors qu'une tentative plus récente a réussi.
 */
const isSupersededPayoutOrderId = (incomingOrderId, { confirmedOrderId, lastAttempt } = {}) => {
	const incoming = String(incomingOrderId || "").trim();
	if (!incoming) return false;
	if (confirmedOrderId) return incoming !== String(confirmedOrderId).trim();
	return payoutAttemptNumber(incoming) < (Number(lastAttempt) || 1);
};

module.exports = {
	payoutReferenceFor,
	payoutOrderIdFor,
	payoutIdFromPayoutOrderId,
	payoutAttemptNumber,
	allPayoutOrderIdsFor,
	payoutOrderIdBelongsTo,
	isSupersededPayoutOrderId,
};