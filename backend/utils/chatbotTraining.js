// Jour 66 (bascule bilingue) — construction des données d'entraînement du
// chatbot, extraite de chatBotController pour être testable sans NlpManager.
//
// Le français reste la langue de référence des FAQs (saisies au back-office) ;
// les champs anglais, quand ils existent, alimentent les mêmes intentions côté
// anglais. Une FAQ sans traduction anglaise n'ajoute simplement aucune donnée
// en anglais — elle continue de répondre normalement en français.

const SUPPORTED_LANGUAGES = ["fr", "en"];

const faqIntent = (faq) =>
	faq.intent || `faq.${faq.category || "autre"}.${faq._id}`;

const addFaqVariations = (manager, language, intent, keywords = [], templates = []) => {
	keywords.forEach((keyword) => {
		if (!keyword || !keyword.trim()) return;
		manager.addDocument(language, keyword, intent);
		templates.forEach((template) => {
			manager.addDocument(language, template(keyword), intent);
		});
	});
};

const frenchVariations = [
	(keyword) => `Je veux savoir ${keyword}`,
	(keyword) => `Parle moi de ${keyword}`,
];

const englishVariations = [
	(keyword) => `I want to know about ${keyword}`,
	(keyword) => `Tell me about ${keyword}`,
];

/**
 * Ajoute une FAQ au manager NLP dans les langues disponibles.
 * Retourne true si la FAQ possède au moins une intention anglaise complète
 * (question + réponse) et a donc été entraînée en anglais.
 */
function addFaqToManager(manager, faq) {
	if (!faq || !faq.question || !faq.answer) return false;

	const intent = faqIntent(faq);

	// Français : question, mots-clés et variations.
	manager.addDocument("fr", faq.question, intent);
	addFaqVariations(manager, "fr", intent, faq.keywords, frenchVariations);
	manager.addAnswer("fr", intent, faq.answer);

	// Anglais : uniquement si la FAQ a été traduite (sinon on n'entraîne pas
	// le bot à répondre en français à une question anglaise).
	if (!faq.questionEn || !faq.answerEn) {
		return false;
	}

	manager.addDocument("en", faq.questionEn, intent);
	addFaqVariations(manager, "en", intent, faq.keywordsEn, englishVariations);
	manager.addAnswer("en", intent, faq.answerEn);

	return true;
}

// Jour 67 — intentions système (salutations, remerciements, au revoir) et
// phrases de recherche de produit, dans chaque langue. Le français conserve
// « hello », « thanks » et « bye », déjà utilisés tels quels par les clients
// francophones.
const SYSTEM_INTENTS = {
	fr: {
		greeting: {
			documents: ["bonjour", "salut", "hello", "bonsoir"],
			answers: ["Bonjour ! 👋 Comment puis-je vous aider aujourd'hui ?"],
		},
		thanks: {
			documents: ["merci", "merci beaucoup", "thanks", "c'est gentil", "ok merci"],
			answers: [
				"Je vous en prie ! 😊 N'hésitez pas si vous avez d'autres questions.",
				"Avec plaisir ! Je suis là pour ça. 👋",
			],
		},
		goodbye: {
			documents: ["au revoir", "bye", "a bientot"],
			answers: ["Au revoir ! À bientôt sur Harvests ! 👋"],
		},
	},
	en: {
		greeting: {
			documents: ["hello", "hi", "hey", "good morning", "good evening"],
			answers: ["Hello! 👋 How can I help you today?"],
		},
		thanks: {
			documents: ["thanks", "thank you", "thank you very much", "that's kind", "ok thanks"],
			answers: [
				"You're welcome! 😊 Feel free to ask if you have any other questions.",
				"My pleasure! I'm here to help. 👋",
			],
		},
		goodbye: {
			documents: ["goodbye", "bye", "see you soon", "see you later"],
			answers: ["Goodbye! See you soon on Harvests! 👋"],
		},
	},
};

const SEARCH_PHRASES = {
	fr: [
		"je veux",
		"je cherche",
		"avez-vous",
		"trouver",
		"acheter",
		"prix de",
		"combien coute",
		"vendez-vous",
		"je voudrais",
	],
	en: [
		"i want",
		"i'm looking for",
		"do you have",
		"find",
		"buy",
		"price of",
		"how much is",
		"do you sell",
		"i would like",
	],
};

// Articles à placer entre la phrase et le produit (« je veux des %product% »).
const SEARCH_DETERMINERS = {
	fr: ["", "des ", "du "],
	en: ["", "some ", "the "],
};

function addSystemIntents(manager) {
	SUPPORTED_LANGUAGES.forEach((language) => {
		Object.entries(SYSTEM_INTENTS[language]).forEach(([intent, data]) => {
			data.documents.forEach((text) => manager.addDocument(language, text, intent));
			data.answers.forEach((answer) => manager.addAnswer(language, intent, answer));
		});
	});
}

function addSearchIntents(manager) {
	SUPPORTED_LANGUAGES.forEach((language) => {
		SEARCH_PHRASES[language].forEach((phrase) => {
			SEARCH_DETERMINERS[language].forEach((determiner) => {
				manager.addDocument(
					language,
					`${phrase} ${determiner}%product%`,
					"search.product",
				);
			});
		});
	});
}

// Mots vides retirés d'un message avant la recherche de produit de repli.
const SEARCH_STOP_WORDS = {
	fr: [
		"je", "tu", "il", "elle", "nous", "vous", "ils", "elles", "veux", "voudrais",
		"aimerais", "cherche", "besoin", "de", "des", "le", "la", "les", "un", "une",
		"du", "de la", "sur", "dans", "trouver", "acheter", "avez", "avoir", "est-ce",
		"que", "avez-vous", "disponible", "disponibles", "prix", "questions",
		"frequentes", "fréquentes", "info", "infos", "information", "informations",
		"aide", "aider", "comment", "pourquoi", "quand", "ou", "où",
	],
	en: [
		"i", "you", "we", "they", "want", "would", "like", "looking", "for", "need",
		"a", "an", "the", "some", "any", "of", "do", "does", "have", "has", "sell",
		"find", "buy", "available", "price", "prices", "how", "much", "is", "are",
		"what", "why", "when", "where", "can", "could", "please", "help", "info",
		"information", "questions", "faq", "i'm", "i'd", "to", "me",
	],
};

/**
 * Langue de la conversation : celle détectée pour la requête (paramètre
 * ?lang=, en-tête X-Language, cookie, Accept-Language), repliée sur le
 * français si elle n'est pas supportée par le modèle.
 */
const resolveChatLanguage = (language) =>
	SUPPORTED_LANGUAGES.includes(language) ? language : "fr";

module.exports = {
	SUPPORTED_LANGUAGES,
	SEARCH_STOP_WORDS,
	addFaqToManager,
	addSystemIntents,
	addSearchIntents,
	faqIntent,
	resolveChatLanguage,
};
