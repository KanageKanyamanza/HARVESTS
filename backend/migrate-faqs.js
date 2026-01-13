const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Faq = require("./models/Faq");

dotenv.config();

// Données extraites de frontend/src/data/faqData.js
// J'ai recopié les données ici pour éviter de devoir parser le fichier JS frontend qui contient des exports
const faqData = {
	faqs: [
		// Livraison
		{
			id: "livraison-delai",
			category: "livraison",
			keywords: [
				"délai",
				"temps",
				"jours",
				"quand",
				"arriver",
				"combien de temps",
			],
			question: "Quels sont les délais de livraison ?",
			answer:
				"Les délais de livraison varient selon votre zone géographique :\n• Dakar : 24-48h\n• Régions : 2-5 jours\n\nVous recevrez un SMS/email dès que votre commande sera expédiée.",
		},
		{
			id: "livraison-frais",
			category: "livraison",
			keywords: [
				"frais",
				"coût",
				"coute",
				"prix",
				"tarif",
				"gratuit",
				"combien coûte",
				"combien coute",
				"cher",
			],
			question: "Combien coûte la livraison ?",
			answer:
				"Les frais de livraison dépendent de votre localisation et du poids de la commande. Ils sont calculés automatiquement au moment du checkout. La livraison est gratuite pour les commandes supérieures à 50 000 FCFA.",
		},
		{
			id: "livraison-suivi",
			category: "livraison",
			keywords: ["suivre", "suivi", "où", "commande", "statut", "tracking"],
			question: "Comment suivre ma commande ?",
			answer:
				'Pour suivre votre commande :\n1. Connectez-vous à votre compte\n2. Allez dans "Mes commandes"\n3. Cliquez sur la commande concernée\n\nVous pouvez aussi me demander directement "Où est ma commande ?" si vous êtes connecté.',
		},
		// Paiement
		{
			id: "paiement-modes",
			category: "paiement",
			keywords: [
				"payer",
				"paiement",
				"mode",
				"moyen",
				"carte",
				"mobile",
				"money",
				"wave",
				"orange",
			],
			question: "Quels sont les modes de paiement acceptés ?",
			answer:
				"Nous acceptons plusieurs modes de paiement :\n• Mobile Money (Orange Money, Wave, Free Money)\n• Cartes bancaires (Visa, Mastercard)\n• Paiement à la livraison (espèces)\n\nTous les paiements sont sécurisés.",
		},
		{
			id: "paiement-securite",
			category: "paiement",
			keywords: ["sécurisé", "sécurité", "confiance", "fiable", "arnaque"],
			question: "Le paiement est-il sécurisé ?",
			answer:
				"Oui, tous nos paiements sont 100% sécurisés. Nous utilisons des protocoles de chiffrement SSL et travaillons avec des partenaires de paiement certifiés. Vos données bancaires ne sont jamais stockées sur nos serveurs.",
		},
		// Commandes
		{
			id: "commande-annuler",
			category: "commande",
			keywords: ["annuler", "annulation", "supprimer", "commande"],
			question: "Comment annuler ma commande ?",
			answer:
				'Vous pouvez annuler votre commande tant qu\'elle n\'est pas encore en préparation :\n1. Allez dans "Mes commandes"\n2. Sélectionnez la commande\n3. Cliquez sur "Annuler"\n\nSi la commande est déjà en préparation, contactez-nous rapidement.',
		},
		// Compte
		{
			id: "compte-creer",
			category: "compte",
			keywords: ["créer", "compte", "inscription", "inscrire", "enregistrer"],
			question: "Comment créer un compte ?",
			answer:
				"Pour créer un compte :\n1. Cliquez sur \"S'inscrire\" en haut de la page\n2. Choisissez votre type de compte (Consommateur, Producteur, etc.)\n3. Remplissez vos informations\n4. Validez votre email\n\nC'est gratuit et rapide !",
		},
		// Produits
		{
			id: "produits-qualite",
			category: "produits",
			keywords: ["qualité", "frais", "bio", "naturel", "origine"],
			question: "Comment garantissez-vous la qualité des produits ?",
			answer:
				"Nous travaillons directement avec des producteurs locaux vérifiés. Chaque vendeur est validé avant de pouvoir vendre. Les produits sont contrôlés et les avis clients nous permettent de maintenir un haut niveau de qualité.",
		},
		// ... Ajouter d'autres FAQs critiques si nécessaire, mais ceci est un bon début pour le test
	],
};

const migrateFaqs = async () => {
	try {
		// Détermination de l'URL de connexion comme dans server.js
		let DB;
		if (process.env.DATABASE) {
			DB = process.env.DATABASE.replace(
				"<PASSWORD>",
				process.env.DATABASE_PASSWORD
			);
		} else if (process.env.DATABASE_URL) {
			DB = process.env.DATABASE_URL;
		} else if (process.env.DATABASE_LOCAL) {
			DB = process.env.DATABASE_LOCAL;
		} else {
			DB = "mongodb://127.0.0.1:27017/harvests"; // Force IPv4
		}

		console.log(`Connecting to database...`);
		await mongoose.connect(DB, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			family: 4, // Force IPv4
		});
		console.log("Connected to MongoDB");

		// Nettoyer la collection existante pour éviter les doublons lors des tests
		await Faq.deleteMany({});
		console.log("Old FAQs cleared");

		const faqsToInsert = faqData.faqs.map((f) => ({
			question: f.question,
			answer: f.answer,
			category: f.category,
			keywords: f.keywords,
			intent: f.category + "." + f.id.split("-").pop(), // ex: livraison.delai
			isActive: true,
		}));

		await Faq.insertMany(faqsToInsert);
		console.log(`${faqsToInsert.length} FAQs migrated successfully`);

		process.exit(0);
	} catch (error) {
		console.error("Migration failed:", error);
		process.exit(1);
	}
};

migrateFaqs();
