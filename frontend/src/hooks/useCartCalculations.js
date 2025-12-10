import { useMemo } from 'react';

/**
 * Hook pour les calculs du panier
 */
export const useCartCalculations = (items) => {
  const totalItems = useMemo(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const totalPrice = useMemo(() => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [items]);

  const getItemCount = useMemo(() => {
    return (productId, originType = 'product') => {
      const item = items.find(
        item => item.productId === productId && item.originType === originType
      );
      return item ? item.quantity : 0;
    };
  }, [items]);

  const isInCart = useMemo(() => {
    return (productId, originType = 'product') => {
      return items.some(
        item => item.productId === productId && item.originType === originType
      );
    };
  }, [items]);

  return {
    totalItems,
    totalPrice,
    getItemCount,
    isInCart
  };
};

