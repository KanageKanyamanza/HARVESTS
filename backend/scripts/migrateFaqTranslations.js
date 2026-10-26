/**
 * Jour 66 (bascule bilingue) — reprise des FAQs existantes en anglais.
 *
 * Les FAQs sont saisies en français au back-office. À partir du Jour 66, le
 * chatbot est aussi entraîné en anglais à partir de leurs champs
 * questionEn/answerEn/keywordsEn, remplis automatiquement à chaque sauvegarde
 * depuis l'admin. Les FAQs créées avant ce jour n'ont pas encore ces champs :
 * ce script les traduit une fois (fr -> en, via utils/translateText.js et le
 * glossaire métier) pour que l'anglais fonctionne dès le ré-entraînement.
 *
 * Les champs anglais déjà renseignés ne sont jamais écrasés.
 *
 * SÉCURITÉ : ce script se connecte à la base pointée par DATABASE_URL /
 * DATABASE_PROD. Il tourne en mode "dry-run" par défaut (aucune écriture) —
 * il faut passer --execute pour appliquer les changements. Ne JAMAIS lancer
 * --execute sans confirmation explicite de l'utilisateur.
 *
 * Usage :
 *   node scripts/migrateFaqTranslations.js                  (dry-run, résumé)
 *   node scripts/migrateFaqTranslations.js --execute        (applique)
 *   node scripts/migrateFaqTranslations.js --execute --limit=5   (test)
 */

const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { translateFaqFields } = require("../utils/faqTranslations");

const args = process.argv.slice(2);
const EXECUTE = args.includes("--execute");
const limitArg = args.find((a) => a.startsWith("--limit="));
const LIMIT = limitArg ? parseInt(limitArg.split("=")[1], 10) : 0;

const hasText = (value) =>
	typeof value === "string" && value.trim().length > 0;
const hasKeywords = (value) => Array.isArray(value) && value.length > 0;

/** Champs anglais manquants, à traduire depuis le français. */
function missingEnglishFields(faq) {
	const missing = {};
	if (hasText(faq.question) && !hasText(faq.questionEn)) {
		missing.question = faq.question;
	}
	if (hasText(faq.answer) && !hasText(faq.answerEn)) {
		missing.answer = faq.answer;
	}
	if (hasKeywords(faq.keywords) && !hasKeywords(faq.keywordsEn)) {
		missing.keywords = faq.keywords;
	}
	return missing;
}

async function run() {
	const mongoUri =
		process.env.DATABASE_URL ||
		process.env.DATABASE_PROD ||
		process.env.DATABASE_LOCAL;
	if (!mongoUri) {
		console.error(
			"❌ Aucune variable DATABASE_URL / DATABASE_PROD / DATABASE_LOCAL trouvée dans .env",
		);
		process.exit(1);
	}

	console.log(`Mode : ${EXECUTE ? "EXECUTE (écritures réelles)" : "DRY-RUN (aucune écriture)"}`);
	if (LIMIT) console.log(`Limite : ${LIMIT} FAQ(s)`);

	await mongoose.connect(mongoUri);
	console.log("✅ Connecté à MongoDB");

	const collection = mongoose.connection.db.collection("faqs");
	const faqs = await collection.find({}).sort({ updatedAt: -1 }).toArray();
	const toTranslate = [];

	for (const faq of faqs) {
		const missing = missingEnglishFields(faq);
		if (Object.keys(missing).length > 0) {
			toTranslate.push({ faq, missing });
			if (LIMIT && toTranslate.length >= LIMIT) break;
		}
	}

	console.log(`📋 ${faqs.length} FAQ(s) au total, ${toTranslate.length} à compléter en anglais`);

	const stats = { processed: 0, translated: 0, partial: 0, failed: 0 };

	for (const { faq, missing } of toTranslate) {
		stats.processed += 1;
		const { questionEn, answerEn, keywordsEn } =
			await translateFaqFields(missing);

		const update = {};
		if (questionEn) update.questionEn = questionEn;
		if (answerEn) update.answerEn = answerEn;
		if (keywordsEn.length > 0) update.keywordsEn = keywordsEn;

		const requested = Object.keys(missing).length;
		const filled =
			(questionEn ? 1 : 0) + (answerEn ? 1 : 0) + (keywordsEn.length ? 1 : 0);

		if (filled === 0) {
			stats.failed += 1;
		} else if (filled < requested) {
			stats.partial += 1;
			stats.translated += 1;
		} else {
			stats.translated += 1;
		}

		if (EXECUTE && Object.keys(update).length > 0) {
			update.updatedAt = new Date();
			await collection.updateOne({ _id: faq._id }, { $set: update });
		}

		console.log(
			`  ${EXECUTE ? "✏️" : "🔍"} ${faq.question} → ${questionEn || "⚠️ traduction impossible"}`,
		);

		if (stats.processed % 10 === 0) {
			console.log(`  ... ${stats.processed}/${toTranslate.length} traités`);
		}
	}

	console.log("\n=== Résumé ===");
	console.log(`FAQs traitées            : ${stats.processed}`);
	console.log(`FAQs complétées en anglais : ${stats.translated}`);
	console.log(`  dont partiellement       : ${stats.partial}`);
	console.log(`Échecs de traduction      : ${stats.failed}`);
	if (!EXECUTE) {
		console.log(
			"\n⚠️  DRY-RUN : aucune écriture appliquée. Relancer avec --execute pour appliquer.",
		);
	}

	await mongoose.connection.close();
	console.log("✅ Connexion fermée");
	process.exit(0);
}

run().catch(async (error) => {
	console.error("❌ Erreur durant la migration :", error);
	try {
		await mongoose.connection.close();
	} catch {}
	process.exit(1);
});
