/**
 * Comptes de développement, un par rôle vendeur/acheteur (pas d'admin),
 * pour tester les tableaux de bord dans le navigateur. Même principe que
 * producteur.test@harvests.dev et transformateur.test@harvests.dev.
 *
 * Chaque compte est marqué `isTestAccount` : il n'apparaît dans aucune liste
 * ni statistique, n'a pas de boutique publique, ne laisse pas de trace
 * d'audit et ne déclenche ni e-mail ni notification (utils/testAccounts.js).
 *
 * Mot de passe : lu dans DEV_ACCOUNT_PASSWORD (backend/.env, ignoré par git),
 * jamais écrit dans ce fichier ni affiché. Il doit respecter les règles du
 * modèle User (8 caractères min., une majuscule, une minuscule, un chiffre).
 *
 * Idempotent : un compte existant est remis en état (vérifié, approuvé,
 * actif, déverrouillé, mot de passe réinitialisé), jamais dupliqué.
 *
 * SÉCURITÉ : se connecte à la base pointée par DATABASE_URL / DATABASE_PROD
 * (Atlas Prod dans cet environnement). Dry-run par défaut ; --execute pour
 * écrire.
 *
 * Usage :
 *   node scripts/create-dev-accounts.js                (dry-run)
 *   node scripts/create-dev-accounts.js --execute      (crée / met à jour)
 *   node scripts/create-dev-accounts.js --execute consumer exporter
 *                                                      (seulement ces rôles)
 */

const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const Consumer = require("../models/Consumer");
const Restaurateur = require("../models/Restaurateur");
const Transporter = require("../models/Transporter");
const Exporter = require("../models/Exporter");

// Le rôle « explorateur » n'existe pas côté backend (enum User.userType)
const ACCOUNTS = {
	consumer: {
		Model: Consumer,
		email: "consommateur.test@harvests.dev",
		firstName: "Consommateur",
		phone: "+221770000003",
		extra: {},
	},
	restaurateur: {
		Model: Restaurateur,
		email: "restaurateur.test@harvests.dev",
		firstName: "Restaurateur",
		phone: "+221770000004",
		extra: { restaurantName: "Restaurant Test Harvests" },
	},
	transporter: {
		Model: Transporter,
		email: "transporteur.test@harvests.dev",
		firstName: "Transporteur",
		phone: "+221770000005",
		extra: { companyName: "Transport Test Harvests" },
	},
	exporter: {
		Model: Exporter,
		email: "exportateur.test@harvests.dev",
		firstName: "Exportateur",
		phone: "+221770000006",
		extra: { companyName: "Export Test Harvests" },
	},
};

const args = process.argv.slice(2);
const EXECUTE = args.includes("--execute");
const roles = args.filter((a) => !a.startsWith("--"));

// Statut commun : compte prêt à l'emploi et invisible du reste de la plateforme
const READY_STATE = {
	isTestAccount: true,
	isEmailVerified: true,
	isApproved: true,
	isActive: true,
	isProfileComplete: true,
	loginAttempts: 0,
	accountLockedUntil: undefined,
};

async function run() {
	const selected = roles.length ? roles : Object.keys(ACCOUNTS);
	const unknown = selected.filter((r) => !ACCOUNTS[r]);
	if (unknown.length) {
		console.error(`❌ Rôle(s) inconnu(s) : ${unknown.join(", ")} (possibles : ${Object.keys(ACCOUNTS).join(", ")})`);
		process.exit(1);
	}

	const password = process.env.DEV_ACCOUNT_PASSWORD;
	if (EXECUTE && !password) {
		console.error("❌ DEV_ACCOUNT_PASSWORD absent de backend/.env : ajoutez-le puis relancez.");
		process.exit(1);
	}

	const mongoUri = process.env.DATABASE_URL || process.env.DATABASE_PROD || process.env.DATABASE_LOCAL;
	if (!mongoUri) {
		console.error("❌ Aucune variable DATABASE_URL / DATABASE_PROD / DATABASE_LOCAL trouvée dans .env");
		process.exit(1);
	}

	console.log(`Mode : ${EXECUTE ? "EXECUTE (écritures réelles)" : "DRY-RUN (aucune écriture)"}`);
	await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000, family: 4 });

	for (const role of selected) {
		const { Model, email, firstName, phone, extra } = ACCOUNTS[role];
		// Requête ciblée sur l'e-mail : non filtrée par le masquage des comptes de test
		const existing = await Model.findOne({ email }).select("+password");

		if (!EXECUTE) {
			console.log(`• ${role.padEnd(12)} ${email} → ${existing ? "existe (serait remis en état)" : "serait créé"}`);
			continue;
		}

		if (existing) {
			Object.assign(existing, READY_STATE, { password });
			await existing.save();
			console.log(`✅ ${role.padEnd(12)} ${email} remis en état`);
		} else {
			await Model.create({
				firstName,
				lastName: "Test",
				email,
				password,
				phone,
				userType: role,
				country: "Sénégal",
				preferredLanguage: "fr",
				...extra,
				...READY_STATE,
			});
			console.log(`✅ ${role.padEnd(12)} ${email} créé`);
		}
	}

	await mongoose.disconnect();
}

run().catch(async (error) => {
	console.error("❌", error.message);
	await mongoose.disconnect();
	process.exit(1);
});
