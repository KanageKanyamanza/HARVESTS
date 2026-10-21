const {
	detectLanguage,
	normalizeLocale,
	localeFromAcceptLanguage,
	languageCookieOptions,
	LANGUAGE_COOKIE,
} = require("../config/i18n");

const run = ({ query = {}, cookies = {}, headers = {} } = {}) => {
	const req = { query, cookies, headers };
	const res = {
		locals: {},
		setCookies: [],
		cookie(name, value, options) {
			res.setCookies.push({ name, value, options });
			return res;
		},
	};

	detectLanguage(req, res, () => {});

	return { req, res };
};

const withEnv = (nodeEnv, callback) => {
	const previous = process.env.NODE_ENV;
	process.env.NODE_ENV = nodeEnv;
	try {
		return callback();
	} finally {
		process.env.NODE_ENV = previous;
	}
};

describe("détection de la langue (Jour 63)", () => {
	test("le cookie harvests_lang prime sur la langue du navigateur", () => {
		const { req } = run({
			cookies: { [LANGUAGE_COOKIE]: "en" },
			headers: { "accept-language": "fr-FR,fr;q=0.9" },
		});

		expect(req.language).toBe("en");
		expect(req.locale).toBe("en");
	});

	test("le cookie est lu même sans en-tête Accept-Language", () => {
		const { req } = run({ cookies: { [LANGUAGE_COOKIE]: "en" } });

		expect(req.language).toBe("en");
	});

	test("un cookie en majuscules ou régionalisé est normalisé", () => {
		expect(run({ cookies: { [LANGUAGE_COOKIE]: "EN" } }).req.language).toBe("en");
		expect(run({ cookies: { [LANGUAGE_COOKIE]: "en-US" } }).req.language).toBe("en");
		expect(run({ cookies: { [LANGUAGE_COOKIE]: " fr " } }).req.language).toBe("fr");
	});

	test("un cookie hors des langues gérées est ignoré", () => {
		const { req } = run({
			cookies: { [LANGUAGE_COOKIE]: "de" },
			headers: { "accept-language": "en-US,en;q=0.9" },
		});

		expect(req.language).toBe("en");
	});

	test("le paramètre ?lang= prime sur le cookie et est mémorisé", () => {
		const { req, res } = run({
			query: { lang: "en" },
			cookies: { [LANGUAGE_COOKIE]: "fr" },
		});

		expect(req.language).toBe("en");
		expect(res.setCookies).toHaveLength(1);
		expect(res.setCookies[0]).toMatchObject({
			name: LANGUAGE_COOKIE,
			value: "en",
		});
		expect(res.setCookies[0].options.httpOnly).toBe(true);
		expect(res.setCookies[0].options.path).toBe("/");
	});

	test("le cookie n'est pas réécrit quand il contient déjà la langue demandée", () => {
		const { res } = run({
			query: { lang: "en" },
			cookies: { [LANGUAGE_COOKIE]: "en" },
		});

		expect(res.setCookies).toHaveLength(0);
	});

	test("la langue du navigateur n'est jamais mémorisée dans le cookie", () => {
		const { req, res } = run({ headers: { "accept-language": "en-US,en;q=0.9" } });

		expect(req.language).toBe("en");
		expect(res.setCookies).toHaveLength(0);
	});

	test("le header X-Language prime sur le cookie et est mémorisé", () => {
		const { req, res } = run({
			headers: { "x-language": "en" },
			cookies: { [LANGUAGE_COOKIE]: "fr" },
		});

		expect(req.language).toBe("en");
		expect(res.setCookies[0]).toMatchObject({
			name: LANGUAGE_COOKIE,
			value: "en",
		});
	});

	test("Accept-Language respecte les poids de qualité", () => {
		expect(
			localeFromAcceptLanguage("de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7")
		).toBe("en");
		expect(localeFromAcceptLanguage("fr-FR,fr;q=0.9,en;q=0.8")).toBe("fr");
		expect(localeFromAcceptLanguage("de-DE,de;q=0.9")).toBeNull();
		expect(localeFromAcceptLanguage("")).toBeNull();
		expect(localeFromAcceptLanguage(undefined)).toBeNull();
	});

	test("le français est la langue par défaut", () => {
		expect(run({}).req.language).toBe("fr");
		expect(run({ headers: { "accept-language": "de-DE,de;q=0.9" } }).req.language).toBe(
			"fr"
		);
	});

	test("normalizeLocale refuse les langues non gérées", () => {
		expect(normalizeLocale("en")).toBe("en");
		expect(normalizeLocale("EN-GB")).toBe("en");
		expect(normalizeLocale("de")).toBeNull();
		expect(normalizeLocale(undefined)).toBeNull();
		expect(normalizeLocale(42)).toBeNull();
	});

	test("en production le cookie traverse les sites (SameSite=None; Secure)", () => {
		const options = withEnv("production", languageCookieOptions);

		expect(options.sameSite).toBe("none");
		expect(options.secure).toBe(true);
	});

	test("en développement le cookie reste Lax (localhost est le même site)", () => {
		const options = withEnv("development", languageCookieOptions);

		expect(options.sameSite).toBe("lax");
		expect(options.secure).toBe(false);
	});
});
