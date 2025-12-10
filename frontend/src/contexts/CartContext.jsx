import React, { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { cartReducer, initialCartState, CART_ACTIONS } from '../utils/cartReducer';
import { buildCartItem } from '../utils/cartItemBuilder';
import { useCartActions } from '../hooks/useCartActions';
import { useCartCalculations } from '../hooks/useCartCalculations';
import { useCartSync } from '../hooks/useCartSync';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);
  const [isInitialized, setIsInitialized] = useState(false);
  const { isAuthenticated, user } = useAuth();

  // Hooks personnalisés
  const { addToCart, removeFromCart, updateQuantity, clearCart } = useCartActions(
    dispatch,
    state,
    buildCartItem
  );
  
  const { totalItems, totalPrice, getItemCount, isInCart } = useCartCalculations(state.items);

  // Synchronisation avec localStorage et serveur
  useCartSync(
    state,
    dispatch,
    isInitialized,
    setIsInitialized,
    isAuthenticated,
    user
  );

  // Gérer les événements externes (cart:add-item)
  useEffect(() => {
    const handleExternalAdd = (event) => {
      const product = event.detail;
      const cartItem = buildCartItem(product);
      if (cartItem) {
        dispatch({
          type: CART_ACTIONS.ADD_ITEM,
          payload: cartItem,
        });
      }
    };

    window.addEventListener('cart:add-item', handleExternalAdd);

    return () => {
      window.removeEventListener('cart:add-item', handleExternalAdd);
    };
  }, []);

  const value = {
    items: state.items,
    totalItems,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemCount,
    isInCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart doit être utilisé dans un CartProvider');
  }
  return context;
};
