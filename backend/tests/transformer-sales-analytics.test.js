// Tableau de bord transformateur : GET /api/v1/transformers/me/sales-analytics répondait 404
// (route absente, alors que genericService l'appelle pour chaque rôle vendeur).
jest.mock("../models/Order", () => ({ find: jest.fn(), countDocuments: jest.fn(), aggregate: jest.fn() }));
jest.mock("../models/Transformer", () => ({ findById: jest.fn() }));
jest.mock("../models/Product", () => ({ countDocuments: jest.fn() }));

const Order = require("../models/Order");
const statsService = require("../services/transformer/transformerStatsService");
const statsController = require("../controllers/transformer/transformerStatsController");

const order = (iso, total, quantities) => ({
	createdAt: new Date(iso),
	total,
	items: quantities.map((quantity) => ({ quantity })),
});

describe("transformerStatsService.getSalesAnalytics", () => {
	beforeEach(() => Order.find.mockReset());

	test("ne lit que les ventes livrées ou terminées du transformateur sur 12 mois", async () => {
		Order.find.mockResolvedValue([]);
		await statsService.getSalesAnalytics("t1");
		const filter = Order.find.mock.calls[0][0];
		expect(filter.seller).toBe("t1");
		expect(filter.status).toEqual({ $in: ["completed", "delivered"] });
		const from = filter.createdAt.$gte;
		const expected = new Date();
		expected.setMonth(expected.getMonth() - 12);
		expect(Math.abs(from - expected)).toBeLessThan(5000);
	});

	test("regroupe par mois ISO, du plus ancien au plus récent, au format attendu par le tableau de bord", async () => {
		Order.find.mockResolvedValue([
			order("2026-11-24T10:00:00Z", 12500, [5]),
			order("2026-10-03T10:00:00Z", 2000, [1, 2]),
			order("2026-11-02T10:00:00Z", 1500, [1]),
		]);
		const res = await statsService.getSalesAnalytics("t1");
		expect(res.chartData).toEqual([
			{ month: "2026-10", orders: 1, revenue: 2000, sales: 2000, products: 3 },
			{ month: "2026-11", orders: 2, revenue: 14000, sales: 14000, products: 6 },
		]);
		expect(res.monthlySales).toEqual(res.chartData);
	});

	test("commande sans total ni articles : comptée sans planter", async () => {
		Order.find.mockResolvedValue([{ createdAt: new Date("2026-09-15T00:00:00Z") }]);
		const res = await statsService.getSalesAnalytics("t1");
		expect(res.chartData).toEqual([{ month: "2026-09", orders: 1, revenue: 0, sales: 0, products: 0 }]);
	});
});

describe("transformerStatsController.getSalesAnalytics", () => {
	test("répond 200 { status, data: { analytics } } avec l'identifiant du transformateur connecté", async () => {
		Order.find.mockResolvedValue([]);
		// catchAsync ne renvoie pas la promesse : on attend l'envoi de la réponse
		let done;
		const sent = new Promise((r) => { done = r; });
		const res = { status: jest.fn().mockReturnThis(), json: jest.fn(() => done()) };
		const next = jest.fn(() => done());
		statsController.getSalesAnalytics({ user: { _id: "t9" } }, res, next);
		await sent;
		expect(next).not.toHaveBeenCalled();
		expect(Order.find.mock.calls.at(-1)[0].seller).toBe("t9");
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith({ status: "success", data: { analytics: { monthlySales: [], chartData: [] } } });
	});
});

describe("route transformateur", () => {
	test("GET /me/sales-analytics est déclarée", () => {
		const fs = require("fs");
		const src = fs.readFileSync(require.resolve("../routes/transformerRoutes"), "utf8");
		expect(src).toMatch(/router\.get\(\s*['"]\/me\/sales-analytics['"]\s*,\s*transformerController\.getSalesAnalytics\s*\)/);
		expect(require("../controllers/transformer").getSalesAnalytics).toBeDefined();
	});
});
