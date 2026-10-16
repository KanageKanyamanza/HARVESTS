/**
 * Jour 59 (sécurité) — rend non publics les documents administratifs déjà
 * envoyés (pièce d'identité, RCCM, NINEA, permis, certifications…).
 *
 * Avant le Jour 59, ils étaient stockés sur Cloudinary en type « upload » :
 * toute personne ayant l'URL pouvait les ouvrir. Ce script :
 *  1. repère, dans chaque utilisateur, les URL Cloudinary publiques situées
 *     sous harvests/documents/ ;
 *  2. bascule chaque fichier en type « authenticated » (uploader.rename avec
 *     to_type) — l'ancienne URL publique cesse alors de fonctionner ;
 *  3. remplace l'URL enregistrée par la nouvelle, lue ensuite via
 *     /api/v1/upload/documents/access (lien signé temporaire).
 *
 * SIMULATION PAR DÉFAUT : rien n'est modifié sans --apply.
 *   node scripts/migrate-documents-private.js            # liste ce qui serait migré
 *   node scripts/migrate-documents-private.js --apply    # migre réellement
 *   option --limit=N pour traiter N utilisateurs au plus
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const { parseCloudinaryUrl } = require("../utils/cloudinaryAsset");

const APPLY = process.argv.includes("--apply");
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const LIMIT = limitArg ? parseInt(limitArg.split("=")[1], 10) : 0;

const MONGO_URI =
	process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_LOCAL || process.env.DATABASE_PROD;
if (!MONGO_URI) {
	console.error("❌ MONGODB_URI introuvable dans .env");
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
	if (typeof value === "string") return mapping.get(value) ?? value;
	if (Array.isArray(value)) return value.map((v) => replaceDeep(v, mapping));
	// ObjectId, Date, Binary… (valeurs BSON) laissés tels quels
	if (value && typeof value === "object" && !(value instanceof Date) && !value._bsontype) {
		return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, replaceDeep(v, mapping)]));
	}
	return value;
};

async function migrate() {
	await mongoose.connect(MONGO_URI);
	console.log(`✅ Connecté à MongoDB — mode ${APPLY ? "APPLICATION" : "SIMULATION (aucune modification)"}\n`);

	const users = mongoose.connection.db.collection("users");
	const cursor = users.find({}, { projection: { password: 0 } });

	let scanned = 0;
	let usersWithDocs = 0;
	let filesMigrated = 0;
	const failures = [];

	for await (const user of cursor) {
		if (LIMIT && scanned >= LIMIT) break;
		scanned += 1;

		const urls = [...new Set((JSON.stringify(user).match(URL_RE) || []).map((u) => u.replace(/\\+$/, "")))].filter(
			isPublicDocument,
		);
		if (urls.length === 0) continue;
		usersWithDocs += 1;
		console.log(`👤 ${user.email} (${user.userType}) — ${urls.length} document(s) public(s)`);

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
				failures.push({ email: user.email, url, error: error.message || String(error) });
				console.log(`   ✗ ${parsed.publicId} : ${error.message || error}`);
			}
		}

		if (APPLY && mapping.size > 0) {
			// Mise à jour des seuls champs de premier niveau qui contiennent une URL migrée
			const $set = {};
			for (const [field, value] of Object.entries(user)) {
				if (field === "_id") continue;
				const replaced = replaceDeep(value, mapping);
				if (JSON.stringify(replaced) !== JSON.stringify(value)) $set[field] = replaced;
			}
			if (Object.keys($set).length) await users.updateOne({ _id: user._id }, { $set });
		}
	}

	console.log(`\n📊 ${scanned} utilisateur(s) parcouru(s), ${usersWithDocs} avec des documents publics.`);
	if (APPLY) console.log(`   ${filesMigrated} fichier(s) basculé(s) en accès protégé, ${failures.length} échec(s).`);
	else console.log("   Relancer avec --apply pour migrer réellement.");
	if (failures.length) console.log(JSON.stringify(failures, null, 2));

	await mongoose.disconnect();
}

migrate().catch(async (error) => {
	console.error("❌ Migration interrompue :", error);
	await mongoose.disconnect().catch(() => {});
	process.exit(1);
});
