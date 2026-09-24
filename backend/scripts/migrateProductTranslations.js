/**
 * Jour 45 (bascule bilingue - option 4) - rétro-traduction du catalogue.
 *
 * Passe tous les Product dont name/description/shortDescription sont encore
 * une simple chaîne (documents créés avant ce jour) vers la forme bilingue
 * { fr, en }, avec `en` rempli par traduction automatique (MyMemory puis
 * LibreTranslate, cf utils/translateText.js). Les documents déjà migrés
 * ({fr, en} avec `en` renseigné) sont ignorés.
 *
 * SÉCURITÉ : ce script se connecte à la base pointée par DATABASE_URL /
 * DATABASE_PROD (Atlas Prod dans cet environnement). Il tourne en mode
 * "dry-run" par défaut (aucune écriture) — il faut passer --execute pour
 * appliquer les changements. Ne JAMAIS lancer --execute sans confirmation
 * explicite de l'utilisateur.
 *
 * Usage :
 *   node scripts/migrateProductTranslations.js                 (dry-run, résumé seulement)
 *   node scripts/migrateProductTranslations.js --execute        (applique les écritures)
 *   node scripts/migrateProductTranslations.js --execute --limit=50   (test sur 50 documents)
 *   node scripts/migrateProductTranslations.js --recreate-text-index  (en plus : recrée l'index text avec name.fr/en, description.fr/en)
 */

const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { translateText } = require("../utils/translateText");

const args = process.argv.slice(2);
const EXECUTE = args.includes("--execute");
const RECREATE_INDEX = args.includes("--recreate-text-index");
const limitArg = args.find((a) => a.startsWith("--limit="));
const LIMIT = limitArg ? parseInt(limitArg.split("=")[1], 10) : 0;

const BILINGUAL_FIELDS = ["name", "description", "shortDescription"];

function needsMigration(value) {
	if (value === undefined || value === null || value === "") return false;
	if (typeof value === "string") return true; // legacy plain string
	if (typeof value === "object" && typeof value.fr === "string" && !value.en) {
		return true; // objet déjà {fr} sans en (ex: traduction précédente en échec)
	}
	return false;
}

function shapeAsFr(value) {
	if (typeof value === "string") return { fr: value };
	return value;
}

async function migrateOneProduct(rawDoc, collection, stats) {
	const update = {};
	let anyFieldTranslated = false;

	for (const field of BILINGUAL_FIELDS) {
		const value = rawDoc[field];
		if (!needsMigration(value)) continue;

		const shaped = shapeAsFr(value);
		if (!shaped.fr) continue;

		const { translatedText, ok } = await translateText(shaped.fr, "fr", "en");
		if (ok && translatedText) {
			update[field] = { fr: shaped.fr, en: translatedText };
			anyFieldTranslated = true;
		} else {
			update[field] = { fr: shaped.fr };
			stats.translationFailures += 1;
		}
	}

	if (Object.keys(update).length === 0) return false;

	if (EXECUTE) {
		await collection.updateOne({ _id: rawDoc._id }, { $set: update });
	}

	return anyFieldTranslated;
}

async function recreateTextIndex(collection) {
	console.log("\n🔧 Recréation de l'index text (name/description .fr/.en)...");
	try {
		await collection.dropIndex("name_text_description_text_tags_text");
		console.log("✅ Ancien index text supprimé");
	} catch (error) {
		if (error.codeName === "IndexNotFound") {
			console.log("ℹ️  Pas d'ancien index text à supprimer (nom différent ou déjà absent)");
		} else {
			console.warn("⚠️  Impossible de supprimer l'ancien index text automatiquement :", error.message);
			console.warn("    Vérifie le nom exact via `db.products.getIndexes()` et supprime-le manuellement si besoin.");
		}
	}

	if (EXECUTE) {
		await collection.createIndex({
			"name.fr": "text",
			"name.en": "text",
			"description.fr": "text",
			"description.en": "text",
			tags: "text",
		});
		console.log("✅ Nouvel index text créé (name.fr/en, description.fr/en, tags)");
	} else {
		console.log("ℹ️  [dry-run] Nouvel index text non créé (relancer avec --execute)");
	}
}

async function run() {
	const mongoUri = process.env.DATABASE_URL || process.env.DATABASE_PROD || process.env.DATABASE_LOCAL;
	if (!mongoUri) {
		console.error("❌ Aucune variable DATABASE_URL / DATABASE_PROD / DATABASE_LOCAL trouvée dans .env");
		process.exit(1);
	}

	console.log(`Mode : ${EXECUTE ? "EXECUTE (écritures réelles)" : "DRY-RUN (aucune écriture)"}`);
	if (LIMIT) console.log(`Limite : ${LIMIT} document(s)`);

	await mongoose.connect(mongoUri);
	console.log("✅ Connecté à MongoDB");

	const collection = mongoose.connection.db.collection("products");

	const query = {
		$or: BILINGUAL_FIELDS.map((f) => ({ [f]: { $type: "string" } })),
	};

	const cursor = collection.find(query, LIMIT ? { limit: LIMIT } : {});
	const total = await collection.countDocuments(query);
	console.log(`📦 ${total} produit(s) avec au moins un champ encore en chaîne simple`);

	const stats = { processed: 0, translated: 0, translationFailures: 0 };

	for await (const doc of cursor) {
		stats.processed += 1;
		const translated = await migrateOneProduct(doc, collection, stats);
		if (translated) stats.translated += 1;

		if (stats.processed % 25 === 0) {
			console.log(`  ... ${stats.processed}/${LIMIT || total} traités`);
		}
	}

	console.log("\n=== Résumé ===");
	console.log(`Documents traités        : ${stats.processed}`);
	console.log(`Documents traduits (>=1)  : ${stats.translated}`);
	console.log(`Échecs de traduction      : ${stats.translationFailures} (repli sur {fr} seul)`);
	if (!EXECUTE) {
		console.log("\n⚠️  DRY-RUN : aucune écriture appliquée. Relancer avec --execute pour appliquer.");
	}

	if (RECREATE_INDEX) {
		await recreateTextIndex(collection);
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
