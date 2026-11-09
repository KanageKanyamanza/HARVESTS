const mongoose = require("mongoose");

/**
 * Jour 73 (lancement bilingue) : une bascule de langue relevée dans
 * l'interface. Chaque document est un événement, sans compte utilisateur :
 * le visiteur est identifié par un identifiant stable mais anonyme
 * (localStorage côté front), comme pour les visites de blog (BlogVisit).
 *
 * Ces événements servent au suivi du taux d'usage de la bascule anglaise
 * demandé par la feuille de route : combien de bascules vers l'anglais, de
 * retour vers le français, depuis quels endroits de l'interface, et sur
 * quelles pages. Aucune adresse IP n'est stockée.
 */
const languageSwitchSchema = new mongoose.Schema(
	{
		// Langue affichée avant et après la bascule (fr → en ou en → fr)
		from: {
			type: String,
			required: true,
			enum: ["fr", "en"],
		},
		to: {
			type: String,
			required: true,
			enum: ["fr", "en"],
		},

		// Endroit de l'interface où la bascule a été cliquée : "header"
		// (en-tête public), "footer", "topbar" (tableaux de bord), "auth"
		// (pages de connexion et d'inscription). Sert à repérer les
		// sélecteurs réellement employés au Jour 74, pour y concentrer
		// l'attention (nouvelles traductions, relecture…) et éventuellement
		// retirer des doublons d'ici. Kit de valeurs libres la première
		// année : un nouveau point d'entrée ne doit pas échouer à l'écriture.
		context: {
			type: String,
			trim: true,
			maxLength: 64,
			default: "unknown",
		},

		// Identifiant anonyme du navigateur (localStorage "harvests_visitor_id")
		visitorId: {
			type: String,
			required: true,
			trim: true,
			maxLength: 64,
		},

		// Chemin affiché au moment de la bascule (sans requête ni hash) :
		// repère les pages où l'anglais est le plus demandé, indicateur
		// précieux pour prioriser la suite (le bilan du Jour 74 s'appuie
		// dessus). Stocké tronqué ; "/products/…" reste à ce niveau de détail.
		path: {
			type: String,
			trim: true,
			maxLength: 512,
			default: "",
		},

		occurredAt: {
			type: Date,
			default: Date.now,
		},
	},
	{
		// Aucun updatedAt / createdAt : occurredAt suffit, l'événement est
		// immuable. Le nom de collection est figé pour que les agrégats
		// admin restent stables même si le schéma évolue.
		collection: "languageswitches",
		versionKey: false,
	},
);

languageSwitchSchema.index({ occurredAt: -1 });
languageSwitchSchema.index({ to: 1, occurredAt: -1 });
languageSwitchSchema.index({ visitorId: 1, occurredAt: -1 });

module.exports = mongoose.model("LanguageSwitch", languageSwitchSchema);
