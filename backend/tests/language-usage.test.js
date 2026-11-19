const {
	normalizeSwitchInput,
	MAX_VALUE_LENGTHS,
} = require("../controllers/languageUsageController");
const {
	buildLanguageUsageOverview,
} = require("../controllers/admin/adminAnalyticsController");
const { LANGUAGE_COOKIE } = require("../config/i18n");

// Le suivi de bascule ne touche pas au cookie de langue : garde-fou
// documentaire, pour que rien ne supprime ce commentaire d'intention.
describe("suivi des bascules fr/en (Jour 73)", () => {
	test("LANGUAGE_COOKIE n'a pas changé (ne pas interférer avec le suivi)", () => {
		expect(LANGUAGE_COOKIE).toBe("harvests_lang");
	});

	describe("normalizeSwitchInput", () => {
		test("une bascule valide est normalisée", () => {
			const { data, error } = normalizeSwitchInput({
				from: "fr",
				to: "en",
				context: "header",
				path: " /products ",
				visitor: "abc-123",
			});

			expect(error).toBeUndefined();
			expect(data).toEqual({
				from: "fr",
				to: "en",
				context: "header",
				path: "/products",
				visitorId: "abc-123",
			});
		});

		test("des langues hors des locales gérées sont refusées (et « EN » normalisées)", () => {
			// « EN », « en-US », « fr » sont normalisés vers les locales gérées…
			expect(normalizeSwitchInput({ from: "EN-US", to: "fr", visitor: "v" }).error).toBeUndefined();
			// …mais « de » n'est pas géré et est refusé, comme des paramètres vides.
			expect(normalizeSwitchInput({ from: "de", to: "fr", visitor: "v" }).error).toBeDefined();
			expect(normalizeSwitchInput({ from: "", to: "", visitor: "v" }).error).toBeDefined();
			expect(normalizeSwitchInput({}).error).toBeDefined();
		});

		test("from === to n'est pas une bascule : refusé, pas d'écriture", () => {
			expect(normalizeSwitchInput({ from: "fr", to: "fr", visitor: "v" }).error).toBeDefined();
			expect(normalizeSwitchInput({ from: "en", to: "en", visitor: "v" }).error).toBeDefined();
		});

		test("sans identifiant de visiteur, rien n'est enregistré", () => {
			expect(normalizeSwitchInput({ from: "fr", to: "en" }).error).toBeDefined();
			expect(normalizeSwitchInput({ from: "fr", to: "en", visitor: "   " }).error).toBeDefined();
			expect(normalizeSwitchInput({ from: "fr", to: "en", visitor: 42 }).error).toBeDefined();
		});

		test("contexte absent devient 'unknown', valeurs trop longues tronquées sans erreur", () => {
			const { data } = normalizeSwitchInput({
				from: "en",
				to: "fr",
				visitor: "v",
			});

			expect(data.context).toBe("unknown");

			const longText = "a".repeat(MAX_VALUE_LENGTHS.path + 10);
			const truncated = normalizeSwitchInput({
				from: "fr",
				to: "en",
				visitor: "v".repeat(MAX_VALUE_LENGTHS.visitorId + 10),
				context: "c".repeat(MAX_VALUE_LENGTHS.context + 10),
				path: longText,
			});

			expect(truncated.error).toBeUndefined();
			expect(truncated.data.visitorId).toHaveLength(MAX_VALUE_LENGTHS.visitorId);
			expect(truncated.data.context).toHaveLength(MAX_VALUE_LENGTHS.context);
			expect(truncated.data.path).toHaveLength(MAX_VALUE_LENGTHS.path);
		});
	});

	describe("buildLanguageUsageOverview (taux d'usage de la bascule anglais)", () => {
		test("part d'anglais parmi les bascules, retours au français", () => {
			expect(
				buildLanguageUsageOverview({ total: 10, toEnglish: 3, distinctVisitorCount: 7 })
			).toEqual({
				total: 10,
				toEnglish: 3,
				toFrench: 7,
				englishShare: 30,
				distinctVisitors: 7,
			});
		});

		test("une seule bascule vers l'anglais donne 100 % d'usage", () => {
			const overview = buildLanguageUsageOverview({
				total: 1,
				toEnglish: 1,
				distinctVisitorCount: 1,
			});
			expect(overview.englishShare).toBe(100);
			expect(overview.toFrench).toBe(0);
		});

		test("aucune bascule enregistrée : 0 partout, sans division par zéro", () => {
			expect(buildLanguageUsageOverview({})).toEqual({
				total: 0,
				toEnglish: 0,
				toFrench: 0,
				englishShare: 0,
				distinctVisitors: 0,
			});
		});

		test("part arrondie à un décimal (33,3 %)", () => {
			const overview = buildLanguageUsageOverview({
				total: 3,
				toEnglish: 1,
				distinctVisitorCount: 2,
			});
			expect(overview.englishShare).toBe(33.3);
		});
	});
});
