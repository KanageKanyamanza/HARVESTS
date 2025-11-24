import React, { useState, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { paymentService } from '../../services';
import {
  PayPalScriptProvider,
  PayPalButtons
} from '@paypal/react-paypal-js';
import {
  FiArrowLeft,
  FiCreditCard,
  FiCheck,
  FiLock,
  FiShield,
  FiUser,
  FiMail,
  FiPhone
} from 'react-icons/fi';

const SubscriptionCheckout = () => {
  const { planId } = useParams();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Récupérer billingPeriod depuis location.state ou utiliser 'monthly' par défaut
  const billingPeriod = location.state?.billingPeriod || 'monthly';
  
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const paymentIdRef = useRef(null);
  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

  const plans = {
    gratuit: {
      id: 'gratuit',
      name: 'Gratuit',
      monthlyPrice: 0,
      annualPrice: 0
    },
    standard: {
      id: 'standard',
      name: 'Standard',
      monthlyPrice: 3000,
      annualPrice: 25000
    },
    premium: {
      id: 'premium',
      name: 'Premium',
      monthlyPrice: 10000,
      annualPrice: 75000
    }
  };

  const selectedPlan = plans[planId] || plans.standard;

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/payment/subscription/${planId}/checkout` } });
    }
  }, [isAuthenticated, navigate, planId]);

  const getPrice = () => {
    return billingPeriod === 'monthly' ? selectedPlan.monthlyPrice : selectedPlan.annualPrice;
  };

  const price = getPrice();

  const paypalOptions = useMemo(() => {
    if (!paypalClientId) return null;

    const options = {
      'client-id': paypalClientId,
      currency: 'USD',
      components: 'buttons',
      'enable-funding': 'card',
      'disable-funding': 'credit,paylater,venmo',
      intent: 'capture'
    };

    return options;
  }, [paypalClientId]);

  // Créer l'ordre PayPal pour les boutons
  const createPayPalOrder = useCallback(async () => {
    try {
      setPaymentProcessing(true);
      setPaymentError(null);
      const amount = price;
      const origin = window.location.origin;
      const response = await paymentService.initiatePayment({
        type: 'subscription',
        planId: selectedPlan.id,
        billingPeriod,
        amount,
        currency: 'XAF',
        method: 'paypal',
        returnUrl: `${origin}/payments/paypal/success?type=subscription&planId=${selectedPlan.id}`,
        cancelUrl: `${origin}/payments/paypal/cancel?type=subscription&planId=${selectedPlan.id}`,
        // Passer les informations utilisateur pour pré-remplir PayPal
        customerInfo: user ? {
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || ''
        } : undefined
      });

      const payload = response.data?.data;
      const paymentId = payload?.payment?.paymentId || payload?.payment?.id || payload?.paymentId || null;
      const orderId = payload?.paypalOrderId || null;

      paymentIdRef.current = paymentId;
      if (paymentId) {
        sessionStorage.setItem(`harvests_subscription_payment_${selectedPlan.id}`, paymentId);
      }

      if (!orderId) {
        throw new Error('Identifiant PayPal introuvable.');
      }

      setPaymentProcessing(false);
      return orderId;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Impossible de contacter PayPal pour le moment.';
      setPaymentError(message);
      setPaymentProcessing(false);
      throw err;
    }
  }, [selectedPlan.id, billingPeriod, price, user]);

  const handlePayPalApprove = useCallback(async (data) => {
    try {
      const paymentId = paymentIdRef.current || sessionStorage.getItem(`harvests_subscription_payment_${selectedPlan.id}`);

      if (!paymentId) {
        throw new Error('Identifiant du paiement introuvable.');
      }

      await paymentService.confirmPayment(paymentId, { paypalOrderId: data.orderID });
      sessionStorage.setItem(`harvests_subscription_confirmed_${selectedPlan.id}`, 'true');
      sessionStorage.setItem(`harvests_subscription_paypal_order_${selectedPlan.id}`, data.orderID);
      setPaymentError(null);
      setPaymentProcessing(false);
      
      navigate(`/payments/paypal/success?type=subscription&planId=${selectedPlan.id}&paymentId=${paymentId}&paypalOrderId=${data.orderID}`);
    } catch (err) {
      console.error('Erreur PayPal lors de la confirmation:', err);
      const message = err.response?.data?.message || err.message || 'Erreur lors de la confirmation du paiement.';
      setPaymentError(message);
      setPaymentProcessing(false);
    }
  }, [selectedPlan.id, navigate]);

  const handlePayPalCancel = useCallback(() => {
    setPaymentError('Paiement annulé. Vous pouvez réessayer.');
    setPaymentProcessing(false);
  }, []);

  const handlePayPalError = useCallback((err) => {
    console.error('Erreur PayPal:', err);
    setPaymentError(err?.message || 'Erreur PayPal inattendue.');
    setPaymentProcessing(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* En-tête */}
        <div className="mb-6">
          <button
            onClick={() => navigate(`/payment/subscription/${planId}`)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <FiArrowLeft className="mr-2" />
            Retour
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Paiement sécurisé</h1>
          <p className="text-gray-600 mt-1">Abonnement {selectedPlan.name} - {billingPeriod === 'monthly' ? 'Mensuel' : 'Annuel'}</p>
        </div>

        {/* Carte principale */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 relative" style={{ zIndex: 1 }}>
          {/* Informations utilisateur */}
          {user && (
            <div className="mb-6 bg-white border-2 border-gray-300 rounded-lg p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <FiUser className="h-4 w-4 mr-2" />
                Informations de facturation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center text-gray-900">
                  <FiUser className="h-4 w-4 mr-2 text-gray-600" />
                  <span className="font-medium">{user.firstName || ''} {user.lastName || ''}</span>
                </div>
                {user.email && (
                  <div className="flex items-center text-gray-900">
                    <FiMail className="h-4 w-4 mr-2 text-gray-600" />
                    <span>{user.email}</span>
                  </div>
                )}
                {user.phone && (
                  <div className="flex items-center text-gray-900">
                    <FiPhone className="h-4 w-4 mr-2 text-gray-600" />
                    <span>{user.phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* En-tête de paiement */}
          <div className="border-2 border-green-500 rounded-xl bg-green-100 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-green-900">
                  Paiement par carte bancaire ou PayPal
                </h3>
                <p className="text-sm text-green-800 mt-1">
                  Payez en toute sécurité avec votre carte bancaire ou votre compte PayPal
                </p>
              </div>
              <div className="flex items-center gap-2">
                <FiCreditCard className="h-6 w-6 text-green-800" />
                <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
                  <FiCheck className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Note importante */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
            <p className="font-semibold mb-1">Note importante :</p>
            <p>Pour les abonnements, PayPal peut ouvrir une fenêtre sécurisée pour l'authentification 3D Secure de votre banque. C'est normal et sécurisé.</p>
          </div>

          {/* Affichage des erreurs */}
          {paymentError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{paymentError}</p>
            </div>
          )}

          {/* Boutons PayPal */}
          {!paypalClientId ? (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3">
              Configuration PayPal manquante. Veuillez définir <code>VITE_PAYPAL_CLIENT_ID</code>.
            </div>
          ) : paypalOptions ? (
            <PayPalScriptProvider
              key="paypal-buttons-subscription"
              options={paypalOptions}
            >
              <div className="mt-4 relative" style={{ zIndex: 1 }}>
                <PayPalButtons
                  createOrder={createPayPalOrder}
                  onApprove={handlePayPalApprove}
                  onCancel={handlePayPalCancel}
                  onError={handlePayPalError}
                  style={{
                    layout: 'vertical',
                    color: 'gold',
                    shape: 'rect',
                    label: 'pay'
                  }}
                  disabled={paymentProcessing}
                />
              </div>
            </PayPalScriptProvider>
          ) : (
            <div className="mt-4 text-sm text-gray-600 bg-white border border-gray-200 rounded-md p-4">
              <p>Initialisation des boutons de paiement...</p>
            </div>
          )}

          {/* Sécurité */}
          <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-gray-600">
            <FiLock className="h-4 w-4" />
            <span>Paiement sécurisé protégé par cryptage SSL</span>
          </div>
        </div>

        {/* Informations de sécurité */}
        <div className="bg-white rounded-lg shadow p-4 flex items-start gap-3">
          <FiShield className="h-5 w-5 text-green-600 mt-0.5" />
          <div className="text-sm text-gray-600">
            <p className="font-semibold text-gray-900 mb-1">Paiement sécurisé</p>
            <p>Vos informations de paiement sont cryptées et sécurisées. Nous ne stockons jamais vos données de carte bancaire.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCheckout;
