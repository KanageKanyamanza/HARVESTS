const path = require("path");
const dotenv = require("dotenv");
const axios = require("axios");
const mongoose = require("mongoose");

dotenv.config({ path: path.join(__dirname, "../.env") });

// Remplit "Date inscription" / "Total inscriptions" sur les lignes créées par
// createMissingSheetRows.js, restées vides à cause du bug de nom de colonne
// ("Date"/"Total" au lieu de "Date inscription"/"Total inscriptions") déjà
// corrigé dans le Apps Script. Récupère le numéro de ligne via l'action
// "update" (fiable maintenant que ces lignes ont un Email unique), puis
// remplit via "fillRowByNumber" (n'écrase jamais une cellule déjà remplie).
//
// Usage : node scripts/fillDatesForCreatedRows.js

const EMAILS = [
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
	{ email: String, createdAt: Date },
	{ timestamps: true }
);
const User = mongoose.models.User || mongoose.model("User", UserSchema, "users");

function formatDate(date) {
	const day = String(date.getDate()).padStart(2, "0");
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const year = date.getFullYear();
	return `${day}/${month}/${year}`;
}

async function run() {
	const webhookUrl = process.env.GOOGLE_SHEETS_WEBAPP_URL;
	if (!webhookUrl) {
		console.error("❌ GOOGLE_SHEETS_WEBAPP_URL non défini");
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
		console.log("✅ Connexion réussie\n");

		const users = await User.find({ email: { $in: EMAILS } });
		const summary = { filled: 0, already_filled: 0, not_found: 0, error: 0 };

		for (const user of users) {
			const date = formatDate(new Date(user.createdAt));
			try {
				const updateRes = await axios.post(webhookUrl, {
					action: "update",
					lookupEmail: user.email,
					email: user.email,
				}, { timeout: 30000, maxRedirects: 20 });

				const row = updateRes.data?.row;
				if (!row) {
					console.log(`${user.email} -> pas de ligne trouvée`);
					summary.not_found++;
					continue;
				}

				const fillRes = await axios.post(webhookUrl, {
					action: "fillRowByNumber",
					row,
					date,
					total: 1,
				}, { timeout: 30000, maxRedirects: 20 });

				console.log(`${user.email} -> row ${row} -> ${fillRes.data?.result}`);
				if (summary[fillRes.data?.result] !== undefined) summary[fillRes.data.result]++;
			} catch (err) {
				summary.error++;
				console.error(`${user.email} -> erreur: ${err.message}`);
			}
		}

		console.log("\n📊 Résumé :", summary);
	} catch (error) {
		console.error("❌ Erreur :", error);
	} finally {
		await mongoose.disconnect();
		console.log("🔌 Déconnecté de MongoDB");
	}
}

run();
