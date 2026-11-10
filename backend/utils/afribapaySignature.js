// Signature des webhooks AfriBaPay (Jour 77) — porté d'AfricaSend
// (utils/afribapaySignature.js, éprouvé sur 353 payins validés). Doc AfriBaPay :
// en-tête `Afribapay-Sign` = HMAC-SHA256 hexadécimal du corps BRUT de la
// requête, signé avec l'API_KEY du marchand. Le corps brut est conservé par
// app.js (req.rawBody) sur la route du webhook payin — vérifier sur un corps
// re-sérialisé par express.json échouait chez AfricaSend (0 webhook accepté).
const crypto = require("crypto");

const SIGNATURE_HEADER = "afribapay-sign";

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

module.exports = { SIGNATURE_HEADER, checkAfribapaySignature };
