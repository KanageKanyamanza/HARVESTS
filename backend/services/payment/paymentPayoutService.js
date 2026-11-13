// Vendeurs payables (Jour 80) : commandes livrées dont l'encaissement est acté
// (payin confirmé ou règlement de la livraison), regroupées par vendeur avec le
// montant dû au taux de commission en vigueur (config/payout.js). Le pays du
// reversement vient du pays du vendeur ; AfriBaPay ne paie que des numéros
// des pays couverts (config/afribapayOperators.js).
//
// Jour 81 : la lecture seule devient exécution. Le même service prépare le
// Payout, vérifie le float AfriBaPay, prend un verrou atomique anti-double-
// envoi, puis POSTe sur l'URL payout avec un order_id unique par tentative
// (utils/payoutOrderId.js). Les statuts ambigus sont distingués des incidents
// réseau (le webhook payout et les alertes admin arrivent au Jour 82, les frais
// réels au Jour 84).
const axios = require("axios");
const Order = require("../../models/Order");
const User = require("../../models/User");
const Payout = require("../../models/Payout");
const {
	getCommissionRate,
	getPayoutHoldHours,
	getXofToXafRate,
	COUNTRY_PAYOUT_CURRENCY,
	SETTLED_PAYMENT_STATUSES,
	DELIVERED_STATUSES,
	EXCLUDED_ORDER_STATUSES,
	EXCLUDED_ITEM_STATUSES,
} = require("../../config/payout");
const {
	AFRIBAPAY_BASE_URL,
	AFRIBAPAY_PAYOUT_URL,
	AFRIBAPAY_MERCHANT_KEY,
	isAfribapayConfigured,
} = require("../../config/afribapay");
const { COUNTRIES, normalizeCountry, listOperatorsForCountry } = require("../../config/afribapayOperators");
const { COUNTRY_NAME_TO_CODE, COUNTRY_CODE_TO_NAME } = require("../../utils/countryMapper");
const { toAfribapayOperator } = require("../../utils/afribapayOperator");
const { formatPhoneForAfribapay, parseAfribapayBody, redactSecrets } = require("../../utils/afribapayUtils");
const { getAccessToken, ipv4Agent, withRetry } = require("../../utils/afribapayClient");
const { invalidateAfribapayTokenOn401 } = require("../../utils/afribapayTokenCache");
const { payoutOrderIdFor } = require("../../utils/payoutOrderId");
const { backendPublicUrl } = require("./paymentAfribapayService");

// Champs vendeur lus pour décider du reversement. payoutAccount.* est
// select:false (models/User.js) : inclusion explicite des feuilles, car
// « +payoutAccount » sur le sous-objet n'est pas résolu par Mongoose 7 dans
// une projection inclusive (il resterait un champ littéral « +payoutAccount »).
const SELLER_FIELDS =
	"userType country phone +payoutAccount.operator +payoutAccount.phone isActive isApproved isTestAccount";

const idKey = (id) => (id === undefined || id === null ? "" : String(id));

// ---------------------------------------------------------------------------
// Pays et type de vendeur
// ---------------------------------------------------------------------------

// Nom de pays (minuscules) → code ISO. utils/countryMapper.getCountryCode est
// volontairement évité : il retombe sur SN pour tout pays inconnu, ce qui
// reverserait au Sénégal un vendeur établi en France.
const COUNTRY_LOOKUP = (() => {
	const map = new Map();
	for (const [name, code] of Object.entries(COUNTRY_NAME_TO_CODE)) {
		map.set(name.toLowerCase(), code);
	}
	// Inverse de COUNTRY_CODE_TO_NAME (Niger, Tchad, République centrafricaine…
	// n'existent que dans ce sens).
	const codeEntries = Object.entries(COUNTRY_CODE_TO_NAME).filter(([key]) => /^[A-Z]{2}$/.test(key));
	for (const [code, name] of codeEntries) {
		if (!map.has(name.toLowerCase())) map.set(name.toLowerCase(), code);
	}
	// Synonymes (« cameroun », « Ivory Coast »…) → nom canonique → code
	for (const [synonym, name] of Object.entries(COUNTRY_CODE_TO_NAME)) {
		const code = map.get(String(name).toLowerCase());
		if (code && !map.has(synonym.toLowerCase())) map.set(synonym.toLowerCase(), code);
	}
	return map;
})();

/**
 * Code ISO AfriBaPay du pays du vendeur (« Sénégal », « sn », « Niger »…), ou
 * null si le pays est inconnu ou hors AfriBaPay — jamais de repli sur SN.
 * @param {string} country valeur brute de User.country
 * @returns {string|null}
 */
const resolvePayoutCountry = (country) => {
	if (country === undefined || country === null) return null;
	const raw = String(country).trim();
	if (!raw) return null;
	const code = COUNTRY_LOOKUP.get(raw.toLowerCase()) || raw;
	return normalizeCountry(code);
};

/**
 * Type de vendeur du Payout : producer, restaurateur, sinon other.
 * @param {string} userType
 */
const payoutSellerType = (userType) =>
	userType === "producer" || userType === "restaurateur" ? userType : "other";

// ---------------------------------------------------------------------------
// Encaissement et livraison
// ---------------------------------------------------------------------------

/**
 * Encaissement acté : payin confirmé (mobile money, PayPal) ou espèces
 * marquées réglées à la livraison. Une commande livrée mais non réglée n'est
 * jamais reversée. Statut seul : la règle plus stricte des espèces
 * (confirmation admin) est appliquée par groupPayableBySeller.
 */
const isCollectionSettled = (order) => SETTLED_PAYMENT_STATUSES.includes(order?.payment?.status);

const sellerSegment = (order, sellerId) =>
	(order?.segments || []).find((segment) => idKey(segment.seller) === idKey(sellerId));

const hasSegments = (order) => Array.isArray(order?.segments) && order.segments.length > 0;

// Vendeurs d'une commande : segments s'il y en a, sinon items[].seller ou
// order.seller (commandes antérieures aux segments).
const sellersOfOrder = (order) => {
	const ids = hasSegments(order)
		? order.segments.map((segment) => segment.seller)
		: [...(order?.items || []).map((i) => i.seller || order.seller), order?.seller];
	const unique = new Map();
	for (const id of ids) if (id) unique.set(idKey(id), id);
	return [...unique.values()];
};

/**
 * Part du vendeur livrée : statut de son segment (orderStatusService garde les
 * segments synchrones), sinon statut de la commande pour un vendeur présent
 * dans items[].seller ou order.seller. Une commande annulée, remboursée ou en
 * litige n'est jamais livrée au sens du reversement.
 */
const isSellerLineDelivered = (order, sellerId) => {
	if (!order || EXCLUDED_ORDER_STATUSES.includes(order.status)) return false;
	if (hasSegments(order)) {
		const segment = sellerSegment(order, sellerId);
		return !!segment && DELIVERED_STATUSES.includes(segment.status);
	}
	const isSeller = sellersOfOrder(order).some((id) => idKey(id) === idKey(sellerId));
	return isSeller && DELIVERED_STATUSES.includes(order.status);
};

// ---------------------------------------------------------------------------
// Assiette et commission
// ---------------------------------------------------------------------------

// Articles du vendeur, comptés UNE fois : orderService les stocke à la fois
// dans order.items et dans segments[].items.
const sellerItems = (order, sellerId) => {
	const segment = hasSegments(order) ? sellerSegment(order, sellerId) : null;
	if (segment && Array.isArray(segment.items) && segment.items.length > 0) return segment.items;
	if (hasSegments(order) && !segment) return [];
	return (order?.items || []).filter((i) => idKey(i.seller || order.seller) === idKey(sellerId));
};

/**
 * Assiette du vendeur sur une commande : Σ des articles non annulés / rejetés
 * / remboursés. Livraison, taxes et coupon restent hors assiette. Arrondie à
 * l'unité (francs CFA sans centimes).
 */
const sellerGrossForOrder = (order, sellerId) => {
	const gross = sellerItems(order, sellerId)
		.filter((i) => !EXCLUDED_ITEM_STATUSES.includes(i.status))
		.reduce((total, i) => {
			const line = Number.isFinite(i.totalPrice)
				? i.totalPrice
				: (Number(i.unitPrice) || 0) * (Number(i.quantity) || 0);
			return total + line;
		}, 0);
	return Math.round(gross);
};

/**
 * Commission et net d'une ligne ; l'arrondi se fait par ligne (Math.round),
 * jamais sur le total du Payout.
 * @param {{ gross: number, rate: number }} params
 * @returns {{ gross: number, commission: number, net: number }}
 */
const computePayoutLine = ({ gross, rate }) => {
	if (typeof gross !== "number" || !Number.isFinite(gross) || gross < 0) {
		throw new TypeError(`Assiette de reversement invalide : ${gross}`);
	}
	if (typeof rate !== "number" || !Number.isFinite(rate) || rate < 0 || rate >= 1) {
		throw new TypeError(`Taux de commission invalide : ${rate}`);
	}
	const commission = Math.round(gross * rate);
	return { gross, commission, net: gross - commission };
};

// ---------------------------------------------------------------------------
// Requête des commandes payables
// ---------------------------------------------------------------------------

/**
 * Filtre Mongo des commandes candidates (fonction pure, nouvel objet à chaque
 * appel). Les contraintes vendeur / date passent par $and pour ne pas écraser
 * le $or « livré ».
 * @param {{ sellerId?: *, since?: Date }} [options]
 */
const buildPayableOrdersQuery = ({ sellerId, since } = {}) => {
	const and = [
		{
			$or: [
				{ status: { $in: [...DELIVERED_STATUSES] } },
				{ "segments.status": { $in: [...DELIVERED_STATUSES] } },
			],
		},
		// Jour 81 : une commande déjà programmée (scheduled), payée (paid) ou
		// définitivement échouée (failed) ne ressort plus. L'absence de
		// marqueur — commandes antérieures au Jour 81 — reste « pending ».
		{ $or: [{ payoutState: "pending" }, { payoutState: { $exists: false } }] },
	];
	if (sellerId) {
		and.push({
			$or: [{ "segments.seller": sellerId }, { "items.seller": sellerId }, { seller: sellerId }],
		});
	}
	if (since) and.push({ updatedAt: { $gte: new Date(since) } });

	return {
		"payment.status": { $in: [...SETTLED_PAYMENT_STATUSES] },
		status: { $nin: [...EXCLUDED_ORDER_STATUSES] },
		$and: and,
	};
};

// ---------------------------------------------------------------------------
// Exécution du payout (Jour 81)
// ---------------------------------------------------------------------------

// Statuts d'un Payout qui ne doivent plus être renvoyés : un succès, un échec
// définitif, un litige ou une annulation demandent une action humaine.
const PAYOUT_TERMINAL_STATUSES = ["succeeded", "failed", "ambiguous", "cancelled"];

// Statuts d'une commande qui ne sont plus payables (marqueur payoutState).
const PAYOUT_ORDER_EXCLUDED_STATES = ["scheduled", "paid", "failed"];

// Statuts bruts AfriBaPay (doc opérateur, tolérants sur les variantes).
const PAYOUT_SUCCESS_STATUSES = ["SUCCESS", "SUCCEEDED", "COMPLETED", "PAID"];
const PAYOUT_FAILURE_STATUSES = ["FAILED", "REJECTED", "EXPIRED", "CANCELLED", "CANCELED", "DECLINED"];

/** Erreur métier du payout, porteuse d'un code lisible (et de son contexte). */
class PayoutError extends Error {
	constructor(code, details = {}) {
		super(code);
		this.name = "PayoutError";
		this.code = code;
		Object.assign(this, details);
	}
}

/**
 * Traduit un statut brut AfriBaPay en statut Payout :
 *  - succès explicite → `succeeded` ;
 *  - refus clair de l'opérateur (FAILED, REJECTED, EXPIRED, CANCELLED) → `failed` ;
 *  - tout le reste (statut inconnu, réponse illisible) → `ambiguous`.
 * Fonction pure (aucun appel réseau).
 * @param {string|null|undefined} rawStatus
 * @returns {"succeeded"|"failed"|"ambiguous"}
 */
const mapPayoutProcessorStatus = (rawStatus) => {
	const status = String(rawStatus || "").toUpperCase();
	if (PAYOUT_SUCCESS_STATUSES.includes(status)) return "succeeded";
	if (PAYOUT_FAILURE_STATUSES.includes(status)) return "failed";
	return "ambiguous";
};

/**
 * Délai de garde (Jour 81) : une commande livrée n'est payable qu'à l'expiration
 * de `deliveredAt + holdHours` (72 h par défaut, décision utilisateur). Sans
 * date de livraison, la fonction répond « pas payable » — c'est à l'appelant de
 * décider du repli (les commandes antérieures au Jour 81 n'ont pas de date).
 * Fonction pure.
 * @param {object} order commande (au moins `deliveredAt`)
 * @param {{ now?: number, holdHours?: number }} [options]
 * @returns {{ payable: boolean, reason?: string, eligibleAt?: Date }}
 */
const isOrderPayableNow = (order, { now = Date.now(), holdHours = getPayoutHoldHours() } = {}) => {
	const deliveredAt = order?.deliveredAt ? new Date(order.deliveredAt) : null;
	if (!deliveredAt || Number.isNaN(deliveredAt.getTime())) {
		return { payable: false, reason: "payout_delivery_date_missing" };
	}
	const eligibleAt = new Date(deliveredAt.getTime() + Number(holdHours) * 60 * 60 * 1000);
	if (eligibleAt.getTime() > now) return { payable: false, reason: "payout_hold_not_eligible", eligibleAt };
	return { payable: true };
};

/**
 * Conversion XOF → XAF d'un montant, arrondie à l'unité (francs CFA sans
 * centimes). Un taux invalide retombe sur 1 plutôt que de produire un montant
 * aberrant. Fonction pure.
 * @param {number} amount montant en XOF
 * @param {number} rate taux XOF → XAF
 * @returns {number}
 */
const convertXofToXaf = (amount, rate) => {
	const value = Number(amount);
	if (!Number.isFinite(value)) return 0;
	const factor = Number.isFinite(Number(rate)) && Number(rate) > 0 ? Number(rate) : 1;
	return Math.round(value * factor);
};

/** Numéro de la prochaine tentative d'un Payout (1 = premier envoi). */
const nextPayoutAttempt = (payout) =>
	(payout.attempts || []).reduce((max, attempt) => Math.max(max, Number(attempt?.attempt) || 0), 0) + 1;

/**
 * Charge utile du POST /pay/payout (pur, testable sans réseau). AfriBaPay refuse
 * tout champ hors contrat : les 9 clés ci-dessous, rien d'autre.
 * @param {object} payout Payout (amount déjà dans `currency`)
 * @param {{ attempt?: number }} [options]
 */
const buildPayoutPayload = (payout, { attempt = 1 } = {}) => ({
	merchant_key: AFRIBAPAY_MERCHANT_KEY,
	operator: payout.operator,
	country: payout.country,
	phone_number: payout.phone,
	amount: Math.round(Number(payout.amount) || 0),
	currency: payout.currency,
	order_id: payoutOrderIdFor(payout._id, attempt),
	notify_url: `${backendPublicUrl()}/api/v1/payouts/afribapay/webhook`,
	lang: "fr",
});

/**
 * Solde AfriBaPay disponible pour les payouts (par pays si fourni).
 * @param {string} token jeton AfriBaPay
 * @param {{ country?: string }} [options]
 * @returns {Promise<{ available: number, currency: string, raw: * }>}
 */
const fetchPayoutBalance = async (token, { country } = {}) => {
	const query = new URLSearchParams({ service: "payout" });
	if (country) query.set("country", country);

	const response = await axios.get(`${AFRIBAPAY_BASE_URL}/balance?${query.toString()}`, {
		headers: { Authorization: `Bearer ${token}` },
		httpsAgent: ipv4Agent,
		timeout: 10_000,
	});

	const payload = parseAfribapayBody(response.data) ?? response.data;
	const data = payload?.data && typeof payload.data === "object" ? payload.data : payload;
	const available = Number(data?.available ?? data?.balance ?? data?.amount ?? 0);
	return {
		available: Number.isFinite(available) ? available : 0,
		currency: String(data?.currency || "").toUpperCase(),
		raw: payload,
	};
};

/**
 * Verrou atomique anti-double-envoi : un seul travailleur fait passer le Payout
 * de `pending` (ou `network_issue`) à `processing`. L'update conditionnel est
 * atomique côté MongoDB — deux workers qui partent en même temps, un seul gagne
 * et reçoit le document, l'autre reçoit `null`.
 * @param {*} payoutId
 * @returns {Promise<object|null>}
 */
const claimPayout = (payoutId) =>
	Payout.findOneAndUpdate(
		{ _id: payoutId, status: { $in: ["pending", "network_issue"] } },
		{ $set: { status: "processing", "afribapay.lockedAt": new Date() } },
		{ new: true },
	);

/**
 * Envoie UNE tentative de payout à AfriBaPay. Le retry réseau (withRetry) rejoue
 * le MÊME order_id : AfriBaPay déduplique, pas de double paiement.
 *  - réponse + statut SUCCESS → `succeeded` ;
 *  - réponse + refus opérateur → `failed` (définitif) ;
 *  - réponse illisible ou inattendue → `ambiguous` (à enquêter) ;
 *  - pas de réponse (réseau, timeout après retry) → PayoutError
 *    `payout_network_issue` : l'essai est consommé, une relance prendra un
 *    nouvel order_id.
 * @param {object} payout
 * @param {{ token: string, attempt?: number }} params
 * @returns {Promise<{ orderId: string, status: string, processorStatus: string|null, transactionId: string|null, error: string|null, sentAt: Date }>}
 */
const sendPayout = async (payout, { token, attempt = 1 } = {}) => {
	if (!isAfribapayConfigured()) throw new PayoutError("afribapay_not_configured");

	const payload = buildPayoutPayload(payout, { attempt });
	const orderId = payload.order_id;
	const sentAt = new Date();

	console.log("Calling AfriBaPay Payout with:", redactSecrets(JSON.stringify(payload, null, 2)));

	try {
		const response = await withRetry(
			() =>
				axios.post(AFRIBAPAY_PAYOUT_URL, payload, {
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					httpsAgent: ipv4Agent,
				}),
			{ retries: 1, baseDelayMs: 1000, label: "AfriBaPay Payout" },
		);

		// AfriBaPay peut coller un dump de debug PHP devant le JSON.
		const body = parseAfribapayBody(response.data) ?? response.data;
		const data = body?.data && typeof body.data === "object" ? body.data : body;
		const processorStatus = String(data?.status || body?.status || "").toUpperCase() || null;
		const status = mapPayoutProcessorStatus(processorStatus);
		const transactionId = data?.transaction_id || body?.transaction_id || null;

		return {
			orderId,
			status,
			processorStatus,
			transactionId,
			error: status === "failed" ? redactSecrets(String(data?.message || processorStatus || "payout_failed")) : null,
			sentAt,
		};
	} catch (error) {
		invalidateAfribapayTokenOn401(error);

		const providerMessage = parseAfribapayBody(error.response?.data)?.error?.message;
		const rawMessage = error.response?.data ?? error.message;

		if (!error.response) {
			// Pas de réponse : la demande a pu arriver chez AfriBaPay. L'essai
			// est consommé, le Payout passera en `network_issue`.
			console.error("AfriBaPay Payout Error:", redactSecrets(String(error.message || "payout network")));
			throw new PayoutError("payout_network_issue", {
				orderId,
				error: redactSecrets(String(error.message || "payout network")),
			});
		}

		// Réponse HTTP d'erreur (validation, refus) : le statut réel est
		// inconnu — à enquêter (webhook /status du Jour 82), jamais de relance
		// automatique.
		console.error("AfriBaPay Payout Error:", redactSecrets(String(rawMessage)));
		return {
			orderId,
			status: "ambiguous",
			processorStatus: null,
			transactionId: null,
			error: redactSecrets(String(providerMessage || rawMessage || "payout_rejected")),
			sentAt,
		};
	}
};

/**
 * Exécute un Payout : vérifie le float, prend le verrou, envoie, enregistre la
 * tentative et applique la transition de statut.
 *  - AfriBaPay non configuré → `afribapay_not_configured` (aucun appel) ;
 *  - statut terminal → `payout_terminal` (aucun appel) ;
 *  - float insuffisant → `insufficient_float` (aucun verrou, aucune tentative,
 *    le Payout reste `pending`) ;
 *  - verrou déjà pris → `payout_not_pending` (un autre travailleur gagne).
 * @param {object} payout Payout (document Mongoose ou objet équivalent)
 * @param {{ token?: string, claimLock?: Function, sendAttempt?: Function, fetchBalance?: Function }} [deps]
 * @returns {Promise<{ payout: object, attempt: object, outcome: string, alert: boolean }>}
 */
const executePayout = async (
	payout,
	{ token, claimLock = claimPayout, sendAttempt = sendPayout, fetchBalance = fetchPayoutBalance } = {},
) => {
	if (!isAfribapayConfigured()) throw new PayoutError("afribapay_not_configured");
	if (PAYOUT_TERMINAL_STATUSES.includes(payout.status)) {
		throw new PayoutError("payout_terminal", { status: payout.status });
	}

	const resolvedToken = token || (await getAccessToken());

	// Le solde est vérifié AVANT le verrou : un float insuffisant ne doit pas
	// consommer le verrou ni laisser le Payout en `processing`.
	const balance = await fetchBalance(resolvedToken, { country: payout.country });
	const amount = Number(payout.amount) || 0;
	if (!(balance.available >= amount)) {
		throw new PayoutError("insufficient_float", { available: balance.available, amount });
	}

	const claimed = await claimLock(payout._id);
	if (!claimed) throw new PayoutError("payout_not_pending", { payoutId: payout._id });

	const attempt = nextPayoutAttempt(payout);
	payout.status = "processing";

	const setAfribapay = (patch) => {
		payout.afribapay = {
			...(payout.afribapay || {}),
			...patch,
			lastPolledAt: new Date(),
		};
	};

	let result;
	try {
		result = await sendAttempt(payout, { token: resolvedToken, attempt });
	} catch (error) {
		const orderId = error?.orderId || payoutOrderIdFor(payout._id, attempt);
		const record = {
			attempt,
			orderId,
			status: "network_issue",
			processorStatus: null,
			transactionId: null,
			error: redactSecrets(String(error?.message || "payout_network_issue")),
			sentAt: new Date(),
		};
		payout.attempts.push(record);
		setAfribapay({
			payoutOrderId: orderId,
			attempt,
			transactionId: null,
			processorStatus: null,
			lastPollResult: null,
		});
		payout.status = "network_issue";
		return { payout, attempt: record, outcome: "network_issue", alert: false };
	}

	const record = {
		attempt,
		orderId: result.orderId || payoutOrderIdFor(payout._id, attempt),
		status: result.status,
		processorStatus: result.processorStatus ?? null,
		transactionId: result.transactionId ?? null,
		error: result.error ? redactSecrets(String(result.error)) : null,
		sentAt: result.sentAt || new Date(),
	};
	payout.attempts.push(record);
	setAfribapay({
		payoutOrderId: record.orderId,
		attempt,
		transactionId: record.transactionId,
		processorStatus: record.processorStatus,
		lastPollResult: record.processorStatus,
	});

	payout.status = record.status;
	if (record.status === "succeeded") payout.succeededAt = new Date();
	if (record.status === "failed") {
		payout.failedAt = new Date();
		payout.failureReason = record.error;
	}

	// `ambiguous` déclenche une alerte admin (Jour 82) et interdit toute relance
	// automatique : le statut terminal s'en charge.
	return { payout, attempt: record, outcome: record.status, alert: record.status === "ambiguous" };
};

// ---------------------------------------------------------------------------
// Regroupement par vendeur
// ---------------------------------------------------------------------------

// Contrôles du compte vendeur : motif de blocage, ou destination du reversement.
const resolveDestination = (seller) => {
	if (!seller) return { reason: "seller_not_found" };
	if (seller.isTestAccount) return { reason: "test_account" };
	if (seller.isActive === false) return { reason: "seller_inactive" };
	// Absent (anciens comptes) : ne bloque pas ; seul un refus explicite bloque.
	if (seller.isApproved === false) return { reason: "seller_not_approved" };

	const country = resolvePayoutCountry(seller.country);
	const currency = country ? COUNTRY_PAYOUT_CURRENCY[country] : null;
	if (!currency) return { reason: "country_not_covered" };

	const rawOperator = seller.payoutAccount?.operator;
	if (!rawOperator) return { reason: "missing_operator" };
	const operator = toAfribapayOperator(rawOperator);
	const allowed = listOperatorsForCountry(country).operators.map((op) => op.code);
	if (!allowed.includes(operator)) return { reason: "operator_not_in_country" };

	const rawPhone = seller.payoutAccount?.phone || seller.phone;
	if (!rawPhone) return { reason: "missing_phone" };
	const phone = formatPhoneForAfribapay(rawPhone, country);
	if (!/^\d+$/.test(phone) || phone.length !== COUNTRIES[country].phoneLength) {
		return { reason: "invalid_phone" };
	}

	return { country, currency, operator, phone };
};

/**
 * Vendeurs payables et vendeurs bloqués (avec motif) à partir de commandes et
 * de vendeurs déjà lus. Un vendeur sans ligne restante (déjà reversée, part
 * non livrée) n'apparaît dans aucune des deux listes.
 * @param {object} params
 * @param {object[]} params.orders commandes (lean)
 * @param {object[]} params.sellers vendeurs (lean, SELLER_FIELDS)
 * @param {Set<string>} [params.alreadyPaidPairs] « <seller>:<order> » déjà dans un Payout
 * @param {number} [params.rate] taux de commission (défaut : getCommissionRate())
 * @param {*} [params.sellerId] limite le résultat à ce vendeur
 * @returns {{ payable: object[], blocked: object[] }}
 */
const groupPayableBySeller = ({
	orders = [],
	sellers = [],
	alreadyPaidPairs = new Set(),
	rate = getCommissionRate(),
	sellerId,
} = {}) => {
	const sellersById = new Map(sellers.map((s) => [idKey(s._id), s]));
	const buckets = new Map(); // vendeur → { sellerId, orders: [{ order, gross }] }

	for (const order of orders) {
		if (!isCollectionSettled(order) || EXCLUDED_ORDER_STATUSES.includes(order.status)) continue;
		// Jour 81 : une commande déjà programmée, payée ou définitivement
		// échouée ne ressort plus (marqueur payoutState).
		if (PAYOUT_ORDER_EXCLUDED_STATES.includes(order.payoutState)) continue;
		// Délai de garde de 72 h (décision utilisateur). Les commandes
		// antérieures au Jour 81 n'ont pas de `deliveredAt` : repli legacy,
		// sinon plus aucune commande ancienne ne serait payable.
		if (order.deliveredAt && !isOrderPayableNow(order).payable) continue;
		for (const id of sellersOfOrder(order)) {
			const key = idKey(id);
			if (sellerId && key !== idKey(sellerId)) continue;
			if (!isSellerLineDelivered(order, id)) continue;
			if (alreadyPaidPairs.has(`${key}:${idKey(order._id)}`)) continue;
			if (!buckets.has(key)) buckets.set(key, { sellerId: id, orders: [] });
			buckets.get(key).orders.push({ order, gross: sellerGrossForOrder(order, id) });
		}
	}

	const payable = [];
	const blocked = [];
	const block = (sellerRef, reason, entries) =>
		blocked.push({ seller: sellerRef, reason, orders: entries.map((e) => e.order._id) });

	for (const [key, bucket] of buckets) {
		const seller = sellersById.get(key);
		const destination = resolveDestination(seller);
		if (destination.reason) {
			block(seller?._id ?? bucket.sellerId, destination.reason, bucket.orders);
			continue;
		}

		// Espèces : seule la confirmation admin (« completed ») vaut
		// encaissement. POST /payments/:id/confirm permet à l'acheteur de
		// confirmer lui-même un paiement cash (« succeeded ») : sans vérification,
		// on reverserait au vendeur un montant que personne n'a vu encaisser.
		const cashUnverified = bucket.orders.filter(
			(e) => e.order.payment?.method === "cash" && e.order.payment?.status !== "completed",
		);
		const collected = bucket.orders.filter((e) => !cashUnverified.includes(e));
		if (cashUnverified.length > 0) block(seller._id, "cash_unverified", cashUnverified);

		// Devise : une commande dans la devise du pays est payée telle quelle. Les
		// commandes XOF d'un vendeur des pays XAF sont converties au taux
		// configurable (Jour 81) ; toute autre devise est bloquée (jamais de
		// conversion à l'aveugle). Une commande sans devise n'est pas présumée
		// en XOF.
		const orderCurrency = (order) => order.currency || order.payment?.currency;
		const mismatched = collected.filter((e) => {
			const currency = orderCurrency(e.order);
			if (currency === destination.currency) return false;
			return !(currency === "XOF" && destination.currency === "XAF");
		});
		const convertible = collected.filter((e) => !mismatched.includes(e));
		if (mismatched.length > 0) block(seller._id, "currency_mismatch", mismatched);
		if (convertible.length === 0) continue;

		// Une seule devise source par Payout (le champ `fx` n'en porte qu'une) :
		// les commandes d'une autre devise restent bloquées, les premières
		// restent payables.
		const sourceCurrency = orderCurrency(convertible[0].order);
		const eligible = convertible.filter((e) => orderCurrency(e.order) === sourceCurrency);
		const others = convertible.filter((e) => orderCurrency(e.order) !== sourceCurrency);
		if (others.length > 0) block(seller._id, "currency_mismatch", others);
		if (eligible.length === 0) continue;

		const needsConversion = sourceCurrency !== destination.currency;
		const fxRate = needsConversion ? getXofToXafRate() : 1;

		const lines = eligible
			.map(({ order, gross }) => {
				// La conversion porte sur l'ASSIETTE, avant commission : un
				// arrondi indépendant de la commission et du net casserait
				// l'invariant gross − commission = net.
				const convertedGross = needsConversion ? convertXofToXaf(gross, fxRate) : gross;
				return {
					order: order._id,
					orderNumber: order.orderNumber,
					...computePayoutLine({ gross: convertedGross, rate }),
					settledBy: order.payment?.method,
				};
			})
			.filter((line) => line.net > 0);
		if (lines.length === 0) {
			block(seller._id, "amount_zero", eligible);
			continue;
		}

		const total = (field) => lines.reduce((s, line) => s + line[field], 0);
		payable.push({
			seller: seller._id,
			sellerType: payoutSellerType(seller.userType),
			sellerUserType: seller.userType,
			country: destination.country,
			currency: destination.currency,
			operator: destination.operator,
			phone: destination.phone,
			commissionRate: rate,
			lines,
			grossAmount: total("gross"),
			commissionAmount: total("commission"),
			amount: total("net"),
			// Traçabilité de la conversion XOF → XAF (audit, back-office J85).
			fx: { rate: fxRate, sourceCurrency, targetCurrency: destination.currency },
		});
	}

	return { payable, blocked };
};

/**
 * Données d'un Payout « pending » pour une entrée payable (non enregistré :
 * la création et l'envoi arrivent au Jour 81).
 * @param {object} entry élément de groupPayableBySeller().payable
 */
const buildPayoutDoc = (entry) => ({
	seller: entry.seller,
	sellerType: entry.sellerType,
	sellerUserType: entry.sellerUserType,
	lines: entry.lines.map((line) => ({ ...line })),
	currency: entry.currency,
	commissionRate: entry.commissionRate,
	grossAmount: entry.grossAmount,
	commissionAmount: entry.commissionAmount,
	amount: entry.amount,
	// Jour 81 : la conversion est enregistrée pour l'audit ; une commande
	// antérieure au Jour 81 sans `fx` est réputée convertie à parité (1).
	fx: entry.fx ?? { rate: 1, sourceCurrency: entry.currency, targetCurrency: entry.currency },
	country: entry.country,
	operator: entry.operator,
	phone: entry.phone,
	status: "pending",
});

/**
 * Lit les commandes payables, leurs vendeurs et les reversements existants,
 * puis regroupe par vendeur. Lecture seule.
 * @param {{ sellerId?: *, since?: Date, rate?: number }} [options]
 * @returns {Promise<{ payable: object[], blocked: object[] }>}
 */
const listPayableSellers = async ({ sellerId, since, rate = getCommissionRate() } = {}) => {
	const orders = await Order.find(buildPayableOrdersQuery({ sellerId, since })).lean();
	if (!orders.length) return { payable: [], blocked: [] };

	const sellerIds = sellerId
		? [sellerId]
		: [...new Map(orders.flatMap(sellersOfOrder).map((id) => [idKey(id), id])).values()];
	const orderIds = orders.map((order) => order._id);

	// includeTestAccounts : un compte de test doit ressortir bloqué
	// (« test_account ») et non « seller_not_found » (models/User.js).
	const sellers = await User.find({ _id: { $in: sellerIds } }, null, { includeTestAccounts: true })
		.select(SELLER_FIELDS)
		.lean();

	// Tout Payout existant, quel que soit son statut, réserve la paire
	// (vendeur, commande) — cohérent avec l'index unique du modèle ; les
	// relances passent par ses tentatives (Jour 81).
	const existing = await Payout.find({ seller: { $in: sellerIds }, "lines.order": { $in: orderIds } })
		.select("seller lines.order")
		.lean();
	const alreadyPaidPairs = new Set();
	for (const payout of existing) {
		for (const line of payout.lines || []) alreadyPaidPairs.add(`${idKey(payout.seller)}:${idKey(line.order)}`);
	}

	return groupPayableBySeller({ orders, sellers, alreadyPaidPairs, rate, sellerId });
};

module.exports = {
	resolvePayoutCountry,
	payoutSellerType,
	isCollectionSettled,
	isSellerLineDelivered,
	sellerGrossForOrder,
	computePayoutLine,
	buildPayableOrdersQuery,
	groupPayableBySeller,
	buildPayoutDoc,
	listPayableSellers,
	// Jour 81 — exécution
	PAYOUT_TERMINAL_STATUSES,
	PayoutError,
	mapPayoutProcessorStatus,
	isOrderPayableNow,
	convertXofToXaf,
	nextPayoutAttempt,
	buildPayoutPayload,
	fetchPayoutBalance,
	claimPayout,
	sendPayout,
	executePayout,
};
