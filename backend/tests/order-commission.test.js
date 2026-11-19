// Commission plateforme HARVESTS sur les commandes (Order.calculateFees).
// Décision utilisateur : 7,5 % (au lieu de 5 %), même taux que les
// reversements vendeurs — une seule source : getCommissionRate() de
// config/payout.js (surchargeable par HARVESTS_COMMISSION_RATE).
// Aucune connexion Mongo : documents en mémoire, jamais de save() (le .env
// local pointe sur la base de production).
const mongoose = require("mongoose");

const Order = require("../models/Order");

const oid = () => new mongoose.Types.ObjectId();

// Commande en mémoire : sous-total 10 000, total (avec livraison) 10 500.
const makeOrder = ({ subtotal = 10000, total = 10500 } = {}) =>
	new Order({
		buyer: oid(),
		items: [
			{
				product: oid(),
				seller: oid(),
				quantity: 1,
				unitPrice: subtotal,
				totalPrice: subtotal,
			},
		],
		subtotal,
		deliveryFee: total - subtotal,
		total,
		currency: "XOF",
		payment: { method: "mobile_money", amount: total, currency: "XOF" },
	});

describe("Order.calculateFees — commission plateforme", () => {
	let saved;

	beforeEach(() => {
		saved = process.env.HARVESTS_COMMISSION_RATE;
		delete process.env.HARVESTS_COMMISSION_RATE;
	});

	afterEach(() => {
		if (saved === undefined) delete process.env.HARVESTS_COMMISSION_RATE;
		else process.env.HARVESTS_COMMISSION_RATE = saved;
	});

	test("O1 sous-total 10 000, total 10 500 → plateforme 750 (7,5 %), paiement 263, total 1 013", () => {
		const order = makeOrder();
		const fees = order.calculateFees();
		// paiement : Math.round(10 500 × 2,5 % = 262,5) = 263
		// total : Math.round(750 + 262,5 = 1 012,5) = 1 013
		expect(fees).toEqual({ platform: 750, payment: 263, total: 1013 });
		expect(order.payment.fees.platform).toBe(750);
		expect(order.payment.fees.payment).toBe(263);
		expect(order.payment.fees.total).toBe(1013);
	});

	test("O2 HARVESTS_COMMISSION_RATE=\"0.1\" → plateforme 1 000 (même source que les reversements)", () => {
		process.env.HARVESTS_COMMISSION_RATE = "0.1";
		const fees = makeOrder().calculateFees();
		expect(fees.platform).toBe(1000);
		expect(fees.payment).toBe(263);
		expect(fees.total).toBe(1263);
	});

	test("O3 taux plateforme = getCommissionRate() de config/payout.js", () => {
		const { getCommissionRate } = require("../config/payout");
		process.env.HARVESTS_COMMISSION_RATE = "0.08";
		const fees = makeOrder().calculateFees();
		expect(fees.platform).toBe(Math.round(10000 * getCommissionRate()));
		expect(fees.platform).toBe(800);
	});

	test("O4 valeur invalide (\"abc\") → repli sur 7,5 %", () => {
		process.env.HARVESTS_COMMISSION_RATE = "abc";
		expect(makeOrder().calculateFees().platform).toBe(750);
	});

	test("O5 aucune connexion Mongo ouverte", () => {
		makeOrder().calculateFees();
		expect(mongoose.connection.readyState).toBe(0);
	});
});
