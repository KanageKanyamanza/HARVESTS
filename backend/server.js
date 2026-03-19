const dotenv = require("dotenv");
const mongoose = require("mongoose");

/**
 * Gestion des exceptions non capturées
 * Arrête le serveur en cas d'erreur critique
 */
process.on("uncaughtException", (err) => {
	console.log("UNCAUGHT EXCEPTION! 💥 Arrêt du serveur...");
	console.log(err.name, err.message);
	process.exit(1);
});

// Chargement des variables d'environnement
dotenv.config();

const app = require("./app");

// Détermination de l'URL de connexion MongoDB selon l'environnement
let DB;
if (process.env.DATABASE) {
	// Production avec mot de passe
	DB = process.env.DATABASE.replace(
		"<PASSWORD>",
		process.env.DATABASE_PASSWORD,
	);
} else if (process.env.DATABASE_URL) {
	// Production directe
	DB = process.env.DATABASE_URL;
} else if (process.env.DATABASE_LOCAL) {
	// Développement local
	DB = process.env.DATABASE_LOCAL;
} else {
	// Fallback par défaut
	DB = "mongodb://localhost:27017/harvests";
}

// Connexion à la base de données MongoDB
mongoose
	.connect(DB, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		maxPoolSize: 10,
		serverSelectionTimeoutMS: 5000,
		socketTimeoutMS: 45000,
		family: 4, // Utiliser IPv4, ignorer IPv6
	})
	.then(async () => {
		console.log("✅ Connexion à la base de données réussie!");

		// Vérifier la configuration email (non-bloquant)
		try {
			const hasSendGrid = !!process.env.SENDGRID_API_KEY;
			const hasMailgun =
				!!(process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) ||
				!!(process.env.MAILGUN_SMTP_USER && process.env.MAILGUN_SMTP_PASSWORD);
			const hasGmail = !!(
				process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD
			);
			const hasSMTP = !!(
				process.env.EMAIL_HOST &&
				process.env.EMAIL_USERNAME &&
				process.env.EMAIL_PASSWORD
			);

			const isProduction = process.env.NODE_ENV === "production";

			if (isProduction) {
				if (hasSendGrid) {
					console.log(
						"📧 Configuration email PRODUCTION: SendGrid API ✅ (Recommandé pour Render)",
					);
				} else {
					console.warn("⚠️  Configuration email PRODUCTION manquante!");
					console.warn("   En production, configurez SENDGRID_API_KEY");
					console.warn(
						"   📖 Voir: backend/docs/EMAIL_CONFIGURATION_RENDER.md",
					);
				}
			} else {
				if (hasGmail) {
					console.log(
						"📧 Configuration email DÉVELOPPEMENT: Gmail (Nodemailer) ✅",
					);
				} else if (hasSendGrid) {
					console.log(
						"📧 Configuration email DÉVELOPPEMENT: SendGrid détectée (sera utilisé en production)",
					);
				} else {
					console.warn("⚠️  Configuration email DÉVELOPPEMENT manquante!");
					console.warn(
						"   En développement, configurez GMAIL_USER + GMAIL_APP_PASSWORD",
					);
				}
			}

			if (
				process.env.EMAILJS_SERVICE_ID &&
				process.env.EMAILJS_TEMPLATE_ID &&
				process.env.EMAILJS_PUBLIC_KEY
			) {
				console.log("📧 EmailJS (fallback optionnel) configuré");
			}
		} catch (error) {
			console.warn(
				"⚠️ Erreur lors de la vérification de la configuration email:",
				error.message,
			);
		}

		// Créer automatiquement le premier admin si nécessaire (production et développement)
		const createAdminIfNeeded = async () => {
			try {
				const Admin = require("./models/Admin");
				const adminCount = await Admin.countDocuments();
				if (adminCount === 0) {
					const isProduction = process.env.NODE_ENV === "production";
					let adminData;
					if (isProduction) {
						adminData = {
							firstName: process.env.ADMIN_FIRST_NAME || "Admin",
							lastName: process.env.ADMIN_LAST_NAME || "Harvests",
							email: process.env.ADMIN_EMAIL || "admin@harvests.sn",
							password:
								process.env.ADMIN_PASSWORD || "Admin@Harvests2025!",
							role: "super-admin",
							department: "technical",
							permissions: ["all"],
							isEmailVerified: true,
							isActive: true,
						};
					} else {
						adminData = {
							firstName: "Roll Revhieno",
							lastName: "Haurly",
							email: "contact@harvests.site",
							password: "Admin@harvests123!",
							role: "super-admin",
							department: "technical",
							permissions: ["all"],
							isEmailVerified: true,
							isActive: true,
						};
					}
					await Admin.create(adminData);
					console.log("✅ Premier administrateur créé avec succès!");
				} else {
					console.log(
						`ℹ️ ${adminCount} administrateur(s) existent déjà dans le système`,
					);
				}
			} catch (error) {
				console.log(
					"⚠️ Erreur lors de la vérification/création de l'admin:",
					error.message,
				);
			}
		};

		await createAdminIfNeeded();
	})
	.catch((err) => {
		console.error("❌ Erreur de connexion à la base de données:", err);
		// process.exit(1); // Do not exit, allow server to stay alive for diagnostic/error handling
	});

// Configuration du port d'écoute
const port = process.env.PORT || 8000;

// Démarrage du serveur Express
const server = app.listen(port, () => {
	console.log(`🚀 Serveur Harvests démarré sur le port ${port}`);
	console.log(`🌍 Environnement: ${process.env.NODE_ENV}`);
	console.log(`📅 Démarré le: ${new Date().toLocaleString("fr-FR")}`);
});

server.on("error", (err) => {
	if (err.code === "EADDRINUSE") {
		console.error(
			`❌ Erreur: Le port ${port} est déjà utilisé par un autre processus.`,
		);
		console.error(
			"💡 Essayez de tuer les processus node existants ou changez le port dans le fichier .env",
		);
		process.exit(1);
	} else {
		console.error("❌ Erreur du serveur:", err);
	}
});

// Initialisation de Socket.io
try {
	const initSocket = require("./socket");
	const io = initSocket(server);
	app.set("io", io);
	console.log("🔌 Socket.io initialisé avec succès");
} catch (error) {
	console.error("❌ Erreur lors de l'initialisation de Socket.io:", error);
}

/**
 * Gestion des rejets de promesses non gérées
 * Arrête le serveur gracieusement en cas d'erreur asynchrone non gérée
 */
process.on("unhandledRejection", (err) => {
	console.log("UNHANDLED REJECTION! 💥 Arrêt du serveur...");
	console.log(err.name, err.message);
	server.close(() => {
		process.exit(1);
	});
});

/**
 * Gestion gracieuse de l'arrêt du serveur
 * Permet de fermer proprement les connexions avant l'arrêt
 */
const gracefulShutdown = (signal) => {
	console.log(`👋 ${signal} reçu. Arrêt gracieux du serveur...`);
	server.close(async () => {
		try {
			await mongoose.connection.close();
			console.log("✅ Connexion MongoDB fermée.");
			console.log("💥 Processus terminé!");
			process.exit(0);
		} catch (err) {
			console.error("❌ Erreur lors de la fermeture de MongoDB:", err);
			process.exit(1);
		}
	});

	// Forcer l'arrêt après 10 secondes si server.close() prend trop de temps
	setTimeout(() => {
		console.error(
			"⚠️ Échec de l'arrêt gracieux, forçage de l'arrêt du processus.",
		);
		process.exit(1);
	}, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handler spécifique pour nodemon (principalement sur Linux/Mac, mais utile pour la clarté)
process.once("SIGUSR2", () => {
	console.log("🔄 Redémarrage par nodemon...");
	server.close(async () => {
		await mongoose.connection.close();
		process.kill(process.pid, "SIGUSR2");
	});
});
// Trigger restart for env update
