// Tests du modèle Payout et de la configuration des reversements (Jour 80).
// Aucune connexion Mongo : validateSync() uniquement (le .env local pointe sur
// la base de production).
const mongoose = require("mongoose");

// userProfileService charge excelSyncService (cron Google Sheets possible au
// chargement) : neutralisé pour le test d'anonymisation.
jest.mock("../services/excelSyncService", () => ({}));

const payoutConfig = require("../config/payout");
const {
	DEFAULT_COMMISSION_RATE,
	getCommissionRate,
	PAYOUT_STATUSES,
	PAYOUT_SELLER_TYPES,
	PAYOUT_CURRENCIES,
	COUNTRY_PAYOUT_CURRENCY,
	SETTLED_PAYMENT_STATUSES,
	DELIVERED_STATUSES,
	EXCLUDED_ORDER_STATUSES,
	EXCLUDED_ITEM_STATUSES,
} = payoutConfig;
const Payout = require("../models/Payout");
const User = require("../models/User");

const oid = () => new mongoose.Types.ObjectId();

// Reversement valide : 1 ligne de 10 000 XOF, commission 5 %.
const validPayout = (overrides = {}) => ({
	seller: oid(),
	sellerType: "producer",
	sellerUserType: "producer",
	lines: [
		{
			order: oid(),
			orderNumber: "HV-0001",
			gross: 10000,
			commission: 500,
			net: 9500,
			settledBy: "mobile_money",
		},
	],
	currency: "XOF",
	commissionRate: 0.05,
	grossAmount: 10000,
	commissionAmount: 500,
	amount: 9500,
	country: "SN",
	operator: "wave",
	phone: "771234567",
	...overrides,
});

const errorsOf = (data) => {
	const err = new Payout(data).validateSync();
	return err ? err.errors : null;
};

describe("config/payout — constantes et taux de commission", () => {
	test("A1 sans variable d'environnement → 5 %", () => {
		expect(DEFAULT_COMMISSION_RATE).toBe(0.05);
		expect(getCommissionRate({})).toBe(0.05);
	});

	test("A1 lit process.env par défaut", () => {
		const saved = process.env.HARVESTS_COMMISSION_RATE;
		try {
			delete process.env.HARVESTS_COMMISSION_RATE;
			expect(getCommissionRate()).toBe(0.05);
			process.env.HARVESTS_COMMISSION_RATE = "0.07";
			expect(getCommissionRate()).toBe(0.07);
		} finally {
			if (saved === undefined) delete process.env.HARVESTS_COMMISSION_RATE;
			else process.env.HARVESTS_COMMISSION_RATE = saved;
		}
	});

	test("A2 HARVESTS_COMMISSION_RATE=\"0.08\" → 0.08", () => {
		expect(getCommissionRate({ HARVESTS_COMMISSION_RATE: "0.08" })).toBe(0.08);
		expect(getCommissionRate({ HARVESTS_COMMISSION_RATE: "0" })).toBe(0);
	});

	test.each(["abc", "-0.1", "1", "1.5", ""])(
		"A3 valeur invalide %p → repli sur 0.05",
		(value) => {
			expect(getCommissionRate({ HARVESTS_COMMISSION_RATE: value })).toBe(0.05);
		},
	);

	test("A4 devise de reversement par pays : SN XOF, CM XAF, CD/GM/GN absents", () => {
		expect(COUNTRY_PAYOUT_CURRENCY.SN).toBe("XOF");
		expect(COUNTRY_PAYOUT_CURRENCY.CM).toBe("XAF");
		expect(COUNTRY_PAYOUT_CURRENCY.CD).toBeUndefined();
		expect(COUNTRY_PAYOUT_CURRENCY.GM).toBeUndefined();
		expect(COUNTRY_PAYOUT_CURRENCY.GN).toBeUndefined();
		for (const c of ["SN", "CI", "BF", "ML", "BJ", "TG", "NE", "GW"]) {
			expect(COUNTRY_PAYOUT_CURRENCY[c]).toBe("XOF");
		}
		for (const c of ["CM", "GA", "CG", "TD", "CF"]) {
			expect(COUNTRY_PAYOUT_CURRENCY[c]).toBe("XAF");
		}
	});

	test("A listes de statuts / types / devises", () => {
		expect(PAYOUT_STATUSES).toEqual([
			"pending",
			"processing",
			"succeeded",
			"failed",
			"ambiguous",
			"network_issue",
			"cancelled",
		]);
		expect(PAYOUT_SELLER_TYPES).toEqual(["producer", "restaurateur", "other"]);
		expect(PAYOUT_CURRENCIES).toEqual(["XOF", "XAF"]);
		expect(SETTLED_PAYMENT_STATUSES).toEqual(["succeeded", "completed"]);
		expect(DELIVERED_STATUSES).toEqual(["delivered", "completed"]);
		expect(EXCLUDED_ORDER_STATUSES).toEqual(["cancelled", "refunded", "disputed"]);
		expect(EXCLUDED_ITEM_STATUSES).toEqual(["cancelled", "rejected", "refunded", "disputed"]);
	});
});

describe("modèle Payout — validation (validateSync, sans base)", () => {
	test("B5 document valide : aucune erreur, status pending, frais à 0", () => {
		const doc = new Payout(validPayout());
		expect(doc.validateSync()).toBeUndefined();
		expect(doc.status).toBe("pending");
		expect(doc.fees.total).toBe(0);
		expect(doc.fees.fees).toBe(0);
		expect(doc.fees.taxes).toBe(0);
		expect(Payout.collection.collectionName).toBe("payouts");
		expect(Payout.schema.options.timestamps).toBeTruthy();
	});

	test.each(["seller", "sellerType", "currency", "commissionRate", "amount", "country", "operator", "phone"])(
		"B6 champ requis absent : %s",
		(field) => {
			const data = validPayout();
			delete data[field];
			const errors = errorsOf(data);
			expect(errors).not.toBeNull();
			expect(errors[field]).toBeDefined();
		},
	);

	test("B6 lignes absentes → erreur sur lines", () => {
		const data = validPayout();
		delete data.lines;
		const errors = errorsOf(data);
		expect(errors).not.toBeNull();
		expect(Object.keys(errors).some((k) => k.startsWith("lines"))).toBe(true);
	});

	test.each(["order", "gross", "commission", "net"])(
		"B6 champ requis de ligne absent : lines.0.%s",
		(field) => {
			const data = validPayout();
			delete data.lines[0][field];
			const errors = errorsOf(data);
			expect(errors).not.toBeNull();
			expect(errors[`lines.0.${field}`]).toBeDefined();
		},
	);

	test("B6 ligne : montants négatifs refusés, settledBy borné", () => {
		const neg = validPayout();
		neg.lines[0].gross = -1;
		expect(errorsOf(neg)?.["lines.0.gross"]).toBeDefined();

		const bad = validPayout();
		bad.lines[0].settledBy = "bitcoin";
		expect(errorsOf(bad)?.["lines.0.settledBy"]).toBeDefined();

		for (const settledBy of ["cash", "mobile_money", "paypal"]) {
			const ok = validPayout();
			ok.lines[0].settledBy = settledBy;
			expect(errorsOf(ok)).toBeNull();
		}
	});

	test("B7 amount décimal (1234.5) → erreur", () => {
		const data = validPayout({ amount: 1234.5 });
		data.lines[0].net = 1234.5;
		const errors = errorsOf(data);
		expect(errors?.amount).toBeDefined();
	});

	test.each([0, -5])("B8 amount %p → erreur", (amount) => {
		const errors = errorsOf(validPayout({ amount }));
		expect(errors?.amount).toBeDefined();
	});

	test("B9 status 'paid' refusé, les 7 statuts acceptés", () => {
		expect(errorsOf(validPayout({ status: "paid" }))?.status).toBeDefined();
		for (const status of [
			"pending",
			"processing",
			"succeeded",
			"failed",
			"ambiguous",
			"network_issue",
			"cancelled",
		]) {
			expect(errorsOf(validPayout({ status }))).toBeNull();
		}
	});

	test("B10 sellerType 'transformer' refusé", () => {
		expect(errorsOf(validPayout({ sellerType: "transformer" }))?.sellerType).toBeDefined();
		expect(errorsOf(validPayout({ sellerType: "restaurateur" }))).toBeNull();
		expect(errorsOf(validPayout({ sellerType: "other" }))).toBeNull();
	});

	test.each(["FR", "sn", "Sénégal"])("B11 country %p → erreur (code ISO couvert, en majuscules)", (country) => {
		expect(errorsOf(validPayout({ country }))?.country).toBeDefined();
	});

	test("B12 opérateur hors du pays refusé (mpesa en SN), orange en SN accepté", () => {
		expect(errorsOf(validPayout({ operator: "mpesa" }))?.operator).toBeDefined();
		expect(errorsOf(validPayout({ operator: "mtn" }))?.operator).toBeDefined();
		expect(errorsOf(validPayout({ operator: "orange" }))).toBeNull();
		// Même opérateur valide ailleurs : mtn au Cameroun (XAF)
		expect(errorsOf(validPayout({ country: "CM", currency: "XAF", operator: "mtn" }))).toBeNull();
	});

	test("B13 currency EUR refusée", () => {
		expect(errorsOf(validPayout({ currency: "EUR" }))?.currency).toBeDefined();
	});

	test("B14 lines vide → erreur ; même commande en double → erreur", () => {
		const empty = errorsOf(validPayout({ lines: [], grossAmount: 0, commissionAmount: 0 }));
		expect(empty).not.toBeNull();
		expect(Object.keys(empty).some((k) => k.startsWith("lines"))).toBe(true);

		const order = oid();
		const line = { order, orderNumber: "HV-1", gross: 10000, commission: 500, net: 9500 };
		const dup = errorsOf(
			validPayout({
				lines: [line, { ...line }],
				grossAmount: 20000,
				commissionAmount: 1000,
				amount: 19000,
			}),
		);
		expect(dup).not.toBeNull();
		expect(Object.keys(dup).some((k) => k.startsWith("lines"))).toBe(true);
	});

	test("B14 deux commandes distinctes acceptées", () => {
		const lines = [
			{ order: oid(), gross: 10000, commission: 500, net: 9500 },
			{ order: oid(), gross: 333, commission: 17, net: 316 },
		];
		expect(
			errorsOf(validPayout({ lines, grossAmount: 10333, commissionAmount: 517, amount: 9816 })),
		).toBeNull();
	});

	// L'erreur de cohérence peut être portée par le total ou par les lignes.
	const hasTotalsError = (errors, field) =>
		errors !== null && Object.keys(errors).some((k) => k === field || k.startsWith("lines"));

	test("B15 amount ≠ Σ net → erreur", () => {
		expect(hasTotalsError(errorsOf(validPayout({ amount: 9000 })), "amount")).toBe(true);
	});

	test("B15 grossAmount ≠ Σ gross → erreur", () => {
		expect(hasTotalsError(errorsOf(validPayout({ grossAmount: 9999 })), "grossAmount")).toBe(true);
	});

	test("B15 commissionAmount ≠ Σ commission → erreur", () => {
		expect(hasTotalsError(errorsOf(validPayout({ commissionAmount: 499 })), "commissionAmount")).toBe(true);
	});

	test.each([1, -0.01, 1.2])("B16 commissionRate %p → erreur", (commissionRate) => {
		expect(errorsOf(validPayout({ commissionRate }))?.commissionRate).toBeDefined();
	});

	test("B16 commissionRate 0 accepté", () => {
		expect(errorsOf(validPayout({ commissionRate: 0 }))).toBeNull();
	});

	test("B17 index : (seller, lines.order) unique, payoutOrderId unique sparse, status/createdAt, country/status", () => {
		const indexes = Payout.schema.indexes();
		const find = (fields) =>
			indexes.find(([f]) => JSON.stringify(f) === JSON.stringify(fields));

		const sellerOrder = find({ seller: 1, "lines.order": 1 });
		expect(sellerOrder).toBeDefined();
		expect(sellerOrder[1].unique).toBe(true);

		const payoutOrderId = find({ "afribapay.payoutOrderId": 1 });
		expect(payoutOrderId).toBeDefined();
		expect(payoutOrderId[1].unique).toBe(true);
		expect(payoutOrderId[1].sparse).toBe(true);

		expect(find({ status: 1, createdAt: -1 })).toBeDefined();
		expect(find({ country: 1, status: 1 })).toBeDefined();
	});

	test("B18 attempts[].sentAt daté par défaut, sous-document afribapay sans _id", () => {
		const doc = new Payout(
			validPayout({
				afribapay: { payoutOrderId: "PO-1", attempt: 1, processorStatus: "PENDING" },
				attempts: [{ attempt: 1, orderId: "PO-1", status: "pending" }],
			}),
		);
		expect(doc.validateSync()).toBeUndefined();
		expect(doc.attempts[0].sentAt).toBeInstanceOf(Date);
		expect(doc.afribapay.payoutOrderId).toBe("PO-1");
		expect(doc.afribapay._id).toBeUndefined();
		expect(doc.lines[0]._id).toBeUndefined();
	});
});

describe("User.payoutAccount (Jour 80)", () => {
	test("le schéma User déclare payoutAccount.operator / phone / updatedAt", () => {
		expect(User.schema.path("payoutAccount.operator")).toBeDefined();
		expect(User.schema.path("payoutAccount.phone")).toBeDefined();
		expect(User.schema.path("payoutAccount.updatedAt")).toBeDefined();
	});

	test("payoutAccount conservé sur le document mais retiré de toJSON (comme bankAccount)", () => {
		const user = new User({
			userType: "producer",
			email: "vendeur.test@example.com",
			firstName: "Awa",
			lastName: "Diop",
			country: "Sénégal",
			payoutAccount: { operator: "wave", phone: "771234567" },
		});
		expect(user.payoutAccount.operator).toBe("wave");
		expect(user.payoutAccount.phone).toBe("771234567");
		const json = user.toJSON();
		expect(json.payoutAccount).toBeUndefined();
		expect(json.bankAccount).toBeUndefined();
	});

	test.each(["operator", "phone", "updatedAt"])(
		"payoutAccount.%s est select:false (jamais lu sans demande explicite)",
		(sub) => {
			const path = User.schema.path(`payoutAccount.${sub}`);
			expect(path).toBeDefined();
			expect(path.options.select).toBe(false);
		},
	);

	test("suppression de compte : payoutAccount effacé comme bankAccount", async () => {
		const { anonymizeAndDeleteAccount } = require("../services/user/userProfileService");
		const Product = require("../models/Product");
		const user = new User({
			userType: "producer",
			email: "vendeur.supprime@example.com",
			firstName: "Awa",
			lastName: "Diop",
			country: "Sénégal",
			bankAccount: { accountName: "Awa Diop", accountNumber: "SN0001" },
			payoutAccount: { operator: "wave", phone: "771234567", updatedAt: new Date() },
		});
		const save = jest.spyOn(user, "save").mockResolvedValue(user);
		const findById = jest.spyOn(User, "findById").mockResolvedValue(user);
		const updateMany = jest.spyOn(Product, "updateMany").mockResolvedValue({ modifiedCount: 0 });

		await expect(anonymizeAndDeleteAccount(user._id)).resolves.toBe(true);

		expect(findById).toHaveBeenCalledTimes(1);
		expect(save).toHaveBeenCalledTimes(1);
		expect(updateMany).toHaveBeenCalledTimes(1);
		expect(user.bankAccount?.accountNumber).toBeUndefined();
		expect(user.payoutAccount?.operator).toBeUndefined();
		expect(user.payoutAccount?.phone).toBeUndefined();
	});

	test("aucune connexion Mongo ouverte par ces tests", () => {
		expect(mongoose.connection.readyState).toBe(0);
	});
});
