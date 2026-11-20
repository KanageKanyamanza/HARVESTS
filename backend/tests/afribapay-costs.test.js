// Tests des frais réels AfriBaPay (Jour 84) : extraction des coûts
// (`fees`, `taxes`, `fees_taxes_ttc`), capture sur le Payment (payin), le
// Payout (reversement) et les remboursements, et agrégats du back-office.
// Aucune connexion MongoDB : validateSync() pour les schémas, documents
// factices ou vrais documents Payment (save espionné), dépendances injectées.
process.env.AFRIBAPAY_API_USER = "harvests-test-user";
process.env.AFRIBAPAY_API_KEY = "harvests-test-key-1234567890";
process.env.AFRIBAPAY_MERCHANT_KEY = "mk_test_dummy_key_12345678";

// Journal d'audit : écrirait en base (AuditLog) — neutralisé.
jest.mock("../utils/auditLogger", () => {
	const actual = jest.requireActual("../utils/auditLogger");
	return { ...actual, logAudit: () => {} };
});

// Envoi réel (`sendPayout` / `sendRefund`) : HTTP simulé et jeton fixe, pour
// exercer le câblage des coûts dans les vraies réponses d'AfriBaPay (les cas
// D1/E1 injectent `sendAttempt` et ne passent pas par cette lecture).
jest.mock("axios");
jest.mock("../utils/afribapayClient", () => {
	const actual = jest.requireActual("../utils/afribapayClient");
	return { ...actual, getAccessToken: jest.fn(async () => "T") };
});

const mongoose = require("mongoose");
const axios = require("axios");
const Payment = require("../models/Payment");
const Payout = require("../models/Payout");
const WebhookEvent = require("../models/WebhookEvent");
const { extractAfribapayCosts } = require("../utils/afribapayUtils");
const { capturedAfribapayCosts } = require("../models/afribapayCosts");
const {
	afribapayWebhookDecision,
	applyAfribapayPayinOutcome,
} = require("../services/payment/paymentAfribapayWebhookService");
const payoutService = require("../services/payment/paymentPayoutService");
const refundService = require("../services/payment/paymentRefundAfribapayService");
const refundWebhook = require("../services/payment/paymentRefundWebhookService");
const costsService = require("../services/payment/paymentCostsService");

afterAll(() => {
	delete process.env.AFRIBAPAY_API_USER;
	delete process.env.AFRIBAPAY_API_KEY;
	delete process.env.AFRIBAPAY_MERCHANT_KEY;
});

afterEach(() => {
	jest.restoreAllMocks();
	jest.clearAllMocks();
});

const oid = () => new mongoose.Types.ObjectId();

// ---------------------------------------------------------------------------
describe("A — extractAfribapayCosts (pur)", () => {
	test("A1 corps à plat : fees, taxes et total TTC", () => {
		expect(
			extractAfribapayCosts({ status: "SUCCESS", fees: 100, taxes: 18, fees_taxes_ttc: 118 }),
		).toEqual({ fees: 100, taxes: 18, total: 118 });
	});

	test("A2 corps sous .data", () => {
		expect(
			extractAfribapayCosts({ data: { fees: 250, taxes: 0, fees_taxes_ttc: 250 } }),
		).toEqual({ fees: 250, taxes: 0, total: 250 });
	});

	test("A3 corps sous .data.data (double enveloppe)", () => {
		expect(
			extractAfribapayCosts({ data: { data: { fees: 75, taxes: 5 } } }),
		).toEqual({ fees: 75, taxes: 5, total: 80 });
	});

	test("A4 chaîne avec préambule de debug PHP", () => {
		const body =
			'Array ( [operator] => wave ) {"data":{"status":"SUCCESS","fees":"125","taxes":"22,5"}}';
		expect(extractAfribapayCosts(body)).toEqual({ fees: 125, taxes: 22.5, total: 147.5 });
	});

	test("A5 chaînes avec espaces et virgule décimale", () => {
		expect(extractAfribapayCosts({ fees: "1 125,5", taxes: "18" })).toEqual({
			fees: 1125.5,
			taxes: 18,
			total: 1143.5,
		});
	});

	test("A6 aucun champ de coût : null (jamais des zéros inventés)", () => {
		expect(extractAfribapayCosts({ status: "SUCCESS", amount_total: 7000 })).toBeNull();
		expect(extractAfribapayCosts({})).toBeNull();
		expect(extractAfribapayCosts(null)).toBeNull();
		expect(extractAfribapayCosts(undefined)).toBeNull();
	});

	test("A7 seul fees présent : taxes 0 et total = fees", () => {
		expect(extractAfribapayCosts({ fees: 100 })).toEqual({ fees: 100, taxes: 0, total: 100 });
	});

	test("A8 fees_taxes_ttc nul ou absent : total = fees + taxes", () => {
		expect(extractAfribapayCosts({ fees: 100, taxes: 18, fees_taxes_ttc: 0 })).toEqual({
			fees: 100,
			taxes: 18,
			total: 118,
		});
		expect(extractAfribapayCosts({ fees: 100, taxes: 18 })).toEqual({
			fees: 100,
			taxes: 18,
			total: 118,
		});
	});

	test("A9 fees_taxes_ttc renseigné : il fait foi", () => {
		expect(
			extractAfribapayCosts({ fees: 100, taxes: 18, fees_taxes_ttc: 120 }),
		).toEqual({ fees: 100, taxes: 18, total: 120 });
	});

	test("A10 valeurs illisibles ou négatives ignorées", () => {
		expect(extractAfribapayCosts({ fees: "abc", taxes: null })).toBeNull();
		expect(extractAfribapayCosts({ fees: -5, taxes: 18 })).toEqual({
			fees: 0,
			taxes: 18,
			total: 18,
		});
	});

	test("A11 capturedAfribapayCosts horodate, et rend null sans coût", () => {
		const stamped = capturedAfribapayCosts({ fees: 10, taxes: 2 });
		expect(stamped).toMatchObject({ fees: 10, taxes: 2, total: 12 });
		expect(stamped.capturedAt).toBeInstanceOf(Date);
		expect(capturedAfribapayCosts({ status: "SUCCESS" })).toBeNull();
	});
});

// ---------------------------------------------------------------------------
describe("B — schémas : coûts portés par Payment et Payout", () => {
	test("B1 Payment.paymentDetails.afribapay.fees", () => {
		const payment = new Payment({
			paymentId: `pay_${oid()}`,
			user: oid(),
			order: oid(),
			amount: 7000,
			currency: "XOF",
			method: "mobile_money",
			provider: "afribapay",
			type: "order",
			status: "succeeded",
			paymentDetails: {
				afribapay: {
					operator: "wave",
					fees: { fees: 120, taxes: 18, total: 138, capturedAt: new Date() },
				},
			},
		});
		expect(payment.validateSync()).toBeUndefined();
		const stored = payment.toObject().paymentDetails.afribapay.fees;
		expect(stored).toMatchObject({ fees: 120, taxes: 18, total: 138 });
		expect(stored.capturedAt).toBeInstanceOf(Date);
	});

	test("B2 Payment.refunds[].fees", () => {
		const payment = new Payment({
			paymentId: `pay_${oid()}`,
			user: oid(),
			amount: 10000,
			currency: "XOF",
			method: "mobile_money",
			provider: "afribapay",
			type: "payment",
			order: oid(),
			status: "succeeded",
			refunds: [
				{
					refundId: "ref_afp_1",
					amount: 3000,
					status: "succeeded",
					fees: { fees: 30, taxes: 0, total: 30, capturedAt: new Date() },
				},
			],
		});
		expect(payment.validateSync()).toBeUndefined();
		expect(payment.toObject().refunds[0].fees).toMatchObject({ fees: 30, total: 30 });
	});

	test("B3 Payout.fees : défauts à 0 et capturedAt absent tant que rien n'est capturé", () => {
		const payout = new Payout({
			seller: oid(),
			sellerType: "producer",
			sellerUserType: "producer",
			lines: [
				{
					order: oid(),
					orderNumber: "HV-0001",
					gross: 10000,
					commission: 750,
					net: 9250,
					settledBy: "mobile_money",
				},
			],
			currency: "XOF",
			commissionRate: 0.075,
			grossAmount: 10000,
			commissionAmount: 750,
			amount: 9250,
			country: "SN",
			operator: "wave",
			phone: "771234567",
		});
		expect(payout.validateSync()).toBeUndefined();
		const stored = payout.toObject().fees;
		expect(stored).toMatchObject({ fees: 0, taxes: 0, total: 0 });
		expect(stored.capturedAt).toBeUndefined();
	});

	test("B4 Payout.fees accepte des coûts capturés", () => {
		const payout = new Payout({
			seller: oid(),
			sellerType: "producer",
			sellerUserType: "producer",
			lines: [
				{
					order: oid(),
					orderNumber: "HV-0001",
					gross: 10000,
					commission: 750,
					net: 9250,
					settledBy: "mobile_money",
				},
			],
			currency: "XOF",
			commissionRate: 0.075,
			grossAmount: 10000,
			commissionAmount: 750,
			amount: 9250,
			country: "SN",
			operator: "wave",
			phone: "771234567",
			fees: { fees: 50, taxes: 9, total: 59, capturedAt: new Date() },
		});
		expect(payout.validateSync()).toBeUndefined();
		expect(payout.toObject().fees).toMatchObject({ fees: 50, taxes: 9, total: 59 });
	});
});

// ---------------------------------------------------------------------------
describe("C — payin : coûts du corps de confirmation", () => {
	// Payment mobile money réel (sous-document Mongoose), save espionné.
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
					failedReadCount: 0,
					...afribapay,
				},
			},
		});
		jest.spyOn(payment, "save").mockResolvedValue(payment);
		return payment;
	};

	const apply = (payment, { payinOrderId, rawStatus, data = {} }) =>
		applyAfribapayPayinOutcome({
			payment,
			decision: afribapayWebhookDecision({ payment, payinOrderId, rawStatus, mismatch: null }),
			payinOrderId,
			rawStatus,
			data,
			requestInfo: { source: "test" },
		});

	const stored = (payment) => payment.toObject().paymentDetails.afribapay;

	test("C1 confirmation avec coûts : fees/taxes/total et capturedAt persistés", async () => {
		const payment = realPayment();
		await apply(payment, {
			payinOrderId: `R${payment.paymentId}`,
			rawStatus: "SUCCESS",
			data: { transaction_id: "TX-OK", fees: 120, taxes: 18, fees_taxes_ttc: 138 },
		});
		const fees = stored(payment).fees;
		expect(fees).toMatchObject({ fees: 120, taxes: 18, total: 138 });
		expect(fees.capturedAt).toBeInstanceOf(Date);
	});

	test("C2 confirmation sans coûts : aucun zéro inventé", async () => {
		const payment = realPayment();
		await apply(payment, {
			payinOrderId: `R${payment.paymentId}`,
			rawStatus: "SUCCESS",
			data: { transaction_id: "TX-OK" },
		});
		expect(stored(payment).fees).toBeUndefined();
	});

	test("C3 échec du payin : aucun coût enregistré", async () => {
		const payment = realPayment();
		await apply(payment, {
			payinOrderId: `R${payment.paymentId}`,
			rawStatus: "FAILED",
			data: { fees: 120, taxes: 18 },
		});
		expect(payment.status).toBe("failed");
		expect(stored(payment).fees).toBeUndefined();
	});

	test("C4 la capture ne casse pas les autres champs du sous-document", async () => {
		const payment = realPayment({ afribapay: { failedReadCount: 1 } });
		await apply(payment, {
			payinOrderId: `R${payment.paymentId}`,
			rawStatus: "SUCCESS",
			data: { transaction_id: "TX-OK", fees: 10, taxes: 0 },
		});
		expect(stored(payment)).toMatchObject({
			operator: "wave",
			phone: "771234567",
			attempt: 1,
			payinConfirmedOrderId: `R${payment.paymentId}`,
			processorStatus: "SUCCESS",
			failedReadCount: 0,
		});
	});
});

// ---------------------------------------------------------------------------
describe("D — reversement : coûts de l'envoi et du webhook", () => {
	const makePayout = (overrides = {}) => ({
		_id: oid(),
		seller: oid(),
		sellerType: "producer",
		sellerUserType: "producer",
		lines: [{ order: oid(), orderNumber: "HV-0001", gross: 10000, commission: 750, net: 9250 }],
		currency: "XOF",
		commissionRate: 0.075,
		grossAmount: 10000,
		commissionAmount: 750,
		amount: 9250,
		country: "SN",
		operator: "wave",
		phone: "771234567",
		status: "pending",
		attempts: [],
		afribapay: {},
		save: jest.fn(async function () {}),
		...overrides,
	});

	const effectDeps = () => ({
		save: jest.fn(async () => {}),
		notifySeller: jest.fn(async () => {}),
		alert: jest.fn(async () => {}),
		setOrderStates: jest.fn(async () => 0),
		audit: jest.fn(async () => {}),
	});

	const sent = () => ({
		orderId: `payout-${oid()}`,
		status: "succeeded",
		processorStatus: "SUCCESS",
		transactionId: "TX-P",
		error: null,
		sentAt: new Date(),
	});

	const execDeps = (sendResult) => ({
		token: "T",
		fetchBalance: jest.fn().mockResolvedValue({ available: 1_000_000, currency: "XOF" }),
		claimLock: jest.fn().mockImplementation(async (id) => makePayout({ _id: id })),
		sendAttempt: jest.fn().mockResolvedValue(sendResult),
	});

	test("D1 executePayout enregistre les coûts renvoyés par l'envoi", async () => {
		const payout = makePayout();
		await payoutService.executePayout(
			payout,
			execDeps({ ...sent(), costs: { fees: 45, taxes: 0, total: 45 } }),
		);
		expect(payout.fees).toMatchObject({ fees: 45, taxes: 0, total: 45 });
		expect(payout.fees.capturedAt).toBeInstanceOf(Date);
	});

	test("D2 executePayout sans coûts : rien d'inventé", async () => {
		const payout = makePayout();
		await payoutService.executePayout(payout, execDeps(sent()));
		expect(payout.fees).toBeUndefined();
	});

	test("D3 finalizePayoutOutcome enregistre les coûts du webhook", async () => {
		const payout = makePayout({ status: "processing" });
		await payoutService.finalizePayoutOutcome(
			payout,
			{
				status: "succeeded",
				orderId: `payout-${payout._id}`,
				processorStatus: "SUCCESS",
				costs: { fees: 60, taxes: 10, total: 70 },
			},
			effectDeps(),
		);
		expect(payout.fees).toMatchObject({ fees: 60, taxes: 10, total: 70 });
		expect(payout.fees.capturedAt).toBeInstanceOf(Date);
	});

	test("D4 un message sans coûts n'écrase pas un coût déjà capturé", async () => {
		const capturedAt = new Date("2026-11-18T08:00:00Z");
		const payout = makePayout({
			status: "processing",
			fees: { fees: 60, taxes: 10, total: 70, capturedAt },
		});
		await payoutService.finalizePayoutOutcome(
			payout,
			{ status: "succeeded", orderId: `payout-${payout._id}`, processorStatus: "SUCCESS" },
			effectDeps(),
		);
		expect(payout.fees).toMatchObject({ fees: 60, taxes: 10, total: 70 });
		expect(payout.fees.capturedAt).toBe(capturedAt);
	});

	test("D5 sendPayout lit les coûts de la vraie réponse d'envoi", async () => {
		axios.post.mockResolvedValue({
			data: {
				status: "SUCCESS",
				transaction_id: "AP_TX_C",
				fees: 45,
				taxes: 5,
				fees_taxes_ttc: 50,
			},
		});
		const result = await payoutService.sendPayout(makePayout(), { token: "T", attempt: 1 });
		expect(result.costs).toMatchObject({ fees: 45, taxes: 5, total: 50 });
		expect(result.costs.capturedAt).toBeInstanceOf(Date);
		// Le versement reste interprété comme avant : aucun effet de bord.
		expect(result.status).toBe("succeeded");
	});

	test("D6 sendPayout sans coûts dans la réponse : costs null", async () => {
		axios.post.mockResolvedValue({ data: { status: "SUCCESS", transaction_id: "AP_TX_D" } });
		const result = await payoutService.sendPayout(makePayout(), { token: "T", attempt: 1 });
		expect(result.costs).toBeNull();
	});
});

// ---------------------------------------------------------------------------
describe("E — remboursement : coûts du versement client", () => {
	const makePayment = (overrides = {}) => {
		const _id = oid();
		return Object.assign(
			{
				_id,
				paymentId: `pay_test_${_id}`,
				user: oid(),
				order: oid(),
				type: "payment",
				method: "mobile_money",
				status: "succeeded",
				amount: 10000,
				currency: "XOF",
				paidAt: new Date("2026-11-10T10:00:00Z"),
				refunds: [],
				refundAttempt: 0,
				save: jest.fn(async function () {}),
			},
			overrides,
		);
	};

	const makeRefund = (overrides = {}) => ({
		refundId: "ref_afp_1",
		amount: 10000,
		reason: "commande annulée",
		status: "pending",
		attempt: 1,
		orderId: "refund-pay_test_1",
		createdAt: new Date("2026-11-18T09:00:00Z"),
		...overrides,
	});

	const refundDeps = (costs) => ({
		save: jest.fn(async () => {}),
		notifyClient: jest.fn(async () => {}),
		alert: jest.fn(async () => {}),
		audit: jest.fn(async () => {}),
		sendAttempt: jest.fn(async (payment, { attempt }) => ({
			orderId: `refund-${payment.paymentId}${attempt > 1 ? `-r${attempt}` : ""}`,
			status: "succeeded",
			processorStatus: "SUCCESS",
			transactionId: "TX-RF-1",
			error: null,
			sentAt: new Date(),
			...(costs ? { costs } : {}),
		})),
	});

	test("E1 requestAfribapayRefund propage les coûts de l'envoi", async () => {
		const payment = makePayment();
		await refundService.requestAfribapayRefund(payment, {
			amount: 3000,
			...refundDeps({ fees: 30, taxes: 0, total: 30 }),
		});
		expect(payment.refunds[0].fees).toMatchObject({ fees: 30, taxes: 0, total: 30 });
		expect(payment.refunds[0].fees.capturedAt).toBeInstanceOf(Date);
	});

	test("E2 requestAfribapayRefund sans coûts : rien d'inventé", async () => {
		const payment = makePayment();
		await refundService.requestAfribapayRefund(payment, { amount: 3000, ...refundDeps() });
		expect(payment.refunds[0].fees).toBeUndefined();
	});

	test("E3 webhook de remboursement : coûts du corps notifiés", async () => {
		jest.spyOn(WebhookEvent, "claimEvent").mockResolvedValue(true);
		const payment = makePayment({ refunds: [makeRefund({ amount: 10000 })] });
		const result = await refundWebhook.processRefundWebhook({
			refundOrderId: `refund-${payment.paymentId}`,
			rawStatus: "SUCCESS",
			data: { transaction_id: "TX-W", fees: 12, taxes: 2, fees_taxes_ttc: 14 },
			deps: {
				findPayment: jest.fn(async () => payment),
				save: jest.fn(async () => {}),
				notifyClient: jest.fn(),
				alert: jest.fn(),
				audit: jest.fn(),
			},
		});
		expect(result.action).toBe("apply-succeeded");
		expect(payment.refunds[0].fees).toMatchObject({ fees: 12, taxes: 2, total: 14 });
	});

	test("E4 finalizeRefundOutcome écrit les coûts fournis", async () => {
		const payment = makePayment();
		const refund = makeRefund({ status: "pending" });
		payment.refunds.push(refund);
		await refundService.finalizeRefundOutcome(
			payment,
			{
				refundId: refund.refundId,
				orderId: refund.orderId,
				status: "succeeded",
				previousStatus: "pending",
				costs: { fees: 8, taxes: 0, total: 8 },
			},
			{ save: jest.fn(async () => {}), notifyClient: jest.fn(), alert: jest.fn(), audit: jest.fn() },
		);
		expect(refund.fees).toMatchObject({ fees: 8, taxes: 0, total: 8 });
		expect(refund.fees.capturedAt).toBeInstanceOf(Date);
	});

	test("E5 finalizeRefundOutcome sans coûts : coût déjà capturé conservé", async () => {
		const capturedAt = new Date("2026-11-18T07:00:00Z");
		const payment = makePayment();
		const refund = makeRefund({
			status: "pending",
			fees: { fees: 8, taxes: 0, total: 8, capturedAt },
		});
		payment.refunds.push(refund);
		await refundService.finalizeRefundOutcome(
			payment,
			{ refundId: refund.refundId, orderId: refund.orderId, status: "succeeded", previousStatus: "pending" },
			{ save: jest.fn(async () => {}), notifyClient: jest.fn(), alert: jest.fn(), audit: jest.fn() },
		);
		expect(refund.fees).toMatchObject({ fees: 8, total: 8 });
		expect(refund.fees.capturedAt).toBe(capturedAt);
	});

	test("E6 sendRefund lit les coûts de la vraie réponse d'envoi", async () => {
		axios.post.mockResolvedValue({
			data: { status: "SUCCESS", transaction_id: "TX-RF-C", fees: 8, taxes: 0 },
		});
		const result = await refundService.sendRefund(makePayment(), {
			amount: 3000,
			operator: "wave",
			phone: "771234567",
			country: "SN",
		});
		expect(result.status).toBe("succeeded");
		expect(result.costs).toMatchObject({ fees: 8, taxes: 0, total: 8 });
		expect(result.costs.capturedAt).toBeInstanceOf(Date);
	});

	test("E7 sendRefund sans coûts dans la réponse : costs null", async () => {
		axios.post.mockResolvedValue({ data: { status: "SUCCESS", transaction_id: "TX-RF-D" } });
		const result = await refundService.sendRefund(makePayment(), {
			amount: 3000,
			operator: "wave",
			phone: "771234567",
			country: "SN",
		});
		expect(result.costs).toBeNull();
	});
});

// ---------------------------------------------------------------------------
describe("F — back-office : agrégats des coûts réels", () => {
	const from = new Date("2026-11-01T00:00:00Z");
	const to = new Date("2026-12-01T00:00:00Z");

	test("F1 pipeline payin : seuls les payins confirmés dont le coût est capturé", () => {
		const [match, group] = costsService.buildPayinCostsPipeline({ from, to });
		expect(match.$match).toMatchObject({
			method: "mobile_money",
			status: { $in: ["succeeded", "refunded", "partially_refunded"] },
			paidAt: { $gte: from, $lte: to },
		});
		expect(match.$match["paymentDetails.afribapay.fees.capturedAt"]).toEqual({
			$exists: true,
			$ne: null,
		});
		expect(group.$group).toMatchObject({
			_id: "$currency",
			count: { $sum: 1 },
			fees: { $sum: "$paymentDetails.afribapay.fees.fees" },
			taxes: { $sum: "$paymentDetails.afribapay.fees.taxes" },
			total: { $sum: "$paymentDetails.afribapay.fees.total" },
		});
	});

	test("F2 pipeline payout : reversements confirmés et coût capturé", () => {
		const [match, group] = costsService.buildPayoutCostsPipeline({ from, to });
		expect(match.$match).toMatchObject({
			status: "succeeded",
			succeededAt: { $gte: from, $lte: to },
		});
		expect(match.$match["fees.capturedAt"]).toEqual({ $exists: true, $ne: null });
		expect(group.$group).toMatchObject({
			_id: "$currency",
			fees: { $sum: "$fees.fees" },
			total: { $sum: "$fees.total" },
		});
	});

	test("F3 pipeline remboursement : versements confirmés, déroulés depuis refunds[]", () => {
		const [unwind, match, group] = costsService.buildRefundCostsPipeline({ from, to });
		expect(unwind.$unwind).toBe("$refunds");
		expect(match.$match).toMatchObject({
			"refunds.status": "succeeded",
			"refunds.processedAt": { $gte: from, $lte: to },
		});
		expect(match.$match["refunds.fees.capturedAt"]).toEqual({ $exists: true, $ne: null });
		expect(group.$group).toMatchObject({
			_id: "$currency",
			total: { $sum: "$refunds.fees.total" },
		});
	});

	test("F4 résumé par devise, avec totaux et zéros", () => {
		const summary = costsService.summarizeProviderCosts({
			payinRows: [{ _id: "XOF", count: 2, fees: 130, taxes: 18, total: 148 }],
			payoutRows: [{ _id: "XOF", count: 1, fees: 45, taxes: 0, total: 45 }],
			refundRows: [],
		});
		expect(summary.XOF.payin).toEqual({ count: 2, fees: 130, taxes: 18, total: 148 });
		expect(summary.XOF.payout).toEqual({ count: 1, fees: 45, taxes: 0, total: 45 });
		expect(summary.XOF.refund).toEqual({ count: 0, fees: 0, taxes: 0, total: 0 });
		expect(summary.XOF.all).toEqual({ count: 3, fees: 175, taxes: 18, total: 193 });
	});

	test("F5 devises séparées, lignes vides et devise inconnue ignorées", () => {
		const summary = costsService.summarizeProviderCosts({
			payinRows: [
				{ _id: "XOF", count: 1, fees: 10, taxes: 0, total: 10 },
				{ _id: "XAF", count: 1, fees: 20, taxes: 2, total: 22 },
				{ _id: null, count: 3, fees: 99, taxes: 0, total: 99 },
			],
			payoutRows: [],
			refundRows: [],
		});
		expect(Object.keys(summary).sort()).toEqual(["XAF", "XOF"]);
		expect(summary.XAF.all).toEqual({ count: 1, fees: 20, taxes: 2, total: 22 });
		expect(costsService.summarizeProviderCosts({})).toEqual({});
	});

	describe("F6-F9 — paramètres d'entrée refusés et normalisés", () => {
		const stubAggregates = () => {
			const payin = jest.spyOn(Payment, "aggregate").mockResolvedValue([]);
			const payout = jest.spyOn(Payout, "aggregate").mockResolvedValue([]);
			return { payin, payout };
		};

		test("F6 devise sous forme d'objet (injection d'opérateur) refusée avant la base", async () => {
			const spies = stubAggregates();
			await expect(
				costsService.getProviderCostStats({ currency: { $ne: "XOF" } }),
			).rejects.toBeInstanceOf(RangeError);
			expect(spies.payin).not.toHaveBeenCalled();
			expect(spies.payout).not.toHaveBeenCalled();
		});

		test("F7 devise hors format ISO refusée", async () => {
			stubAggregates();
			await expect(costsService.getProviderCostStats({ currency: "XOF;drop" })).rejects.toBeInstanceOf(
				RangeError,
			);
			await expect(costsService.getProviderCostStats({ currency: "EURO" })).rejects.toBeInstanceOf(
				RangeError,
			);
		});

		test("F8 devise normalisée en majuscules dans le pipeline", async () => {
			const spies = stubAggregates();
			const result = await costsService.getProviderCostStats({ currency: "xof" });
			expect(result.currency).toBe("XOF");
			expect(spies.payin.mock.calls[0][0][0].$match.currency).toBe("XOF");
		});

		test("F9 date illisible refusée ; période invalide bornée à 30 jours", async () => {
			stubAggregates();
			await expect(costsService.getProviderCostStats({ from: "abc" })).rejects.toBeInstanceOf(
				RangeError,
			);
			await expect(costsService.getProviderCostStats({ to: "2026-13-45" })).rejects.toBeInstanceOf(
				RangeError,
			);

			const result = await costsService.getProviderCostStats({ period: "abc" });
			expect(result.period).toBe("30d");
			const spanDays = (result.to.getTime() - result.from.getTime()) / (24 * 60 * 60 * 1000);
			expect(Math.round(spanDays)).toBe(30);

			const year = await costsService.getProviderCostStats({ period: "1y" });
			expect(year.period).toBe("365d");
			const yearSpan = (year.to.getTime() - year.from.getTime()) / (24 * 60 * 60 * 1000);
			expect(Math.round(yearSpan)).toBe(365);
		});
	});
});
