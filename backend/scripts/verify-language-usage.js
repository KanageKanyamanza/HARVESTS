/**
 * Vérification du Jour 73/74 (lancement bilingue), rejouable : démarre une
 * connexion MongoDB réelle et teste de bout en bout :
 *   1. GET /api/v1/language-usage?from=fr&to=en&visitor=<test> → écrit 1 event
 *   2. agrégats admin (appel direct de getLanguageUsage, sans HTTP)
 *   3. GET /api/v1/admin/analytics → protégé (401 attendu sans jeton)
 * Puis supprime les événements de test. À lancer avec le serveur démarré :
 *   node scripts/verify-language-usage.js <baseUrl>
 * Le serveur doit tourner sur le port habituel (npm run dev).
 */
process.env.NODE_ENV = process.env.NODE_ENV || "development";
require("dotenv").config();

const mongoose = require("mongoose");

const baseUrl = process.argv[2] || "http://localhost:3000";
const DB =
	process.env.NODE_ENV === "production"
		? process.env.DATABASE_PROD
		: process.env.DATABASE_URL
		? process.env.DATABASE_URL.replace(
				"DATABASE_PASSWORD",
				process.env.DATABASE_PASSWORD,
		  )
		: process.env.DATABASE;

const LanguageSwitch = require("../models/LanguageSwitch");

(async () => {
	await mongoose.connect(DB, { serverSelectionTimeoutMS: 10000 });
	console.log("OK : connexion MongoDB établie");

	const visitor = `tmp-test-j73-${Date.now()}`;

	// 1. Relever une bascule comme le ferait le navigateur
	const recordRes = await fetch(
		`${baseUrl}/api/v1/language-usage?from=fr&to=en&context=test&path=/verify&visitor=${visitor}`,
	);
	console.log("POST-like GET record :", recordRes.status, await recordRes.json());

	const bogus = await fetch(
		`${baseUrl}/api/v1/language-usage?from=fr&to=fr&visitor=${visitor}`,
	);
	console.log("Rejet d'une non-bascule :", bogus.status);

	const saved = await LanguageSwitch.find({ visitorId: visitor });
	console.log("Événements écrits en base :", saved.length, JSON.stringify(saved));

	// 2. Agrégation admin : insertions de test, puis getLanguageUsage
	// (appel direct du contrôleur — la route admin exige une authentification
	// déjà couverte par les tests admin existants, ici on vérifie l'agrégat).
	await LanguageSwitch.create([
		{ from: "fr", to: "en", context: "header", path: "/verify", visitorId: visitor },
		{ from: "en", to: "fr", context: "header", path: "/verify", visitorId: visitor },
		{ from: "fr", to: "en", context: "footer", path: "/pricing", visitorId: `${visitor}-2` },
	]);

	const adminAnalyticsController = require("../controllers/admin/adminAnalyticsController");
	const stats = await adminAnalyticsController.getLanguageUsage(
		new Date(Date.now() - 24 * 60 * 60 * 1000),
	);
	console.log("Agrégat languageUsage :", JSON.stringify(stats.overview));
	console.log("Par contexte :", JSON.stringify(stats.byContext));

	// 3. Admin analytics ne doit pas avoir perdu sa forme JSON
	const analyticsRes = await fetch(`${baseUrl}/api/v1/admin/analytics`);
	console.log(
		"GET /admin/analytics (sans jeton, attendu 401) :",
		analyticsRes.status,
	);

	// 4. Nettoyage
	const deleted = await LanguageSwitch.deleteMany({
		visitorId: { $regex: `^${visitor}` },
	});
	console.log("Nettoyage des données de test :", deleted.deletedCount);

	await mongoose.disconnect();
	console.log("FIN DE VÉRIFICATION");
})().catch((error) => {
	console.error("ÉCHEC :", error.message);
	process.exit(1);
});
