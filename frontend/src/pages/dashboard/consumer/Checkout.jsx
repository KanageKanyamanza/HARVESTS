import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useCart } from '../../../contexts/CartContext';
import { consumerService, authService } from '../../../services';
import cartService from '../../../services/cartService';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import CloudinaryImage from '../../../components/common/CloudinaryImage';
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
  FiTag
} from 'react-icons/fi';

const Checkout = () => {
  const { user } = useAuth();
  const { items: cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

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
    paymentMethod: 'mobile-money',
    paymentProvider: 'orange-money',
    cardDetails: {
      number: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      cardholderName: ''
    },
    bankDetails: {
      accountNumber: '',
      swiftCode: '',
      instructions: ''
    },
    deliveryMethod: 'standard-delivery',
    notes: '',
    useLoyaltyPoints: false,
    loyaltyPointsToUse: 0
  });

  // Fonction pour convertir le code pays en nom de pays
  const getCountryName = (countryCode) => {
    const countries = {
      'CM': 'Cameroun',
      'SN': 'Sénégal', 
      'CI': 'Côte d\'Ivoire',
      'GH': 'Ghana',
      'NG': 'Nigeria',
      'KE': 'Kenya',
      'BF': 'Burkina Faso',
      'ML': 'Mali',
      'NE': 'Niger',
      'TD': 'Tchad',
      'CF': 'République centrafricaine',
      'GA': 'Gabon',
      'CG': 'Congo',
      'CD': 'République démocratique du Congo',
      'AO': 'Angola',
      'ZM': 'Zambie',
      'ZW': 'Zimbabwe',
      'ZA': 'Afrique du Sud',
      'EG': 'Égypte',
      'MA': 'Maroc',
      'TN': 'Tunisie',
      'DZ': 'Algérie',
      'LY': 'Libye',
      'SD': 'Soudan',
      'ET': 'Éthiopie',
      'UG': 'Ouganda',
      'TZ': 'Tanzanie',
      'RW': 'Rwanda',
      'BI': 'Burundi',
      'MW': 'Malawi',
      'MZ': 'Mozambique',
      'MG': 'Madagascar',
      'MU': 'Maurice',
      'SC': 'Seychelles',
      'KM': 'Comores',
      'DJ': 'Djibouti',
      'SO': 'Somalie',
      'ER': 'Érythrée',
      'SS': 'Soudan du Sud',
      'CA': 'Cameroun', // Fallback
      'Cameroon': 'Cameroun', // Fallback
      'cameroun': 'Cameroun' // Fallback
    };
    
    if (!countryCode) return 'Cameroun'; // Fallback par défaut
    
    // Si c'est déjà un nom de pays, le retourner tel quel
    if (Object.values(countries).includes(countryCode)) {
      return countryCode;
    }
    
    // Si c'est un code pays, le convertir
    if (countries[countryCode]) {
      return countries[countryCode];
    }
    
    // Sinon, retourner tel quel (cas où c'est déjà un nom de pays non listé)
    return countryCode;
  };

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
                street: defaultAddress.street || '',
                city: defaultAddress.city || userData.address?.city || '',
                region: defaultAddress.region || userData.address?.region || '',
                country: finalCountry,
                postalCode: defaultAddress.postalCode || userData.address?.postalCode || '',
                instructions: defaultAddress.instructions || ''
              },
              billingAddress: {
                ...prev.billingAddress,
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                phone: userData.phone || '',
                email: userData.email || '',
                street: defaultAddress.street || '',
                city: defaultAddress.city || userData.address?.city || '',
                region: defaultAddress.region || userData.address?.region || '',
                country: finalCountry,
                postalCode: defaultAddress.postalCode || userData.address?.postalCode || ''
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
                country: getCountryName(user.country)
              },
              billingAddress: {
                ...prev.billingAddress,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone || '',
                email: user.email || '',
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

  // Réinitialiser le paymentProvider quand on change de méthode de paiement
  useEffect(() => {
    if (orderData.paymentMethod === 'cash') {
      // Pour le paiement à la livraison, pas besoin de provider
      setOrderData(prev => ({
        ...prev,
        paymentProvider: ''
      }));
    } else if (orderData.paymentMethod && !orderData.paymentProvider) {
      // Définir un provider par défaut pour les autres méthodes
      let defaultProvider = '';
      switch (orderData.paymentMethod) {
        case 'mobile-money':
          defaultProvider = 'orange-money';
          break;
        case 'card':
          defaultProvider = 'visa';
          break;
        case 'bank-transfer':
          defaultProvider = 'afriland-first-bank';
          break;
        default:
          defaultProvider = '';
      }
      
      if (defaultProvider) {
        setOrderData(prev => ({
          ...prev,
          paymentProvider: defaultProvider
        }));
      }
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

  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = orderData.deliveryMethod === 'express-delivery' ? 5000 : 2000;
    const taxes = Math.round(subtotal * 0.1925); // 19.25% TVA
    const discount = orderData.useLoyaltyPoints ? orderData.loyaltyPointsToUse * 10 : 0; // 1 point = 10 FCFA
    const total = subtotal + deliveryFee + taxes - discount;

    return { subtotal, deliveryFee, taxes, discount, total };
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
        // Pour le paiement à la livraison, pas besoin de paymentProvider
        if (orderData.paymentMethod === 'cash') {
          return orderData.paymentMethod;
        }
        return orderData.paymentMethod && orderData.paymentProvider;
      case 3:
        return true; // Confirmation
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
      // Scroll vers le haut de la page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    // Scroll vers le haut de la page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitOrder = async () => {
    if (!validateStep(1) || !validateStep(2)) {
      return;
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        items: cartItems.map(item => ({
          productId: item.productId || item.id,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions || ''
        })),
        deliveryAddress: orderData.deliveryAddress,
        billingAddress: orderData.billingAddress.sameAsDelivery ? 
          orderData.deliveryAddress : orderData.billingAddress,
        paymentMethod: orderData.paymentMethod,
        paymentProvider: orderData.paymentProvider,
        deliveryMethod: orderData.deliveryMethod,
        notes: orderData.notes,
        useLoyaltyPoints: orderData.useLoyaltyPoints,
        loyaltyPointsToUse: orderData.loyaltyPointsToUse,
        currency: 'XAF',
        source: 'web'
      };

      const response = await consumerService.createOrder(orderPayload);

      // Vider le panier après la création réussie
      clearCart();
      
      // Vider aussi le panier côté serveur si l'utilisateur est connecté
      try {
        await cartService.clearCart();
      } catch (error) {
        console.error('Erreur lors du vidage du panier serveur:', error);
        // Continuer même si ça échoue
      }

      // Rediriger vers la page de confirmation
      const orderId = response.data.data?.order?._id || response.data.order?._id;
      if (orderId) {
        navigate(`/orders/${orderId}/confirmation`);
      } else {
        console.error('❌ ID de commande non trouvé dans la réponse:', response.data);
        // Fallback vers la page d'historique des commandes
        navigate('/order-history');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la création de la commande:', error);
      // Ici on pourrait afficher une notification d'erreur
    } finally {
      setSubmitting(false);
    }
  };

  const totals = calculateTotals();

  if (cartItems.length === 0) {
    return (
      <ModularDashboardLayout>
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
      </ModularDashboardLayout>
    );
  }

  return (
    <ModularDashboardLayout>
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
                      { value: 'mobile-money', label: 'Mobile Money', icon: '📱' },
                      { value: 'card', label: 'Carte bancaire', icon: '💳' },
                      { value: 'cash', label: 'Paiement à la livraison', icon: '💵' },
                      { value: 'bank-transfer', label: 'Virement bancaire', icon: '🏦' }
                    ].map((method) => (
                      <label key={method.value} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                          value={method.value}
                          checked={orderData.paymentMethod === method.value}
                          onChange={(e) => handleInputChange('', 'paymentMethod', e.target.value)}
                          className="h-4 w-4 text-harvests-green focus:ring-harvests-green"
                        />
                        <span className="ml-3 text-2xl">{method.icon}</span>
                        <span className="ml-3 text-sm font-medium text-gray-900">{method.label}</span>
                      </label>
                    ))}
                  </div>

                  {/* Payment Provider - Mobile Money */}
                  {orderData.paymentMethod === 'mobile-money' && (
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Opérateur Mobile Money
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { value: 'orange-money', label: 'Orange Money' },
                          { value: 'mtn-money', label: 'MTN Mobile Money' },
                          { value: 'express-union', label: 'Express Union' }
                        ].map((provider) => (
                          <label key={provider.value} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                              type="radio"
                              name="paymentProvider"
                              value={provider.value}
                              checked={orderData.paymentProvider === provider.value}
                              onChange={(e) => handleInputChange('', 'paymentProvider', e.target.value)}
                              className="h-4 w-4 text-harvests-green focus:ring-harvests-green"
                            />
                            <span className="ml-3 text-sm font-medium text-gray-900">{provider.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Payment Provider - Carte bancaire */}
                  {orderData.paymentMethod === 'card' && (
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type de carte
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { value: 'visa', label: 'Visa' },
                          { value: 'mastercard', label: 'Mastercard' },
                          { value: 'american-express', label: 'American Express' },
                          { value: 'local-card', label: 'Carte locale' }
                        ].map((provider) => (
                          <label key={provider.value} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                              type="radio"
                              name="paymentProvider"
                              value={provider.value}
                              checked={orderData.paymentProvider === provider.value}
                              onChange={(e) => handleInputChange('', 'paymentProvider', e.target.value)}
                              className="h-4 w-4 text-harvests-green focus:ring-harvests-green"
                            />
                            <span className="ml-3 text-sm font-medium text-gray-900">{provider.label}</span>
                          </label>
                        ))}
                      </div>
                      
                      {/* Détails de la carte */}
                      <div className="mt-6 space-y-4">
                        <h3 className="text-sm font-medium text-gray-700">Informations de la carte</h3>
                        
                        {/* Nom du titulaire */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nom du titulaire *
                          </label>
                          <input
                            type="text"
                            value={orderData.cardDetails.cardholderName}
                            onChange={(e) => handleInputChange('cardDetails', 'cardholderName', e.target.value)}
                            placeholder="Nom tel qu'il apparaît sur la carte"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                            required
                          />
                        </div>
                        
                        {/* Numéro de carte */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Numéro de carte *
                          </label>
                          <input
                            type="text"
                            value={orderData.cardDetails.number}
                            onChange={(e) => {
                              // Formater le numéro de carte avec des espaces tous les 4 chiffres
                              const formatted = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
                              handleInputChange('cardDetails', 'number', formatted);
                            }}
                            placeholder="1234 5678 9012 3456"
                            maxLength="19"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                            required
                          />
                        </div>
                        
                        {/* Date d'expiration et CVV */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Date d'expiration *
                            </label>
                            <div className="flex space-x-2">
                              <select
                                value={orderData.cardDetails.expiryMonth}
                                onChange={(e) => handleInputChange('cardDetails', 'expiryMonth', e.target.value)}
                                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                                required
                              >
                                <option value="">Mois</option>
                                {Array.from({ length: 12 }, (_, i) => (
                                  <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                    {String(i + 1).padStart(2, '0')}
                                  </option>
                                ))}
                              </select>
                              <select
                                value={orderData.cardDetails.expiryYear}
                                onChange={(e) => handleInputChange('cardDetails', 'expiryYear', e.target.value)}
                                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                                required
                              >
                                <option value="">Année</option>
                                {Array.from({ length: 10 }, (_, i) => {
                                  const year = new Date().getFullYear() + i;
                                  return (
                                    <option key={year} value={year}>
                                      {year}
                                    </option>
                                  );
                                })}
                              </select>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              CVV *
                            </label>
                            <input
                              type="text"
                              value={orderData.cardDetails.cvv}
                              onChange={(e) => {
                                // Limiter à 3-4 chiffres selon le type de carte
                                const cvv = e.target.value.replace(/\D/g, '').slice(0, 4);
                                handleInputChange('cardDetails', 'cvv', cvv);
                              }}
                              placeholder="123"
                              maxLength="4"
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                              required
                            />
                          </div>
                        </div>
                        
                        {/* Information de sécurité */}
                        <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                          <FiShield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-blue-700">
                            <p className="font-medium">Paiement sécurisé</p>
                            <p>Vos informations de carte sont chiffrées et sécurisées. Nous ne stockons jamais vos données de carte.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Provider - Virement bancaire */}
                  {orderData.paymentMethod === 'bank-transfer' && (
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Banque
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { value: 'afriland-first-bank', label: 'Afriland First Bank' },
                          { value: 'ecobank', label: 'Ecobank' },
                          { value: 'societe-generale', label: 'Société Générale' },
                          { value: 'bicec', label: 'BICEC' },
                          { value: 'standard-chartered', label: 'Standard Chartered' },
                          { value: 'other', label: 'Autre banque' }
                        ].map((provider) => (
                          <label key={provider.value} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                              type="radio"
                              name="paymentProvider"
                              value={provider.value}
                              checked={orderData.paymentProvider === provider.value}
                              onChange={(e) => handleInputChange('', 'paymentProvider', e.target.value)}
                              className="h-4 w-4 text-harvests-green focus:ring-harvests-green"
                            />
                            <span className="ml-3 text-sm font-medium text-gray-900">{provider.label}</span>
                          </label>
                        ))}
                      </div>
                      
                      {/* Détails du virement bancaire */}
                      <div className="mt-6 space-y-4">
                        <h3 className="text-sm font-medium text-gray-700">Informations de virement</h3>
                        
                        {/* Numéro de compte */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Numéro de compte *
                          </label>
                          <input
                            type="text"
                            value={orderData.bankDetails?.accountNumber || ''}
                            onChange={(e) => handleInputChange('bankDetails', 'accountNumber', e.target.value)}
                            placeholder="Numéro de compte bancaire"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                            required
                          />
                        </div>
                        
                        {/* Code SWIFT/BIC */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Code SWIFT/BIC
                          </label>
                          <input
                            type="text"
                            value={orderData.bankDetails?.swiftCode || ''}
                            onChange={(e) => handleInputChange('bankDetails', 'swiftCode', e.target.value.toUpperCase())}
                            placeholder="Code SWIFT de la banque"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                          />
                        </div>
                        
                        {/* Instructions spéciales */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Instructions de virement
                          </label>
                          <textarea
                            value={orderData.bankDetails?.instructions || ''}
                            onChange={(e) => handleInputChange('bankDetails', 'instructions', e.target.value)}
                            placeholder="Instructions spéciales pour le virement..."
                            rows={3}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                          />
                        </div>
                        
                        {/* Information sur le virement */}
                        <div className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <FiInfo className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-yellow-700">
                            <p className="font-medium">Instructions de virement</p>
                            <p>Vous recevrez les détails complets du virement par email après confirmation de votre commande.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Paiement à la livraison - Pas de provider nécessaire */}
                  {orderData.paymentMethod === 'cash' && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                        <FiInfo className="h-5 w-5 text-green-600 mr-2" />
                      <div>
                          <h3 className="text-sm font-medium text-green-800">Paiement à la livraison</h3>
                          <p className="text-sm text-green-700 mt-1">
                            Vous paierez en espèces lors de la réception de votre commande. 
                            Aucune information de paiement supplémentaire n'est requise.
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
                      <label key={method.value} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
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
                        <p>Méthode: {orderData.paymentMethod === 'mobile-money' ? 'Mobile Money' : 
                                  orderData.paymentMethod === 'card' ? 'Carte bancaire' :
                                  orderData.paymentMethod === 'cash' ? 'Paiement à la livraison' : 'Virement bancaire'}</p>
                        
                        {/* Mobile Money */}
                        {orderData.paymentMethod === 'mobile-money' && orderData.paymentProvider && (
                          <p>Opérateur: {orderData.paymentProvider === 'orange-money' ? 'Orange Money' :
                                        orderData.paymentProvider === 'mtn-money' ? 'MTN Mobile Money' : 'Express Union'}</p>
                        )}
                        
                        {/* Carte bancaire */}
                        {orderData.paymentMethod === 'card' && orderData.paymentProvider && (
                          <div>
                            <p>Type de carte: {orderData.paymentProvider === 'visa' ? 'Visa' :
                                             orderData.paymentProvider === 'mastercard' ? 'Mastercard' :
                                             orderData.paymentProvider === 'american-express' ? 'American Express' : 'Carte locale'}</p>
                            {orderData.cardDetails.cardholderName && (
                              <p>Titulaire: {orderData.cardDetails.cardholderName}</p>
                            )}
                            {orderData.cardDetails.number && (
                              <p>Numéro: **** **** **** {orderData.cardDetails.number.slice(-4)}</p>
                            )}
                          </div>
                        )}
                        
                        {/* Virement bancaire */}
                        {orderData.paymentMethod === 'bank-transfer' && orderData.paymentProvider && (
                          <div>
                            <p>Banque: {orderData.paymentProvider === 'afriland-first-bank' ? 'Afriland First Bank' :
                                       orderData.paymentProvider === 'ecobank' ? 'Ecobank' :
                                       orderData.paymentProvider === 'societe-generale' ? 'Société Générale' :
                                       orderData.paymentProvider === 'bicec' ? 'BICEC' :
                                       orderData.paymentProvider === 'standard-chartered' ? 'Standard Chartered' : 'Autre banque'}</p>
                            {orderData.bankDetails?.accountNumber && (
                              <p>Compte: ****{orderData.bankDetails.accountNumber.slice(-4)}</p>
                            )}
                          </div>
                        )}
                        
                        {/* Paiement à la livraison */}
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
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">TVA (19.25%)</span>
                  <span className="font-medium">{totals.taxes.toLocaleString()} FCFA</span>
                </div>
                
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
    </ModularDashboardLayout>
  );
};

export default Checkout;
