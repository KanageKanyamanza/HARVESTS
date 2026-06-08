const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Charger l'environnement
dotenv.config({ path: path.join(__dirname, "../.env") });

// Schéma minimal pour l'exportation
const UserSchema = new mongoose.Schema(
	{
		email: String,
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

// URI par défaut de production (fourni par l'utilisateur)
const PROD_DATABASE = "mongodb+srv://harvests_db:B3OHy5tFnCSbRh1c@cluster0.mr1qd38.mongodb.net/?appName=Cluster0";

function cleanName(str) {
	if (!str) return "";
	const s = str.toString().trim();
	if (s.toLowerCase() === "à compléter" || s.toLowerCase() === "acompleter") {
		return "";
	}
	return s;
}

function getUserDisplayName(user) {
	// 1. Tenter de récupérer le nom de la structure (selon type d'utilisateur)
	let businessName = "";
	if (user.userType === "producer") {
		businessName = cleanName(user.farmName);
	} else if (user.userType === "restaurateur") {
		businessName = cleanName(user.restaurantName);
	} else if (["transformer", "exporter", "transporter"].includes(user.userType)) {
		businessName = cleanName(user.companyName);
	}

	if (businessName) return businessName;

	// 2. Tenter de récupérer le nom de contact (firstName et lastName nettoyés)
	const first = cleanName(user.firstName);
	const last = cleanName(user.lastName);
	const fullName = `${first} ${last}`.trim();
	
	if (fullName) return fullName;

	// 3. Fallback sur n'importe quel autre nom commercial existant (au cas où)
	const anyBusinessName = cleanName(user.farmName) || cleanName(user.restaurantName) || cleanName(user.companyName);
	if (anyBusinessName) return anyBusinessName;

	// 4. Fallback ultime sur l'email
	return user.email || "Utilisateur sans nom";
}

async function exportData() {
	try {
		console.log("🔄 Connexion à la base de données...");
		const uri = process.argv[2] || process.env.DATABASE?.replace("<PASSWORD>", process.env.DATABASE_PASSWORD) || PROD_DATABASE;
		
		await mongoose.connect(uri, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log("✅ Connexion réussie à MongoDB");

		console.log("📊 Récupération des utilisateurs individuels...");
		const users = await User.find({}).sort({ createdAt: 1 });

		if (users.length === 0) {
			console.log("⚠️ Aucun utilisateur trouvé.");
			await mongoose.disconnect();
			return;
		}

		console.log(`📈 ${users.length} utilisateurs trouvés. Génération du fichier CSV...`);

		// En-têtes du CSV correspondant exactement aux colonnes Excel
		let csvContent = "\ufeffDate inscription;Commercial;Producteurs;Transformateurs;Restaurateurs;Exportateurs;Transporteurs;Consommateurs;Total inscriptions\n";

		users.forEach(user => {
			// Formater Date
			const date = new Date(user.createdAt || new Date());
			const day = String(date.getDate()).padStart(2, "0");
			const month = String(date.getMonth() + 1).padStart(2, "0");
			const year = date.getFullYear();
			const formattedDate = `${day}/${month}/${year}`;

			// Déterminer le nom de l'utilisateur à placer sous la bonne colonne
			const name = getUserDisplayName(user);
			
			let producteurs = "";
			let transformateurs = "";
			let restaurateurs = "";
			let exportateurs = "";
			let transporteurs = "";
			let consommateurs = "";

			const type = user.userType;
			if (type === "producer") {
				producteurs = name;
			} else if (type === "transformer") {
				transformateurs = name;
			} else if (type === "restaurateur") {
				restaurateurs = name;
			} else if (type === "exporter") {
				exportateurs = name;
			} else if (type === "transporter") {
				transporteurs = name;
			} else if (type === "consumer") {
				consommateurs = name;
			}

			// Le commercial
			const commercial = user.referredBy || "";

			// Total
			const total = 1;

			csvContent += `${formattedDate};${commercial};${producteurs};${transformateurs};${restaurateurs};${exportateurs};${transporteurs};${consommateurs};${total}\n`;
		});

		const outputPath = path.join(__dirname, "../../historic_registrations_by_role.csv");
		fs.writeFileSync(outputPath, csvContent, "utf8");
		
		console.log(`\n🎉 Exportation réussie !`);
		console.log(`📁 Fichier enregistré sous : ${outputPath}`);
		console.log(`\nAperçu des données exportées (10 premières lignes) :`);
		console.table(users.slice(0, 10).map(user => {
			const date = new Date(user.createdAt || new Date());
			const formattedDate = `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
			const name = getUserDisplayName(user);
			return {
				"Date inscription": formattedDate,
				"Commercial": user.referredBy || "",
				"Producteurs": user.userType === "producer" ? name : "",
				"Transformateurs": user.userType === "transformer" ? name : "",
				"Restaurateurs": user.userType === "restaurateur" ? name : "",
				"Exportateurs": user.userType === "exporter" ? name : "",
				"Transporteurs": user.userType === "transporter" ? name : "",
				"Consommateurs": user.userType === "consumer" ? name : "",
				"Total inscriptions": 1
			};
		}));

	} catch (error) {
		console.error("❌ Une erreur est survenue pendant l'export :", error);
	} finally {
		await mongoose.disconnect();
		console.log("🔌 Déconnecté de MongoDB");
	}
}

exportData();
