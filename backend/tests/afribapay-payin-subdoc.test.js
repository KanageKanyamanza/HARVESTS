// Non-régression « sous-document Mongoose » (2e revue Jour 79) : réécrire
// paymentDetails.afribapay avec `{ ...payment.paymentDetails.afribapay, … }`
// recopie les internes du sous-document ($__, _doc) et Mongoose garde les
// ANCIENNES valeurs. Les tests unitaires à base d'objets simples ne le voient
// pas : ici, uniquement de VRAIS documents Payment (new Payment), save()
// espionné, aucune base ni appel AfriBaPay.
//  B. code du Jour 79 : requestPayin, retryAfribapayPayin ;
//  C. code commité des Jours 77-78 : applyAfribapayPayinOutcome (webhook +
//     /status) et resynchronizePayin (journal /status, failedReadCount).
process.env.AFRIBAPAY_MERCHANT_KEY = "mk_test_dummy_key_12345678";
process.env.AFRIBAPAY_API_USER = "harvests-test-user";
process.env.AFRIBAPAY_API_KEY = "harvests-test-key-1234567890";

// Fonctions simples (pas jest.fn) : resetMocks réinitialiserait leur implémentation.
jest.mock("../utils/afribapayClient", () => {
	const actual = jest.requireActual("../utils/afribapayClient");
	return { ...actual, getAccessToken: async () => "test-token", withRetry: (fn) => fn() };
});
// Journal d'audit : écrirait en base (AuditLog) — neutralisé.
jest.mock("../utils/auditLogger", () => {
	const actual = jest.requireActual("../utils/auditLogger");
	return { ...actual, logAudit: () => {} };
});

const mongoose = require("mongoose");
const axios = require("axios");
const Payment = require("../models/Payment");
const { requestPayin, retryAfribapayPayin } = require("../services/payment/paymentAfribapayService");
const {
	afribapayWebhookDecision,
	applyAfribapayPayinOutcome,
} = require("../services/payment/paymentAfribapayWebhookService");
const { resynchronizePayin } = require("../services/payment/paymentAfribapayStatusService");

afterAll(() => {
	delete process.env.AFRIBAPAY_MERCHANT_KEY;
	delete process.env.AFRIBAPAY_API_USER;
	delete process.env.AFRIBAPAY_API_KEY;
});

const oid = () => new mongoose.Types.ObjectId();

// Payment mobile money en cours sur son 1er essai, tel que requestPayin le laisse.
const realPayment = ({ status = "processing", afribapay = {} } = {}) => {
	const paymentId = oid().toString();
	const payment = new Payment({
		paymentId,
		order: oid(),
		user: oid(),
		amount: 7000,
		currency: "XOF",
		method: "mobile_money",
		provider: "afribapay",
		type: "order",
		status,
		paymentDetails: {
			afribapay: {
				operator: "wave",
				phone: "771234567",
				country: "SN",
				payinOrderId: `R${paymentId}`,
				attempt: 1,
				transactionId: "TX-OLD",
				processorStatus: "PENDING",
				failedReadCount: 0,
				...afribapay,
			},
		},
	});
	jest.spyOn(payment, "save").mockResolvedValue(payment);
	return payment;
};

// Valeurs réellement portées par le document (ce que save() persisterait).
const stored = (payment) => payment.toObject().paymentDetails.afribapay;

const payinParams = (payment) => ({
	payment,
	amount: 7000,
	currency: "XOF",
	operator: "wave",
	phone: "+221771234567",
	country: "SN",
	returnUrl: "https://www.harvests.site/payment/success",
	cancelUrl: "https://www.harvests.site/payment/cancel",
});

// ---------------------------------------------------------------------------
describe("B — Jour 79 sur un vrai document Payment", () => {
	test("requestPayin refusé : attempt et payinOrderId de l'essai envoyé persistés", async () => {
		jest.spyOn(axios, "post").mockRejectedValue(
			Object.assign(new Error("Request failed with status code 400"), {
				response: { status: 400, data: { error: { message: "This phone number is unavailable for testing purposes" } } },
			}),
		);
		const payment = realPayment({ status: "failed" });
		await expect(requestPayin(payinParams(payment))).rejects.toBeDefined();
		expect(stored(payment).attempt).toBe(2);
		expect(stored(payment).payinOrderId).toBe(`R${payment.paymentId}-p2`);
		expect(stored(payment).operator).toBe("wave");
	});

	test("requestPayin accepté : essai, transactionId et statut AfriBaPay persistés", async () => {
		jest.spyOn(axios, "post").mockResolvedValue({ data: { data: { transaction_id: "TX-NEW", status: "PENDING" } } });
		const payment = realPayment({ status: "failed" });
		await requestPayin(payinParams(payment));
		expect(stored(payment).attempt).toBe(2);
		expect(stored(payment).payinOrderId).toBe(`R${payment.paymentId}-p2`);
		expect(stored(payment).transactionId).toBe("TX-NEW");
		expect(payment.status).toBe("processing");
	});

	test("retryAfribapayPayin : failedReadCount réellement remis à 0 avant l'envoi", async () => {
		const payment = realPayment({ status: "failed", afribapay: { failedReadCount: 2 } });
		let countAtSend;
		jest.spyOn(axios, "post").mockImplementation(async () => {
			countAtSend = stored(payment).failedReadCount;
			return { data: { data: { transaction_id: "TX-NEW", status: "PENDING" } } };
		});
		await retryAfribapayPayin(payinParams(payment));
		expect(countAtSend).toBe(0);
		expect(stored(payment).failedReadCount).toBe(0);
		expect(stored(payment).attempt).toBe(2);
	});
});

// ---------------------------------------------------------------------------
describe("C — code commité J77 : applyAfribapayPayinOutcome sur un vrai document", () => {
	const apply = (payment, { payinOrderId, rawStatus, data = {} }) =>
		applyAfribapayPayinOutcome({
			payment,
			decision: afribapayWebhookDecision({ payment, payinOrderId, rawStatus, mismatch: null }),
			payinOrderId,
			rawStatus,
			data,
			requestInfo: { source: "test" },
		});

	test("apply-succeeded : payinConfirmedOrderId, processorStatus et transactionId persistés", async () => {
		const payment = realPayment({ afribapay: { failedReadCount: 1 } });
		const payinOrderId = `R${payment.paymentId}`;
		const result = await apply(payment, { payinOrderId, rawStatus: "SUCCESS", data: { transaction_id: "TX-OK" } });
		expect(result.action).toBe("apply-succeeded");
		expect(payment.status).toBe("succeeded");
		expect(stored(payment).payinConfirmedOrderId).toBe(payinOrderId);
		expect(stored(payment).processorStatus).toBe("SUCCESS");
		expect(stored(payment).transactionId).toBe("TX-OK");
		expect(stored(payment).failedReadCount).toBe(0);
		// rien d'autre perdu
		expect(stored(payment).attempt).toBe(1);
		expect(stored(payment).operator).toBe("wave");
	});

	test("apply-succeeded puis échec tardif d'un essai remplacé : ignoré grâce à payinConfirmedOrderId", async () => {
		const payment = realPayment({ afribapay: { attempt: 2 } });
		payment.paymentDetails.afribapay.payinOrderId = `R${payment.paymentId}-p2`;
		await apply(payment, { payinOrderId: `R${payment.paymentId}-p2`, rawStatus: "SUCCESS" });
		const late = afribapayWebhookDecision({
			payment,
			payinOrderId: `R${payment.paymentId}`,
			rawStatus: "FAILED",
			mismatch: null,
		});
		expect(late.action).toBe("ignore");
	});

	test("apply-end : processorStatus FAILED et failedReadCount 0 persistés, payment failed", async () => {
		const payment = realPayment({ afribapay: { failedReadCount: 1 } });
		await apply(payment, { payinOrderId: `R${payment.paymentId}`, rawStatus: "FAILED" });
		expect(payment.status).toBe("failed");
		expect(stored(payment).processorStatus).toBe("FAILED");
		expect(stored(payment).failedReadCount).toBe(0);
		expect(stored(payment).payinOrderId).toBe(`R${payment.paymentId}`);
		expect(payment.save).toHaveBeenCalled();
	});
});

// ---------------------------------------------------------------------------
describe("C — code commité J78 : resynchronizePayin sur un vrai document", () => {
	const statusReply = (status, orderId) => ({ data: { data: { status, order_id: orderId, amount_total: 7000, currency: "XOF" } } });

	test("1re lecture FAILED : failedReadCount passe à 1, journal posé, essai/opérateur/téléphone conservés", async () => {
		const payment = realPayment();
		jest.spyOn(axios, "get").mockResolvedValue(statusReply("FAILED", `R${payment.paymentId}`));

		const outcome = await resynchronizePayin({ payment, token: "test-token" });

		expect(outcome).toBe("pending");
		expect(payment.save).toHaveBeenCalled();
		const afribapay = stored(payment);
		expect(afribapay.failedReadCount).toBe(1);
		expect(afribapay.lastPollResult).toBe("FAILED");
		expect(afribapay.lastPolledAt).toBeInstanceOf(Date);
		expect(afribapay.attempt).toBe(1);
		expect(afribapay.payinOrderId).toBe(`R${payment.paymentId}`);
		expect(afribapay.operator).toBe("wave");
		expect(afribapay.phone).toBe("771234567");
	});

	test("2e lecture FAILED consécutive : échec définitif écrit (failed)", async () => {
		const payment = realPayment({ afribapay: { failedReadCount: 1 } });
		jest.spyOn(axios, "get").mockResolvedValue(statusReply("FAILED", `R${payment.paymentId}`));
		const outcome = await resynchronizePayin({ payment, token: "test-token" });
		expect(outcome).toBe("failed");
		expect(payment.status).toBe("failed");
		expect(stored(payment).processorStatus).toBe("FAILED");
	});

	test("confirmation /status : succeeded avec payinConfirmedOrderId et journal persistés", async () => {
		const payment = realPayment();
		jest.spyOn(axios, "get").mockResolvedValue(statusReply("SUCCESS", `R${payment.paymentId}`));
		const outcome = await resynchronizePayin({ payment, token: "test-token" });
		expect(outcome).toBe("succeeded");
		expect(payment.status).toBe("succeeded");
		expect(stored(payment).payinConfirmedOrderId).toBe(`R${payment.paymentId}`);
		expect(stored(payment).lastPollResult).toBe("SUCCESS");
	});

	test("aucune connexion Mongo ouverte", () => {
		expect(mongoose.connection.readyState).toBe(0);
	});
});
