// Tests de la vérification /status AfriBaPay (Jour 78) : lectures d'échec
// (2 consécutives avant failed définitif, CANCELLED immédiat), essais couverts
// (allPayinOrderIdsFor), test d'appartenance (payinOrderIdBelongsTo), requête
// des paiements anciens (buildStaleQuery pur). Tout sans base MongoDB — la
// recette bout en bout est prévue au Jour 86.
process.env.AFRIBAPAY_API_USER = "harvests-test-user";
process.env.AFRIBAPAY_API_KEY = "harvests-test-key-1234567890";
process.env.AFRIBAPAY_MERCHANT_KEY = "mk_test_dummy_key_12345678";

const {
	finalFailureReady,
	buildStaleQuery,
	STATUS_GIVE_UP_MS,
	STATUS_FINAL_FAILURE_READS,
} = require("../services/payment/paymentAfribapayStatusService");
const {
	payinOrderIdFor,
	payinReferenceFor,
	paymentIdFromPayinOrderId,
	allPayinOrderIdsFor,
	payinOrderIdBelongsTo,
} = require("../utils/payinOrderId");
const { retryAfribapayPayin } = require("../services/payment/paymentAfribapayService");

afterAll(() => {
	delete process.env.AFRIBAPAY_API_USER;
	delete process.env.AFRIBAPAY_API_KEY;
	delete process.env.AFRIBAPAY_MERCHANT_KEY;
});

describe("lectures d'échec consécutives (finalFailureReady)", () => {
	test("1re lecture FAILED/EXPIRED/REJECTED : pas d'écriture (peut être transitoire)", () => {
		for (const status of ["FAILED", "EXPIRED", "REJECTED", "failed"]) {
			const { write, count } = finalFailureReady(status, 0);
			expect(write).toBe(false);
			expect(count).toBe(1);
		}
	});

	test("2e lecture consécutive : écriture finale", () => {
		const { write, count } = finalFailureReady("FAILED", 1);
		expect(write).toBe(true);
		expect(count).toBe(STATUS_FINAL_FAILURE_READS);
	});

	test("CANCELLED : définitif dès la première lecture (annulation explicite)", () => {
		const immediate = finalFailureReady("CANCELLED", 0);
		const again = finalFailureReady("CANCELLED", 5);
		expect(immediate.write).toBe(true);
		expect(again.write).toBe(true);
	});

	test("statut non final (PENDING, vide, inconnu) : pas de compteur", () => {
		expect(finalFailureReady("PENDING", 1)).toEqual({ write: false, count: 0 });
		expect(finalFailureReady("", 1)).toEqual({ write: false, count: 0 });
		expect(finalFailureReady("SUCCESS", 1)).toEqual({ write: false, count: 0 });
	});

	test("capitalisation déconcertante du statut gérée", () => {
		expect(finalFailureReady("cancelled", 3).write).toBe(true);
		expect(finalFailureReady("Expired", 0).count).toBe(1);
	});
});

describe("essais couverts par un paiement (allPayinOrderIdsFor)", () => {
	const paymentId = "682f1a2b3c4d5e6f7a8b9c0d";

	test("rejet sur /status?order_id= : le 2e essai d'une relance est aussi interrogé", () => {
		expect(payinReferenceFor(paymentId)).toBe(`R${paymentId}`);
		expect(allPayinOrderIdsFor(`R${paymentId}`, 1)).toEqual([`R${paymentId}`]);
		expect(allPayinOrderIdsFor(`R${paymentId}`, 3)).toEqual([
			`R${paymentId}`,
			`R${paymentId}-p2`,
			`R${paymentId}-p3`,
		]);
	});

	test("limité à 20 essais sans jamais produire de suffixe aberrant", () => {
		const ids = allPayinOrderIdsFor(payinReferenceFor(paymentId), 99);
		expect(ids).toHaveLength(20);
		expect(ids[19]).toBe(`R${paymentId}-p20`);
	});

	test("test d'appartenance : order_id des nôtres accepté, ID d'une autre transaction refusé", () => {
		expect(payinOrderIdBelongsTo(`R${paymentId}`, paymentId)).toBe(true);
		expect(payinOrderIdBelongsTo(`R${paymentId}-p2`, paymentId)).toBe(true);
		expect(paymentIdFromPayinOrderId(`R${paymentId}-p2`)).toBe(paymentId);
		expect(payinOrderIdBelongsTo("R682f0000000000000000000z", paymentId)).toBe(false);
		expect(payinOrderIdBelongsTo("", paymentId)).toBe(false);
		expect(payinOrderIdBelongsTo(`R${paymentId}`, "")).toBe(false);
	});
});

describe("requête des paiements à resynchroniser au-delà de la fenêtre rapide (buildStaleQuery)", () => {
	test("mobile_money en attente, plus vieux que maxAge, non relus depuis staleRecheck", () => {
		const now = Date.parse("2026-11-10T09:00:00Z");
		const query = buildStaleQuery(now);
		expect(query.method).toBe("mobile_money");
		expect(query.status.$in).toContain("processing");
		expect(query.status.$in).toContain("requires_action");
		expect(query.status.$in).not.toContain("succeeded");
		expect(query.createdAt.$lt).toEqual(new Date(now - 60 * 60 * 1000)); // maxAge 1h
		// Revérifiés au plus tôt staleRecheck avec le journal du dernier passage
		expect(query.$or).toEqual(
			expect.arrayContaining([
				{ "paymentDetails.afribapay.lastPolledAt": { $exists: false } },
				{ "paymentDetails.afribapay.lastPolledAt": { $lte: new Date(now - 60 * 60 * 1000) } },
			]),
		);
	});

	test("STATUS_GIVE_UP_MS : 24 heures", () => {
		expect(STATUS_GIVE_UP_MS).toBe(24 * 60 * 60 * 1000);
	});
});

describe("relance du payin (retryAfribapayPayin)", () => {
	test("payin déjà confirmé : relance interdite (jamais de double encaissement)", async () => {
		const payment = {
			status: "succeeded",
			paymentDetails: { afribapay: { attempt: 1 } },
		};
		await expect(
			retryAfribapayPayin({ payment, amount: 100, currency: "XOF" }),
		).rejects.toMatchObject({ i18nKey: "payment.afribapay_confirmed" });
	});
});
