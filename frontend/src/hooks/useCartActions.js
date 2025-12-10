import { useCallback } from 'react';
import { buildCartItem } from '../utils/cartItemBuilder';
import { CART_ACTIONS } from '../utils/cartReducer';

/**
 * Hook pour les actions du panier
 */
export const useCartActions = (dispatch, state, buildCartItemFn = buildCartItem) => {
  const addToCart = useCallback((product) => {
    // Vérifier le stock pour les plats
    const cartItem = buildCartItemFn(product);
    if (!cartItem) return;

    const { productId, originType, quantity: requestedQuantity, producer } = cartItem;

    if (product.trackQuantity !== false) {
      const stock = product.stock ?? product.inventory?.quantity ?? null;
      if (stock !== null && stock <= 0) {
        alert('Ce produit est en rupture de stock');
        return;
      }
      
      // Vérifier si la quantité demandée est disponible
      const existingItem = state.items.find(
        item => item.productId === productId && item.originType === originType
      );
      const currentQuantity = existingItem ? existingItem.quantity : 0;
      const totalQuantity = currentQuantity + requestedQuantity;
      
      if (stock !== null && totalQuantity > stock) {
        alert(`Stock insuffisant. Disponible: ${stock}, déjà dans le panier: ${currentQuantity}`);
        return;
      }
    }
    
    // Vérifier qu'un fournisseur est bien identifié
    if (!producer?.id) {
      const fallbackSupplierId = 
        product.restaurateur?._id || 
        product.restaurateur?.id || 
        product.restaurateurId ||
        product.producer?._id ||
        product.producer?.id ||
        product.producerId ||
        product.transformer?._id ||
        product.transformer?.id ||
        product.transformerId;
      
      if (fallbackSupplierId) {
        cartItem.producer = {
          id: fallbackSupplierId,
          name: producer?.name || 
                product.restaurateur?.restaurantName || 
                product.restaurantName ||
                product.restaurateur?.name ||
                product.restaurateur?.displayName ||
                product.producer?.farmName || 
                'Fournisseur',
          type: producer?.type || (product.restaurateur ? 'restaurateur' : product.transformer ? 'transformer' : 'producer')
        };
      } else {
        console.warn(
          '[Cart] Fournisseur introuvable pour le produit ajouté',
          productId,
          originType,
          'Le produit sera ajouté mais pourrait nécessiter une vérification manuelle'
        );
      }
    }

    dispatch({ type: CART_ACTIONS.ADD_ITEM, payload: cartItem });
  }, [dispatch, state.items, buildCartItemFn]);

  const removeFromCart = useCallback((productId, originType = 'product') => {
    dispatch({
      type: CART_ACTIONS.REMOVE_ITEM,
      payload: { productId, originType },
    });
  }, [dispatch]);

  const updateQuantity = useCallback((productId, quantity, originType = 'product') => {
    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { productId, quantity, originType },
    });
  }, [dispatch]);

  const clearCart = useCallback(() => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  }, [dispatch]);

  return {
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  };
};

