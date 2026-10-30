import i18nInstance from "i18next";
import { DEFAULT_CURRENCY } from "../config/currencies";

// Jour 70 (bascule bilingue) - conventions d'affichage des prix figées avec le
// reste du lexique (cf docs/GLOSSAIRE_REFERENCE.md, décision J70-3 dans
// docs/I18N_DECISIONS.md) :
//   fr : « 3 000 F CFA »  (séparateur de milliers = espace, devise après)
//   en : « FCFA 3,000 »   (séparateur de milliers = virgule, devise avant)
// Le montant reste libellé en FCFA/XOF dans les deux langues : la plateforme
// vend en francs CFA, seule la présentation change. Avant le Jour 70, tous les
// prix passaient par `fr-FR` et restaient donc au format français en anglais.
const LOCALES = { fr: "fr-FR", en: "en-US" };

// `i18next` exporte l'instance partagée initialisée par utils/i18n.js. On la lit
// directement pour éviter que ce module (importé par currencyUtils, lui-même
// importé partout) ne dépende de tout le chargement des locales.
const resolveLanguage = (language) => {
	const value = String(language || i18nInstance?.language || "fr").toLowerCase();
	return value.startsWith("en") ? "en" : "fr";
};

// Intl rend le franc CFA « F CFA » (espace insécable). En anglais on recolle le
// code en « FCFA », où il ouvre le montant ; en français on garde la forme
// « F CFA » déjà affichée partout.
const normalizeFcfa = (formatted, language) =>
	language === "en" ? formatted.replace(/F[\u00a0\u202f\s]?CFA/g, "FCFA") : formatted;

export const formatPriceForLanguage = (
	amount,
	currency = DEFAULT_CURRENCY,
	language,
) => {
	const lang = resolveLanguage(language);
	// Formattage spécial pour le FCFA (pas de décimales)
	const isFCFA = currency === "FCFA" || currency === "XOF";
	const intlCurrency = currency === "FCFA" ? "XOF" : currency; // Intl ne connaît pas FCFA

	try {
		return normalizeFcfa(
			new Intl.NumberFormat(LOCALES[lang], {
				style: "currency",
				currency: intlCurrency,
				minimumFractionDigits: isFCFA ? 0 : 2,
				maximumFractionDigits: isFCFA ? 0 : 2,
			}).format(amount),
			lang,
		);
	} catch {
		console.warn(
			`Invalid currency code: ${currency}, falling back to ${DEFAULT_CURRENCY}`,
		);
		return normalizeFcfa(
			new Intl.NumberFormat(LOCALES[lang], {
				style: "currency",
				currency: "XOF",
				minimumFractionDigits: 0,
			}).format(amount),
			lang,
		);
	}
};
