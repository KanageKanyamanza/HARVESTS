/**
 * Jour 59 (sécurité) — rend non publics les documents administratifs déjà
 * envoyés (pièce d'identité, RCCM, NINEA, permis, certifications…).
 *
 * Avant le Jour 59, ils étaient stockés sur Cloudinary en type « upload » :
 * toute personne ayant l'URL pouvait les ouvrir. Ce script :
 *  1. repère, dans chaque document de chaque collection, les URL Cloudinary
 *     publiques situées sous harvests/documents/ ;
 *  2. bascule chaque fichier en type « authenticated » (uploader.rename avec
 *     to_type) — l'ancienne URL publique cesse alors de fonctionner ;
 *  3. remplace l'URL enregistrée par la nouvelle, lue ensuite via
 *     /api/v1/upload/documents/access (lien signé temporaire).
 *
 * Jour 69 : deux corrections de périmètre.
 *  - Connexion : la base visée est résolue comme le fait l'application
 *    (`DATABASE` + `DATABASE_PASSWORD`), puis `MONGODB_URI`, `MONGO_URI`,
 *    `DATABASE_URL`, `DATABASE_PROD`. Avant, `DATABASE` — la variable réellement
 *    utilisée par l'API — n'était pas lue : on pouvait migrer une autre base
 *    que celle de production sans s'en apercevoir.
 *  - Collections : les documents ne vivent pas seulement dans `users` mais
 *    aussi dans les profils métiers (`producers`, `transformers`,
 *    `restaurateurs`, `transporters`, `exporters`…), cf. models/Producer.js.
 *    Toutes les collections sont donc parcourues ; le filtre sur
 *    harvests/documents/ et le type « upload » évite de toucher aux images
 *    produits ou aux pièces jointes de commandes.
 *
 * SIMULATION PAR DÉFAUT : rien n'est modifié sans --apply.
 *   node scripts/migrate-documents-private.js            # liste ce qui serait migré
 *   node scripts/migrate-documents-private.js --apply    # migre réellement
 *   option --limit=N pour parcourir N documents au plus
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");
const { parseCloudinaryUrl } = require("../utils/cloudinaryAsset");

// Journal de reprise : chaque correspondance ancienne → nouvelle URL est écrite AVANT la
// mise à jour de la base. Si le script s'interrompt, le fichier permet de réparer.
const RECOVERY_LOG = path.join(__dirname, `migrate-documents-private.${new Date().toISOString().slice(0, 10)}.log.jsonl`);

const APPLY = process.argv.includes("--apply");
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const LIMIT = limitArg ? parseInt(limitArg.split("=")[1], 10) : 0;

/**
 * Même précédence que l'application : `DATABASE` (+ `DATABASE_PASSWORD`) est la
 * configuration réellement utilisée par l'API ; les URI complètes ne servent
 * que de repli pour les environnements qui n'utilisent pas le gabarit.
 */
const resolveMongoUri = () => {
	const template = process.env.DATABASE;
	if (template) {
		const password = process.env.DATABASE_PASSWORD;
		if (template.includes("<PASSWORD>")) {
			if (!password) return null;
			return template.replace("<PASSWORD>", password);
		}
		return template;
	}
	return (
		process.env.MONGODB_URI ||
		process.env.MONGO_URI ||
		process.env.DATABASE_URL ||
		process.env.DATABASE_LOCAL ||
		process.env.DATABASE_PROD ||
		null
	);
};

const MONGO_URI = resolveMongoUri();
if (!MONGO_URI) {
	console.error("❌ Aucune connexion MongoDB trouvée dans .env (DATABASE + DATABASE_PASSWORD, MONGODB_URI, DATABASE_URL…)");
	process.exit(1);
}

cloudinary.config({
	cloud_name: (process.env.CLOUDINARY_CLOUD_NAME || "").trim(),
	api_key: (process.env.CLOUDINARY_API_KEY || "").trim(),
	api_secret: (process.env.CLOUDINARY_API_SECRET || "").trim(),
});

const URL_RE = /https?:\/\/res\.cloudinary\.com\/[^"'\s]+/g;
const isPublicDocument = (url) => {
	const parsed = parseCloudinaryUrl(url);
	return Boolean(parsed && parsed.type === "upload" && parsed.publicId.startsWith("harvests/documents/"));
};

// Remplace les URL dans toute la structure (chaînes imbriquées dans objets / tableaux)
const replaceDeep = (value, mapping) => {
	// Remplacement aussi à l'intérieur d'une chaîne plus longue
	if (typeof value === "string") {
		let out = value;
		for (const [from, to] of mapping) if (out.includes(from)) out = out.split(from).join(to);
		return out;
	}
	if (Array.isArray(value)) return value.map((v) => replaceDeep(v, mapping));
	// ObjectId, Date, Binary… (valeurs BSON) laissés tels quels
	if (value && typeof value === "object" && !(value instanceof Date) && !value._bsontype) {
		return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, replaceDeep(v, mapping)]));
	}
	return value;
};

const describeDocument = (doc) => doc.email || doc.name || doc.title || String(doc._id);

async function migrate() {
	await mongoose.connect(MONGO_URI);
	console.log(`✅ Connecté à MongoDB — mode ${APPLY ? "APPLICATION" : "SIMULATION (aucune modification)"}\n`);

	const db = mongoose.connection.db;
	const collections = (await db.listCollections().toArray())
		.map((c) => c.name)
		.filter((name) => !name.startsWith("system."))
		.sort();

	let scannedDocuments = 0;
	let documentsWithDocs = 0;
	let filesMigrated = 0;
	let collectionsTouched = 0;
	const failures = [];

	for (const collectionName of collections) {
		const collection = db.collection(collectionName);
		const cursor = collection.find({});
		let collectionTouched = false;

		for await (const doc of cursor) {
			if (LIMIT && scannedDocuments >= LIMIT) break;
			scannedDocuments += 1;

			const urls = [...new Set((JSON.stringify(doc).match(URL_RE) || []).map((u) => u.replace(/\\+$/, "")))].filter(
				isPublicDocument,
			);
			if (urls.length === 0) continue;
			documentsWithDocs += 1;
			collectionTouched = true;
			console.log(`👤 ${collectionName}/${describeDocument(doc)} — ${urls.length} document(s) public(s)`);

			const mapping = new Map();
			for (const url of urls) {
				const parsed = parseCloudinaryUrl(url);
				if (!APPLY) {
					console.log(`   · ${parsed.publicId}${parsed.format ? `.${parsed.format}` : ""}`);
					continue;
				}
				try {
					const result = await cloudinary.uploader.rename(parsed.publicId, parsed.publicId, {
						resource_type: parsed.resourceType,
						type: "upload",
						to_type: "authenticated",
						overwrite: false,
					});
					mapping.set(url, result.secure_url);
					filesMigrated += 1;
					console.log(`   ✓ ${parsed.publicId}`);
				} catch (error) {
					// Relance après interruption : fichier déjà basculé mais base pas encore à jour
					try {
						const existing = await cloudinary.api.resource(parsed.publicId, {
							resource_type: parsed.resourceType,
							type: "authenticated",
						});
						mapping.set(url, existing.secure_url);
						console.log(`   ↻ ${parsed.publicId} (déjà protégé, fiche réparée)`);
						continue;
					} catch {
						// vraiment en échec
					}
					failures.push({ collection: collectionName, document: describeDocument(doc), url, error: error.message || String(error) });
					console.log(`   ✗ ${parsed.publicId} : ${error.message || error}`);
				}
			}

			if (APPLY && mapping.size > 0) {
				fs.appendFileSync(
					RECOVERY_LOG,
					JSON.stringify({
						collection: collectionName,
						documentId: String(doc._id),
						label: describeDocument(doc),
						mapping: Object.fromEntries(mapping),
					}) + "\n",
				);
				// Mise à jour des seuls champs de premier niveau qui contiennent une URL migrée
				const $set = {};
				for (const [field, value] of Object.entries(doc)) {
					if (field === "_id") continue;
					const replaced = replaceDeep(value, mapping);
					if (JSON.stringify(replaced) !== JSON.stringify(value)) $set[field] = replaced;
				}
				if (Object.keys($set).length) await collection.updateOne({ _id: doc._id }, { $set });
			}
		}

		if (collectionTouched) collectionsTouched += 1;
		if (LIMIT && scannedDocuments >= LIMIT) {
			console.log(`\n⏸  Limite de ${LIMIT} document(s) atteinte — relancer pour continuer.`);
			break;
		}
	}

	console.log(`\n📊 ${scannedDocuments} document(s) parcouru(s) dans ${collections.length} collection(s), ${documentsWithDocs} avec des documents publics (${collectionsTouched} collection(s) concernée(s)).`);
	if (APPLY) console.log(`   ${filesMigrated} fichier(s) basculé(s) en accès protégé, ${failures.length} échec(s). Journal : ${RECOVERY_LOG}`);
	else console.log("   Relancer avec --apply pour migrer réellement.");
	if (failures.length) console.log(JSON.stringify(failures, null, 2));

	await mongoose.disconnect();
}

migrate().catch(async (error) => {
	console.error("❌ Migration interrompue :", error);
	await mongoose.disconnect().catch(() => {});
	process.exit(1);
});
