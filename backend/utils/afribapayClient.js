// Client HTTP AfriBaPay partagé (Jour 75) — porté d'AfricaSend
// (transaction.afribapay.js) et centralisé ici pour que le payin (Jour 76) et
// le payout (Jour 81) fassent exactement les mêmes appels : même agent IPv4,
// même récupération de token en cache, même retry sur erreurs transitoires.
const axios = require("axios");
const https = require("https");
const {
	AFRIBAPAY_BASE_URL,
	AFRIBAPAY_API_USER,
	AFRIBAPAY_API_KEY,
} = require("../config/afribapay");
const {
	getCachedAfribapayToken,
	storeAfribapayToken,
	invalidateAfribapayTokenOn401,
} = require("./afribapayTokenCache");

// AfriBaPay garble en IPv6 dans certains environnements d'hébergement :
// on force IPv4 sur tous les appels, comme AfricaSend.
const ipv4Agent = new https.Agent({ family: 4 });

// Message affiché aux clients (web) quand l'API AfriBaPay est en panne
// (5xx / réseau). Jour 79 (parcours client) branchera les clés i18n fr/en
// côté frontend ; ce message sert aux erreurs renvoyées en attendant.
const OPERATOR_UNAVAILABLE_MESSAGE =
	"Le service de paiement est temporairement indisponible. Veuillez réessayer dans quelques minutes.";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Erreur transitoire côté AfriBaPay : pas de réponse (réseau) ou passerelle
// en panne. Un 5xx précis (500) ou une erreur métier (4xx) n'est PAS retenté.
const isTransientError = (error) =>
	!error.response || [502, 503, 504].includes(error.response.status);

// Marque l'erreur pour que les contrôleurs affichent un message convivial au
// lieu du message axios brut.
const tagIfUnavailable = (error) => {
	if (isTransientError(error)) {
		error.friendlyMessage = OPERATOR_UNAVAILABLE_MESSAGE;
	}
	return error;
};

const withRetry = async (
	fn,
	{ retries = 2, baseDelayMs = 2000, label = "AfriBaPay" } = {},
) => {
	let lastError;
	for (let attempt = 0; attempt <= retries; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error;
			if (!isTransientError(error) || attempt === retries) throw error;
			const delay = baseDelayMs * (attempt + 1);
			console.warn(
				`[${label}] Erreur transitoire (${
					error.response?.status || error.code || "réseau"
				}), nouvelle tentative ${attempt + 1}/${retries} dans ${delay}ms...`,
			);
			await sleep(delay);
		}
	}
	throw lastError;
};

const afribapayBasicAuth = () =>
	`Basic ${Buffer.from(`${AFRIBAPAY_API_USER}:${AFRIBAPAY_API_KEY}`).toString("base64")}`;

const getAccessToken = async () => {
	const cachedToken = getCachedAfribapayToken();
	if (cachedToken) return cachedToken;

	if (!AFRIBAPAY_API_USER || !AFRIBAPAY_API_KEY) {
		throw new Error(
			"AfriBaPay non configuré : AFRIBAPAY_API_USER / AFRIBAPAY_API_KEY requis",
		);
	}

	try {
		const response = await withRetry(
			() =>
				axios.post(
					`${AFRIBAPAY_BASE_URL}/token`,
					{},
					{
						headers: {
							Authorization: afribapayBasicAuth(),
							"Content-Type": "application/json",
						},
						httpsAgent: ipv4Agent,
					},
				),
			{ label: "AfriBaPay Token" },
		);
		const body = response.data;
		// Doc AfriBaPay : la réponse n'a pas toujours le même emballage selon le
		// pays/endpoint (vu sur /token comme sur /status) — on essaie tous les
		// niveaux plutôt que de supposer une nidification fixe.
		const token =
			body?.data?.access_token || body?.token || body?.access_token;
		if (!token) {
			console.error("AfriBaPay Token Missing in Response:", body);
			throw new Error("Access token not found in AfriBaPay response");
		}
		storeAfribapayToken(token, body?.data?.expires_in);
		return token;
	} catch (error) {
		// Un 401 signifie token expiré ou révoqué : vider le cache pour que
		// l'appel suivant en redemande un.
		invalidateAfribapayTokenOn401(error);
		console.error("AfriBaPay Auth Error:", error.response?.data || error.message);
		const authError = new Error("Failed to authenticate with AfriBaPay");
		if (isTransientError(error)) {
			authError.friendlyMessage = OPERATOR_UNAVAILABLE_MESSAGE;
		}
		throw tagIfUnavailable(authError);
	}
};

module.exports = {
	ipv4Agent,
	OPERATOR_UNAVAILABLE_MESSAGE,
	sleep,
	isTransientError,
	withRetry,
	tagIfUnavailable,
	afribapayBasicAuth,
	getAccessToken,
};
