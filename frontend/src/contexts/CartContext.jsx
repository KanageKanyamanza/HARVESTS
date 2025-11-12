import React, { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import cartService from '../services/cartService';
import { getDishImageUrl } from '../utils/dishImageUtils';
import { toPlainText } from '../utils/textHelpers';

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
      const existingItem = state.items.find(
        (item) =>
          item.productId === action.payload.productId &&
          item.originType === action.payload.originType
      );

      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.productId === action.payload.productId &&
            item.originType === action.payload.originType
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      }

      return {
        ...state,
        items: [...state.items, action.payload],
      };

    case CART_ACTIONS.REMOVE_ITEM:
      return {
        ...state,
        items: state.items.filter(
          (item) =>
            !(
              item.productId === action.payload.productId &&
              item.originType === action.payload.originType
            )
        ),
      };

    case CART_ACTIONS.UPDATE_QUANTITY:
      return {
        ...state,
        items: state.items
          .map((item) =>
            item.productId === action.payload.productId &&
            item.originType === action.payload.originType
              ? { ...item, quantity: action.payload.quantity }
              : item
          )
          .filter((item) => item.quantity > 0),
      };

    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        items: []
      };

    case CART_ACTIONS.LOAD_CART: {
      const rawItems = action.payload.items || action.payload || [];
      return {
        ...state,
        items: rawItems.map(item => {
          const originType = item.originType || 'product';
          const supplier = item.producer || {};
          const supplierId =
            supplier._id ||
            supplier.id ||
            item.producerId ||
            item.supplierId ||
            item.vendorId ||
            item.restaurateurId ||
            item.transformerId ||
            item.ownerId ||
            item.sellerId ||
            null;
          const supplierName =
            supplier.name ||
            supplier.businessName ||
            supplier.companyName ||
            supplier.restaurantName ||
            item.producerName ||
            item.supplierName ||
            item.vendorName ||
            item.restaurateurName ||
            item.transformerName ||
            item.ownerName ||
            'Fournisseur';
          const supplierType =
            supplier.type ||
            supplier.userType ||
            item.producerType ||
            item.supplierType ||
            item.vendorType ||
            item.categoryOwnerType ||
            (originType === 'dish'
              ? 'restaurateur'
              : originType === 'transformed-product'
              ? 'transformer'
              : originType === 'logistics'
              ? 'transporter'
              : 'producer');

          return {
            ...item,
            originType,
            producer: {
              id: supplierId,
              name: supplierName,
              type: supplierType,
            },
          };
        }),
      };
    }

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

  const buildCartItem = useCallback((product) => {
    if (!product) return null;

    const originType =
      product.originType ||
      product.userType ||
      product.type ||
      (product.restaurateur
        ? 'dish'
        : product.transformer
        ? 'transformed-product'
        : 'product');

    const productId = product._id || product.id;
    const quantity = product.quantity || 1;

    let price = product.price;
    if (typeof price === 'object' && price !== null) {
      price = price.value ?? price.amount ?? Object.values(price)[0];
    }
    price = Number(price) || 0;

    let imageUrl = '';
    if (originType === 'restaurateur' || originType === 'dish' || product.restaurateur) {
      imageUrl = getDishImageUrl(product) || '';
    } else if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const firstImage = product.images[0];
      if (typeof firstImage === 'object' && firstImage !== null) {
        imageUrl =
          firstImage.url ||
          firstImage.secureUrl ||
          firstImage.secure_url ||
          firstImage.src ||
          firstImage.path ||
          '';
      } else if (typeof firstImage === 'string') {
        imageUrl = firstImage;
      }
    } else if (product.primaryImage) {
      if (typeof product.primaryImage === 'object' && product.primaryImage !== null) {
        imageUrl =
          product.primaryImage.url ||
          product.primaryImage.secureUrl ||
          product.primaryImage.secure_url ||
          product.primaryImage.src ||
          product.primaryImage.path ||
          '';
      } else if (typeof product.primaryImage === 'string') {
        imageUrl = product.primaryImage;
      }
    }

    if (!imageUrl) {
      imageUrl = product.image || product.coverImage || product.thumbnail || '';
    }

    const supplierInfo =
      [
        product.producer,
        product.restaurateur,
        product.transformer,
        product.supplier,
        product.vendor,
        product.owner,
        product.farmer,
        product.seller,
        product.provider,
        product.merchant,
        product.source,
      ].find(Boolean) || {};

    const supplierId =
      supplierInfo.companyId ||
      supplierInfo.organizationId ||
      supplierInfo._id ||
      supplierInfo.id ||
      product.companyId ||
      product.organizationId ||
      product.producerId ||
      product.restaurateurId ||
      product.transformerId ||
      product.supplierId ||
      product.vendorId ||
      product.ownerId ||
      product.userId ||
      product.owner?._id ||
      product.sourceId ||
      product.creatorId ||
      product.sellerId ||
      null;

    let supplierName = '';
    if (originType === 'dish' || originType === 'restaurateur') {
      supplierName =
        supplierInfo.restaurantName ||
        product.restaurateur?.restaurantName ||
        product.restaurantName ||
        product.restaurateurName ||
        supplierInfo.brandName ||
        supplierInfo.companyName;
    } else if (originType === 'transformed-product' || originType === 'transformer') {
      supplierName =
        supplierInfo.companyName ||
        supplierInfo.organizationName ||
        supplierInfo.businessName ||
        product.transformer?.companyName ||
        product.companyName ||
        product.businessName ||
        product.transformerName;
    } else {
      supplierName =
        supplierInfo.farmName ||
        supplierInfo.companyName ||
        supplierInfo.businessName ||
        product.producer?.farmName ||
        product.farmName ||
        product.companyName ||
        product.businessName ||
        product.producerName;
    }

    if (!supplierName) {
      supplierName =
        supplierInfo.displayName ||
        supplierInfo.brandName ||
        supplierInfo.organizationName ||
        supplierInfo.businessName ||
        supplierInfo.shopName ||
        supplierInfo.storeName ||
        supplierInfo.tradeName ||
        supplierInfo.commercialName ||
        supplierInfo.legalName ||
        supplierInfo.profile?.restaurantName ||
        supplierInfo.profile?.companyName ||
        supplierInfo.profile?.businessName ||
        supplierInfo.name ||
        product.brandName ||
        product.organizationName ||
        product.businessName ||
        product.shopName ||
        product.storeName ||
        product.tradeName ||
        product.commercialName ||
        product.legalName ||
        product.owner?.businessName ||
        product.owner?.companyName ||
        product.owner?.restaurantName ||
        product.owner?.displayName ||
        product.owner?.name ||
        'Fournisseur';
    }

    const supplierType =
      supplierInfo.userType ||
      supplierInfo.role ||
      supplierInfo.type ||
      product.supplierType ||
      product.vendorType ||
      product.categoryOwnerType ||
      product.ownerType ||
      product.owner?.userType ||
      (originType === 'dish' || originType === 'restaurateur'
        ? 'restaurateur'
        : originType === 'transformed-product' || originType === 'transformer'
        ? 'transformer'
        : originType === 'logistics'
        ? 'transporter'
        : 'producer');

    return {
      productId,
      originType,
      name: toPlainText(product.name, 'Produit'),
      price,
      image: imageUrl,
      quantity,
      producer: {
        id: supplierId,
        name: supplierName,
        type: supplierType,
      },
    };
  }, []);

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
  }, [buildCartItem]);

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
    const cartItem = buildCartItem(product);
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
    
    // Vérifier qu'un fournisseur est bien identifié (sinon laisser la validation plus tard)
    if (!producer?.id) {
      console.warn(
        '[Cart] Fournisseur introuvable pour le produit ajouté',
        productId,
        originType
      );
    }

    dispatch({ type: CART_ACTIONS.ADD_ITEM, payload: cartItem });
  };

  const removeFromCart = (productId, originType = 'product') => {
    dispatch({
      type: CART_ACTIONS.REMOVE_ITEM,
      payload: { productId, originType },
    });
  };

  const updateQuantity = (productId, quantity, originType = 'product') => {
    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { productId, quantity, originType },
    });
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

  const getItemCount = (productId, originType = 'product') => {
    const item = state.items.find(
      item => item.productId === productId && item.originType === originType
    );
    return item ? item.quantity : 0;
  };

  const isInCart = (productId, originType = 'product') => {
    return state.items.some(
      item => item.productId === productId && item.originType === originType
    );
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
