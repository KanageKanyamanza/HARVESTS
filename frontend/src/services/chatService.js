import api from './api';

export const chatService = {
  // Récupérer les commandes récentes de l'utilisateur connecté
  getRecentOrders: async () => {
    try {
      const response = await api.get('/orders/my-orders', {
        params: { limit: 3, sort: '-createdAt' }
      });
      return response.data?.data?.orders || response.data?.orders || [];
    } catch (error) {
      console.error('Erreur chatService.getRecentOrders:', error);
      return [];
    }
  },

  // Rechercher des produits
  searchProducts: async (query) => {
    try {
      // Essayer d'abord avec l'endpoint de recherche principal
      const response = await api.get('/products', {
        params: { 
          search: query, 
          limit: 5
        }
      });
      
      let products = response.data?.data?.products || response.data?.products || [];
      
      // Si pas de résultats, essayer avec l'endpoint chat dédié
      if (products.length === 0) {
        const chatResponse = await api.get('/chat/search-products', {
          params: { query, limit: 5 }
        });
        products = chatResponse.data?.data?.products || [];
      }
      
      return products;
    } catch (error) {
      console.error('Erreur chatService.searchProducts:', error);
      // Fallback sur l'endpoint chat
      try {
        const chatResponse = await api.get('/chat/search-products', {
          params: { query, limit: 5 }
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
      console.error('Erreur chatService.getOrderStatus:', error);
      return null;
    }
  }
};

export default chatService;

