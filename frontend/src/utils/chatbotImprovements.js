/**
 * AMÉLIORATIONS POUR LE CHATBOT
 *
 * Ce fichier contient des utilitaires pour améliorer la qualité des réponses du chatbot
 */

// 1. SYSTÈME DE SYNONYMES POUR AMÉLIORER LA RECHERCHE
export const productSynonyms = {
	tomate: ["tomates", "tomato", "tomatoes"],
	pomme: ["pommes", "apple", "apples"],
	riz: ["riz blanc", "riz complet", "rice"],
	oignon: ["oignons", "onion", "onions"],
	banane: ["bananes", "banana", "bananas"],
	mangue: ["mangues", "mango", "mangoes"],
	viande: ["viande de bœuf", "viande de porc", "viande de mouton", "meat"],
	poisson: ["poissons", "fish", "tilapia", "thiof"],
	légume: ["légumes", "vegetable", "vegetables"],
	fruit: ["fruits", "fruit"],
	poulet: ["poulet", "poulets", "chicken", "volaille", "volailles"],
	oeuf: ["oeuf", "oeufs", "egg", "eggs"],
	lait: ["lait", "milk", "laitier"],
	patate: ["patate", "patates", "pomme de terre", "potato", "potatoes"],
	salade: ["salade", "laitue", "salad"],
};

// 2. AMÉLIORATION DE L'EXTRACTION DE MOTS-CLÉS
export const extractKeywords = (message) => {
	const normalized = message
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "") // Enlever les accents
		.replace(/[^\w\s]/g, " "); // Enlever la ponctuation

	const stopWords = new Set([
		"vous",
		"je",
		"j",
		"ai",
		"tu",
		"as",
		"on",
		"nous",
		"ils",
		"elles",
		"est-ce",
		"que",
		"avez",
		"aves",
		"ave",
		"avez-vous",
		"aves-vous",
		"as-tu",
		"vendez",
		"proposez",
		"vends",
		"proposes",
		"cherche",
		"chercher",
		"cherches",
		"trouver",
		"veux",
		"veut",
		"voulez",
		"voudrais",
		"voudrait",
		"besoin",
		"besoins",
		"acheter",
		"achete",
		"pour",
		"du",
		"de",
		"la",
		"le",
		"les",
		"des",
		"un",
		"une",
		"d",
		"l",
		"dans",
		"sur",
		"avec",
		"sans",
		"par",
		"vers",
		"chez",
		"à",
		"au",
		"aux",
		"en",
		"et",
		"ou",
		"comment",
		"combien",
		"où",
		"quand",
		"quoi",
		"qui",
		"pourquoi",
		"quel",
		"quelle",
		"quels",
		"quelles",
		// Mots sociaux
		"merci",
		"bonjour",
		"salut",
		"hello",
		"bonsoir",
		"coucou",
		"revoir",
		"bye",
		"adieu",
		"merci-beaucoup",
		"oui",
		"non",
		"ok",
		"super",
		"cool",
		"d'accord",
		"daccord",
		"bravo",
		"lol",
		"mdr",
		"haha",
		// Verbes communs
		"vouloir",
		"aimerais",
		"souhaite",
		"souhaiterai",
		"pouvez",
		"peux",
		"peut",
		"donne",
		"donnez",
		"montre",
		"montrez",
		"affiche",
		"affichez",
	]);

	// Nettoyer et extraire les mots significatifs (min 2 caractères pour ri/ail/bio)
	const words = normalized
		.split(/\s+/)
		.map((w) => w.trim())
		.filter((w) => w.length >= 2 && !stopWords.has(w));

	// Filtrage supplémentaire (doublons avec stopWords mais plus strict pour la recherche)
	const finalKeywords = words.filter(
		(w) =>
			![
				"avez",
				"aves",
				"ave",
				"avez-vous",
				"aves-vous",
				"veux",
				"des",
				"les",
				"une",
				"est",
				"est-ce",
				"sont",
				"pour",
			].includes(w)
	);

	return [...new Set(finalKeywords)];
};

// 3. AMÉLIORATION DE LA DÉTECTION D'INTENTIONS AVEC SCORING
export const detectIntentWithScore = (message, intents) => {
	const normalized = message
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^\w\s]/g, " ");

	let bestMatch = null;
	let bestScore = 0;

	for (const intent of intents) {
		let score = 0;
		const keywords = intent.keywords || [];

		// Score basé sur le nombre de mots-clés trouvés
		for (const keyword of keywords) {
			const normalizedKeyword = keyword
				.toLowerCase()
				.normalize("NFD")
				.replace(/[\u0300-\u036f]/g, "");

			if (normalized.includes(normalizedKeyword)) {
				// Score plus élevé si le mot-clé est au début du message
				const position = normalized.indexOf(normalizedKeyword);
				const positionScore = position < 10 ? 2 : 1;
				score += positionScore;
			}
		}

		// Bonus si plusieurs mots-clés sont trouvés
		if (score > 0) {
			const matchedKeywords = keywords.filter((k) =>
				normalized.includes(
					k
						.toLowerCase()
						.normalize("NFD")
						.replace(/[\u0300-\u036f]/g, "")
				)
			);
			if (matchedKeywords.length > 1) {
				score += matchedKeywords.length * 0.5;
			}
		}

		if (score > bestScore) {
			bestScore = score;
			bestMatch = { intent, score };
		}
	}

	// Seuil de confiance minimum
	return bestScore >= 1 ? bestMatch : null;
};

// 4. AMÉLIORATION DES RÉPONSES AVEC CONTEXTE
export const enhanceResponse = (response, context = {}) => {
	let enhanced = response;

	// Personnaliser avec le prénom
	if (context.firstName) {
		enhanced = enhanced.replace(/Bonjour/g, `Bonjour ${context.firstName}`);
	}

	// Ajouter des suggestions basées sur le contexte
	if (context.previousSearch) {
		enhanced += `\n\n💡 Astuce : Vous cherchiez "${context.previousSearch}". Voulez-vous voir des produits similaires ?`;
	}

	// Ajouter des liens contextuels
	if (context.cartItems && context.cartItems.length > 0) {
		enhanced += `\n\n🛒 Vous avez ${context.cartItems.length} article(s) dans votre panier.`;
	}

	return enhanced;
};

// 5. AMÉLIORATION DE LA RECHERCHE AVEC VARIATIONS
export const generateSearchVariations = (term) => {
	const variations = new Set([term.toLowerCase().trim()]);

	// Variations avec/sans 's'
	if (term.endsWith("s") && term.length > 3) {
		variations.add(term.slice(0, -1));
	} else if (!term.endsWith("s")) {
		variations.add(term + "s");
	}

	// Variations avec accents
	const withAccents = term.normalize("NFD");
	const withoutAccents = term.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
	if (withAccents !== withoutAccents) {
		variations.add(withAccents.toLowerCase());
		variations.add(withoutAccents.toLowerCase());
	}

	// Ajouter les synonymes pour chaque mot du terme (si c'est une phrase)
	const words = term.toLowerCase().split(/\s+/);
	words.forEach((word) => {
		if (word.length < 3) return;
		for (const [key, synonyms] of Object.entries(productSynonyms)) {
			if (
				key === word ||
				synonyms.includes(word) ||
				(word.length > 3 && key.includes(word)) ||
				(word.length > 3 && word.includes(key))
			) {
				variations.add(key);
				synonyms.forEach((s) => variations.add(s));
			}
		}
	});

	return Array.from(variations);
};

// 6. AMÉLIORATION DE LA COMPRÉHENSION DES QUESTIONS
export const understandQuestion = (message) => {
	const normalized = message
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "");

	// Détecter le type de question avec patterns améliorés
	const questionTypes = {
		how: {
			pattern:
				/comment|comment faire|comment puis|comment peux|comment peut|comment procéder|comment faire pour/,
			examples: ["comment", "comment faire", "comment puis-je"],
		},
		what: {
			pattern: /qu'est-ce|qu'est ce|quoi|quel|quelle|quels|quelles|que|qu'/,
			examples: ["quoi", "quel", "quelle"],
		},
		when: {
			pattern:
				/quand|à quelle heure|combien de temps|délai|délais|temps|quand est|quand sera/,
			examples: ["quand", "à quelle heure", "combien de temps"],
		},
		where: {
			pattern:
				/où|où est|où sont|où puis|où peux|où trouver|où acheter|où se trouve/,
			examples: ["où", "où est", "où trouver"],
		},
		why: {
			pattern: /pourquoi|pour quoi|raison|motif|cause/,
			examples: ["pourquoi", "raison"],
		},
		who: {
			pattern: /qui|qui est|qui sont|qui peut|qui fait/,
			examples: ["qui", "qui est"],
		},
		how_much: {
			pattern:
				/combien|prix|coût|coûte|coute|tarif|montant|cher|gratuit|payant/,
			examples: ["combien", "prix", "coût"],
		},
		yes_no: {
			pattern:
				/est-ce que|est ce que|peut-on|peut on|avez-vous|avez vous|y a-t-il|y a t il|existe|disponible/,
			examples: ["est-ce que", "avez-vous", "y a-t-il"],
		},
	};

	// Détecter le type avec score de confiance
	let bestMatch = null;
	let bestScore = 0;

	for (const [type, config] of Object.entries(questionTypes)) {
		const match = config.pattern.test(normalized);
		if (match) {
			// Calculer un score basé sur la position et la longueur du match
			const matchIndex = normalized.search(config.pattern);
			const score = matchIndex < 10 ? 2 : 1; // Plus de poids si au début

			if (score > bestScore) {
				bestScore = score;
				bestMatch = {
					type,
					message: normalized,
					confidence: score / 2, // Normaliser entre 0 et 1
					position: matchIndex,
				};
			}
		}
	}

	if (bestMatch) {
		return bestMatch;
	}

	return {
		type: "general",
		message: normalized,
		confidence: 0.1,
	};
};

// 7. SUGGESTIONS INTELLIGENTES BASÉES SUR LE CONTEXTE
export const generateContextualSuggestions = (context) => {
	const suggestions = [];

	if (context.recentSearches && context.recentSearches.length > 0) {
		suggestions.push({
			type: "recent_search",
			text: `Rechercher à nouveau "${context.recentSearches[0]}"`,
			action: context.recentSearches[0],
		});
	}

	if (context.cartItems && context.cartItems.length > 0) {
		suggestions.push({
			type: "cart",
			text: "Voir mon panier",
			action: "MY_CART",
		});
	}

	if (context.isAuthenticated) {
		suggestions.push({
			type: "orders",
			text: "Mes commandes",
			action: "MY_ORDERS",
		});
	}

	return suggestions;
};

// 8. AMÉLIORATION DE LA GESTION DES ERREURS
export const handleSearchError = (error, searchTerm) => {
	console.error("Erreur de recherche:", error);

	// Messages d'erreur plus utiles
	if (error.response?.status === 404) {
		return {
			message: `Je n'ai pas trouvé de résultats pour "${searchTerm}".\n\nVoulez-vous :\n• Essayer avec d'autres mots-clés\n• Voir nos catégories de produits\n• Contacter notre support`,
			suggestions: [
				{ text: "Voir toutes les catégories", action: "categories" },
				{ text: "Contacter le support", action: "CONTACT_SUPPORT" },
			],
		};
	}

	if (error.response?.status >= 500) {
		return {
			message:
				"Désolé, un problème technique est survenu. Veuillez réessayer dans quelques instants.",
			suggestions: [
				{ text: "Réessayer", action: "retry" },
				{ text: "Contacter le support", action: "CONTACT_SUPPORT" },
			],
		};
	}

	return {
		message: "Une erreur est survenue. Veuillez réessayer.",
		suggestions: [{ text: "Réessayer", action: "retry" }],
	};
};
