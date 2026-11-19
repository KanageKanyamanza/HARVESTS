// Correctifs Jour 79 (revue « À CORRIGER ») : réutilisation du Payment mobile
// money à la relance, statut après un échec du payin selon qu'AfriBaPay a
// répondu ou non, message AfriBaPay transmis au client (i18nKey + reason),
// relance depuis la page d'attente (paymentController.retryAfribapayPayment).
// Aucune base, aucun appel AfriBaPay : axios.post et les modèles sont espionnés,
// le jeton et le retry du client AfriBaPay sont neutralisés.
process.env.AFRIBAPAY_MERCHANT_KEY = "mk_test_dummy_key_12345678";
process.env.AFRIBAPAY_API_USER = "harvests-test-user";
process.env.AFRIBAPAY_API_KEY = "harvests-test-key-1234567890";

// Fonctions simples (pas jest.fn) : resetMocks réinitialiserait leur implémentation.
jest.mock("../utils/afribapayClient", () => {
	const actual = jest.requireActual("../utils/afribapayClient");
	return {
		...actual,
		getAccessToken: async () => "test-token",
		withRetry: (fn) => fn(),
	};
});

const mongoose = require("mongoose");
const axios = require("axios");
const Payment = require("../models/Payment");
const Order = require("../models/Order");
const paymentService = require("../services/payment/paymentService");
const paymentAfribapayService = require("../services/payment/paymentAfribapayService");
const paymentController = require("../controllers/payment/paymentController");

afterAll(() => {
	delete process.env.AFRIBAPAY_MERCHANT_KEY;
	delete process.env.AFRIBAPAY_API_USER;
	delete process.env.AFRIBAPAY_API_KEY;
});

const oid = () => new mongoose.Types.ObjectId();
const PROVIDER_REASON = "This phone number is unavailable for testing purposes";

const userId = oid();
const orderId = oid();

const makeOrder = (overrides = {}) => ({
	_id: orderId,
	buyer: userId,
	total: 7000,
	currency: "XOF",
	status: "pending",
	payment: { method: "mobile_money", status: "pending" },
	...overrides,
});

// Payment réel en mémoire, save() simulé.
const makePayment = ({ status = "pending", amount = 7000, afribapay } = {}) => {
	const payment = new Payment({
		paymentId: oid().toString(),
		order: orderId,
		user: userId,
		amount,
		currency: "XOF",
		method: "mobile_money",
		provider: "afribapay",
		type: "order",
		status,
		...(afribapay ? { paymentDetails: { afribapay } } : {}),
	});
	jest.spyOn(payment, "save").mockResolvedValue(payment);
	return payment;
};

const providerRejection = () =>
	Object.assign(new Error("Request failed with status code 400"), {
		response: { status: 400, data: { error: { message: PROVIDER_REASON } } },
	});
const networkError = () => Object.assign(new Error("socket hang up"), { code: "ECONNRESET" });

const MOBILE_MONEY = { operator: "wave", phone: "+221771234567", country: "SN" };
const initiate = () =>
	paymentService.initiateOrderPayment(userId.toString(), orderId, {
		method: "mobile_money",
		returnUrl: "https://www.harvests.site/payment/success",
		cancelUrl: "https://www.harvests.site/payment/cancel",
		mobileMoney: MOBILE_MONEY,
	});

// ---------------------------------------------------------------------------
describe("initiateOrderPayment mobile money — réutilisation du Payment (1a–1c)", () => {
	let findOne;
	let sort;
	let create;
	let requestPayin;
	let post;
	let reusable;

	beforeEach(() => {
		reusable = null;
		jest.spyOn(Order, "findById").mockResolvedValue(makeOrder());
		sort = jest.fn(() => Promise.resolve(reusable));
		findOne = jest.spyOn(Payment, "findOne").mockImplementation(() => ({ sort }));
		create = jest.spyOn(Payment, "create").mockImplementation(async () => makePayment());
		requestPayin = jest.spyOn(paymentAfribapayService, "requestPayin").mockImplementation(async ({ payment }) => {
			payment.status = "processing";
			payment.paymentDetails.afribapay = {
				...(payment.paymentDetails.afribapay || {}),
				payinOrderId: `R${payment.paymentId}-p9`,
				attempt: 9,
			};
			return {};
		});
		post = jest.spyOn(axios, "post").mockRejectedValue(new Error("axios ne doit pas être appelé"));
	});

	test.each([
		["processing", { payinOrderId: "Rabc", attempt: 1 }],
		["pending", { payinOrderId: "Rabc", attempt: 1 }],
	])("1a Payment %p avec payinOrderId → aucun appel AfriBaPay, Payment renvoyé tel quel", async (status, afribapay) => {
		reusable = makePayment({ status, afribapay });
		const before = { paymentId: reusable.paymentId, payinOrderId: reusable.paymentDetails.afribapay.payinOrderId };

		const { payment, paymentResponse } = await initiate();

		expect(requestPayin).not.toHaveBeenCalled();
		expect(post).not.toHaveBeenCalled();
		expect(create).not.toHaveBeenCalled();
		expect(payment).toBe(reusable);
		expect(payment.paymentId).toBe(before.paymentId);
		expect(payment.paymentDetails.afribapay.payinOrderId).toBe(before.payinOrderId);
		expect(payment.status).toBe(status);
		expect(paymentResponse.requiresOnlineAction).toBe(true);
	});

	test.each([
		["failed", { payinOrderId: "Rabc", attempt: 1, failedReadCount: 2 }],
		["cancelled", { payinOrderId: "Rabc", attempt: 1, failedReadCount: 1 }],
		["pending", { failedReadCount: 3 }],
	])("1b Payment %p → nouveau payin, failedReadCount remis à 0 et montant resynchronisé avant l'envoi", async (status, afribapay) => {
		reusable = makePayment({ status, amount: 5000, afribapay });
		let seen;
		requestPayin.mockImplementation(async (params) => {
			seen = {
				failedReadCount: params.payment.paymentDetails.afribapay?.failedReadCount,
				amount: params.payment.amount,
				paramAmount: params.amount,
			};
			params.payment.status = "processing";
			return {};
		});

		const { payment } = await initiate();

		expect(requestPayin).toHaveBeenCalledTimes(1);
		expect(requestPayin.mock.calls[0][0].payment).toBe(reusable);
		expect(create).not.toHaveBeenCalled();
		expect(payment).toBe(reusable);
		expect(seen.failedReadCount).toBe(0);
		expect(seen.amount).toBe(7000);
		expect(seen.paramAmount).toBe(7000);
	});

	test("1c la réutilisation est limitée à l'acheteur (filtre user) et aux Payments mobile money", async () => {
		await initiate();
		const filter = findOne.mock.calls[0][0];
		expect(String(filter.user)).toBe(userId.toString());
		expect(String(filter.order)).toBe(orderId.toString());
		expect(filter.method).toBe("mobile_money");
	});
});

// ---------------------------------------------------------------------------
describe("initiateOrderPayment mobile money — échec du payin (1d)", () => {
	let payment;
	let requestPayin;

	beforeEach(() => {
		payment = makePayment();
		jest.spyOn(Order, "findById").mockResolvedValue(makeOrder());
		jest.spyOn(Payment, "findOne").mockImplementation(() => ({ sort: () => Promise.resolve(null) }));
		jest.spyOn(Payment, "create").mockResolvedValue(payment);
		requestPayin = jest.spyOn(paymentAfribapayService, "requestPayin");
	});

	test("AfriBaPay a répondu (refus) → Payment failed sauvegardé, erreur relancée", async () => {
		const error = providerRejection();
		requestPayin.mockRejectedValue(error);
		await expect(initiate()).rejects.toBe(error);
		expect(payment.status).toBe("failed");
		expect(payment.save).toHaveBeenCalled();
	});

	test("sans réponse (réseau / timeout) → Payment reste pending (relu par la réconciliation), sauvegardé, erreur relancée", async () => {
		const error = networkError();
		requestPayin.mockRejectedValue(error);
		await expect(initiate()).rejects.toBe(error);
		expect(payment.status).toBe("pending");
		expect(payment.save).toHaveBeenCalled();
	});

	test("relance depuis un Payment failed + erreur réseau → pending, payinOrderId R<id>-p2 ; l'initiate suivant n'appelle plus AfriBaPay", async () => {
		requestPayin.mockRestore();
		const post = jest.spyOn(axios, "post").mockRejectedValue(networkError());
		const reused = makePayment({ status: "failed", afribapay: { payinOrderId: "Rold", attempt: 1, failedReadCount: 1 } });
		Payment.findOne.mockImplementation(() => ({ sort: () => Promise.resolve(reused) }));

		const error = await initiate().catch((e) => e);
		expect(error).toBeInstanceOf(Error);
		expect(error.friendlyMessage).toBeTruthy();
		expect(reused.status).toBe("pending");
		expect(reused.paymentDetails.afribapay.attempt).toBe(2);
		expect(reused.paymentDetails.afribapay.payinOrderId).toBe(`R${reused.paymentId}-p2`);
		expect(reused.paymentDetails.afribapay.processorStatus).not.toBe("FAILED");
		expect(reused.save).toHaveBeenCalled();

		// Idempotence (règle 1a) : pending + payinOrderId → rien n'est renvoyé.
		post.mockClear();
		const again = await initiate();
		expect(post).not.toHaveBeenCalled();
		expect(again.payment).toBe(reused);
		expect(again.payment.paymentDetails.afribapay.payinOrderId).toBe(`R${reused.paymentId}-p2`);
	});
});

// ---------------------------------------------------------------------------
describe("requestPayin — essai et message après un échec (2)", () => {
	let post;

	beforeEach(() => {
		post = jest.spyOn(axios, "post");
	});

	const send = (payment) =>
		paymentAfribapayService.requestPayin({
			payment,
			amount: 7000,
			currency: "XOF",
			operator: "wave",
			phone: "+221771234567",
			country: "SN",
			returnUrl: "https://www.harvests.site/payment/success",
			cancelUrl: "https://www.harvests.site/payment/cancel",
		});

	test("refus AfriBaPay : essai consommé (attempt + 1, payinOrderId posé)", async () => {
		post.mockRejectedValue(providerRejection());
		const payment = makePayment({ afribapay: { payinOrderId: "Rold", attempt: 1 } });
		await expect(send(payment)).rejects.toBeDefined();
		expect(payment.paymentDetails.afribapay.attempt).toBe(2);
		expect(payment.paymentDetails.afribapay.payinOrderId).toBe(`R${payment.paymentId}-p2`);
	});

	test("refus AfriBaPay : i18nKey payment.afribapay_payin_rejected + params.reason, raison brute dans attempts", async () => {
		post.mockRejectedValue(providerRejection());
		const payment = makePayment();
		const error = await send(payment).catch((e) => e);
		expect(error.i18nKey).toBe("payment.afribapay_payin_rejected");
		expect(error.params).toEqual({ reason: PROVIDER_REASON });
		const last = payment.attempts[payment.attempts.length - 1];
		expect(last.status).toBe("failed");
		expect(last.errorMessage).toBe(PROVIDER_REASON);
		expect(last.errorCode).toBe("400");
	});

	// Contrat révisé (2e revue J79) : sans réponse, l'essai a pu être reçu par
	// AfriBaPay → il est consommé (attempt / payinOrderId de l'envoi) pour que
	// la réconciliation relise CET order_id ; pas de processorStatus FAILED.
	test("erreur réseau : essai consommé (attempt + 1, payinOrderId envoyé), pas FAILED, friendlyMessage conservé", async () => {
		post.mockRejectedValue(networkError());
		const payment = makePayment({ status: "failed", afribapay: { payinOrderId: "Rold", attempt: 1 } });
		const error = await send(payment).catch((e) => e);
		expect(payment.paymentDetails.afribapay.attempt).toBe(2);
		expect(payment.paymentDetails.afribapay.payinOrderId).toBe(`R${payment.paymentId}-p2`);
		expect(payment.paymentDetails.afribapay.processorStatus).not.toBe("FAILED");
		expect(error.friendlyMessage).toBeTruthy();
		expect(error.i18nKey).not.toBe("payment.afribapay_payin_rejected");
		expect(payment.attempts[payment.attempts.length - 1].errorCode).toBe("network");
	});
});

// ---------------------------------------------------------------------------
describe("paymentController.retryAfribapayPayment — statut après échec (4)", () => {
	let payment;
	let post;

	beforeEach(() => {
		payment = makePayment({
			status: "pending",
			afribapay: { payinOrderId: "Rold", attempt: 1, operator: "wave", phone: "771234567", country: "SN" },
		});
		jest.spyOn(paymentService, "getPaymentById").mockResolvedValue(payment);
		post = jest.spyOn(axios, "post");
	});

	// catchAsync ne renvoie pas la promesse : on attend next() (ou res.json).
	const callRetry = () =>
		new Promise((resolve) => {
			const res = {
				status: jest.fn(() => res),
				json: jest.fn((body) => resolve({ body })),
			};
			const req = { params: { id: payment.paymentId }, user: { id: userId.toString() }, body: {} };
			paymentController.retryAfribapayPayment(req, res, (err) => resolve({ err }));
		});

	test("AfriBaPay a répondu (refus) → Payment failed sauvegardé, erreur payment.afribapay_payin_rejected en 400", async () => {
		post.mockRejectedValue(providerRejection());
		const { err } = await callRetry();
		expect(err).toBeDefined();
		expect(err.statusCode).toBe(400);
		expect(err.message).toBe("payment.afribapay_payin_rejected");
		expect(payment.status).toBe("failed");
		expect(payment.save).toHaveBeenCalled();
	});

	test("sans réponse (réseau) depuis un Payment failed → pending sauvegardé, essai R<id>-p2 consommé, erreur transmise", async () => {
		payment.status = "failed";
		post.mockRejectedValue(networkError());
		const { err } = await callRetry();
		expect(err).toBeDefined();
		expect(payment.status).toBe("pending");
		expect(payment.paymentDetails.afribapay.attempt).toBe(2);
		expect(payment.paymentDetails.afribapay.payinOrderId).toBe(`R${payment.paymentId}-p2`);
		expect(payment.save).toHaveBeenCalled();
	});

	test("aucune connexion Mongo ouverte", () => {
		expect(mongoose.connection.readyState).toBe(0);
	});
});
