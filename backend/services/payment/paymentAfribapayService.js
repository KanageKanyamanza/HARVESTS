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
const { afribapayDetailsOf, mergeAfribapayDetails } = require("../../utils/paymentDetails");

// Chemin du webhook AfriBaPay, tel que monté dans app.js au Jour 77.
const AFRIBAPAY_WEBHOOK_PATH = "/api/v1/payments/afribapay/webhook";

// URL publique du backend (notify_url) : BACKEND_URL en production,
// localhost en dev — port 5000 en dev (port 3000 occupé par une autre app).
const backendPublicUrl = () =>
	String(process.env.BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");

// AfriBaPay refuse en 400 « Invalid callback URL » les return/cancel_url hors
// des domaines du compte marchand — dont localhost (constaté le 11/11/2026 :
// localhost et un domaine inconnu refusés, www.harvests.site et le backend
// onrender acceptés). En dev, on rebascule chemin + query sur ce domaine
// public : la confirmation mobile money se fait sur le téléphone et la page
// d'attente suit le /status, le retour navigateur n'est qu'accessoire.
const AFRIBAPAY_RETURN_BASE_URL = () =>
	String(process.env.AFRIBAPAY_RETURN_BASE_URL || "https://www.harvests.site").replace(/\/$/, "");

const publicCallbackUrl = (url) => {
	if (!url) return url;
	let parsed;
	try {
		parsed = new URL(url);
	} catch {
		return url;
	}
	const isLocal = /^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(parsed.hostname);
	if (parsed.protocol === "https:" && !isLocal) return url;
	return `${AFRIBAPAY_RETURN_BASE_URL()}${parsed.pathname}${parsed.search}`;
};

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
		return_url: publicCallbackUrl(returnUrl),
		cancel_url: publicCallbackUrl(cancelUrl),
		lang: "fr",
		// Pas de champ `metadata` : /pay/payin le refuse en 400 « Unexpected
		// fields: metadata » (constaté le 11/11/2026). Le webhook et le /status
		// retrouvent le Payment par order_id (R<paymentId>-pN).
	};
};

/**
 * Envoie la demande de paiement (POST /pay/payin) pour un Payment existant.
 * 1 seul retry sur erreur transitoire comme AfricaSend : le même order_id est
 * renvoyé lors du retry (AfriBaPay déduplique, pas de double débit).
 *
 * Après un échec, l'essai envoyé est consommé (attempt / payinOrderId posés)
 * dès qu'AfriBaPay a pu le recevoir : refus (réponse) → FAILED ; sans réponse
 * (réseau, timeout) → Payment remis en `pending` pour que la réconciliation
 * relise CET order_id, et un initiate suivant reste idempotent.
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

	// Vrai dès que le POST /pay/payin a été tenté : un échec du jeton seul
	// n'envoie rien, l'essai n'est alors pas consommé.
	let sent = false;
	try {
		const token = await getAccessToken();
		const response = await withRetry(
			() => {
				sent = true;
				return axios.post(`${AFRIBAPAY_BASE_URL}/pay/payin`, payinData, {
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					httpsAgent: ipv4Agent,
				});
			},
			{ retries: 1, baseDelayMs: 3000, label: "AfriBaPay Payin" },
		);

		// AfriBaPay peut coller un dump de debug PHP (avec la requête en écho)
		// devant le JSON : on lit le JSON derrière, secrets masqués au log.
		const body = parseAfribapayBody(response.data) ?? response.data;
		console.log("AfriBaPay Payin Response:", redactSecrets(JSON.stringify(body, null, 2)));

		// L'historique des essais reste porté par le Payment (champs attempts de
		// base) : chaque relance crée un nouveau transaction_id AfriBaPay partiel.
		mergeAfribapayDetails(payment, {
			operator: payinData.operator,
			phone: payinData.phone_number,
			country,
			payinOrderId: payinData.order_id,
			attempt: nextAttempt,
			transactionId: body?.data?.transaction_id || body?.transaction_id,
			processorStatus: body?.data?.status || body?.status,
			failedReadCount: 0,
		});

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
		tagIfUnavailable(error);

		// Message AfriBaPay lisible (« This phone number is unavailable… »)
		// plutôt que « Request failed with status code 400 » côté client.
		const providerMessage = parseAfribapayBody(error.response?.data)?.error?.message;
		const rawMessage = error.message;
		error.message = error.friendlyMessage || providerMessage || error.message;

		payment.attempts.push({
			status: "failed",
			errorCode: error.response?.status ? String(error.response.status) : "network",
			// Raison brute d'AfriBaPay (audit) ; le message convivial à défaut
			errorMessage: providerMessage || error.friendlyMessage || "afribapay payin",
		});

		const sentAttempt = {
			operator: payinData.operator,
			phone: payinData.phone_number,
			country,
			payinOrderId: payinData.order_id,
			attempt: nextAttempt,
		};

		// AfriBaPay a répondu : il a vu (et parfois enregistré) cet order_id,
		// la relance doit en prendre un nouveau.
		if (error.response) {
			mergeAfribapayDetails(payment, { ...sentAttempt, processorStatus: "FAILED" });
			// Refus explicite (numéro, opérateur…) : message traduit côté
			// client avec la raison d'AfriBaPay. Une indisponibilité
			// (5xx, friendlyMessage) garde son message convivial.
			if (!error.friendlyMessage) {
				error.i18nKey = "payment.afribapay_payin_rejected";
				error.params = { reason: providerMessage || rawMessage };
			}
		} else if (sent) {
			// Sans réponse (réseau, timeout) : la demande a pu arriver chez
			// AfriBaPay et sur le téléphone du client. Essai consommé, sans
			// statut FAILED, et Payment en `pending` (même s'il partait de
			// failed / cancelled) : la réconciliation (PENDING_POLL_STATUSES)
			// relit cet order_id, un nouvel initiate ne renvoie rien.
			mergeAfribapayDetails(payment, sentAttempt);
			payment.status = "pending";
		}
		throw error;
	}
};

/**
 * Relance le payin d'un Payment après un échec (abandon du client, annulation
 * de l'essai, problème réseau). requestPayin incrémente l'essai et pose
 * l'order_id unique de la relance (`R<paymentId>-p2`, `-p3`… — AfriBaPay
 * refuse la réutilisation d'un order_id, Jour 75) ; le paiement repasse en
 * processing. Utilisé par le fallback client du Jour 79 (relance depuis la page
 * d'attente) et les relances admin du Jour 85. Un échec réseau DURANT un POST
 * /pay/payin est d'abord retenté par withRetry avec le même order_id
 * (AfriBaPay déduplique) ; s'il persiste, l'essai est consommé et le paiement
 * repasse en pending pour la réconciliation (voir requestPayin).
 *
 * @param {object} payinParams mêmes paramètres que requestPayin
 *   ({ payment, amount, currency, operator, phone, country, returnUrl, cancelUrl })
 * @throws {Error} "payment.afribapay_confirmed" si le payin est déjà confirmé
 */
const retryAfribapayPayin = async (payinParams) => {
	const { payment } = payinParams;
	if (["succeeded", "refunded", "partially_refunded"].includes(payment.status)) {
		const error = new Error("Paiement déjà confirmé : relance interdite");
		error.i18nKey = "payment.afribapay_confirmed";
		throw error;
	}
	// Les compteurs d'échec /status (J78) ne doivent pas survivre à une
	// nouvelle demande de paiement.
	mergeAfribapayDetails(payment, { failedReadCount: 0 });
	return requestPayin(payinParams);
};

module.exports = {
	AFRIBAPAY_WEBHOOK_PATH,
	afribapayDetailsOf,
	backendPublicUrl,
	buildPayinData,
	publicCallbackUrl,
	requestPayin,
	retryAfribapayPayin,
};
