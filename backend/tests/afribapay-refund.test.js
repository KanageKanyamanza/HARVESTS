// Tests des remboursements client AfriBaPay (Jour 83) : order_id par tentative,
// validation du montant remboursable, payload /pay/payout, envoi et
// finalisation idempotente (notification client, alerte admin, audit),
// décision pure du webhook refund-…, routage depuis le webhook payout et
// relance manuelle protégée. Aucune connexion MongoDB : documents factices et
// dépendances injectées (save, envoi, notifications, alertes, journal).
process.env.AFRIBAPAY_API_USER = "harvests-test-user";
process.env.AFRIBAPAY_API_KEY = "harvests-test-key-1234567890";
process.env.AFRIBAPAY_MERCHANT_KEY = "mk_test_dummy_key_12345678";

jest.mock("axios");

const mongoose = require("mongoose");
const Payment = require("../models/Payment");
const WebhookEvent = require("../models/WebhookEvent");
const Notification = require("../models/Notification");
const AuditLog = require("../models/AuditLog");
const fr = require("../locales/fr.json");
const en = require("../locales/en.json");
const { AUDIT_ACTIONS } = require("../utils/auditLogger");
const { payoutNotifyUrl } = require("../services/payment/paymentPayoutService");
const {
	refundOrderIdFor,
	paymentIdFromRefundOrderId,
	refundAttemptNumber,
	refundOrderIdBelongsTo,
	isSupersededRefundOrderId,
} = require("../utils/refundOrderId");
const refundService = require("../services/payment/paymentRefundAfribapayService");
const refundWebhook = require("../services/payment/paymentRefundWebhookService");
const payoutWebhook = require("../services/payment/paymentPayoutWebhookService");
const Payout = require("../models/Payout");

afterEach(() => {
	jest.restoreAllMocks();
	jest.clearAllMocks();
});

const oid = () => new mongoose.Types.ObjectId();

// Payment mobile money confirmé (objet simple : l'application le mute).
const makePayment = (overrides = {}) => {
	const _id = oid();
	const payment = {
		_id,
		paymentId: `pay_test_${_id}`,
		user: oid(),
		order: oid(),
		type: "payment",
		method: "mobile_money",
		status: "succeeded",
		amount: 10000,
		currency: "XOF",
		country: "SN",
		operator: "wave",
		phone: "771234567",
		paidAt: new Date("2026-11-10T10:00:00Z"),
		refunds: [],
		refundAttempt: 0,
		save: jest.fn(async function () {}),
	};
	return Object.assign(payment, overrides);
};

const makeRefund = (overrides = {}) => ({
	refundId: "ref_afp_1",
	amount: 10000,
	reason: "commande annulée",
	status: "pending",
	attempt: 1,
	orderId: "refund-pay_test_1",
	createdAt: new Date("2026-11-17T09:00:00Z"),
	...overrides,
});

const refundDeps = (sendResult = null) => ({
	save: jest.fn(async () => {}),
	notifyClient: jest.fn(async () => {}),
	alert: jest.fn(async () => {}),
	audit: jest.fn(async () => {}),
	sendAttempt:
		sendResult === null
			? jest.fn(async (payment, { attempt }) => ({
					orderId: refundOrderIdFor(payment.paymentId, attempt),
					status: "succeeded",
					processorStatus: "SUCCESS",
					transactionId: "TX-RF-1",
					error: null,
					sentAt: new Date(),
				}))
			: jest.fn(async () => sendResult),
	now: () => new Date("2026-11-17T10:00:00Z"),
});

// ---------------------------------------------------------------------------
describe("A — order_id de remboursement", () => {
	test("premier essai sans suffixe, relances -r2, -r3", () => {
		expect(refundOrderIdFor("pay_1")).toBe("refund-pay_1");
		expect(refundOrderIdFor("pay_1", 1)).toBe("refund-pay_1");
		expect(refundOrderIdFor("pay_1", 2)).toBe("refund-pay_1-r2");
		expect(refundOrderIdFor("pay_1", 3)).toBe("refund-pay_1-r3");
	});

	test("aller-retour order_id → paymentId et numéro d'essai", () => {
		expect(paymentIdFromRefundOrderId("refund-pay_1")).toBe("pay_1");
		expect(paymentIdFromRefundOrderId("refund-pay_1-r2")).toBe("pay_1");
		expect(refundAttemptNumber("refund-pay_1")).toBe(1);
		expect(refundAttemptNumber("refund-pay_1-r2")).toBe(2);
	});

	test("appartenance : un autre paiement est refusé", () => {
		expect(refundOrderIdBelongsTo("refund-pay_1-r2", "pay_1")).toBe(true);
		expect(refundOrderIdBelongsTo("refund-pay_2", "pay_1")).toBe(false);
		expect(refundOrderIdBelongsTo("payout-pay_1", "pay_1")).toBe(false);
		expect(refundOrderIdBelongsTo("", "pay_1")).toBe(false);
	});

	test("essai dépassé : échec d'un essai antérieur, succès d'un autre essai", () => {
		expect(isSupersededRefundOrderId("refund-pay_1", { lastAttempt: 2 })).toBe(true);
		expect(isSupersededRefundOrderId("refund-pay_1-r2", { lastAttempt: 2 })).toBe(false);
		expect(
			isSupersededRefundOrderId("refund-pay_1-r2", { confirmedOrderId: "refund-pay_1-r3" }),
		).toBe(true);
	});
});

// ---------------------------------------------------------------------------
describe("B — modèle Payment", () => {
	test("les essais de remboursement sont tracés sur le sous-document", () => {
		const refundPath = Payment.schema.path("refunds").schema;
		for (const field of [
			"attempt",
			"orderId",
			"transactionId",
			"processorStatus",
			"operator",
			"phone",
			"country",
			"requestedBy",
		]) {
			expect(refundPath.path(field)).toBeDefined();
		}
	});

	test("statut ambiguous accepté (remboursement incertain)", () => {
		expect(Payment.schema.path("refunds").schema.path("status").enumValues).toContain("ambiguous");
	});

	test("compteur refundAttempt à 0 par défaut", () => {
		expect(Payment.schema.path("refundAttempt").defaultValue).toBe(0);
	});

	test("reservedRefunded compte pending + ambiguous + succeeded, pas failed", () => {
		const payment = Payment.hydrate({
			refunds: [
				{ refundId: "a", amount: 1000, status: "pending" },
				{ refundId: "b", amount: 2000, status: "ambiguous" },
				{ refundId: "c", amount: 3000, status: "succeeded" },
				{ refundId: "d", amount: 4000, status: "failed" },
			],
		});
		expect(payment.reservedRefunded).toBe(6000);
		expect(payment.totalRefunded).toBe(3000);
	});
});

// ---------------------------------------------------------------------------
describe("C — validation du remboursement", () => {
	const expectCode = async (fn, code) => {
		await expect(fn).rejects.toMatchObject({ code });
	};

	test("mobile money seulement", async () => {
		await expectCode(
			async () => refundService.assertRefundable(makePayment({ method: "paypal" }), 1000),
			"refund_not_mobile_money",
		);
	});

	test("paiement non confirmé ou annulé refusé", async () => {
		await expectCode(
			async () => refundService.assertRefundable(makePayment({ status: "pending" }), 1000),
			"refund_not_refundable",
		);
		await expectCode(
			async () => refundService.assertRefundable(makePayment({ status: "cancelled" }), 1000),
			"refund_not_refundable",
		);
	});

	test("fenêtre de 90 jours dépassée refusée", async () => {
		const payment = makePayment({ paidAt: new Date("2026-06-01T00:00:00Z") });
		await expectCode(
			async () => refundService.assertRefundable(payment, 1000, { now: () => new Date("2026-11-17T00:00:00Z") }),
			"refund_not_refundable",
		);
	});

	test("montant nul, négatif ou décimal refusé", async () => {
		await expectCode(async () => refundService.assertRefundable(makePayment(), 0), "refund_amount_invalid");
		await expectCode(async () => refundService.assertRefundable(makePayment(), -5), "refund_amount_invalid");
		await expectCode(async () => refundService.assertRefundable(makePayment(), 10.5), "refund_amount_invalid");
	});

	test("montant supérieur au disponible refusé, essai en cours déduit", async () => {
		const payment = makePayment({
			refunds: [makeRefund({ amount: 4000, status: "pending" })],
		});
		expect(refundService.refundableAmount(payment)).toBe(6000);
		await expectCode(async () => refundService.assertRefundable(payment, 7000), "refund_amount_exceeds");
		await expect(refundService.assertRefundable(payment, 6000)).resolves.toBeUndefined();
	});

	test("remboursement partiel autorisé sur un paiement déjà partiellement remboursé", async () => {
		const payment = makePayment({
			status: "partially_refunded",
			refunds: [makeRefund({ amount: 3000, status: "succeeded" })],
		});
		await expect(refundService.assertRefundable(payment, 2000)).resolves.toBeUndefined();
	});
});

// ---------------------------------------------------------------------------
describe("D — payload de remboursement", () => {
	test("9 clés, order_id refund et notify_url du webhook payout", () => {
		const payment = makePayment();
		const payload = refundService.buildRefundPayload(payment, {
			amount: 2500,
			attempt: 2,
			operator: "Wave",
			phone: "77 123 45 67",
			country: "SN",
		});
		expect(Object.keys(payload).sort()).toEqual(
			["amount", "country", "currency", "lang", "merchant_key", "notify_url", "operator", "order_id", "phone_number"].sort(),
		);
		expect(payload.order_id).toBe(`refund-${payment.paymentId}-r2`);
		expect(payload.amount).toBe(2500);
		expect(payload.currency).toBe("XOF");
		expect(payload.operator).toBe("wave");
		expect(payload.phone_number).toBe("771234567");
		expect(payload.notify_url).toBe(payoutNotifyUrl());
		expect(payload.lang).toBe("fr");
	});

	test("montant arrondi et secret d'URL transporté", () => {
		const saved = process.env.AFRIBAPAY_PAYOUT_WEBHOOK_SECRET;
		process.env.AFRIBAPAY_PAYOUT_WEBHOOK_SECRET = "refund-secret";
		try {
			const payload = refundService.buildRefundPayload(makePayment(), {
				amount: 1999.6,
				attempt: 1,
				operator: "orange",
				phone: "771234567",
				country: "SN",
			});
			expect(payload.amount).toBe(2000);
			expect(payload.notify_url).toBe(`${payoutNotifyUrl()}`);
			expect(payload.notify_url).toContain("secret=refund-secret");
		} finally {
			if (saved === undefined) delete process.env.AFRIBAPAY_PAYOUT_WEBHOOK_SECRET;
			else process.env.AFRIBAPAY_PAYOUT_WEBHOOK_SECRET = saved;
		}
	});
});

// ---------------------------------------------------------------------------
describe("E — demande de remboursement", () => {
	test("l'entrée pending est persistée AVANT l'envoi", async () => {
		const payment = makePayment();
		const deps = refundDeps();
		let entryAtSend = null;
		deps.sendAttempt.mockImplementation(async (p, { attempt }) => {
			// Instantané : l'entrée est mutée ensuite par la finalisation.
			entryAtSend = { status: p.refunds[0].status, amount: p.refunds[0].amount, attempt: p.refunds[0].attempt };
			return {
				orderId: refundOrderIdFor(p.paymentId, attempt),
				status: "succeeded",
				processorStatus: "SUCCESS",
				transactionId: "TX1",
				error: null,
				sentAt: new Date(),
			};
		});
		await refundService.requestAfribapayRefund(payment, {
			amount: 4000,
			reason: "écart de livraison",
			adminId: oid(),
			...deps,
		});
		expect(entryAtSend).toMatchObject({ status: "pending", amount: 4000, attempt: 1 });
		expect(deps.save.mock.invocationCallOrder[0]).toBeLessThan(
			deps.sendAttempt.mock.invocationCallOrder[0],
		);
	});

	test("succès : remboursement succeeded et notification client", async () => {
		const payment = makePayment();
		const deps = refundDeps();
		const result = await refundService.requestAfribapayRefund(payment, { amount: 4000, ...deps });
		expect(result.outcome).toBe("succeeded");
		expect(payment.refunds[0]).toMatchObject({ status: "succeeded", transactionId: "TX-RF-1" });
		expect(payment.status).toBe("partially_refunded");
		expect(deps.notifyClient).toHaveBeenCalledWith(payment, payment.refunds[0]);
		expect(deps.alert).not.toHaveBeenCalled();
	});

	test("succès total : Payment refunded", async () => {
		const payment = makePayment();
		const result = await refundService.requestAfribapayRefund(payment, {
			amount: 10000,
			...refundDeps(),
		});
		expect(result.outcome).toBe("succeeded");
		expect(payment.status).toBe("refunded");
		expect(payment.refundedAt).toBeInstanceOf(Date);
	});

	test("refus explicite : failed, alerte admin, aucune notification client", async () => {
		const payment = makePayment();
		const deps = refundDeps({
			orderId: `refund-${payment.paymentId}`,
			status: "failed",
			processorStatus: "FAILED",
			transactionId: null,
			error: "opérateur indisponible",
			sentAt: new Date(),
		});
		const result = await refundService.requestAfribapayRefund(payment, { amount: 3000, ...deps });
		expect(result.outcome).toBe("failed");
		expect(payment.refunds[0].status).toBe("failed");
		expect(payment.status).toBe("succeeded");
		expect(deps.notifyClient).not.toHaveBeenCalled();
		expect(deps.alert).toHaveBeenCalled();
	});

	test("statut ambigu : alerte, relance automatique interdite", async () => {
		const payment = makePayment();
		const deps = refundDeps({
			orderId: `refund-${payment.paymentId}`,
			status: "ambiguous",
			processorStatus: null,
			transactionId: null,
			error: "timeout",
			sentAt: new Date(),
		});
		const result = await refundService.requestAfribapayRefund(payment, { amount: 3000, ...deps });
		expect(result.outcome).toBe("ambiguous");
		expect(payment.refunds[0].status).toBe("ambiguous");
		expect(deps.alert).toHaveBeenCalledWith(
			expect.objectContaining({ key: expect.stringContaining("refund-ambiguous") }),
		);
	});

	test("un remboursement en cours réserve le montant (pas de double envoi)", async () => {
		const payment = makePayment({
			refunds: [makeRefund({ amount: 5000, status: "pending", orderId: "refund-other" })],
		});
		await expect(
			refundService.requestAfribapayRefund(payment, { amount: 6000, ...refundDeps() }),
		).rejects.toMatchObject({ code: "refund_amount_exceeds" });
		expect(payment.refunds).toHaveLength(1);
	});
});

// ---------------------------------------------------------------------------
describe("F — finalisation d'un remboursement", () => {
	const applyRefund = (payment, refund, options = {}) => {
		payment.refunds.push(refund);
		return refundService.finalizeRefundOutcome(
			payment,
			{ refundId: refund.refundId, orderId: refund.orderId, status: "succeeded", ...options },
			{ save: jest.fn(async () => {}), notifyClient: jest.fn(), alert: jest.fn(), audit: jest.fn() },
		);
	};

	test("succès : champs d'essai, notification et audit REFUND_CONFIRMED", async () => {
		const payment = makePayment();
		const refund = makeRefund({ amount: 10000, status: "pending" });
		const deps = { save: jest.fn(async () => {}), notifyClient: jest.fn(), alert: jest.fn(), audit: jest.fn() };
		payment.refunds.push(refund);
		const result = await refundService.finalizeRefundOutcome(
			payment,
			{
				refundId: refund.refundId,
				orderId: refund.orderId,
				status: "succeeded",
				transactionId: "TX9",
				processorStatus: "SUCCESS",
				previousStatus: "pending",
			},
			deps,
		);
		expect(result.notified).toBe(true);
		expect(refund).toMatchObject({ status: "succeeded", transactionId: "TX9", processorStatus: "SUCCESS" });
		expect(refund.processedAt).toBeInstanceOf(Date);
		expect(payment.status).toBe("refunded");
		expect(deps.notifyClient).toHaveBeenCalledTimes(1);
		expect(deps.audit).toHaveBeenCalledWith(expect.objectContaining({ action: "REFUND_CONFIRMED", targetType: "Payment" }));
	});

	test("un remboursement confirmé n'est jamais rétrogradé", async () => {
		const payment = makePayment({ refunds: [makeRefund({ status: "succeeded", amount: 2000 })] });
		const deps = { save: jest.fn(), notifyClient: jest.fn(), alert: jest.fn(), audit: jest.fn() };
		await refundService.finalizeRefundOutcome(
			payment,
			{ refundId: "ref_afp_1", orderId: "refund-pay_test_1", status: "failed", reason: "FAILED" },
			deps,
		);
		expect(payment.refunds[0].status).toBe("succeeded");
		expect(payment.status).not.toBe("failed");
		expect(deps.notifyClient).not.toHaveBeenCalled();
	});

	test("un échec tardif n'écrase pas un paiement déjà refunded", async () => {
		const payment = makePayment({ status: "refunded", refunds: [makeRefund({ status: "succeeded", amount: 10000 })] });
		await refundService.finalizeRefundOutcome(
			payment,
			{ refundId: "ref_afp_1", orderId: "refund-pay_test_1", status: "failed" },
			{ save: jest.fn(), notifyClient: jest.fn(), alert: jest.fn(), audit: jest.fn() },
		);
		expect(payment.status).toBe("refunded");
	});

	test("échec : audit REFUND_FAILED et alerte admin", async () => {
		const payment = makePayment();
		const refund = makeRefund({ amount: 2500 });
		payment.refunds.push(refund);
		const deps = { save: jest.fn(), notifyClient: jest.fn(), alert: jest.fn(async () => {}), audit: jest.fn() };
		await refundService.finalizeRefundOutcome(
			payment,
			{ refundId: refund.refundId, orderId: refund.orderId, status: "failed", reason: "refus" },
			deps,
		);
		expect(refund.status).toBe("failed");
		expect(refund.failureReason).toBe("refus");
		expect(payment.status).toBe("succeeded");
		expect(deps.audit).toHaveBeenCalledWith(expect.objectContaining({ action: "REFUND_FAILED", status: "failure" }));
		expect(deps.alert).toHaveBeenCalled();
	});

	test("statut ambigu : audit REFUND_AMBIGUOUS", async () => {
		const payment = makePayment();
		const refund = makeRefund({});
		payment.refunds.push(refund);
		const deps = { save: jest.fn(), notifyClient: jest.fn(), alert: jest.fn(async () => {}), audit: jest.fn() };
		await refundService.finalizeRefundOutcome(
			payment,
			{ refundId: refund.refundId, orderId: refund.orderId, status: "ambiguous" },
			deps,
		);
		expect(deps.audit).toHaveBeenCalledWith(expect.objectContaining({ action: "REFUND_AMBIGUOUS" }));
	});

	test("succès rejoué : aucune seconde notification", async () => {
		const payment = makePayment({ status: "refunded", refunds: [makeRefund({ status: "succeeded", amount: 10000 })] });
		const deps = { save: jest.fn(), notifyClient: jest.fn(), alert: jest.fn(), audit: jest.fn() };
		await refundService.finalizeRefundOutcome(
			payment,
			{ refundId: "ref_afp_1", orderId: "refund-pay_test_1", status: "succeeded", previousStatus: "succeeded" },
			deps,
		);
		expect(deps.notifyClient).not.toHaveBeenCalled();
	});
});

// ---------------------------------------------------------------------------
describe("G — décision du webhook de remboursement (pure)", () => {
	const decide = (payment, refund, orderId, rawStatus) =>
		refundWebhook.refundWebhookDecision({ payment, refund, refundOrderId: orderId, rawStatus });

	test("statut intermédiaire ignoré", () => {
		expect(decide(makePayment(), makeRefund(), "refund-pay_test_1", "PENDING").action).toBe("ignore");
	});

	test("remboursement introuvable → alerte", () => {
		const decision = decide(makePayment(), null, "refund-pay_test_1", "SUCCESS");
		expect(decision.action).toBe("alert");
		expect(decision.kind).toBe("remboursement-inconnu");
	});

	test("succès déjà confirmé sur le même essai → ignoré", () => {
		const refund = makeRefund({ status: "succeeded" });
		expect(decide(makePayment(), refund, refund.orderId, "SUCCESS").action).toBe("ignore");
	});

	test("succès sur un autre essai → alerte double remboursement", () => {
		const refund = makeRefund({ status: "succeeded", orderId: "refund-pay_test_1" });
		const decision = decide(makePayment(), refund, "refund-pay_test_1-r2", "SUCCESS");
		expect(decision.action).toBe("alert");
		expect(decision.kind).toBe("double-remboursement");
	});

	test("échec contredisant un remboursement confirmé → alerte sans rétrogradation", () => {
		const refund = makeRefund({ status: "succeeded", orderId: "refund-pay_test_1" });
		const decision = decide(makePayment(), refund, "refund-pay_test_1", "FAILED");
		expect(decision.action).toBe("alert");
		expect(decision.kind).toBe("conflit-statut");
	});

	test("succès tardif sur failed ou ambiguous → appliqué", () => {
		expect(decide(makePayment(), makeRefund({ status: "failed" }), "refund-pay_test_1", "SUCCESS").action).toBe(
			"apply-succeeded",
		);
		expect(decide(makePayment(), makeRefund({ status: "ambiguous" }), "refund-pay_test_1", "SUCCESS").action).toBe(
			"apply-succeeded",
		);
	});

	test("échec sur ambiguous → alerte, statut conservé", () => {
		const decision = decide(makePayment(), makeRefund({ status: "ambiguous" }), "refund-pay_test_1", "FAILED");
		expect(decision.action).toBe("alert");
		expect(decision.kind).toBe("ambigu-contredit");
	});

	test("échec d'un essai dépassé → ignoré", () => {
		const payment = makePayment();
		const refund = makeRefund({ status: "pending", attempt: 2 });
		const decision = decide(payment, refund, "refund-pay_test_1", "FAILED");
		expect(decision.action).toBe("ignore");
		expect(decision.kind).toBe("essai-remplace");
	});

	test("échec de l'essai courant → appliqué", () => {
		expect(decide(makePayment(), makeRefund({ status: "pending" }), "refund-pay_test_1", "FAILED").action).toBe(
			"apply-failed",
		);
	});
});

// ---------------------------------------------------------------------------
describe("H — handler du webhook de remboursement", () => {
	test("rejeu détecté → aucun effet", async () => {
		jest.spyOn(WebhookEvent, "claimEvent").mockResolvedValue(false);
		const findPayment = jest.fn();
		const result = await refundWebhook.processRefundWebhook({
			refundOrderId: "refund-pay_test_1",
			rawStatus: "SUCCESS",
			deps: { findPayment },
		});
		expect(result.action).toBe("ignore");
		expect(findPayment).not.toHaveBeenCalled();
	});

	test("paiement inconnu → alerte, aucune finalisation", async () => {
		jest.spyOn(WebhookEvent, "claimEvent").mockResolvedValue(true);
		const alert = jest.fn(async () => {});
		const result = await refundWebhook.processRefundWebhook({
			refundOrderId: "refund-pay_inconnu",
			rawStatus: "SUCCESS",
			deps: { findPayment: jest.fn(async () => null), alert },
		});
		expect(result.action).toBe("alert");
		expect(alert).toHaveBeenCalled();
	});

	test("remboursement introuvable sur le paiement → alerte", async () => {
		jest.spyOn(WebhookEvent, "claimEvent").mockResolvedValue(true);
		const payment = makePayment({ refunds: [] });
		const alert = jest.fn(async () => {});
		const result = await refundWebhook.processRefundWebhook({
			refundOrderId: `refund-${payment.paymentId}`,
			rawStatus: "SUCCESS",
			deps: { findPayment: jest.fn(async () => payment), alert },
		});
		expect(result.action).toBe("alert");
		expect(alert).toHaveBeenCalled();
	});

	test("succès appliqué : entrée succeeded et notification client", async () => {
		jest.spyOn(WebhookEvent, "claimEvent").mockResolvedValue(true);
		const payment = makePayment({ refunds: [makeRefund({ amount: 10000 })] });
		const notifyClient = jest.fn();
		const result = await refundWebhook.processRefundWebhook({
			refundOrderId: `refund-${payment.paymentId}`,
			rawStatus: "SUCCESS",
			data: { transaction_id: "TX-W" },
			deps: {
				findPayment: jest.fn(async () => payment),
				save: jest.fn(),
				notifyClient,
				alert: jest.fn(),
				audit: jest.fn(),
			},
		});
		expect(result.action).toBe("apply-succeeded");
		expect(payment.refunds[0].status).toBe("succeeded");
		expect(notifyClient).toHaveBeenCalledTimes(1);
	});

	test("erreur interne → 500 côté payout, clé anti-replay libérée", async () => {
		jest.spyOn(WebhookEvent, "claimEvent").mockResolvedValue(true);
		const release = jest.spyOn(WebhookEvent, "releaseEvent").mockResolvedValue({});
		await expect(
			refundWebhook.processRefundWebhook({
				refundOrderId: "refund-pay_test_1",
				rawStatus: "SUCCESS",
				deps: {
					findPayment: jest.fn(async () => {
						throw new Error("base indisponible");
					}),
				},
			}),
		).rejects.toThrow("base indisponible");
		expect(release).toHaveBeenCalledWith("refund:refund-pay_test_1:SUCCESS");
	});

	test("le webhook payout route un order_id refund-… vers le remboursement", async () => {
		// Authentification valide, identité refund : le handler payout délègue.
		const crypto = require("crypto");
		const body = Buffer.from(JSON.stringify({ data: { order_id: "refund-pay_R1", status: "SUCCESS" } }));
		const req = {
			headers: {
				"afribapay-sign": crypto
					.createHmac("sha256", process.env.AFRIBAPAY_API_KEY)
					.update(body)
					.digest("hex"),
			},
			rawBody: body,
			body: JSON.parse(body.toString("utf8")),
			query: {},
			get: () => undefined,
			ip: "127.0.0.1",
		};
		const payment = makePayment({ paymentId: "pay_R1", refunds: [makeRefund({ orderId: "refund-pay_R1" })] });
		jest.spyOn(WebhookEvent, "claimEvent").mockResolvedValue(true);
		const findPayment = jest.spyOn(Payment, "findOne").mockResolvedValue(payment);
		const findPayout = jest.spyOn(Payout, "findById");
		const res = { statusCode: null, body: null };
		res.status = (code) => {
			res.statusCode = code;
			return res;
		};
		res.json = (payload) => {
			res.body = payload;
			return res;
		};
		await payoutWebhook.handleAfribapayPayoutWebhook(req, res);
		expect(res.statusCode).toBe(200);
		expect(findPayment).toHaveBeenCalled();
		expect(findPayout).not.toHaveBeenCalled();
		expect(payment.refunds[0].status).toBe("succeeded");
	});
});

// ---------------------------------------------------------------------------
describe("I — relance manuelle d'un remboursement", () => {
	const failedRefund = () =>
		makeRefund({ status: "failed", orderId: "refund-pay_test_1", amount: 4000, attempt: 1 });

	test("refusée sur succeeded, ambiguous ou pending", async () => {
		for (const status of ["succeeded", "ambiguous", "pending"]) {
			const payment = makePayment({ refunds: [failedRefund()], status: "partially_refunded" });
			payment.refunds[0].status = status;
			await expect(
				refundService.retryRefundManually(payment, payment.refunds[0].refundId, {
					adminId: oid(),
					...refundDeps(),
				}),
			).rejects.toMatchObject({ code: "refund_not_retryable" });
		}
	});

	test("nouvel essai -r2, audit AVANT l'envoi, montant repris", async () => {
		const payment = makePayment({ refunds: [failedRefund()] });
		const deps = refundDeps();
		const adminId = oid();
		const result = await refundService.retryRefundManually(payment, "ref_afp_1", {
			adminId,
			adminEmail: "admin@harvests.dev",
			reason: "vérifié sur le dashboard",
			...deps,
		});
		expect(deps.audit).toHaveBeenCalledWith(
			expect.objectContaining({
				action: "REFUND_MANUAL_RETRY",
				userId: adminId,
				details: expect.objectContaining({ refundId: "ref_afp_1", fromStatus: "failed" }),
			}),
		);
		expect(deps.audit.mock.invocationCallOrder[0]).toBeLessThan(
			deps.sendAttempt.mock.invocationCallOrder[0],
		);
		expect(deps.sendAttempt).toHaveBeenCalledWith(payment, expect.objectContaining({ attempt: 2, amount: 4000 }));
		expect(result.refund.orderId).toBe(`refund-${payment.paymentId}-r2`);
	});
});

// ---------------------------------------------------------------------------
describe("J — contrats de notification et d'audit", () => {
	test("actions d'audit des remboursements", () => {
		for (const action of [
			"REFUND_SENT",
			"REFUND_CONFIRMED",
			"REFUND_FAILED",
			"REFUND_AMBIGUOUS",
			"REFUND_MANUAL_RETRY",
		]) {
			expect(AUDIT_ACTIONS[action]).toBe(action);
		}
	});

	test("type refund_sent accepté par la notification", () => {
		expect(Notification.schema.path("type").enumValues).toContain("refund_sent");
	});

	test("textes fr et en présents, mêmes variables", () => {
		const a = fr.notification.texts.refund_sent;
		const b = en.notification.texts.refund_sent;
		expect(a).toBeDefined();
		expect(b).toBeDefined();
		const vars = (text) => (text.match(/\{\{\s*\w+\s*\}\}/g) || []).map((v) => v.replace(/\W/g, "")).sort();
		expect(vars(b.title)).toEqual(vars(a.title));
		expect(vars(b.message)).toEqual(vars(a.message));
	});

	test("le journal d'audit accepte les paiements", () => {
		expect(AuditLog.schema.path("targetType").enumValues).toContain("Payment");
	});
});

// ---------------------------------------------------------------------------
describe("L — corrections de revue indépendante", () => {
	test("les données de notification passent la validation du schéma", () => {
		// `data.orderId` est un ObjectId de commande : y mettre `refund-…`
		// faisait échouer la notification (le client n'était jamais prévenu).
		const data = refundService.buildRefundNotificationData(makePayment(), makeRefund());
		expect(data.orderRef).toBe("refund-pay_test_1");
		expect(data.orderId).toBeUndefined();
		const notification = new Notification({
			recipient: oid(),
			recipientModel: "User",
			type: "refund_sent",
			category: "payment",
			title: "Remboursement effectué",
			message: "Votre remboursement a été envoyé.",
			data,
		});
		expect(notification.validateSync()).toBeUndefined();
	});

	test("classement des échecs d'envoi : refus explicite vs incertain", () => {
		for (const httpStatus of [400, 401, 403, 404, 422]) {
			expect(refundService.classifyRefundSendFailure({ response: { status: httpStatus } })).toBe("failed");
		}
		for (const httpStatus of [408, 409, 423, 500, 502, 503]) {
			expect(refundService.classifyRefundSendFailure({ response: { status: httpStatus } })).toBe("ambiguous");
		}
		expect(refundService.classifyRefundSendFailure(new Error("timeout"))).toBe("ambiguous");
	});

	test("un succès qui dépasserait le montant payé est bloqué et signalé", async () => {
		const payment = makePayment({
			amount: 10000,
			refunds: [
				makeRefund({ refundId: "r1", amount: 6000, status: "succeeded", orderId: "refund-pay_test_1" }),
				makeRefund({ refundId: "r2", attempt: 2, amount: 6000, status: "pending", orderId: "refund-pay_test_1-r2" }),
			],
		});
		const alert = jest.fn(async () => {});
		const deps = { save: jest.fn(), notifyClient: jest.fn(), alert, audit: jest.fn() };
		const result = await refundService.finalizeRefundOutcome(
			payment,
			{ refundId: "r2", orderId: "refund-pay_test_1-r2", status: "succeeded", previousStatus: "pending" },
			deps,
		);
		expect(result.blocked).toBe("double-refund");
		expect(payment.refunds[1].status).toBe("pending");
		expect(deps.notifyClient).not.toHaveBeenCalled();
		expect(alert).toHaveBeenCalledWith(
			expect.objectContaining({ key: expect.stringContaining("refund-double") }),
		);
	});

	test("le numéro d'essai est réservé à partir des essais déjà tracés", async () => {
		const payment = makePayment({
			refunds: [makeRefund({ attempt: 1 }), makeRefund({ refundId: "r2", attempt: 2, orderId: "refund-pay_test_1-r2" })],
		});
		await expect(refundService.reserveRefundAttempt(payment)).resolves.toBe(3);
	});
});

// ---------------------------------------------------------------------------
describe("M — écritures concurrentes (résidu de revue)", () => {
	// `readyState` n'est pas configurable : on le redéfinit le temps du test.
	const connected = () => {
		Object.defineProperty(mongoose.connection, "readyState", {
			value: 1,
			configurable: true,
			writable: true,
		});
	};
	afterEach(() => {
		Object.defineProperty(mongoose.connection, "readyState", {
			value: 0,
			configurable: true,
			writable: true,
		});
	});

	test("en base, la finalisation n'écrit QUE l'essai visé (pas de save global)", async () => {
		connected();
		const updateOne = jest.spyOn(Payment, "updateOne").mockResolvedValue({ matchedCount: 1 });
		const payment = makePayment({ status: "succeeded" });
		const refund = makeRefund({ amount: 4000, status: "pending" });
		payment.refunds.push(refund);
		const save = jest.fn();
		await refundService.finalizeRefundOutcome(
			payment,
			{ refundId: refund.refundId, orderId: refund.orderId, status: "succeeded" },
			{ save, notifyClient: jest.fn(), alert: jest.fn(), audit: jest.fn() },
		);
		expect(save).not.toHaveBeenCalled();
		const [filter, update, options] = updateOne.mock.calls[0];
		expect(filter).toEqual({ _id: payment._id });
		expect(update.$set["refunds.$[essai].status"]).toBe("succeeded");
		expect(update.$set["refunds.$[essai].processedAt"]).toBeInstanceOf(Date);
		expect(update.$set.status).toBe("partially_refunded");
		expect(options.arrayFilters).toEqual([{ "essai.refundId": refund.refundId }]);
		// L'objet en mémoire reflète l'écriture (retour d'API).
		expect(refund.status).toBe("succeeded");
		expect(payment.status).toBe("partially_refunded");
	});

	test("en base, l'entrée pending part en $push ciblé, sans save global", async () => {
		connected();
		jest.spyOn(Payment, "findOneAndUpdate").mockReturnValue({
			lean: async () => ({ refundAttempt: 1 }),
		});
		const updateOne = jest.spyOn(Payment, "updateOne");
		let pushed = null;
		updateOne.mockImplementation(async (filter, update) => {
			// Instantané : l'entrée est mutée ensuite par la finalisation.
			if (update?.$push?.refunds) {
				pushed = {
					status: update.$push.refunds.status,
					attempt: update.$push.refunds.attempt,
					amount: update.$push.refunds.amount,
				};
			}
			return { matchedCount: 1 };
		});
		// Contrôle de dépassement concurrent : le total engagé reste sous le payé.
		jest.spyOn(Payment, "findById").mockReturnValue({
			lean: async () => ({ amount: 10000, refunds: [{ refundId: "x", amount: 4000, status: "pending" }] }),
		});
		const payment = makePayment();
		const save = jest.fn();
		await refundService.requestAfribapayRefund(payment, { amount: 4000, ...refundDeps(), save });
		expect(save).not.toHaveBeenCalled();
		const [filter] = updateOne.mock.calls[0];
		expect(filter).toEqual({
			_id: payment._id,
			"refunds.refundId": { $ne: `ref_afp_${payment.paymentId}_1` },
		});
		expect(pushed).toEqual({ status: "pending", attempt: 1, amount: 4000 });
	});

	test("en base, un essai déjà enregistré est refusé (pas de doublon)", async () => {
		connected();
		jest.spyOn(Payment, "findOneAndUpdate").mockReturnValue({
			lean: async () => ({ refundAttempt: 1 }),
		});
		jest.spyOn(Payment, "updateOne").mockResolvedValue({ matchedCount: 0 });
		await expect(
			refundService.requestAfribapayRefund(makePayment(), { amount: 1000, ...refundDeps() }),
		).rejects.toMatchObject({ code: "refund_conflict" });
	});
});

// ---------------------------------------------------------------------------
describe("N — gardes issus de l'audit Jours 70-83", () => {
	test("l'ancienne route admin ne peut pas clôturer un remboursement AfriBaPay", () => {
		const payment = Payment.hydrate({
			amount: 10000,
			status: "succeeded",
			refunds: [{ refundId: "ref_afp_x_1", amount: 4000, status: "ambiguous", attempt: 1, orderId: "refund-x" }],
		});
		expect(() => payment.processRefund("ref_afp_x_1", "succeeded")).toThrow(
			"payment.refund_managed_by_afribapay",
		);
		expect(payment.refunds[0].status).toBe("ambiguous");
	});

	test("l'ancienne route admin ne clôture pas non plus une demande legacy sur mobile money", () => {
		const payment = Payment.hydrate({
			method: "mobile_money",
			amount: 10000,
			status: "succeeded",
			refunds: [{ refundId: "ref_legacy_mm", amount: 4000, status: "pending" }],
		});
		expect(() => payment.processRefund("ref_legacy_mm", "succeeded")).toThrow(
			"payment.refund_managed_by_afribapay",
		);
		expect(payment.refunds[0].status).toBe("pending");
	});

	test("la relance refuse un remboursement legacy sans numéro d'essai", async () => {
		const payment = makePayment({
			refunds: [makeRefund({ refundId: "ref_legacy", attempt: undefined, orderId: undefined, status: "failed" })],
		});
		await expect(
			refundService.retryRefundManually(payment, "ref_legacy", { adminId: oid(), ...refundDeps() }),
		).rejects.toMatchObject({ code: "refund_not_retryable" });
	});

	test("un dépassement concurrent est annulé avant tout envoi", async () => {
		Object.defineProperty(mongoose.connection, "readyState", {
			value: 1,
			configurable: true,
			writable: true,
		});
		try {
			const payment = makePayment();
			const refund = makeRefund({ refundId: "ref_concurrent", amount: 6000, status: "pending" });
			jest.spyOn(Payment, "findById").mockReturnValue({
				lean: async () => ({
					amount: 10000,
					refunds: [
						{ refundId: "autre", amount: 6000, status: "pending" },
						{ refundId: "ref_concurrent", amount: 6000, status: "pending" },
					],
				}),
			});
			const updateOne = jest.spyOn(Payment, "updateOne").mockResolvedValue({ matchedCount: 1 });
			await expect(refundService.verifyReservedAmount(payment, refund)).rejects.toMatchObject({
				code: "refund_amount_exceeds",
			});
			expect(updateOne.mock.calls[0][1].$set["refunds.$[essai].status"]).toBe("cancelled");
			expect(refund.status).toBe("cancelled");
		} finally {
			Object.defineProperty(mongoose.connection, "readyState", {
				value: 0,
				configurable: true,
				writable: true,
			});
		}
	});

	test("types de notification de l'ancien circuit déclarés et traduits", () => {
		for (const type of ["refund_processed", "refund_rejected"]) {
			expect(Notification.schema.path("type").enumValues).toContain(type);
			const a = fr.notification.texts[type];
			const b = en.notification.texts[type];
			expect(a).toBeDefined();
			expect(b).toBeDefined();
			const vars = (text) => (text.match(/\{\{\s*\w+\s*\}\}/g) || []).map((v) => v.replace(/\W/g, "")).sort();
			expect(vars(b.title)).toEqual(vars(a.title));
			expect(vars(b.message)).toEqual(vars(a.message));
		}
	});
});

// ---------------------------------------------------------------------------
describe("K — aucune connexion Mongo ouverte", () => {
	test("les tests n'ouvrent pas de connexion", () => {
		expect(mongoose.connection.readyState).toBe(0);
	});
});
