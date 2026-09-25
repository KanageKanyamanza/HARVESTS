const mongoose = require("mongoose");

// Jour 46 (bascule bilingue) - glossaire fr->en éditable depuis le
// back-office, remplace le fichier statique backend/data/translationGlossary.json
// (qui ne sert plus que de semence, cf scripts/seedTranslationGlossary.js).
// Deux types d'entrées, lus par utils/translationGlossary.js :
//   - "exact"       : `source` = terme français normalisé (trim + minuscules),
//                     court-circuite l'appel MT quand le texte entier correspond
//   - "replacement" : `source` = motif regex appliqué sur le résultat de la MT
const ALLOWED_FLAGS = /^[gimsuy]*$/;

const translationGlossarySchema = new mongoose.Schema(
	{
		type: {
			type: String,
			enum: {
				values: ["exact", "replacement"],
				message: "Type d'entrée invalide (exact ou replacement)",
			},
			required: [true, "Le type d'entrée est requis"],
		},
		source: {
			type: String,
			required: [true, "Le terme source est requis"],
			trim: true,
			maxlength: [200, "Le terme source ne peut pas dépasser 200 caractères"],
		},
		target: {
			type: String,
			required: [true, "La traduction est requise"],
			trim: true,
			maxlength: [300, "La traduction ne peut pas dépasser 300 caractères"],
		},
		flags: {
			type: String,
			default: "gi",
			validate: {
				validator: (v) => ALLOWED_FLAGS.test(v || ""),
				message: "Flags regex invalides (autorisés : g, i, m, s, u, y)",
			},
		},
		note: {
			type: String,
			trim: true,
			maxlength: [300, "La note ne peut pas dépasser 300 caractères"],
		},
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
		updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
	},
	{ timestamps: true },
);

// Pas deux fois le même terme exact / le même motif
translationGlossarySchema.index({ type: 1, source: 1 }, { unique: true });

translationGlossarySchema.pre("validate", function (next) {
	if (this.type === "exact" && typeof this.source === "string") {
		this.source = this.source.trim().toLowerCase();
		this.flags = undefined;
	}
	// Flags hors liste : déjà signalés par le validateur de `flags`
	if (this.type === "replacement" && this.source && ALLOWED_FLAGS.test(this.flags || "")) {
		try {
			new RegExp(this.source, this.flags || "gi");
		} catch (error) {
			this.invalidate("source", `Expression régulière invalide : ${error.message}`);
		}
	}
	next();
});

module.exports = mongoose.model("TranslationGlossary", translationGlossarySchema);
