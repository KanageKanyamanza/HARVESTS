// Signature des webhooks AfriBaPay (Jour 77) — porté d'AfricaSend
// (utils/afribapaySignature.js, éprouvé sur 353 payins validés). Doc AfriBaPay :
// en-tête `Afribapay-Sign` = HMAC-SHA256 hexadécimal du corps BRUT de la
// requête, signé avec l'API_KEY du marchand. Le corps brut est conservé par
// app.js (req.rawBody) sur la route du webhook payin — vérifier sur un corps
// re-sérialisé par express.json échouait chez AfricaSend (0 webhook accepté).
const crypto = require("crypto");

const SIGNATURE_HEADER = "afribapay-sign";

// Jour 82 — secret d'URL du webhook payout : AfriBaPay peut notifier sans
// signature exploitable. Le secret est alors transporté par l'URL de
// notification (`?secret=…`) ou par un en-tête, et comparé en temps constant.
const URL_SECRET_PARAM = "secret";
const URL_SECRET_HEADER = "afribapay-secret";

/**
 * Vérifie l'en-tête Afribapay-Sign d'un webhook payin.
 * Compare en temps constant (audit AfricaSend 2026-10-02, O2) le HMAC
 * hexadécimal du corps brut avec chaque clé acceptée (vides ignorées).
 *
 * @param {object} req requête Express (headers, rawBody, body)
 * @param {string[]} keys clés acceptées (AFRIBAPAY_API_KEY en premier ;
 *   AFRIBAPAY_WEBHOOK_SECRET en repli ; sans rawBody, repli sur le JSON
 *   re-sérialisé du corps déjà parsé)
 * @returns {"valid"|"missing"|"invalid"|"unconfigured"}
 */
const checkAfribapaySignature = (req, keys) => {
	const signingKeys = (keys || []).filter(Boolean);
	if (!signingKeys.length) return "unconfigured";

	const signature = req.headers?.[SIGNATURE_HEADER];
	if (!signature) return "missing";

	const signedPayload =
		req.rawBody || Buffer.from(JSON.stringify(req.body || {}));
	const sigBuf = Buffer.from(String(signature).trim().toLowerCase());

	const valid = signingKeys.some((key) => {
		const expBuf = Buffer.from(
			crypto.createHmac("sha256", key).update(signedPayload).digest("hex"),
		);
		return (
			sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)
		);
	});
	return valid ? "valid" : "invalid";
};

/**
 * Vérifie un secret d'URL ou d'en-tête (webhook payout, Jour 82).
 * Comparaison en temps constant, longueurs différentes traitées comme
 * invalides (jamais d'exception ni de comparaison courte).
 *
 * @param {string|undefined} provided valeur reçue (query `secret` ou en-tête)
 * @param {string|undefined} expected secret configuré
 * @returns {"valid"|"missing"|"invalid"|"unconfigured"}
 */
const checkUrlSecret = (provided, expected) => {
	if (!expected) return "unconfigured";
	if (!provided) return "missing";
	const a = Buffer.from(String(provided));
	const b = Buffer.from(String(expected));
	if (a.length !== b.length) return "invalid";
	return crypto.timingSafeEqual(a, b) ? "valid" : "invalid";
};

module.exports = { SIGNATURE_HEADER, checkAfribapaySignature, URL_SECRET_PARAM, URL_SECRET_HEADER, checkUrlSecret };
