const LanguageSwitch = require("../models/LanguageSwitch");
const { normalizeLocale } = require("../config/i18n");
const catchAsync = require("../utils/catchAsync");

/**
 * Jour 73 (lancement bilingue) : suivi de l'usage de la bascule fr/en.
 *
 * L'enregistrement est volontairement léger (GET, sans authentification) :
 * il suit le motif des relevés déjà en place, /health?lang= (porteur neutre
 * du Jour 63) et /newsletter/track/:id/:subscriberId (ouverture d'info-
 * lettre), qui font aussi écrire en base via un GET. Le navigateur appelle
 * cet endpoint au moment du clic (utils/languageUsage.js) sans attendre la
 * réponse : une erreur réseau ne doit jamais gêner la bascule.
 *
 * Aucune donnée nominative n'est enregistrée : langue de départ, langue
 * choisie, endroit de l'interface, chemin de la page et identifiant
 * anonyme du navigateur. Rien de plus.
 */

const MAX_VALUE_LENGTHS = {
	context: 64,
	visitorId: 64,
	path: 512,
};

/**
 * Coupe une chaîne en entrée : une valeur absente ou non textuelle devient
 * une chaîne vide ; une valeur plus longue est tronquée, sans erreur — un
 * navigateur exotique ne doit pas faire échouer le suivi.
 */
const sanitizeText = (raw, maxLength) => {
	if (typeof raw !== "string") return "";
	return raw.trim().slice(0, maxLength);
};

/**
 * Valide et normalise les paramètres d'une bascule de langue.
 * Exposé pour les tests (language-usage.test.js) : retourne soit
 * { error: cléDeMessage }, soit { data: { from, to, context, visitorId, path } }.
 * from === to n'est pas une bascule (clic déjà à la langue visée, double
 * envoi, script automatisé) : ignoré, pas d'écriture en base.
 */
const normalizeSwitchInput = ({ from, to, context, path, visitor } = {}) => {
	const fromLocale = normalizeLocale(from);
	const toLocale = normalizeLocale(to);

	if (!fromLocale || !toLocale) {
		return { error: { key: "errors.bad_request", statusCode: 400 } };
	}

	if (fromLocale === toLocale) {
		return { error: { key: "errors.bad_request", statusCode: 400 } };
	}

	const visitorId = sanitizeText(visitor, MAX_VALUE_LENGTHS.visitorId);
	if (!visitorId) {
		// Sans identifiant, un agrégat "visiteurs distincts" serait faux :
		// chaque bascule resterait anonyme au point de compter pour plusieurs
		// personnes. On refuse plutôt que de polluer les statistiques.
		return { error: { key: "errors.bad_request", statusCode: 400 } };
	}

	return {
		data: {
			from: fromLocale,
			to: toLocale,
			context: sanitizeText(context, MAX_VALUE_LENGTHS.context) || "unknown",
			path: sanitizeText(path, MAX_VALUE_LENGTHS.path),
			visitorId,
		},
	};
};

/**
 * Relevé d'une bascule : GET /api/v1/language-usage
 *   ?from=fr&to=en&context=header&path=/products&visitor=…
 * Fire-and-forget côté front : l'erreur ne doit jamais gêner la bascule.
 */
exports.recordLanguageSwitch = catchAsync(async (req, res) => {
	const input = normalizeSwitchInput(req.query);

	if (input.error) {
		return res.status(input.error.statusCode).json({
			success: false,
			message: req.t(input.error.key),
		});
	}

	await LanguageSwitch.create({ ...input.data, occurredAt: new Date() });

	res.status(200).json({ success: true });
});

// Type de module CommonJS : on ajoute les exports de test à l'objet
// module.exports existant (un `module.exports = {…}` réécrirait l'export
// recordLanguageSwitch déclaré plus haut).
module.exports.normalizeSwitchInput = normalizeSwitchInput;
module.exports.MAX_VALUE_LENGTHS = MAX_VALUE_LENGTHS;
