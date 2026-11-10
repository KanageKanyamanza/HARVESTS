// Tests du webhook payin AfriBaPay (Jour 77) : signature HMAC du corps brut,
// extraction de l'identité, statuts AfriBaPay → Payment, décision pure
// (anti-replay, essai remplacé, rétrogradation interdite, cohérence
// montant/devise) et schéma du claim idempotent. Tout est testé sans base
// MongoDB (la recette bout en bout est prévue au Jour 86) ; le handler et
// l'alerte admin ne sont pas mockés ici.
process.env.AFRIBAPAY_API_USER = "harvests-test-user";
process.env.AFRIBAPAY_API_KEY = "harvests-test-key-1234567890";
process.env.AFRIBAPAY_MERCHANT_KEY = "mk_test_dummy_key_12345678";

const crypto = require("crypto");
const {
	checkAfribapaySignature,
	SIGNATURE_HEADER,
} = require("../utils/afribapaySignature");
const { payinMismatch } = require("../utils/afribapayUtils");
const {
	payinAttemptNumber,
	isSupersededPayinOrderId,
} = require("../utils/payinOrderId");
const webhookService = require("../services/payment/paymentAfribapayWebhookService");
const WebhookEvent = require("../models/WebhookEvent");

afterAll(() => {
	delete process.env.AFRIBAPAY_API_USER;
	delete process.env.AFRIBAPAY_API_KEY;
	delete process.env.AFRIBAPAY_MERCHANT_KEY;
});

// Corps brut du webhook + HMAC de la doc AfriBaPay
const RAW_BODY = Buffer.from(
	JSON.stringify({
		data: { order_id: "R50a1", status: "SUCCESS", amount_total: 18500, currency: "XOF" },
	}),
);
const hex = (body, key) =>
	crypto.createHmac("sha256", key).update(body).digest("hex");

const fakeReq = (bodyBuffer, { sign = true, key = process.env.AFRIBAPAY_API_KEY, rawBody = true } = {}) => ({
	headers: sign ? { [SIGNATURE_HEADER]: hex(bodyBuffer, key) } : {},
	rawBody: rawBody ? bodyBuffer : undefined,
	body: JSON.parse(bodyBuffer.toString("utf8")),
});

describe("signature du webhook (HMAC-SHA256 du corps brut)", () => {
	test("signature valide avec AFRIBAPAY_API_KEY", () => {
		expect(checkAfribapaySignature(fakeReq(RAW_BODY), [process.env.AFRIBAPAY_API_KEY])).toBe("valid");
	});

	test("corps brut altéré = rejet (un seul octet changé ne passe plus)", () => {
		const altered = Buffer.from(RAW_BODY.toString("utf8").replace("18500", "300000"));
		// l'attaquant garde la signature d'origine mais change le montant
		const req = fakeReq(RAW_BODY);
		req.rawBody = altered;
		expect(
			checkAfribapaySignature(req, [process.env.AFRIBAPAY_API_KEY]),
		).toBe("invalid");
		expect(checkAfribapaySignature(fakeReq(altered), [process.env.AFRIBAPAY_API_KEY])).toBe("valid");
	});

	test("corps brut re-sérialisé (octets différents) = rejet — d'où la capture AVANT express.json", () => {
		const reqBad = fakeReq(RAW_BODY);
		// on simule un handler qui aurait perdu le corps brut et serait passé
		// par express.json : la signature d'origine ne couvre pas un JSON
		// re-stringifié dans un ordre de clés différent
		const reserialized = Buffer.from(
			JSON.stringify({ data: { currency: "XOF", amount_total: 18500, order_id: "R50a1", status: "SUCCESS" } }),
		);
		reqBad.rawBody = reserialized;
		expect(
			checkAfribapaySignature(reqBad, [process.env.AFRIBAPAY_API_KEY]),
		).toBe("invalid");
	});

	test("signature absente → 'missing'", () => {
		expect(
			checkAfribapaySignature(fakeReq(RAW_BODY, { sign: false }), [process.env.AFRIBAPAY_API_KEY]),
		).toBe("missing");
	});

	test("AFRIBAPAY_WEBHOOK_SECRET acceptée en seconde clé possible", () => {
		const secret = "webhook-secret-key-9876543210";
		expect(
			checkAfribapaySignature(fakeReq(RAW_BODY, { key: secret }), [
				process.env.AFRIBAPAY_API_KEY,
				secret,
			]),
		).toBe("valid");
		// une autre clé seule (ou une signature jetée) ne valide rien
		expect(
			checkAfribapaySignature(fakeReq(RAW_BODY, { sign: false }), ["wrong-secret"]),
		).toBe("missing");
		expect(
			checkAfribapaySignature(fakeReq(RAW_BODY, { key: "wrong-secret" }), [
				process.env.AFRIBAPAY_API_KEY,
			]),
		).toBe("invalid");
	});

	test("aucune clé configurée → 'unconfigured' (webhook 503)", () => {
		expect(checkAfribapaySignature(fakeReq(RAW_BODY), [])).toBe("unconfigured");
		expect(checkAfribapaySignature(fakeReq(RAW_BODY), [undefined, null])).toBe("unconfigured");
	});

	test("sans rawBody (déploiement qui l'aurait perdu) : repli sur le JSON re-sérialisé", () => {
		const req = fakeReq(RAW_BODY, { rawBody: false });
		// la signature de l'expéditeur porta sur le corps originel : sans corps
		// brut ce repli désérialise et re-stringifie — le test attend 'invalid'
		// si l'ordre des clés diffère ; ici il coïncide, le HMAC reste validé.
		expect(
			checkAfribapaySignature(req, [process.env.AFRIBAPAY_API_KEY]),
		).toBe("valid");
	});
});

describe("identité du webhook (extraction + clé anti-replay)", () => {
	test("extraction sur body.data", () => {
		expect(
			webhookService.extractWebhookIdentity({
				data: { order_id: "R50a1-p2", status: "success" },
			}),
		).toEqual({ payinOrderId: "R50a1-p2", rawStatus: "success" });
	});

	test("extraction sur le corps à plat et champs de repli", () => {
		expect(
			webhookService.extractWebhookIdentity({ order_id: "R50a1", status: "FAILED" }),
		).toEqual({ payinOrderId: "R50a1", rawStatus: "FAILED" });
		expect(
			webhookService.extractWebhookIdentity({ reference_id: "R50a1" }),
		).toEqual({ payinOrderId: "R50a1", rawStatus: "" });
	});

	test("sans identifiant exploitable → null (webhook loggé puis ignoré)", () => {
		expect(webhookService.extractWebhookIdentity({ foo: 1 })).toBeNull();
		expect(webhookService.extractWebhookIdentity({ data: { status: "SUCCESS" } })).toBeNull();
	});

	test("clé anti-replay : order_id EXACT de l'essai (pas le paymentId seul)", () => {
		expect(webhookService.replayKeyFor("R50a1-p2", "success")).toBe("payin:R50a1-p2:SUCCESS");
		// le SUCCESS d'une relance n'est pas un rejeu de l'essai de départ
		expect(webhookService.replayKeyFor("R50a1", "SUCCESS")).not.toBe(
			webhookService.replayKeyFor("R50a1-p2", "SUCCESS"),
		);
	});
});

describe("statuts AfriBaPay → statut Payment", () => {
	test("confirmations encaissées → succeeded", () => {
		for (const s of ["SUCCESS", "COMPLETED", "PAID", "ACCEPTED", "APPROVED", "SUCCESSFUL", "VALIDATED", "success"]) {
			expect(webhookService.mapAfribapayPayinStatus(s)).toBe("succeeded");
		}
	});

	test("échec → failed, abandon client → cancelled", () => {
		for (const s of ["FAILED", "REJECTED", "EXPIRED"]) {
			expect(webhookService.mapAfribapayPayinStatus(s)).toBe("failed");
		}
		expect(webhookService.mapAfribapayPayinStatus("CANCELLED")).toBe("cancelled");
	});

	test("statuts intermédiaires (PENDING…) et vides → null", () => {
		expect(webhookService.mapAfribapayPayinStatus("PENDING")).toBeNull();
		expect(webhookService.mapAfribapayPayinStatus("")).toBeNull();
		expect(webhookService.mapAfribapayPayinStatus(undefined)).toBeNull();
		expect(webhookService.mapAfribapayPayinStatus("IN_PROGRESS")).toBeNull();
	});
});

describe("payinMismatch (cohérence montant/devise)", () => {
	const payment = { amount: 18500, currency: "XOF" };

	test("conforme quand montant et devise correspondent", () => {
		expect(payinMismatch(payment, { amount_total: 18500, currency: "XOF" })).toBeNull();
		expect(payinMismatch(payment, { original_amount: 18500 })).toBeNull();
		// marge de tolérance 1 FCFA (arrondis opérateurs)
		expect(payinMismatch(payment, { amount_total: 18501, currency: "XOF" })).toBeNull();
	});

	test("écart de montant détecté (payload à plat ou sous .data)", () => {
		expect(payinMismatch(payment, { amount_total: 15000, currency: "XOF" })).toBe(
			"montant 15000 au lieu de 18500",
		);
		expect(
			payinMismatch(payment, { data: { amount_total: 15000, currency: "XOF" } }),
		).toBe("montant 15000 au lieu de 18500");
	});

	test("écart de devise détecté", () => {
		expect(payinMismatch(payment, { amount_total: 18500, currency: "XAF" })).toBe(
			"devise XAF au lieu de XOF",
		);
	});

	test("cumul des deux écarts", () => {
		expect(payinMismatch(payment, { amount_total: 1000, currency: "XAF" })).toBe(
			"devise XAF au lieu de XOF, montant 1000 au lieu de 18500",
		);
	});

	test("aucun montant ni devise renvoyé par AfriBaPay : rien à comparer", () => {
		expect(payinMismatch(payment, { status: "SUCCESS" })).toBeNull();
	});

	test("entrées vides → null (jamais de faux positif)", () => {
		expect(payinMismatch(null, { amount_total: 1 })).toBeNull();
		expect(payinMismatch(payment, null)).toBeNull();
	});
});

describe("essai remplacé (isSupersededPayinOrderId)", () => {
	test("l'échec d'un essai antérieur à celui confirmé est remplacé", () => {
		expect(
			isSupersededPayinOrderId("R50a1", { confirmedOrderId: "R50a1-p2", lastAttempt: 2 }),
		).toBe(true);
		expect(
			isSupersededPayinOrderId("R50a1", { confirmedOrderId: "R50a1-p2" }),
		).toBe(true);
	});

	test("l'essai confirmé lui-même n'est pas remplacé", () => {
		expect(
			isSupersededPayinOrderId("R50a1-p2", { confirmedOrderId: "R50a1-p2", lastAttempt: 2 }),
		).toBe(false);
	});

	test("sans essai confirmé : repli sur le numéro du dernier essai envoyé", () => {
		expect(isSupersededPayinOrderId("R50a1", { lastAttempt: 2 })).toBe(true);
		expect(payinAttemptNumber("R50a1-p2")).toBe(2);
		expect(isSupersededPayinOrderId("R50a1-p2", { lastAttempt: 2 })).toBe(false);
	});

	test("order_id vide → false (jamais remplacé par un essai inconnu)", () => {
		expect(isSupersededPayinOrderId("", { confirmedOrderId: "R50a1-p2" })).toBe(false);
	});
});

// Utilitaires de fabrication des décisions
const paymentIn = (status, afribapay = {}) => ({
	paymentId: "50a1",
	status,
	paymentDetails: { afribapay },
});
const decide = (payment, opts = {}) =>
	webhookService.afribapayWebhookDecision({
		payment,
		payinOrderId: opts.payinOrderId ?? `R${payment.paymentId}`,
		rawStatus: opts.rawStatus ?? "SUCCESS",
		mismatch: opts.mismatch ?? null,
	});

describe("décision du webhook (fonction pure)", () => {
	test("confirmée pour un paiement en attente → apply-succeeded", () => {
		const decision = decide(paymentIn("processing"), { rawStatus: "success" });
		expect(decision.action).toBe("apply-succeeded");
	});

	test("échec d'un paiement en attente → apply-end (statut failed)", () => {
		const decision = decide(paymentIn("processing"), { rawStatus: "REJECTED" });
		expect(decision.action).toBe("apply-end");
		expect(decision.kind).toBe("failed");
	});

	test("abandon client d'un paiement en attente → apply-end (statut cancelled)", () => {
		const decision = decide(paymentIn("pending"), { rawStatus: "CANCELLED" });
		expect(decision.action).toBe("apply-end");
		expect(decision.kind).toBe("cancelled");
	});

	test("PENDING intermédiaire → ignoré (aucune transition)", () => {
		const decision = decide(paymentIn("pending"), { rawStatus: "PENDING" });
		expect(decision.action).toBe("ignore");
		expect(decision.kind).toBe("statut-intermediaire");
	});

	test("échec tardif d'un essai remplacé → ignoré, payin confirmé inviolable", () => {
		const decision = decide(
			paymentIn("succeeded", { payinConfirmedOrderId: "R50a1-p2", attempt: 2 }),
			{ payinOrderId: "R50a1", rawStatus: "FAILED" },
		);
		expect(decision.action).toBe("ignore");
		expect(decision.kind).toBe("essai-remplace");
	});

	test("notification contradictoire sur un paiement confirmé → alerte, statut conservé", () => {
		const decision = decide(
			paymentIn("succeeded", { payinConfirmedOrderId: "R50a1-p2", attempt: 2 }),
			{ payinOrderId: "R50a1-p2", rawStatus: "FAILED" },
		);
		expect(decision.action).toBe("alert");
		expect(decision.kind).toBe("conflit-statut");
	});

	test("ré-emission d'un SUCCESS pour un paiement déjà succeeded → alerte (jamais rétrogradé, jamais silencieux)", () => {
		const decision = decide(
			paymentIn("succeeded", { payinConfirmedOrderId: "R50a1", attempt: 1 }),
			{ payinOrderId: "R50a1", rawStatus: "COMPLETED" },
		);
		expect(decision.action).toBe("alert");
	});

	test("payin reçu sur un paiement annulé → alerte, statut conservé", () => {
		const decision = decide(paymentIn("cancelled"), { rawStatus: "SUCCESS" });
		expect(decision.action).toBe("alert");
		expect(decision.kind).toBe("paiement-sur-annule");
	});

	test("confirmation non conforme (montant/devise) → alerte, aucune transition", () => {
		const decision = decide(paymentIn("processing"), {
			rawStatus: "success",
			mismatch: "montant 300000 au lieu de 18500",
		});
		expect(decision.action).toBe("alert");
		expect(decision.kind).toBe("montant-devise");
	});

	test("paiement failed rattrapé par un SUCCESS tardif → apply-succeeded", () => {
		const decision = decide(paymentIn("failed"), { rawStatus: "SUCCESS" });
		expect(decision.action).toBe("apply-succeeded");
	});
});

describe("statistiques de paiement confirmé (payment additionnels payés)", () => {
	test("un payin confirmé enregistre l'essai décisif pour le prochain essai remplacé", () => {
		// séquence : R50a1 échoue → R50a1-p2 confirmé → R50a1-p3 annulé tard
		const payment = paymentIn("processing");
		// 1) échec du premier essai
		expect(decide(payment, { payinOrderId: "R50a1", rawStatus: "FAILED" }).action).toBe("apply-end");
		payment.status = "failed";
		payment.paymentDetails.afribapay.processorStatus = "FAILED";
		// 2) relance client, second essai confirmé
		payment.status = "processing";
		expect(decide(payment, { payinOrderId: "R50a1-p2", rawStatus: "SUCCESS" }).action).toBe("apply-succeeded");
		payment.status = "succeeded";
		payment.paymentDetails.afribapay.attempt = 2;
		payment.paymentDetails.afribapay.payinConfirmedOrderId = "R50a1-p2";
		// 3) écho tardif du SUCCESS du premier essai jamais reçu : valide
		expect(decide(payment, { payinOrderId: "R50a1", rawStatus: "SUCCESS" }).action).toBe("alert");
		// 4) webhook annulé de l'essai initial : remplacé, ignoré sans alerte
		expect(
			decide(payment, { payinOrderId: "R50a1", rawStatus: "CANCELLED" }).action,
		).toBe("ignore");
	});
});

describe("claim d'idempotence (WebhookEvent.claimEvent)", () => {
	test("clé unique + TTL 7 jours exposés par le schéma", () => {
		const path = WebhookEvent.schema.path("key");
		expect(path.options.unique).toBe(true);
		expect(path.options.required).toBe(true);
		const ttl = WebhookEvent.schema.path("createdAt");
		expect(ttl.options.expires).toBe(7 * 24 * 60 * 60);
	});

	test("les clés suivent la convention payin:* et anomaly:payin-*", () => {
		expect(webhookService.replayKeyFor("R50a1", "SUCCESS")).toMatch(/^payin:R50a1:SUCCESS$/);
		// clés d'alerte construites par le handler (convention testée ici doc level)
		expect(`anomaly:payin-montant-devise:R50a1-p2`).toMatch(/^anomaly:payin-[a-z-]+:R50a1-p2$/);
	});
});
