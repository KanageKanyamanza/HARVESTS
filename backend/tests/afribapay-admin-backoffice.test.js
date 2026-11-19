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
