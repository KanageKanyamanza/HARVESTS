/**
 * Jour 58 (bascule bilingue) — traduction des messages renvoyés par l'API.
 *
 * Lit directement locales/{fr,en}.json (sans passer par la librairie `i18n`,
 * dont l'option updateFiles réécrit ces fichiers en développement dès qu'une
 * clé manque). Les messages peuvent être :
 *  - une clé (« auth.wrong_credentials ») : traduite dans la langue de la requête,
 *    avec repli sur le français si la clé manque en anglais ;
 *  - une phrase ordinaire : renvoyée telle quelle (modules pas encore migrés).
 * Paramètres interpolés avec la syntaxe {{nom}}.
 */
const fr = require("../locales/fr.json");
const en = require("../locales/en.json");

const LOCALES = { fr, en };
const KEY_RE = /^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$/i;

const lookup = (obj, key) =>
	key.split(".").reduce((node, part) => (node && typeof node === "object" ? node[part] : undefined), obj);

const interpolate = (text, params = {}) =>
	text.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name) =>
		params[name] !== undefined && params[name] !== null ? String(params[name]) : match,
	);

/** Traduction d'une clé, ou null si la clé n'existe dans aucune langue. */
const translate = (key, language = "fr", params = {}) => {
	if (typeof key !== "string" || !KEY_RE.test(key)) return null;
	const value = lookup(LOCALES[language] || fr, key) ?? lookup(fr, key);
	if (typeof value === "string") return interpolate(value, params);
	if (Array.isArray(value)) return value.map((item) => (typeof item === "string" ? interpolate(item, params) : item));
	return null;
};

/** Message prêt à renvoyer : clé traduite, ou texte d'origine inchangé. */
const localize = (message, language = "fr", params = {}) => translate(message, language, params) ?? message;

/** Vrai pour un message « introuvable », en clair (ancien texte) ou en clé (« product.not_found »). */
const isNotFound = (message = "") => /non trouv|introuvable|not_found/i.test(String(message));

module.exports = { translate, localize, isNotFound };
