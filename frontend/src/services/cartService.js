import { apiRequest } from './api';

const cartService = {
  // Récupérer le panier de l'utilisateur connecté
  getCart: () => apiRequest.get('/cart'),
  
  // Ajouter un article au panier
  addToCart: (productId, quantity) => 
    apiRequest.post('/cart/items', { productId, quantity }),
  
  // Mettre à jour la quantité d'un article
  updateQuantity: (productId, quantity) => 
    apiRequest.patch(`/cart/items/${productId}`, { quantity }),
  
  // Supprimer un article du panier
  removeFromCart: (productId) => 
    apiRequest.delete(`/cart/items/${productId}`),
  
  // Vider le panier
  clearCart: () => apiRequest.delete('/cart'),
  
  // Synchroniser le panier local avec le serveur
  syncCart: (localItems) => 
    apiRequest.post('/cart/sync', { items: localItems })
};

export default cartService;
