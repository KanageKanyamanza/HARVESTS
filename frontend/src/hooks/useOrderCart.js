import { useState, useCallback } from 'react';

/**
 * Hook personnalisé pour gérer le panier de commande
 */
export const useOrderCart = () => {
  const [cart, setCart] = useState([]);

  const formatProductForCart = useCallback((product, selectedSupplier) => {
    const nameText = product.name || 'Produit';
    const descriptionText = product.description || '';

    return {
      _id: product._id || product.id,
      name: nameText,
      description: descriptionText,
      price: product.price?.value ?? product.price ?? 0,
      images: product.images || [],
      image: product.images?.[0]?.url || product.image || product.coverImage || '',
      relatedProductId: product.productId || product._id || product.id,
      supplier: {
        id: selectedSupplier?._id,
        name: selectedSupplier?.companyName || 
              selectedSupplier?.profile?.displayName || 
              `${selectedSupplier?.firstName || ''} ${selectedSupplier?.lastName || ''}`.trim() || 
              'Fournisseur'
      }
    };
  }, []);

  const addToCart = useCallback((product, selectedSupplier) => {
    const formattedProduct = formatProductForCart(product, selectedSupplier);

    // Ajouter aussi dans le CartContext global seulement si relié à un vrai produit catalogue
    if (
      typeof window !== 'undefined' &&
      formattedProduct.relatedProductId &&
      formattedProduct.relatedProductId !== formattedProduct._id
    ) {
      const event = new CustomEvent('cart:add-item', { detail: formattedProduct });
      window.dispatchEvent(event);
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product._id === formattedProduct._id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product._id === formattedProduct._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { product: formattedProduct, quantity: 1 }];
      }
    });
  }, [formatProductForCart]);

  const removeFromCart = useCallback((productId) => {
    setCart(prevCart => prevCart.filter(item => item.product._id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prevCart => prevCart.map(item =>
        item.product._id === productId
          ? { ...item, quantity }
          : item
      ));
    }
  }, [removeFromCart]);

  const calculateTotal = useCallback(() => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }, [cart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    calculateTotal,
    clearCart
  };
};

