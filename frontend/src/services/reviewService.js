import api from './api';

// Service pour la gestion des avis
export const reviewService = {
  // Obtenir les avis d'un produit
  getProductReviews: async (productId, params = {}) => {
    const response = await api.get(`/reviews/product/${productId}`, { params });
    return response.data;
  },

  // Obtenir les avis en vedette d'un produit
  getFeaturedReviews: async (productId, limit = 3) => {
    const response = await api.get(`/reviews/product/${productId}/featured`, { 
      params: { limit } 
    });
    return response.data;
  },

  // Obtenir les statistiques de notation d'un produit
  getProductRatingStats: async (productId) => {
    const response = await api.get(`/reviews/product/${productId}/stats`);
    return response.data;
  },

  // Créer un avis
  createReview: async (reviewData) => {
    try {
      const response = await api.post('/reviews', reviewData);
      return response.data;
    } catch (error) {
      // Propager l'erreur avec le message du backend
      throw error;
    }
  },

  // Obtenir mes avis (consommateur)
  getMyReviews: async (params = {}) => {
    const response = await api.get('/reviews/my/reviews', { params });
    return response.data;
  },

  // Mettre à jour mon avis
  updateMyReview: async (reviewId, reviewData) => {
    const response = await api.patch(`/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  // Supprimer mon avis
  deleteMyReview: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  // Voter utile sur un avis
  voteHelpful: async (reviewId) => {
    const response = await api.post(`/reviews/${reviewId}/vote/helpful`);
    return response.data;
  },

  // Voter inutile sur un avis
  voteUnhelpful: async (reviewId) => {
    const response = await api.post(`/reviews/${reviewId}/vote/unhelpful`);
    return response.data;
  },

  // Retirer mon vote
  removeVote: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}/vote`);
    return response.data;
  },

  // Obtenir les avis reçus (producteur)
  getReceivedReviews: async (params = {}) => {
    const response = await api.get('/reviews/received', { params });
    return response.data;
  },

  // Répondre à un avis (producteur)
  respondToReview: async (reviewId, responseData) => {
    const response = await api.post(`/reviews/${reviewId}/respond`, responseData);
    return response.data;
  },

  // Signaler un avis
  reportReview: async (reviewId, reason) => {
    const response = await api.post(`/reviews/${reviewId}/report`, { reason });
    return response.data;
  },

  // Obtenir un avis spécifique
  getReviewById: async (reviewId) => {
    const response = await api.get(`/reviews/${reviewId}`);
    return response.data;
  },

  // Obtenir les avis d'un producteur
  getProducerReviews: async (producerId, params = {}) => {
    const response = await api.get(`/reviews/producer/${producerId}`, { params });
    return response.data;
  },

  // Obtenir les statistiques de notation d'un producteur
  getProducerRatingStats: async (producerId) => {
    const response = await api.get(`/reviews/producer/${producerId}/stats`);
    return response.data;
  }
};

export default reviewService;
