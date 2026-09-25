/**
 * Jour 46 (bascule bilingue) - semence one-shot de la collection
 * TranslationGlossary à partir de backend/data/translationGlossary.json
 * (glossaire statique posé au Jour 45, désormais éditable dans le back-office).
 *
 * Idempotent : une entrée déjà présente (même type + même terme source) est
 * ignorée, jamais écrasée — les modifications faites par l'admin priment.
 *
 * SÉCURITÉ : ce script se connecte à la base pointée par DATABASE_URL /
 * DATABASE_PROD (Atlas Prod dans cet environnement). Il tourne en mode
 * "dry-run" par défaut (aucune écriture) — il faut passer --execute pour
 * appliquer les changements. Ne JAMAIS lancer --execute sans confirmation
 * explicite de l'utilisateur.
 *
 * Usage :
 *   node scripts/seedTranslationGlossary.js            (dry-run, résumé seulement)
 *   node scripts/seedTranslationGlossary.js --execute  (insère les entrées manquantes)
 */

const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const TranslationGlossary = require("../models/TranslationGlossary");
const glossary = require("../data/translationGlossary.json");

const EXECUTE = process.argv.slice(2).includes("--execute");

function entriesFromJson() {
	const exact = Object.entries(glossary.exactTerms || {}).map(([source, target]) => ({
		type: "exact",
		source: source.trim().toLowerCase(),
		target,
	}));
	const replacements = (glossary.wordReplacements || []).map((rule) => ({
		type: "replacement",
		source: rule.match,
		target: rule.replace,
		flags: rule.flags || "gi",
	}));
	return [...exact, ...replacements];
}

async function run() {
	const mongoUri = process.env.DATABASE_URL || process.env.DATABASE_PROD || process.env.DATABASE_LOCAL;
	if (!mongoUri) {
		console.error("❌ Aucune variable DATABASE_URL / DATABASE_PROD / DATABASE_LOCAL trouvée dans .env");
		process.exit(1);
	}

	console.log(`Mode : ${EXECUTE ? "EXECUTE (écritures réelles)" : "DRY-RUN (aucune écriture)"}`);

	await mongoose.connect(mongoUri);
	console.log("✅ Connecté à MongoDB");

	const stats = { inserted: 0, skipped: 0, failed: 0 };

	for (const entry of entriesFromJson()) {
		const exists = await TranslationGlossary.exists({ type: entry.type, source: entry.source });
		if (exists) {
			stats.skipped += 1;
			console.log(`  = déjà présent  [${entry.type}] ${entry.source}`);
			continue;
		}

		if (!EXECUTE) {
			stats.inserted += 1;
			console.log(`  + à insérer     [${entry.type}] ${entry.source} -> ${entry.target}`);
			continue;
		}

		try {
			await TranslationGlossary.create({ ...entry, note: "Semé depuis translationGlossary.json (Jour 46)" });
			stats.inserted += 1;
			console.log(`  + inséré        [${entry.type}] ${entry.source} -> ${entry.target}`);
		} catch (error) {
			stats.failed += 1;
			console.warn(`  ! échec         [${entry.type}] ${entry.source} : ${error.message}`);
		}
	}

	console.log("\n=== Résumé ===");
	console.log(`${EXECUTE ? "Insérées" : "À insérer"}          : ${stats.inserted}`);
	console.log(`Déjà présentes     : ${stats.skipped}`);
	console.log(`Échecs             : ${stats.failed}`);
	if (!EXECUTE) {
		console.log("\n⚠️  DRY-RUN : aucune écriture appliquée. Relancer avec --execute pour appliquer.");
	}

	await mongoose.connection.close();
	console.log("✅ Connexion fermée");
	process.exit(stats.failed ? 1 : 0);
}

run().catch(async (error) => {
	console.error("❌ Erreur durant la semence du glossaire :", error);
	try {
		await mongoose.connection.close();
	} catch {}
	process.exit(1);
});
