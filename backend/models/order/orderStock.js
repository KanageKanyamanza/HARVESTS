const mongoose = require("mongoose");

/**
 * Solde le stock réservé à la création d'une commande (Jour 72).
 *
 * Tous les changements de statut (vendeur, client, administrateur) finissent par
 * order.save() : le solde se fait donc ici, une seule fois par segment vendeur,
 * grâce à `stockState`.
 *   - livré ou terminé : la réservation est soldée et la vente comptée ;
 *   - annulé ou rejeté : le stock est rendu.
 * Une annulation après livraison retire la vente sans remettre en stock : rien
 * ne dit que la marchandise est revenue.
 *
 * Limite connue : le solde suit le statut du segment, pas celui de chaque article.
 */
const COMMITTED = ["delivered", "completed"];
const RELEASED = ["cancelled", "rejected"];
// Statuts posés directement sur la commande, sans passer par ses segments
const ORDER_LEVEL = ["completed", "cancelled"];

const targetState = (status) => {
	if (COMMITTED.includes(status)) return "committed";
	if (RELEASED.includes(status)) return "released";
	return null;
};

async function applyToItems(items, change) {
	const Product = mongoose.model("Product");
	for (const item of items || []) {
		const product = await Product.findById(item.product);
		if (!product) continue;

		if (change === "commit") product.commitStock(item.quantity, item.variant);
		else if (change === "release") product.releaseStock(item.quantity, item.variant);
		else product.revertSale(item.quantity);

		// Le produit a pu devenir invalide depuis sa création : le stock doit suivre quand même
		await product.save({ validateBeforeSave: false });
	}
}

async function settleUnit(holder, items, status) {
	const target = targetState(status);
	if (!target || holder.stockState === target) return;

	let change = null;
	if (!holder.stockState) change = target === "committed" ? "commit" : "release";
	else if (holder.stockState === "committed" && target === "released") change = "revert";
	if (!change) return;

	await applyToItems(items, change);
	holder.stockState = target;
}

async function settleOrderStock(order) {
	const segments = order.segments || [];
	if (segments.length === 0) {
		await settleUnit(order, order.items, order.status);
		return;
	}
	for (const segment of segments) {
		const status = ORDER_LEVEL.includes(order.status) ? order.status : segment.status;
		await settleUnit(segment, segment.items, status);
	}
}

module.exports = { settleOrderStock };
