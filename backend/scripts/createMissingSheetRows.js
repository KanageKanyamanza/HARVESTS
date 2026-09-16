const path = require("path");
const dotenv = require("dotenv");
const axios = require("axios");
const mongoose = require("mongoose");

dotenv.config({ path: path.join(__dirname, "../.env") });

// Crée les lignes manquantes dans HARVEST_DASHBOARD_DATA pour les vraies
// inscriptions qui n'ont jamais été synchronisées (identifiées via
// backfillSheetContacts.js : "not_found" après nettoyage des doublons et
// réconciliation des 2 cas de nom différent). Utilise l'action "create" déjà
// existante du Apps Script — équivalent à ce qu'une inscription en temps réel
// aurait dû produire.
//
// Usage : node scripts/createMissingSheetRows.js [--dry-run]

const EMAILS_TO_CREATE = [
	"akakpo030@gmail.com", "nafisatouma12@gmail.com", "nematasakande20@gmai.com",
	"sawadogojhamila@gmail.com", "rakima2013@gmail.com", "mamounata.kabor@yahoo.fr",
	"assisnkr1@gmail.com", "damsosko@hotmail.fr",
	"fatikabore279@gmail.com", "sinareb26@gmail.com", "ouedraogo@harvests.bf",
	"joudi@harvests.bf", "zida@harvest.bf", "kafando@harvests.bf",
	"bagre@harvests.bf", "rihanata@harvests.bf", "zagre@harvests.bf",
	"marguerite@harvests.bf", "bankoungou@harvests.bf", "kombudri@harvests.bf",
	"ouedraogo1@harvests.bf", "dominique@harvests.bf", "dieni@harvests.bf",
	"fati@harvests.bf", "sawadogo1@harvests.bf", "ouedraogo2@harvests.bf",
	"djinda@harvests.bf", "kabre@harvests.bf", "fatima@harvests.bf",
	"simpore@harvests.bf", "rasmata@harvests.bf", "kouamba@harvests.bf",
	"garangochristine88@gmail.com", "nikiema@harvests.bf", "tapsoba1@harvests.bf",
	"guire@harvests.bf", "negmebega@harvests.bf", "sinare1@harvests.bf",
	"kabore11@harvests.bf", "assetou@harvests.bf", "zebre@harvests.bf",
	"abzeta@harvest.bf", "bibata@harvests.bf", "tiendrebeogo@harvests.bf",
	"ouedraogo3@harvests.bf", "ousmane@harvests.bf", "conkobo@harvests.bf",
	"nassa@harvest.bf", "contigre@harvests.bf", "tapsoba2@harvests.bf",
	"ouedraogo@harvesr.bf", "clarisse@harvests.bf", "justine@harvests.bf",
	"convolbo@harvests.bf", "sibdou@harvests.bf", "kabore12@harvests.bf",
	"kimtega@harvests.bf", "zongo@harvests.bf", "odile@harvests.bf",
	"sawadoga@harvests.bf", "marie@harvests.bf", "sanata@harvests.bf",
	"pategre@harvests.bf", "kadidja@harvests.bf", "poginga@harvests.bf",
	"koulga@harvest.bf", "minouaga@harvest.bf", "kiemtore@harvests.bf",
	"ouali@harvests.bf", "marienana@harvests.bf", "kbnumerique1.0@gmail.com",
	"chantal@harvests.bf", "rasmata3@harvests.bf", "dayara@hqrvests.bf",
	"adama@harvests.bf", "yembi@harvests.bf",
];

const UserSchema = new mongoose.Schema(
	{
		email: String,
		phone: String,
		firstName: String,
		lastName: String,
		userType: String,
		farmName: String,
		restaurantName: String,
		companyName: String,
		referredBy: String,
		createdAt: Date,
	},
	{ timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema, "users");

function cleanName(str) {
	if (!str) return "";
	const s = str.toString().trim();
	if (s.toLowerCase() === "à compléter" || s.toLowerCase() === "acompleter") return "";
	return s;
}

function getUserDisplayName(user) {
	let businessName = "";
	if (user.userType === "producer") businessName = cleanName(user.farmName);
	else if (user.userType === "restaurateur") businessName = cleanName(user.restaurantName);
	else if (["transformer", "exporter", "transporter"].includes(user.userType)) businessName = cleanName(user.companyName);
	if (businessName) return businessName;

	const first = cleanName(user.firstName);
	const last = cleanName(user.lastName);
	const fullName = `${first} ${last}`.trim();
	if (fullName) return fullName;

	return cleanName(user.farmName) || cleanName(user.restaurantName) || cleanName(user.companyName) || user.email || "";
}

function formatDate(date) {
	const day = String(date.getDate()).padStart(2, "0");
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const year = date.getFullYear();
	return `${day}/${month}/${year}`;
}

function buildPayload(user) {
	const name = getUserDisplayName(user);
	return {
		action: "create",
		date: formatDate(new Date(user.createdAt || new Date())),
		commercial: user.referredBy || "",
		producteurs: user.userType === "producer" ? name : "",
		transformateurs: user.userType === "transformer" ? name : "",
		restaurateurs: user.userType === "restaurateur" ? name : "",
		exportateurs: user.userType === "exporter" ? name : "",
		transporteurs: user.userType === "transporter" ? name : "",
		consommateurs: user.userType === "consumer" ? name : "",
		email: user.email || "",
		telephone: user.phone || "",
		total: 1,
	};
}

async function run() {
	const dryRun = process.argv.includes("--dry-run");
	const webhookUrl = process.env.GOOGLE_SHEETS_WEBAPP_URL;
	if (!webhookUrl && !dryRun) {
		console.error("❌ GOOGLE_SHEETS_WEBAPP_URL non défini dans .env");
		process.exit(1);
	}

	try {
		const uri = process.env.DATABASE_URL || process.env.DATABASE?.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);
		if (!uri) {
			console.error("❌ DATABASE_URL (ou DATABASE + DATABASE_PASSWORD) non défini dans .env");
			process.exit(1);
		}
		console.log("🔄 Connexion à la base de données...");
		await mongoose.connect(uri);
		console.log("✅ Connexion réussie à MongoDB");

		const users = await User.find({ email: { $in: EMAILS_TO_CREATE } }).sort({ createdAt: 1 });
		console.log(`📈 ${users.length}/${EMAILS_TO_CREATE.length} utilisateur(s) trouvé(s) en base${dryRun ? " (dry-run)" : ""}\n`);

		const foundEmails = new Set(users.map((u) => u.email));
		const missing = EMAILS_TO_CREATE.filter((e) => !foundEmails.has(e));
		if (missing.length > 0) {
			console.log("⚠️ Introuvables en base (ignorés) :", missing);
		}

		let created = 0;
		let errors = 0;
		for (const user of users) {
			const payload = buildPayload(user);
			if (dryRun) {
				console.log(`[dry-run] ${user.email} -> ${JSON.stringify(payload)}`);
				continue;
			}
			try {
				const { data } = await axios.post(webhookUrl, payload, { timeout: 30000, maxRedirects: 20 });
				console.log(`${user.email} -> ${data?.status} ${data?.action || ""}`);
				if (data?.status === "success") created++;
				else errors++;
			} catch (err) {
				errors++;
				console.error(`${user.email} -> erreur réseau: ${err.message}`);
			}
		}

		if (!dryRun) {
			console.log(`\n📊 ${created} ligne(s) créée(s), ${errors} erreur(s).`);
		}
	} catch (error) {
		console.error("❌ Erreur :", error);
	} finally {
		await mongoose.disconnect();
		console.log("🔌 Déconnecté de MongoDB");
	}
}

run();
