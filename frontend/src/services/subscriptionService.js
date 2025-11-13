import { apiRequest } from './api';

// Service pour la gestion des souscriptions de plans
export const subscriptionService = {
  // Obtenir mes souscriptions
  getMySubscriptions: () => apiRequest.get('/subscriptions/me'),
  
  // Obtenir une souscription par ID
  getSubscription: (id) => apiRequest.get(`/subscriptions/${id}`),
  
  // Créer une souscription
  createSubscription: (data) => apiRequest.post('/subscriptions', data),
  
  // Activer un plan gratuit
  activateFreePlan: (planId) => apiRequest.post('/subscriptions/activate-free', { planId }),
  
  // Mettre à jour une souscription
  updateSubscription: (id, data) => apiRequest.patch(`/subscriptions/${id}`, data),
  
  // Annuler une souscription
  cancelSubscription: (id) => apiRequest.patch(`/subscriptions/${id}/cancel`),
  
  // Renouveler une souscription
  renewSubscription: (id) => apiRequest.post(`/subscriptions/${id}/renew`),
  
  // Obtenir l'historique des paiements d'une souscription
  getSubscriptionPayments: (id) => apiRequest.get(`/subscriptions/${id}/payments`),
};

export default subscriptionService;

