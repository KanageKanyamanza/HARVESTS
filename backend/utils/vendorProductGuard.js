const { toPlainText } = require("./localization");

/**
 * Garde-fou des écritures de produits par les vendeurs (producteur,
 * transformateur, restaurateur).
 *
 * Règle métier : un produit n'est public qu'après validation d'un admin.
 * Un vendeur ne peut donc jamais mettre `approved` ni `rejected`, ni toucher
 * aux champs réservés à l'admin ou au système ; et modifier le contenu d'un
 * produit déjà approuvé le renvoie en révision (comportement déjà en place
 * pour les plats et dans productProducerService, généralisé ici).
 * Avant ce garde-fou, producerProductService faisait
 * Object.assign(product, req.body) : un producteur pouvait publier son
 * produit sans validation.
 */

// Champs jamais modifiables par un vendeur
const PROTECTED_FIELDS = [
	"_id",
	"__v",
	"createdAt",
	"updatedAt",
	"status",
	"rejectionReason",
	"approvedAt",
	"approvedBy",
	"publishedAt",
	"isActive",
	"isFeatured",
	"isPublic",
	"stats",
	"slug",
	"producer",
	"transformer",
	"restaurateur",
	"userType",
	"originType",
	"sourceDish",
	"lastStockUpdate",
];

// Statuts qu'un vendeur peut demander lui-même
const VENDOR_STATUSES = ["draft", "pending-review", "inactive"];

// Champs dont la modification sur un produit approuvé impose une révision
const REVIEW_FIELDS = ["name", "description", "price", "category", "images"];

/** Copie de `data` sans les champs protégés. */
function stripProtectedFields(data = {}) {
	const clean = { ...data };
	for (const field of PROTECTED_FIELDS) delete clean[field];
	return clean;
}

/** Statut initial d'un produit créé par un vendeur : brouillon ou révision. */
function resolveCreateStatus(requested) {
	return requested === "pending-review" ? "pending-review" : "draft";
}

const bilingual = (value) =>
	value && typeof value === "object" ?
		{ fr: (value.fr || "").trim(), en: (value.en || "").trim() }
	:	{ fr: toPlainText(value, "").trim(), en: "" };

/**
 * Le champ a-t-il réellement changé ? Les formulaires renvoient tous les
 * champs à chaque enregistrement : il faut comparer les valeurs, pas la
 * simple présence du champ, sinon une mise à jour du stock repasserait le
 * produit en révision.
 */
function fieldChanged(product, field, value) {
	const current = product[field];
	switch (field) {
		case "name":
		case "description": {
			const before = bilingual(current);
			const after = bilingual(value);
			// Une langue absente du payload sera recalculée par traduction
			// automatique : seul un texte fourni et différent compte
			return (
				(after.fr && after.fr !== before.fr) ||
				(after.en && after.en !== before.en)
			);
		}
		case "price":
			return Number(value) !== Number(current);
		case "images": {
			const urls = (list) => (list || []).map((img) => (typeof img === "string" ? img : img?.url));
			return JSON.stringify(urls(value)) !== JSON.stringify(urls(current));
		}
		default:
			return String(value ?? "") !== String(current ?? "");
	}
}

/**
 * Statut à appliquer lors d'une modification par un vendeur.
 * - `approved` / `rejected` demandés par le vendeur : ignorés.
 * - Produit approuvé dont le contenu change : retour en révision.
 * - Sinon le statut demandé s'il est autorisé, ou le statut actuel.
 */
function resolveUpdateStatus(product, requested, updateData) {
	const contentChanged = REVIEW_FIELDS.some(
		(field) =>
			Object.prototype.hasOwnProperty.call(updateData, field) &&
			fieldChanged(product, field, updateData[field]),
	);

	if (product.status === "approved" && contentChanged) {
		// Le vendeur peut retirer ou dépublier, jamais garder "approved"
		return requested === "draft" || requested === "inactive" ? requested : "pending-review";
	}
	if (VENDOR_STATUSES.includes(requested)) return requested;
	return product.status;
}

module.exports = {
	PROTECTED_FIELDS,
	VENDOR_STATUSES,
	REVIEW_FIELDS,
	stripProtectedFields,
	resolveCreateStatus,
	resolveUpdateStatus,
	fieldChanged,
};
