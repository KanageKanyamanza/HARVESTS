// Vérification /status AfriBaPay et réconciliation (Jour 78) — porté
// d'AfricaSend (transaction.afribapay.js queryAfribapayPayinStatus +
// services/statusPollingService.js). Le webhook (Jour 77) reste la
// notification habituelle ; /status est la SEULE SOURCE DE VÉRITÉ qui
// confirme un payin : `GET /status?order_id=` est interrogée par
//  - la page d'attente client (repoll du statut, Jour 79),
//  - le worker planifié ci-dessous (runPollCycle) qui resynchronise tous les
//    payins restés en attente — webhook perdu ou écho divergent — avec
//    claim d'idempotence et journal d'exécution à chaque passage,
//  - la recette bout en bout (Jour 86).
// Garde-fous inchangés depuis le Jour 77 : jamais de rétrogradation d'un payin
// confirmé, cohérence montant/devise (payinMismatch), échec d'un essai remplacé
// sans alerte — la décision et son exécution sont CELLES du webhook
// (afribapayWebhookDecision + applyAfribapayPayinOutcome).
const axios = require("axios");
const Payment = require("../../models/Payment");
const WebhookEvent = require("../../models/WebhookEvent");
const { AFRIBAPAY_BASE_URL, isAfribapayConfigured } = require("../../config/afribapay");
const { getAccessToken, ipv4Agent } = require("../../utils/afribapayClient");
const { invalidateAfribapayTokenOn401 } = require("../../utils/afribapayTokenCache");
const { parseAfribapayBody, payinMismatch, redactSecrets } = require("../../utils/afribapayUtils");
const { logAudit } = require("../../utils/auditLogger");
const { mergeAfribapayDetails } = require("../../utils/paymentDetails");
const {
	payinReferenceFor,
	payinOrderIdFor,
	allPayinOrderIdsFor,
	payinOrderIdBelongsTo,
} = require("../../utils/payinOrderId");
const {
	mapAfribapayPayinStatus,
	PAYIN_FAILURE_STATUSES,
	afribapayWebhookDecision,
	applyAfribapayPayinOutcome,
	alertAfribapayAnomaly,
} = require("./paymentAfribapayWebhookService");

// ─────────────────────────────────────────────
//  CONFIG (surchargeable via .env) — valeurs AfricaSend
// ─────────────────────────────────────────────
const STATUS_POLL_INTERVAL_MS =
	parseInt(process.env.STATUS_POLL_INTERVAL_MS, 10) || 30 * 1000; // 30 s
const STATUS_GRACE_PERIOD_MS =
	parseInt(process.env.STATUS_GRACE_PERIOD_MS, 10) || 30 * 1000; // laisse le webhook arriver
const STATUS_MAX_AGE_MS =
	parseInt(process.env.STATUS_MAX_AGE_MS, 10) || 60 * 60 * 1000; // fenêtre de polling rapide = 1 h
const STATUS_STALE_RECHECK_MS =
	parseInt(process.env.STATUS_STALE_RECHECK_MS, 10) || 60 * 60 * 1000; // revérification espacée (1 h)
// Au-delà de ce délai, un payin jamais transmis à AfriBaPay (échec réseau
// d'initiation) est ANNULÉ pour libérer la commande ; un payin PENDING chez
// AfriBaPay n'est JAMAIS annulé (un PENDING peut encore aboutir) — alerte
// admin seulement (doc AfriBaPay, comportement AfricaSend).
const STATUS_GIVE_UP_MS = 24 * 60 * 60 * 1000;
const STATUS_BATCH_SIZE = 20; // payins traités par cycle (fenêtre rapide)
const STATUS_STALE_BATCH_SIZE = 10; // payins anciens traités par cycle
const STATUS_QUERY_TIMEOUT_MS = 10_000;
const STATUS_POLL_PAUSE_MS = 500; // pause entre deux payins interrogés

// FAILED/EXPIRED/REJECTED : lectures consécutives avant d'écrire un échec
// définitif (une lecture peut être transitoire — reprise du paiement).
const STATUS_FINAL_FAILURE_READS = 2;

// Statuts Payment jamais re-vérifiés par le /status (payin déjà confirmé
// ou réglé autrement — cash à la livraison couvert par le J85).
const PENDING_POLL_STATUSES = ["pending", "processing", "requires_action"];
const CONFIRMED_PAYMENT_STATUSES = ["succeeded", "refunded", "partially_refunded"];

// ─────────────────────────────────────────────
//  BACKOFF EXPONENTIEL (par paiement)
//  429 / 5xx / réseau : on espace la prochaine lecture au lieu de retenter à
//  chaque cycle (30 s) et d'aggraver le rate-limit. La doc AfriBaPay prévient
//  que des requêtes /status répétées sur des identifiants inexistants peuvent
//  suspendre l'accès à l'API.
// ─────────────────────────────────────────────
const PAYIN_BACKOFF_BASE_MS = STATUS_POLL_INTERVAL_MS;
const PAYIN_BACKOFF_MAX_MS = 15 * 60 * 1000;

const _apiErrorBackoff = new Map(); // paymentId -> { count, nextRetryAt }

const isBackedOff = (paymentId, now = Date.now()) => {
	const entry = _apiErrorBackoff.get(paymentId);
	return !!entry && now < entry.nextRetryAt;
};

const recordApiErrorBackoff = (
	paymentId,
	{ baseMs = PAYIN_BACKOFF_BASE_MS, maxMs = PAYIN_BACKOFF_MAX_MS } = {},
) => {
	const prev = _apiErrorBackoff.get(paymentId);
	const count = (prev?.count || 0) + 1;
	const delay = Math.min(baseMs * 2 ** (count - 1), maxMs);
	_apiErrorBackoff.set(paymentId, { count, nextRetryAt: Date.now() + delay });
	console.log(
		`[Status AfriBaPay] ⏳ Backoff ${paymentId} : prochaine lecture dans ${Math.round(delay / 1000)}s (échec n°${count})`,
	);
	return delay;
};

const clearApiErrorBackoff = (paymentId) => _apiErrorBackoff.delete(paymentId);

/**
 * Un /status renvoyant FAILED/EXPIRED/REJECTED peut être TRANSITOIRE (le client
 * reprend son paiement juste après un premier abandon) : deux lectures
 * consécutives avant d'écrire un `failed` définitif. CANCELLED est une
 * annulation explicite côté opérateur : définitif dès la première lecture.
 * Fonction pure (testée sans base) — le compteur est porté par le Payment
 * (paymentDetails.afribapay.failedReadCount) pour survivre aux redémarrages.
 * @param {string} rawStatus statut brut renvoyé par /status
 * @param {number} previousCount lectures consécutives déjà notées
 * @returns {{write: boolean, count: number}} write=true ⇒ échec définitif
 */
const finalFailureReady = (rawStatus, previousCount = 0) => {
	const status = String(rawStatus || "").toUpperCase();
	if (status === "CANCELLED") return { write: true, count: 0 };
	if (status !== "FAILED" && status !== "EXPIRED" && status !== "REJECTED") {
		return { write: false, count: 0 };
	}
	const count = (Number(previousCount) || 0) + 1;
	return { write: count >= STATUS_FINAL_FAILURE_READS, count };
};

/**
 * Interroge AfriBaPay /status pour UN identifiant (order_id d'un essai ou
 * transaction_id AfriBaPay) :
 *  - 404 → { notFound } : AfriBaPay ne connaît pas cet order_id (payin jamais
 *    initié ou rejeté à l'initiation) — pas une erreur, pas un paiement reçu ;
 *  - query par transaction_id : la réponse doit CONFIRMER appartenir à notre
 *    paiement (payinOrderIdBelongsTo), sinon rejetée (mismatch) — l'ID
 *    AfriBaPay d'une autre transaction ne peut pas confirmer la nôtre.
 */
const queryAfribapayPayinStatus = async ({
	token,
	payinOrderId,
	paymentId,
	afribapayTransactionId = null,
}) => {
	const query = afribapayTransactionId
		? `transaction_id=${encodeURIComponent(afribapayTransactionId)}`
		: `order_id=${encodeURIComponent(payinOrderId || payinReferenceFor(paymentId))}`;

	let response;
	try {
		response = await axios.get(`${AFRIBAPAY_BASE_URL}/status?${query}`, {
			headers: { Authorization: `Bearer ${token}` },
			httpsAgent: ipv4Agent,
			timeout: STATUS_QUERY_TIMEOUT_MS,
		});
	} catch (err) {
		// 404 : commande inconnue d'AfriBaPay — attendu, pas un échec 5xx
		if (!afribapayTransactionId && err.response?.status === 404) {
			return { rawStatus: "NOT_FOUND", confirmed: false, notFound: true };
		}
		invalidateAfribapayTokenOn401(err);
		throw err;
	}

	// Enveloppe brute (dump debug-PHP possible devant le JSON) — pas pré-dépliée
	const payload = parseAfribapayBody(response.data) ?? response.data;
	const data = payload?.data && typeof payload.data === "object" ? payload.data : payload;
	const rawStatus = String(data?.status || payload?.status || "").toUpperCase();
	const returnedOrderId = String(data?.order_id || payload?.order_id || "").trim();

	if (afribapayTransactionId) {
		// Exigence d'appartenance : l'order_id renvoyé doit être UN des nôtres
		// (R<paymentId>[-pN]). L'ID AfriBaPay n'est qu'un raccourci (2e essai
		// invisible par /status/order_id), jamais un substitut d'appartenance.
		if (!returnedOrderId || !payinOrderIdBelongsTo(returnedOrderId, paymentId)) {
			console.warn(
				`[Status AfriBaPay] ${afribapayTransactionId} n'appartient pas au paiement ${paymentId} (order_id renvoyé: "${returnedOrderId || "aucun"}", statut: ${rawStatus || "?"}) — réponse:`,
				redactSecrets(JSON.stringify(payload)),
			);
			return { rawStatus: null, confirmed: false, mismatch: true, returnedOrderId };
		}
		return {
			rawStatus,
			confirmed: mapAfribapayPayinStatus(rawStatus) === "succeeded",
			notFound: false,
			attemptStillOpen: false,
			payinOrderId: returnedOrderId || payinOrderId,
			payload,
		};
	}

	return {
		rawStatus,
		confirmed: mapAfribapayPayinStatus(rawStatus) === "succeeded",
		notFound: false,
		attemptStillOpen: false,
		payinOrderId: returnedOrderId || payinOrderId,
		payload,
	};
};

// L'order_id porté par une réponse /status confirmante (structure AfriBaPay
// non fixe : le champ peut tenir à la racine ou dans .data).
const confirmedPayinOrderId = (check) =>
	check.payinOrderId || check.payload?.data?.order_id || check.payload?.order_id;

/**
 * Vérifie le payin d'un Payment : /status/order_id de l'essai courant d'abord,
 * puis CHAQUE essai couvert (R<paymentId>, -p2, -p3…) tant qu'aucun n'est
 * confirmé — /status n'affiche pas toujours le dernier essai d'une relance
 * (R103543678 chez AfricaSend). Un essai ni confirmé ni échoué (PENDING)
 * laisse un essai ouvert (attemptStillOpen) : empêche de conclure.
 *
 * @param {{payment: object, token?: string}} params Payment
 *   (/paymentDetails.afribapay rempli par requestPayin) et token AfriBaPay
 * @returns {Promise<object>} { rawStatus, confirmed, mismatch, attemptStillOpen,
 *   notFound, attemptsChecked, payinOrderId, payload }
 */
const checkAfribapayPayinStatus = async ({ payment, token }) => {
	const resolvedToken = token || (await getAccessToken());
	const afribapay = payment.paymentDetails?.afribapay || {};
	const paymentId = payment.paymentId;
	const paymentRef = payinReferenceFor(paymentId);
	// Essai courant (payinOrderId posé par requestPayin) ou référence par défaut.
	const currentOrderId =
		afribapay.payinOrderId || payinOrderIdFor(paymentRef, afribapay.attempt || 1);

	const byOrder = await queryAfribapayPayinStatus({
		token: resolvedToken,
		paymentId,
		payinOrderId: currentOrderId,
	});
	if (byOrder.confirmed) {
		// Cohérence montant/devise contre le Payment : une confirmation non
		// conforme n'est pas une confirmation (le /status n'approuve jamais ce
		// qu'un webhook a refusé) — décision alert, alerte admin unique par claim.
		const mismatch = payinMismatch(payment, byOrder.payload);
		if (mismatch) {
			return { ...byOrder, confirmed: false, mismatch, attemptStillOpen: false };
		}
		return { ...byOrder, mismatch: null, attemptStillOpen: false };
	}

	// Aucune confirmation via l'order_id courant : chaque essai couvert est
	// interrogé (relance réseau = R<paymentId>-pN, AfricaSend R103543678).
	const attempts = allPayinOrderIdsFor(paymentRef, afribapay.attempt || 1).filter(
		(id) => id !== currentOrderId,
	);
	let attemptStillOpen = false;
	const attemptsChecked = [];
	for (const attemptOrderId of attempts) {
		attemptsChecked.push(attemptOrderId);
		try {
			const res = await queryAfribapayPayinStatus({
				token: resolvedToken,
				paymentId,
				payinOrderId: attemptOrderId,
			});
			if (res.confirmed) {
				// Confirmation d'un essai ultérieur : la relance explicite du
				// client a été encaissée — même contrôle montant/devise.
				const mismatch = payinMismatch(payment, res.payload);
				if (mismatch) {
					return { ...res, confirmed: false, mismatch, attemptsChecked };
				}
				return { ...res, mismatch: null, attemptsChecked };
			}
			if (res.rawStatus && !PAYIN_FAILURE_STATUSES.includes(res.rawStatus)) {
				attemptStillOpen = true; // essai encore en cours (PENDING…)
			}
		} catch (err) {
			attemptStillOpen = true; // essai non vérifiable : pas de conclusion
			console.warn(
				`[Status AfriBaPay] essai ${attemptOrderId} du paiement ${paymentId} non vérifiable:`,
				err.message,
			);
		}
	}
	return {
		...byOrder,
		payinOrderId: byOrder.payinOrderId || currentOrderId,
		mismatch: null,
		attemptStillOpen,
		attemptsChecked,
	};
};

/**
 * Resynchronise un Payment contre la source de vérité /status — MÊME décision
 * et MÊME exécution que le webhook (afribapayWebhookDecision +
 * applyAfribapayPayinOutcome) : le /status ne peut jamais approuver ce que le
 * webhook a refusé, ni rétrograder un payin confirmé. Chaque passage consigne
 * le journal d'exécution (lastPolledAt, lastPollResult) sur le Payment.
 *
 * @param {boolean} [immediateFailure=false] lectures espacées (revérification
 *   stale, une heure d'écart) : une seule lecture d'échec suffit — les deux
 *   lectures consécutives du polling rapide protègent du cas « l'utilisateur
 *   reprend son paiement » entre deux cycles serrés (30 s). Comportement
 *   AfricaSend (resolveStaleTransaction : un seul relevé suffit).
 * @returns {Promise<"already"|"succeeded"|"failed"|"cancelled"|"pending"|"skip"|"alert"|"unknown">}
 *   'skip' : erreur API (backoff posé), 'pending' : AfriBaPay n'a pas encore
 *   conclu, 'already' : payin déjà confirmé.
 */
const resynchronizePayin = async ({
	payment,
	token,
	source = "afribapay-status-worker",
	immediateFailure = false,
}) => {
	// Un payin confirmé n'est pas ré-interrogé : succeeded/refunded/
	// partiellement remboursé ne rétrograde jamais (garde-fou du /status).
	if (CONFIRMED_PAYMENT_STATUSES.includes(payment.status)) return "already";

	let check;
	try {
		check = await checkAfribapayPayinStatus({ payment, token });
	} catch (err) {
		const delay = recordApiErrorBackoff(payment.paymentId);
		console.error(
			`[Status AfriBaPay] Erreur /status du paiement ${payment.paymentId} (prochaine lecture dans ${Math.round(delay / 1000)}s):`,
			redactSecrets(err?.message ?? err),
		);
		return "skip";
	}
	clearApiErrorBackoff(payment.paymentId);

	const rawStatus = check.rawStatus;
	const mappedStatus = mapAfribapayPayinStatus(rawStatus);
	const payloadData =
		check.payload?.data && typeof check.payload.data === "object"
			? check.payload.data
			: check.payload || {};

	// ── Journal d'exécution : chaque passage consigne lecture et horodatage ──
	// (jamais `{ ...sous-document }` : utils/paymentDetails.js)
	mergeAfribapayDetails(payment, {
		lastPolledAt: new Date(),
		lastPollResult: rawStatus || "UNREADABLE",
	});

	// Confirmation réelle (SUCCESS… via /status) : décision et transition,
	// exactement comme le webhook — payinConfirmedOrderId posé au passage.
	if (check.confirmed && !check.mismatch) {
		const payinOrderId = confirmedPayinOrderId(check);
		const decision = afribapayWebhookDecision({
			payment,
			payinOrderId,
			rawStatus,
			mismatch: null,
		});
		await applyAfribapayPayinOutcome({
			payment,
			decision,
			payinOrderId,
			rawStatus,
			data: payloadData,
			requestInfo: { source },
		});
		return "succeeded";
	}

	// Échec/annulation renvoyés par /status : FAILED/EXPIRED/REJECTED exigent
	// deux lectures consécutives (reprise de paiement possible), CANCELLED est
	// définitif — jamais si un essai reste ouvert (attemptStillOpen).
	if (
		!check.attemptStillOpen &&
		(mappedStatus === "failed" || mappedStatus === "cancelled")
	) {
		let { write, count } = finalFailureReady(
			rawStatus,
			payment.paymentDetails.afribapay.failedReadCount,
		);
		if (!write && immediateFailure) write = true; // revérification espacée : lecture unique suffisante
		if (write) {
			const payinOrderId = check.payinOrderId;
			const decision = afribapayWebhookDecision({
				payment,
				payinOrderId,
				rawStatus,
				mismatch: null,
			});
			await applyAfribapayPayinOutcome({
				payment,
				decision,
				payinOrderId,
				rawStatus,
				data: payloadData,
				requestInfo: { source },
			});
			return decision.kind === "cancelled" ? "cancelled" : "failed";
		}
		payment.paymentDetails.afribapay.failedReadCount = count;
		await payment.save();
		console.log(
			`[Status AfriBaPay] ${payment.paymentId} → ${rawStatus} (lecture ${count}/${STATUS_FINAL_FAILURE_READS}, écriture remise)`,
		);
		return "pending";
	}

	// Confirmation non conforme (montant/devise), PENDING intermédiaire,
	// réponse illisible : décision pure (alerte admin dédupliquée par claim
	// quand c'est contradictoire), état inchangé — le /status n'invente pas.
	const decision = afribapayWebhookDecision({
		payment,
		payinOrderId: check.payinOrderId,
		rawStatus,
		mismatch: check.mismatch || null,
	});
	if (decision.action === "alert" || decision.action === "apply-succeeded") {
		await applyAfribapayPayinOutcome({
			payment,
			decision,
			payinOrderId: check.payinOrderId,
			rawStatus,
			data: { mismatch: check.mismatch || undefined },
			requestInfo: { source },
		});
		return decision.action === "alert" ? "alert" : "succeeded";
	}
	await payment.save();
	return pendingResultFor(check);
};

/**
 * Résultat pour un passage qui ne tranche pas : AfriBaPay PENDING = toujours
 * en attente ; inconnu (NOT_FOUND) sans aucun essai interrogé = le payin n'existe
 * probablement pas — resolveStalePayment décidera au-delà du délai imparti.
 */
const pendingResultFor = (check) =>
	check.notFound && !(check.attemptsChecked || []).length ? "unknown" : "pending";

// ─────────────────────────────────────────────
//  WORKER : réconciliation planifiée des payins en attente
// ─────────────────────────────────────────────

let _pollerInterval = null;
let _isRunning = false;

/**
 * Query des paiements sortis DE LA FENÊTRE DE POLLING RAPIDE (> STATUS_MAX_AGE_MS)
 * et non relus depuis STATUS_STALE_RECHECK_MS : mobile_money toujours en
 * attente, revérification espacée (la doc AfriBaPay demande d'éviter les
 * requêtes /status excessives). Fonction pure (testée sans base).
 * @param {number} now Date.now()
 */
const buildStaleQuery = (now = Date.now()) => {
	const staleBefore = new Date(now - STATUS_MAX_AGE_MS);
	const recheckBefore = new Date(now - STATUS_STALE_RECHECK_MS);
	return {
		method: "mobile_money",
		status: { $in: PENDING_POLL_STATUSES },
		createdAt: { $lt: staleBefore },
		$or: [
			{ "paymentDetails.afribapay.lastPolledAt": { $exists: false } },
			{ "paymentDetails.afribapay.lastPolledAt": null },
			{ "paymentDetails.afribapay.lastPolledAt": { $lte: recheckBefore } },
		],
	};
};

/**
 * Termine un paiement sortant des cycles normaux (revérification espacée) :
 *  - resynchronisation normale d'abord (le /status reste la source de vérité,
 *    une seule lecture d'échec suffit à ce cadencement) ;
 *  - au-delà de STATUS_GIVE_UP_MS (24 h), annulation SEULEMENT si le payin n'a
 *    jamais pu être transmis à AfriBaPay (aucun essai mémorisé) ou est
 *    NOT_FOUND sans aucun essai interrogé — l'annulation est alors sûre
 *    (aucun paiement n'a pu être reçu) et libère la commande ;
 *  - un PENDING AfriBaPay n'est JAMAIS annulé automatiquement : alerte admin
 *    une seule fois (claim anomaly:payin-pending-24h:<paymentId>).
 * @returns {Promise<"already"|"succeeded"|"failed"|"cancelled"|"pending"|"skip"|"alerted">}
 */
const resolveStalePayment = async ({ payment, token, source = "afribapay-status-worker" }) => {
	const result = await resynchronizePayin({
		payment,
		token,
		source,
		immediateFailure: true,
	});
	if (result !== "pending" && result !== "unknown") return result;

	const age = Date.now() - new Date(payment.createdAt).getTime();
	if (age < STATUS_GIVE_UP_MS) return "pending";

	// Jamais envoyé à AfriBaPay (aucun essai mémorisé — requestPayin n'est
	// jamais arrivé à son terme) ou inconnu d'AfriBaPay sans essai interrogé :
	// aucun paiement n'a pu être reçu, l'annulation est sûre.
	const afribapay = payment.paymentDetails?.afribapay || {};
	const neverRequested = !afribapay.payinOrderId && !afribapay.attempt;
	if (!neverRequested && result !== "unknown") {
		// Toujours PENDING chez AfriBaPay après 24h : laissé en attente — un
		// PENDING peut encore aboutir, on n'annule jamais sur le temps écoulé.
		// Les admins sont prévenus une seule fois (dédupliqué par claim).
		await alertAfribapayAnomaly({
			key: `anomaly:payin-pending-24h:${payment.paymentId}`,
			message: `Le payin du paiement ${payment.paymentId} est toujours en attente chez AfriBaPay après 24h (dernier statut lu: ${afribapay.lastPollResult || "n/a"}). Il n'est PAS annulé automatiquement (un PENDING peut encore aboutir) : vérifiez son statut réel sur le dashboard AfriBaPay avant toute action.`,
			detail: `PENDING AfriBaPay > 24h : ${payment.paymentId}`,
			data: {
				paymentId: payment.paymentId,
				lastPollResult: afribapay.lastPollResult || null,
				payinOrderId: afribapay.payinOrderId || null,
			},
		});
		return "alerted";
	}

	payment.status = "cancelled";
	payment.attempts.push({
		status: "cancelled",
		errorMessage: neverRequested
			? "Payin jamais transmis à AfriBaPay — annulé après 24h (give-up)"
			: "Payin inconnu d'AfriBaPay (NOT_FOUND) — annulé après 24h (give-up)",
	});
	await payment.save();
	logAudit({
		action: "PAYMENT_CONFIRMED",
		status: "failure",
		targetId: payment._id,
		targetType: "Payment",
		details: {
			paymentId: payment.paymentId,
			reason: neverRequested ? "give-up-24h-jamais-envoye" : "give-up-24h-not-found",
			source,
		},
	});
	console.log(
		`[Status AfriBaPay] 🚫 ${payment.paymentId} → cancelled (give-up 24h, ${neverRequested ? "jamais envoyé" : "NOT_FOUND"})`,
	);
	return "cancelled";
};

/**
 * Un cycle du worker. Deux passes :
 *  1. fenêtre rapide : payins mobile_money encore en attente, créés il y a
 *     plus de STATUS_GRACE_PERIOD_MS (le webhook doit arriver d'abord) et
 *     moins de STATUS_MAX_AGE_MS ;
 *  2. paiements sortis de la fenêtre : revérification espacée + give-up 24h
 *     (resolveStalePayment).
 * Un seul token pour tout le cycle (la doc AfriBaPay demande de le réutiliser),
 * obtenu seulement si un payin est à interroger. Idempotence : chaque couple
 * (paiement, intervalle) est réclamé une fois par claim WebhookEvent clé
 * `poll:<paymentId>:<bucket>` — fail-open si l'infra casse.
 */
const pauseBetweenPayins = () =>
	new Promise((resolve) => setTimeout(resolve, STATUS_POLL_PAUSE_MS));

const runPollCycle = async () => {
	if (_isRunning) {
		console.log("[Status AfriBaPay] Cycle déjà en cours, ignoré.");
		return;
	}
	if (!isAfribapayConfigured()) {
		console.warn("[Status AfriBaPay] 🔕 AfriBaPay non configuré : cycle ignoré.");
		return;
	}
	_isRunning = true;

	try {
		const now = Date.now();

		// Un seul token pour tout le cycle (doc AfriBaPay : le réutiliser),
		// demandé seulement si un payin est à interroger.
		let cycleToken;
		const getCycleToken = async () => {
			if (cycleToken === undefined) {
				try {
					cycleToken = await getAccessToken();
				} catch (err) {
					console.error(
						"[Status AfriBaPay] ❌ Token AfriBaPay indisponible — cycle passé:",
						err.message,
					);
					cycleToken = null;
				}
			}
			return cycleToken;
		};

		// Idempotence entre plusieurs workers (multi-instances) : chaque couple
		// (paiement, intervalle) n'est traité qu'une fois ; fail-open si la
		// base de claims est en panne (interroger deux fois /status reste sûr,
		// l'exécution reste protégée par la lecture du statut réel).
		const bucket = Math.floor(now / STATUS_POLL_INTERVAL_MS);
		const claimPollSlot = async (paymentId) => {
			try {
				return await WebhookEvent.claimEvent(`poll:${paymentId}:${bucket}`);
			} catch (err) {
				console.error(
					`[Status AfriBaPay] claim du slot poll ${paymentId} en erreur (fail-open):`,
					err.message,
				);
				return true;
			}
		};

		// ── Passe 1 : fenêtre de polling rapide ──
		const recent = await Payment.find({
			method: "mobile_money",
			status: { $in: PENDING_POLL_STATUSES },
			createdAt: {
				$lte: new Date(now - STATUS_GRACE_PERIOD_MS), // le webhook doit arriver d'abord
				$gte: new Date(now - STATUS_MAX_AGE_MS), // sortis de la fenêtre → passe 2
			},
		})
			.sort({ createdAt: 1 })
			.limit(STATUS_BATCH_SIZE);

		if (recent.length === 0) {
			console.log("[Status AfriBaPay] Aucun payin à resynchroniser (fenêtre rapide).");
		} else {
			console.log(`[Status AfriBaPay] 🔍 ${recent.length} payin(s) en attente à resynchroniser...`);
			for (const payment of recent) {
				if (isBackedOff(payment.paymentId, now)) {
					console.log(`[Status AfriBaPay] ⏭️ ${payment.paymentId} en backoff — ignoré`);
					continue;
				}
				if (!(await claimPollSlot(payment.paymentId))) continue;
				const token = await getCycleToken();
				if (!token) break;
				try {
					await resynchronizePayin({ payment, token });
				} catch (err) {
					console.error(
						`[Status AfriBaPay] Erreur de resynchronisation ${payment.paymentId}:`,
						err.message,
					);
				}
				// Petite pause entre deux payins pour ne pas marteler l'API
				await pauseBetweenPayins();
			}
		}

		// ── Passe 2 : paiements anciens (revérification espacée + give-up) ──
		try {
			const stale = await Payment.find(buildStaleQuery(now))
				.sort({ createdAt: 1 })
				.limit(STATUS_STALE_BATCH_SIZE);
			if (stale.length > 0) {
				console.log(
					`[Status AfriBaPay] 🕰️ Revérification espacée de ${stale.length} paiement(s) ancien(s)...`,
				);
				for (const payment of stale) {
					if (!(await claimPollSlot(payment.paymentId))) continue;
					const token = await getCycleToken();
					if (!token) break;
					try {
						await resolveStalePayment({ payment, token });
					} catch (err) {
						console.error(
							`[Status AfriBaPay] Erreur de résolution ${payment.paymentId}:`,
							err.message,
						);
					}
					await pauseBetweenPayins();
				}
			}
		} catch (err) {
			console.error("[Status AfriBaPay] Erreur de passe ancienne:", err.message);
		}

		console.log("[Status AfriBaPay] ✅ Cycle terminé.");
	} catch (err) {
		console.error("[Status AfriBaPay] Erreur fatale de cycle:", err.message);
	} finally {
		_isRunning = false;
	}
};

// ─────────────────────────────────────────────
//  DÉMARRAGE / ARRÊT DU SERVICE
// ─────────────────────────────────────────────
const startPollingService = () => {
	if (_pollerInterval) {
		console.log("[Status AfriBaPay] Vérification /status déjà démarrée.");
		return;
	}
	console.log(
		`[Status AfriBaPay] 🚀 Vérification /status démarrée (intervalle: ${STATUS_POLL_INTERVAL_MS / 1000}s, grâce: ${STATUS_GRACE_PERIOD_MS / 1000}s, maxAge: ${STATUS_MAX_AGE_MS / 60000}min)`,
	);
	// Premier cycle différé : laisse le serveur finir son démarrage.
	setTimeout(runPollCycle, 30_000);
	_pollerInterval = setInterval(runPollCycle, STATUS_POLL_INTERVAL_MS);
};

const stopPollingService = () => {
	if (_pollerInterval) {
		clearInterval(_pollerInterval);
		_pollerInterval = null;
		console.log("[Status AfriBaPay] Vérification /status arrêtée.");
	}
};

/**
 * Déclenchement manuel d'un cycle (route admin du Jour 85 ou script cron).
 * Renvoie un résumé exploitable par l'appelant.
 */
const triggerManualSync = async () => {
	console.log("[Status AfriBaPay] 🔄 Synchronisation manuelle déclenchée.");
	await runPollCycle();
	return { message: "Synchronisation manuelle terminée." };
};

module.exports = {
	STATUS_GIVE_UP_MS,
	STATUS_FINAL_FAILURE_READS,
	PENDING_POLL_STATUSES,
	finalFailureReady,
	queryAfribapayPayinStatus,
	checkAfribapayPayinStatus,
	resynchronizePayin,
	buildStaleQuery,
	resolveStalePayment,
	runPollCycle,
	startPollingService,
	stopPollingService,
	triggerManualSync,
	// Crochets pour les tests (état in-memory des backoffs)
	_internal: { isBackedOff, recordApiErrorBackoff, clearApiErrorBackoff },
};

