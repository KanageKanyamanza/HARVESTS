// Mise à jour des sous-documents de Payment.paymentDetails (afribapay, paypal,
// cash). Sur un document Mongoose, un sous-document ne s'étale PAS :
// `{ ...payment.paymentDetails.afribapay, x }` recopie ses internes
// ($__, _doc) au lieu de ses champs, et la réaffectation laisse alors les
// ANCIENNES valeurs en place (payinConfirmedOrderId, failedReadCount,
// processorStatus, confirmedBy… jamais persistés). On passe donc toujours par
// toObject(). Accepte aussi un objet simple (tests, documents lean).

/**
 * Copie simple (modifiable) de paymentDetails[key].
 * @param {object} payment
 * @param {string} key "afribapay" | "paypal" | "cash"
 * @returns {object}
 */
const paymentDetailsOf = (payment, key) => {
	const sub = payment?.paymentDetails?.[key];
	if (!sub) return {};
	return typeof sub.toObject === "function" ? sub.toObject() : { ...sub };
};

/**
 * Fusionne `patch` dans paymentDetails[key] (les champs absents du patch sont
 * conservés).
 * @param {object} payment
 * @param {string} key
 * @param {object} patch
 */
const mergePaymentDetails = (payment, key, patch) => {
	payment.paymentDetails = payment.paymentDetails || {};
	payment.paymentDetails[key] = { ...paymentDetailsOf(payment, key), ...patch };
	return payment.paymentDetails[key];
};

const afribapayDetailsOf = (payment) => paymentDetailsOf(payment, "afribapay");
const mergeAfribapayDetails = (payment, patch) => mergePaymentDetails(payment, "afribapay", patch);

module.exports = {
	paymentDetailsOf,
	mergePaymentDetails,
	afribapayDetailsOf,
	mergeAfribapayDetails,
};
