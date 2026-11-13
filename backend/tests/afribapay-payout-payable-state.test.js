// Marqueur payoutState des commandes (Jour 81, décision utilisateur :
// performance de la recherche des vendeurs payables). Une commande dont le
// reversement est déjà parti (scheduled), payé (paid) ou définitivement échoué
// (failed) ne doit plus ressortir comme payable. Les commandes antérieures sans
// marqueur restent payables (repli legacy).
// Aucune connexion Mongo : les fonctions sont pures.
const mongoose = require("mongoose");
const {
	buildPayableOrdersQuery,
	groupPayableBySeller,
} = require("../services/payment/paymentPayoutService");

const oid = () => new mongoose.Types.ObjectId();
const str = (v) => String(v);

const clausesOf = (query) =>
	Object.entries(query).flatMap(([key, value]) =>
		key === "$and" ? value.flatMap(clausesOf) : [{ [key]: value }],
	);

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

const makeOrder = (seller, { payoutState, unitPrice = 10000 } = {}) => {
	const order = {
		_id: oid(),
		orderNumber: "HV-STATE-0001",
		buyer: oid(),
		status: "delivered",
		currency: "XOF",
		items: [item(seller._id, unitPrice)],
		segments: [
			{ seller: seller._id, status: "delivered", subtotal: unitPrice, items: [item(seller._id, unitPrice)] },
		],
		payment: { method: "mobile_money", status: "succeeded" },
	};
	// « absent » et « undefined » sont deux cas différents pour $exists : on ne
	// pose la clé que si un marqueur est fourni.
	if (payoutState !== "absent") order.payoutState = payoutState;
	return order;
};

const makeSeller = (overrides = {}) => ({
	_id: oid(),
	userType: "producer",
	country: "Sénégal",
	phone: "+221 77 123 45 67",
	payoutAccount: { operator: "wave" },
	isActive: true,
	isApproved: true,
	isTestAccount: false,
	...overrides,
});

const payableFor = (res, seller) => res.payable.find((e) => str(e.seller) === str(seller._id));
const blockedFor = (res, seller) => res.blocked.find((b) => str(b.seller) === str(seller._id));

describe("Jour 81 — marqueur payoutState des commandes", () => {
	describe("STATE — requête et filtrage", () => {
		test("STATE-1 buildPayableOrdersQuery filtre pending ou marqueur absent", () => {
			const clauses = clausesOf(buildPayableOrdersQuery());
			const payoutState = clauses.find((c) => Array.isArray(c.$or) && c.$or.some((b) => "payoutState" in b));
			expect(payoutState).toBeDefined();
			expect(payoutState.$or).toEqual(
				expect.arrayContaining([{ payoutState: "pending" }, { payoutState: { $exists: false } }]),
			);
		});

		test("STATE-1bis le filtre livré/encaissé reste intact", () => {
			const clauses = clausesOf(buildPayableOrdersQuery());
			expect(clauses.find((c) => "payment.status" in c)["payment.status"]).toEqual({
				$in: ["succeeded", "completed"],
			});
			expect(
				clauses.find((c) => Array.isArray(c.$or) && c.$or.some((b) => "segments.status" in b)),
			).toBeDefined();
		});

		test.each(["scheduled", "paid", "failed"])(
			"STATE-2/3/4 commande %s : ni payable ni bloquée",
			(payoutState) => {
				const seller = makeSeller();
				const order = makeOrder(seller, { payoutState });
				const res = groupPayableBySeller({
					orders: [order],
					sellers: [seller],
					alreadyPaidPairs: new Set(),
					rate: 0.05,
				});
				expect(payableFor(res, seller)).toBeUndefined();
				expect(blockedFor(res, seller)).toBeUndefined();
			},
		);

		test("STATE-5 commande sans marqueur (legacy) : payable", () => {
			const seller = makeSeller();
			const res = groupPayableBySeller({
				orders: [makeOrder(seller, { payoutState: "absent" })],
				sellers: [seller],
				alreadyPaidPairs: new Set(),
				rate: 0.05,
			});
			expect(payableFor(res, seller)).toBeDefined();
		});

		test("STATE-6 commande pending : payable, montant net cohérent", () => {
			const seller = makeSeller();
			const res = groupPayableBySeller({
				orders: [makeOrder(seller, { payoutState: "pending" })],
				sellers: [seller],
				alreadyPaidPairs: new Set(),
				rate: 0.05,
			});
			const entry = payableFor(res, seller);
			expect(entry).toBeDefined();
			expect(entry.amount).toBe(9500);
			expect(entry.lines[0].net).toBe(9500);
		});

		test("STATE-7 un Payout existant réserve la commande (non-régression)", () => {
			const seller = makeSeller();
			const order = makeOrder(seller, { payoutState: "pending" });
			const res = groupPayableBySeller({
				orders: [order],
				sellers: [seller],
				alreadyPaidPairs: new Set([`${str(seller._id)}:${str(order._id)}`]),
				rate: 0.05,
			});
			expect(payableFor(res, seller)).toBeUndefined();
			expect(blockedFor(res, seller)).toBeUndefined();
		});
	});
});