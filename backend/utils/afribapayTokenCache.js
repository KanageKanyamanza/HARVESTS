// Cache du token AfriBaPay, partagé par tous les appels (payin, payout, statut,
// solde, poller) — porté d'AfricaSend. Doc AfriBaPay : le token vaut ~24h pour
// tous les pays et services, et doit être réutilisé tant qu'il est valide
// plutôt que redemandé à chaque requête. On le garde au plus 30 min (et 5 min
// avant son expiration annoncée) ; un 401 le vide pour que l'appel suivant en
// redemande un.
const MAX_AGE_MS = 30 * 60 * 1000;
const MARGIN_MS = 5 * 60 * 1000;

let cached = null; // { token, expiresAt }

const getCachedAfribapayToken = () =>
	cached && Date.now() < cached.expiresAt ? cached.token : null;

/**
 * @param {string} token
 * @param {number} [expiresInSeconds] champ expires_in de la réponse /token
 */
const storeAfribapayToken = (token, expiresInSeconds) => {
	if (!token) return;
	const announced =
		Number(expiresInSeconds) > 0
			? Number(expiresInSeconds) * 1000 - MARGIN_MS
			: MAX_AGE_MS;
	const ttl = Math.min(MAX_AGE_MS, announced);
	cached = ttl > 0 ? { token, expiresAt: Date.now() + ttl } : null;
};

const invalidateAfribapayToken = () => {
	cached = null;
};

// À appeler dans les catch : un 401 signifie token expiré ou révoqué.
const invalidateAfribapayTokenOn401 = (error) => {
	if (error?.response?.status === 401) invalidateAfribapayToken();
};

module.exports = {
	getCachedAfribapayToken,
	storeAfribapayToken,
	invalidateAfribapayToken,
	invalidateAfribapayTokenOn401,
};
