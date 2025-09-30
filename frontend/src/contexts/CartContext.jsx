import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import cartService from '../services/cartService';

const CartContext = createContext();

// Actions du panier
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART'
};

// Reducer pour gérer l'état du panier
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM:
      const existingItem = state.items.find(item => item.productId === action.payload.productId);
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.productId === action.payload.productId
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        };
      } else {
        return {
          ...state,
          items: [...state.items, action.payload]
        };
      }

    case CART_ACTIONS.REMOVE_ITEM:
      return {
        ...state,
        items: state.items.filter(item => item.productId !== action.payload.productId)
      };

    case CART_ACTIONS.UPDATE_QUANTITY:
      return {
        ...state,
        items: state.items.map(item =>
          item.productId === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ).filter(item => item.quantity > 0)
      };

    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        items: []
      };

    case CART_ACTIONS.LOAD_CART:
      const items = action.payload.items || action.payload || [];
      return {
        ...state,
        items: items
      };

    default:
      return state;
  }
};

// État initial du panier
const initialState = {
  items: []
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [isInitialized, setIsInitialized] = useState(false);
  const { isAuthenticated, user } = useAuth();

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
  }, []);

  // Sauvegarder le panier dans localStorage à chaque changement
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('harvests_cart', JSON.stringify(state));
    }
  }, [state, isInitialized]);

  // Synchroniser le panier avec le serveur quand l'utilisateur se connecte
  // Synchroniser le panier local avec le serveur
  // Désactivé temporairement car la route /cart/sync n'existe pas encore
  // useEffect(() => {
  //   const syncCartWithServer = async () => {
  //     if (isAuthenticated && isInitialized && state.items.length > 0) {
  //       try {
  //         await cartService.syncCart(state.items);
  //       } catch (error) {
  //         console.error('❌ Erreur lors de la synchronisation du panier:', error);
  //       }
  //     }
  //   };

  //   syncCartWithServer();
  // }, [isAuthenticated, isInitialized]);

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
  }, [isAuthenticated, isInitialized, user?.userType]);

  // Fonctions du panier
  const addToCart = (product) => {
    const cartItem = {
      productId: product._id,
      name: product.name?.fr || product.name?.en || product.name,
      price: product.price,
      image: product.images?.[0]?.url || product.primaryImage?.url,
      quantity: product.quantity || 1, // Utiliser la quantité du produit ou 1 par défaut
      producer: {
        id: product.producer?._id,
        name: product.producer?.businessName || `${product.producer?.firstName} ${product.producer?.lastName}`
      }
    };

    dispatch({ type: CART_ACTIONS.ADD_ITEM, payload: cartItem });
  };

  const removeFromCart = (productId) => {
    dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: { productId } });
  };

  const updateQuantity = (productId, quantity) => {
    dispatch({ type: CART_ACTIONS.UPDATE_QUANTITY, payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  // Calculer les totaux
  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getItemCount = (productId) => {
    const item = state.items.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  };

  const isInCart = (productId) => {
    return state.items.some(item => item.productId === productId);
  };

  const value = {
    items: state.items,
    totalItems: getTotalItems(),
    totalPrice: getTotalPrice(),
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
