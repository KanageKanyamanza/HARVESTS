#!/usr/bin/env node

/**
 * Script de démarrage du système d'administration
 * Vérifie la configuration et démarre les services nécessaires
 */

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

console.log("🚀 Démarrage du système d'administration Harvests");
console.log("================================================\n");

// Vérifier si le fichier .env existe
const envPath = path.join(__dirname, "..", ".env");
if (!fs.existsSync(envPath)) {
	console.log("⚠️ Fichier .env non trouvé");
	console.log("📝 Création d'un fichier .env de base...\n");

	const envContent = `# Configuration de l'environnement
NODE_ENV=development
PORT=8000
API_VERSION=1.0.0

# Configuration de la base de données MongoDB
DATABASE_LOCAL=mongodb://localhost:27017/harvests

# Configuration JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7

# Configuration Cloudinary (optionnel)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Configuration email (optionnel)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
`;

	fs.writeFileSync(envPath, envContent);
	console.log("✅ Fichier .env créé avec les configurations de base");
	console.log(
		"⚠️ IMPORTANT: Modifiez les valeurs dans .env avant la production!\n",
	);
}

// Fonction pour vérifier si MongoDB est accessible
const checkMongoDB = async () => {
	return new Promise((resolve) => {
		const mongoose = require("mongoose");
		const mongoURI =
			process.env.DATABASE_LOCAL || "mongodb://localhost:27017/harvests";

		mongoose
			.connect(mongoURI, { serverSelectionTimeoutMS: 5000 })
			.then(() => {
				console.log("✅ Connexion à MongoDB réussie");
				mongoose.connection.close();
				resolve(true);
			})
			.catch((error) => {
				console.log("❌ Impossible de se connecter à MongoDB");
				console.log(
					"💡 Assurez-vous que MongoDB est démarré sur votre système",
				);
				console.log("   Windows: net start MongoDB");
				console.log("   macOS: brew services start mongodb-community");
				console.log("   Linux: sudo systemctl start mongod");
				resolve(false);
			});
	});
};

// Fonction pour vérifier si des administrateurs existent
const checkAdmins = async () => {
	try {
		const mongoose = require("mongoose");
		const Admin = require("../models/Admin");

		const mongoURI =
			process.env.DATABASE_LOCAL || "mongodb://localhost:27017/harvests";
		await mongoose.connect(mongoURI);

		const adminCount = await Admin.countDocuments();

		if (adminCount === 0) {
			console.log("⚠️ Aucun administrateur trouvé dans la base de données");
			console.log(
				'💡 Exécutez "node scripts/quick-admin-setup.js" pour créer le premier admin\n',
			);
			return false;
		} else {
			console.log(
				`✅ ${adminCount} administrateur(s) trouvé(s) dans la base de données`,
			);
			return true;
		}
	} catch (error) {
		console.log(
			"❌ Erreur lors de la vérification des administrateurs:",
			error.message,
		);
		return false;
	} finally {
		await mongoose.connection.close();
	}
};

// Fonction pour démarrer le serveur
const startServer = () => {
	console.log("🚀 Démarrage du serveur backend...\n");

	const serverProcess = spawn("node", ["server.js"], {
		cwd: path.join(__dirname, ".."),
		stdio: "inherit",
		shell: true,
	});

	serverProcess.on("error", (error) => {
		console.error("❌ Erreur lors du démarrage du serveur:", error.message);
	});

	serverProcess.on("close", (code) => {
		console.log(`\n🛑 Serveur arrêté avec le code ${code}`);
	});

	// Gestion de l'arrêt propre
	process.on("SIGINT", () => {
		console.log("\n🛑 Arrêt du serveur...");
		serverProcess.kill("SIGINT");
		process.exit(0);
	});

	process.on("SIGTERM", () => {
		console.log("\n🛑 Arrêt du serveur...");
		serverProcess.kill("SIGTERM");
		process.exit(0);
	});
};

// Fonction principale
const main = async () => {
	try {
		// Charger les variables d'environnement
		require("dotenv").config();

		// Vérifier MongoDB
		const mongoOk = await checkMongoDB();
		if (!mongoOk) {
			console.log("\n❌ Impossible de continuer sans MongoDB");
			process.exit(1);
		}

		// Vérifier les administrateurs
		const adminsOk = await checkAdmins();
		if (!adminsOk) {
			console.log("\n⚠️ Continuez avec la création d'administrateurs...");
		}

		console.log("\n✅ Configuration vérifiée avec succès");
		console.log("🌐 Le serveur sera accessible sur: http://localhost:5000");
		console.log("📚 Documentation API: http://localhost:5000/api-docs");
		console.log("🔧 Interface admin: http://localhost:5000/api/v1/admin");
		console.log("\n💡 Commandes utiles:");
		console.log("   - Créer un admin: node scripts/quick-admin-setup.js");
		console.log("   - Gérer les admins: node scripts/admin-manager.js");
		console.log("   - Arrêter le serveur: Ctrl+C\n");

		// Démarrer le serveur
		startServer();
	} catch (error) {
		console.error("❌ Erreur lors du démarrage:", error.message);
		process.exit(1);
	}
};

// Exécuter le script
main();
