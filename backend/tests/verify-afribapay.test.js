// Tests du script de vérification sandbox AfriBaPay (Jour 86).
// Aucun réseau, aucune base : axios est simulé, et le script n'ouvre jamais
// mongoose.connect (les tests ne touchent pas l'Atlas de production).
jest.mock("axios");

const axios = require("axios");
const script = require("../scripts/verify-afribapay");

const SANDBOX = {
	apiUser: "user_sandbox",
	apiKey: "pk_s_test_key_123",
	merchantKey: "mk_s_test_merchant_123",
};
const SANDBOX_URL = "https://api-sandbox.afribapay.com/v1";

afterEach(() => {
	jest.clearAllMocks();
	delete process.env.AFRIBAPAY_MERCHANT_KEY;
});

describe("A — script de vérification sandbox (Jour 86)", () => {
	test("A1 expose les fonctions pures attendues", () => {
		for (const fn of [
			"isSandboxCredentials",
			"assertSandboxSafe",
			"buildVerifyOrderId",
			"redactLog",
			"runVerification",
		]) {
			expect(typeof script[fn]).toBe("function");
		}
	});

	test("A2 dry-run par défaut : zéro appel réseau, zéro base", async () => {
		const result = await script.runVerification({ credentials: SANDBOX, baseUrl: SANDBOX_URL });
		expect(result.mode).toBe("dry-run");
		expect(axios.get).not.toHaveBeenCalled();
		expect(axios.post).not.toHaveBeenCalled();
	});

	test("A3 clés live refusées", async () => {
		const live = { ...SANDBOX, apiKey: "pk_live_abc123" };
		expect(script.isSandboxCredentials(live)).toBe(false);
		expect(() =>
			script.assertSandboxSafe({ credentials: live, baseUrl: SANDBOX_URL }),
		).toThrow(/live/i);
		await expect(
			script.runVerification({ live: true, credentials: live, baseUrl: SANDBOX_URL }),
		).rejects.toThrow(/live/i);
	});

	test("A4 URL de production refusée", () => {
		expect(() =>
			script.assertSandboxSafe({
				credentials: SANDBOX,
				baseUrl: "https://api.afribapay.com/v1",
			}),
		).toThrow(/sandbox/i);
	});

	test("A5 --live avec sandbox valide appelle /token une seule fois", async () => {
		axios.post.mockResolvedValue({ data: { access_token: "T" } });
		const result = await script.runVerification({
			live: true,
			credentials: SANDBOX,
			baseUrl: SANDBOX_URL,
		});
		expect(result.mode).toBe("live");
		expect(result.tokenOk).toBe(true);
		expect(axios.post).toHaveBeenCalledTimes(1);
		expect(axios.post.mock.calls[0][0]).toContain("/token");
	});

	test("A6 order_id unique par lancement", () => {
		const a = script.buildVerifyOrderId("verify", 1700000000000);
		const b = script.buildVerifyOrderId("verify", 1700000000000);
		expect(a).not.toBe(b);
		expect(a).toMatch(/^verify-1700000000000-/);
	});

	test("A7 les secrets ne fuient pas dans les logs", () => {
		process.env.AFRIBAPAY_MERCHANT_KEY = "mk_s_supersecret123";
		const log = script.redactLog({
			url: "https://x/?secret=abc123456",
			merchant_key: "mk_s_supersecret123",
		});
		expect(log).not.toContain("abc123456");
		expect(log).not.toContain("mk_s_supersecret123");
	});
});
