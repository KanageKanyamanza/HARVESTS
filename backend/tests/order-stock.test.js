/**
 * Jour 72 — solde du stock : une seule fois par segment, quel que soit le chemin
 * qui change le statut.
 */
const mongoose = require("mongoose");
const { settleOrderStock } = require("../models/order/orderStock");

const makeProduct = () => ({
	saves: 0,
	calls: [],
	commitStock(q) { this.calls.push(["commit", q]); },
	releaseStock(q) { this.calls.push(["release", q]); },
	revertSale(q) { this.calls.push(["revert", q]); },
	async save() { this.saves += 1; },
});

describe("settleOrderStock", () => {
	let product;
	let spy;

	beforeEach(() => {
		product = makeProduct();
		spy = jest.spyOn(mongoose, "model").mockReturnValue({ findById: async () => product });
	});
	afterEach(() => spy.mockRestore());

	const segment = (status, extra = {}) => ({ status, items: [{ product: "p", quantity: 2 }], ...extra });

	test("une commande en cours ne touche pas au stock", async () => {
		await settleOrderStock({ status: "preparing", segments: [segment("preparing")] });
		expect(product.calls).toEqual([]);
	});

	test("livré : réservation soldée une seule fois, même si la commande passe à terminé", async () => {
		const seg = segment("delivered");
		const order = { status: "delivered", segments: [seg] };
		await settleOrderStock(order);
		expect(seg.stockState).toBe("committed");
		seg.status = "completed";
		order.status = "completed";
		await settleOrderStock(order);
		expect(product.calls).toEqual([["commit", 2]]);
	});

	test("annulé : stock rendu une seule fois", async () => {
		const seg = segment("cancelled");
		const order = { status: "cancelled", segments: [seg] };
		await settleOrderStock(order);
		await settleOrderStock(order);
		expect(seg.stockState).toBe("released");
		expect(product.calls).toEqual([["release", 2]]);
	});

	test("annulation après livraison : vente retirée, pas de remise en stock", async () => {
		const seg = segment("cancelled", { stockState: "committed" });
		await settleOrderStock({ status: "cancelled", segments: [seg] });
		expect(product.calls).toEqual([["revert", 2]]);
		expect(seg.stockState).toBe("released");
	});

	test("deux vendeurs : chacun son solde", async () => {
		const a = segment("cancelled");
		const b = segment("preparing");
		await settleOrderStock({ status: "preparing", segments: [a, b] });
		expect(a.stockState).toBe("released");
		expect(b.stockState).toBeUndefined();
		expect(product.calls).toEqual([["release", 2]]);
	});

	test("annulation posée sur la commande sans toucher au segment", async () => {
		const seg = segment("preparing");
		await settleOrderStock({ status: "cancelled", segments: [seg] });
		expect(product.calls).toEqual([["release", 2]]);
	});

	test("commande terminée par le client alors que le segment est encore en cours", async () => {
		const seg = segment("in-transit");
		await settleOrderStock({ status: "completed", segments: [seg] });
		expect(product.calls).toEqual([["commit", 2]]);
	});

	test("commande sans segment", async () => {
		const order = { status: "delivered", items: [{ product: "p", quantity: 3 }] };
		await settleOrderStock(order);
		expect(order.stockState).toBe("committed");
		expect(product.calls).toEqual([["commit", 3]]);
	});

	test("produit supprimé : le solde ne bloque pas la commande", async () => {
		spy.mockReturnValue({ findById: async () => null });
		const seg = segment("delivered");
		await expect(settleOrderStock({ status: "delivered", segments: [seg] })).resolves.toBeUndefined();
		expect(seg.stockState).toBe("committed");
	});
});
