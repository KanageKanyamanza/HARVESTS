import api from "./api";

// Service générique pour les différents types d'utilisateurs
const createGenericService = (userType) => ({
	// Statistiques
	getStats: () => api.get(`/${userType}s/me/stats`),
	getSalesAnalytics: () => api.get(`/${userType}s/me/sales-analytics`),
	getRevenueAnalytics: () => api.get(`/${userType}s/me/revenue-analytics`),

	// Produits
	getProducts: (params = {}) =>
		api.get(`/${userType}s/me/products`, { params }),
	getProduct: (id) => api.get(`/${userType}s/me/products/${id}`),
	createProduct: (data) => api.post(`/${userType}s/me/products`, data),
	updateProduct: (id, data) =>
		api.patch(`/${userType}s/me/products/${id}`, data),
	deleteProduct: (id) => api.delete(`/${userType}s/me/products/${id}`),
	submitProductForReview: (id) =>
		api.patch(`/${userType}s/me/products/${id}/submit`),

	// Commandes
	getOrders: (params = {}) => api.get(`/${userType}s/me/orders`, { params }),
	getMyOrders: (params = {}) => api.get(`/${userType}s/me/orders`, { params }), // Alias pour getOrders
	getOrder: (id) => api.get(`/${userType}s/me/orders/${id}`),
	getMyOrder: (id) => api.get(`/${userType}s/me/orders/${id}`), // Alias pour getOrder
	createOrder: (data) => api.post(`/${userType}s/me/orders`, data),
	updateOrder: (id, data) => api.patch(`/${userType}s/me/orders/${id}`, data),
	updateOrderStatus: (id, data) =>
		api.patch(`/${userType}s/me/orders/${id}/status`, data),

	// Profil
	getProfile: () => api.get(`/${userType}s/me`),
	updateProfile: (data) => api.patch(`/${userType}s/me`, data),

	// Paramètres
	getSettings: () => api.get(`/${userType}s/me/settings`),
	updateSettings: (data) => api.patch(`/${userType}s/me/settings`, data),

	// Certifications (pour producteurs et transformateurs)
	getCertifications: () => api.get(`/${userType}s/me/certifications`),
	addCertification: (data) => api.post(`/${userType}s/me/certifications`, data),
	updateCertification: (id, data) =>
		api.patch(`/${userType}s/me/certifications/${id}`, data),
	deleteCertification: (id) =>
		api.delete(`/${userType}s/me/certifications/${id}`),

	// Analytics
	getAnalytics: (params = {}) =>
		api.get(`/${userType}s/me/analytics`, { params }),

	// Livraisons (pour transporteurs)
	getDeliveries: (params = {}) =>
		api.get(`/${userType}s/me/deliveries`, { params }),
	getDelivery: (id) => api.get(`/${userType}s/me/deliveries/${id}`),
	updateDelivery: (id, data) =>
		api.patch(`/${userType}s/me/deliveries/${id}`, data),

	// Fournisseurs (pour restaurateurs)
	getSuppliers: (params = {}) =>
		api.get(`/${userType}s/me/suppliers`, { params }),
	getSupplier: (id) => api.get(`/${userType}s/me/suppliers/${id}`),
	addSupplier: (data) => api.post(`/${userType}s/me/suppliers`, data),
	updateSupplier: (id, data) =>
		api.patch(`/${userType}s/me/suppliers/${id}`, data),
	deleteSupplier: (id) => api.delete(`/${userType}s/me/suppliers/${id}`),

	// Plats (pour restaurateurs)
	getDishes: (params = {}) => api.get(`/${userType}s/me/dishes`, { params }),
	getDish: (id) => api.get(`/${userType}s/me/dishes/${id}`),
	createDish: (data) => api.post(`/${userType}s/me/dishes`, data),
	updateDish: (id, data) => api.patch(`/${userType}s/me/dishes/${id}`, data),
	deleteDish: (id) => api.delete(`/${userType}s/me/dishes/${id}`),

	// Panier (pour consommateurs)
	getCart: (params = {}) => api.get(`/${userType}s/me/cart`, { params }),
	addToCart: (data) => api.post(`/${userType}s/me/cart`, data),
	updateCartItem: (id, data) => api.patch(`/${userType}s/me/cart/${id}`, data),
	removeFromCart: (id) => api.delete(`/${userType}s/me/cart/${id}`),
	clearCart: () => api.delete(`/${userType}s/me/cart`),

	// Favoris (pour consommateurs)
	getFavorites: (params = {}) =>
		api.get(`/${userType}s/me/favorites`, { params }),
	addFavorite: (productId) =>
		api.post(`/${userType}s/me/favorites`, { productId }),
	removeFavorite: (id) => api.delete(`/${userType}s/me/favorites/${id}`),

	// Avis (pour consommateurs)
	getMyReviews: (params = {}) =>
		api.get(`/${userType}s/me/reviews`, { params }),
	createReview: (data) => api.post(`/${userType}s/me/reviews`, data),
	updateReview: (id, data) => api.patch(`/${userType}s/me/reviews/${id}`, data),
	deleteReview: (id) => api.delete(`/${userType}s/me/reviews/${id}`),

	// Analytics de dépenses (pour consommateurs)
	getSpendingAnalytics: () => api.get(`/${userType}s/me/spending-analytics`),

	// Zones de livraison (pour transporteurs)
	getDeliveryZones: () => api.get(`/${userType}s/me/delivery-zones`),
	updateDeliveryZones: (data) =>
		api.patch(`/${userType}s/me/delivery-zones`, data),

	// Notifications
	getNotifications: () => api.get(`/${userType}s/me/notifications`),
	markNotificationsAsRead: (data) =>
		api.patch(`/${userType}s/me/notifications`, data),

	// Routes publiques (sans paramètre lang automatique)
	getAllPublic: (params = {}) => {
		return api.get(`/${userType}s`, { params });
	},
	getPublic: (id) => {
		return api.get(`/${userType}s/${id}`);
	},
	getPublicProducts: (id, params = {}) => {
		// Pour les restaurateurs, utiliser /dishes au lieu de /products
		const endpoint =
			userType === "restaurateur"
				? `/${userType}s/${id}/dishes`
				: `/${userType}s/${id}/products`;
		return api.get(endpoint, { params });
	},
	getPublicReviews: (id, params = {}) => {
		return api.get(`/${userType}s/${id}/reviews`, { params });
	},
});

// Services spécifiques pour chaque type d'utilisateur
export const producerService = {
	...createGenericService("producer"),
	// Override pour le profil (route spécifique)
	getProfile: () => api.get("/producers/me/profile"),
	updateProfile: (data) => api.patch("/producers/me/profile", data),
};
export const consumerService = {
	...createGenericService("consumer"),
	// Override pour le profil (route spécifique)
	getProfile: () => api.get("/consumers/me/profile"),
	updateProfile: (data) => api.patch("/consumers/me/profile", data),
};
export const transformerService = {
	...createGenericService("transformer"),
	// Override pour le profil (route spécifique)
	getMyProfile: () => api.get("/transformers/me/profile"),
	getProfile: () => api.get("/transformers/me/profile"), // Alias
	updateMyProfile: (data) => api.patch("/transformers/me/profile", data),
	updateProfile: (data) => api.patch("/transformers/me/profile", data), // Alias pour compatibilité
	// Alias pour les produits (compatibilité avec MyProducts.jsx)
	getMyProducts: (params = {}) =>
		api.get("/transformers/me/products", { params }),
	// Override pour la mise à jour de statut de commande (endpoint sans suffixe /status)
	updateOrderStatus: (orderId, data) =>
		api.patch(`/transformers/me/orders/${orderId}`, data),
};
export const restaurateurService = {
	...createGenericService("restaurateur"),
	// Override pour le profil (route spécifique)
	getMyProfile: () => api.get("/restaurateurs/me/profile"),
	getProfile: () => api.get("/restaurateurs/me/profile"), // Alias
	updateMyProfile: (data) => api.patch("/restaurateurs/me/profile", data),
	updateProfile: (data) => api.patch("/restaurateurs/me/profile", data), // Alias pour compatibilité
	discoverSuppliers: (params = {}) =>
		api.get("/restaurateurs/suppliers/discover", { params }),
	searchSuppliers: (params = {}) =>
		api.get("/restaurateurs/suppliers/search", { params }),
	getSupplierDetails: (supplierId, params = {}) =>
		api.get(`/restaurateurs/suppliers/${supplierId}`, { params }),
	getDishDetail: (dishId) => api.get(`/restaurateurs/dishes/${dishId}`),
	createOrder: (data) => api.post("/restaurateurs/me/orders", data),
	updateOrder: (orderId, data) =>
		api.patch(`/restaurateurs/me/orders/${orderId}`, data),
	updateOrderStatus: (orderId, data) =>
		api.patch(`/restaurateurs/me/orders/${orderId}/status`, data),
	cancelOrder: (orderId) => api.delete(`/restaurateurs/me/orders/${orderId}`),
};
export const transporterService = {
	...createGenericService("transporter"),
	// Override pour le profil (route spécifique)
	getProfile: () => api.get("/transporters/me/profile"),
	updateProfile: (data) => api.patch("/transporters/me/profile", data),
	// Gestion de la flotte
	getFleet: (params = {}) => api.get("/transporters/me/fleet", { params }),
	addFleetVehicle: (data) => api.post("/transporters/me/fleet", data),
	updateFleetVehicle: (id, data) =>
		api.patch(`/transporters/me/fleet/${id}`, data),
	removeFleetVehicle: (id) => api.delete(`/transporters/me/fleet/${id}`),
	updateVehicleAvailability: (id, data) =>
		api.patch(`/transporters/me/fleet/${id}/availability`, data),
	// Livraisons locales
	getOrders: (params = {}) =>
		api.get("/transporters/me/deliveries", { params }),
	getMyOrders: (params = {}) =>
		api.get("/transporters/me/deliveries", { params }),
	getOrder: (id) => api.get(`/transporters/me/deliveries/${id}`),
	updateOrderStatus: (id, data) =>
		api.patch(`/transporters/me/deliveries/${id}`, data),
	// Désactiver getProducts pour les transporteurs
	getProducts: () =>
		Promise.reject(
			new Error("Les transporteurs n'ont pas de produits, utilisez la flotte")
		),
};
export const exporterService = {
	...createGenericService("exporter"),
	// Override pour le profil (route spécifique)
	getProfile: () => api.get("/exporters/me/profile"),
	updateProfile: (data) => api.patch("/exporters/me/profile", data),
	// Override pour les commandes d'export (route spécifique)
	getOrders: (params = {}) =>
		api.get("/exporters/me/export-orders", { params }),
	getMyOrders: (params = {}) =>
		api.get("/exporters/me/export-orders", { params }),
	getOrder: (id) => api.get(`/exporters/me/export-orders/${id}`),
	getMyOrder: (id) => api.get(`/exporters/me/export-orders/${id}`),
	updateOrderStatus: (id, data) =>
		api.patch(`/exporters/me/export-orders/${id}/status`, data),
	// Les exportateurs n'ont pas de catalogue produit
	getProducts: () =>
		Promise.reject(
			new Error("Les exportateurs n'ont pas de produits, utilisez la flotte")
		),
	getProduct: () =>
		Promise.reject(
			new Error("Les exportateurs n'ont pas de produits, utilisez la flotte")
		),
	createProduct: () =>
		Promise.reject(
			new Error("Les exportateurs n'ont pas de produits, utilisez la flotte")
		),
	updateProduct: () =>
		Promise.reject(
			new Error("Les exportateurs n'ont pas de produits, utilisez la flotte")
		),
	deleteProduct: () =>
		Promise.reject(
			new Error("Les exportateurs n'ont pas de produits, utilisez la flotte")
		),
	submitProductForReview: () =>
		Promise.reject(
			new Error("Les exportateurs n'ont pas de produits, utilisez la flotte")
		),
	// Gestion de la flotte
	getFleet: (params = {}) => api.get("/exporters/me/fleet", { params }),
	addFleetVehicle: (data) => api.post("/exporters/me/fleet", data),
	updateFleetVehicle: (id, data) =>
		api.patch(`/exporters/me/fleet/${id}`, data),
	removeFleetVehicle: (id) => api.delete(`/exporters/me/fleet/${id}`),
	updateVehicleAvailability: (id, data) =>
		api.patch(`/exporters/me/fleet/${id}/availability`, data),
};
export const explorerService = createGenericService("explorer");

// Service pour créer un service personnalisé
export const createService = (userType) => createGenericService(userType);

export default {
	producerService,
	consumerService,
	transformerService,
	restaurateurService,
	transporterService,
	exporterService,
	explorerService,
	createService,
};
