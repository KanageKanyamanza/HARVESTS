import { apiRequest } from "./api";

// Service pour les producteurs
export const producerService = {
	// Profile
	getProfile: () => apiRequest.get("/producers/me/profile"),
	updateProfile: (data) => apiRequest.patch("/producers/me/profile", data),

	// Certifications
	getCertifications: () => apiRequest.get("/producers/me/certifications"),
	addCertification: (data) =>
		apiRequest.post("/producers/me/certifications", data),
	updateCertification: (id, data) =>
		apiRequest.patch(`/producers/me/certifications/${id}`, data),
	removeCertification: (id) =>
		apiRequest.delete(`/producers/me/certifications/${id}`),
	uploadCertificationDocument: (data) =>
		apiRequest.post("/producers/me/certifications/upload", data),

	// Products Management
	getProducts: (params = {}) =>
		apiRequest.get("/producers/me/products", { params }),
	createProduct: (data) => apiRequest.post("/producers/me/products", data),
	getProduct: (id) => apiRequest.get(`/producers/me/products/${id}`),
	updateProduct: (id, data) =>
		apiRequest.patch(`/producers/me/products/${id}`, data),
	deleteProduct: (id) => apiRequest.delete(`/producers/me/products/${id}`),
	uploadProductImages: (data) =>
		apiRequest.post("/producers/me/products/upload-images", data),

	// Orders Management
	getOrders: (params = {}) =>
		apiRequest.get("/producers/me/orders", { params }),
	getOrder: (id) => apiRequest.get(`/producers/me/orders/${id}`),
	updateOrderStatus: (id, data) =>
		apiRequest.patch(`/producers/me/orders/${id}/status`, data),

	// Statistics & Analytics
	getStats: () => apiRequest.get("/producers/me/stats"),
	getSalesAnalytics: () => apiRequest.get("/producers/me/sales-analytics"),
	getRevenueAnalytics: () => apiRequest.get("/producers/me/revenue-analytics"),

	// Preferred Transporters
	getPreferredTransporters: () =>
		apiRequest.get("/producers/me/preferred-transporters"),
	addPreferredTransporter: (data) =>
		apiRequest.post("/producers/me/preferred-transporters", data),
	removePreferredTransporter: (id) =>
		apiRequest.delete(`/producers/me/preferred-transporters/${id}`),

	// Documents
	getDocuments: () => apiRequest.get("/producers/me/documents"),
	addDocument: (data) => apiRequest.post("/producers/me/documents", data),
	uploadDocument: (data) =>
		apiRequest.post("/producers/me/documents/upload", data),

	// Delivery Settings
	getDeliverySettings: () => apiRequest.get("/producers/me/delivery-settings"),
	updateDeliverySettings: (data) =>
		apiRequest.patch("/producers/me/delivery-settings", data),

	// Routes publiques (sans paramètre lang automatique)
	getAllProducers: (params = {}) => {
		return apiRequest.get("/producers", { params });
	},
	getPublicProducer: (id) => {
		return apiRequest.get(`/producers/${id}`);
	},
	getPublicProducerProducts: (id, params = {}) => {
		return apiRequest.get(`/producers/${id}/products`, { params });
	},
	getPublicProducerReviews: (id, params = {}) => {
		return apiRequest.get(`/producers/${id}/reviews`, { params });
	},
	getReviews: (id, params = {}) => {
		return apiRequest.get(`/producers/${id}/reviews`, { params });
	},
};
