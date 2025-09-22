import { apiRequest } from './api';

// Service pour la gestion des commandes
export const orderService = {
  // Obtenir toutes les commandes
  getOrders: (params = {}) => apiRequest.get('/orders', { params }),
  
  // Obtenir une commande par ID
  getOrder: (id) => apiRequest.get(`/orders/${id}`),
  
  // Créer une commande
  createOrder: (orderData) => apiRequest.post('/orders', orderData),
  
  // Mettre à jour une commande
  updateOrder: (id, orderData) => apiRequest.patch(`/orders/${id}`, orderData),
  
  // Annuler une commande
  cancelOrder: (id, reason) => apiRequest.patch(`/orders/${id}/cancel`, { reason }),
  
  // Confirmer une commande
  confirmOrder: (id) => apiRequest.patch(`/orders/${id}/confirm`),
  
  // Marquer comme expédiée
  shipOrder: (id, trackingData) => apiRequest.patch(`/orders/${id}/ship`, trackingData),
  
  // Marquer comme livrée
  deliverOrder: (id, deliveryData) => apiRequest.patch(`/orders/${id}/deliver`, deliveryData),
  
  // Suivre une commande
  trackOrder: (id) => apiRequest.get(`/orders/${id}/track`),
  
  // Obtenir l'historique des commandes d'un utilisateur
  getUserOrders: (userId, params = {}) => apiRequest.get(`/orders/user/${userId}`, { params }),
  
  // Obtenir les commandes d'un producteur
  getProducerOrders: (producerId, params = {}) => apiRequest.get(`/orders/producer/${producerId}`, { params }),
  
  // Obtenir les commandes par statut
  getOrdersByStatus: (status, params = {}) => apiRequest.get(`/orders/status/${status}`, { params }),
  
  // Obtenir les statistiques des commandes
  getOrderStats: (params = {}) => apiRequest.get('/orders/stats', { params }),
  
  // Obtenir les revenus
  getRevenue: (params = {}) => apiRequest.get('/orders/revenue', { params }),
  
  // Exporter les commandes
  exportOrders: (format = 'csv', params = {}) => apiRequest.get('/orders/export', { 
    params: { ...params, format },
    responseType: 'blob'
  }),
  
  // Obtenir les commandes en attente
  getPendingOrders: (params = {}) => apiRequest.get('/orders/pending', { params }),
  
  // Obtenir les commandes expédiées
  getShippedOrders: (params = {}) => apiRequest.get('/orders/shipped', { params }),
  
  // Obtenir les commandes livrées
  getDeliveredOrders: (params = {}) => apiRequest.get('/orders/delivered', { params }),
  
  // Obtenir les commandes annulées
  getCancelledOrders: (params = {}) => apiRequest.get('/orders/cancelled', { params }),
  
  // Rechercher des commandes
  searchOrders: (query, params = {}) => apiRequest.get('/orders/search', { 
    params: { ...params, q: query } 
  }),
  
  // Obtenir les commandes par période
  getOrdersByPeriod: (startDate, endDate, params = {}) => apiRequest.get('/orders/period', { 
    params: { ...params, startDate, endDate } 
  }),
  
  // Générer une facture
  generateInvoice: (orderId) => apiRequest.get(`/orders/${orderId}/invoice`, {
    responseType: 'blob'
  }),
  
  // Obtenir les retours
  getReturns: (params = {}) => apiRequest.get('/orders/returns', { params }),
  
  // Créer un retour
  createReturn: (orderId, returnData) => apiRequest.post(`/orders/${orderId}/return`, returnData),
  
  // Traiter un retour
  processReturn: (returnId, action, data = {}) => apiRequest.patch(`/orders/returns/${returnId}/process`, { action, ...data })
};
