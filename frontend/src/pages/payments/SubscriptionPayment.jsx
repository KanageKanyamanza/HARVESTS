import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { paymentService, subscriptionService } from '../../services';
import { getCountryCode } from '../../utils/countryMapper';
import {
  PayPalScriptProvider,
  PayPalButtons,
  PayPalHostedFieldsProvider,
  PayPalHostedField,
  usePayPalHostedFields
} from '@paypal/react-paypal-js';
import {
  FiArrowLeft,
  FiCreditCard,
  FiCheck,
  FiInfo,
  FiShield,
  FiCalendar,
  FiDollarSign,
  FiAlertCircle,
  FiLock,
  FiX
} from 'react-icons/fi';

const SubscriptionPayment = () => {
  const { planId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [billingPeriod, setBillingPeriod] = useState('monthly'); // 'monthly' or 'annual'
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [showPayPalModal, setShowPayPalModal] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const paymentIdRef = useRef(null);
  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  const paypalCurrency = 'USD';
  const [paypalClientToken, setPaypalClientToken] = useState(null);
  const [paypalTokenLoading, setPaypalTokenLoading] = useState(false);
  const [paypalTokenError, setPaypalTokenError] = useState(null);
  const [hostedFieldsOrderId, setHostedFieldsOrderId] = useState(null);

  const plans = {
    gratuit: {
      id: 'gratuit',
      name: 'Gratuit',
      subtitle: 'Découverte',
      monthlyPrice: 0,
      annualPrice: 0,
      description: 'Idéal pour les producteurs débutants souhaitant tester la plateforme sans engagement.'
    },
    standard: {
      id: 'standard',
      name: 'Standard',
      subtitle: 'Professionnel',
      monthlyPrice: 3000,
      annualPrice: 25000,
      description: 'Idéal pour les petits producteurs, coopératives ou transformateurs souhaitant développer leur visibilité et leurs ventes.'
    },
    premium: {
      id: 'premium',
      name: 'Premium',
      subtitle: 'Export & Croissance',
      monthlyPrice: 10000,
      annualPrice: 75000,
      description: 'Idéal pour les producteurs structurés, coopératives sérieuses, distributeurs et exportateurs.'
    }
  };

  const selectedPlan = plans[planId] || plans.standard;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/payment/subscription/${planId}` } });
    }
  }, [isAuthenticated, navigate, planId]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price);
  };

  const getPrice = () => {
    return billingPeriod === 'monthly' ? selectedPlan.monthlyPrice : selectedPlan.annualPrice;
  };

  const getDiscount = () => {
    if (billingPeriod === 'annual' && selectedPlan.monthlyPrice > 0) {
      const monthlyTotal = selectedPlan.monthlyPrice * 12;
      const discount = monthlyTotal - selectedPlan.annualPrice;
      const discountPercent = Math.round((discount / monthlyTotal) * 100);
      return { amount: discount, percent: discountPercent };
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedPlan.monthlyPrice === 0 && selectedPlan.id === 'gratuit') {
      // Pour le plan gratuit, on peut directement activer sans paiement
      try {
        setIsSubmitting(true);
        await subscriptionService.activateFreePlan('gratuit');
        navigate('/dashboard', { state: { message: 'Plan gratuit activé avec succès!' } });
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors de l\'activation du plan');
        setIsSubmitting(false);
      }
      return;
    }

    if (paymentMethod === 'cash') {
      // Pour le paiement cash, créer une souscription en attente
      try {
        setIsSubmitting(true);
        await subscriptionService.createSubscription({
          planId: selectedPlan.id,
          billingPeriod,
          paymentMethod: 'cash',
          amount: getPrice(),
          currency: 'XAF'
        });
        navigate('/dashboard', { 
          state: { 
            message: `Souscription ${selectedPlan.name} créée! Vous serez contacté pour le paiement.` 
          } 
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors de la création de la souscription');
        setIsSubmitting(false);
      }
    } else if (paymentMethod === 'paypal') {
      // Pour PayPal, afficher le modal au lieu de rediriger
      setShowPayPalModal(true);
      setIsSubmitting(false);
    }
  };

  // Fonctions PayPal
  const handleFallbackPayment = useCallback(async () => {
    try {
      setPaymentProcessing(true);
      setPaymentError(null);
      const amount = getPrice();
      
      const response = await paymentService.initiatePayment({
        type: 'subscription',
        planId: selectedPlan.id,
        billingPeriod,
        amount,
        currency: 'XAF',
        method: 'paypal',
        returnUrl: `${window.location.origin}/payments/paypal/success?type=subscription&planId=${selectedPlan.id}`,
        cancelUrl: `${window.location.origin}/payments/paypal/cancel?type=subscription&planId=${selectedPlan.id}`
      });

      if (response.data?.data?.approvalUrl) {
        sessionStorage.setItem(`harvests_subscription_${selectedPlan.id}`, JSON.stringify({
          planId: selectedPlan.id,
          billingPeriod,
          amount
        }));
        window.location.href = response.data.data.approvalUrl;
      } else {
        setPaymentError("Lien PayPal introuvable. Réessayez plus tard.");
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Erreur lors de l\'initiation du paiement.';
      setPaymentError(message);
    } finally {
      setPaymentProcessing(false);
    }
  }, [selectedPlan.id, billingPeriod, getPrice]);

  // Créer une commande PayPal pour les boutons PayPal (avec redirection)
  const createPayPalOrder = useCallback(async () => {
    try {
      setPaymentProcessing(true);
      setPaymentError(null);

      const amount = getPrice();
      const origin = window.location.origin;
      const response = await paymentService.initiatePayment({
        type: 'subscription',
        planId: selectedPlan.id,
        billingPeriod,
        amount,
        currency: 'XAF',
        method: 'paypal',
        returnUrl: `${origin}/payments/paypal/success?type=subscription&planId=${selectedPlan.id}`,
        cancelUrl: `${origin}/payments/paypal/cancel?type=subscription&planId=${selectedPlan.id}`
      });

      const payload = response.data?.data;
      const paymentId = payload?.payment?.paymentId || payload?.payment?.id || payload?.paymentId || null;

      paymentIdRef.current = paymentId;
      if (paymentId) {
        sessionStorage.setItem(`harvests_subscription_payment_${selectedPlan.id}`, paymentId);
      }

      if (!payload?.paypalOrderId) {
        throw new Error('Identifiant PayPal introuvable.');
      }

      return payload.paypalOrderId;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Impossible de contacter PayPal pour le moment.';
      setPaymentError(message);
      setPaymentProcessing(false);
      throw err;
    }
  }, [selectedPlan.id, billingPeriod, getPrice]);

  // Créer une commande PayPal pour les Hosted Fields
  // Retourner directement l'orderId créé côté serveur (sans utiliser actions.order.create())
  // eslint-disable-next-line no-unused-vars
  const createPayPalOrderForHostedFields = useCallback(async (data, actions) => {
    // Si l'orderId a déjà été créé au clic sur "Carte bancaire", le retourner directement
    // Cela évite d'utiliser actions.order.create() qui peut déclencher une redirection
    if (hostedFieldsOrderId) {
      return hostedFieldsOrderId;
    }
    
    // Fallback: créer l'ordre si nécessaire (ne devrait pas arriver normalement)
    try {
      const amount = getPrice();
      const response = await paymentService.createOrderForHostedFields({
        type: 'subscription',
        planId: selectedPlan.id,
        billingPeriod,
        amount,
        currency: 'XAF'
      });

      const payload = response.data?.data;
      const paymentId = payload?.paymentId || null;
      const orderId = payload?.paypalOrderId || null;

      if (!orderId) {
        throw new Error('Identifiant PayPal introuvable.');
      }

      if (paymentId) {
        paymentIdRef.current = paymentId;
        sessionStorage.setItem(`harvests_subscription_payment_${selectedPlan.id}`, paymentId);
      }
      
      setHostedFieldsOrderId(orderId);
      return orderId;
    } catch (err) {
      console.error('Erreur lors de la création de la commande PayPal:', err);
      throw err;
    }
  }, [selectedPlan.id, billingPeriod, getPrice, hostedFieldsOrderId]);

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
      setShowPayPalModal(false);
      navigate(`/payments/paypal/success?type=subscription&planId=${selectedPlan.id}&paymentId=${paymentId}&paypalOrderId=${data.orderID}`);
    } catch (err) {
      console.error('Erreur PayPal lors de la confirmation:', err);
      const message = err.response?.data?.message || err.message || 'Erreur lors de la confirmation du paiement.';
      setPaymentError(message);
    } finally {
      setPaymentProcessing(false);
    }
  }, [selectedPlan.id, navigate]);

  const handleCardPaymentApprove = useCallback(async (orderId) => {
    try {
      const paymentId = paymentIdRef.current || sessionStorage.getItem(`harvests_subscription_payment_${selectedPlan.id}`);

      if (!paymentId) {
        throw new Error('Identifiant du paiement introuvable.');
      }

      await paymentService.confirmPayment(paymentId, { paypalOrderId: orderId });
      sessionStorage.setItem(`harvests_subscription_confirmed_${selectedPlan.id}`, 'true');
      sessionStorage.setItem(`harvests_subscription_paypal_order_${selectedPlan.id}`, orderId);
      setPaymentError(null);
      setShowCardForm(false);
      setShowPayPalModal(false);
      setPaymentProcessing(false);
      
      // Rediriger vers le dashboard avec un message de succès
      navigate('/dashboard', { 
        state: { 
          message: `Paiement réussi ! Votre abonnement ${selectedPlan.name} a été activé.` 
        } 
      });
    } catch (err) {
      console.error('Erreur lors de la confirmation du paiement par carte:', err);
      const message = err.response?.data?.message || err.message || 'Erreur lors de la confirmation du paiement.';
      setPaymentError(message);
      setPaymentProcessing(false);
      throw err;
    }
  }, [selectedPlan.id, navigate]);

  const handleHostedFieldsSubmit = useCallback(async (cardFieldsInstance) => {
    try {
      setPaymentProcessing(true);
      setPaymentError(null);

      const state = cardFieldsInstance.getState();
      if (!state?.isFormValid) {
        throw new Error('Veuillez compléter toutes les informations de carte.');
      }

      // Pour les abonnements, PayPal peut forcer une redirection même avec Hosted Fields
      // On essaie sans contingencies d'abord, puis avec si nécessaire
      let orderId;
      try {
        const result = await cardFieldsInstance.submit({
          contingencies: ['3D_SECURE']
        });
        orderId = result.orderId;
      } catch (threeDSecureError) {
        // Si 3D Secure échoue, essayer sans contingencies
        console.warn('3D Secure error, trying without contingencies:', threeDSecureError);
        const result = await cardFieldsInstance.submit({});
        orderId = result.orderId;
      }

      await handleCardPaymentApprove(orderId);
      return { success: true };
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Paiement refusé. Veuillez vérifier votre carte.';
      setPaymentError(message);
      setPaymentProcessing(false);
      return { error: message };
    }
  }, [handleCardPaymentApprove]);

  const handlePayPalCancel = useCallback(() => {
    setPaymentError('Paiement annulé. Vous pouvez réessayer.');
    setPaymentProcessing(false);
  }, []);

  const handlePayPalError = useCallback((err) => {
    console.error('Erreur PayPal:', err);
    setPaymentError(err?.message || 'Erreur PayPal inattendue.');
    setPaymentProcessing(false);
  }, []);

  // Charger le token PayPal client
  useEffect(() => {
    if ((!showPayPalModal && !showCardForm) || !paypalClientId || paymentMethod !== 'paypal') {
      return;
    }

    let isMounted = true;

    const loadClientToken = async () => {
      try {
        setPaypalTokenLoading(true);
        setPaypalTokenError(null);

        const response = await paymentService.getClientToken();
        const token = response.data?.data?.clientToken || response.data?.clientToken || null;

        if (isMounted) {
          setPaypalClientToken(token);
        }
      } catch (error) {
        if (isMounted) {
          const message = error.response?.data?.message || error.message || 'Impossible de récupérer le token PayPal.';
          setPaypalTokenError(message);
        }
      } finally {
        if (isMounted) {
          setPaypalTokenLoading(false);
        }
      }
    };

    loadClientToken();

    return () => {
      isMounted = false;
    };
  }, [showPayPalModal, showCardForm, paypalClientId, paymentMethod]);

  const paypalOptions = useMemo(() => {
    if (!paypalClientId) {
      return null;
    }

    const options = {
      'client-id': paypalClientId,
      currency: paypalCurrency,
      intent: 'capture',
      components: paypalClientToken ? 'buttons,hosted-fields' : 'buttons'
      // Configuration minimale - pas de enable-funding/disable-funding pour les Hosted Fields
    };

    if (paypalClientToken) {
      options['data-client-token'] = paypalClientToken;
      options.dataClientToken = paypalClientToken;
    }

    return options;
  }, [paypalClientId, paypalCurrency, paypalClientToken]);

  if (!isAuthenticated) {
    return null;
  }

  const price = getPrice();
  const discount = getDiscount();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <button
          onClick={() => navigate('/pricing')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <FiArrowLeft className="mr-2" />
          Retour aux tarifs
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Plan Summary */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-8">
            <h1 className="text-3xl font-bold mb-2">Souscription {selectedPlan.name}</h1>
            <p className="text-lg opacity-90">{selectedPlan.subtitle}</p>
            <p className="mt-4 opacity-80">{selectedPlan.description}</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {/* Billing Period Selection */}
            {selectedPlan.monthlyPrice > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FiCalendar className="mr-2" />
                  Période de facturation
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setBillingPeriod('monthly')}
                    className={`p-6 border-2 rounded-lg text-left transition ${
                      billingPeriod === 'monthly'
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-lg mb-1">Mensuel</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatPrice(selectedPlan.monthlyPrice)} FCFA
                    </div>
                    <div className="text-sm text-gray-600 mt-1">par mois</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingPeriod('annual')}
                    className={`p-6 border-2 rounded-lg text-left transition relative ${
                      billingPeriod === 'annual'
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {discount && (
                      <span className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                        -{discount.percent}%
                      </span>
                    )}
                    <div className="font-semibold text-lg mb-1">Annuel</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatPrice(selectedPlan.annualPrice)} FCFA
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {discount && (
                        <span className="line-through text-gray-400 mr-2">
                          {formatPrice(selectedPlan.monthlyPrice * 12)}
                        </span>
                      )}
                      par an
                    </div>
                    {discount && (
                      <div className="text-sm text-green-600 font-medium mt-2">
                        Économisez {formatPrice(discount.amount)} FCFA
                      </div>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Payment Method Selection */}
            {price > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FiCreditCard className="mr-2" />
                  Méthode de paiement
                </h2>
                <div className="space-y-4">
                  {[
                    { 
                      value: 'cash', 
                      label: 'Paiement à la livraison', 
                      icon: '💵', 
                      description: 'Vous serez contacté pour finaliser le paiement en espèces ou par mobile money.' 
                    },
                    { 
                      value: 'paypal', 
                      label: 'PayPal ou Carte bancaire', 
                      icon: '🅿️', 
                      description: 'Payer en ligne via votre compte PayPal ou Carte bancaire, de façon sécurisée.' 
                    }
                  ].map((method) => (
                    <label
                      key={method.value}
                      className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition ${
                        paymentMethod === method.value
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={paymentMethod === method.value}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-4 w-4 text-green-600 focus:ring-green-600 mt-1"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{method.icon}</span>
                          <span className="text-sm font-medium text-gray-900">{method.label}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{method.description}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {paymentMethod === 'cash' && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start">
                      <FiInfo className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-green-800">Paiement à la livraison</h3>
                        <p className="text-sm text-green-700 mt-1">
                          Notre équipe vous contactera dans les 24 heures pour finaliser votre souscription et organiser le paiement.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'paypal' && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start">
                      <FiShield className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-blue-800">Paiement sécurisé via PayPal</h3>
                        <p className="text-sm text-blue-700 mt-1">
                          Après validation, vous serez redirigé vers PayPal pour autoriser le paiement. Aucune information sensible n'est stockée par Harvests.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">Résumé de la souscription</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan</span>
                  <span className="font-medium">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Période</span>
                  <span className="font-medium">
                    {billingPeriod === 'monthly' ? 'Mensuel' : 'Annuel'}
                  </span>
                </div>
                {discount && (
                  <div className="flex justify-between text-green-600">
                    <span>Remise</span>
                    <span>-{formatPrice(discount.amount)} FCFA</span>
                  </div>
                )}
                <hr className="my-3" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(price)} FCFA</span>
                </div>
                {billingPeriod === 'monthly' && price > 0 && (
                  <div className="text-sm text-gray-500 text-right">
                    Facturé mensuellement
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <FiAlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Traitement en cours...
                </>
              ) : price === 0 ? (
                'Activer le plan gratuit'
              ) : paymentMethod === 'cash' ? (
                'Confirmer la souscription'
              ) : (
                'Procéder au paiement'
              )}
            </button>

            {/* Security Notice */}
            <div className="mt-6 text-center text-sm text-gray-500 flex items-center justify-center">
              <FiShield className="mr-2" />
              Paiement sécurisé et crypté
            </div>
          </form>
        </div>

        {/* PayPal Modal */}
        {showPayPalModal && !showCardForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-lg p-6 max-w-lg w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  PayPal ou Carte bancaire
                </h2>
                <button
                  onClick={() => {
                    setShowPayPalModal(false);
                    setPaymentError(null);
                    setPaymentProcessing(false);
                    setShowCardForm(false);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              <div className="border-2 border-green-500 rounded-xl bg-green-50 p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-green-900">
                      Credit card or PayPal
                    </h3>
                    <p className="text-sm text-green-800 mt-1">
                      Pay securely with Credit card or PayPal
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

                {!paypalClientId ? (
                  <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3">
                    Configuration PayPal manquante. Veuillez définir <code>VITE_PAYPAL_CLIENT_ID</code>.
                    <div className="mt-3">
                      <button
                        onClick={handleFallbackPayment}
                        disabled={paymentProcessing}
                        className="w-full bg-[#003087] hover:bg-[#001f5c] text-white font-semibold rounded-lg py-3 transition disabled:opacity-50"
                      >
                        {paymentProcessing ? 'Redirection…' : 'Continuer vers PayPal'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {paypalOptions ? (
                      <PayPalScriptProvider
                        key={paypalClientToken ? `paypal-with-hosted-fields-${paypalClientToken}` : 'paypal-buttons-only'}
                        options={paypalOptions}
                      >
                      <div className="space-y-4">
                        {/* Bouton Carte bancaire */}
                        <button
                          onClick={async () => {
                            try {
                              setPaymentProcessing(true);
                              setPaymentError(null);
                              
                              // Créer l'ordre PayPal AVANT d'afficher le formulaire (via backend)
                              const amount = getPrice();
                              const response = await paymentService.createOrderForHostedFields({
                                type: 'subscription',
                                planId: selectedPlan.id,
                                billingPeriod,
                                amount,
                                currency: 'XAF'
                              });

                              const payload = response.data?.data;
                              const paymentId = payload?.paymentId || null;
                              const orderId = payload?.paypalOrderId || null;

                              if (!orderId) {
                                throw new Error('Identifiant PayPal introuvable.');
                              }

                              // Sauvegarder le paymentId et l'orderId
                              if (paymentId) {
                                paymentIdRef.current = paymentId;
                                sessionStorage.setItem(`harvests_subscription_payment_${selectedPlan.id}`, paymentId);
                              }
                              setHostedFieldsOrderId(orderId);
                              
                              // Afficher le formulaire
                              setShowCardForm(true);
                              setPaymentProcessing(false);
                            } catch (err) {
                              const message = err.response?.data?.message || err.message || 'Impossible de créer la commande PayPal.';
                              setPaymentError(message);
                              setPaymentProcessing(false);
                            }
                          }}
                          className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg py-3 px-4 flex items-center justify-center gap-2 transition disabled:opacity-50"
                          disabled={paymentProcessing || !paypalClientToken}
                        >
                          <FiCreditCard className="h-5 w-5" />
                          {paymentProcessing ? 'Préparation...' : 'Carte bancaire'}
                        </button>

                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">ou</span>
                          </div>
                        </div>

                          <PayPalButtons
                            style={{ layout: 'vertical', shape: 'rect', color: 'gold' }}
                            createOrder={createPayPalOrder}
                            onApprove={handlePayPalApprove}
                            onCancel={handlePayPalCancel}
                            onError={handlePayPalError}
                            disabled={paymentProcessing}
                            forceReRender={[selectedPlan.id, paypalClientToken]}
                          />

                          {paypalTokenLoading && !paypalClientToken && (
                            <div className="text-sm text-gray-600 bg-white border border-gray-200 rounded-md p-3">
                              Chargement du formulaire carte sécurisé…
                            </div>
                          )}

                          {paypalTokenError && !paypalClientToken && (
                            <div className="bg-orange-50 border border-orange-200 text-orange-700 text-sm rounded-lg p-3 space-y-3">
                              <p>{paypalTokenError}</p>
                              <button
                                onClick={handleFallbackPayment}
                                disabled={paymentProcessing}
                                className="w-full bg-[#003087] hover:bg-[#001f5c] text-white font-semibold rounded-lg py-2.5 transition disabled:opacity-50"
                              >
                                Continuer vers PayPal
                              </button>
                            </div>
                          )}
                        </div>
                      </PayPalScriptProvider>
                    ) : (
                      <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3">
                        Impossible d'initialiser PayPal pour le moment. Utilisez le bouton ci-dessous.
                        <div className="mt-3">
                          <button
                            onClick={handleFallbackPayment}
                            disabled={paymentProcessing}
                            className="w-full bg-[#003087] hover:bg-[#001f5c] text-white font-semibold rounded-lg py-3 transition disabled:opacity-50"
                          >
                            {paymentProcessing ? 'Redirection…' : 'Continuer vers PayPal'}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

              <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-600">
                <FiLock className="h-4 w-4" />
                <span>Paiement sécurisé protégé par cryptage SSL</span>
              </div>

              {paymentProcessing && (
                <div className="mt-4 bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-lg p-3">
                  Préparation de la fenêtre de paiement…
                </div>
              )}

              {paymentError && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3">
                  {paymentError}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Formulaire Carte Bancaire Simplifié */}
        {showCardForm && paypalClientToken && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full border-2 border-green-200">
              {/* En-tête vert */}
              <div className="bg-green-50 border-b-2 border-green-500 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FiCreditCard className="h-5 w-5 text-green-800" />
                  <div>
                    <h3 className="text-sm font-bold text-green-900">Credit card or PayPal</h3>
                    <p className="text-xs text-green-800">Pay securely with Credit card or PayPal</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-green-600 flex items-center justify-center">
                    <FiCheck className="h-3 w-3 text-white" />
                  </div>
                <button
                  onClick={() => {
                    setShowCardForm(false);
                    setPaymentError(null);
                    setHostedFieldsOrderId(null); // Réinitialiser l'orderId
                  }}
                  className="text-gray-400 hover:text-gray-600 ml-2"
                >
                  <FiX className="h-5 w-5" />
                </button>
                </div>
              </div>

              <div className="p-4">
                {/* Note importante pour les abonnements */}
                <div className="mb-4 bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
                  <p className="font-semibold mb-1">Note importante :</p>
                  <p>Pour les abonnements, PayPal peut ouvrir une fenêtre sécurisée pour l'authentification 3D Secure de votre banque. C'est normal et sécurisé.</p>
                </div>

                {paypalOptions && (
                  <PayPalScriptProvider
                    key={`paypal-with-hosted-fields-${paypalClientToken}`}
                    options={paypalOptions}
                  >
                    {hostedFieldsOrderId ? (
                      <PayPalHostedFieldsProvider
                        createOrder={() => Promise.resolve(hostedFieldsOrderId)}
                        styles={{
                          '.valid': { color: '#16a34a' },
                          '.invalid': { color: '#dc2626' },
                          input: {
                            fontSize: '16px',
                            color: '#111827'
                          }
                        }}
                      >
                        <SimplifiedCardForm
                          user={user}
                          onSubmit={handleHostedFieldsSubmit}
                          isProcessing={paymentProcessing}
                          price={price}
                        />
                      </PayPalHostedFieldsProvider>
                    ) : (
                      <div className="text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded-md p-3">
                        Préparation du formulaire de paiement...
                      </div>
                    )}
                  </PayPalScriptProvider>
                )}

                {paymentError && (
                  <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3">
                    {paymentError}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Composant Formulaire Carte Simplifié avec pré-remplissage
const SimplifiedCardForm = ({ user, onSubmit, isProcessing, price }) => {
  const { cardFields } = usePayPalHostedFields();
  const [localError, setLocalError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Pré-remplir les informations utilisateur
  const getInitialBillingData = () => {
    if (!user) {
      return {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        country: 'SN',
        postalCode: ''
      };
    }

    // Récupérer le pays (peut être un code ou un nom)
    let country = user?.country || 'SN';
    if (typeof country === 'string' && country.length > 2) {
      // Si c'est un nom de pays, le convertir en code
      const countryMap = {
        'Sénégal': 'SN',
        'Senegal': 'SN',
        'Mali': 'ML',
        'Burkina Faso': 'BF',
        'Côte d\'Ivoire': 'CI',
        'Guinée': 'GN',
        'Mauritanie': 'MR',
        'Gambie': 'GM',
        'Guinée-Bissau': 'GW'
      };
      country = countryMap[country] || 'SN';
    }

    return {
      firstName: user?.firstName || user?.firstname || '',
      lastName: user?.lastName || user?.lastname || '',
      email: user?.email || '',
      phone: user?.phone || user?.phoneNumber || user?.mobile || '',
      country: country,
      postalCode: user?.postalCode || user?.postal_code || user?.address?.postalCode || user?.address?.postal_code || ''
    };
  };

  const [billingData, setBillingData] = useState(getInitialBillingData());

  // Mettre à jour les données quand l'utilisateur change
  useEffect(() => {
    const newData = getInitialBillingData();
    setBillingData(newData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!cardFields) {
      setLocalError('Le formulaire de carte est en cours de préparation. Réessayez dans un instant.');
      return;
    }

    const state = cardFields.getState();
    if (!state?.isFormValid) {
      setLocalError('Veuillez compléter toutes les informations de carte.');
      return;
    }

    setSubmitting(true);
    const result = await onSubmit(cardFields);
    if (result?.error) {
      setLocalError(result.error);
    } else {
      setLocalError(null);
    }
    setSubmitting(false);
  };

  const isDisabled = isProcessing || submitting || !cardFields;

  // Obtenir le code pays pour les drapeaux (nécessaire pour PayPal)
  const countryCode = billingData.country ? getCountryCode(billingData.country) : 'SN';

  // Obtenir le drapeau du pays
  const getCountryFlag = (code) => {
    const flags = {
      'SN': '🇸🇳',
      'ML': '🇲🇱',
      'BF': '🇧🇫',
      'CI': '🇨🇮',
      'GN': '🇬🇳',
      'MR': '🇲🇷',
      'GM': '🇬🇲',
      'GW': '🇬🇼'
    };
    return flags[code] || '🌍';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Informations de carte */}
      <div className="space-y-3">
        <div>
          <PayPalHostedField
            id="card-number"
            className="paypal-hosted-field block w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            hostedFieldType="number"
            options={{
              selector: '#card-number',
              placeholder: 'Numéro de carte'
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <PayPalHostedField
              id="card-expiration"
              className="paypal-hosted-field block w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              hostedFieldType="expirationDate"
              options={{
                selector: '#card-expiration',
                placeholder: 'Expire'
              }}
            />
          </div>
          <div>
            <PayPalHostedField
              id="card-cvv"
              className="paypal-hosted-field block w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              hostedFieldType="cvv"
              options={{
                selector: '#card-cvv',
                placeholder: 'Crypto. visuel'
              }}
            />
          </div>
        </div>
      </div>

      {/* Adresse de facturation */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-900">Adresse de facturation</h4>
          <div className="flex items-center gap-1.5">
            <span className="text-lg">{getCountryFlag(countryCode)}</span>
            <select
              value={countryCode}
              onChange={(e) => setBillingData({ ...billingData, country: e.target.value })}
              className="text-sm text-gray-700 bg-transparent border-none focus:outline-none cursor-pointer"
            >
              <option value="SN">SN</option>
              <option value="ML">ML</option>
              <option value="BF">BF</option>
              <option value="CI">CI</option>
              <option value="GN">GN</option>
              <option value="MR">MR</option>
              <option value="GM">GM</option>
              <option value="GW">GW</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <input
            type="text"
            id="billing-firstname"
            value={billingData.firstName}
            onChange={(e) => setBillingData({ ...billingData, firstName: e.target.value })}
            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Prénom"
          />
          <input
            type="text"
            id="billing-lastname"
            value={billingData.lastName}
            onChange={(e) => setBillingData({ ...billingData, lastName: e.target.value })}
            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Nom"
          />
        </div>

        <div className="mb-3">
          <input
            type="text"
            id="billing-postal"
            value={billingData.postalCode}
            onChange={(e) => setBillingData({ ...billingData, postalCode: e.target.value })}
            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Code postal"
          />
        </div>

        <div className="mb-3">
          <input
            type="tel"
            id="billing-phone"
            value={billingData.phone}
            onChange={(e) => setBillingData({ ...billingData, phone: e.target.value })}
            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Mobile"
          />
        </div>

        <div>
          <input
            type="email"
            id="billing-email"
            value={billingData.email}
            onChange={(e) => setBillingData({ ...billingData, email: e.target.value })}
            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Email"
          />
        </div>
      </div>

      {/* Texte légal */}
      <div className="text-xs text-gray-600 mt-3">
        Vous reconnaissez avoir pris connaissance des conditions dans lesquelles PayPal fournit le service au vendeur et vous acceptez la{' '}
        <a href="#" className="text-blue-600 hover:underline">Politique de confidentialité</a>.
        Aucun compte PayPal n'est requis.
      </div>

      {localError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-md p-3">
          {localError}
        </div>
      )}

      <button
        type="submit"
        disabled={isDisabled}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-3 px-4 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isProcessing || submitting ? 'Traitement…' : `Payer $${((price || 0) / 600).toFixed(2)}`}
      </button>
    </form>
  );
};

// Composant CardHostedFieldsForm (conservé pour compatibilité)
const CardHostedFieldsForm = ({ onSubmit, disabled, isProcessing }) => {
  const { cardFields } = usePayPalHostedFields();
  const [localError, setLocalError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!cardFields) {
      setLocalError('Le formulaire de carte est en cours de préparation. Réessayez dans un instant.');
      return;
    }

    const state = cardFields.getState();
    if (!state?.isFormValid) {
      setLocalError('Veuillez compléter toutes les informations de carte.');
      return;
    }

    setSubmitting(true);
    const result = await onSubmit(cardFields);
    if (result?.error) {
      setLocalError(result.error);
    } else {
      setLocalError(null);
    }
    setSubmitting(false);
  };

  const isDisabled = disabled || isProcessing || submitting || !cardFields;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <h4 className="text-sm font-semibold text-gray-900">Paiement par carte bancaire</h4>

      <div className="space-y-3">
        <div className="space-y-1">
          <label htmlFor="card-number" className="block text-sm font-medium text-gray-700">
            Numéro de carte
          </label>
          <PayPalHostedField
            id="card-number"
            className="paypal-hosted-field block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition"
            hostedFieldType="number"
            options={{
              selector: '#card-number',
              placeholder: '0000 0000 0000 0000'
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label htmlFor="card-expiration" className="block text-sm font-medium text-gray-700">
              Date d'expiration
            </label>
            <PayPalHostedField
              id="card-expiration"
              className="paypal-hosted-field block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition"
              hostedFieldType="expirationDate"
              options={{
                selector: '#card-expiration',
                placeholder: 'MM / AA'
              }}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="card-cvv" className="block text-sm font-medium text-gray-700">
              Cryptogramme visuel
            </label>
            <PayPalHostedField
              id="card-cvv"
              className="paypal-hosted-field block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition"
              hostedFieldType="cvv"
              options={{
                selector: '#card-cvv',
                placeholder: '123'
              }}
            />
          </div>
        </div>
      </div>

      {localError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-md p-3">
          {localError}
        </div>
      )}

      <button
        type="submit"
        disabled={isDisabled}
        className="w-full inline-flex items-center justify-center rounded-md bg-harvests-green px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isProcessing || submitting ? 'Traitement…' : 'Payer avec cette carte'}
      </button>
    </form>
  );
};

export default SubscriptionPayment;

