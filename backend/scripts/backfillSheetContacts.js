const path = require("path");
const dotenv = require("dotenv");
const axios = require("axios");
const mongoose = require("mongoose");

dotenv.config({ path: path.join(__dirname, "../.env") });

// Pousse Email/Téléphone vers les lignes déjà existantes dans la Google
// Sheet (créées avant l'ajout de ces colonnes) via l'action "backfill" du
// Apps Script (docs/google-apps-script-sync.gs). Le matching se fait côté
// script par nom+date, jamais par e-mail (vide sur les anciennes lignes).
// Le script Apps Script ne remplit jamais une cellule déjà non vide et ne
// devine jamais en cas d'ambiguïté — il remonte le résultat pour chaque
// utilisateur, résumé ici en fin d'exécution.
//
// Usage : node scripts/backfillSheetContacts.js [--dry-run]

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
	if (s.toLowerCase() === "à compléter" || s.toLowerCase() === "acompleter") {
		return "";
	}
	return s;
}

function getUserDisplayName(user) {
	let businessName = "";
	if (user.userType === "producer") {
		businessName = cleanName(user.farmName);
	} else if (user.userType === "restaurateur") {
		businessName = cleanName(user.restaurantName);
	} else if (["transformer", "exporter", "transporter"].includes(user.userType)) {
		businessName = cleanName(user.companyName);
	}
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
	if (!name) return null;

	return {
		action: "backfill",
		date: formatDate(new Date(user.createdAt || new Date())),
		producteurs: user.userType === "producer" ? name : "",
		transformateurs: user.userType === "transformer" ? name : "",
		restaurateurs: user.userType === "restaurateur" ? name : "",
		exportateurs: user.userType === "exporter" ? name : "",
		transporteurs: user.userType === "transporter" ? name : "",
		consommateurs: user.userType === "consumer" ? name : "",
		email: user.email || "",
		telephone: user.phone || "",
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

		const users = await User.find({ $or: [{ email: { $ne: null } }, { phone: { $ne: null } }] }).sort({ createdAt: 1 });
		console.log(`📈 ${users.length} utilisateur(s) à traiter${dryRun ? " (dry-run, aucun appel réseau)" : ""}\n`);

		const summary = { filled: 0, already_filled: 0, not_found: 0, ambiguous: 0, no_name: 0, error: 0 };
		const toReview = [];

		for (const user of users) {
			const payload = buildPayload(user);
			if (!payload) {
				summary.no_name++;
				toReview.push({ email: user.email, reason: "no_name" });
				continue;
			}

			if (dryRun) {
				console.log(`[dry-run] ${user.email} -> ${JSON.stringify(payload)}`);
				continue;
			}

			try {
				const { data } = await axios.post(webhookUrl, payload, { timeout: 30000, maxRedirects: 20 });
				const result = data?.result || (data?.status === "error" ? "error" : "unknown");
				if (summary[result] !== undefined) summary[result]++;
				else summary.error++;

				if (["not_found", "ambiguous", "error", "no_name"].includes(result)) {
					toReview.push({ email: user.email, name: data?.name, result, rows: data?.rows, message: data?.message });
				}
				console.log(`${user.email} -> ${result}`);
			} catch (err) {
				summary.error++;
				toReview.push({ email: user.email, reason: err.message });
				console.error(`${user.email} -> erreur réseau: ${err.message}`);
			}
		}

		console.log("\n📊 Résumé :", summary);
		if (toReview.length > 0) {
			console.log(`\n⚠️  ${toReview.length} ligne(s) à vérifier manuellement dans la feuille :`);
			console.table(toReview);
		}
	} catch (error) {
		console.error("❌ Erreur :", error);
	} finally {
		await mongoose.disconnect();
		console.log("🔌 Déconnecté de MongoDB");
	}
}

run();
