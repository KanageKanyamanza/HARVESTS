import { apiRequest } from './api';

const cartService = {
  // Récupérer le panier de l'utilisateur connecté
  getCart: () => apiRequest.get('/consumers/me/cart'),
  
  // Ajouter un article au panier
  addToCart: (productId, quantity) => 
    apiRequest.post('/consumers/me/cart', { productId, quantity }),
  
  // Mettre à jour la quantité d'un article
  updateQuantity: (productId, quantity) => 
    apiRequest.patch(`/consumers/me/cart/${productId}`, { quantity }),
  
  // Supprimer un article du panier
  removeFromCart: (productId) => 
    apiRequest.delete(`/consumers/me/cart/${productId}`),
  
  // Vider le panier
  clearCart: () => apiRequest.delete('/consumers/me/cart')
  
  // Synchroniser le panier local avec le serveur
  // Désactivé temporairement car la route n'existe pas encore
  // syncCart: (localItems) => 
  //   apiRequest.post('/consumers/me/cart/sync', { items: localItems })
};

export default cartService;
