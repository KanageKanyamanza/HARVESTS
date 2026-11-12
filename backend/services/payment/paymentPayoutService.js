// Vendeurs payables (Jour 80) : commandes livrées dont l'encaissement est acté
// (payin confirmé ou règlement de la livraison), regroupées par vendeur avec le
// montant dû au taux de commission en vigueur (config/payout.js). Le pays du
// reversement vient du pays du vendeur ; AfriBaPay ne paie que des numéros
// des pays couverts (config/afribapayOperators.js).
//
// Lecture seule : aucun Payout n'est écrit ici. L'envoi avec verrou
// anti-doublon et statuts ambigus arrive au Jour 81, le webhook payout au
// Jour 82, les frais réels AfriBaPay au Jour 84.
const Order = require("../../models/Order");
const User = require("../../models/User");
const Payout = require("../../models/Payout");
const {
	getCommissionRate,
	COUNTRY_PAYOUT_CURRENCY,
	SETTLED_PAYMENT_STATUSES,
	DELIVERED_STATUSES,
	EXCLUDED_ORDER_STATUSES,
	EXCLUDED_ITEM_STATUSES,
} = require("../../config/payout");
const { COUNTRIES, normalizeCountry, listOperatorsForCountry } = require("../../config/afribapayOperators");
const { COUNTRY_NAME_TO_CODE, COUNTRY_CODE_TO_NAME } = require("../../utils/countryMapper");
const { toAfribapayOperator } = require("../../utils/afribapayOperator");
const { formatPhoneForAfribapay } = require("../../utils/afribapayUtils");

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

		// Une commande dans une autre devise que celle du pays n'est jamais
		// convertie : elle est bloquée, les autres restent payables. Une commande
		// sans devise n'est pas présumée en XOF.
		const orderCurrency = (order) => order.currency || order.payment?.currency;
		const mismatched = collected.filter((e) => orderCurrency(e.order) !== destination.currency);
		const eligible = collected.filter((e) => orderCurrency(e.order) === destination.currency);
		if (mismatched.length > 0) block(seller._id, "currency_mismatch", mismatched);
		if (eligible.length === 0) continue;

		const lines = eligible
			.map(({ order, gross }) => ({
				order: order._id,
				orderNumber: order.orderNumber,
				...computePayoutLine({ gross, rate }),
				settledBy: order.payment?.method,
			}))
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
};
