const mongoose = require("mongoose");

/**
 * Comptes de test (développement) : jamais suivis ni exposés.
 *
 * Un compte marqué `isTestAccount: true` (modèle User) :
 * - n'apparaît dans aucune liste ni statistique : les requêtes find /
 *   findOne / countDocuments / distinct / aggregate sur les utilisateurs
 *   l'excluent automatiquement (voir models/User.js), sauf quand elles visent
 *   un compte précis (identifiant, e-mail, téléphone, jeton) — connexion,
 *   réinitialisation de mot de passe, etc. continuent donc de fonctionner ;
 * - n'a jamais sa boutique visible publiquement ;
 * - ne laisse aucune entrée dans le journal d'audit ;
 * - ne reçoit ni ne déclenche aucun e-mail ni notification.
 *
 * Sandbox des démos : le catalogue et les boutiques publiques sont filtrés
 * selon le visiteur (isTestViewer) — un compte de test ne voit que les
 * produits/boutiques des comptes de test, et les visiteurs réels ne voient
 * jamais les produits/boutiques des comptes de test.
 *
 * Pour inclure malgré tout les comptes de test dans une requête :
 * `.setOptions({ includeTestAccounts: true })`.
 */

// Champs qui désignent un utilisateur précis : une requête qui en contient un
// n'est pas filtrée
const SPECIFIC_USER_KEYS = new Set(["_id", "id", "email", "phone"]);

function isSpecificUserFilter(filter) {
	if (!filter || typeof filter !== "object") return false;
	return Object.entries(filter).some(([key, value]) => {
		if (SPECIFIC_USER_KEYS.has(key) || /token/i.test(key)) return true;
		if ((key === "$or" || key === "$and") && Array.isArray(value)) {
			return value.some(isSpecificUserFilter);
		}
		return false;
	});
}

// Cache des comptes de test (identifiants et e-mails), rechargé toutes les
// 5 minutes et invalidé quand un compte change de statut
const CACHE_TTL_MS = 5 * 60 * 1000;
let cache = null;
let cacheLoadedAt = 0;
let pending = null;

async function loadTestAccounts() {
	if (cache && Date.now() - cacheLoadedAt < CACHE_TTL_MS) return cache;
	if (pending) return pending;
	pending = (async () => {
		try {
			const User = mongoose.model("User");
			const accounts = await User.find({ isTestAccount: true })
				.setOptions({ includeTestAccounts: true })
				.select("_id email")
				.lean();
			cache = {
				ids: new Set(accounts.map((a) => String(a._id))),
				emails: new Set(accounts.map((a) => String(a.email).toLowerCase())),
				objectIds: accounts.map((a) => a._id),
			};
			cacheLoadedAt = Date.now();
			return cache;
		} catch (error) {
			// Base indisponible : ne bloque rien, réessaie au prochain appel
			return cache || { ids: new Set(), emails: new Set(), objectIds: [] };
		} finally {
			pending = null;
		}
	})();
	return pending;
}

function invalidateTestAccounts() {
	cache = null;
	cacheLoadedAt = 0;
}

/** Vrai si la requête vient d'un compte de test connecté (démo). */
function isTestViewer(req) {
	return req?.user?.isTestAccount === true;
}

/**
 * Périmètre « sandbox » des comptes vendeurs pour une requête User
 * (Producer, Transformer, Restaurateur, …) :
 * - visiteur test : uniquement les comptes de test ;
 * - visiteur réel : uniquement les comptes réels.
 * Le filtre est explicite : il fonctionne aussi pour les requêtes visant un
 * identifiant précis, que le hook du modèle User ne filtre jamais.
 */
function testAccountScope(isTestView) {
	return { isTestAccount: isTestView ? true : { $ne: true } };
}

/**
 * Applique le périmètre sandbox à une requête User.
 * Le filtre `isTestAccount` court-circuite le hook d'exclusion du modèle, et
 * `includeTestAccounts` couvre les agrégations / options équivalentes.
 */
function applyTestAccountScope(query, isTestView) {
	if (isTestView) {
		query.setOptions({ ...query.getOptions(), includeTestAccounts: true });
	}
	return query.where(testAccountScope(isTestView));
}

/**
 * Filtre « sandbox » des produits, à pousser dans `$and` (pour ne pas écraser
 * un `$or` existant) :
 * - visiteur test : uniquement les produits de vendeurs test ;
 * - visiteur réel/anonyme : uniquement les produits de vendeurs réels.
 * Renvoie null quand aucun filtre n'est nécessaire.
 */
async function testProductsViewerFilter(isTestView) {
	const ids = await getTestAccountIds();
	if (ids.length === 0) return isTestView ? { _id: null } : null;
	const vendorClause = [
		{ producer: { $in: ids } },
		{ transformer: { $in: ids } },
		{ restaurateur: { $in: ids } },
	];
	return isTestView ? { $or: vendorClause } : { $nor: vendorClause };
}

/**
 * Filtre « sandbox » des avis, à combiner avec le filtre produit/vendeur :
 * - visiteur test : uniquement les avis écrits par un compte de test ;
 * - visiteur réel/anonyme : uniquement les avis écrits par un compte réel.
 * Le parent (produit/vendeur) doit être vérifié séparément par l'appelant.
 */
async function testReviewViewerFilter(isTestView) {
	const ids = await getTestAccountIds();
	if (ids.length === 0) return isTestView ? { _id: null } : {};
	return { reviewer: isTestView ? { $in: ids } : { $nin: ids } };
}

/** Vrai si l'identifiant ou l'e-mail donné appartient à un compte de test. */
async function isTestUser({ id, email } = {}) {
	if (!id && !email) return false;
	const { ids, emails } = await loadTestAccounts();
	return (
		(id != null && ids.has(String(id._id || id))) ||
		(email != null && emails.has(String(email).toLowerCase()))
	);
}

/** Vrai si l'un des destinataires (e-mails) est un compte de test. */
async function hasTestRecipient(recipients) {
	const list = (Array.isArray(recipients) ? recipients : [recipients]).filter(Boolean);
	if (list.length === 0) return false;
	const { emails } = await loadTestAccounts();
	// Accepte « adresse », « Nom <adresse> » ou { email }
	const address = (r) => {
		const raw = String(r.email || r.address || r).trim();
		return (raw.match(/<([^>]+)>/)?.[1] || raw).toLowerCase();
	};
	return list.some((r) => emails.has(address(r)));
}

/**
 * Vrai si les données d'une notification concernent un compte de test :
 * utilisateur, produit (vendeur) ou commande (acheteur/vendeur) référencés.
 * Sert à ne pas alerter les admins à propos des comptes de test.
 */
async function notificationInvolvesTestAccount(data = {}) {
	const { ids } = await loadTestAccounts();
	if (ids.size === 0 || !data) return false;
	const isTest = (value) => value != null && ids.has(String(value._id || value));

	for (const key of ["userId", "buyerId", "sellerId", "producerId", "customerId", "reviewerId"]) {
		if (isTest(data[key])) return true;
	}
	try {
		if (data.productId) {
			const product = await mongoose.model("Product").findById(data.productId)
				.select("producer transformer restaurateur").lean();
			if (product && [product.producer, product.transformer, product.restaurateur].some(isTest)) return true;
		}
		if (data.orderId) {
			const order = await mongoose.model("Order").findById(data.orderId)
				.select("buyer seller segments.seller").lean();
			if (order && [order.buyer, order.seller, ...(order.segments || []).map((s) => s.seller)].some(isTest)) {
				return true;
			}
		}
	} catch {
		// Données introuvables ou modèle absent : on n'empêche pas la notification
	}
	return false;
}

/** Identifiants (ObjectId) des comptes de test, pour exclure leurs données. */
async function getTestAccountIds() {
	return (await loadTestAccounts()).objectIds;
}

/** Filtre Mongo : produits n'appartenant pas à un compte de test. */
async function testProductFilter() {
	const ids = await getTestAccountIds();
	if (ids.length === 0) return {};
	return {
		producer: { $nin: ids },
		transformer: { $nin: ids },
		restaurateur: { $nin: ids },
	};
}

/** Filtre Mongo : commandes n'impliquant aucun compte de test. */
async function testOrderFilter() {
	const ids = await getTestAccountIds();
	if (ids.length === 0) return {};
	return {
		buyer: { $nin: ids },
		seller: { $nin: ids },
		"segments.seller": { $nin: ids },
	};
}

// --- Statistiques admin sans données de test --------------------------------
// Middleware posé sur les routes de statistiques admin : pendant la requête,
// les requêtes Product / Order (find, countDocuments, aggregate) excluent
// automatiquement les données des comptes de test (voir
// addTestDataExclusion, branché dans les modèles Product et Order).
const { AsyncLocalStorage } = require("async_hooks");
const testDataContext = new AsyncLocalStorage();

function excludeTestDataMiddleware(req, res, next) {
	testDataContext.run({ excludeTestData: true }, next);
}

function addTestDataExclusion(schema, buildFilter) {
	async function applyToQuery() {
		if (!testDataContext.getStore()?.excludeTestData) return;
		const filter = await buildFilter();
		if (Object.keys(filter).length) this.where(filter);
	}
	schema.pre(["find", "findOne", "countDocuments", "distinct"], applyToQuery);
	schema.pre("aggregate", async function () {
		if (!testDataContext.getStore()?.excludeTestData) return;
		const filter = await buildFilter();
		if (Object.keys(filter).length) this.pipeline().unshift({ $match: filter });
	});
}

module.exports = {
	excludeTestDataMiddleware,
	addTestDataExclusion,
	isTestViewer,
	testAccountScope,
	applyTestAccountScope,
	testProductsViewerFilter,
	testReviewViewerFilter,
	testProductFilter,
	testOrderFilter,
	isSpecificUserFilter,
	isTestUser,
	hasTestRecipient,
	notificationInvolvesTestAccount,
	getTestAccountIds,
	invalidateTestAccounts,
};
