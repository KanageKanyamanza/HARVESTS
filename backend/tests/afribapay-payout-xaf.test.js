// Conversion XOF → XAF des reversements (Jour 81, décision utilisateur : taux
// configurable, défaut 1). Les commandes sont libellées en XOF ; un vendeur des
// pays XAF (CM, GA, CG, TD, CF) doit être payé en XAF. La conversion porte sur
// l'ASSIETTE avant commission (l'arrondi indépendant de la commission et du net
// casserait l'invariant gross − commission = net).
// Aucune connexion Mongo : groupPayableBySeller est une fonction pure.
process.env.AFRIBAPAY_MERCHANT_KEY = process.env.AFRIBAPAY_MERCHANT_KEY || "mk_test_dummy_key_12345678";
process.env.AFRIBAPAY_API_USER = process.env.AFRIBAPAY_API_USER || "harvests-test-user";
process.env.AFRIBAPAY_API_KEY = process.env.AFRIBAPAY_API_KEY || "harvests-test-key-1234567890";

const mongoose = require("mongoose");
const {
	groupPayableBySeller,
	convertXofToXaf,
} = require("../services/payment/paymentPayoutService");

const oid = () => new mongoose.Types.ObjectId();
const str = (v) => String(v);

const item = (seller, unitPrice, quantity = 1) => ({
	_id: oid(),
	product: oid(),
	seller,
	quantity,
	unitPrice,
	totalPrice: unitPrice * quantity,
	currency: "XOF",
	status: "delivered",
});

const makeOrder = ({ seller, unitPrice, quantity = 1, currency = "XOF" }) => ({
	_id: oid(),
	orderNumber: "HV-XAF-0001",
	buyer: oid(),
	status: "delivered",
	currency,
	items: [item(seller._id, unitPrice, quantity)],
	segments: [
		{
			seller: seller._id,
			status: "delivered",
			subtotal: unitPrice * quantity,
			items: [item(seller._id, unitPrice, quantity)],
		},
	],
	payment: { method: "mobile_money", status: "succeeded", currency },
});

const makeSeller = (overrides = {}) => ({
	_id: oid(),
	userType: "producer",
	country: "Cameroun",
	phone: "+237 6 99 00 11 22",
	payoutAccount: { operator: "mtn" },
	isActive: true,
	isApproved: true,
	isTestAccount: false,
	...overrides,
});

const snSeller = () =>
	makeSeller({ country: "Sénégal", phone: "+221 77 123 45 67", payoutAccount: { operator: "wave" } });

const run = (seller, order, extra = {}) =>
	groupPayableBySeller({
		orders: [order],
		sellers: [seller],
		alreadyPaidPairs: new Set(),
		...extra,
	});

const payableFor = (res, seller) => res.payable.find((e) => str(e.seller) === str(seller._id));
const blockedFor = (res, seller) => res.blocked.find((b) => str(b.seller) === str(seller._id));

const withEnv = (value, fn) => {
	const saved = process.env.HARVESTS_XOF_TO_XAF_RATE;
	try {
		if (value === undefined) delete process.env.HARVESTS_XOF_TO_XAF_RATE;
		else process.env.HARVESTS_XOF_TO_XAF_RATE = value;
		return fn();
	} finally {
		if (saved === undefined) delete process.env.HARVESTS_XOF_TO_XAF_RATE;
		else process.env.HARVESTS_XOF_TO_XAF_RATE = saved;
	}
};

describe("Jour 81 — conversion XOF → XAF", () => {
	describe("XAF — convertXofToXaf", () => {
		test("XAF-1 arrondi à l'unité (francs CFA sans centimes)", () => {
			expect(convertXofToXaf(10000, 1)).toBe(10000);
			expect(convertXofToXaf(333, 1.25)).toBe(416);
			expect(convertXofToXaf(10000, "abc")).toBe(10000);
			expect(convertXofToXaf(NaN, 1)).toBe(0);
			expect(convertXofToXaf(1000, 0)).toBe(1000);
			expect(convertXofToXaf(1000, -2)).toBe(1000);
		});
	});

	describe("XAF — vendeur payé en XAF", () => {
		test("XAF-2 vendeur SN : taux 1, aucune conversion", () => {
			const seller = snSeller();
			const entry = payableFor(run(seller, makeOrder({ seller, unitPrice: 10000 }), { rate: 0.05 }), seller);
			expect(entry).toBeDefined();
			expect(entry.currency).toBe("XOF");
			expect(entry.fx).toEqual({ rate: 1, sourceCurrency: "XOF", targetCurrency: "XOF" });
			expect(entry.lines[0]).toMatchObject({ gross: 10000, commission: 500, net: 9500 });
			expect(entry.amount).toBe(9500);
		});

		test("XAF-3 vendeur CM, taux 1 : payable en XAF, montant inchangé", () => {
			const seller = makeSeller();
			const entry = payableFor(
				withEnv("1", () => run(seller, makeOrder({ seller, unitPrice: 10000 }), { rate: 0.05 })),
				seller,
			);
			expect(entry).toBeDefined();
			expect(entry.currency).toBe("XAF");
			expect(entry.fx).toEqual({ rate: 1, sourceCurrency: "XOF", targetCurrency: "XAF" });
			expect(entry.amount).toBe(9500);
			expect(entry.lines[0]).toMatchObject({ gross: 10000, commission: 500, net: 9500 });
		});

		test("XAF-4 taux 1,2 : assiette convertie AVANT commission, invariant tenu", () => {
			const seller = makeSeller();
			const entry = payableFor(
				withEnv("1.2", () => run(seller, makeOrder({ seller, unitPrice: 10000 }), { rate: 0.05 })),
				seller,
			);
			expect(entry.fx).toEqual({ rate: 1.2, sourceCurrency: "XOF", targetCurrency: "XAF" });
			expect(entry.lines[0].gross).toBe(12000);
			expect(entry.lines[0].commission).toBe(600);
			expect(entry.lines[0].net).toBe(11400);
			expect(entry.lines[0].gross - entry.lines[0].commission).toBe(entry.lines[0].net);
			expect(entry.amount).toBe(11400);
			expect(entry.grossAmount).toBe(12000);
			expect(entry.commissionAmount).toBe(600);
		});

		test("XAF-4bis conversion arrondie : assiette 333 × 1,25 → 416", () => {
			const seller = makeSeller();
			const entry = payableFor(
				withEnv("1.25", () => run(seller, makeOrder({ seller, unitPrice: 333 }), { rate: 0.05 })),
				seller,
			);
			expect(entry.lines[0].gross).toBe(416);
			expect(entry.lines[0].commission).toBe(21);
			expect(entry.lines[0].net).toBe(395);
			expect(entry.amount).toBe(395);
		});

		test.each(["abc", "-1", "0", ""])("XAF-5 taux invalide %p → repli 1, aucun montant aberrant", (value) => {
			const seller = makeSeller();
			const entry = payableFor(
				withEnv(value, () => run(seller, makeOrder({ seller, unitPrice: 10000 }), { rate: 0.05 })),
				seller,
			);
			expect(entry.fx.rate).toBe(1);
			expect(entry.amount).toBe(9500);
		});

		test("XAF-6 commande déjà en XAF : pas de conversion, pas de currency_mismatch", () => {
			const seller = makeSeller();
			const entry = payableFor(
				withEnv("1.2", () =>
					run(seller, makeOrder({ seller, unitPrice: 10000, currency: "XAF" }), { rate: 0.05 }),
				),
				seller,
			);
			expect(entry).toBeDefined();
			expect(entry.currency).toBe("XAF");
			expect(entry.fx).toEqual({ rate: 1, sourceCurrency: "XAF", targetCurrency: "XAF" });
			expect(entry.amount).toBe(9500);
			expect(blockedFor(run(seller, makeOrder({ seller, unitPrice: 10000 }), { rate: 0.05 }), seller)).toBeUndefined();
		});

		test("XAF-7 vendeur SN : le taux XAF ne s'applique jamais", () => {
			const seller = snSeller();
			const entry = payableFor(
				withEnv("1.5", () => run(seller, makeOrder({ seller, unitPrice: 10000 }), { rate: 0.075 })),
				seller,
			);
			expect(entry.fx).toEqual({ rate: 1, sourceCurrency: "XOF", targetCurrency: "XOF" });
			expect(entry.amount).toBe(9250);
		});
	});
});