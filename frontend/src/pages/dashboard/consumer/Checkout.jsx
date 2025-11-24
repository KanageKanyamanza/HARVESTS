import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useCart } from '../../../contexts/CartContext';
import { consumerService, authService, orderService } from '../../../services';
import cartService from '../../../services/cartService';
import CloudinaryImage from '../../../components/common/CloudinaryImage';
import { estimateDeliveryFee } from '../../../utils/shippingUtils';
import { getCountryName } from '../../../utils/countryMapper';
import {
  FiArrowLeft,
  FiMapPin,
  FiCreditCard,
  FiTruck,
  FiShield,
  FiCheck,
  FiUser,
  FiInfo,
  FiPhone,
  FiMail,
  FiHome,
  FiEdit3,
  FiPlus,
  FiMinus,
  FiShoppingBag,
  FiClock,
  FiTag,
  FiDollarSign
} from 'react-icons/fi';

const Checkout = () => {
  const { user } = useAuth();
  const { items: cartItems, clearCart, removeFromCart } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [estimation, setEstimation] = useState(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimationError, setEstimationError] = useState(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [orderData, setOrderData] = useState({
    deliveryAddress: {
      label: 'Domicile',
      firstName: '',
      lastName: '',
      street: '',
      city: '',
      region: '',
      country: '',
      postalCode: '',
      phone: '',
      deliveryInstructions: ''
    },
    billingAddress: {
      sameAsDelivery: true,
      label: 'Domicile',
      firstName: '',
      lastName: '',
      street: '',
      city: '',
      region: '',
      country: '',
      postalCode: '',
      phone: ''
    },
    paymentMethod: 'cash',
    paymentProvider: 'cash-on-delivery',
    deliveryMethod: 'standard-delivery',
    notes: '',
    useLoyaltyPoints: false,
    loyaltyPointsToUse: 0
  });


  // Charger les données complètes du profil utilisateur et pré-remplir les adresses
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user) {
        try {
          const response = await authService.getProfile();
          if (response.data.status === 'success') {
            const userData = response.data.data.user;
            
            // Trouver l'adresse par défaut ou la première adresse disponible
            const defaultAddress = userData.deliveryAddresses?.find(addr => addr.isDefault) || 
                                 userData.deliveryAddresses?.[0] || 
                                 userData.address || {};
            
            // Déboguer les données de pays
            const userCountry = userData.country || 'SN';
            const addressCountry = defaultAddress.country;
            // Priorité : userData.country (code) puis defaultAddress.country
            const finalCountry = getCountryName(userCountry || addressCountry);
            
            setOrderData(prev => ({
              ...prev,
              deliveryAddress: {
                ...prev.deliveryAddress,
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
              },
              billingAddress: {
                ...prev.billingAddress,
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                phone: userData.phone || '',
                email: userData.email || '',
                street: defaultAddress.street || userData.address || '',
                city: defaultAddress.city || userData.city || '',
                region: defaultAddress.region || userData.region || '',
                country: finalCountry,
                postalCode: defaultAddress.postalCode || ''
              }
            }));
          }
        } catch (error) {
          console.error('Erreur lors du chargement du profil:', error);
          // Fallback avec les données de base de l'utilisateur
          if (user.firstName && user.lastName) {
            setOrderData(prev => ({
              ...prev,
              deliveryAddress: {
                ...prev.deliveryAddress,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone || '',
                email: user.email || '',
                street: user.address || '',
                city: user.city || '',
                region: user.region || '',
                country: getCountryName(user.country)
              },
              billingAddress: {
                ...prev.billingAddress,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone || '',
                email: user.email || '',
                street: user.address || '',
                city: user.city || '',
                region: user.region || '',
                country: getCountryName(user.country)
              }
            }));
          }
        }
      }
    };

    loadUserProfile();
  }, [user]);

  const handleInputChange = (section, field, value) => {
    if (section === '') {
      // Champ de niveau racine
      setOrderData(prev => ({
        ...prev,
        [field]: value
      }));
    } else {
      // Champ dans une section
      setOrderData(prev => ({
      ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    }
  };

  // Mettre à jour automatiquement le provider selon la méthode choisie
  useEffect(() => {
    if (orderData.paymentMethod === 'cash' && orderData.paymentProvider !== 'cash-on-delivery') {
      setOrderData(prev => ({
        ...prev,
        paymentProvider: 'cash-on-delivery'
      }));
    } else if (orderData.paymentMethod === 'paypal' && orderData.paymentProvider !== 'paypal') {
      setOrderData(prev => ({
        ...prev,
        paymentProvider: 'paypal'
      }));
    }
  }, [orderData.paymentMethod, orderData.paymentProvider]);

  // const handleBillingAddressChange = (field, value) => {
  //   if (field === 'sameAsDelivery' && value) {
  //     setOrderData(prev => ({
  //       ...prev,
  //       billingAddress: {
  //         ...prev.deliveryAddress,
  //         sameAsDelivery: true
  //       }
  //     }));
  //   } else {
  //     setOrderData(prev => ({
  //       ...prev,
  //       billingAddress: {
  //         ...prev.billingAddress,
  //         [field]: value,
  //         sameAsDelivery: false
  //       }
  //     }));
  //   }
  // };

  const processCartItems = useCallback(() => {
    const normalized = cartItems.map(item => {
      if (item.producer?.id) {
        return {
          ...item,
          originType: item.originType || 'product',
        };
      }

      const fallbackId =
        item.producerId ||
        item.supplierId ||
        item.vendorId ||
        item.restaurateurId ||
        item.transformerId ||
        item.ownerId ||
        null;

      const fallbackName =
        item.producerName ||
        item.supplierName ||
        item.vendorName ||
        item.restaurateurName ||
        item.transformerName ||
        item.ownerName ||
        'Fournisseur';

      const fallbackType =
        item.producer?.type ||
        item.producerType ||
        item.supplierType ||
        item.vendorType ||
        item.categoryOwnerType ||
        (item.originType === 'dish'
          ? 'restaurateur'
          : item.originType === 'transformed-product'
          ? 'transformer'
          : item.originType === 'logistics'
          ? 'transporter'
          : 'producer');

      return {
        ...item,
        originType: item.originType || 'product',
        producer: {
          id: fallbackId,
          name: fallbackName,
          type: fallbackType,
        },
      };
    });

    const valid = normalized.filter(item => item.producer?.id);
    const invalid = normalized.filter(item => !item.producer?.id);

    return { normalized, valid, invalid };
  }, [cartItems]);

  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFeeFallback = estimateDeliveryFee(cartItems, orderData.deliveryMethod, orderData.deliveryAddress);
    const taxes = 0;
    const discount = orderData.useLoyaltyPoints ? orderData.loyaltyPointsToUse * 10 : 0; // 1 point = 10 FCFA
    const totalFallback = subtotal + deliveryFeeFallback - discount;

    if (estimation) {
      return {
        subtotal: estimation.subtotal ?? subtotal,
        deliveryFee: estimation.deliveryFee ?? deliveryFeeFallback,
          taxes: estimation.taxes ?? taxes,
        discount: estimation.discount ?? discount,
        total: estimation.total ?? totalFallback
      };
    }

      return { subtotal, deliveryFee: deliveryFeeFallback, taxes, discount, total: totalFallback };
  };

  const validateStep = (step) => {
    switch (step) {
      case 1: {
        const { deliveryAddress } = orderData;
        return deliveryAddress.firstName && deliveryAddress.lastName && 
               deliveryAddress.street && deliveryAddress.city && 
               deliveryAddress.region && deliveryAddress.country && deliveryAddress.phone;
      }
      case 2:
        return Boolean(orderData.paymentMethod);
      case 3:
        return true; // Confirmation
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
      // Scroll vers le haut de la page avec un petit délai pour s'assurer que le DOM est mis à jour
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Alternative: scroll vers le conteneur principal
        const container = document.querySelector('.max-w-7xl');
        if (container) {
          container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    // Scroll vers le haut de la page avec un petit délai
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const container = document.querySelector('.max-w-7xl');
      if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  useEffect(() => {
    const shouldEstimate =
      ['consumer', 'restaurateur'].includes(user?.userType) &&
      cartItems.length > 0 &&
      orderData.deliveryAddress?.street &&
      orderData.deliveryAddress?.city &&
      orderData.deliveryAddress?.region &&
      orderData.deliveryAddress?.country;

    if (!shouldEstimate) {
      setEstimation(null);
      return;
    }

    const { valid } = processCartItems();
    if (valid.length === 0) {
      setEstimation(null);
      return;
    }

    const payloadItems = valid.map(item => ({
      productId: item.productId || item.id,
      quantity: item.quantity,
      originType: item.originType || 'product',
      supplierId: item.producer?.id,
      supplierType: item.producer?.type || item.originType || 'producer',
      specialInstructions: item.specialInstructions || ''
    }));

    let isMounted = true;
    setIsEstimating(true);
    setEstimationError(null);

    orderService.estimateOrder({
      items: payloadItems,
      deliveryAddress: orderData.deliveryAddress,
      deliveryMethod: orderData.deliveryMethod,
      useLoyaltyPoints: orderData.useLoyaltyPoints,
      loyaltyPointsToUse: orderData.loyaltyPointsToUse
    })
      .then(response => {
        if (!isMounted) return;
        setEstimation(response.data?.data || null);
      })
      .catch(error => {
        if (!isMounted) return;
        console.error('❌ Erreur estimation commande:', error);
        setEstimation(null);
        const message =
          error.response?.data?.message ||
          "Impossible de calculer les frais de livraison pour le moment.";
        setEstimationError(message);
      })
      .finally(() => {
        if (isMounted) {
          setIsEstimating(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [
    user?.userType,
    cartItems,
    orderData.deliveryAddress,
    orderData.deliveryMethod,
    orderData.useLoyaltyPoints,
    orderData.loyaltyPointsToUse,
    processCartItems
  ]);

  const handleSubmitOrder = async () => {
    if (!validateStep(1) || !validateStep(2)) {
      return;
    }

    setSubmitting(true);
    try {
      const { valid: validCartItems, invalid: invalidCartItems } = processCartItems();

      if (invalidCartItems.length > 0) {
        invalidCartItems.forEach(item =>
          removeFromCart(item.productId || item.id, item.originType || 'product')
        );

        window.alert('Certains articles ne sont plus disponibles et ont été retirés de votre panier.');

        if (validCartItems.length === 0) {
          setSubmitting(false);
          return;
        }
      }

      const orderPayload = {
        deliveryAddress: orderData.deliveryAddress,
        billingAddress: orderData.billingAddress.sameAsDelivery
          ? orderData.deliveryAddress
          : orderData.billingAddress,
        paymentMethod: orderData.paymentMethod,
        paymentProvider: orderData.paymentProvider,
        deliveryMethod: orderData.deliveryMethod,
        notes: orderData.notes,
        useLoyaltyPoints: orderData.useLoyaltyPoints,
        loyaltyPointsToUse: orderData.loyaltyPointsToUse,
        currency: 'XAF',
        source: 'web',
        items: validCartItems.map(item => ({
          productId: item.productId || item.id,
          quantity: item.quantity,
          originType: item.originType || 'product',
          supplierId: item.producer?.id,
          supplierType: item.producer?.type || item.originType || 'producer',
          specialInstructions: item.specialInstructions || ''
        }))
      };

      const response = await consumerService.createOrder(orderPayload);
      const orderId =
        response.data?.data?.order?._id ||
        response.data?.order?._id ||
        response.data?.data?._id ||
        null;

      validCartItems.forEach(item =>
        removeFromCart(item.productId || item.id, item.originType || 'product')
      );
      clearCart();

      try {
        await cartService.clearCart();
      } catch (error) {
        console.error('Erreur lors du vidage du panier serveur:', error);
      }

      if (orderId) {
        navigate(`/consumer/orders/${orderId}/confirmation`);
      } else {
        navigate('/consumer/orders');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la création de la commande:', error);
      // Ici on pourrait afficher une notification d'erreur
    } finally {
      setSubmitting(false);
    }
  };

  const totals = calculateTotals();
  const deliveryDetail = estimation?.deliveryFeeDetail;
  const deliveryMethodLabels = {
    'standard-delivery': 'livraison standard',
    'express-delivery': 'livraison express',
    'same-day': 'livraison jour même',
    'scheduled': 'livraison programmée',
    pickup: 'retrait sur place'
  };

  if (cartItems.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <FiShoppingBag className="mx-auto h-16 w-16 text-gray-400" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Votre panier est vide</h2>
          <p className="mt-2 text-gray-600">
            Ajoutez des produits à votre panier avant de passer commande
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/cart')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-harvests-green hover:bg-green-600"
            >
              <FiArrowLeft className="mr-2 h-5 w-5" />
              Retour au panier
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <FiArrowLeft className="h-4 w-4 mr-2" />
            Retour au panier
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Finaliser la commande</h1>
          <p className="text-gray-600 mt-1">
            Étape {currentStep} sur 3 • {cartItems.length} article{cartItems.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { step: 1, title: 'Adresse', icon: FiMapPin },
              { step: 2, title: 'Paiement', icon: FiCreditCard },
              { step: 3, title: 'Confirmation', icon: FiCheck }
            ].map(({ step, title, icon }) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= step 
                    ? 'bg-harvests-green text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {icon === FiMapPin && <FiMapPin className="h-5 w-5" />}
                  {icon === FiCreditCard && <FiCreditCard className="h-5 w-5" />}
                  {icon === FiCheck && <FiCheck className="h-5 w-5" />}
                  </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step ? 'text-harvests-green' : 'text-gray-600'
                }`}>
                  {title}
                  </span>
                {step < 3 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step ? 'bg-harvests-green' : 'bg-gray-200'
                  }`} />
                  )}
                </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Delivery Address */}
            {currentStep === 1 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <FiMapPin className="h-5 w-5 mr-2" />
                  Adresse de livraison
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      value={orderData.deliveryAddress.firstName}
                      onChange={(e) => handleInputChange('deliveryAddress', 'firstName', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom *
                    </label>
                      <input
                        type="text"
                      value={orderData.deliveryAddress.lastName}
                      onChange={(e) => handleInputChange('deliveryAddress', 'lastName', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                      required
                      />
                    </div>
                  
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse *
                    </label>
                    <input
                      type="text"
                      value={orderData.deliveryAddress.street}
                      onChange={(e) => handleInputChange('deliveryAddress', 'street', e.target.value)}
                      placeholder="Rue, numéro, quartier"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ville *
                    </label>
                      <input
                        type="text"
                      value={orderData.deliveryAddress.city}
                      onChange={(e) => handleInputChange('deliveryAddress', 'city', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                      required
                      />
                    </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Région/État/Province *
                    </label>
                    <input
                      type="text"
                      value={orderData.deliveryAddress.region}
                      onChange={(e) => handleInputChange('deliveryAddress', 'region', e.target.value)}
                      placeholder="Ex: Centre, Dakar, Lagos, Nairobi..."
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Code postal
                    </label>
                    <input
                      type="text"
                      value={orderData.deliveryAddress.postalCode}
                      onChange={(e) => handleInputChange('deliveryAddress', 'postalCode', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                    />
                </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pays *
                    </label>
                    <input
                      type="text"
                      value={orderData.deliveryAddress.country}
                      onChange={(e) => handleInputChange('deliveryAddress', 'country', e.target.value)}
                      placeholder="Ex: Cameroun, Sénégal, Côte d'Ivoire..."
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                      required
                    />
                </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      value={orderData.deliveryAddress.phone}
                      onChange={(e) => handleInputChange('deliveryAddress', 'phone', e.target.value)}
                      placeholder="+237 6XX XXX XXX"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                      required
                    />
                </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instructions de livraison
                    </label>
                    <textarea
                      value={orderData.deliveryAddress.deliveryInstructions}
                      onChange={(e) => handleInputChange('deliveryAddress', 'deliveryInstructions', e.target.value)}
                      placeholder="Informations supplémentaires pour le livreur..."
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {/* Payment Method */}
              <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <FiCreditCard className="h-5 w-5 mr-2" />
                    Méthode de paiement
                  </h2>
                  
                  <div className="space-y-4">
                    {[
                      { value: 'cash', label: 'Paiement à la livraison', description: 'Réglez en espèces auprès du livreur au moment de la livraison.' },
                      { value: 'paypal', label: 'Paypal ou Carte bancaire', description: 'Payer en ligne via votre compte PayPal ou Carte bancaire, de façon sécurisée.' }
                    ].map((method) => {
                      const IconComponent = method.value === 'cash' ? FiDollarSign : FiCreditCard;
                      return (
                      <label
                        key={method.value}
                        className={`flex items-start p-4 border rounded-lg cursor-pointer transition hover:bg-harvests-light ${
                          orderData.paymentMethod === method.value ? 'border-harvests-green bg-harvests-light/60' : 'border-gray-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.value}
                          checked={orderData.paymentMethod === method.value}
                          onChange={(e) => handleInputChange('', 'paymentMethod', e.target.value)}
                          className="h-4 w-4 text-harvests-green focus:ring-harvests-green mt-1"
                        />
                        <div className="ml-3">
                          <div className="flex items-center space-x-2">
                              <IconComponent className="h-6 w-6 text-gray-700" />
                            <span className="text-sm font-medium text-gray-900">{method.label}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">{method.description}</p>
                        </div>
                      </label>
                      );
                    })}
                  </div>

                  {orderData.paymentMethod === 'cash' && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start">
                        <FiInfo className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-medium text-green-800">Paiement à la livraison</h3>
                          <p className="text-sm text-green-700 mt-1">
                            Préparez le montant exact pour le livreur. Vous recevrez un reçu une fois la commande remise.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {orderData.paymentMethod === 'paypal' && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start">
                        <FiShield className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-medium text-blue-800">Paiement sécurisé via PayPal</h3>
                          <p className="text-sm text-blue-700 mt-1">
                            Après validation, vous serez redirigé vers PayPal pour autoriser le paiement. Aucune information sensible n’est stockée par Harvests.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Delivery Method */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <FiTruck className="h-5 w-5 mr-2" />
                    Mode de livraison
                  </h2>
                  
                  <div className="space-y-4">
                    {[
                      { 
                        value: 'standard-delivery', 
                        label: 'Livraison standard', 
                        description: '2-3 jours ouvrables',
                        price: '2 000 FCFA'
                      },
                      { 
                        value: 'express-delivery', 
                        label: 'Livraison express', 
                        description: '24 heures',
                        price: '5 000 FCFA'
                      }
                    ].map((method) => (
                      <label key={method.value} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-harvests-light">
                        <div className="flex items-center">
                    <input
                            type="radio"
                            name="deliveryMethod"
                            value={method.value}
                            checked={orderData.deliveryMethod === method.value}
                            onChange={(e) => handleInputChange('', 'deliveryMethod', e.target.value)}
                            className="h-4 w-4 text-harvests-green focus:ring-harvests-green"
                          />
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{method.label}</div>
                            <div className="text-sm text-gray-500">{method.description}</div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-900">{method.price}</div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Order Notes */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Notes de commande
                  </h2>
                  <textarea
                    value={orderData.notes}
                    onChange={(e) => handleInputChange('', 'notes', e.target.value)}
                    placeholder="Instructions spéciales pour votre commande..."
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <FiCheck className="h-5 w-5 mr-2" />
                  Confirmation de commande
                </h2>
                
                <div className="space-y-6">
                  {/* Order Summary */}
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-3">Résumé de la commande</h3>
                    <div className="space-y-2">
                      {cartItems.map((item, index) => (
                        <div key={item.productId || item.id || `item-${index}`} className="flex justify-between text-sm">
                          <span>{item.name} x {item.quantity}</span>
                          <span>{(item.price * item.quantity).toLocaleString()} FCFA</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-3">Adresse de livraison</h3>
                    <div className="text-sm text-gray-600">
                      <p>{orderData.deliveryAddress.firstName} {orderData.deliveryAddress.lastName}</p>
                      <p>{orderData.deliveryAddress.street}</p>
                      <p>{orderData.deliveryAddress.city}, {orderData.deliveryAddress.region}</p>
                      <p>{orderData.deliveryAddress.phone}</p>
                    </div>
                </div>

                  {/* Payment Method */}
                    <div>
                      <h3 className="text-md font-medium text-gray-900 mb-3">Paiement</h3>
                      <div className="text-sm text-gray-600">
                        <p>Méthode: {orderData.paymentMethod === 'paypal' ? 'PayPal' : 'Paiement à la livraison'}</p>

                        {orderData.paymentMethod === 'paypal' && (
                          <div>
                            <p>Provider: PayPal</p>
                            <p className="text-blue-600">Vous serez redirigé vers PayPal pour confirmer le paiement.</p>
                          </div>
                        )}

                        {orderData.paymentMethod === 'cash' && (
                          <p className="text-green-600 font-medium">✓ Paiement en espèces à la livraison</p>
                        )}
                      </div>
                    </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-harvests-light disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              
              {currentStep < 3 ? (
                <button
                  onClick={nextStep}
                  disabled={!validateStep(currentStep)}
                  className="px-6 py-2 bg-harvests-green text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              ) : (
                <button
                  onClick={handleSubmitOrder}
                  disabled={submitting || !validateStep(1) || !validateStep(2)}
                  className="px-6 py-2 bg-harvests-green text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Création...
                    </>
                  ) : (
                    'Confirmer la commande'
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Résumé de la commande</h2>
              
              {/* Cart Items */}
              <div className="space-y-3 mb-6">
                {cartItems.map((item, index) => (
                  <div key={item.productId || item.id || `cart-item-${index}`} className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                      {item.image ? (
                        <CloudinaryImage
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          width={48}
                          height={48}
                        />
                      ) : (
                        <FiShoppingBag className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-sm text-gray-500">x {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {(item.price * item.quantity).toLocaleString()} FCFA
                    </p>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-medium">{totals.subtotal.toLocaleString()} FCFA</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Livraison</span>
                  <span className="font-medium">{totals.deliveryFee.toLocaleString()} FCFA</span>
                </div>
                
                {totals.taxes > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">TVA</span>
                    <span className="font-medium">{totals.taxes.toLocaleString()} FCFA</span>
                  </div>
                )}
                
                {totals.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Réduction</span>
                    <span className="font-medium text-green-600">-{totals.discount.toLocaleString()} FCFA</span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {totals.total.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>
                {isEstimating && (
                  <p className="text-xs text-blue-500 text-right mt-1">
                    Estimation des frais en cours...
                  </p>
                )}
                {!isEstimating && deliveryDetail && !estimationError && (
                  <p className="text-xs text-gray-500 text-right mt-1">
                    {deliveryDetail.reason}
                  </p>
                )}
                {!isEstimating && !deliveryDetail && !estimationError && (
                  <p className="text-xs text-gray-500 text-right mt-1">
                    Montant calculé via le forfait {deliveryMethodLabels[orderData.deliveryMethod] || orderData.deliveryMethod}.
                  </p>
                )}
                {estimationError && (
                  <p className="text-xs text-red-500 text-right mt-1">
                    {estimationError}
                  </p>
                )}
              </div>

              {/* Security Info */}
              <div className="text-center text-xs text-gray-500">
                <div className="flex items-center justify-center mb-2">
                  <FiShield className="h-4 w-4 mr-1" />
                  <span>Paiement sécurisé</span>
                </div>
                <p>Livraison garantie</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
