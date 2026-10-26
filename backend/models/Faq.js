const mongoose = require("mongoose");
const { fillEnglishFields } = require("../utils/faqTranslations");

const faqSchema = new mongoose.Schema({
	question: {
		type: String,
		required: [true, "validation.faq_question_required"],
		trim: true,
	},
	answer: {
		type: String,
		required: [true, "validation.faq_answer_required"],
	},
	// Jour 66 (bascule bilingue) : version anglaise de la FAQ, utilisée par
	// l'entraînement du chatbot (utils/chatbotTraining.js). Facultative en base
	// et remplie automatiquement à la sauvegarde si elle est vide (voir le hook
	// plus bas), pour que le back-office reste utilisable en français.
	questionEn: {
		type: String,
		trim: true,
	},
	answerEn: {
		type: String,
		trim: true,
	},
	keywordsEn: [
		{
			type: String,
			trim: true,
		},
	],
	category: {
		type: String,
		enum: [
			"livraison",
			"paiement",
			"commande",
			"compte",
			"produits",
			"général",
			"autre",
		],
		default: "autre",
	},
	keywords: [
		{
			type: String,
			trim: true,
		},
	],
	intent: {
		type: String,
		trim: true,
		index: true,
	},
	isActive: {
		type: Boolean,
		default: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
});

// Index pour la recherche textuelle simple (fallback)
faqSchema.index({ question: "text", answer: "text", keywords: "text" });

// Middleware pour mettre à jour la date de modification
faqSchema.pre("save", function (next) {
	this.updatedAt = Date.now();
	next();
});

// Jour 66 : avant validation, complète les champs anglais manquants à partir
// du français (meilleur effort — une panne du service de traduction ne bloque
// pas l'enregistrement de la FAQ, elle reste simplement sans version anglaise).
faqSchema.pre("validate", async function (next) {
	try {
		await fillEnglishFields(this);
	} catch (error) {
		console.warn("FAQ : traduction anglaise ignorée :", error.message);
	}
	next();
});

const Faq = mongoose.model("Faq", faqSchema);

module.exports = Faq;
