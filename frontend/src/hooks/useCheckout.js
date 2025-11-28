import { useState, useEffect, useCallback } from 'react';
import { authService, orderService } from '../services';
import { estimateDeliveryFee } from '../utils/shippingUtils';
import { getCountryName } from '../utils/countryMapper';

const initialOrderData = {
  deliveryAddress: {
    label: 'Domicile', firstName: '', lastName: '', street: '', city: '',
    region: '', country: '', postalCode: '', phone: '', deliveryInstructions: ''
  },
  billingAddress: {
    sameAsDelivery: true, label: 'Domicile', firstName: '', lastName: '',
    street: '', city: '', region: '', country: '', postalCode: '', phone: ''
  },
  paymentMethod: 'cash',
  paymentProvider: 'cash-on-delivery',
  deliveryMethod: 'standard-delivery',
  notes: '',
  useLoyaltyPoints: false,
  loyaltyPointsToUse: 0
};

export const useCheckout = (user, cartItems) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [orderData, setOrderData] = useState(initialOrderData);
  const [submitting, setSubmitting] = useState(false);
  const [estimation, setEstimation] = useState(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimationError, setEstimationError] = useState(null);

  // Load user profile
  useEffect(() => {
    if (!user) return;
    
    const loadProfile = async () => {
      try {
        const response = await authService.getProfile();
        if (response.data.status === 'success') {
          const userData = response.data.data.user;
          const defaultAddress = userData.deliveryAddresses?.find(a => a.isDefault) || userData.deliveryAddresses?.[0] || userData.address || {};
          const finalCountry = getCountryName(userData.country || defaultAddress.country || 'SN');
          
          const addressData = {
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            phone: userData.phone || '',
            email: userData.email || '',
            street: defaultAddress.street || userData.address || '',
            city: defaultAddress.city || userData.city || '',
            region: defaultAddress.region || userData.region || '',
            country: finalCountry,
            postalCode: defaultAddress.postalCode || '',
            instructions: defaultAddress.instructions || ''
          };
          
          setOrderData(prev => ({
            ...prev,
            deliveryAddress: { ...prev.deliveryAddress, ...addressData },
            billingAddress: { ...prev.billingAddress, ...addressData }
          }));
        }
      } catch (error) {
        console.error('Erreur chargement profil:', error);
        if (user.firstName) {
          const fallback = {
            firstName: user.firstName, lastName: user.lastName || '',
            phone: user.phone || '', email: user.email || '',
            street: user.address || '', city: user.city || '',
            region: user.region || '', country: getCountryName(user.country)
          };
          setOrderData(prev => ({
            ...prev,
            deliveryAddress: { ...prev.deliveryAddress, ...fallback },
            billingAddress: { ...prev.billingAddress, ...fallback }
          }));
        }
      }
    };
    loadProfile();
  }, [user]);

  // Auto-update payment provider
  useEffect(() => {
    if (orderData.paymentMethod === 'cash' && orderData.paymentProvider !== 'cash-on-delivery') {
      setOrderData(prev => ({ ...prev, paymentProvider: 'cash-on-delivery' }));
    } else if (orderData.paymentMethod === 'paypal' && orderData.paymentProvider !== 'paypal') {
      setOrderData(prev => ({ ...prev, paymentProvider: 'paypal' }));
    }
  }, [orderData.paymentMethod, orderData.paymentProvider]);

  const handleInputChange = (section, field, value) => {
    if (section === '') {
      setOrderData(prev => ({ ...prev, [field]: value }));
    } else {
      setOrderData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
    }
  };

  const processCartItems = useCallback(() => {
    const normalized = cartItems.map(item => {
      if (item.producer?.id) return { ...item, originType: item.originType || 'product' };
      
      const fallbackId = item.producerId || item.supplierId || item.vendorId || item.restaurateurId || item.transformerId || item.ownerId || null;
      const fallbackName = item.producerName || item.supplierName || item.vendorName || item.restaurateurName || item.transformerName || item.ownerName || 'Fournisseur';
      const fallbackType = item.producer?.type || item.producerType || item.supplierType || item.vendorType || item.categoryOwnerType ||
        (item.originType === 'dish' ? 'restaurateur' : item.originType === 'transformed-product' ? 'transformer' : item.originType === 'logistics' ? 'transporter' : 'producer');

      return { ...item, originType: item.originType || 'product', producer: { id: fallbackId, name: fallbackName, type: fallbackType } };
    });

    return { normalized, valid: normalized.filter(i => i.producer?.id), invalid: normalized.filter(i => !i.producer?.id) };
  }, [cartItems]);

  const calculateTotals = useCallback(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFeeFallback = estimateDeliveryFee(cartItems, orderData.deliveryMethod, orderData.deliveryAddress);
    const discount = orderData.useLoyaltyPoints ? orderData.loyaltyPointsToUse * 10 : 0;
    const totalFallback = subtotal + deliveryFeeFallback - discount;

    if (estimation) {
      return {
        subtotal: estimation.subtotal ?? subtotal,
        deliveryFee: estimation.deliveryFee ?? deliveryFeeFallback,
        taxes: estimation.taxes ?? 0,
        discount: estimation.discount ?? discount,
        total: estimation.total ?? totalFallback
      };
    }
    return { subtotal, deliveryFee: deliveryFeeFallback, taxes: 0, discount, total: totalFallback };
  }, [cartItems, orderData, estimation]);

  const validateStep = (step) => {
    if (step === 1) {
      const { deliveryAddress } = orderData;
      return deliveryAddress.firstName && deliveryAddress.lastName && deliveryAddress.street && deliveryAddress.city && deliveryAddress.region && deliveryAddress.country && deliveryAddress.phone;
    }
    if (step === 2) return Boolean(orderData.paymentMethod);
    return true;
  };

  const scrollToTop = () => {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.querySelector('.max-w-7xl')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const nextStep = () => { if (validateStep(currentStep)) { setCurrentStep(prev => Math.min(prev + 1, 3)); scrollToTop(); } };
  const prevStep = () => { setCurrentStep(prev => Math.max(prev - 1, 1)); scrollToTop(); };

  // Estimation effect
  useEffect(() => {
    const shouldEstimate = ['consumer', 'restaurateur'].includes(user?.userType) && cartItems.length > 0 &&
      orderData.deliveryAddress?.street && orderData.deliveryAddress?.city && orderData.deliveryAddress?.region && orderData.deliveryAddress?.country;

    if (!shouldEstimate) { setEstimation(null); return; }

    const { valid } = processCartItems();
    if (valid.length === 0) { setEstimation(null); return; }

    const payloadItems = valid.map(item => ({
      productId: item.productId || item.id, quantity: item.quantity, originType: item.originType || 'product',
      supplierId: item.producer?.id, supplierType: item.producer?.type || item.originType || 'producer', specialInstructions: item.specialInstructions || ''
    }));

    let isMounted = true;
    setIsEstimating(true);
    setEstimationError(null);

    orderService.estimateOrder({
      items: payloadItems, deliveryAddress: orderData.deliveryAddress, deliveryMethod: orderData.deliveryMethod,
      useLoyaltyPoints: orderData.useLoyaltyPoints, loyaltyPointsToUse: orderData.loyaltyPointsToUse
    })
      .then(response => { if (isMounted) setEstimation(response.data?.data || null); })
      .catch(error => { if (isMounted) { setEstimation(null); setEstimationError(error.response?.data?.message || 'Impossible de calculer les frais.'); } })
      .finally(() => { if (isMounted) setIsEstimating(false); });

    return () => { isMounted = false; };
  }, [user?.userType, cartItems, orderData.deliveryAddress, orderData.deliveryMethod, orderData.useLoyaltyPoints, orderData.loyaltyPointsToUse, processCartItems]);

  return {
    currentStep, orderData, submitting, setSubmitting, estimation, isEstimating, estimationError,
    handleInputChange, processCartItems, calculateTotals, validateStep, nextStep, prevStep
  };
};

