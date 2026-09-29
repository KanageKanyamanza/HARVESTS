// Jour 48 (bascule bilingue) : lecture/écriture des champs de contenu
// bilingues ({ fr, en }) dans les formulaires vendeur (produit producteur,
// puis transformateur et plats restaurateur aux Jours 51 et 53).
//
// Le vendeur saisit dans la langue de son interface (langue « source ») ; un
// bloc facultatif permet de retoucher l'autre langue. Côté backend
// (models/product/productMiddleware.js), une langue fournie est conservée
// telle quelle et la langue absente est remplie par traduction automatique,
// dans les deux sens.

export const CONTENT_LANGS = ["fr", "en"];

/** Langue source d'un formulaire à partir de la langue de l'interface. */
export const getSourceLang = (uiLang) => (uiLang === "en" ? "en" : "fr");

/** L'autre langue de contenu. */
export const getOtherLang = (lang) => (lang === "en" ? "fr" : "en");

/**
 * Valeur d'une langue précise, sans repli sur l'autre langue.
 *
 * À utiliser pour préremplir un formulaire d'édition : toPlainText() suit la
 * langue de l'interface et replie sur l'autre langue, ce qui ferait
 * enregistrer un texte dans la mauvaise langue.
 * Une chaîne simple (produit antérieur au Jour 45) est considérée comme du
 * français.
 */
export const getLocalizedValue = (value, lang) => {
	if (typeof value === "string") return lang === "fr" ? value : "";
	if (value && typeof value === "object" && typeof value[lang] === "string") {
		return value[lang];
	}
	return "";
};

/**
 * Langue dont la traduction est devenue obsolète en édition, ou null.
 *
 * Une langue modifiée en tant que texte principal (rôle "source") rend
 * l'autre obsolète si celle-ci n'a pas changé : elle doit être retraduite.
 * Une langue modifiée en tant que retouche (rôle "retouch") n'invalide rien :
 * le vendeur corrige une traduction, le texte d'origine reste valable.
 * Les rôles sont mémorisés au moment de la saisie, pour rester justes si
 * l'utilisateur change la langue de l'interface (ce qui échange les champs)
 * entre la modification et l'enregistrement.
 *
 * @param current  { fr, en } valeurs actuelles
 * @param original { fr, en } valeurs chargées
 * @param roles    { fr?: "source" | "retouch", en?: ... }
 */
export const getStaleLang = (current, original, roles = {}) => {
	const changed = (lang) =>
		(current[lang] || "").trim() !== (original?.[lang] || "").trim();
	for (const lang of CONTENT_LANGS) {
		const other = getOtherLang(lang);
		if (roles[lang] === "source" && changed(lang) && !changed(other)) {
			return other;
		}
	}
	return null;
};

/**
 * Construit la valeur envoyée au backend pour un champ bilingue.
 *
 * @param source     texte saisi dans la langue source (obligatoire)
 * @param other      retouche facultative dans l'autre langue
 * @param sourceLang "fr" ou "en"
 * @param staleLang  langue à ne pas envoyer car obsolète (getStaleLang)
 *
 * Une langue vide ou obsolète n'est pas envoyée : le backend la remplit par
 * traduction automatique. Sinon la retouche du vendeur est conservée.
 */
export const buildBilingualValue = (
	source,
	other,
	sourceLang = "fr",
	staleLang = null,
) => {
	const values = {
		[sourceLang]: (source || "").trim(),
		[getOtherLang(sourceLang)]: (other || "").trim(),
	};
	const kept = Object.fromEntries(
		Object.entries(values).filter(([lang, text]) => text && lang !== staleLang),
	);
	// Garde-fou : ne jamais envoyer un champ vide
	return Object.keys(kept).length ? kept : { [sourceLang]: values[sourceLang] };
};
