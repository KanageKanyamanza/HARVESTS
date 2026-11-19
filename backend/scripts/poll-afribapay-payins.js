// Vérification /status AfriBaPay (Jour 78) — un cycle de réconciliation, en
// dehors du serveur. Usage au cron (levé de cause pour commandes en attente
// quand le webhook n'est pas arrivé) ou après un déploiement :
//
//     node scripts/poll-afribapay-payins.js
//
// alternative au worker embarqué de server.js (AFRIBAPAY_POLLER_DISABLED=true
// en multi-instances) : un seul worker doit interroger /status. Utilise les
// mêmes garde-fous que le serveur : backoff par paiement, claim d'idempotence
// WebhookEvent (clé poll:<paymentId>:<bucket>), annulation give-up 24h.
require("dotenv").config();

const mongoose = require("mongoose");

// Même résolution de base de données que server.js (production → local).
let DB;
if (process.env.DATABASE) {
	DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);
} else if (process.env.DATABASE_URL) {
	DB = process.env.DATABASE_URL;
} else if (process.env.DATABASE_PROD) {
	DB = process.env.DATABASE_PROD;
} else if (process.env.DATABASE_LOCAL) {
	DB = process.env.DATABASE_LOCAL;
} else {
	DB = "mongodb://localhost:27017/harvests";
}

const { runPollCycle } = require("../services/payment/paymentAfribapayStatusService");

const main = async () => {
	await mongoose.connect(DB, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		serverSelectionTimeoutMS: 5000,
		family: 4, // IPv4 : mêmes contraintes que l'API AfriBaPay
	});
	console.log("✅ Connexion à la base de données réussie — cycle /status AfriBaPay...");
	try {
		await runPollCycle();
	} finally {
		await mongoose.connection.close();
		console.log("🔒 Connexion MongoDB fermée.");
	}
};

main()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error("❌ Échec du cycle /status AfriBaPay:", err.message);
		process.exit(1);
	});
