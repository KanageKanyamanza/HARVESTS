const { translateText } = require("../utils/translateText");
const glossary = require("../data/translationGlossary.json");

/**
 * Jour 70 (bascule bilingue) - le glossaire de repli (backend/data/
 * translationGlossary.json) doit couvrir les deux sens. Avant ce jour, le sens
 * en -> fr était vide : un vendeur qui saisissait « Okra » ou « Jute mallow »
 * partait à la traduction automatique sans filet.
 *
 * Les tests ci-dessous passent par translateText() sans connexion MongoDB :
 * utils/translationGlossary.js bascule alors sur le fichier JSON, et les
 * correspondances exactes court-circuitent l'appel réseau (aucun test ne
 * dépend de MyMemory/LibreTranslate).
 */

describe("glossaire de traduction (Jour 70)", () => {
	test("traduit les produits locaux du français vers l'anglais", async () => {
		expect(await translateText("Gombo", "fr", "en")).toEqual({
			translatedText: "Okra",
			ok: true,
			provider: "glossary",
		});
		expect(await translateText("Niébé", "fr", "en")).toEqual({
			translatedText: "Cowpea",
			ok: true,
			provider: "glossary",
		});
		expect(await translateText("Corète potagère", "fr", "en")).toEqual({
			translatedText: "Jute Mallow",
			ok: true,
			provider: "glossary",
		});
	});

	test("traduit les produits locaux de l'anglais vers le français", async () => {
		expect(await translateText("Okra", "en", "fr")).toEqual({
			translatedText: "Gombo",
			ok: true,
			provider: "glossary",
		});
		expect(await translateText("Cowpea", "en", "fr")).toEqual({
			translatedText: "Niébé",
			ok: true,
			provider: "glossary",
		});
		expect(await translateText("Jute mallow", "en", "fr")).toEqual({
			translatedText: "Corète potagère",
			ok: true,
			provider: "glossary",
		});
	});

	test("rattrape « Gumbo » produit par la traduction automatique", () => {
		// La règle s'applique après l'appel MT : quand le service rend « Gumbo »
		// pour « gombo », `\bgombo\b` ne matche plus, d'où cette seconde règle.
		expect(glossary.wordReplacements["fr-en"]).toContainEqual({
			match: "\\bgumbo\\b",
			replace: "okra",
			flags: "gi",
		});
	});

	test("les deux sens sont semés et sans doublon", () => {
		for (const direction of ["fr-en", "en-fr"]) {
			const exact = Object.entries(glossary.exactTerms[direction] || {});
			const replacements = glossary.wordReplacements[direction] || [];

			// Le sens en -> fr était vide avant le Jour 70.
			expect(exact.length).toBeGreaterThan(0);
			expect(replacements.length).toBeGreaterThan(0);

			// Miroir de l'index unique { direction, type, source } du modèle.
			const sources = [
				...exact.map(([source]) => `exact:${source.trim().toLowerCase()}`),
				...replacements.map((rule) => `replacement:${rule.match}`),
			];
			expect(new Set(sources).size).toBe(sources.length);
		}
	});

	test("tous les motifs de remplacement sont des regex valides", () => {
		for (const direction of ["fr-en", "en-fr"]) {
			for (const rule of glossary.wordReplacements[direction] || []) {
				expect(() => new RegExp(rule.match, rule.flags || "gi")).not.toThrow();
			}
		}
	});
});
