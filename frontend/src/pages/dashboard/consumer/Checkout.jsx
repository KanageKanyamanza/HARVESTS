import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { consumerService } from '../../../services/api';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import {
  FiMapPin,
  FiCreditCard,
  FiTruck,
  FiCheck,
  FiArrowLeft,
  FiLock,
  FiPhone,
  FiUser
} from 'react-icons/fi';

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [_deliveryAddresses, setDeliveryAddresses] = useState([]);
  const [formData, setFormData] = useState({
    delivery: {
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
      city: 'Yaoundé',
      region: 'Centre'
    },
    payment: {
      method: 'mobile-money',
      mobileNumber: ''
    }
  });

  // Charger les données nécessaires
  useEffect(() => {
    const loadCheckoutData = async () => {
      if (user?.userType === 'consumer') {
        try {
          setLoading(true);
          const [cartResponse, addressesResponse] = await Promise.all([
            consumerService.getCart(),
            consumerService.getDeliveryAddresses()
          ]);

          console.log('📡 Réponse API Checkout Cart:', cartResponse);
          console.log('📡 Réponse API Checkout Addresses:', addressesResponse);

          setCartItems(cartResponse.data.cart?.items || []);
          setDeliveryAddresses(addressesResponse.data.addresses || []);

          // Pré-remplir avec les données utilisateur
          if (user) {
            setFormData(prev => ({
              ...prev,
              delivery: {
                ...prev.delivery,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || '',
                city: user.address?.city || 'Yaoundé',
                region: user.address?.region || 'Centre'
              }
            }));
          }
        } catch (error) {
          console.error('Erreur lors du chargement des données de checkout:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadCheckoutData();
  }, [user]);

  // Calculer les totaux
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 2000;
  const total = subtotal + deliveryFee;

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const steps = [
    { id: 1, title: 'Livraison', icon: FiTruck },
    { id: 2, title: 'Paiement', icon: FiCreditCard },
    { id: 3, title: 'Confirmation', icon: FiCheck }
  ];

  if (loading) {
    return (
      <ModularDashboardLayout>
        <div className="p-6 max-w-7xl mx-auto h-full pb-20">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </ModularDashboardLayout>
    );
  }

  return (
    <ModularDashboardLayout>
      <div className="p-6 max-w-7xl mx-auto h-full pb-20">
        <div className="mb-8">
          <Link to="/cart" className="flex items-center text-gray-600 hover:text-gray-900">
            <FiArrowLeft className="h-5 w-5 mr-1" />
            Retour au panier
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Finaliser ma commande</h1>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted 
                      ? 'bg-harvests-green border-harvests-green text-white'
                      : isActive
                        ? 'border-harvests-green text-harvests-green bg-white'
                        : 'border-gray-300 text-gray-400 bg-white'
                  }`}>
                    {isCompleted ? <FiCheck className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${isActive ? 'text-harvests-green' : 'text-gray-500'}`}>
                    {step.title}
                  </span>
                  {step.id < steps.length && (
                    <div className={`w-16 h-0.5 ml-4 ${isCompleted ? 'bg-harvests-green' : 'bg-gray-300'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Informations de livraison</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={formData.delivery.firstName}
                        onChange={(e) => handleInputChange('delivery', 'firstName', e.target.value)}
                        className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                        placeholder="Votre prénom"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={formData.delivery.lastName}
                        onChange={(e) => handleInputChange('delivery', 'lastName', e.target.value)}
                        className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                        placeholder="Votre nom"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.delivery.phone}
                      onChange={(e) => handleInputChange('delivery', 'phone', e.target.value)}
                      className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                      placeholder="+237 6XX XXX XXX"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Adresse complète</label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <textarea
                      value={formData.delivery.address}
                      onChange={(e) => handleInputChange('delivery', 'address', e.target.value)}
                      rows={3}
                      className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                      placeholder="Quartier, rue, numéro de maison..."
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-2 bg-harvests-green text-white rounded-md hover:bg-green-600 transition-colors"
                  >
                    Continuer vers le paiement
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Mode de paiement</h2>

                <div className="space-y-4 mb-6">
                  <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="mobile-money"
                      checked={formData.payment.method === 'mobile-money'}
                      onChange={(e) => handleInputChange('payment', 'method', e.target.value)}
                      className="mr-3"
                    />
                    <div className="flex items-center">
                      <FiPhone className="h-5 w-5 text-harvests-green mr-2" />
                      <div>
                        <p className="font-medium">Mobile Money</p>
                        <p className="text-sm text-gray-500">Orange Money, MTN MoMo</p>
                      </div>
                    </div>
                  </label>
                </div>

                {formData.payment.method === 'mobile-money' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de téléphone</label>
                    <input
                      type="tel"
                      value={formData.payment.mobileNumber}
                      onChange={(e) => handleInputChange('payment', 'mobileNumber', e.target.value)}
                      className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                      placeholder="+237 6XX XXX XXX"
                    />
                  </div>
                )}

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Retour
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-6 py-2 bg-harvests-green text-white rounded-md hover:bg-green-600 transition-colors"
                  >
                    Vérifier la commande
                  </button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Confirmer votre commande</h2>

                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Livraison</h3>
                  <p className="text-sm text-gray-600">
                    {formData.delivery.firstName} {formData.delivery.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{formData.delivery.phone}</p>
                  <p className="text-sm text-gray-600">
                    {formData.delivery.address}, {formData.delivery.city}
                  </p>
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Retour
                  </button>
                  <button
                    onClick={() => navigate('/order-confirmation')}
                    className="px-6 py-2 bg-harvests-green text-white rounded-md hover:bg-green-600 transition-colors flex items-center"
                  >
                    <FiLock className="h-4 w-4 mr-2" />
                    Confirmer et payer
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé</h3>
              
              <div className="space-y-3 mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-gray-500">{item.quantity} {item.unit}</p>
                    </div>
                    <p className="font-medium">{(item.price * item.quantity).toLocaleString()} FCFA</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sous-total</span>
                  <span>{subtotal.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Livraison</span>
                  <span>{deliveryFee.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t border-gray-200 pt-2">
                  <span>Total</span>
                  <span>{total.toLocaleString()} FCFA</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center text-sm text-blue-700">
                  <FiTruck className="h-4 w-4 mr-2" />
                  Livraison estimée: 2-3 jours
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModularDashboardLayout>
  );
};

export default Checkout;
