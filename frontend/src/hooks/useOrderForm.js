import { useState, useCallback } from 'react';

/**
 * Hook personnalisé pour gérer le formulaire de commande
 */
export const useOrderForm = () => {
  const [order, setOrder] = useState({
    deliveryAddress: {
      street: '',
      city: '',
      region: '',
      postalCode: ''
    },
    billingAddress: {
      street: '',
      city: '',
      region: '',
      postalCode: ''
    },
    paymentMethod: 'cash',
    notes: '',
    deliveryDate: '',
    deliveryTime: ''
  });

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setOrder(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setOrder(prev => ({
        ...prev,
        [name]: value
      }));
    }
  }, []);

  const resetOrder = useCallback(() => {
    setOrder({
      deliveryAddress: {
        street: '',
        city: '',
        region: '',
        postalCode: ''
      },
      billingAddress: {
        street: '',
        city: '',
        region: '',
        postalCode: ''
      },
      paymentMethod: 'cash',
      notes: '',
      deliveryDate: '',
      deliveryTime: ''
    });
  }, []);

  return {
    order,
    setOrder,
    handleInputChange,
    resetOrder
  };
};

