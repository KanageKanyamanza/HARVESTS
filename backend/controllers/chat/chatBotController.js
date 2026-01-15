const { NlpManager } = require("node-nlp");
const Faq = require("../../models/Faq");
const chatSearchController = require("./chatSearchController");
const consumersController = require("../consumerController");
const Product = require("../../models/Product");

let manager = null;
let isTraining = false;

// Initialiser et entraîner le modèle NLP
const trainBot = async () => {
	if (isTraining) return;
	isTraining = true;

	try {
		console.log("🤖 Starting chatbot training...");
		manager = new NlpManager({
			languages: ["fr"],
			forceNER: true,
			nlu: { useNoneFeature: true },
		});

		// 1. Charger les FAQs depuis la base de données
		const faqs = await Faq.find({ isActive: true });

		faqs.forEach((faq) => {
			const intent = faq.intent || `faq.${faq.category}.${faq._id}`;

			// Ajouter les phrases d'entraînement
			// Utiliser la question elle-même
			manager.addDocument("fr", faq.question, intent);

			// Utiliser les mots-clés pour construire des variations simples
			if (faq.keywords && faq.keywords.length > 0) {
				faq.keywords.forEach((kw) => {
					manager.addDocument("fr", kw, intent);
					manager.addDocument("fr", `Je veux savoir ${kw}`, intent);
					manager.addDocument("fr", `Parle moi de ${kw}`, intent);
				});
			}

			// Ajouter la réponse associée
			manager.addAnswer("fr", intent, faq.answer);
		});

		// 2. Ajouter les intentions système (Salutations, etc.)
		manager.addDocument("fr", "bonjour", "greeting");
		manager.addDocument("fr", "salut", "greeting");
		manager.addDocument("fr", "hello", "greeting");
		manager.addAnswer(
			"fr",
			"greeting",
			"Bonjour ! 👋 Comment puis-je vous aider aujourd'hui ?"
		);

		manager.addDocument("fr", "au revoir", "goodbye");
		manager.addDocument("fr", "bye", "goodbye");
		manager.addAnswer(
			"fr",
			"goodbye",
			"Au revoir ! À bientôt sur Harvests ! 👋"
		);

		// 3. Intentions de recherche de produits
		// On entraîne le modèle à reconnaître les demandes de produits
		const searchPhrases = [
			"je veux",
			"je cherche",
			"avez-vous",
			"trouver",
			"acheter",
			"prix de",
			"combien coute",
			"vendez-vous",
		];

		searchPhrases.forEach((phrase) => {
			manager.addDocument("fr", `${phrase} %product%`, "search.product");
			manager.addDocument("fr", `${phrase} des %product%`, "search.product");
		});

		// Entraînement
		await manager.train();
		manager.save();
		console.log("🤖 Chatbot training complete!");
	} catch (error) {
		console.error("❌ Chatbot training failed:", error);
	} finally {
		isTraining = false;
	}
};

// Traiter un message utilisateur
const processMessage = async (req, res) => {
	try {
		const { message, context = {} } = req.body;

		if (!manager) {
			await trainBot();
		}

		// 1. Analyser le message avec NLP
		const response = await manager.process("fr", message);

		let reply = {
			text: "",
			intent: response.intent,
			score: response.score,
			entities: response.entities,
			actions: [], // Actions rapides pour l'UI
			data: null, // Données supplémentaires (produits, etc.)
		};

		// 2. Gestion des intentions spéciales
		let productResults = null;

		// Si l'intention est explicitement une recherche ou si le score est faible (fallback)
		if (
			response.intent === "search.product" ||
			response.intent === "None" ||
			response.score < 0.7
		) {
			// Extraire le terme de recherche
			let query = message;

			// Si NER a trouvé un produit, on l'utilise
			const productEntity = response.entities.find(
				(e) => e.entity === "product"
			);
			if (productEntity) {
				query = productEntity.option;
			} else {
				// Nettoyage basique si pas d'entité : retirer "je cherche", "je veux", etc.
				// (Simplifié pour ce POC)
				const stopWords = [
					"je",
					"tu",
					"il",
					"elle",
					"nous",
					"vous",
					"ils",
					"elles",
					"veux",
					"voudrais",
					"aimerais",
					"cherche",
					"besoin",
					"de",
					"des",
					"le",
					"la",
					"les",
					"un",
					"une",
					"trouver",
					"acheter",
					"avez",
					"avoir",
					"est-ce",
					"que",
					"avez-vous",
				];
				// Enlever la ponctuation et découper
				const words = message
					.toLowerCase()
					.replace(/[?.!,:;]/g, "")
					.split(" ");
				query = words.filter((w) => !stopWords.includes(w)).join(" ");
			}

			console.log(`🔎 Chatbot fallback search query: "${query}"`);

			productResults = await Product.find({
				$or: [
					{ name: { $regex: query, $options: "i" } },
					{ description: { $regex: query, $options: "i" } },
					{ tags: { $regex: query, $options: "i" } },
				],
				isActive: true,
				status: "approved",
			}).limit(3);

			console.log(
				`✅ Found ${productResults.length} products for query "${query}"`
			);

			// GESTION 0 RÉSULTATS + LOGGING
			if (productResults.length === 0 && query.length > 2) {
				// Importer UnansweredQuestion si nécessaire (devrait être en haut du fichier, mais on le fait ici pour la démo si besoin, mieux vaut l'ajouter en haut)
				const UnansweredQuestion = require("../../models/UnansweredQuestion");

				// Log de la recherche manquée
				try {
					await UnansweredQuestion.findOneAndUpdate(
						{ question: `Recherche produit : ${query}` },
						{
							$inc: { count: 1 },
							$set: {
								lastAskedBy: req.user ? req.user._id : null,
								updatedAt: Date.now(),
								category: "produits",
								status: "pending",
							},
							$setOnInsert: {
								firstAskedBy: req.user ? req.user._id : null,
								createdAt: Date.now(),
							},
						},
						{ upsert: true, new: true }
					);
					console.log(`📝 Missed search logged: "${query}"`);
				} catch (err) {
					console.error("Error logging missed search:", err);
				}

				reply.text = `Désolé, nous n'avons pas de "${query}" pour le moment. 😕\n\nCependant, vous pouvez consulter notre catalogue complet pour voir ce qui est disponible, ou découvrir nos produits similaires !`;
				reply.actions = [
					{
						type: "link",
						label: "Voir tout le catalogue",
						to: "/products",
					},
				];
				return res.status(200).json({
					status: "success",
					data: reply,
				});
			}
		}

		// 3. Construire la réponse finale
		if (reply.text) {
			// Déjà défini par le bloc de recherche ou autre
		} else if (response.answer) {
			reply.text = response.answer;
		} else {
			// Vrai fallback si rien trouvé
			reply.text =
				"Je n'ai pas bien compris. Pouvez-vous reformuler ? Vous pouvez chercher des produits comme 'tomates' ou poser des questions sur la livraison.";
			reply.intent = "None";
		}

		// Gestion spécifique des intentions qui nécessitent des données (ex: mes commandes)
		if (response.intent === "my_orders" && req.user) {
			// Récupérer les commandes via un service
			// reply.data = ...
		}

		res.status(200).json({
			status: "success",
			data: reply,
		});
	} catch (error) {
		console.error("Chat processing error:", error);
		res.status(500).json({
			status: "error",
			message: "Erreur lors du traitement du message",
		});
	}
};

// Lancer l'entraînement au démarrage (si non bloquant)
setTimeout(trainBot, 5000);

module.exports = {
	processMessage,
	trainBot,
};
