/**
 * Jour 66 — traduction automatique des FAQs vers l'anglais.
 * Le service de traduction est simulé : aucun appel réseau dans les tests.
 */
jest.mock("../utils/translateText", () => ({ translateText: jest.fn() }));

const { translateText } = require("../utils/translateText");
const {
	translateFaqFields,
	fillEnglishFields,
} = require("../utils/faqTranslations");

beforeEach(() => {
	translateText.mockImplementation(async (text) => ({
		translatedText: `EN:${text}`,
		ok: true,
	}));
});

describe("traduction des champs de FAQ (Jour 66)", () => {
	test("traduit question, réponse et mots-clés, sans doublon", async () => {
		const result = await translateFaqFields({
			question: "Quels sont les délais ?",
			answer: "Dakar : 24-48h.",
			keywords: ["délai", "délai", "temps"],
		});

		expect(result.questionEn).toBe("EN:Quels sont les délais ?");
		expect(result.answerEn).toBe("EN:Dakar : 24-48h.");
		expect(result.keywordsEn).toEqual(["EN:délai", "EN:temps"]);
	});

	test("un échec du service ne lève pas et laisse les champs vides", async () => {
		translateText.mockResolvedValue({ translatedText: "texte", ok: false });

		await expect(
			translateFaqFields({ question: "Question", answer: "Réponse" }),
		).resolves.toEqual({ questionEn: "", answerEn: "", keywordsEn: [] });
	});

	test("une exception du service est absorbée", async () => {
		translateText.mockRejectedValue(new Error("réseau indisponible"));

		const result = await translateFaqFields({ question: "Question" });

		expect(result.questionEn).toBe("");
	});

	test("remplit uniquement les champs anglais manquants", async () => {
		const faq = {
			question: "Question",
			answer: "Réponse",
			keywords: ["mot"],
			questionEn: "Already translated",
			answerEn: "",
			keywordsEn: [],
		};

		await expect(fillEnglishFields(faq)).resolves.toBe(true);

		expect(faq.questionEn).toBe("Already translated");
		expect(faq.answerEn).toBe("EN:Réponse");
		expect(faq.keywordsEn).toEqual(["EN:mot"]);
	});

	test("ne fait rien quand la FAQ est déjà complète", async () => {
		const faq = {
			question: "Question",
			answer: "Réponse",
			keywords: ["mot"],
			questionEn: "Question",
			answerEn: "Answer",
			keywordsEn: ["word"],
		};

		await expect(fillEnglishFields(faq)).resolves.toBe(false);
		expect(translateText).not.toHaveBeenCalled();
	});
});
