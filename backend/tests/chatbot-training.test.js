/**
 * Jour 66 — intentions FAQ anglaises : on vérifie que la construction des
 * données d'entraînement ajoute bien la question, les mots-clés et la réponse
 * en anglais, sans jamais entraîner l'anglais avec du texte français.
 */
const {
	addFaqToManager,
	addSearchIntents,
	addSystemIntents,
	faqIntent,
	resolveChatLanguage,
	SEARCH_STOP_WORDS,
	SUPPORTED_LANGUAGES,
} = require("../utils/chatbotTraining");

const createRecorder = () => {
	const documents = [];
	const answers = [];
	return {
		documents,
		answers,
		addDocument: (language, text, intent) =>
			documents.push({ language, text, intent }),
		addAnswer: (language, intent, answer) =>
			answers.push({ language, intent, answer }),
	};
};

const faq = {
	_id: "64b000000000000000000001",
	category: "livraison",
	intent: "livraison.delai",
	question: "Quels sont les délais de livraison ?",
	answer: "Dakar : 24-48h.",
	keywords: ["délai", "combien de temps"],
	questionEn: "What are the delivery times?",
	answerEn: "Dakar: 24-48h.",
	keywordsEn: ["delivery time", "how long"],
};

describe("entraînement du chatbot en anglais (Jour 66)", () => {
	test("le manager gère le français et l'anglais", () => {
		expect(SUPPORTED_LANGUAGES).toEqual(["fr", "en"]);
	});

	test("une FAQ traduite alimente la même intention dans les deux langues", () => {
		const manager = createRecorder();

		expect(addFaqToManager(manager, faq)).toBe(true);

		const french = manager.documents.filter((doc) => doc.language === "fr");
		const english = manager.documents.filter((doc) => doc.language === "en");

		expect(french).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					text: "Quels sont les délais de livraison ?",
					intent: "livraison.delai",
				}),
				expect.objectContaining({ text: "Je veux savoir délai" }),
			]),
		);
		expect(english).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					text: "What are the delivery times?",
					intent: "livraison.delai",
				}),
				expect.objectContaining({
					text: "delivery time",
					intent: "livraison.delai",
				}),
				expect.objectContaining({ text: "Tell me about how long" }),
			]),
		);

		expect(manager.answers).toEqual(
			expect.arrayContaining([
				{
					language: "fr",
					intent: "livraison.delai",
					answer: "Dakar : 24-48h.",
				},
				{
					language: "en",
					intent: "livraison.delai",
					answer: "Dakar: 24-48h.",
				},
			]),
		);
	});

	test("aucune donnée anglaise tant que la FAQ n'a pas de traduction", () => {
		const manager = createRecorder();
		const untranslated = { ...faq, questionEn: "", answerEn: "", keywordsEn: [] };

		expect(addFaqToManager(manager, untranslated)).toBe(false);
		expect(manager.documents.every((doc) => doc.language === "fr")).toBe(true);
		expect(manager.answers).toEqual([
			{ language: "fr", intent: "livraison.delai", answer: "Dakar : 24-48h." },
		]);
	});

	test("une réponse anglaise manquante n'entraîne pas l'anglais", () => {
		const manager = createRecorder();
		const halfTranslated = { ...faq, answerEn: "" };

		expect(addFaqToManager(manager, halfTranslated)).toBe(false);
		expect(manager.documents.every((doc) => doc.language === "fr")).toBe(true);
	});

	test("l'intention est déduite de la catégorie et de l'id si elle manque", () => {
		expect(faqIntent({ ...faq, intent: undefined })).toBe(
			"faq.livraison.64b000000000000000000001",
		);
	});
});

describe("salutations et routage par langue (Jour 67)", () => {
	test("les intentions système existent dans chaque langue avec une réponse", () => {
		const manager = createRecorder();
		addSystemIntents(manager);

		SUPPORTED_LANGUAGES.forEach((language) => {
			["greeting", "thanks", "goodbye"].forEach((intent) => {
				expect(
					manager.documents.some((d) => d.language === language && d.intent === intent),
				).toBe(true);
				expect(
					manager.answers.some((a) => a.language === language && a.intent === intent),
				).toBe(true);
			});
		});
	});

	test("les réponses anglaises sont en anglais", () => {
		const manager = createRecorder();
		addSystemIntents(manager);

		expect(
			manager.answers.find((a) => a.language === "en" && a.intent === "greeting").answer,
		).toMatch(/^Hello/);
		expect(manager.documents).toEqual(
			expect.arrayContaining([
				{ language: "en", text: "thank you", intent: "thanks" },
				{ language: "fr", text: "merci", intent: "thanks" },
			]),
		);
	});

	test("la recherche de produit est entraînée dans les deux langues", () => {
		const manager = createRecorder();
		addSearchIntents(manager);

		expect(manager.documents).toEqual(
			expect.arrayContaining([
				{ language: "fr", text: "je cherche des %product%", intent: "search.product" },
				{ language: "en", text: "do you have some %product%", intent: "search.product" },
			]),
		);
		expect(SEARCH_STOP_WORDS.en).toEqual(expect.arrayContaining(["looking", "for"]));
	});

	test("la langue de la conversation se replie sur le français", () => {
		expect(resolveChatLanguage("en")).toBe("en");
		expect(resolveChatLanguage("fr")).toBe("fr");
		expect(resolveChatLanguage("de")).toBe("fr");
		expect(resolveChatLanguage(undefined)).toBe("fr");
	});

	test("un vrai NlpManager répond dans la langue demandée", async () => {
		const { NlpManager } = require("node-nlp");
		const manager = new NlpManager({
			languages: SUPPORTED_LANGUAGES,
			forceNER: true,
			nlu: { useNoneFeature: true },
			autoSave: false,
		});
		addSystemIntents(manager);
		await manager.train();

		const en = await manager.process("en", "thank you");
		expect(en.intent).toBe("thanks");
		expect(en.answer).toMatch(/welcome|pleasure/i);

		const fr = await manager.process("fr", "merci beaucoup");
		expect(fr.intent).toBe("thanks");
		expect(fr.answer).toMatch(/prie|plaisir/i);

		const hello = await manager.process("en", "hello");
		expect(hello.intent).toBe("greeting");
		expect(hello.answer).toMatch(/^Hello/);
	}, 30000);
});
