/**
 * Revue Jour 80 — passage d'un segment à « completed » : les articles déjà
 * dans un statut terminal (cancelled, rejected, refunded, disputed) ne sont
 * jamais réécrits en « completed », ni dans segments[].items ni dans
 * order.items. Sinon un article annulé réentrerait dans l'assiette du
 * reversement vendeur.
 * Aucune base : commande en mémoire, save() et notifications simulés.
 */
const mongoose = require("mongoose");
const { updateOrderStatus } = require("../services/orderStatusService");
const orderNotificationService = require("../services/orderNotificationService");

const oid = () => new mongoose.Types.ObjectId();
const TERMINAL = ["cancelled", "rejected", "refunded", "disputed"];

const makeOrder = () => {
	const seller = oid();
	const statuses = ["delivered", ...TERMINAL];
	const base = statuses.map((status, i) => ({
		_id: oid(),
		product: oid(),
		seller,
		quantity: 1,
		unitPrice: 1000 + i,
		totalPrice: 1000 + i,
		status,
		statusHistory: [],
	}));
	return {
		_id: oid(),
		buyer: oid(),
		status: "delivered",
		delivery: { transporter: null },
		items: base,
		segments: [
			{
				_id: oid(),
				seller,
				status: "delivered",
				history: [],
				items: base.map((item) => ({ ...item, statusHistory: [] })),
			},
		],
		statusHistory: [],
		save: jest.fn().mockResolvedValue(undefined),
		markModified: jest.fn(),
	};
};

const admin = { _id: oid(), userType: "admin", role: "admin" };
const statusOf = (items, status0) => items.find((i) => i.unitPrice === status0).status;

describe("updateOrderStatus → completed : articles en statut terminal préservés", () => {
	let notify;

	beforeEach(() => {
		notify = jest.spyOn(orderNotificationService, "sendStatusNotifications").mockResolvedValue(undefined);
	});

	test("le segment passe à completed et l'article livré aussi", async () => {
		const order = makeOrder();
		const { changed } = await updateOrderStatus(order, "completed", admin);
		expect(changed).toBe(true);
		expect(order.segments[0].status).toBe("completed");
		expect(order.segments[0].items[0].status).toBe("completed");
		expect(order.items[0].status).toBe("completed");
		expect(order.save).toHaveBeenCalled();
		expect(notify).toHaveBeenCalled();
	});

	test.each(TERMINAL.map((status, i) => [status, 1001 + i]))(
		"article %p conservé dans segments[].items et dans items",
		async (status, unitPrice) => {
			const order = makeOrder();
			await updateOrderStatus(order, "completed", admin);
			expect(statusOf(order.segments[0].items, unitPrice)).toBe(status);
			expect(statusOf(order.items, unitPrice)).toBe(status);
			const segItem = order.segments[0].items.find((i) => i.unitPrice === unitPrice);
			expect(segItem.statusHistory.some((h) => h.status === "completed")).toBe(false);
		},
	);

	test("aucune connexion Mongo ouverte", () => {
		expect(mongoose.connection.readyState).toBe(0);
	});
});
