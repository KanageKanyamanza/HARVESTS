// order_id des remboursements client AfriBaPay (Jour 83) — même règle que les
// payins et payouts : un order_id ne doit JAMAIS être réutilisé, même après un
// échec. Le 1er remboursement garde `refund-<paymentId>`, chaque relance reçoit
// le sien (`refund-<paymentId>-r2`, `-r3`…). Porté d'AfricaSend
// (transaction.payout.js, refundOrderIdFor).
const PREFIX = "refund-";
const SUFFIX = /^(.+)-r(\d+)$/;

/** order_id du n-ième remboursement (1 = premier, sans suffixe). */
const refundOrderIdFor = (paymentId, attempt = 1) => {
	const base = `${PREFIX}${String(paymentId).trim()}`;
	return Number(attempt) > 1 ? `${base}-r${Number(attempt)}` : base;
};

/** Identifiant local du paiement à partir d'un order_id de remboursement. */
const paymentIdFromRefundOrderId = (orderId) => {
	const raw = String(orderId || "").trim();
	const withoutPrefix = raw.startsWith(PREFIX) ? raw.slice(PREFIX.length) : raw;
	const match = SUFFIX.exec(withoutPrefix);
	return match ? match[1] : withoutPrefix;
};

/** Numéro d'essai porté par un order_id de remboursement (1 sans suffixe). */
const refundAttemptNumber = (orderId) => {
	const raw = String(orderId || "").trim();
	const withoutPrefix = raw.startsWith(PREFIX) ? raw.slice(PREFIX.length) : raw;
	const match = SUFFIX.exec(withoutPrefix);
	return match ? Number(match[2]) : 1;
};

/**
 * Test d'appartenance : un order_id reçu doit correspondre à NOTRE paiement —
 * sinon l'identifiant d'un autre remboursement AfriBaPay pourrait lui être
 * rattaché.
 */
const refundOrderIdBelongsTo = (orderId, paymentId) => {
	if (!orderId || !paymentId) return false;
	return paymentIdFromRefundOrderId(orderId) === String(paymentId).trim();
};

/**
 * L'order_id reçu vise-t-il un essai dépassé ? AfriBaPay notifie chaque essai
 * séparément : l'échec tardif de `refund-<id>` est normal quand `-r2` a déjà
 * confirmé le remboursement.
 */
const isSupersededRefundOrderId = (incomingOrderId, { confirmedOrderId, lastAttempt } = {}) => {
	const incoming = String(incomingOrderId || "").trim();
	if (!incoming) return false;
	if (confirmedOrderId) return incoming !== String(confirmedOrderId).trim();
	return refundAttemptNumber(incoming) < (Number(lastAttempt) || 1);
};

/** L'order_id désigne-t-il un remboursement (et non un payout) ? */
const isRefundOrderId = (orderId) => String(orderId || "").trim().startsWith(PREFIX);

module.exports = {
	refundOrderIdFor,
	paymentIdFromRefundOrderId,
	refundAttemptNumber,
	refundOrderIdBelongsTo,
	isSupersededRefundOrderId,
	isRefundOrderId,
};
