// Anti-replay des webhooks AfriBaPay (Jour 77) — porté d'AfricaSend
// (models/webhookEventModel.js). Chaque notification de l'agrégateur est
// réclamée UNE fois : l'insertion atomique d'une clé unique rejoue le rôle de
// verrou — une même requête webhook (ou une même anomalie) n'est jamais
// traitée deux fois. Purge automatique par TTL : aucune maintenance manuelle.
const mongoose = require("mongoose");

// 7 jours : largement supérieur au délai de résolution d'un litige de paiement.
const TTL_SECONDS = 7 * 24 * 60 * 60;

const webhookEventSchema = new mongoose.Schema({
	// Clé d'idempotence, ex : `payin:R<paymentId>-p2:SUCCESS` (anti-replay)
	// ou `anomaly:payin-mismatch:<paymentId>` (alerte admin dédupliquée).
	key: {
		type: String,
		required: true,
		unique: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
		expires: TTL_SECONDS, // index TTL expireAfterSeconds créé par Mongoose
	},
});

/**
 * Réclame un événement de façon atomique.
 * @param {string} key clé d'idempotence
 * @returns {Promise<boolean>} true si c'est la première fois que cette clé est
 *   vue (à traiter), false si elle a déjà été réclamée (replay — à ignorer).
 */
webhookEventSchema.statics.claimEvent = async function (key) {
	try {
		await this.create({ key });
		return true;
	} catch (err) {
		// Code 11000 = clé dupliquée : événement déjà traité (replay détecté)
		if (err && err.code === 11000) return false;
		throw err;
	}
};

/**
 * Libère un événement réclamé mais NON traité (erreur interne pendant le
 * traitement) : sans cela, la nouvelle tentative du fournisseur serait prise
 * pour un rejeu et l'événement serait perdu.
 * @param {string} key clé réclamée par claimEvent
 */
webhookEventSchema.statics.releaseEvent = function (key) {
	return this.deleteOne({ key });
};

const WebhookEvent = mongoose.model("WebhookEvent", webhookEventSchema);

module.exports = WebhookEvent;
