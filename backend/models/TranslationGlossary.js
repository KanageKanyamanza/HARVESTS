const mongoose = require("mongoose");

// Jour 46 (bascule bilingue) - glossaire fr->en éditable depuis le
// back-office, remplace le fichier statique backend/data/translationGlossary.json
// (qui ne sert plus que de semence, cf scripts/seedTranslationGlossary.js).
// Deux types d'entrées, lus par utils/translationGlossary.js :
//   - "exact"       : `source` = terme dans la langue source, normalisé
//                     (trim + minuscules), court-circuite l'appel MT quand le
//                     texte entier correspond
//   - "replacement" : `source` = motif regex appliqué sur le résultat de la MT
// Jour 48 : chaque entrée a un sens (`direction`), le glossaire servant aussi
// aux textes saisis en anglais (en -> fr). Le sens inverse ne se déduit pas
// automatiquement (plusieurs termes fr peuvent donner le même terme en, et
// un remplacement porte sur le texte déjà traduit).
const ALLOWED_FLAGS = /^[gimsuy]*$/;
const DIRECTIONS = ["fr-en", "en-fr"];

const translationGlossarySchema = new mongoose.Schema(
	{
		direction: {
			type: String,
			enum: {
				values: DIRECTIONS,
				message: "validation.glossary_direction_invalid",
			},
			default: "fr-en",
			required: [true, "validation.glossary_direction_required"],
		},
		type: {
			type: String,
			enum: {
				values: ["exact", "replacement"],
				message: "validation.glossary_entry_type_invalid",
			},
			required: [true, "validation.glossary_entry_type_required"],
		},
		source: {
			type: String,
			required: [true, "validation.glossary_source_required"],
			trim: true,
			maxlength: [200, "validation.glossary_source_maxlength"],
		},
		target: {
			type: String,
			required: [true, "validation.glossary_target_required"],
			trim: true,
			maxlength: [300, "validation.glossary_target_maxlength"],
		},
		flags: {
			type: String,
			default: "gi",
			validate: {
				validator: (v) => ALLOWED_FLAGS.test(v || ""),
				message: "validation.glossary_flags_invalid",
			},
		},
		note: {
			type: String,
			trim: true,
			maxlength: [300, "validation.glossary_note_maxlength"],
		},
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
		updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
	},
	{ timestamps: true },
);

// Pas deux fois le même terme exact / le même motif dans un même sens.
// Remplace l'index { type, source } du Jour 46, à supprimer en base
// (scripts/migrateGlossaryDirection.js).
translationGlossarySchema.index({ direction: 1, type: 1, source: 1 }, { unique: true });

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
			// Conserver le détail du parseur (position / classe non terminée…)
			// tout en gardant un message traduit.
			this.invalidate(
				"source",
				"validation.glossary_regex_invalid",
				error.message,
			);
		}
	}
	next();
});

const TranslationGlossary = mongoose.model("TranslationGlossary", translationGlossarySchema);
TranslationGlossary.DIRECTIONS = DIRECTIONS;

module.exports = TranslationGlossary;
