// Jour 66 (bascule bilingue) — traduction française -> anglaise du contenu des
// FAQs gérées au back-office, pour alimenter les intentions anglaises du
// chatbot (utils/chatbotTraining.js).
//
// Le français reste la source de vérité ; les champs anglais ne sont remplis
// que s'ils sont vides (une traduction corrigée à la main n'est jamais
// écrasée). Pour forcer une nouvelle traduction, il suffit de vider le champ
// anglais puis d'enregistrer.
const { translateText } = require("./translateText");

const hasText = (value) =>
	typeof value === "string" && value.trim().length > 0;

/** Traduit un texte fr -> en ; retourne "" en cas d'échec (jamais d'exception). */
async function translateToEnglish(text) {
	if (!hasText(text)) return "";

	try {
		const { translatedText, ok } = await translateText(text, "fr", "en");
		return ok && hasText(translatedText) ? translatedText.trim() : "";
	} catch (error) {
		console.warn("FAQ : traduction anglaise impossible :", error.message);
		return "";
	}
}

/**
 * Traduit une liste de mots-clés. Les échecs sont ignorés (un mot-clé manquant
 * ne doit pas empêcher d'entraîner la question et la réponse en anglais).
 */
async function translateKeywordsToEnglish(keywords = []) {
	const translated = [];

	for (const keyword of keywords) {
		const english = await translateToEnglish(keyword);
		if (english && !translated.includes(english)) translated.push(english);
	}

	return translated;
}

/**
 * Traduit les champs fournis d'une FAQ. Les champs absents du payload sont
 * renvoyés vides : l'appelant ne remplace donc que ce qu'il voulait traduire.
 */
async function translateFaqFields({ question, answer, keywords } = {}) {
	const [questionEn, answerEn, keywordsEn] = await Promise.all([
		translateToEnglish(question),
		translateToEnglish(answer),
		keywords && keywords.length ?
			translateKeywordsToEnglish(keywords)
		:	Promise.resolve([]),
	]);

	return { questionEn, answerEn, keywordsEn };
}

/**
 * Complète sur place les champs anglais manquants d'un document Faq.
 * Retourne true si au moins un champ a été rempli.
 */
async function fillEnglishFields(faq) {
	if (!faq) return false;

	const missing = {};
	if (hasText(faq.question) && !hasText(faq.questionEn)) {
		missing.question = faq.question;
	}
	if (hasText(faq.answer) && !hasText(faq.answerEn)) {
		missing.answer = faq.answer;
	}
	if (
		Array.isArray(faq.keywords) &&
		faq.keywords.length > 0 &&
		(!Array.isArray(faq.keywordsEn) || faq.keywordsEn.length === 0)
	) {
		missing.keywords = faq.keywords;
	}

	if (Object.keys(missing).length === 0) return false;

	const { questionEn, answerEn, keywordsEn } =
		await translateFaqFields(missing);

	let filled = false;
	if (questionEn) {
		faq.questionEn = questionEn;
		filled = true;
	}
	if (answerEn) {
		faq.answerEn = answerEn;
		filled = true;
	}
	if (keywordsEn.length > 0) {
		faq.keywordsEn = keywordsEn;
		filled = true;
	}

	return filled;
}

module.exports = {
	translateFaqFields,
	fillEnglishFields,
};
