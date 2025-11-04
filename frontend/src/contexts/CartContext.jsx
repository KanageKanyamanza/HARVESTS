import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import cartService from '../services/cartService';
import { getDishImageUrl } from '../utils/dishImageUtils';

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

  useEffect(() => {
    const handleExternalAdd = (event) => {
      const product = event.detail;
      if (product) {
        // Extraire l'image correctement pour les plats
        let imageUrl = '';
        if (product.originType === 'dish' || product.restaurateur) {
          imageUrl = getDishImageUrl(product) || '';
        } else {
          imageUrl = product.image || '';
        }
        
        dispatch({
          type: CART_ACTIONS.ADD_ITEM,
          payload: {
            productId: product._id || product.id,
            name: product.name,
            price: product.price,
            image: imageUrl,
            quantity: product.quantity || 1,
            producer: product.producer || {}
          }
        });
      }
    };

    window.addEventListener('cart:add-item', handleExternalAdd);

    return () => {
      window.removeEventListener('cart:add-item', handleExternalAdd);
    };
  }, []);

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
    // Vérifier le stock pour les plats
    if (product.trackQuantity !== false) {
      const stock = product.stock ?? product.inventory?.quantity ?? null;
      if (stock !== null && stock <= 0) {
        alert('Ce produit est en rupture de stock');
        return;
      }
      
      // Vérifier si la quantité demandée est disponible
      const requestedQuantity = product.quantity || 1;
      const existingItem = state.items.find(item => item.productId === (product._id || product.id));
      const currentQuantity = existingItem ? existingItem.quantity : 0;
      const totalQuantity = currentQuantity + requestedQuantity;
      
      if (stock !== null && totalQuantity > stock) {
        alert(`Stock insuffisant. Disponible: ${stock}, déjà dans le panier: ${currentQuantity}`);
        return;
      }
    }
    
    const supplierInfo = product.producer || product.supplier || product.vendor || product.restaurateur || {};
    
    // Extraire l'image de manière exhaustive pour gérer tous les formats
    // Pour les plats (originType === 'dish'), utiliser la fonction utilitaire spécialisée
    let imageUrl = '';
    if (product.originType === 'dish' || product.restaurateur) {
      // Utiliser la fonction utilitaire pour les plats
      imageUrl = getDishImageUrl(product) || '';
    } else {
      // Pour les produits normaux, utiliser la logique standard
      if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        const firstImage = product.images[0];
        if (typeof firstImage === 'object' && firstImage !== null) {
          imageUrl = firstImage.url || firstImage.src || firstImage.path || firstImage.secure_url || '';
        } else if (typeof firstImage === 'string') {
          imageUrl = firstImage;
        }
      }
      
      if (!imageUrl) {
        if (product.primaryImage) {
          if (typeof product.primaryImage === 'object' && product.primaryImage !== null) {
            imageUrl = product.primaryImage.url || product.primaryImage.src || product.primaryImage.secure_url || '';
          } else if (typeof product.primaryImage === 'string') {
            imageUrl = product.primaryImage;
          }
        }
      }
      
      if (!imageUrl) {
        imageUrl = product.image || product.coverImage || product.thumbnail || '';
      }
    }
    
    const cartItem = {
      productId: product._id || product.id,
      name: product.name?.fr || product.name?.en || product.name || 'Produit',
      price: product.price?.value ?? product.price ?? 0,
      image: imageUrl,
      quantity: product.quantity || 1,
      producer: {
        id: supplierInfo._id || supplierInfo.id || product.producerId || product.supplierId,
        name: supplierInfo.businessName || supplierInfo.companyName || supplierInfo.restaurantName || `${supplierInfo.firstName || ''} ${supplierInfo.lastName || ''}`.trim() || product.producerName || product.supplierName || 'Fournisseur'
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
