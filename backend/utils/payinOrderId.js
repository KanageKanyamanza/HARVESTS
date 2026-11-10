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

/**
 * Référence AfriBaPay d'un paiement : préfixe `R` décoratif posé par
 * buildPayinData (Jour 76). HARVESTS isole ce préfixe d'ici — contrairement à
 * AfricaSend, dont l'identifiant de transaction INCLUT déjà le `R` (R103543678),
 * le paymentId local est un ObjectId nu : sans cette factorisation, l'aller-
 * retour order_id → paymentId ne refermait pas la boucle (le webhook J77
 * cherchait un paymentId « R682f… » jamais stocké en base).
 */
const payinReferenceFor = (paymentId) => `R${String(paymentId).trim()}`;

/** Identifiant de paiement local à partir d'un order_id de payin (avec ou sans suffixe). */
const paymentIdFromPayinOrderId = (orderId) => {
	const id = String(orderId || "").trim();
	const match = SUFFIX.exec(id);
	const root = match ? match[1] : id;
	// Le `R` est un ornement d'AfriBaPay, jamais le début d'un paymentId
	// local (ObjectId hexadécimal) : retiré pour refermer l'aller-retour.
	return root.replace(/^R(?=.)/, "");
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

/**
 * Tous les order_ids couverts par un paiement dont la référence (avec le
 * préfixe `R`, cf. payinReferenceFor) est `paymentRef`, et dont le dernier
 * essai envoyé est `lastAttempt` (Jour 78) : /status?order_id= ne renvoie
 * parfois QUE le premier essai — AfricaSend a constaté sur R103543678 un
 * 2e essai confirmé invisible par /status/order_id. Utilisé par la
 * vérification /status pour interroger chaque essai tant qu'aucun n'est
 * confirmé.
 */
const allPayinOrderIdsFor = (paymentId, lastAttempt = 1) => {
	const count = Math.min(20, Math.max(1, Number(lastAttempt) || 1));
	return Array.from({ length: count }, (_, i) => payinOrderIdFor(paymentId, i + 1));
};

/**
 * Test d'appartenance pour /status : une réponse interrogée par transaction_id
 * doit confirmer appartenir à NOTRE paiement (paymentId) — sinon l'ID AfriBaPay
 * d'une AUTRE transaction pourrait lui être rattaché. Accepte un order_id exact
 * (R<paymentId> ou R<paymentId>-pN) aussi bien que le paymentId nu lui-même :
 * paymentIdFromPayinOrderId retire le préfixe décoratif des deux côtés.
 * @param {string} orderId order_id renvoyé par AfriBaPay (ou order_id racine)
 * @param {string} paymentId identifiant du paiement local (sans préfixe R)
 * @returns {boolean}
 */
const payinOrderIdBelongsTo = (orderId, paymentId) => {
	if (!orderId || !paymentId) return false;
	const expected = String(paymentId).trim();
	const actual = paymentIdFromPayinOrderId(orderId);
	return actual === expected;
};

module.exports = {
	payinOrderIdFor,
	payinReferenceFor,
	paymentIdFromPayinOrderId,
	payinAttemptNumber,
	allPayinOrderIdsFor,
	payinOrderIdBelongsTo,
	isSupersededPayinOrderId,
};
