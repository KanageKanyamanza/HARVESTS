/**
 * Jour 48 (bascule bilingue) - glossaire dans les deux sens.
 *
 * 1. Ajoute `direction: "fr-en"` aux entrées existantes (créées au Jour 46,
 *    avant l'existence du champ). Le code les lit déjà comme fr -> en ; ceci
 *    rend la donnée explicite.
 * 2. Supprime l'index unique { type, source } du Jour 46 : il empêcherait
 *    d'ajouter en en -> fr un terme déjà présent en fr -> en. Il est remplacé
 *    par { direction, type, source }, créé à la fin du script.
 *
 * Idempotent. SÉCURITÉ : se connecte à la base pointée par DATABASE_URL /
 * DATABASE_PROD (Atlas Prod dans cet environnement). Tourne en "dry-run" par
 * défaut, sans aucune écriture ni création d'index (autoIndex désactivé) —
 * il faut passer --execute pour appliquer. Ne JAMAIS lancer --execute sans
 * confirmation explicite de l'utilisateur.
 *
 * Usage :
 *   node scripts/migrateGlossaryDirection.js            (dry-run)
 *   node scripts/migrateGlossaryDirection.js --execute  (applique)
 */

const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const TranslationGlossary = require("../models/TranslationGlossary");

const EXECUTE = process.argv.slice(2).includes("--execute");
const OLD_INDEX = "type_1_source_1";

async function run() {
	const mongoUri = process.env.DATABASE_URL || process.env.DATABASE_PROD || process.env.DATABASE_LOCAL;
	if (!mongoUri) {
		console.error("❌ Aucune variable DATABASE_URL / DATABASE_PROD / DATABASE_LOCAL trouvée dans .env");
		process.exit(1);
	}

	console.log(`Mode : ${EXECUTE ? "EXECUTE (écritures réelles)" : "DRY-RUN (aucune écriture)"}`);

	// autoIndex désactivé : Mongoose ne doit rien créer tout seul en dry-run
	await mongoose.connect(mongoUri, { autoIndex: false });
	console.log("✅ Connecté à MongoDB");

	const collection = TranslationGlossary.collection;

	// 1) Entrées sans sens
	const missingFilter = { direction: { $exists: false } };
	const missing = await collection.countDocuments(missingFilter);
	console.log(`\n1) Entrées sans \`direction\` : ${missing}`);
	if (missing && EXECUTE) {
		const { modifiedCount } = await collection.updateMany(missingFilter, { $set: { direction: "fr-en" } });
		console.log(`   → ${modifiedCount} entrée(s) passée(s) en fr-en`);
	}

	// 2) Ancien index
	const indexes = await collection.indexes();
	const hasOldIndex = indexes.some((i) => i.name === OLD_INDEX);
	console.log(`\n2) Ancien index ${OLD_INDEX} : ${hasOldIndex ? "présent" : "absent"}`);
	if (hasOldIndex && EXECUTE) {
		await collection.dropIndex(OLD_INDEX);
		console.log("   → supprimé");
	}

	// 3) Nouvel index (à faire après le 1, pour ne pas indexer des `null`)
	const hasNewIndex = indexes.some((i) => i.key?.direction === 1 && i.key?.type === 1 && i.key?.source === 1);
	console.log(`\n3) Index { direction, type, source } : ${hasNewIndex ? "présent" : "absent"}`);
	if (!hasNewIndex && EXECUTE) {
		await TranslationGlossary.createIndexes();
		console.log("   → créé");
	}

	if (!EXECUTE) {
		console.log("\n⚠️  DRY-RUN : aucune écriture appliquée. Relancer avec --execute pour appliquer.");
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
