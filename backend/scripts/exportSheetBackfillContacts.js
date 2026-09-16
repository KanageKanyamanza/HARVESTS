const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "../.env") });

// Génère un CSV avec les mêmes colonnes Date/Commercial/rôle que
// historic_registrations_by_role.csv, plus Email et Téléphone à la fin,
// pour permettre de retrouver visuellement chaque ligne existante dans la
// feuille Google Sheets (via Date + nom) et d'y coller Email/Téléphone à la
// main. Lecture seule : ne touche ni la base ni la feuille.
//
// Usage : node scripts/exportSheetBackfillContacts.js

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

	const anyBusinessName = cleanName(user.farmName) || cleanName(user.restaurantName) || cleanName(user.companyName);
	if (anyBusinessName) return anyBusinessName;

	return user.email || "Utilisateur sans nom";
}

async function run() {
	try {
		const uri = process.argv[2] || process.env.DATABASE_URL || process.env.DATABASE?.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);
		if (!uri) {
			console.error("❌ DATABASE_URL (ou DATABASE + DATABASE_PASSWORD, ou un URI en argument) non défini");
			process.exit(1);
		}
		console.log("🔄 Connexion à la base de données...");
		await mongoose.connect(uri);
		console.log("✅ Connexion réussie à MongoDB");

		const users = await User.find({}).sort({ createdAt: 1 });
		if (users.length === 0) {
			console.log("⚠️ Aucun utilisateur trouvé.");
			return;
		}

		console.log(`📈 ${users.length} utilisateurs trouvés. Génération du CSV...`);

		let csvContent = "﻿Date inscription;Commercial;Producteurs;Transformateurs;Restaurateurs;Exportateurs;Transporteurs;Consommateurs;Email;Téléphone\n";
		let missingContact = 0;

		users.forEach((user) => {
			const date = new Date(user.createdAt || new Date());
			const formattedDate = `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;

			const name = getUserDisplayName(user);
			const type = user.userType;

			const producteurs = type === "producer" ? name : "";
			const transformateurs = type === "transformer" ? name : "";
			const restaurateurs = type === "restaurateur" ? name : "";
			const exportateurs = type === "exporter" ? name : "";
			const transporteurs = type === "transporter" ? name : "";
			const consommateurs = type === "consumer" ? name : "";

			const commercial = user.referredBy || "";
			const email = user.email || "";
			const phone = user.phone || "";
			if (!email && !phone) missingContact++;

			csvContent += `${formattedDate};${commercial};${producteurs};${transformateurs};${restaurateurs};${exportateurs};${transporteurs};${consommateurs};${email};${phone}\n`;
		});

		const outputPath = path.join(__dirname, "../../sheet_backfill_contacts.csv");
		fs.writeFileSync(outputPath, csvContent, "utf8");

		console.log(`\n🎉 Export terminé !`);
		console.log(`📁 Fichier : ${outputPath}`);
		console.log(`ℹ️  ${missingContact} utilisateur(s) sans email ni téléphone.`);
		console.log(`\nCompare chaque ligne à la feuille Google Sheets via la colonne Date + le nom déjà présent, puis colle Email/Téléphone dans les colonnes correspondantes.`);
	} catch (error) {
		console.error("❌ Erreur pendant l'export :", error);
	} finally {
		await mongoose.disconnect();
		console.log("🔌 Déconnecté de MongoDB");
	}
}

run();
