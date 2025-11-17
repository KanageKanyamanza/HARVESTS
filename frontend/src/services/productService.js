import { apiRequest } from './api';

// Service pour la gestion des produits
export const productService = {
  // Obtenir tous les produits
  getProducts: (params = {}) => apiRequest.get('/products', { params }),
  
  // Obtenir un produit par ID
  getProduct: (id) => apiRequest.get(`/products/${id}`),
  
  // Rechercher des produits
  searchProducts: (query, params = {}) => apiRequest.get('/products/search', { 
    params: { ...params, q: query } 
  }),
  
  // Obtenir les produits par catégorie
  getProductsByCategory: (category, params = {}) => apiRequest.get(`/products/category/${category}`, { params }),
  
  // Obtenir les produits par producteur
  getProductsByProducer: (producerId, params = {}) => apiRequest.get(`/products/producer/${producerId}`, { params }),
  
  // Obtenir les produits recommandés
  getRecommendedProducts: (userId, params = {}) => apiRequest.get(`/products/recommended/${userId}`, { params }),
  
  // Obtenir les produits basés sur la localisation
  getProductsByLocation: (params = {}) => apiRequest.get('/products/location-based', { params }),
  
  // Obtenir les produits populaires
  getPopularProducts: (params = {}) => apiRequest.get('/products/popular', { params }),
  
  // Obtenir les produits récents
  getRecentProducts: (params = {}) => apiRequest.get('/products/recent', { params }),
  
  // Obtenir les produits en promotion
  getProductsOnSale: (params = {}) => apiRequest.get('/products/sale', { params }),
  
  // Obtenir les produits mis en avant (featured)
  getFeaturedProducts: (params = {}) => apiRequest.get('/products/featured', { params }),
  
  // Obtenir les catégories de produits
  getCategories: () => apiRequest.get('/products/categories'),
  
  // Obtenir les avis d'un produit
  getProductReviews: (productId, params = {}) => apiRequest.get(`/products/${productId}/reviews`, { params }),
  
  // Ajouter un avis à un produit
  addProductReview: (productId, reviewData) => apiRequest.post(`/products/${productId}/reviews`, reviewData),
  
  
  // Marquer un produit comme favori
  addToFavorites: (productId) => apiRequest.post(`/products/${productId}/favorite`),
  
  // Retirer un produit des favoris
  removeFromFavorites: (productId) => apiRequest.delete(`/products/${productId}/favorite`),
  
  // Obtenir les produits favoris
  getFavoriteProducts: (userId) => apiRequest.get(`/products/favorites/${userId}`),
  
  // Comparer des produits
  compareProducts: (productIds) => apiRequest.post('/products/compare', { productIds }),
  
  // Obtenir les produits similaires
  getSimilarProducts: (productId) => apiRequest.get(`/products/${productId}/similar`)
};
