const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const Notification = require("../models/Notification");
const User = require("../models/User");

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, "../.env") });

const connectDB = async () => {
	try {
		await mongoose.connect(process.env.DATABASE_LOCAL || process.env.DATABASE, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log("✅ Connecté à MongoDB");
	} catch (err) {
		console.error("❌ Erreur MongoDB:", err);
		process.exit(1);
	}
};

const testPush = async () => {
	await connectDB();

	try {
		// 1. Trouver un utilisateur avec une souscription push
		console.log("🔍 Recherche d'utilisateurs avec souscription push...");
		const user = await User.findOne({
			"webPushSubscriptions.0": { $exists: true },
		}).select("+webPushSubscriptions +preferences");

		if (!user) {
			console.log("❌ Aucun utilisateur avec souscription push trouvé.");
			console.log(
				"   -> Connectez-vous sur le frontend et acceptez les notifications."
			);
			process.exit(0);
		}

		console.log(
			`👤 Utilisateur trouvé: ${user.firstName} ${user.lastName} (${user.email})`
		);
		console.log(
			`📱 Nombre de souscriptions: ${user.webPushSubscriptions.length}`
		);
		console.log(
			`⚙️ Préférences Push: ${user.preferences?.notifications?.push}`
		);

		// 2. Créer une notification de test
		console.log("📤 Envoi de la notification de test...");

		// Simuler l'objet notification (pour utiliser sendViaPush directement)
		// On crée temporairement une instance sans la sauvegarder pour tester la méthode
		const notification = new Notification({
			recipient: user._id,
			recipientModel: "User",
			type: "custom",
			category: "system",
			title: "Test Push via Script",
			message: "Si vous voyez ceci, le push fonctionne ! 🎉",
			channels: {
				push: { enabled: true },
			},
		});

		// Appeler la méthode sendViaPush
		const result = await notification.sendViaPush();

		if (result) {
			console.log(
				"✅ Notification Push envoyée avec succès (selon le backend) !"
			);
		} else {
			console.log(
				"❌ Échec de l'envoi (retour false). Vérifiez les logs backend."
			);
			console.log("Raison:", notification.channels.push.failureReason);
		}
	} catch (error) {
		console.error("❌ Erreur fatale:", error);
	} finally {
		await mongoose.disconnect();
		process.exit(0);
	}
};

testPush();
