// Tests du payin AfriBaPay (Jour 76) : order_id par essai, payload /pay/payin,
// extension du modèle Payment (méthode mobile_money). Le webhook signé (J77),
// le /status (J78) et le parcours client (J79) sont couverts à leurs jours.
process.env.AFRIBAPAY_MERCHANT_KEY = "mk_test_dummy_key_12345678";
process.env.AFRIBAPAY_API_USER = "harvests-test-user";
process.env.AFRIBAPAY_API_KEY = "harvests-test-key-1234567890";

const {
	payinOrderIdFor,
	paymentIdFromPayinOrderId,
	payinAttemptNumber,
} = require("../utils/payinOrderId");
const { buildPayinData, AFRIBAPAY_WEBHOOK_PATH } = require("../services/payment/paymentAfribapayService");
const Payment = require("../models/Payment");

afterAll(() => {
	delete process.env.AFRIBAPAY_MERCHANT_KEY;
	delete process.env.AFRIBAPAY_API_USER;
	delete process.env.AFRIBAPAY_API_KEY;
});

describe("order_id des payins (porté d'AfricaSend)", () => {
	test("1er essai = identifiant brut, relances -p2, -p3", () => {
		expect(payinOrderIdFor("R50a1", 1)).toBe("R50a1");
		expect(payinOrderIdFor("R50a1", 2)).toBe("R50a1-p2");
		expect(payinOrderIdFor("R50a1", 3)).toBe("R50a1-p3");
	});

	test("aller-retour order_id → paymentId + numéro d'essai", () => {
		expect(paymentIdFromPayinOrderId("R50a1-p2")).toBe("R50a1");
		expect(payinAttemptNumber("R50a1-p2")).toBe(2);
		expect(paymentIdFromPayinOrderId("R50a1")).toBe("R50a1");
		expect(payinAttemptNumber("R50a1")).toBe(1);
	});
});

describe("buildPayinData (payload /pay/payin)", () => {
	const base = {
		paymentId: "682f1a2b3c4d5e6f7a8b9c0d",
		orderId: "682f1a2b3c4d5e6f7a8b9c0e",
		amount: 18500.4,
		currency: "XOF",
		operator: "Orange Money",
		phone: "+221771234567",
		returnUrl: "https://www.harvests.site/payment/success?paymentId=p1",
		cancelUrl: "https://www.harvests.site/payment/cancel?paymentId=p1",
	};

	test("champs obligatoires AfriBaPay : merchant_key, operator codé, téléphone formaté", () => {
		const data = buildPayinData(base);
		expect(data.merchant_key).toBe("mk_test_dummy_key_12345678");
		expect(data.operator).toBe("orange");
		expect(data.phone_number).toBe("771234567"); // indicatif 221 retiré
		expect(data.country).toBe("SN"); // défaut
		expect(data.currency).toBe("XOF");
		expect(data.lang).toBe("fr");
	});

	test("order_id dérivé du paiement et unique par essai", () => {
		const first = buildPayinData(base).order_id;
		const retry = buildPayinData({ ...base, attempt: 2 }).order_id;
		expect(first).toBe(`R${base.paymentId}`);
		expect(retry).toBe(`R${base.paymentId}-p2`);
		expect(retry).not.toBe(first); // AfriBaPay refuse la réutilisation
	});

	test("montant arrondi côté serveur, jamais la valeur du client", () => {
		expect(buildPayinData(base).amount).toBe(18500);
		expect(buildPayinData({ ...base, amount: "7499.99" }).amount).toBe(7500);
	});

	test("notify_url pointe le webhook (monté au J77) et retour/abandon conservés", () => {
		const data = buildPayinData(base);
		expect(AFRIBAPAY_WEBHOOK_PATH).toBe("/api/v1/payments/afribapay/webhook");
		expect(data.notify_url).toContain(AFRIBAPAY_WEBHOOK_PATH);
		expect(data.return_url).toContain("/payment/success");
		expect(data.cancel_url).toContain("/payment/cancel");
	});

	test("contexte interne paymentId/orderId pour filtrer le webhook", () => {
		const data = buildPayinData(base);
		expect(data.metadata).toEqual({
			source: "harvests",
			paymentId: base.paymentId,
			orderId: base.orderId,
		});
	});
});

describe("modèle Payment — méthode mobile_money", () => {
	const validBase = {
		paymentId: "682f1a2b3c4d5e6f7a8b9c11",
		user: "682f1a2b3c4d5e6f7a8b9c12",
		order: "682f1a2b3c4d5e6f7a8b9c13",
		amount: 18500,
		currency: "XOF",
		type: "order",
		method: "mobile_money",
	};

	test("mobile_money est accepté et provider défaut = afribapay", () => {
		const payment = new Payment(validBase);
		expect(payment.provider).toBe("afribapay");
		const errors = payment.validateSync();
		expect(errors).toBeUndefined();
	});

	test("cash et paypal gardent leur provider historique", () => {
		expect(new Payment({ ...validBase, method: "cash" }).provider).toBe("cash-on-delivery");
		expect(new Payment({ ...validBase, method: "paypal" }).provider).toBe("paypal");
	});

	test("une méthode inconnue reste rejetée (pas de wave/orange-money historiques)", () => {
		const payment = new Payment({ ...validBase, method: "wave" });
		const errors = payment.validateSync();
		expect(errors).toBeDefined();
		expect(errors.errors.method).toBeDefined();
	});

	test("les sous-champs AfriBaPay tiennent dans paymentDetails", () => {
		const payment = new Payment({
			...validBase,
			paymentDetails: {
				afribapay: {
					operator: "wave",
					phone: "771234567",
					country: "SN",
					payinOrderId: `R${validBase.paymentId}`,
					attempt: 1,
					transactionId: "AP_TX_1",
					processorStatus: "SUCCESS",
				},
			},
		});
		const errors = payment.validateSync();
		expect(errors).toBeUndefined();
		expect(payment.paymentDetails.afribapay.operator).toBe("wave");
	});
});
