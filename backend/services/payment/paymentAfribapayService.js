// Payin AfriBaPay (Jour 76) : encaissement du client en mobile money, intégré
// d'après le fonctionnement éprouvé dans AfricaSend
// (controllers/transaction/transaction.afribapay.js). Le webhook (Jour 77) et
// le /status (Jour 78) confirmeront le paiement ; ici seule la demande part.
const axios = require("axios");
const { AFRIBAPAY_BASE_URL, AFRIBAPAY_MERCHANT_KEY, isAfribapayConfigured } = require("../../config/afribapay");
const { getAccessToken, ipv4Agent, withRetry, tagIfUnavailable } = require("../../utils/afribapayClient");
const { parseAfribapayBody, redactSecrets, formatPhoneForAfribapay } = require("../../utils/afribapayUtils");
const { toAfribapayOperator } = require("../../utils/afribapayOperator");
const { payinOrderIdFor } = require("../../utils/payinOrderId");

// Chemin du webhook AfriBaPay, tel que monté dans app.js au Jour 77.
const AFRIBAPAY_WEBHOOK_PATH = "/api/v1/payments/afribapay/webhook";

// URL publique du backend (notify_url) : BACKEND_URL en production,
// localhost en dev — port 5000 en dev (port 3000 occupé par une autre app).
const backendPublicUrl = () =>
	String(process.env.BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");

/**
 * Construit le payload /pay/payin (pur, testé sans appeler l'API).
 * AfriBaPay exige merchant_key, un operator côté serveur, un order_id unique
 * par essai et des URLs de notification / retour / abandon.
 */
const buildPayinData = ({
	paymentId,
	orderId,
	amount,
	currency,
	operator,
	phone,
	country = "SN",
	returnUrl,
	cancelUrl,
	attempt = 1,
}) => {
	// Montants HARVESTS : FCFA (XOF/XAF) à unité entière — arrondi serveur,
	// jamais la valeur déclarée par le client.
	const roundedAmount = Math.round(Number(amount) || 0);
	const payinOrderId = payinOrderIdFor(`R${paymentId}`, attempt);
	const formattedPhone = formatPhoneForAfribapay(String(phone || ""), country);

	return {
		operator: toAfribapayOperator(operator),
		country,
		phone_number: formattedPhone,
		amount: roundedAmount,
		currency,
		merchant_key: AFRIBAPAY_MERCHANT_KEY,
		order_id: payinOrderId,
		notify_url: `${backendPublicUrl()}${AFRIBAPAY_WEBHOOK_PATH}`,
		return_url: returnUrl,
		cancel_url: cancelUrl,
		lang: "fr",
		// Contexte interne (non signé) : filtre le webhook et l'alerting au J77
		metadata: {
			source: "harvests",
			paymentId: String(paymentId),
			orderId: String(orderId),
		},
	};
};

/**
 * Envoie la demande de paiement (POST /pay/payin) pour un Payment existant.
 * 1 seul retry sur erreur transitoire comme AfricaSend : le même order_id est
 * renvoyé lors du retry (AfriBaPay déduplique, pas de double débit).
 */
const requestPayin = async ({ payment, amount, currency, operator, phone, country, returnUrl, cancelUrl }) => {
	if (!isAfribapayConfigured()) {
		const error = new Error("payment.afribapay_not_configured");
		error.i18nKey = "payment.afribapay_not_configured";
		throw error;
	}

	const attempt = payment.paymentDetails?.afribapay?.attempt || 0;
	const nextAttempt = attempt + 1;

	const payinData = buildPayinData({
		paymentId: payment.paymentId,
		orderId: payment.order,
		amount,
		currency,
		operator,
		phone,
		country,
		returnUrl,
		cancelUrl,
		attempt: nextAttempt,
	});

	// merchant_key masquée : même le dump de debug d'AfriBaPay la répercuterait
	console.log("Calling AfriBaPay Payin with:", redactSecrets(JSON.stringify(payinData, null, 2)));

	try {
		const token = await getAccessToken();
		const response = await withRetry(
			() =>
				axios.post(`${AFRIBAPAY_BASE_URL}/pay/payin`, payinData, {
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					httpsAgent: ipv4Agent,
				}),
			{ retries: 1, baseDelayMs: 3000, label: "AfriBaPay Payin" },
		);

		// AfriBaPay peut coller un dump de debug PHP (avec la requête en écho)
		// devant le JSON : on lit le JSON derrière, secrets masqués au log.
		const body = parseAfribapayBody(response.data) ?? response.data;
		console.log("AfriBaPay Payin Response:", redactSecrets(JSON.stringify(body, null, 2)));

		// L'historique des essais reste porté par le Payment (champs attempts de
		// base) : chaque relance crée un nouveau transaction_id AfriBaPay partiel.
		payment.paymentDetails.afribapay = {
			operator: payinData.operator,
			phone: payinData.phone_number,
			country,
			payinOrderId: payinData.order_id,
			attempt: nextAttempt,
			transactionId: body?.data?.transaction_id || body?.transaction_id,
			processorStatus: body?.data?.status || body?.status,
		};

		// La demande est partie : le client doit confirmer sur son téléphone.
		// On passe en `processing` (`isPending` du schema la couvre) ;
		// seul le webhook (J77) ou le /status confirmé (J78) passe en succeeded.
		payment.status = "processing";
		payment.attempts.push({ status: "processing" });

		return body;
	} catch (error) {
		console.error("AfriBaPay Payin Error:", redactSecrets(error.response?.data ?? error.message));
		const { invalidateAfribapayTokenOn401 } = require("../../utils/afribapayTokenCache");
		invalidateAfribapayTokenOn401(error);
		payment.attempts.push({
			status: "failed",
			errorCode: error.response?.status ? String(error.response.status) : "network",
			errorMessage: error.friendlyMessage || "afribapay payin",
		});
		throw tagIfUnavailable(error);
	}
};

module.exports = {
	AFRIBAPAY_WEBHOOK_PATH,
	backendPublicUrl,
	buildPayinData,
	requestPayin,
};
