// Tests du back-office Jour 85 — page admin payins / payouts / refunds
// (statuts, tentatives, coûts réels, float, relances) et tableau « Mobile
// money » dans `AdminAnalytics`, alimentée par le endpoint provider-costs du
// Jour 84. Aucune base MongoDB : schémas via validateSync(), documents
// factices, dépendances (services) injectées. Pattern : afribapay-costs.test.js.
process.env.AFRIBAPAY_API_USER = "harvests-test-user";
process.env.AFRIBAPAY_API_KEY = "harvests-test-key-1234567890";
process.env.AFRIBAPAY_MERCHANT_KEY = "mk_test_dummy_key_12345678";

// Journal d'audit : écrirait en base (AuditLog) — neutralisé.
jest.mock("../utils/auditLogger", () => {
	const actual = jest.requireActual("../utils/auditLogger");
	return { ...actual, logAudit: () => {} };
});

jest.mock("axios");
jest.mock("../utils/afribapayClient", () => {
	const actual = jest.requireActual("../utils/afribapayClient");
	return { ...actual, getAccessToken: async () => "T" };
});

const mongoose = require("mongoose");
const Payment = require("../models/Payment");
const Payout = require("../models/Payout");
const paymentAdminService = require("../services/payment/paymentAdminService");
const paymentCostsService = require("../services/payment/paymentCostsService");
const paymentPayoutService = require("../services/payment/paymentPayoutService");
const afribapayPayinService = require("../services/payment/paymentAfribapayService");
const paymentAdminController = require("../controllers/payment/paymentAdminController");
const adminPaymentController = require("../controllers/admin/adminPaymentController");
const AppError = require("../utils/appError");

afterAll(() => {
	delete process.env.AFRIBAPAY_API_USER;
	delete process.env.AFRIBAPAY_API_KEY;
	delete process.env.AFRIBAPAY_MERCHANT_KEY;
});

afterEach(() => {
	jest.restoreAllMocks();
	jest.clearAllMocks();
});

const oid = () => new mongoose.Types.ObjectId();

const okRes = () => ({ status: jest.fn().mockReturnThis(), json: jest.fn() });

const makePayment = () =>
	new Payment({
		paymentId: `pay_${oid()}`,
		user: oid(),
		order: oid(),
		amount: 7000,
		currency: "XOF",
		method: "mobile_money",
		provider: "afribapay",
		type: "order",
		status: "succeeded",
		paidAt: new Date("2026-11-18T10:00:00Z"),
	});

// ---------------------------------------------------------------------------
describe("A — back-office : coûts réels AfriBaPay (endpoint provider-costs)", () => {
	test("A1 renvoie les agrégats par devise (payin / payout / remboursement / all) pour la période demandée", async () => {
		const stats = {
			period: "30d",
			from: new Date("2026-11-01T00:00:00Z"),
			to: new Date("2026-12-01T00:00:00Z"),
			currency: "XOF",
			currencies: {
				XOF: {
					payin: { count: 2, fees: 30, taxes: 0, total: 30 },
					payout: { count: 1, fees: 45, taxes: 0, total: 45 },
					refund: { count: 0, fees: 0, taxes: 0, total: 0 },
					all: { count: 3, fees: 75, taxes: 0, total: 75 },
				},
			},
		};
		const spy = jest.spyOn(paymentCostsService, "getProviderCostStats").mockResolvedValue(stats);
		const res = okRes();
		const next = jest.fn();
		await paymentAdminController.getProviderCosts(
			{ query: { period: "30d", from: "2026-11-01T00:00:00Z", to: "2026-12-01T00:00:00Z", currency: "XOF" } },
			res,
			next,
		);
		expect(spy).toHaveBeenCalledWith({
			period: "30d",
			from: "2026-11-01T00:00:00Z",
			to: "2026-12-01T00:00:00Z",
			currency: "XOF",
		});
		expect(next).not.toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: "success", data: stats }));
	});

	test("A2 paramètres invalides → AppError 400 transmis à next (jamais d'erreur interne brute)", async () => {
		jest.spyOn(paymentCostsService, "getProviderCostStats").mockImplementation(() => {
			throw new RangeError("Paramètre invalide : currency (code ISO à 3 lettres attendu)");
		});
		const next = jest.fn();
		await paymentAdminController.getProviderCosts({ query: { currency: "XOF;drop" } }, okRes(), next);
		expect(next).toHaveBeenCalledTimes(1);
		expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
		expect(next.mock.calls[0][0].statusCode).toBe(400);
	});
});

// ---------------------------------------------------------------------------
describe("B — back-office : listes des paiements (page admin Jour 85)", () => {
	test("B1 le back-office admin renvoie les paiements via le service (pas un stub « feature_in_development »)", async () => {
		const payments = [makePayment()];
		const spy = jest
			.spyOn(paymentAdminService, "getAllPayments")
			.mockResolvedValue({ payments, total: 1, page: 1, totalPages: 1 });
		const res = okRes();
		await adminPaymentController.getAllPayments({ query: {} }, res, jest.fn());
		expect(spy).toHaveBeenCalledWith({});
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({ status: "success", data: { payments } }),
		);
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({ results: 1, total: 1, page: 1, totalPages: 1 }),
		);
	});

	test("B2 les filtres de query (statut / méthode / provider / user) sont transmis au service", async () => {
		const spy = jest
			.spyOn(paymentAdminService, "getAllPayments")
			.mockResolvedValue({ payments: [], total: 0, page: 1, totalPages: 0 });
		const query = { status: "succeeded", method: "mobile_money", provider: "afribapay", user: String(oid()) };
		const res = okRes();
		await adminPaymentController.getAllPayments({ query }, res, jest.fn());
		expect(spy).toHaveBeenCalledWith(query);
		expect(res.status).toHaveBeenCalledWith(200);
	});

	test("B3 une erreur du service est renvoyée via next(AppError 400), pas crashée en silence", async () => {
		jest
			.spyOn(paymentAdminService, "getAllPayments")
			.mockRejectedValue(new Error("Database connection failed"));
		const next = jest.fn();
		await adminPaymentController.getAllPayments({ query: {} }, okRes(), next);
		expect(next).toHaveBeenCalledTimes(1);
		expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
		expect(next.mock.calls[0][0].statusCode).toBe(400);
	});
});

// ---------------------------------------------------------------------------
describe("C — back-office : listing des payouts (Jour 85)", () => {
	test("C1 le back-office admin renvoie les payouts via le service (filtres + pagination)", async () => {
		const sellerId = String(oid());
		const payouts = [{ _id: oid(), status: "succeeded" }];
		const spy = jest
			.spyOn(paymentPayoutService, "listPayouts")
			.mockResolvedValue({ payouts, total: 1, page: 2, totalPages: 1 });
		const query = {
			status: "succeeded",
			sellerId,
			currency: "XOF",
			from: "2026-11-01T00:00:00Z",
			to: "2026-11-30T00:00:00Z",
			page: "2",
			limit: "10",
		};
		const res = okRes();
		const next = jest.fn();
		await adminPaymentController.getAllPayouts({ query }, res, next);
		expect(spy).toHaveBeenCalledWith(query);
		expect(next).not.toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({ status: "success", data: { payouts } } ),
		);
	});

	test("C2 une erreur du service est renvoyée via next(AppError 400)", async () => {
		jest.spyOn(paymentPayoutService, "listPayouts").mockRejectedValue(new Error("Database connection failed"));
		const next = jest.fn();
		await adminPaymentController.getAllPayouts({ query: {} }, okRes(), next);
		expect(next).toHaveBeenCalledTimes(1);
		expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
		expect(next.mock.calls[0][0].statusCode).toBe(400);
	});

	test("C3 listPayouts applique filtres, période et pagination (bornes)", async () => {
		const sort = jest.fn().mockReturnThis();
		const skip = jest.fn().mockReturnThis();
		const limit = jest.fn().mockResolvedValue([]);
		const findSpy = jest.spyOn(Payout, "find").mockReturnValue({ sort, skip, limit });
		const countSpy = jest.spyOn(Payout, "countDocuments").mockResolvedValue(0);
		const sellerId = String(oid());
		const result = await paymentPayoutService.listPayouts({
			status: "succeeded",
			sellerId,
			currency: "XOF",
			from: "2026-11-01T00:00:00Z",
			to: "2026-11-30T00:00:00Z",
			page: "2",
			limit: "10",
		});
		const expectedQuery = {
			status: "succeeded",
			seller: sellerId,
			currency: "XOF",
			createdAt: {
				$gte: new Date("2026-11-01T00:00:00Z"),
				$lte: new Date("2026-11-30T00:00:00Z"),
			},
		};
		expect(findSpy).toHaveBeenCalledWith(expectedQuery);
		expect(countSpy).toHaveBeenCalledWith(expectedQuery);
		expect(sort).toHaveBeenCalledWith("-createdAt _id");
		expect(skip).toHaveBeenCalledWith(10);
		expect(limit).toHaveBeenCalledWith(10);
		expect(result.page).toBe(2);
		expect(result.totalPages).toBe(0);
	});
});

// ---------------------------------------------------------------------------
describe("D — back-office : statistiques mobile money (volume, succès, délais)", () => {
	test("D1 pipeline : toutes les tentatives mobile money de la période, par devise", () => {
		const from = new Date("2026-11-01T00:00:00Z");
		const to = new Date("2026-12-01T00:00:00Z");
		const [match, group] = paymentCostsService.buildPaymentStatusPipeline({ from, to, currency: "XOF" });
		expect(match.$match).toMatchObject({
			method: "mobile_money",
			createdAt: { $gte: from, $lte: to },
			currency: "XOF",
		});
		expect(group.$group).toMatchObject({
			_id: "$currency",
			total: { $sum: 1 },
			succeeded: { $sum: { $cond: [{ $eq: ["$status", "succeeded"] }, 1, 0] } },
			avgDelayMs: { $avg: { $subtract: ["$paidAt", "$createdAt"] } },
		});
	});

	test("D2 résumé : taux de succès et délai moyen (devise absente ignorée)", () => {
		const summary = paymentCostsService.summarizePaymentStatusStats([
			{ _id: "XOF", total: 10, succeeded: 8, failed: 1, pending: 1, ambiguous: 0, avgDelayMs: 45000 },
			{ _id: null, total: 3, succeeded: 3 },
		]);
		expect(summary.XOF).toEqual({
			total: 10,
			succeeded: 8,
			failed: 1,
			pending: 1,
			ambiguous: 0,
			successRate: 80,
			avgDelaySeconds: 45,
		});
		expect(summary.XAF).toBeUndefined();
	});

	test("D3 getProviderCostStats expose statusStats par devise", async () => {
		// Ordre des appels : payin (Payment), refund (Payment), status (Payment).
		jest
			.spyOn(Payment, "aggregate")
			.mockResolvedValueOnce([])
			.mockResolvedValueOnce([])
			.mockResolvedValueOnce([
				{ _id: "XOF", total: 4, succeeded: 3, failed: 1, pending: 0, ambiguous: 0, avgDelayMs: 12000 },
			]);
		const payoutSpy = jest.spyOn(Payout, "aggregate").mockResolvedValue([]);
		const result = await paymentCostsService.getProviderCostStats({ period: "7d" });
		expect(result.statusStats.XOF).toMatchObject({ total: 4, successRate: 75, avgDelaySeconds: 12 });
		expect(payoutSpy).toHaveBeenCalledTimes(1);
	});
});

// ---------------------------------------------------------------------------
describe("E — back-office : soldes de float par pays (Jour 85)", () => {
	test("E1 chaque pays est interrogé ; un échec isolé n'empêche pas les autres", async () => {
		const fetchBalance = jest.fn(async (token, { country }) => {
			if (country === "CI") throw new Error("provider down");
			return { available: country === "SN" ? 1_000_000 : 250_000, currency: "XOF" };
		});
		const balances = await paymentPayoutService.getFloatBalances({
			countries: ["SN", "CI"],
			token: "T",
			fetchBalance,
		});
		expect(balances.SN).toEqual({ available: 1_000_000, currency: "XOF" });
		expect(balances.CI).toEqual({ available: 0, currency: "", error: "provider down" });
		expect(fetchBalance).toHaveBeenCalledTimes(2);
	});

	test("E2 le contrôleur expose les soldes, pays demandés ou tous", async () => {
		const spy = jest
			.spyOn(paymentPayoutService, "getFloatBalances")
			.mockResolvedValue({ SN: { available: 1000, currency: "XOF" } });
		const res = okRes();
		await adminPaymentController.getFloatBalances({ query: { countries: "SN, ci" } }, res, jest.fn());
		expect(spy).toHaveBeenCalledWith({ countries: ["SN", "CI"] });
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith(
			expect.objectContaining({ status: "success", data: { balances: { SN: { available: 1000, currency: "XOF" } } } }),
		);
	});

	test("E3 une erreur globale est renvoyée via next(AppError 400)", async () => {
		jest.spyOn(paymentPayoutService, "getFloatBalances").mockRejectedValue(new Error("no token"));
		const next = jest.fn();
		await adminPaymentController.getFloatBalances({ query: {} }, okRes(), next);
		expect(next).toHaveBeenCalledTimes(1);
		expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
	});
});

// ---------------------------------------------------------------------------
describe("F — relance manuelle admin d'un payin (Jour 85, revue finale)", () => {
	const makePayin = (overrides = {}) => {
		const payment = new Payment({
			paymentId: `pay_${oid()}`,
			user: oid(),
			order: oid(),
			amount: 7000,
			currency: "XOF",
			method: "mobile_money",
			provider: "afribapay",
			type: "order",
			status: "failed",
			paymentDetails: { afribapay: { operator: "wave", phone: "771234567", country: "SN" } },
			...overrides,
		});
		jest.spyOn(payment, "save").mockResolvedValue(payment);
		return payment;
	};

	test("F1 relance par ObjectId, sans filtre user (la route client ne marche pas pour un admin)", async () => {
		const payment = makePayin();
		jest.spyOn(Payment, "findById").mockResolvedValue(payment);
		const retry = jest
			.spyOn(afribapayPayinService, "retryAfribapayPayin")
			.mockResolvedValue({ data: { status: "SUCCESS" } });
		const res = okRes();
		const next = jest.fn();
		await adminPaymentController.retryAfribapayPayment(
			{ params: { id: payment._id.toString() }, body: {} },
			res,
			next,
		);
		// `catchAsync` ne retourne pas la promesse : attendre la file de
		// micro-tâches pour que les 3 awaits du handler se terminent.
		await new Promise((resolve) => setImmediate(resolve));
		expect(retry).toHaveBeenCalledWith(
			expect.objectContaining({
				payment,
				amount: 7000,
				currency: "XOF",
				operator: "wave",
				phone: "771234567",
			}),
		);
		expect(res.status).toHaveBeenCalledWith(201);
	});

	test("F2 sans opérateur ni téléphone : 400 contrôlé", async () => {
		const payment = makePayin({ paymentDetails: { afribapay: { country: "SN" } } });
		jest.spyOn(Payment, "findById").mockResolvedValue(payment);
		const next = jest.fn();
		await adminPaymentController.retryAfribapayPayment(
			{ params: { id: payment._id.toString() }, body: {} },
			okRes(),
			next,
		);
		expect(next).toHaveBeenCalledTimes(1);
		expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
		expect(next.mock.calls[0][0].statusCode).toBe(400);
	});

	test("F3 paiement introuvable : 404", async () => {
		jest.spyOn(Payment, "findOne").mockResolvedValue(null);
		const next = jest.fn();
		await adminPaymentController.retryAfribapayPayment(
			{ params: { id: "pay_unknown" }, body: {} },
			okRes(),
			next,
		);
		expect(next).toHaveBeenCalledTimes(1);
		expect(next.mock.calls[0][0].statusCode).toBe(404);
	});
});
