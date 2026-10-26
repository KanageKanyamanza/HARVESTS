const { NlpManager } = require("node-nlp");
const Faq = require("../../models/Faq");
const chatSearchController = require("./chatSearchController");
const consumersController = require("../consumerController");
const Product = require("../../models/Product");
const {
	isTestViewer,
	testProductsViewerFilter,
} = require("../../utils/testAccounts");
const {
	SUPPORTED_LANGUAGES,
	SEARCH_STOP_WORDS,
	addFaqToManager,
	addSystemIntents,
	addSearchIntents,
	resolveChatLanguage,
} = require("../../utils/chatbotTraining");

let manager = null;
let isTraining = false;

// Initialiser et entraîner le modèle NLP
const trainBot = async () => {
	if (isTraining) return;
	isTraining = true;

	try {
		console.log("🤖 Starting chatbot training...");
		manager = new NlpManager({
			// Jour 66 (bascule bilingue) : le modèle est entraîné dans les deux
			// langues. Le français reste alimenté par les FAQs du back-office,
			// l'anglais par leurs champs traduits (questionEn/answerEn).
			// manager.process() est routé sur la langue de la conversation
			// (Jour 67).
			languages: SUPPORTED_LANGUAGES,
			forceNER: true,
			nlu: { useNoneFeature: true },
		});

		// 1. Charger les FAQs depuis la base de données
		const faqs = await Faq.find({ isActive: true });

		let englishFaqCount = 0;
		faqs.forEach((faq) => {
			if (addFaqToManager(manager, faq)) englishFaqCount += 1;
		});

		console.log(
			`🤖 FAQs : ${faqs.length} française(s), ${englishFaqCount} avec version anglaise`,
		);
		if (englishFaqCount < faqs.length) {
			console.warn(
				`🤖 ${faqs.length - englishFaqCount} FAQ(s) sans version anglaise — lancer scripts/migrateFaqTranslations.js (dry-run puis --execute) pour les traduire.`,
			);
		}

		// 2. Ajouter les intentions système (Salutations, etc.)
		addSystemIntents(manager);

		// 3. Intentions de recherche de produits
		// On entraîne le modèle à reconnaître les demandes de produits
		addSearchIntents(manager);

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
		const language = resolveChatLanguage(req.language);
		const response = await manager.process(language, message);

		let reply = {
			text: "",
			intent: response.intent,
			score: response.score,
			entities: response.entities,
			actions: [], // Actions rapides pour l'UI
			data: {}, // Données supplémentaires (produits, etc.)
		};

		// 2. Gestion des intentions spéciales

		// Si l'intent est explicitement une recherche ou si le score est faible (fallback)
		const isSearchIntent =
			response.intent === "search.product" ||
			response.intent === "None" ||
			response.score < 0.6;

		if (isSearchIntent) {
			// Extraire le terme de recherche
			let query = message;

			// Si NER a trouvé un produit, on l'utilise
			const productEntity = response.entities.find(
				(e) => e.entity === "product",
			);
			if (productEntity) {
				query = productEntity.option;
			} else {
				// Nettoyage basique si pas d'entité : retirer les stop words
				const stopWords = SEARCH_STOP_WORDS[language];
				// Enlever la ponctuation et découper
				const words = message
					.toLowerCase()
					.replace(/[?.!,:;]/g, "")
					.split(/\s+/);
				query = words.filter((w) => !stopWords.includes(w)).join(" ");
			}

			// Si après nettoyage on a un terme de recherche valable
			if (query.trim().length >= 2) {
				console.log(`🔎 Chatbot fallback search query: "${query}"`);

				const { buildFlexibleSearchQuery } = require("../../utils/searchUtils");
				const mongoQuery = buildFlexibleSearchQuery(query, [
					"name",
					"description",
					"tags",
					"category",
					"subcategory",
				]);

				// S'assurer que le produit est actif et approuvé
				mongoQuery.isActive = true;
				mongoQuery.status = "approved";

				// Périmètre sandbox : les comptes de test ne voient que leurs
				// produits, les autres visiteurs ne voient jamais les produits test
				const productTestFilter = await testProductsViewerFilter(isTestViewer(req));
				if (productTestFilter) {
					mongoQuery.$and = mongoQuery.$and || [];
					mongoQuery.$and.push(productTestFilter);
				}

				const productResults = await Product.find(mongoQuery).limit(3);

				console.log(
					`✅ Found ${productResults.length} products for query "${query}"`,
				);

				if (productResults.length > 0) {
					reply.text = req.t("chat.product_results", { query });
					reply.data.products = productResults;
					reply.responseType = "product_search";
					return res.status(200).json({
						status: "success",
						data: reply,
					});
				} else {
					// Log de la recherche manquée
					const UnansweredQuestion = require("../../models/UnansweredQuestion");
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
							{ upsert: true, new: true },
						);
						console.log(`📝 Missed search logged: "${query}"`);
					} catch (err) {
						console.error("Error logging missed search:", err);
					}

					reply.text = req.t("chat.no_results", { query });
					reply.actions = [
						{
							type: "link",
							label: req.t("chat.catalog_link"),
							to: "/products",
						},
					];
					return res.status(200).json({
						status: "success",
						data: reply,
					});
				}
			}
		}

		// 3. Construire la réponse finale (si pas déjà envoyé par le bloc de recherche)
		if (response.answer) {
			reply.text = response.answer;
		} else {
			// Vrai fallback si rien trouvé
			reply.text = req.t("chat.fallback");
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
			message: req.t("chat.processing_error"),
		});
	}
};

// Lancer l'entraînement au démarrage (si non bloquant)
setTimeout(trainBot, 5000);

module.exports = {
	processMessage,
	trainBot,
};
