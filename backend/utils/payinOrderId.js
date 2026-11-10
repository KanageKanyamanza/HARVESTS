// order_id des payins AfriBaPay — porté d'AfricaSend (utils/payinOrderId.js).
// Doc AfriBaPay : un order_id ne doit JAMAIS être réutilisé, même après un
// échec. Le 1er essai garde l'identifiant de base (`R<paymentId>`), chaque
// relance client reçoit le sien (`R<paymentId>-p2`, `R<paymentId>-p3`…).
// Le retry réseau automatique d'un même essai (withRetry du client) garde
// volontairement le même order_id : c'est ce qui permet à AfriBaPay de
// dédupliquer et d'éviter un double débit.
const SUFFIX = /^(.+)-p(\d+)$/;

/** order_id du n-ième essai (1 = premier, sans suffixe). */
const payinOrderIdFor = (paymentId, attempt = 1) =>
	attempt > 1 ? `${paymentId}-p${attempt}` : String(paymentId);

/** Identifiant de paiement à partir d'un order_id de payin (avec ou sans suffixe). */
const paymentIdFromPayinOrderId = (orderId) => {
	const id = String(orderId || "").trim();
	const match = SUFFIX.exec(id);
	return match ? match[1] : id;
};

/** Numéro d'essai porté par un order_id de payin (1 = premier, sans suffixe). */
const payinAttemptNumber = (orderId) => {
	const match = SUFFIX.exec(String(orderId || "").trim());
	return match ? Number(match[2]) : 1;
};

/**
 * Le webhook vise-t-il un essai DÉPASSÉ ? (porté d'AfricaSend, utilisé au
 * Jour 77) : AfriBaPay notifie chaque essai séparément, et un webhook livré en
 * retard peut annoncer l'échec de `R123-p2` alors que le payin a déjà été
 * confirmé par l'essai confirmé (`payinConfirmedOrderId` du Payment). Un échec
 * sur un tel essai est normal : simple log, jamais d'alerte ni de rétrogradation.
 * @param {string} incomingOrderId order_id du webhook
 * @param {{confirmedOrderId?: string, lastAttempt?: number}} reference
 *   l'essai qui a confirmé le payin, ou à défaut le numéro du dernier essai envoyé
 * @returns {boolean}
 */
const isSupersededPayinOrderId = (incomingOrderId, { confirmedOrderId, lastAttempt } = {}) => {
	const incoming = String(incomingOrderId || "").trim();
	if (!incoming) return false;
	if (confirmedOrderId) return incoming !== String(confirmedOrderId).trim();
	return payinAttemptNumber(incoming) < (Number(lastAttempt) || 1);
};

module.exports = {
	payinOrderIdFor,
	paymentIdFromPayinOrderId,
	payinAttemptNumber,
	isSupersededPayinOrderId,
};
