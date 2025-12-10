import { useEffect } from 'react';
import cartService from '../services/cartService';
import { CART_ACTIONS } from '../utils/cartReducer';

/**
 * Hook pour synchroniser le panier avec localStorage et le serveur
 */
export const useCartSync = (
  state,
  dispatch,
  isInitialized,
  setIsInitialized,
  isAuthenticated,
  user
) => {
  // Charger le panier depuis localStorage au montage
  useEffect(() => {
    const savedCart = localStorage.getItem('harvests_cart');
    
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        dispatch({ type: CART_ACTIONS.LOAD_CART, payload: cartData });
      } catch (error) {
        console.error('❌ Erreur lors du chargement du panier:', error);
        localStorage.removeItem('harvests_cart');
      }
    } else {
      dispatch({ type: CART_ACTIONS.LOAD_CART, payload: { items: [] } });
    }
    setIsInitialized(true);
  }, [dispatch, setIsInitialized]);

  // Sauvegarder le panier dans localStorage à chaque changement
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('harvests_cart', JSON.stringify(state));
    }
  }, [state, isInitialized]);

  // Charger le panier du serveur quand l'utilisateur se connecte
  useEffect(() => {
    const loadServerCart = async () => {
      if (isAuthenticated && isInitialized && user?.userType === 'consumer') {
        try {
          const response = await cartService.getCart();
          const serverItems = response.data.data?.items || response.data.items || [];
          
          if (serverItems.length > 0) {
            dispatch({ type: CART_ACTIONS.LOAD_CART, payload: { items: serverItems } });
          }
        } catch (error) {
          console.error('❌ Erreur lors du chargement du panier serveur:', error);
        }
      }
    };

    loadServerCart();
  }, [isAuthenticated, isInitialized, user?.userType, dispatch]);
};

