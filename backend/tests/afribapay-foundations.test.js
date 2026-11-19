// Tests des fondations AfriBaPay (Jour 75) : config, cache du token, client
// HTTP partagé (token + retry), helpers portés d'AfricaSend (téléphone,
// opérateur, parsing du corps, masquage des secrets). Les webhooks (Jour 77),
// le payinMismatch, les frais réels et la recette sandbox sont couverts à
// leurs jours respectifs.
process.env.AFRIBAPAY_API_USER = "harvests-test-user";
process.env.AFRIBAPAY_API_KEY = "harvests-test-key-1234567890";
process.env.AFRIBAPAY_MERCHANT_KEY = "mk_test_dummy_key_12345678";

jest.mock("axios");

const axios = require("axios");
const {
	AFRIBAPAY_BASE_URL,
	isAfribapayConfigured,
} = require("../config/afribapay");
const cache = require("../utils/afribapayTokenCache");
const {
	formatPhoneForAfribapay,
	parseAfribapayBody,
	redactSecrets,
} = require("../utils/afribapayUtils");
const { toAfribapayOperator } = require("../utils/afribapayOperator");
const {
	getAccessToken,
	withRetry,
	isTransientError,
	afribapayBasicAuth,
	tagIfUnavailable,
} = require("../utils/afribapayClient");

// Erreurs faciles à construire pour simuler axios
const axiosError = (status) => (status ? { response: { status } } : {});

afterAll(() => {
	delete process.env.AFRIBAPAY_API_USER;
	delete process.env.AFRIBAPAY_API_KEY;
	delete process.env.AFRIBAPAY_MERCHANT_KEY;
});

describe("config AfriBaPay (Jour 75)", () => {
	test("base URL épurée du slash final", () => {
		expect(AFRIBAPAY_BASE_URL).not.toMatch(/\/$/);
		expect(AFRIBAPAY_BASE_URL).toContain("sandbox"); // pas de live par accident
	});

	test("isAfribapayConfigured exige user, clé et merchant_key", () => {
		expect(isAfribapayConfigured()).toBe(true);
	});
});

describe("cache du token AfriBaPay", () => {
	afterEach(() => {
		jest.useRealTimers();
		cache.invalidateAfribapayToken();
	});

	test("le token stocké est renvoyé puis ne l'est plus après invalidation", () => {
		cache.invalidateAfribapayToken();
		cache.storeAfribapayToken("T1");
		expect(cache.getCachedAfribapayToken()).toBe("T1");
		cache.invalidateAfribapayToken();
		expect(cache.getCachedAfribapayToken()).toBeNull();
	});

	test("un stockage sans token est ignoré", () => {
		cache.invalidateAfribapayToken();
		cache.storeAfribapayToken("");
		expect(cache.getCachedAfribapayToken()).toBeNull();
	});

	test("plafond de 30 min et marge de 5 min avant l'expiration annoncée", () => {
		jest.useFakeTimers().setSystemTime(new Date("2026-01-01T00:00:00Z"));

		cache.storeAfribapayToken("LONG", 24 * 60 * 60); // 24 h annoncées → plafond 30 min
		jest.advanceTimersByTime(29 * 60 * 1000);
		expect(cache.getCachedAfribapayToken()).toBe("LONG");
		jest.advanceTimersByTime(2 * 60 * 1000); // 31 min
		expect(cache.getCachedAfribapayToken()).toBeNull();

		// 60 s annoncées < marge de 5 min → TTL négatif : jamais mis en cache
		cache.storeAfribapayToken("TOOSHORT", 60);
		expect(cache.getCachedAfribapayToken()).toBeNull();

		// 6 min annoncées → 6 min - marge de 5 min = 60 s réelles
		cache.storeAfribapayToken("SHORT", 360);
		jest.advanceTimersByTime(59 * 1000);
		expect(cache.getCachedAfribapayToken()).toBe("SHORT");
		jest.advanceTimersByTime(2 * 1000); // 61 s
		expect(cache.getCachedAfribapayToken()).toBeNull();
	});
});

describe("client HTTP AfriBaPay — getAccessToken", () => {
	beforeEach(() => {
		axios.post.mockReset();
		cache.invalidateAfribapayToken();
	});

	test("Basic auth + posting /token, token extrait et mis en cache", async () => {
		axios.post
			.mockResolvedValueOnce({
				data: { data: { access_token: "T1", expires_in: 3600 } },
			})
			.mockResolvedValueOnce({ data: { token: "T2" } });

		const token = await getAccessToken();
		expect(token).toBe("T1");
		expect(axios.post).toHaveBeenCalledTimes(1);
		const [url, body, config] = axios.post.mock.calls[0];
		expect(url).toBe(`${AFRIBAPAY_BASE_URL}/token`);
		expect(body).toEqual({});
		// Basic auth = base64(api_user:api_key)
		const expectedBasic = Buffer.from(
			"harvests-test-user:harvests-test-key-1234567890",
		).toString("base64");
		expect(afribapayBasicAuth()).toBe(`Basic ${expectedBasic}`);
		expect(config.headers.Authorization).toBe(`Basic ${expectedBasic}`);

		// 2e appel : servi depuis le cache, aucune requête supplémentaire
		await expect(getAccessToken()).resolves.toBe("T1");
		expect(axios.post).toHaveBeenCalledTimes(1);
	});

	test("401 vide le cache : l'appel suivant re-demande un token", async () => {
		axios.post
			.mockResolvedValueOnce({ data: { data: { access_token: "OLD" } } })
			.mockRejectedValueOnce(axiosError(401))
			.mockResolvedValueOnce({ data: { token: "NEW" } });

		// 1er appel : fetch + cache
		await expect(getAccessToken()).resolves.toBe("OLD");
		// simulation de l'expiration annoncée (le cache a un TTL court en test)
		cache.invalidateAfribapayToken();
		// 2e appel : 401 → token vidé, erreur levée, aucune valeur corrompante
		await expect(getAccessToken()).rejects.toThrow(
			"Failed to authenticate with AfriBaPay",
		);
		// 3e appel : nouveau token requis et servi
		await expect(getAccessToken()).resolves.toBe("NEW");
		expect(axios.post).toHaveBeenCalledTimes(3);
	});

	test("erreur métier 400 : PAS de retry, erreur remontée immédiatement", async () => {
		axios.post.mockRejectedValueOnce(axiosError(400));
		await expect(getAccessToken()).rejects.toThrow(
			"Failed to authenticate with AfriBaPay",
		);
		expect(axios.post).toHaveBeenCalledTimes(1);
		expect(cache.getCachedAfribapayToken()).toBeNull();
	});

	test("non configuré : message explicite, aucune requête", async () => {
		const user = process.env.AFRIBAPAY_API_USER;
		const key = process.env.AFRIBAPAY_API_KEY;
		delete process.env.AFRIBAPAY_API_USER;
		delete process.env.AFRIBAPAY_API_KEY;
		try {
			let localGet;
			jest.isolateModules(() => {
				// rechargement des modules : la config lit les env au chargement
				localGet = require("../utils/afribapayClient").getAccessToken;
			});
			await expect(localGet()).rejects.toThrow(/non configuré/);
			expect(axios.post).not.toHaveBeenCalled();
		} finally {
			process.env.AFRIBAPAY_API_USER = user;
			process.env.AFRIBAPAY_API_KEY = key;
		}
	});
});

describe("client HTTP AfriBaPay — withRetry", () => {
	test("retente les erreurs transitoires et réussit", async () => {
		const fn = jest
			.fn()
			.mockRejectedValueOnce(axiosError(503))
			.mockRejectedValueOnce(axiosError()) // pas de réponse : réseau
			.mockResolvedValueOnce("ok");

		await expect(withRetry(fn, { retries: 2, baseDelayMs: 1 })).resolves.toBe(
			"ok",
		);
		expect(fn).toHaveBeenCalledTimes(3);
	});

	test("ne retente pas une erreur métier (4xx / 500)", async () => {
		const fn = jest.fn().mockRejectedValue(axiosError(400));
		await expect(
			withRetry(fn, { retries: 2, baseDelayMs: 1 }),
		).rejects.toMatchObject({ response: { status: 400 } });
		expect(fn).toHaveBeenCalledTimes(1);
	});

	test("épuise ses retries sur une panne transitoire persistante", async () => {
		const fail = axiosError(502);
		const fn = jest.fn().mockRejectedValue(fail);
		await expect(withRetry(fn, { retries: 2, baseDelayMs: 1 })).rejects.toBe(
			fail,
		);
		expect(fn).toHaveBeenCalledTimes(3);
	});

	test("isTransientError distingue réseau / 5xx passerelle des erreurs métier", () => {
		expect(isTransientError(axiosError())).toBe(true);
		expect(isTransientError(axiosError(502))).toBe(true);
		expect(isTransientError(axiosError(503))).toBe(true);
		expect(isTransientError(axiosError(504))).toBe(true);
		expect(isTransientError(axiosError(500))).toBe(false);
		expect(isTransientError(axiosError(400))).toBe(false);
	});

	test("tagIfUnavailable marque l'erreur transitoire d'un message convivial", () => {
		const tagged = tagIfUnavailable(axiosError(503));
		expect(tagged.friendlyMessage).toMatch("indisponible");
		expect(tagIfUnavailable(axiosError(400)).friendlyMessage).toBeUndefined();
	});
});

describe("formatPhoneForAfribapay", () => {
	test("retire l'indicatif SN en + et en 00, garde le zéro local", () => {
		expect(formatPhoneForAfribapay("+221771234567", "SN")).toBe("771234567");
		expect(formatPhoneForAfribapay("00221771234567", "SN")).toBe("771234567");
		// zéro initial de la partie nationale JAMAIS coupé
		expect(formatPhoneForAfribapay("+221770123456", "SN")).toBe("770123456");
	});

	test("déjà local : rien à retirer", () => {
		expect(formatPhoneForAfribapay("77 123 45 67", "SN")).toBe("771234567");
	});

	test("pays inconnu : numéro nettoyé sans troncature", () => {
		expect(formatPhoneForAfribapay("+225 07 11 22 33", "ZZ")).toBe(
			"22507112233",
		);
	});

	test("champ vide : chaîne vide", () => {
		expect(formatPhoneForAfribapay("", "SN")).toBe("");
		expect(formatPhoneForAfribapay(null, "SN")).toBe("");
	});
});

describe("toAfribapayOperator", () => {
	test("les noms affichés sont ramenés au code attendu par l'API", () => {
		expect(toAfribapayOperator("Orange Money")).toBe("orange");
		expect(toAfribapayOperator("Wave")).toBe("wave");
		expect(toAfribapayOperator("M-Pesa")).toBe("mpesa");
		expect(toAfribapayOperator("Free Money")).toBe("free");
		expect(toAfribapayOperator("Afri Money")).toBe("afrimoney");
		expect(toAfribapayOperator("Carte bancaire")).toBe("card");
	});

	test("emoney/tmoney ne prennent le dessus qu'en début de nom", () => {
		expect(toAfribapayOperator("E-money")).toBe("emoney");
		expect(toAfribapayOperator("TMoney Togo")).toBe("tmoney");
		// garde-fou d'AfricaSend : "orangemoney"/"freemoney" contiennent "emoney"
		// et ne doivent PAS partir comme E-money
		expect(toAfribapayOperator("Orange Money CI")).toBe("orange");
		expect(toAfribapayOperator("Free Money SN")).toBe("free");
	});

	test("opérateur inconnu : premier mot en minuscules", () => {
		expect(toAfribapayOperator("Foo Bar")).toBe("foo");
		expect(toAfribapayOperator("")).toBe("");
		expect(toAfribapayOperator(undefined)).toBe("");
	});
});

describe("parseAfribapayBody", () => {
	test("objet : renvoyé tel quel", () => {
		const obj = { data: { status: "SUCCESS" } };
		expect(parseAfribapayBody(obj)).toBe(obj);
	});

	test("JSON pur en string : parsé", () => {
		expect(parseAfribapayBody('{"status":"SUCCESS"}')).toEqual({
			status: "SUCCESS",
		});
	});

	test("préambule de debug PHP suivi du JSON : parsé quand même", () => {
		const dumped =
			'Array ( [operator] => wave )\n{"success":true,"data":{"status":"SUCCESS"}}';
		expect(parseAfribapayBody(dumped)).toEqual({
			success: true,
			data: { status: "SUCCESS" },
		});
	});

	test("texte sans JSON exploitable ou non-string : null", () => {
		expect(parseAfribapayBody("Scarabée 42")).toBeNull();
		expect(parseAfribapayBody(42)).toBeNull();
		expect(parseAfribapayBody(null)).toBeNull();
	});
});

describe("redactSecrets", () => {
	test("masque la merchant_key en JSON, en dump PHP et le secret d'URL", () => {
		const json = JSON.stringify({ merchant_key: "mk_test_dummy_key_12345678" });
		expect(redactSecrets(json)).not.toContain("mk_test_dummy_key_12345678");
		expect(redactSecrets(json)).toContain("***");

		expect(
			redactSecrets("[merchant_key] => mk_test_dummy_key_12345678"),
		).toContain("***");
		expect(redactSecrets("https://api/return?secret=hunter2&ok=1")).not.toContain(
			"hunter2",
		);
	});

	test("formats de clé marchand inconnus : catch-all mk_live_***", () => {
		expect(redactSecrets("mk_live_abcdef123456")).toBe("mk_live_***");
	});

	test("la valeur exacte des secrets configurés est masquée quel que soit le format", () => {
		expect(
			redactSecrets('{"api_key":"harvests-test-key-1234567890"}'),
		).not.toContain("harvests-test-key-1234567890");
	});
});
