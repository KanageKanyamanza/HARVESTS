import api from "./api";

export const chatService = {
	// Récupérer les commandes récentes de l'utilisateur connecté
	getRecentOrders: async () => {
		try {
			const response = await api.get("/orders/my-orders", {
				params: { limit: 3, sort: "-createdAt" },
			});
			return response.data?.data?.orders || response.data?.orders || [];
		} catch (error) {
			console.error("Erreur chatService.getRecentOrders:", error);
			return [];
		}
	},

	// Rechercher des produits
	searchProducts: async (query) => {
		try {
			// Essayer d'abord avec l'endpoint de recherche principal
			const response = await api.get("/products", {
				params: {
					search: query,
					limit: 5,
				},
			});

			let products =
				response.data?.data?.products || response.data?.products || [];

			// Si pas de résultats, essayer avec l'endpoint chat dédié
			if (products.length === 0) {
				const chatResponse = await api.get("/chat/search-products", {
					params: { query, limit: 5 },
				});
				products = chatResponse.data?.data?.products || [];
			}

			return products;
		} catch (error) {
			console.error("Erreur chatService.searchProducts:", error);
			// Fallback sur l'endpoint chat
			try {
				const chatResponse = await api.get("/chat/search-products", {
					params: { query, limit: 5 },
				});
				return chatResponse.data?.data?.products || [];
			} catch {
				return [];
			}
		}
	},

	// Obtenir le statut d'une commande spécifique
	getOrderStatus: async (orderNumber) => {
		try {
			const response = await api.get(`/orders/track/${orderNumber}`);
			return response.data?.data?.order || response.data?.order || null;
		} catch (error) {
			console.error("Erreur chatService.getOrderStatus:", error);
			return null;
		}
	},

	// Rechercher des vendeurs
	searchSellers: async (query) => {
		try {
			const response = await api.get("/chat/search-sellers", {
				params: { query, limit: 5 },
			});
			return response.data?.data?.sellers || [];
		} catch (error) {
			console.error("Erreur chatService.searchSellers:", error);
			return [];
		}
	},

	// Rechercher des transporteurs
	searchTransporters: async (query) => {
		try {
			const response = await api.get("/chat/search-transporters", {
				params: { query, limit: 5 },
			});
			return response.data?.data?.transporters || [];
		} catch (error) {
			console.error("Erreur chatService.searchTransporters:", error);
			return [];
		}
	},

	// Obtenir les catégories
	getCategories: async () => {
		try {
			const response = await api.get("/chat/categories");
			return response.data?.data?.categories || [];
		} catch (error) {
			console.error("Erreur chatService.getCategories:", error);
			return [];
		}
	},

	// Obtenir les produits en promotion
	getPromotions: async () => {
		try {
			const response = await api.get("/products", {
				params: { hasDiscount: true, limit: 5, sort: "-discount" },
			});
			return response.data?.data?.products || [];
		} catch (error) {
			console.error("Erreur chatService.getPromotions:", error);
			return [];
		}
	},

	// Obtenir les nouveaux produits
	getNewProducts: async () => {
		try {
			const response = await api.get("/products", {
				params: { limit: 5, sort: "-createdAt" },
			});
			return response.data?.data?.products || [];
		} catch (error) {
			console.error("Erreur chatService.getNewProducts:", error);
			return [];
		}
	},

	// Obtenir les produits en vedette
	getFeaturedProducts: async () => {
		try {
			const response = await api.get("/products/featured", {
				params: { limit: 5 },
			});
			return response.data?.data?.products || response.data?.products || [];
		} catch (error) {
			console.error("Erreur chatService.getFeaturedProducts:", error);
			// Fallback: produits récents
			try {
				const fallback = await api.get("/products", {
					params: { limit: 5, sort: "-createdAt" },
				});
				return fallback.data?.data?.products || [];
			} catch {
				return [];
			}
		}
	},

	// Obtenir les suggestions personnalisées (basées sur l'historique)
	getSuggestions: async () => {
		try {
			const response = await api.get("/products/suggestions");
			return response.data?.data?.products || [];
		} catch (error) {
			// Fallback: produits populaires
			try {
				const fallback = await api.get("/products", {
					params: { limit: 5, sort: "-salesCount" },
				});
				return fallback.data?.data?.products || [];
			} catch {
				return [];
			}
		}
	},

	// Obtenir les notifications
	getNotifications: async () => {
		try {
			const response = await api.get("/notifications", {
				params: { limit: 5, unread: true },
			});
			return response.data?.data?.notifications || [];
		} catch (error) {
			console.error("Erreur chatService.getNotifications:", error);
			return [];
		}
	},

	// Obtenir le contenu du panier
	getCart: async () => {
		try {
			const response = await api.get("/cart");
			return response.data?.data?.cart || response.data?.cart || null;
		} catch (error) {
			console.error("Erreur chatService.getCart:", error);
			return null;
		}
	},

	// Vider le panier
	clearCart: async () => {
		try {
			await api.delete("/cart");
			return true;
		} catch (error) {
			console.error("Erreur chatService.clearCart:", error);
			return false;
		}
	},

	// Obtenir les favoris
	getFavorites: async () => {
		try {
			const response = await api.get("/users/favorites");
			return response.data?.data?.favorites || [];
		} catch (error) {
			console.error("Erreur chatService.getFavorites:", error);
			return [];
		}
	},

	// Envoyer un feedback sur une réponse
	sendFeedback: async (interactionId, feedback) => {
		try {
			await api.post("/chat/log-feedback", { interactionId, feedback });
			return true;
		} catch (error) {
			console.error("Erreur chatService.sendFeedback:", error);
			return false;
		}
	},

	// Enregistrer une interaction avec le bot
	logInteraction: async ({
		question,
		response,
		responseType,
		matchedFaqId,
		matchedIntent,
		confidence,
		sessionId,
		responseTime,
	}) => {
		try {
			const res = await api.post("/chat/log-interaction", {
				question,
				response,
				responseType,
				matchedFaqId,
				matchedIntent,
				confidence,
				sessionId,
				responseTime,
			});
			return res.data?.data?.interactionId || null;
		} catch (error) {
			// Ne pas bloquer le chat si le logging échoue
			console.error("Erreur chatService.logInteraction:", error);
			return null;
		}
	},

	// Obtenir les réponses personnalisées (ajoutées par admin)
	getCustomAnswers: async () => {
		try {
			const response = await api.get("/chat/custom-answers");
			return response.data?.data?.answers || [];
		} catch (error) {
			console.error("Erreur chatService.getCustomAnswers:", error);
			return [];
		}
	},

	// Obtenir les statistiques du chatbot (Admin)
	getChatStats: async (timeRange = "30d") => {
		try {
			const response = await api.get("/chat/admin/stats", {
				params: { timeRange },
			});
			return response.data?.data || null;
		} catch (error) {
			console.error("Erreur chatService.getChatStats:", error);
			return null;
		}
	},
};

export default chatService;
