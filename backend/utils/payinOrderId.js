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

module.exports = { payinOrderIdFor, paymentIdFromPayinOrderId, payinAttemptNumber };
