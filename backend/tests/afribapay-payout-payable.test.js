// Tests des vendeurs payables (Jour 80) : pays/devise de reversement,
// livraison et encaissement, assiette et commission, regroupement par vendeur,
// requête des commandes et lecture en base simulée.
// Aucune connexion Mongo : les lectures passent par jest.spyOn (resetMocks /
// restoreMocks actifs → spies posés dans beforeEach).
process.env.AFRIBAPAY_MERCHANT_KEY = process.env.AFRIBAPAY_MERCHANT_KEY || "mk_test_dummy_key_12345678";
process.env.AFRIBAPAY_API_USER = process.env.AFRIBAPAY_API_USER || "harvests-test-user";
process.env.AFRIBAPAY_API_KEY = process.env.AFRIBAPAY_API_KEY || "harvests-test-key-1234567890";

const mongoose = require("mongoose");

const {
	resolvePayoutCountry,
	payoutSellerType,
	isCollectionSettled,
	isSellerLineDelivered,
	sellerGrossForOrder,
	computePayoutLine,
	buildPayableOrdersQuery,
	groupPayableBySeller,
	buildPayoutDoc,
	listPayableSellers,
} = require("../services/payment/paymentPayoutService");
const Payout = require("../models/Payout");
const Order = require("../models/Order");
const User = require("../models/User");

const oid = () => new mongoose.Types.ObjectId();
const str = (v) => String(v);

// ---------------------------------------------------------------------------
// Fixtures — forme réelle d'une commande (models/order/orderSchemas.js) :
// les articles sont présents à la fois dans order.items (avec item.seller) et
// dans segments[].items (createSegmentsFromItems). L'assiette ne doit donc
// compter chaque article qu'une seule fois.
// ---------------------------------------------------------------------------
let orderSeq = 0;

const item = (seller, unitPrice, quantity, status = "delivered") => ({
	_id: oid(),
	product: oid(),
	seller,
	quantity,
	unitPrice,
	totalPrice: unitPrice * quantity,
	currency: "XOF",
	status,
});

/**
 * @param {object} o
 * @param {Array<{seller, status, items}>} o.parts une part par vendeur
 * @param {boolean} [o.withSegments=true]
 */
const makeOrder = ({
	parts,
	status = "delivered",
	currency = "XOF",
	payment = { method: "mobile_money", status: "succeeded" },
	withSegments = true,
	extra = {},
} = {}) => {
	orderSeq += 1;
	const items = parts.flatMap((p) => p.items);
	const subtotal = items.reduce((s, i) => s + i.totalPrice, 0);
	return {
		_id: oid(),
		orderNumber: `HV-TEST-${String(orderSeq).padStart(4, "0")}`,
		buyer: oid(),
		status,
		currency,
		items: items.map((i) => ({ ...i })),
		segments: withSegments
			? parts.map((p) => ({
					seller: p.seller,
					status: p.status || status,
					subtotal: p.items.reduce((s, i) => s + i.totalPrice, 0),
					items: p.items.map((i) => ({ ...i })),
				}))
			: [],
		subtotal,
		taxes: 0,
		discount: 0,
		total: subtotal,
		payment: { amount: subtotal, currency, ...payment },
		...extra,
	};
};

const singleOrder = (seller, unitPrice, quantity = 1, opts = {}) =>
	makeOrder({ parts: [{ seller, items: [item(seller, unitPrice, quantity)] }], ...opts });

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

const group = (orders, sellers, extra = {}) =>
	groupPayableBySeller({ orders, sellers, alreadyPaidPairs: new Set(), rate: 0.05, ...extra });

const payableFor = (res, seller) => res.payable.find((e) => str(e.seller) === str(seller._id ?? seller));
const blockedFor = (res, seller) => res.blocked.find((b) => str(b.seller) === str(seller._id ?? seller));

// ---------------------------------------------------------------------------
describe("C — pays de reversement et type de vendeur", () => {
	test.each(["Sénégal", "Senegal", "SN", "sn", " SN "])("C19 %p → SN", (input) => {
		expect(resolvePayoutCountry(input)).toBe("SN");
	});

	test.each([
		["Cameroun", "CM"],
		["Cameroon", "CM"],
		["Niger", "NE"], // via COUNTRY_CODE_TO_NAME (absent de COUNTRY_NAME_TO_CODE)
		["Tchad", "TD"], // idem
		["République centrafricaine", "CF"], // idem
		["Burkina Faso", "BF"],
		["Côte d'Ivoire", "CI"],
		["Bénin", "BJ"],
	])("C20 %p → %p", (input, code) => {
		expect(resolvePayoutCountry(input)).toBe(code);
	});

	test.each(["France", "Ghana", "Nigeria", "", null, undefined, "XX"])(
		"C21 %p → null (jamais le repli SN de getCountryCode)",
		(input) => {
			expect(resolvePayoutCountry(input)).toBeNull();
		},
	);

	test("C22 payoutSellerType : producer, restaurateur, sinon other", () => {
		expect(payoutSellerType("producer")).toBe("producer");
		expect(payoutSellerType("restaurateur")).toBe("restaurateur");
		expect(payoutSellerType("transformer")).toBe("other");
		expect(payoutSellerType("exporter")).toBe("other");
		expect(payoutSellerType(undefined)).toBe("other");
	});
});

// ---------------------------------------------------------------------------
describe("D — encaissement et livraison", () => {
	test.each(["succeeded", "completed"])("D23 payment.status %p → encaissé", (status) => {
		expect(isCollectionSettled({ payment: { method: "mobile_money", status } })).toBe(true);
	});

	test.each(["pending", "processing", "failed", "refunded", "partially_refunded", "disputed"])(
		"D23 payment.status %p → non encaissé",
		(status) => {
			expect(isCollectionSettled({ payment: { method: "mobile_money", status } })).toBe(false);
		},
	);

	test("D23 paiement absent → non encaissé", () => {
		expect(isCollectionSettled({})).toBe(false);
		expect(isCollectionSettled({ payment: {} })).toBe(false);
	});

	// Contrat conservé (revue J80) : isCollectionSettled ne regarde que le
	// statut. La règle « espèces = completed uniquement » est appliquée par
	// groupPayableBySeller (motif cash_unverified, cas G49).
	test("D24 espèces : succeeded encaissé ; livrée mais pending non encaissée", () => {
		expect(isCollectionSettled({ status: "delivered", payment: { method: "cash", status: "succeeded" } })).toBe(true);
		expect(isCollectionSettled({ status: "delivered", payment: { method: "cash", status: "pending" } })).toBe(false);
	});

	test("D25 deux segments : A livré, B en transit", () => {
		const A = oid();
		const B = oid();
		const order = makeOrder({
			status: "in-transit",
			parts: [
				{ seller: A, status: "delivered", items: [item(A, 1000, 1)] },
				{ seller: B, status: "in-transit", items: [item(B, 1000, 1, "in-transit")] },
			],
		});
		expect(isSellerLineDelivered(order, A)).toBe(true);
		expect(isSellerLineDelivered(order, str(A))).toBe(true);
		expect(isSellerLineDelivered(order, B)).toBe(false);
		expect(isSellerLineDelivered(order, oid())).toBe(false);
	});

	test("D26 segment completed → livré ; commande annulée avec segment delivered → non", () => {
		const A = oid();
		const completed = makeOrder({ parts: [{ seller: A, status: "completed", items: [item(A, 1000, 1)] }], status: "completed" });
		expect(isSellerLineDelivered(completed, A)).toBe(true);

		for (const status of ["cancelled", "refunded", "disputed"]) {
			const excluded = makeOrder({ parts: [{ seller: A, status: "delivered", items: [item(A, 1000, 1)] }], status });
			expect(isSellerLineDelivered(excluded, A)).toBe(false);
		}
	});

	test("D27 sans segment : statut de la commande + items[].seller ou order.seller", () => {
		const A = oid();
		const B = oid();
		const delivered = makeOrder({ parts: [{ seller: A, items: [item(A, 1000, 1)] }], withSegments: false });
		expect(isSellerLineDelivered(delivered, A)).toBe(true);
		expect(isSellerLineDelivered(delivered, B)).toBe(false);

		const legacy = { _id: oid(), status: "completed", seller: B, items: [{ product: oid(), quantity: 1, unitPrice: 500, totalPrice: 500 }] };
		expect(isSellerLineDelivered(legacy, B)).toBe(true);

		const inTransit = makeOrder({ parts: [{ seller: A, items: [item(A, 1000, 1)] }], withSegments: false, status: "in-transit" });
		expect(isSellerLineDelivered(inTransit, A)).toBe(false);
	});
});

// ---------------------------------------------------------------------------
describe("E — assiette et commission", () => {
	test("E28 2×1500 + 1×999 = 3999, articles de B exclus, chaque article compté une fois", () => {
		const A = oid();
		const B = oid();
		const order = makeOrder({
			parts: [
				{ seller: A, items: [item(A, 1500, 2), item(A, 999, 1)] },
				{ seller: B, items: [item(B, 7000, 3)] },
			],
		});
		expect(sellerGrossForOrder(order, A)).toBe(3999);
		expect(sellerGrossForOrder(order, str(A))).toBe(3999);
		expect(sellerGrossForOrder(order, B)).toBe(21000);
	});

	test("E28 commande sans segment : items[].seller", () => {
		const A = oid();
		const order = makeOrder({ parts: [{ seller: A, items: [item(A, 1500, 2), item(A, 999, 1)] }], withSegments: false });
		expect(sellerGrossForOrder(order, A)).toBe(3999);
	});

	test.each(["cancelled", "rejected", "refunded", "disputed"])("E29 article %p exclu de l'assiette", (status) => {
		const A = oid();
		const order = makeOrder({ parts: [{ seller: A, items: [item(A, 1500, 2), item(A, 999, 1, status)] }] });
		expect(sellerGrossForOrder(order, A)).toBe(3000);
	});

	test("E30 livraison, taxes et coupon hors assiette", () => {
		const A = oid();
		const order = makeOrder({
			parts: [{ seller: A, items: [item(A, 2000, 2)] }],
			extra: { taxes: 360, discount: 500, couponCode: "PROMO", couponDiscount: 500, deliveryFee: 1500, total: 5360 },
		});
		order.segments[0].taxes = 360;
		order.segments[0].discount = 500;
		order.segments[0].total = 3860;
		expect(sellerGrossForOrder(order, A)).toBe(4000);
	});

	test("E31 10 000 à 5 % → commission 500, net 9 500", () => {
		expect(computePayoutLine({ gross: 10000, rate: 0.05 })).toEqual({ gross: 10000, commission: 500, net: 9500 });
	});

	test("E32 333 à 5 % → commission 17 (Math.round 16,65), net 316", () => {
		expect(computePayoutLine({ gross: 333, rate: 0.05 })).toEqual({ gross: 333, commission: 17, net: 316 });
	});

	test("E33 0 → zéros ; -1, NaN, 'abc' → TypeError", () => {
		expect(computePayoutLine({ gross: 0, rate: 0.05 })).toEqual({ gross: 0, commission: 0, net: 0 });
		for (const gross of [-1, NaN, "abc", Infinity]) {
			expect(() => computePayoutLine({ gross, rate: 0.05 })).toThrow(TypeError);
		}
	});

	test("E34 3 commandes à 333 → amount 948 (arrondi par ligne, pas sur le total)", () => {
		const seller = makeSeller();
		const orders = [1, 2, 3].map(() => singleOrder(seller._id, 333));
		const res = group(orders, [seller]);
		const entry = payableFor(res, seller);
		expect(entry).toBeDefined();
		expect(entry.lines).toHaveLength(3);
		expect(entry.grossAmount).toBe(999);
		expect(entry.commissionAmount).toBe(51);
		expect(entry.amount).toBe(948);
	});
});

// ---------------------------------------------------------------------------
// Aplatissement des contraintes (racine + $and) : le test vérifie leur
// présence, pas une forme exacte de requête.
const clausesOf = (query) =>
	Object.entries(query).flatMap(([key, value]) =>
		key === "$and" ? value.flatMap(clausesOf) : [{ [key]: value }],
	);

const sameIds = (a, b) => str(a) === str(b);

describe("F — requête des commandes payables", () => {
	test("F35 filtre de base : encaissée, non exclue, livrée (commande ou segment)", () => {
		const clauses = clausesOf(buildPayableOrdersQuery());

		const payment = clauses.find((c) => "payment.status" in c);
		expect(payment["payment.status"]).toEqual({ $in: ["succeeded", "completed"] });

		const status = clauses.find((c) => "status" in c && c.status.$nin);
		expect(status.status).toEqual({ $nin: ["cancelled", "refunded", "disputed"] });

		const delivered = clauses.find(
			(c) => Array.isArray(c.$or) && c.$or.some((b) => "segments.status" in b),
		);
		expect(delivered).toBeDefined();
		expect(delivered.$or).toEqual(
			expect.arrayContaining([
				{ status: { $in: ["delivered", "completed"] } },
				{ "segments.status": { $in: ["delivered", "completed"] } },
			]),
		);
	});

	test("F36 sellerId et since ajoutés sans écraser le filtre livré", () => {
		const sellerId = oid();
		const since = new Date("2026-11-01T00:00:00Z");
		const clauses = clausesOf(buildPayableOrdersQuery({ sellerId, since }));

		// le $or « livré » est toujours là
		expect(clauses.some((c) => Array.isArray(c.$or) && c.$or.some((b) => "segments.status" in b))).toBe(true);

		// contrainte vendeur : segments.seller / items.seller / seller
		const sellerClause = clauses.find(
			(c) => Array.isArray(c.$or) && c.$or.some((b) => "segments.seller" in b),
		);
		expect(sellerClause).toBeDefined();
		for (const path of ["segments.seller", "items.seller", "seller"]) {
			const branch = sellerClause.$or.find((b) => path in b);
			expect(branch).toBeDefined();
			expect(sameIds(branch[path], sellerId)).toBe(true);
		}

		const updated = clauses.find((c) => "updatedAt" in c);
		expect(updated.updatedAt.$gte).toEqual(since);
	});

	test("F36 sans sellerId ni since : aucune contrainte vendeur ni date", () => {
		const clauses = clausesOf(buildPayableOrdersQuery({}));
		expect(clauses.some((c) => "updatedAt" in c)).toBe(false);
		expect(clauses.some((c) => Array.isArray(c.$or) && c.$or.some((b) => "segments.seller" in b))).toBe(false);
	});

	test("F36 pureté : options non modifiées, deux appels égaux", () => {
		const opts = { sellerId: oid(), since: new Date("2026-11-01T00:00:00Z") };
		const snapshot = { sellerId: str(opts.sellerId), since: opts.since.toISOString(), keys: Object.keys(opts) };
		const first = buildPayableOrdersQuery(opts);
		const second = buildPayableOrdersQuery(opts);
		expect(second).toEqual(first);
		expect(first).not.toBe(second);
		expect({ sellerId: str(opts.sellerId), since: opts.since.toISOString(), keys: Object.keys(opts) }).toEqual(snapshot);
		// deux appels sans option ne partagent pas d'objet
		const a = buildPayableOrdersQuery();
		a.extra = 1;
		expect(buildPayableOrdersQuery().extra).toBeUndefined();
	});
});

// ---------------------------------------------------------------------------
describe("G — regroupement par vendeur", () => {
	test("G37 nominal : vendeur SN, Wave, numéro formaté AfriBaPay", () => {
		const seller = makeSeller();
		const order = singleOrder(seller._id, 5000, 2);
		const res = group([order], [seller]);

		expect(res.blocked).toEqual([]);
		expect(res.payable).toHaveLength(1);
		const entry = res.payable[0];
		expect(str(entry.seller)).toBe(str(seller._id));
		expect(entry).toMatchObject({
			sellerType: "producer",
			sellerUserType: "producer",
			country: "SN",
			currency: "XOF",
			operator: "wave",
			phone: "771234567",
			commissionRate: 0.05,
			grossAmount: 10000,
			commissionAmount: 500,
			amount: 9500,
		});
		expect(entry.lines).toHaveLength(1);
		expect(str(entry.lines[0].order)).toBe(str(order._id));
		expect(entry.lines[0]).toMatchObject({
			orderNumber: order.orderNumber,
			gross: 10000,
			commission: 500,
			net: 9500,
			settledBy: "mobile_money",
		});
	});

	test("G37 opérateur saisi par son nom (« Orange Money ») → code orange ; payoutAccount.phone prioritaire", () => {
		const seller = makeSeller({
			phone: "+221 70 000 00 00",
			payoutAccount: { operator: "Orange Money", phone: "+221 78 765 43 21" },
		});
		const res = group([singleOrder(seller._id, 1000)], [seller]);
		const entry = payableFor(res, seller);
		expect(entry.operator).toBe("orange");
		expect(entry.phone).toBe("787654321");
	});

	test("G38 multi-vendeurs : A (2 commandes), B (segment livré), C (segment en transit) ignoré", () => {
		const A = makeSeller();
		const B = makeSeller({ payoutAccount: { operator: "orange" }, phone: "+221 76 111 22 33" });
		const C = makeSeller({ phone: "+221 77 999 88 77" });
		const shared = makeOrder({
			parts: [
				{ seller: A._id, status: "delivered", items: [item(A._id, 1500, 2)] },
				{ seller: B._id, status: "delivered", items: [item(B._id, 4000, 1)] },
				{ seller: C._id, status: "in-transit", items: [item(C._id, 9000, 1, "in-transit")] },
			],
			status: "in-transit",
		});
		const onlyA = singleOrder(A._id, 10000);

		const res = group([shared, onlyA], [A, B, C]);

		const a = payableFor(res, A);
		expect(a.lines.map((l) => str(l.order)).sort()).toEqual([str(shared._id), str(onlyA._id)].sort());
		expect(a.grossAmount).toBe(13000);
		expect(a.commissionAmount).toBe(150 + 500);
		expect(a.amount).toBe(2850 + 9500);

		const b = payableFor(res, B);
		expect(b.operator).toBe("orange");
		expect(b.phone).toBe("761112233");
		expect(b.amount).toBe(3800);

		expect(payableFor(res, C)).toBeUndefined();
		expect(blockedFor(res, C)).toBeUndefined();
		expect(res.payable).toHaveLength(2);
	});

	test("G39 alreadyPaidPairs exclut la ligne ; vendeur absent des deux listes s'il ne reste rien", () => {
		const A = makeSeller();
		const B = makeSeller({ phone: "+221 77 222 33 44" });
		const a1 = singleOrder(A._id, 1000);
		const a2 = singleOrder(A._id, 2000);
		const b1 = singleOrder(B._id, 3000);

		const res = group([a1, a2, b1], [A, B], {
			alreadyPaidPairs: new Set([`${str(A._id)}:${str(a1._id)}`, `${str(B._id)}:${str(b1._id)}`]),
		});

		const a = payableFor(res, A);
		expect(a.lines.map((l) => str(l.order))).toEqual([str(a2._id)]);
		expect(a.amount).toBe(1900);
		expect(payableFor(res, B)).toBeUndefined();
		expect(blockedFor(res, B)).toBeUndefined();
	});

	const expectBlocked = (res, seller, reason, orders) => {
		expect(payableFor(res, seller)).toBeUndefined();
		const b = blockedFor(res, seller);
		expect(b).toBeDefined();
		expect(b.reason).toBe(reason);
		expect(b.orders.map(str).sort()).toEqual(orders.map((o) => str(o._id)).sort());
	};

	test("G40 vendeur en France → country_not_covered", () => {
		const seller = makeSeller({ country: "France", phone: "+33 6 12 34 56 78" });
		const order = singleOrder(seller._id, 1000);
		expectBlocked(group([order], [seller]), seller, "country_not_covered", [order]);
	});

	test("G40 vendeur en RDC (pays AfriBaPay sans devise de reversement XOF/XAF) → country_not_covered", () => {
		const seller = makeSeller({ country: "RDC", phone: "+243 812 345 678", payoutAccount: { operator: "mpesa" } });
		const order = singleOrder(seller._id, 1000, 1, { currency: "XAF" });
		expectBlocked(group([order], [seller]), seller, "country_not_covered", [order]);
	});

	test("G41 commande en XAF pour un vendeur SN → currency_mismatch", () => {
		const seller = makeSeller();
		const order = singleOrder(seller._id, 1000, 1, { currency: "XAF" });
		expectBlocked(group([order], [seller]), seller, "currency_mismatch", [order]);
	});

	test("G41 vendeur CM en XAF payable (contrôle positif)", () => {
		const seller = makeSeller({ country: "Cameroun", phone: "+237 6 77 12 34 56", payoutAccount: { operator: "mtn" } });
		const res = group([singleOrder(seller._id, 1000, 1, { currency: "XAF" })], [seller]);
		const entry = payableFor(res, seller);
		expect(entry).toMatchObject({ country: "CM", currency: "XAF", operator: "mtn", phone: "677123456" });
	});

	test("G41b commande sans devise → currency_mismatch (plus de repli XOF)", () => {
		const seller = makeSeller();
		const order = singleOrder(seller._id, 1000);
		delete order.currency;
		delete order.payment.currency;
		expectBlocked(group([order], [seller]), seller, "currency_mismatch", [order]);
	});

	describe("G49 espèces : seule la confirmation admin (completed) est payable", () => {
		test("cash + completed → payable, settledBy cash", () => {
			const seller = makeSeller();
			const order = singleOrder(seller._id, 1000, 1, { payment: { method: "cash", status: "completed" } });
			const res = group([order], [seller]);
			expect(res.blocked).toEqual([]);
			expect(payableFor(res, seller).lines[0].settledBy).toBe("cash");
		});

		test("cash + succeeded (auto-confirmation acheteur) → cash_unverified", () => {
			const seller = makeSeller();
			const order = singleOrder(seller._id, 1000, 1, { payment: { method: "cash", status: "succeeded" } });
			expectBlocked(group([order], [seller]), seller, "cash_unverified", [order]);
		});

		test("mobile_money + succeeded et paypal + succeeded → payables", () => {
			const seller = makeSeller();
			const mm = singleOrder(seller._id, 1000, 1, { payment: { method: "mobile_money", status: "succeeded" } });
			const pp = singleOrder(seller._id, 2000, 1, { payment: { method: "paypal", status: "succeeded" } });
			const res = group([mm, pp], [seller]);
			expect(res.blocked).toEqual([]);
			expect(payableFor(res, seller).lines.map((l) => str(l.order)).sort()).toEqual([str(mm._id), str(pp._id)].sort());
		});

		test("mélange : la commande cash non vérifiée est bloquée, le reste payable", () => {
			const seller = makeSeller();
			const cash = singleOrder(seller._id, 1000, 1, { payment: { method: "cash", status: "succeeded" } });
			const mm = singleOrder(seller._id, 2000);
			const res = group([cash, mm], [seller]);
			const entry = payableFor(res, seller);
			expect(entry.lines.map((l) => str(l.order))).toEqual([str(mm._id)]);
			expect(entry.amount).toBe(1900);
			const b = res.blocked.find((x) => str(x.seller) === str(seller._id) && x.reason === "cash_unverified");
			expect(b).toBeDefined();
			expect(b.orders.map(str)).toEqual([str(cash._id)]);
		});
	});

	test("G42 aucun numéro → missing_phone", () => {
		const seller = makeSeller({ phone: undefined, payoutAccount: { operator: "wave" } });
		const order = singleOrder(seller._id, 1000);
		expectBlocked(group([order], [seller]), seller, "missing_phone", [order]);
	});

	test("G42 numéro ivoirien (+225 07…) pour un vendeur SN → invalid_phone", () => {
		const seller = makeSeller({ phone: "+225 07 11 22 33 44" });
		const order = singleOrder(seller._id, 1000);
		expectBlocked(group([order], [seller]), seller, "invalid_phone", [order]);
	});

	test("G43 aucun opérateur → missing_operator", () => {
		const seller = makeSeller({ payoutAccount: undefined });
		const order = singleOrder(seller._id, 1000);
		expectBlocked(group([order], [seller]), seller, "missing_operator", [order]);
	});

	test("G43 MTN au Sénégal (absent de COUNTRIES.SN) → operator_not_in_country", () => {
		const seller = makeSeller({ payoutAccount: { operator: "mtn" } });
		const order = singleOrder(seller._id, 1000);
		expectBlocked(group([order], [seller]), seller, "operator_not_in_country", [order]);
	});

	test("G44 compte inactif → seller_inactive ; compte de test → test_account", () => {
		const inactive = makeSeller({ isActive: false });
		const tester = makeSeller({ isTestAccount: true, phone: "+221 77 555 66 77" });
		const o1 = singleOrder(inactive._id, 1000);
		const o2 = singleOrder(tester._id, 1000);
		const res = group([o1, o2], [inactive, tester]);
		expectBlocked(res, inactive, "seller_inactive", [o1]);
		expectBlocked(res, tester, "test_account", [o2]);
	});

	test("G44b isApproved false → seller_not_approved ; isApproved absent → payable", () => {
		const pending = makeSeller({ isApproved: false });
		const legacy = makeSeller({ isApproved: undefined, phone: "+221 77 333 44 55" });
		const o1 = singleOrder(pending._id, 1000);
		const o2 = singleOrder(legacy._id, 1000);
		const res = group([o1, o2], [pending, legacy]);
		expectBlocked(res, pending, "seller_not_approved", [o1]);
		expect(payableFor(res, legacy)).toBeDefined();
	});

	test("G44b ordre des motifs : test_account et seller_inactive avant seller_not_approved", () => {
		const inactive = makeSeller({ isApproved: false, isActive: false });
		const tester = makeSeller({ isApproved: false, isTestAccount: true, phone: "+221 77 666 77 88" });
		const o1 = singleOrder(inactive._id, 1000);
		const o2 = singleOrder(tester._id, 1000);
		const res = group([o1, o2], [inactive, tester]);
		expectBlocked(res, inactive, "seller_inactive", [o1]);
		expectBlocked(res, tester, "test_account", [o2]);
	});

	test("G45 vendeur introuvable → seller_not_found", () => {
		const ghost = oid();
		const order = singleOrder(ghost, 1000);
		const res = group([order], []);
		expectBlocked(res, ghost, "seller_not_found", [order]);
	});

	test("G46 montant net nul → amount_zero", () => {
		const seller = makeSeller();
		const order = singleOrder(seller._id, 0);
		expectBlocked(group([order], [seller]), seller, "amount_zero", [order]);
	});

	test("G47 restaurateur → restaurateur ; transformer → other", () => {
		const resto = makeSeller({ userType: "restaurateur" });
		const transfo = makeSeller({ userType: "transformer", phone: "+221 77 444 55 66" });
		const res = group([singleOrder(resto._id, 1000), singleOrder(transfo._id, 1000)], [resto, transfo]);
		expect(payableFor(res, resto)).toMatchObject({ sellerType: "restaurateur", sellerUserType: "restaurateur" });
		expect(payableFor(res, transfo)).toMatchObject({ sellerType: "other", sellerUserType: "transformer" });
	});

	test("G48 buildPayoutDoc → document Payout valide, status pending", () => {
		const seller = makeSeller();
		// Espèces : seul « completed » (confirmation admin) est payable (revue J80).
		const orders = [singleOrder(seller._id, 333), singleOrder(seller._id, 10000, 1, { payment: { method: "cash", status: "completed" } })];
		const entry = payableFor(group(orders, [seller]), seller);
		const doc = buildPayoutDoc(entry);
		expect(doc.status).toBe("pending");
		const payout = new Payout(doc);
		expect(payout.validateSync()).toBeUndefined();
		expect(payout.amount).toBe(316 + 9500);
		expect(payout.lines.map((l) => l.settledBy).sort()).toEqual(["cash", "mobile_money"]);
	});
});

// ---------------------------------------------------------------------------
describe("H — listPayableSellers (lectures simulées)", () => {
	const USER_FIELDS = ["userType", "country", "phone", "payoutAccount", "isActive", "isApproved", "isTestAccount"];
	let seller;
	let order1;
	let order2;
	let orderFind;
	let userFind;
	let userSelect;
	let payoutFind;
	let payoutSelect;
	let existingPayouts;

	beforeEach(() => {
		seller = makeSeller();
		order1 = singleOrder(seller._id, 10000);
		order2 = singleOrder(seller._id, 2000);
		existingPayouts = [];

		orderFind = jest.spyOn(Order, "find").mockImplementation(() => ({
			lean: jest.fn().mockResolvedValue([order1, order2]),
		}));
		userSelect = jest.fn(() => ({ lean: jest.fn().mockResolvedValue([seller]) }));
		userFind = jest.spyOn(User, "find").mockImplementation(() => ({ select: userSelect }));
		payoutSelect = jest.fn(() => ({ lean: jest.fn().mockResolvedValue(existingPayouts) }));
		payoutFind = jest.spyOn(Payout, "find").mockImplementation(() => ({ select: payoutSelect }));
	});

	test("H49 lit commandes, vendeurs et reversements existants avec les bonnes requêtes", async () => {
		const opts = { sellerId: seller._id, since: new Date("2026-11-01T00:00:00Z") };
		const res = await listPayableSellers({ ...opts, rate: 0.05 });

		expect(orderFind).toHaveBeenCalledTimes(1);
		expect(orderFind.mock.calls[0][0]).toEqual(buildPayableOrdersQuery(opts));

		expect(userFind).toHaveBeenCalledTimes(1);
		const userFilter = userFind.mock.calls[0][0];
		expect(userFilter._id.$in.map(str)).toEqual([str(seller._id)]);
		// Comptes de test lus (pour « test_account ») : option includeTestAccounts.
		expect(userFind.mock.calls[0][2]).toEqual(expect.objectContaining({ includeTestAccounts: true }));
		// payoutAccount est select:false (revue J80) : « payoutAccount » ou
		// « +payoutAccount… » acceptés dans la projection.
		const selected = String(userSelect.mock.calls[0][0])
			.split(/\s+/)
			.map((f) => f.replace(/^\+/, "").split(".")[0]);
		expect(selected).toEqual(expect.arrayContaining(USER_FIELDS));

		expect(payoutFind).toHaveBeenCalledTimes(1);
		const payoutFilter = payoutFind.mock.calls[0][0];
		expect(payoutFilter.seller.$in.map(str)).toEqual([str(seller._id)]);
		expect(payoutFilter["lines.order"].$in.map(str).sort()).toEqual([str(order1._id), str(order2._id)].sort());
		expect(String(payoutSelect.mock.calls[0][0]).split(/\s+/)).toEqual(expect.arrayContaining(["seller", "lines.order"]));

		expect(res.blocked).toEqual([]);
		const entry = payableFor(res, seller);
		expect(entry.amount).toBe(9500 + 1900);
		expect(entry.commissionRate).toBe(0.05);
	});

	test("H49 taux par défaut = getCommissionRate() (HARVESTS_COMMISSION_RATE)", async () => {
		const saved = process.env.HARVESTS_COMMISSION_RATE;
		process.env.HARVESTS_COMMISSION_RATE = "0.08";
		try {
			const res = await listPayableSellers();
			const entry = payableFor(res, seller);
			expect(entry.commissionRate).toBe(0.08);
			expect(entry.commissionAmount).toBe(800 + 160);
		} finally {
			if (saved === undefined) delete process.env.HARVESTS_COMMISSION_RATE;
			else process.env.HARVESTS_COMMISSION_RATE = saved;
		}
	});

	test("H50 un Payout existant (même vendeur, même commande) exclut la commande", async () => {
		existingPayouts.push({ _id: oid(), seller: seller._id, lines: [{ order: order1._id }] });
		const res = await listPayableSellers({ rate: 0.05 });
		const entry = payableFor(res, seller);
		expect(entry.lines.map((l) => str(l.order))).toEqual([str(order2._id)]);
		expect(entry.amount).toBe(1900);
	});

	test("H51 taux explicite 0.1", async () => {
		const res = await listPayableSellers({ rate: 0.1 });
		const entry = payableFor(res, seller);
		expect(entry.commissionRate).toBe(0.1);
		expect(entry.commissionAmount).toBe(1000 + 200);
		expect(entry.amount).toBe(9000 + 1800);
	});

	test("H52 aucune commande → { payable: [], blocked: [] }, vendeurs non lus", async () => {
		orderFind.mockImplementation(() => ({ lean: jest.fn().mockResolvedValue([]) }));
		const res = await listPayableSellers({ rate: 0.05 });
		expect(res).toEqual({ payable: [], blocked: [] });
		expect(userFind).not.toHaveBeenCalled();
	});

	test("H53 aucune connexion Mongo ouverte", async () => {
		await listPayableSellers({ rate: 0.05 });
		expect(mongoose.connection.readyState).toBe(0);
	});
});
