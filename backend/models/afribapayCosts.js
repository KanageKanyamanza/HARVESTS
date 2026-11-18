// Coûts réels AfriBaPay (Jour 84). AfriBaPay prélève des frais et des taxes à
// chaque transaction : `fees`, `taxes` et `fees_taxes_ttc` (total débité du
// compte marchand). Ces montants ne se déduisent pas du taux de commission
// HARVESTS : ils doivent être lus dans la réponse de l'API (ou le webhook) et
// conservés tels quels pour suivre le coût réel d'encaissement (payin) et de
// reversement (payout, remboursement client).
//
// Le schéma est partagé par Payment (payin et remboursements) et Payout, pour
// que le back-office du Jour 85 lise la même forme partout.
const mongoose = require("mongoose");
const { extractAfribapayCosts } = require("../utils/afribapayUtils");

const afribapayCostsSchema = new mongoose.Schema(
	{
		fees: { type: Number, default: 0, min: 0 },
		taxes: { type: Number, default: 0, min: 0 },
		total: { type: Number, default: 0, min: 0 },
		// Posé uniquement quand des coûts ont réellement été lus : son absence
		// signifie « coût inconnu », pas « coût nul » (les agrégats du
		// back-office filtrent dessus).
		capturedAt: Date,
	},
	{ _id: false },
);

/**
 * Coûts horodatés à écrire, ou null si la charge utile n'en porte aucun.
 * @param {object|string} payload réponse AfriBaPay, webhook ou /status
 * @param {Date} [when]
 */
const capturedAfribapayCosts = (payload, when = new Date()) => {
	const costs = extractAfribapayCosts(payload);
	return costs ? { ...costs, capturedAt: when } : null;
};

module.exports = { afribapayCostsSchema, capturedAfribapayCosts };
