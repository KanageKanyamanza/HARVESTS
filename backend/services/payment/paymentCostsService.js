// Coûts réels AfriBaPay (Jour 84) — lecture pour le back-office.
//
// Chaque transaction porte désormais ce qu'AfriBaPay a réellement prélevé :
//  - payin (encaissement du client) : `Payment.paymentDetails.afribapay.fees` ;
//  - payout (reversement vendeur) : `Payout.fees` ;
//  - remboursement client (versement) : `Payment.refunds[].fees`.
// Les montants ne sont JAMAIS additionnés entre devises (XOF et XAF coexistent) :
// les agrégats sont rendus par devise, avec un total par devise.
//
// Les `capturedAt` servent de filtre : une transaction sans coût capturé (API
// muette, ancien paiement) n'entre pas dans les totaux — un coût absent n'est
// pas un coût nul. Pipelines et résumé sont purs (testés sans MongoDB) ; seule
// `getProviderCostStats` interroge la base, pour la page admin du Jour 85.
const Payment = require("../../models/Payment");
const Payout = require("../../models/Payout");

// Statuts d'un payin réellement encaissé (un échec n'a pas de coût).
const PAID_PAYIN_STATUSES = ["succeeded", "refunded", "partially_refunded"];

const PAYIN_COSTS_PATH = "paymentDetails.afribapay.fees";
const PAYOUT_COSTS_PATH = "fees";
const REFUND_COSTS_PATH = "refunds.fees";

const capturedFilter = (path) => ({ [`${path}.capturedAt`]: { $exists: true, $ne: null } });

// Paramètres d'entrée : refusés explicitement plutôt que passés à `$match`
// (un objet `currency[$ne]=…` deviendrait un opérateur Mongo) et bornés pour
// qu'une période absurde ne lance pas une agrégation sur toute la base.
const CURRENCY_PATTERN = /^[A-Z]{3}$/;
const MAX_PERIOD_DAYS = 3660;

const normalizeCurrency = (currency) => {
	if (currency === undefined || currency === null || currency === "") return undefined;
	if (typeof currency !== "string") {
		throw new RangeError("Paramètre invalide : currency (code ISO à 3 lettres attendu)");
	}
	const value = currency.trim().toUpperCase();
	if (!CURRENCY_PATTERN.test(value)) {
		throw new RangeError("Paramètre invalide : currency (code ISO à 3 lettres attendu)");
	}
	return value;
};

const parseBoundary = (value, label) => {
	if (value === undefined || value === null || value === "") return null;
	const date = typeof value === "string" ? new Date(value) : new Date(NaN);
	if (Number.isNaN(date.getTime())) {
		throw new RangeError(`Paramètre invalide : ${label} (date ISO attendue)`);
	}
	return date;
};

const parsePeriodDays = (period) => {
	const raw = String(period || "").trim();
	// `1y` doit valoir une année, pas un jour (les cartes analytics utilisent 365).
	const years = /^(\d+)y$/i.exec(raw);
	if (years) {
		const count = Number(years[1]);
		if (count <= 0) return 30;
		return Math.min(count * 365, MAX_PERIOD_DAYS);
	}
	const days = Number.parseInt(raw, 10);
	if (!Number.isFinite(days) || days <= 0) return 30;
	return Math.min(days, MAX_PERIOD_DAYS);
};

/**
 * Pipeline d'agrégation des coûts d'encaissement (payin AfriBaPay).
 * @param {{from: Date, to: Date, currency?: string}} params
 */
const buildPayinCostsPipeline = ({ from, to, currency }) => [
	{
		$match: {
			method: "mobile_money",
			status: { $in: PAID_PAYIN_STATUSES },
			paidAt: { $gte: from, $lte: to },
			...(currency ? { currency } : {}),
			...capturedFilter(PAYIN_COSTS_PATH),
		},
	},
	{
		$group: {
			_id: "$currency",
			count: { $sum: 1 },
			fees: { $sum: `$${PAYIN_COSTS_PATH}.fees` },
			taxes: { $sum: `$${PAYIN_COSTS_PATH}.taxes` },
			total: { $sum: `$${PAYIN_COSTS_PATH}.total` },
		},
	},
	{ $sort: { _id: 1 } },
];

/**
 * Pipeline d'agrégation des coûts de reversement (payout vendeur).
 * @param {{from: Date, to: Date, currency?: string}} params
 */
const buildPayoutCostsPipeline = ({ from, to, currency }) => [
	{
		$match: {
			status: "succeeded",
			succeededAt: { $gte: from, $lte: to },
			...(currency ? { currency } : {}),
			...capturedFilter(PAYOUT_COSTS_PATH),
		},
	},
	{
		$group: {
			_id: "$currency",
			count: { $sum: 1 },
			fees: { $sum: `$${PAYOUT_COSTS_PATH}.fees` },
			taxes: { $sum: `$${PAYOUT_COSTS_PATH}.taxes` },
			total: { $sum: `$${PAYOUT_COSTS_PATH}.total` },
		},
	},
	{ $sort: { _id: 1 } },
];

/**
 * Pipeline d'agrégation des coûts de remboursement client (versements stockés
 * dans Payment.refunds[]).
 * @param {{from: Date, to: Date, currency?: string}} params
 */
const buildRefundCostsPipeline = ({ from, to, currency }) => [
	{ $unwind: "$refunds" },
	{
		$match: {
			"refunds.status": "succeeded",
			"refunds.processedAt": { $gte: from, $lte: to },
			...(currency ? { currency } : {}),
			...capturedFilter(REFUND_COSTS_PATH),
		},
	},
	{
		$group: {
			_id: "$currency",
			count: { $sum: 1 },
			fees: { $sum: `$${REFUND_COSTS_PATH}.fees` },
			taxes: { $sum: `$${REFUND_COSTS_PATH}.taxes` },
			total: { $sum: `$${REFUND_COSTS_PATH}.total` },
		},
	},
	{ $sort: { _id: 1 } },
];

/**
 * Statistiques mobile money pour le tableau « Mobile money » du Jour 85 :
 * volume, taux de succès et délai moyen de confirmation. Toutes les tentatives
 * de payin de la période, quel que soit leur statut (contrairement aux coûts
 * qui ne retiennent que les transactions confirmées).
 * @param {{from: Date, to: Date, currency?: string}} params
 */
const buildPaymentStatusPipeline = ({ from, to, currency }) => [
	{
		$match: {
			method: "mobile_money",
			createdAt: { $gte: from, $lte: to },
			...(currency ? { currency } : {}),
		},
	},
	{
		$group: {
			_id: "$currency",
			total: { $sum: 1 },
			succeeded: { $sum: { $cond: [{ $eq: ["$status", "succeeded"] }, 1, 0] } },
			failed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
			pending: { $sum: { $cond: [{ $in: ["$status", ["pending", "processing"]] }, 1, 0] } },
			ambiguous: { $sum: { $cond: [{ $eq: ["$status", "ambiguous"] }, 1, 0] } },
			avgDelayMs: { $avg: { $subtract: ["$paidAt", "$createdAt"] } },
		},
	},
	{ $sort: { _id: 1 } },
];

const emptyBucket = () => ({ count: 0, fees: 0, taxes: 0, total: 0 });

const amount = (value) => {
	const number = Number(value);
	return Number.isFinite(number) ? Math.round(number * 100) / 100 : 0;
};

const toBucket = (row) => ({
	count: amount(row?.count),
	fees: amount(row?.fees),
	taxes: amount(row?.taxes),
	total: amount(row?.total),
});

const addBuckets = (left, right) => ({
	count: left.count + right.count,
	fees: Math.round((left.fees + right.fees) * 100) / 100,
	taxes: Math.round((left.taxes + right.taxes) * 100) / 100,
	total: Math.round((left.total + right.total) * 100) / 100,
});

/**
 * Résume les lignes d'agrégation par devise :
 * `{ XOF: { payin, payout, refund, all }, XAF: {…} }`. Une devise absente
 * (ligne `_id` nulle) est ignorée plutôt que regroupée d'office.
 * @param {{payinRows?: object[], payoutRows?: object[], refundRows?: object[]}} rows
 */
const summarizeProviderCosts = ({ payinRows = [], payoutRows = [], refundRows = [] } = {}) => {
	const byCurrency = {};
	const ensure = (currency) => {
		if (!byCurrency[currency]) {
			byCurrency[currency] = {
				payin: emptyBucket(),
				payout: emptyBucket(),
				refund: emptyBucket(),
				all: emptyBucket(),
			};
		}
		return byCurrency[currency];
	};

	const kinds = [
		["payin", payinRows],
		["payout", payoutRows],
		["refund", refundRows],
	];
	for (const [kind, rows] of kinds) {
		for (const row of rows || []) {
			const currency = row?._id;
			if (typeof currency !== "string" || !currency) continue;
			const entry = ensure(currency);
			entry[kind] = addBuckets(entry[kind], toBucket(row));
		}
	}

	for (const entry of Object.values(byCurrency)) {
		entry.all = addBuckets(addBuckets(entry.payin, entry.payout), entry.refund);
	}
	return byCurrency;
};

/**
 * Statuts mobile money par devise (tableau « Mobile money » du Jour 85).
 * @param {object[]} rows
 */
const summarizePaymentStatusStats = (rows = []) => {
	const byCurrency = {};
	for (const row of rows || []) {
		const currency = row?._id;
		if (typeof currency !== "string" || !currency) continue;
		const total = Number(row.total) || 0;
		const succeeded = Number(row.succeeded) || 0;
		const avgDelayMs = Number(row.avgDelayMs) || 0;
		byCurrency[currency] = {
			total,
			succeeded,
			failed: Number(row.failed) || 0,
			pending: Number(row.pending) || 0,
			ambiguous: Number(row.ambiguous) || 0,
			successRate: total > 0 ? Math.round((succeeded / total) * 100) : 0,
			avgDelaySeconds: Math.round(avgDelayMs / 1000),
		};
	}
	return byCurrency;
};

/**
 * Coûts réels AfriBaPay d'une période, par devise (payin, payout, remboursement).
 * @param {{period?: string, from?: Date|string, to?: Date|string, currency?: string}} [params]
 */
const getProviderCostStats = async ({ period = "30d", from, to, currency } = {}) => {
	const endDate = parseBoundary(to, "to") || new Date();
	const startDate =
		parseBoundary(from, "from") ||
		new Date(endDate.getTime() - parsePeriodDays(period) * 24 * 60 * 60 * 1000);
	const range = { from: startDate, to: endDate, currency: normalizeCurrency(currency) };

	const [payinRows, payoutRows, refundRows, statusRows] = await Promise.all([
		Payment.aggregate(buildPayinCostsPipeline(range)),
		Payout.aggregate(buildPayoutCostsPipeline(range)),
		Payment.aggregate(buildRefundCostsPipeline(range)),
		Payment.aggregate(buildPaymentStatusPipeline(range)),
	]);

	return {
		period: `${parsePeriodDays(period)}d`,
		from: startDate,
		to: endDate,
		currency: range.currency || null,
		currencies: summarizeProviderCosts({ payinRows, payoutRows, refundRows }),
		statusStats: summarizePaymentStatusStats(statusRows),
	};
};

module.exports = {
	PAID_PAYIN_STATUSES,
	buildPayinCostsPipeline,
	buildPayoutCostsPipeline,
	buildRefundCostsPipeline,
	buildPaymentStatusPipeline,
	summarizeProviderCosts,
	summarizePaymentStatusStats,
	getProviderCostStats,
};
