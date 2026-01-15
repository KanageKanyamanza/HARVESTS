const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema({
	question: {
		type: String,
		required: [true, "Une question est requise"],
		trim: true,
	},
	answer: {
		type: String,
		required: [true, "Une réponse est requise"],
	},
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

const Faq = mongoose.model("Faq", faqSchema);

module.exports = Faq;
