// Tests du webhook payout AfriBaPay (Jour 82) : authenticité (signature HMAC
// ou secret d'URL), identité et anti-replay, décision pure (jamais rétrograder
// un payout confirmé, ignorer une tentative remplacée), application idempotente
// (notification vendeur, alertes admin, marqueur payoutState, audit) et relance
// manuelle protégée. Aucune connexion MongoDB : documents factices, dépendances
// injectées (save, notifications, alertes, journal, verrou, envoi).
process.env.AFRIBAPAY_API_USER = "harvests-test-user";
process.env.AFRIBAPAY_API_KEY = "harvests-test-key-1234567890";
process.env.AFRIBAPAY_MERCHANT_KEY = "mk_test_dummy_key_12345678";

jest.mock("axios");

const crypto = require("crypto");
const mongoose = require("mongoose");
const Payout = require("../models/Payout");
const WebhookEvent = require("../models/WebhookEvent");
const Notification = require("../models/Notification");
const AuditLog = require("../models/AuditLog");
const fr = require("../locales/fr.json");
const en = require("../locales/en.json");
const {
	checkAfribapaySignature,
	checkUrlSecret,
	SIGNATURE_HEADER,
	URL_SECRET_PARAM,
	URL_SECRET_HEADER,
} = require("../utils/afribapaySignature");
const {
	AFRIBAPAY_PAYOUT_WEBHOOK_PATH,
} = require("../config/afribapay");
const payoutNotifications = require("../utils/payoutNotifications");
const payoutService = require("../services/payment/paymentPayoutService");
const webhook = require("../services/payment/paymentPayoutWebhookService");

afterAll(() => {
	delete process.env.AFRIBAPAY_API_USER;
	delete process.env.AFRIBAPAY_API_KEY;
	delete process.env.AFRIBAPAY_MERCHANT_KEY;
});

// Les spies d'un test ne doivent jamais fuir vers le suivant (les cas
// « ignoré / alerte / finalisé » se contrediraient sinon).
afterEach(() => {
	jest.restoreAllMocks();
});

const oid = () => new mongoose.Types.ObjectId();
const hex = (body, key) => crypto.createHmac("sha256", key).update(body).digest("hex");

const BODY = Buffer.from(
	JSON.stringify({ data: { order_id: "payout-P1", status: "SUCCESS", transaction_id: "TX-9" } }),
);

const fakeReq = (bodyBuffer = BODY, { sign = true, signature, rawBody = true, query = {}, headers = {} } = {}) => ({
	headers: {
		...(sign ? { [SIGNATURE_HEADER]: signature || hex(bodyBuffer, process.env.AFRIBAPAY_API_KEY) } : {}),
		...headers,
	},
	rawBody: rawBody ? bodyBuffer : undefined,
	body: JSON.parse(bodyBuffer.toString("utf8")),
	query,
	get: (name) => headers[String(name).toLowerCase()],
	ip: "127.0.0.1",
});

const fakeRes = () => {
	const res = { statusCode: null, body: null };
	res.status = (code) => {
		res.statusCode = code;
		return res;
	};
	res.json = (body) => {
		res.body = body;
		return res;
	};
	return res;
};

// Payout factice en cours d'envoi (objet simple : l'application le mute).
const makePayout = (overrides = {}) => {
	const _id = oid();
	const payout = {
		_id,
		seller: oid(),
		sellerType: "producer",
		lines: [{ order: oid(), orderNumber: "HV-0001", gross: 10000, commission: 750, net: 9250 }],
		currency: "XOF",
		commissionRate: 0.075,
		grossAmount: 10000,
		commissionAmount: 750,
		amount: 9250,
		country: "SN",
		operator: "wave",
		phone: "771234567",
		status: "processing",
		attempts: [{ attempt: 1, orderId: `payout-${_id}`, status: "processing" }],
		afribapay: { payoutOrderId: `payout-${_id}`, attempt: 1 },
		save: jest.fn(async function () {}),
	};
	return Object.assign(payout, overrides);
};

// Dépendances d'effets : rien ne touche la base ni le réseau.
const effectDeps = () => ({
	save: jest.fn(async () => {}),
	notifySeller: jest.fn(async () => {}),
	alert: jest.fn(async () => {}),
	setOrderStates: jest.fn(async () => {}),
	audit: jest.fn(async () => {}),
});

// ---------------------------------------------------------------------------
describe("A — secret d'URL (J82)", () => {
	test("secret identique → valid", () => {
		expect(checkUrlSecret("s3cr3t", "s3cr3t")).toBe("valid");
	});

	test("secret absent → missing, secret différent → invalid", () => {
		expect(checkUrlSecret(undefined, "s3cr3t")).toBe("missing");
		expect(checkUrlSecret("", "s3cr3t")).toBe("missing");
		expect(checkUrlSecret("autre", "s3cr3t")).toBe("invalid");
	});

	test("mauvaise longueur → invalid sans lever d'exception", () => {
		expect(() => checkUrlSecret("court", "s3cr3t-plus-long")).not.toThrow();
		expect(checkUrlSecret("court", "s3cr3t-plus-long")).toBe("invalid");
	});

	test("aucun secret configuré → unconfigured (jamais « valid » par accident)", () => {
		expect(checkUrlSecret("peu-importe", undefined)).toBe("unconfigured");
		expect(checkUrlSecret("", "")).toBe("unconfigured");
	});

	test("le chemin et le paramètre du secret sont figés par la config", () => {
		expect(AFRIBAPAY_PAYOUT_WEBHOOK_PATH).toBe("/api/v1/payouts/afribapay/webhook");
		expect(URL_SECRET_PARAM).toBe("secret");
		expect(URL_SECRET_HEADER).toBe("afribapay-secret");
	});
});

describe("B — signature du webhook payout", () => {
	test("signature valide avec AFRIBAPAY_API_KEY", () => {
		expect(checkAfribapaySignature(fakeReq(), [process.env.AFRIBAPAY_API_KEY])).toBe("valid");
	});

	test("corps altéré après signature → invalid", () => {
		const req = fakeReq();
		req.rawBody = Buffer.from(BODY.toString("utf8").replace("TX-9", "TX-666"));
		expect(checkAfribapaySignature(req, [process.env.AFRIBAPAY_API_KEY])).toBe("invalid");
	});

	test("signature absente → missing ; aucune clé → unconfigured", () => {
		expect(checkAfribapaySignature(fakeReq(BODY, { sign: false }), [process.env.AFRIBAPAY_API_KEY])).toBe("missing");
		expect(checkAfribapaySignature(fakeReq(), [])).toBe("unconfigured");
	});
});

describe("C — identité du webhook payout", () => {
	test("lit order_id et statut dans body.data", () => {
		expect(webhook.extractPayoutWebhookIdentity({ data: { order_id: "payout-1-r2", status: "FAILED" } })).toEqual({
			payoutOrderId: "payout-1-r2",
			rawStatus: "FAILED",
		});
	});

	test("lit order_id à la racine et les alias référence", () => {
		expect(webhook.extractPayoutWebhookIdentity({ order_id: "payout-2", status: "SUCCESS" })).toEqual({
			payoutOrderId: "payout-2",
			rawStatus: "SUCCESS",
		});
		expect(webhook.extractPayoutWebhookIdentity({ reference: "payout-3" }).payoutOrderId).toBe("payout-3");
		expect(webhook.extractPayoutWebhookIdentity({ data: { transaction_id: "payout-4" } }).payoutOrderId).toBe("payout-4");
	});

	test("sans identifiant exploitable → null (webhook ignoré)", () => {
		expect(webhook.extractPayoutWebhookIdentity({ data: { status: "SUCCESS" } })).toBeNull();
		expect(webhook.extractPayoutWebhookIdentity({})).toBeNull();
	});
});

describe("D — clé anti-replay", () => {
	test("clé par essai exact et par statut", () => {
		expect(webhook.payoutWebhookReplayKey("payout-1", "SUCCESS")).toBe("payout:payout-1:SUCCESS");
		expect(webhook.payoutWebhookReplayKey("payout-1-r2", "SUCCESS")).toBe("payout:payout-1-r2:SUCCESS");
		expect(webhook.payoutWebhookReplayKey("payout-1", "FAILED")).not.toBe(
			webhook.payoutWebhookReplayKey("payout-1", "SUCCESS"),
		);
	});
});

describe("E — décision du webhook payout (pure)", () => {
	const decide = (payout, orderId, rawStatus) =>
		webhook.payoutWebhookDecision({ payout, payoutOrderId: orderId, rawStatus });

	test("statut intermédiaire → ignoré", () => {
		expect(decide(makePayout(), "payout-x", "PENDING").action).toBe("ignore");
		expect(decide(makePayout(), "payout-x", "").action).toBe("ignore");
	});

	test("succès sur un payout en cours → apply-succeeded", () => {
		expect(decide(makePayout(), "payout-x", "SUCCESS").action).toBe("apply-succeeded");
		expect(decide(makePayout(), "payout-x", "completed").kind).toBe("succeeded");
	});

	test("échec sur l'essai courant → apply-failed", () => {
		expect(decide(makePayout(), "payout-x", "FAILED").action).toBe("apply-failed");
		expect(decide(makePayout(), "payout-x", "REJECTED").kind).toBe("failed");
	});

	test("succès sur un payout failed ou ambiguous → rétabli (l'argent est parti)", () => {
		expect(decide(makePayout({ status: "failed" }), "payout-x", "SUCCESS").action).toBe("apply-succeeded");
		expect(decide(makePayout({ status: "ambiguous" }), "payout-x", "SUCCESS").action).toBe("apply-succeeded");
	});

	test("succès déjà confirmé → ignoré (aucun doublon)", () => {
		const payout = makePayout({ status: "succeeded", afribapay: { payoutOrderId: "payout-x", attempt: 1 } });
		expect(decide(payout, "payout-x", "SUCCESS").action).toBe("ignore");
	});

	test("second succès sur une AUTRE tentative → alerte double paiement", () => {
		const payout = makePayout({ status: "succeeded", afribapay: { payoutOrderId: "payout-1", attempt: 1 } });
		const decision = decide(payout, "payout-1-r2", "SUCCESS");
		expect(decision.action).toBe("alert");
		expect(decision.kind).toBe("double-paiement");
	});

	test("échec contradictoire sur un payout confirmé → alerte, jamais de rétrogradation", () => {
		const payout = makePayout({ status: "succeeded", afribapay: { payoutOrderId: "payout-1", attempt: 1 } });
		const decision = decide(payout, "payout-1", "FAILED");
		expect(decision.action).toBe("alert");
		expect(decision.kind).toBe("conflit-statut");
	});

	test("échec tardif d'un essai remplacé → ignoré", () => {
		const payout = makePayout({ afribapay: { payoutOrderId: null, attempt: 2 } });
		expect(decide(payout, "payout-1-r1", "FAILED").action).toBe("ignore");
		const confirmed = makePayout({ status: "succeeded", afribapay: { payoutOrderId: "payout-1-r2", attempt: 2 } });
		expect(decide(confirmed, "payout-1-r1", "FAILED").action).toBe("ignore");
	});

	test("versement reçu sur un payout annulé → alerte", () => {
		const decision = decide(makePayout({ status: "cancelled" }), "payout-x", "SUCCESS");
		expect(decision.action).toBe("alert");
		expect(decision.kind).toBe("payout-sur-annule");
	});
});

describe("F — application d'un résultat (finalizePayoutOutcome)", () => {
	const orderIdOf = (payout) => `payout-${payout._id}`;

	test("succès : statut, date, afribapay, tentative et persistance", async () => {
		const payout = makePayout();
		const deps = effectDeps();
		const result = await payoutService.finalizePayoutOutcome(
			payout,
			{ status: "succeeded", orderId: orderIdOf(payout), transactionId: "TX9", processorStatus: "SUCCESS", source: "test" },
			deps,
		);

		expect(result.status).toBe("succeeded");
		expect(payout.status).toBe("succeeded");
		expect(payout.succeededAt).toBeInstanceOf(Date);
		expect(payout.afribapay.transactionId).toBe("TX9");
		expect(payout.afribapay.processorStatus).toBe("SUCCESS");
		expect(payout.attempts[0]).toMatchObject({ status: "succeeded", transactionId: "TX9" });
		expect(deps.save).toHaveBeenCalledTimes(1);
		expect(deps.setOrderStates).toHaveBeenCalledWith(payout, "paid");
		expect(deps.notifySeller).toHaveBeenCalledWith(payout);
		expect(deps.audit).toHaveBeenCalledWith(
			expect.objectContaining({ action: "PAYOUT_CONFIRMED", targetType: "Payout", targetId: payout._id }),
		);
		expect(deps.alert).not.toHaveBeenCalled();
	});

	test("succès d'une tentative relancée : tentative existante retrouvée par order_id", async () => {
		const payout = makePayout({
			attempts: [
				{ attempt: 1, orderId: "payout-x", status: "failed" },
				{ attempt: 2, orderId: "payout-x-r2", status: "processing" },
			],
			afribapay: { payoutOrderId: "payout-x", attempt: 1 },
		});
		const deps = effectDeps();
		await payoutService.finalizePayoutOutcome(
			payout,
			{ status: "succeeded", orderId: "payout-x-r2", processorStatus: "SUCCESS" },
			deps,
		);
		expect(payout.attempts).toHaveLength(2);
		expect(payout.attempts[1].status).toBe("succeeded");
		expect(payout.attempts[0].status).toBe("failed");
		expect(payout.afribapay.attempt).toBe(2);
		expect(payout.afribapay.payoutOrderId).toBe("payout-x-r2");
	});

	test("notification vendeur : une seule fois, jamais en cas de doublon de succès", async () => {
		const payout = makePayout({ status: "succeeded", succeededAt: new Date() });
		const deps = effectDeps();
		await payoutService.finalizePayoutOutcome(
			payout,
			{ status: "succeeded", orderId: orderIdOf(payout), previousStatus: "succeeded" },
			deps,
		);
		expect(deps.notifySeller).not.toHaveBeenCalled();
	});

	test("échec définitif : failedAt, motif expurgé, commandes failed, alerte admin", async () => {
		const payout = makePayout();
		const deps = effectDeps();
		await payoutService.finalizePayoutOutcome(
			payout,
			{ status: "failed", orderId: orderIdOf(payout), reason: "operator rejected", processorStatus: "FAILED" },
			deps,
		);
		expect(payout.status).toBe("failed");
		expect(payout.failedAt).toBeInstanceOf(Date);
		expect(payout.failureReason).toBe("operator rejected");
		expect(deps.setOrderStates).toHaveBeenCalledWith(payout, "failed");
		expect(deps.notifySeller).not.toHaveBeenCalled();
		expect(deps.alert).toHaveBeenCalledWith(
			expect.objectContaining({ key: expect.stringContaining("payout-failed") }),
		);
		expect(deps.audit).toHaveBeenCalledWith(
			expect.objectContaining({ action: "PAYOUT_FAILED", status: "failure" }),
		);
	});

	test("statut ambigu : alertes admin, commandes non libérées, audit dédié", async () => {
		const payout = makePayout();
		const deps = effectDeps();
		await payoutService.finalizePayoutOutcome(payout, { status: "ambiguous", orderId: orderIdOf(payout) }, deps);
		expect(deps.alert).toHaveBeenCalledWith(expect.objectContaining({ key: expect.stringContaining("payout-ambiguous") }));
		expect(deps.setOrderStates).not.toHaveBeenCalled();
		expect(deps.audit).toHaveBeenCalledWith(
			expect.objectContaining({ action: "PAYOUT_AMBIGUOUS", status: "failure" }),
		);
	});

	test("le suivi AfriBaPay est muté sur place, sans cloner le sous-document", async () => {
		const payout = makePayout({
			afribapay: { payoutOrderId: "payout-x", attempt: 1, lastPollResult: "PENDING", processorStatus: "PENDING" },
		});
		const before = payout.afribapay;
		await payoutService.finalizePayoutOutcome(
			payout,
			{ status: "succeeded", orderId: "payout-x", processorStatus: "SUCCESS", transactionId: "TX9" },
			effectDeps(),
		);
		expect(payout.afribapay).toBe(before);
		expect(payout.afribapay.processorStatus).toBe("SUCCESS");
		expect(payout.afribapay.transactionId).toBe("TX9");
	});

	test("incident réseau : commande en « scheduled », aucune notification de paie", async () => {
		const payout = makePayout();
		const deps = effectDeps();
		await payoutService.finalizePayoutOutcome(
			payout,
			{ status: "network_issue", orderId: orderIdOf(payout), reason: "timeout" },
			deps,
		);
		expect(deps.setOrderStates).toHaveBeenCalledWith(payout, "scheduled");
		expect(deps.notifySeller).not.toHaveBeenCalled();
		expect(deps.alert).not.toHaveBeenCalled();
	});
});

describe("G — relance manuelle protégée", () => {
	const admin = { id: oid(), email: "admin@harvests.dev" };
	const sent = (orderId) => ({
		orderId,
		status: "succeeded",
		processorStatus: "SUCCESS",
		transactionId: "TX-R",
		error: null,
		sentAt: new Date(),
	});

	const retryDeps = (payout, sendResult) => ({
		token: "T",
		fetchBalance: jest.fn(async () => ({ available: 1_000_000, currency: "XOF" })),
		claimLock: jest.fn(async () => payout),
		sendAttempt: jest.fn(async () => sendResult),
		finalize: jest.fn(async () => ({ status: "succeeded" })),
		audit: jest.fn(async () => {}),
	});

	test("payout confirmé : relance refusée, aucun envoi", async () => {
		const payout = makePayout({ status: "succeeded" });
		const deps = retryDeps(payout);
		await expect(
			payoutService.retryPayoutManually(payout, { adminId: admin.id, adminEmail: admin.email, ...deps }),
		).rejects.toMatchObject({ code: "payout_terminal" });
		expect(deps.sendAttempt).not.toHaveBeenCalled();
		expect(deps.audit).not.toHaveBeenCalled();
	});

	test("payout annulé : relance refusée", async () => {
		const payout = makePayout({ status: "cancelled" });
		await expect(
			payoutService.retryPayoutManually(payout, { adminId: admin.id, ...retryDeps(payout) }),
		).rejects.toMatchObject({ code: "payout_terminal" });
	});

	test("échec définitif : nouvel order_id (-r2), audit AVANT l'envoi, finalisation", async () => {
		const payout = makePayout({
			status: "failed",
			attempts: [{ attempt: 1, orderId: "payout-1", status: "failed" }],
			afribapay: { payoutOrderId: "payout-1", attempt: 1 },
		});
		const deps = retryDeps(payout, sent(`payout-${payout._id}-r2`));
		const result = await payoutService.retryPayoutManually(payout, {
			adminId: admin.id,
			adminEmail: admin.email,
			reason: "vérifié sur le dashboard",
			...deps,
		});

		expect(deps.audit).toHaveBeenCalledWith(
			expect.objectContaining({
				action: "PAYOUT_MANUAL_RETRY",
				userId: admin.id,
				userEmail: admin.email,
				details: expect.objectContaining({ reason: "vérifié sur le dashboard", fromStatus: "failed" }),
			}),
		);
		expect(deps.audit.mock.invocationCallOrder[0]).toBeLessThan(deps.sendAttempt.mock.invocationCallOrder[0]);
		expect(deps.sendAttempt).toHaveBeenCalledTimes(1);
		// Le verrou porte le numéro de la tentative : le webhook pourra
		// reconnaître un échec tardif de `-r1` comme essai remplacé.
		expect(deps.claimLock).toHaveBeenCalledWith(payout._id, { attempt: 2 });
		expect(payout.attempts[1].orderId).toBe(`payout-${payout._id}-r2`);
		expect(deps.finalize).toHaveBeenCalledWith(
			payout,
			expect.objectContaining({ status: "succeeded", previousStatus: "failed" }),
		);
		expect(result.outcome).toBe("succeeded");
	});

	test("statut ambigu : la relance manuelle est justement le chemin prévu", async () => {
		const payout = makePayout({ status: "ambiguous" });
		const deps = retryDeps(payout, sent(`payout-${payout._id}-r2`));
		await payoutService.retryPayoutManually(payout, { adminId: admin.id, reason: "vérifié", ...deps });
		expect(deps.sendAttempt).toHaveBeenCalledTimes(1);
		expect(payout.attempts).toHaveLength(2);
	});

	test("float insuffisant : aucun verrou, aucun envoi, statut d'origine conservé", async () => {
		const payout = makePayout({ status: "failed" });
		const deps = retryDeps(payout, sent("payout-x"));
		deps.fetchBalance.mockResolvedValue({ available: 10, currency: "XOF" });
		await expect(
			payoutService.retryPayoutManually(payout, { adminId: admin.id, ...deps }),
		).rejects.toMatchObject({ code: "insufficient_float" });
		expect(deps.claimLock).not.toHaveBeenCalled();
		expect(deps.sendAttempt).not.toHaveBeenCalled();
		expect(payout.status).toBe("failed");
	});
});

describe("H — handler du webhook", () => {
	const signedReq = (body = BODY) => {
		const req = fakeReq(body);
		req.get = (name) => (String(name).toLowerCase() === "user-agent" ? "jest" : undefined);
		return req;
	};

	test("signature invalide → 403 + alerte admin", async () => {
		const alert = jest.spyOn(payoutNotifications, "alertPayoutAnomaly").mockResolvedValue(undefined);
		const res = fakeRes();
		await webhook.handleAfribapayPayoutWebhook(fakeReq(BODY, { sign: false }), res);
		expect(res.statusCode).toBe(403);
		expect(alert).toHaveBeenCalledWith(expect.objectContaining({ key: expect.stringContaining("payout-signature") }));
	});

	test("aucun canal d'authentification configuré → 503", async () => {
		const saved = {
			user: process.env.AFRIBAPAY_API_USER,
			key: process.env.AFRIBAPAY_API_KEY,
			merchant: process.env.AFRIBAPAY_MERCHANT_KEY,
			secret: process.env.AFRIBAPAY_PAYOUT_WEBHOOK_SECRET,
		};
		delete process.env.AFRIBAPAY_API_USER;
		delete process.env.AFRIBAPAY_API_KEY;
		delete process.env.AFRIBAPAY_MERCHANT_KEY;
		delete process.env.AFRIBAPAY_PAYOUT_WEBHOOK_SECRET;
		try {
			let isolated;
			jest.isolateModules(() => {
				isolated = require("../services/payment/paymentPayoutWebhookService");
			});
			const res = fakeRes();
			await isolated.handleAfribapayPayoutWebhook(fakeReq(BODY, { sign: false }), res);
			expect(res.statusCode).toBe(503);
		} finally {
			process.env.AFRIBAPAY_API_USER = saved.user;
			process.env.AFRIBAPAY_API_KEY = saved.key;
			process.env.AFRIBAPAY_MERCHANT_KEY = saved.merchant;
			if (saved.secret !== undefined) process.env.AFRIBAPAY_PAYOUT_WEBHOOK_SECRET = saved.secret;
		}
	});

	test("événement déjà traité → 200 sans recherche", async () => {
		jest.spyOn(WebhookEvent, "claimEvent").mockResolvedValue(false);
		const findById = jest.spyOn(Payout, "findById").mockResolvedValue(null);
		const res = fakeRes();
		await webhook.handleAfribapayPayoutWebhook(signedReq(), res);
		expect(res.statusCode).toBe(200);
		expect(findById).not.toHaveBeenCalled();
	});

	test("payout inconnu → 200 + alerte admin", async () => {
		jest.spyOn(WebhookEvent, "claimEvent").mockResolvedValue(true);
		jest.spyOn(Payout, "findById").mockResolvedValue(null);
		const alert = jest.spyOn(payoutNotifications, "alertPayoutAnomaly").mockResolvedValue(undefined);
		const res = fakeRes();
		await webhook.handleAfribapayPayoutWebhook(signedReq(), res);
		expect(res.statusCode).toBe(200);
		expect(alert).toHaveBeenCalledWith(expect.objectContaining({ key: expect.stringContaining("payout-inconnu") }));
	});

	test("order_id d'un autre reversement → 200 + alerte, jamais appliqué", async () => {
		const payout = makePayout();
		const elsewhere = `payout-${oid()}`;
		jest.spyOn(WebhookEvent, "claimEvent").mockResolvedValue(true);
		jest.spyOn(Payout, "findById").mockResolvedValue(payout);
		const alert = jest.spyOn(payoutNotifications, "alertPayoutAnomaly").mockResolvedValue(undefined);
		const finalize = jest.spyOn(payoutService, "finalizePayoutOutcome").mockResolvedValue({});
		const body = Buffer.from(JSON.stringify({ data: { order_id: elsewhere, status: "SUCCESS" } }));
		const res = fakeRes();
		await webhook.handleAfribapayPayoutWebhook(signedReq(body), res);
		expect(res.statusCode).toBe(200);
		expect(finalize).not.toHaveBeenCalled();
		expect(alert).toHaveBeenCalledWith(expect.objectContaining({ key: expect.stringContaining("payout-inconnu") }));
	});

	test("order_id non ObjectId (CastError) → 200 + alerte, pas une panne", async () => {
		jest.spyOn(WebhookEvent, "claimEvent").mockResolvedValue(true);
		jest
			.spyOn(Payout, "findById")
			.mockRejectedValue(Object.assign(new Error("Cast to ObjectId failed"), { name: "CastError" }));
		const alert = jest.spyOn(payoutNotifications, "alertPayoutAnomaly").mockResolvedValue(undefined);
		const body = Buffer.from(JSON.stringify({ data: { order_id: "payout-pas-un-objectid", status: "SUCCESS" } }));
		const res = fakeRes();
		await webhook.handleAfribapayPayoutWebhook(signedReq(body), res);
		expect(res.statusCode).toBe(200);
		expect(alert).toHaveBeenCalledWith(expect.objectContaining({ key: expect.stringContaining("payout-inconnu") }));
	});

	test("panne de la base (hors CastError) → 500 + clé anti-replay libérée", async () => {
		const payout = makePayout();
		const body = Buffer.from(JSON.stringify({ data: { order_id: `payout-${payout._id}`, status: "SUCCESS" } }));
		jest.spyOn(WebhookEvent, "claimEvent").mockResolvedValue(true);
		const release = jest.spyOn(WebhookEvent, "releaseEvent").mockResolvedValue({ deletedCount: 1 });
		jest.spyOn(Payout, "findById").mockRejectedValue(Object.assign(new Error("connexion perdue"), { name: "MongoServerError" }));
		const alert = jest.spyOn(payoutNotifications, "alertPayoutAnomaly").mockResolvedValue(undefined);
		const res = fakeRes();
		await webhook.handleAfribapayPayoutWebhook(signedReq(body), res);
		expect(res.statusCode).toBe(500);
		expect(release).toHaveBeenCalled();
		expect(alert).not.toHaveBeenCalled();
	});

	test("confirmation → finalisation appliquée, réponse 200", async () => {
		const payout = makePayout();
		const body = Buffer.from(
			JSON.stringify({ data: { order_id: `payout-${payout._id}`, status: "SUCCESS" } }),
		);
		jest.spyOn(WebhookEvent, "claimEvent").mockResolvedValue(true);
		jest.spyOn(Payout, "findById").mockResolvedValue(payout);
		const finalize = jest
			.spyOn(payoutService, "finalizePayoutOutcome")
			.mockResolvedValue({ status: "succeeded" });
		const res = fakeRes();
		await webhook.handleAfribapayPayoutWebhook(signedReq(body), res);
		expect(res.statusCode).toBe(200);
		expect(finalize).toHaveBeenCalledWith(
			payout,
			expect.objectContaining({ status: "succeeded", orderId: `payout-${payout._id}` }),
			expect.any(Object),
		);
	});

	test("échec de traitement après claim → 500 et clé anti-replay libérée", async () => {
		const payout = makePayout();
		const body = Buffer.from(
			JSON.stringify({ data: { order_id: `payout-${payout._id}`, status: "SUCCESS" } }),
		);
		jest.spyOn(WebhookEvent, "claimEvent").mockResolvedValue(true);
		const release = jest.spyOn(WebhookEvent, "releaseEvent").mockResolvedValue({ deletedCount: 1 });
		jest.spyOn(Payout, "findById").mockResolvedValue(payout);
		jest.spyOn(payoutService, "finalizePayoutOutcome").mockRejectedValue(new Error("base indisponible"));
		const res = fakeRes();
		await webhook.handleAfribapayPayoutWebhook(signedReq(body), res);
		expect(res.statusCode).toBe(500);
		expect(release).toHaveBeenCalledWith(webhook.payoutWebhookReplayKey(`payout-${payout._id}`, "SUCCESS"));
	});

	test("succès → 200 et clé conservée (pas de libération)", async () => {
		const payout = makePayout();
		const body = Buffer.from(
			JSON.stringify({ data: { order_id: `payout-${payout._id}`, status: "SUCCESS" } }),
		);
		jest.spyOn(WebhookEvent, "claimEvent").mockResolvedValue(true);
		const release = jest.spyOn(WebhookEvent, "releaseEvent").mockResolvedValue({ deletedCount: 0 });
		jest.spyOn(Payout, "findById").mockResolvedValue(payout);
		jest.spyOn(payoutService, "finalizePayoutOutcome").mockResolvedValue({ status: "succeeded" });
		const res = fakeRes();
		await webhook.handleAfribapayPayoutWebhook(signedReq(body), res);
		expect(res.statusCode).toBe(200);
		expect(release).not.toHaveBeenCalled();
	});

	test("secret d'URL valide : accepté même sans signature", async () => {
		const saved = process.env.AFRIBAPAY_PAYOUT_WEBHOOK_SECRET;
		process.env.AFRIBAPAY_PAYOUT_WEBHOOK_SECRET = "url-secret-42";
		try {
			jest.spyOn(WebhookEvent, "claimEvent").mockResolvedValue(false);
			const req = fakeReq(BODY, { sign: false, query: { [URL_SECRET_PARAM]: "url-secret-42" } });
			const res = fakeRes();
			await webhook.handleAfribapayPayoutWebhook(req, res);
			expect(res.statusCode).toBe(200);
		} finally {
			if (saved === undefined) delete process.env.AFRIBAPAY_PAYOUT_WEBHOOK_SECRET;
			else process.env.AFRIBAPAY_PAYOUT_WEBHOOK_SECRET = saved;
		}
	});

	test("secret envoyé en en-tête Afribapay-Secret : accepté lui aussi", async () => {
		const saved = process.env.AFRIBAPAY_PAYOUT_WEBHOOK_SECRET;
		process.env.AFRIBAPAY_PAYOUT_WEBHOOK_SECRET = "header-secret";
		try {
			jest.spyOn(WebhookEvent, "claimEvent").mockResolvedValue(false);
			const req = fakeReq(BODY, { sign: false, headers: { [URL_SECRET_HEADER]: "header-secret" } });
			const res = fakeRes();
			await webhook.handleAfribapayPayoutWebhook(req, res);
			expect(res.statusCode).toBe(200);
			expect(res.body.message).toBe("Événement déjà traité");
		} finally {
			if (saved === undefined) delete process.env.AFRIBAPAY_PAYOUT_WEBHOOK_SECRET;
			else process.env.AFRIBAPAY_PAYOUT_WEBHOOK_SECRET = saved;
		}
	});
});

describe("I — contrats de notification, d'audit et d'URL de notification", () => {
	test("le type payout_sent est accepté par le schéma de notification", () => {
		expect(Notification.schema.path("type").enumValues).toContain("payout_sent");
	});

	test("textes fr et en présents, mêmes variables", () => {
		const a = fr.notification.texts.payout_sent;
		const b = en.notification.texts.payout_sent;
		expect(a).toBeDefined();
		expect(b).toBeDefined();
		const vars = (text) => (text.match(/\{\{\s*\w+\s*\}\}/g) || []).map((v) => v.replace(/\W/g, "")).sort();
		expect(vars(b.title)).toEqual(vars(a.title));
		expect(vars(b.message)).toEqual(vars(a.message));
	});

	test("le verrou d'envoi persiste le statut et le numéro de tentative", async () => {
		const findOneAndUpdate = jest.spyOn(Payout, "findOneAndUpdate").mockResolvedValue(null);
		await payoutService.claimPayout("payout-1", { statuses: ["failed"], attempt: 2 });
		const [, update] = findOneAndUpdate.mock.calls[0];
		expect(update.$set).toMatchObject({ status: "processing", "afribapay.attempt": 2 });
	});

	test("le journal d'audit accepte les payouts", () => {
		expect(AuditLog.schema.path("targetType").enumValues).toContain("Payout");
		const { AUDIT_ACTIONS } = require("../utils/auditLogger");
		for (const action of [
			"PAYOUT_SENT",
			"PAYOUT_CONFIRMED",
			"PAYOUT_FAILED",
			"PAYOUT_AMBIGUOUS",
			"PAYOUT_MANUAL_RETRY",
		]) {
			expect(AUDIT_ACTIONS[action]).toBe(action);
		}
	});

	test("le Payout refuse d'écraser un succès concurrent (contrôle de version)", () => {
		expect(Payout.schema.options.optimisticConcurrency).toBe(true);
	});

	test("la route payout est montée avant express.json (corps brut pour la signature)", () => {
		const fs = require("fs");
		const path = require("path");
		const source = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
		const mount = source.indexOf("app.use(AFRIBAPAY_PAYOUT_WEBHOOK_PATH");
		const globalJson = source.indexOf('app.use(express.json({ limit: "10mb" })');
		expect(mount).toBeGreaterThan(-1);
		expect(globalJson).toBeGreaterThan(-1);
		expect(mount).toBeLessThan(globalJson);
	});

	test("notify_url : chemin du webhook payout, secret ajouté seulement s'il est configuré", () => {
		const payout = makePayout();
		const withoutSecret = payoutService.payoutNotifyUrl(null);
		expect(withoutSecret).toBe(
			`${String(process.env.BACKEND_URL || "http://localhost:5000").replace(/\/$/, "")}${AFRIBAPAY_PAYOUT_WEBHOOK_PATH}`,
		);
		const withSecret = payoutService.payoutNotifyUrl("url-secret-42");
		expect(withSecret).toBe(`${withoutSecret}?secret=url-secret-42`);
		const payload = payoutService.buildPayoutPayload(payout, { attempt: 1 });
		expect(payload.notify_url).toContain(AFRIBAPAY_PAYOUT_WEBHOOK_PATH);
	});
});

describe("J — aucune connexion Mongo ouverte", () => {
	test("les tests n'ouvrent pas de connexion", () => {
		expect(mongoose.connection.readyState).toBe(0);
	});
});
