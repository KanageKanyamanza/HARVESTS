// Exécution du payout (Jour 81) : préparation du document, envoi AfriBaPay,
// statuts (succès, refus opérateur, ambigu, incident réseau) et idempotence.
// Aucune connexion Mongo : documents non persistés, axios mocké, dépendances
// (verrou, envoi, solde) injectées pour ne toucher ni la base ni le réseau.
process.env.AFRIBAPAY_API_USER = process.env.AFRIBAPAY_API_USER || "harvests-test-user";
process.env.AFRIBAPAY_API_KEY = process.env.AFRIBAPAY_API_KEY || "harvests-test-key-1234567890";
process.env.AFRIBAPAY_MERCHANT_KEY = process.env.AFRIBAPAY_MERCHANT_KEY || "mk_test_dummy_key_12345678";

jest.mock("axios");

const mongoose = require("mongoose");
const axios = require("axios");
const Payout = require("../models/Payout");
const {
	computePayoutLine,
	buildPayoutDoc,
	isOrderPayableNow,
	convertXofToXaf,
	buildPayoutPayload,
	fetchPayoutBalance,
	claimPayout,
	sendPayout,
	executePayout,
	mapPayoutProcessorStatus,
	PayoutError,
} = require("../services/payment/paymentPayoutService");
const { AFRIBAPAY_PAYOUT_URL } = require("../config/afribapay");
const { payoutOrderIdFor } = require("../utils/payoutOrderId");

const oid = () => new mongoose.Types.ObjectId();
const MERCHANT_KEY = process.env.AFRIBAPAY_MERCHANT_KEY;

// Paiement en 1 ligne : 10 000 XOF, commission 7,5 %, net 9 250.
const payableEntry = (overrides = {}) => ({
	seller: oid(),
	sellerType: "producer",
	sellerUserType: "producer",
	country: "SN",
	currency: "XOF",
	operator: "wave",
	phone: "771234567",
	commissionRate: 0.075,
	lines: [
		{
			order: oid(),
			orderNumber: "HV-0001",
			gross: 10000,
			commission: 750,
			net: 9250,
			settledBy: "mobile_money",
		},
	],
	grossAmount: 10000,
	commissionAmount: 750,
	amount: 9250,
	...overrides,
});

const validPayoutDoc = (overrides = {}) => ({
	seller: oid(),
	sellerType: "producer",
	sellerUserType: "producer",
	lines: [
		{
			order: oid(),
			orderNumber: "HV-0001",
			gross: 10000,
			commission: 750,
			net: 9250,
			settledBy: "mobile_money",
		},
	],
	currency: "XOF",
	commissionRate: 0.075,
	grossAmount: 10000,
	commissionAmount: 750,
	amount: 9250,
	country: "SN",
	operator: "wave",
	phone: "771234567",
	fx: { rate: 1, sourceCurrency: "XOF", targetCurrency: "XOF" },
	...overrides,
});

const errorsOf = (data) => {
	const err = new Payout(data).validateSync();
	return err ? err.errors : null;
};

// Payout en état d'envoi (objet simple : executePayout mute l'objet fourni).
const makePayout = (overrides = {}) => ({
	_id: oid(),
	seller: oid(),
	sellerType: "producer",
	sellerUserType: "producer",
	lines: [{ order: oid(), orderNumber: "HV-0001", gross: 10000, commission: 750, net: 9250 }],
	currency: "XOF",
	commissionRate: 0.075,
	grossAmount: 10000,
	commissionAmount: 750,
	amount: 9250,
	country: "SN",
	operator: "wave",
	phone: "771234567",
	status: "pending",
	attempts: [],
	afribapay: {},
	...overrides,
});

// Dépendances par défaut des tests d'orchestration : solde suffisant, verrou
// toujours gagné, envoi remplacé.
const deps = (sendResult) => ({
	token: "T",
	fetchBalance: jest.fn().mockResolvedValue({ available: 1_000_000, currency: "XOF" }),
	claimLock: jest.fn().mockImplementation(async (id) => makePayout({ _id: id })),
	sendAttempt: jest.fn().mockResolvedValue(sendResult),
});

const sent = (overrides = {}) => ({
	orderId: `payout-${"x"}`,
	status: "succeeded",
	processorStatus: "SUCCESS",
	transactionId: "TX9",
	error: null,
	sentAt: new Date(),
	...overrides,
});

afterEach(() => {
	axios.post.mockReset();
	axios.get.mockReset();
	jest.restoreAllMocks();
});

describe("Jour 81 — préparation du Payout", () => {
	describe("PRE — document et validation", () => {
		test("PRE-1 buildPayoutDoc → Payout valide, pending, fx présent, totaux cohérents", () => {
			const doc = buildPayoutDoc(payableEntry());
			expect(doc.status).toBe("pending");
			expect(doc.fx).toBeDefined();
			expect(new Payout(doc).validateSync()).toBeUndefined();
			const payout = new Payout(doc);
			expect(payout.amount).toBe(payout.lines.reduce((s, l) => s + l.net, 0));
		});

		test("PRE-1bis buildPayoutDoc ajoute un fx par défaut cohérent avec la devise", () => {
			const doc = buildPayoutDoc(payableEntry({ currency: "XAF", country: "CM", operator: "mtn" }));
			expect(doc.fx).toEqual({ rate: 1, sourceCurrency: "XAF", targetCurrency: "XAF" });
			expect(new Payout(doc).validateSync()).toBeUndefined();
		});

		test.each([0, -1])("PRE-2 fx.rate %p → validation refusée", (rate) => {
			const errors = errorsOf(
				validPayoutDoc({ fx: { rate, sourceCurrency: "XOF", targetCurrency: "XAF" } }),
			);
			expect(errors?.["fx.rate"]).toBeDefined();
		});

		test("PRE-3 même devise de part et d'autre : taux 1 exigé", () => {
			const errors = errorsOf(
				validPayoutDoc({ fx: { rate: 1.5, sourceCurrency: "XOF", targetCurrency: "XOF" } }),
			);
			expect(errors).not.toBeNull();
		});

		test("PRE-4 amount ≠ Σ net → erreur (non-régression)", () => {
			const errors = errorsOf(validPayoutDoc({ amount: 9000 }));
			expect(errors).not.toBeNull();
			expect(Object.keys(errors).some((k) => k === "amount" || k.startsWith("lines"))).toBe(true);
		});

		test("PRE-5 commission 7,5 % par ligne et par défaut", () => {
			expect(computePayoutLine({ gross: 10000, rate: 0.075 })).toEqual({
				gross: 10000,
				commission: 750,
				net: 9250,
			});
			expect(convertXofToXaf(10000, 1)).toBe(10000);
			expect(isOrderPayableNow({ deliveredAt: new Date(0), status: "delivered" }, { now: Date.now() }).payable).toBe(
				true,
			);
		});
	});

	describe("SND — envoi vers AfriBaPay", () => {
		test("SND-1 payload : 9 clés exactement, order_id du 1er essai", () => {
			const payout = makePayout();
			const payload = buildPayoutPayload(payout, { attempt: 1 });
			expect(Object.keys(payload).sort()).toEqual(
				[
					"merchant_key",
					"operator",
					"country",
					"phone_number",
					"amount",
					"currency",
					"order_id",
					"notify_url",
					"lang",
				].sort(),
			);
			expect(payload.merchant_key).toBe(MERCHANT_KEY);
			expect(payload.order_id).toBe(`payout-${payout._id}`);
			expect(payload.amount).toBe(9250);
			expect(payload.currency).toBe("XOF");
			expect(payload.lang).toBe("fr");
		});

		test("SND-9 notify_url : backend public + chemin du webhook payout", () => {
			const payload = buildPayoutPayload(makePayout(), { attempt: 1 });
			expect(payload.notify_url).toContain("/api/v1/payouts/afribapay/webhook");
			expect(payload.notify_url.startsWith("http")).toBe(true);
		});

		test("SND-2 retry réseau : même order_id rejoué puis succès", async () => {
			axios.post
				.mockRejectedValueOnce({ code: "ECONNRESET" })
				.mockResolvedValueOnce({ data: { status: "SUCCESS", transaction_id: "AP_TX_1" } });

			const payout = makePayout();
			const result = await sendPayout(payout, { token: "T", attempt: 1 });

			expect(result.status).toBe("succeeded");
			expect(result.transactionId).toBe("AP_TX_1");
			expect(result.sentAt).toBeInstanceOf(Date);
			expect(axios.post).toHaveBeenCalledTimes(2);
			const orderIds = axios.post.mock.calls.map(([, body]) => body.order_id);
			expect(orderIds[0]).toBe(`payout-${payout._id}`);
			expect(orderIds[1]).toBe(orderIds[0]);
			expect(axios.post.mock.calls[0][0]).toBe(AFRIBAPAY_PAYOUT_URL);
		});

		test.each([
			["FAILED", "failed"],
			["REJECTED", "failed"],
			["EXPIRED", "failed"],
			["CANCELLED", "failed"],
			["SUCCESS", "succeeded"],
			["SUCCESS", "succeeded"],
		])("SND-10 statut brut %s → %s", async (raw, expected) => {
			expect(mapPayoutProcessorStatus(raw)).toBe(expected);
		});

		test("SND-11 statut inconnu ou illisible → ambiguous", () => {
			expect(mapPayoutProcessorStatus("PENDING")).toBe("ambiguous");
			expect(mapPayoutProcessorStatus("")).toBe("ambiguous");
			expect(mapPayoutProcessorStatus(null)).toBe("ambiguous");
		});
	});

	describe("SND — refus opérateur et incident réseau", () => {
		test("SND-4 refus opérateur : failed définitif, aucune relance auto", async () => {
			axios.post.mockResolvedValue({ data: { status: "FAILED" } });
			const payout = makePayout();
			const result = await sendPayout(payout, { token: "T", attempt: 1 });
			expect(result.status).toBe("failed");
			expect(result.processorStatus).toBe("FAILED");
		});

		test("SND-5 réponse illisible (dump PHP sans JSON) → ambiguous", async () => {
			axios.post.mockResolvedValue({ data: "Array ( [operator] => wave )" });
			const result = await sendPayout(makePayout(), { token: "T", attempt: 1 });
			expect(result.status).toBe("ambiguous");
		});

		test("SND-6 pas de réponse réseau → PayoutError payout_network_issue", async () => {
			axios.post.mockRejectedValue({ code: "ECONNRESET" });
			await expect(sendPayout(makePayout(), { token: "T", attempt: 1 })).rejects.toMatchObject({
				code: "payout_network_issue",
			});
		});

		test("SND-7 refus HTTP 400 lisible → ambiguous (pas network_issue)", async () => {
			axios.post.mockRejectedValue({
				response: { status: 400, data: { error: { message: "Invalid phone number" } } },
			});
			const result = await sendPayout(makePayout(), { token: "T", attempt: 1 });
			expect(result.status).toBe("ambiguous");
			expect(result.error).toContain("Invalid phone number");
		});

		test("SND-8 AfriBaPay non configuré → aucune requête", async () => {
			const saved = {
				user: process.env.AFRIBAPAY_API_USER,
				key: process.env.AFRIBAPAY_API_KEY,
				merchant: process.env.AFRIBAPAY_MERCHANT_KEY,
			};
			jest.resetModules();
			delete process.env.AFRIBAPAY_API_USER;
			delete process.env.AFRIBAPAY_API_KEY;
			delete process.env.AFRIBAPAY_MERCHANT_KEY;
			try {
				let service;
				jest.isolateModules(() => {
					service = require("../services/payment/paymentPayoutService");
				});
				const sendAttempt = jest.fn();
				await expect(
					service.executePayout(makePayout(), {
						token: "T",
						fetchBalance: jest.fn(),
						claimLock: jest.fn(),
						sendAttempt,
					}),
				).rejects.toMatchObject({ code: "afribapay_not_configured" });
				expect(sendAttempt).not.toHaveBeenCalled();
				expect(axios.post).not.toHaveBeenCalled();
			} finally {
				process.env.AFRIBAPAY_API_USER = saved.user;
				process.env.AFRIBAPAY_API_KEY = saved.key;
				process.env.AFRIBAPAY_MERCHANT_KEY = saved.merchant;
				jest.resetModules();
			}
		});
	});

	describe("STS — exécution, statuts et idempotence", () => {
		test("STS-1 Payout déjà succeeded : aucun envoi", async () => {
			const payout = makePayout({ status: "succeeded" });
			const d = deps();
			await expect(executePayout(payout, d)).rejects.toMatchObject({ code: "payout_terminal" });
			expect(d.sendAttempt).not.toHaveBeenCalled();
			expect(d.claimLock).not.toHaveBeenCalled();
		});

		test("STS-2 Payout failed (refus opérateur) : pas de relance automatique", async () => {
			const payout = makePayout({ status: "failed" });
			await expect(executePayout(payout, deps())).rejects.toMatchObject({ code: "payout_terminal" });
		});

		test("STS-3 Payout network_issue : relance avec un nouvel order_id (-r2)", async () => {
			const payout = makePayout({
				status: "network_issue",
				attempts: [{ attempt: 1, orderId: `payout-x-r1`, status: "network_issue" }],
			});
			const d = deps(sent({ orderId: `payout-${payout._id}-r2` }));
			const result = await executePayout(payout, d);
			expect(result.outcome).toBe("succeeded");
			expect(payout.attempts).toHaveLength(2);
			expect(payout.attempts[1].attempt).toBe(2);
			expect(payout.attempts[1].orderId).toBe(`payout-${payout._id}-r2`);
		});

		test("STS-4 succès : statut, succeededAt, tentative et afribapay renseignés", async () => {
			const payout = makePayout();
			const d = deps(sent({ orderId: `payout-${payout._id}`, transactionId: "TX9" }));
			const result = await executePayout(payout, d);

			expect(result.outcome).toBe("succeeded");
			expect(result.alert).toBe(false);
			expect(payout.status).toBe("succeeded");
			expect(payout.succeededAt).toBeInstanceOf(Date);
			expect(payout.attempts).toHaveLength(1);
			expect(payout.attempts[0]).toMatchObject({
				attempt: 1,
				orderId: `payout-${payout._id}`,
				status: "succeeded",
				processorStatus: "SUCCESS",
				transactionId: "TX9",
				error: null,
			});
			expect(payout.attempts[0].sentAt).toBeInstanceOf(Date);
			expect(payout.afribapay.transactionId).toBe("TX9");
			expect(payout.afribapay.payoutOrderId).toBe(`payout-${payout._id}`);
		});

		test("STS-5 refus opérateur exécuté : failed + failedAt + failureReason", async () => {
			const payout = makePayout();
			const d = deps(sent({ status: "failed", processorStatus: "FAILED", error: "operator rejected" }));
			const result = await executePayout(payout, d);

			expect(result.outcome).toBe("failed");
			expect(payout.status).toBe("failed");
			expect(payout.failedAt).toBeInstanceOf(Date);
			expect(payout.failureReason).toBe("operator rejected");

			const second = deps();
			await expect(executePayout(payout, second)).rejects.toMatchObject({ code: "payout_terminal" });
			expect(second.sendAttempt).not.toHaveBeenCalled();
		});

		test("STS-6 réponse ambiguë : statut ambiguous + alerte admin, pas de relance auto", async () => {
			const payout = makePayout();
			const d = deps(sent({ status: "ambiguous", processorStatus: null, transactionId: null, error: null }));
			const result = await executePayout(payout, d);

			expect(result.outcome).toBe("ambiguous");
			expect(result.alert).toBe(true);
			expect(payout.status).toBe("ambiguous");
			expect(payout.attempts[0].status).toBe("ambiguous");
			await expect(executePayout(payout, deps())).rejects.toMatchObject({ code: "payout_terminal" });
		});

		test("STS-7 incident réseau à l'exécution : network_issue, tentative tracée, relance possible", async () => {
			const payout = makePayout();
			const d = deps();
			d.sendAttempt.mockRejectedValue(
				Object.assign(new Error("network down"), { code: "payout_network_issue" }),
			);
			const result = await executePayout(payout, d);

			expect(result.outcome).toBe("network_issue");
			expect(payout.status).toBe("network_issue");
			expect(payout.attempts[0].status).toBe("network_issue");
			expect(payout.attempts[0].orderId).toBe(`payout-${payout._id}`);

			const retry = deps(sent({ orderId: `payout-${payout._id}-r2` }));
			await executePayout(payout, retry);
			expect(payout.attempts[1].orderId).toBe(`payout-${payout._id}-r2`);
		});

		test("STS-8 float insuffisant : aucun envoi, aucune tentative, Payout toujours pending", async () => {
			const payout = makePayout();
			const d = deps();
			d.fetchBalance.mockResolvedValue({ available: 100, currency: "XOF" });
			await expect(executePayout(payout, d)).rejects.toMatchObject({ code: "insufficient_float" });
			expect(d.claimLock).not.toHaveBeenCalled();
			expect(d.sendAttempt).not.toHaveBeenCalled();
			expect(payout.status).toBe("pending");
			expect(payout.attempts).toHaveLength(0);
		});

		test("STS-9 verrou atomique : le second travailleur ne part pas", async () => {
			const payout = makePayout();
			const findOneAndUpdate = jest
				.spyOn(Payout, "findOneAndUpdate")
				.mockResolvedValueOnce(payout)
				.mockResolvedValueOnce(null)
				.mockResolvedValue(null);

			expect(await claimPayout(payout._id)).toBe(payout);
			expect(await claimPayout(payout._id)).toBeNull();
			expect(findOneAndUpdate).toHaveBeenCalledTimes(2);

			const filter = findOneAndUpdate.mock.calls[0][0];
			expect(filter._id).toBe(payout._id);
			expect(filter.status.$in).toEqual(expect.arrayContaining(["pending", "network_issue"]));

			const d = deps();
			d.claimLock = claimPayout; // chemin réel, mais verrou déjà épuisé
			await expect(executePayout(payout, d)).rejects.toMatchObject({ code: "payout_not_pending" });
			expect(d.sendAttempt).not.toHaveBeenCalled();
		});

		test("STS-10 fetchPayoutBalance interroge /balance?service=payout et lit le solde", async () => {
			axios.get.mockResolvedValue({ data: { data: { available: 250000, currency: "XOF" } } });
			const balance = await fetchPayoutBalance("T", { country: "SN" });
			expect(balance.available).toBe(250000);
			expect(balance.currency).toBe("XOF");
			const url = axios.get.mock.calls[0][0];
			expect(url).toContain("/balance");
			expect(url).toContain("service=payout");
			expect(url).toContain("country=SN");
		});

		test("STS-11 PayoutError porte un code lisible", () => {
			const error = new PayoutError("payout_network_issue", { orderId: "payout-1" });
			expect(error).toBeInstanceOf(Error);
			expect(error.code).toBe("payout_network_issue");
			expect(error.orderId).toBe("payout-1");
		});
	});
});