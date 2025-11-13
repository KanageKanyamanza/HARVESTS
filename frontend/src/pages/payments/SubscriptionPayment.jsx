import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { paymentService, subscriptionService } from '../../services';
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
  const paymentIdRef = useRef(null);
  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  const paypalCurrency = 'USD';
  const [paypalClientToken, setPaypalClientToken] = useState(null);
  const [paypalTokenLoading, setPaypalTokenLoading] = useState(false);
  const [paypalTokenError, setPaypalTokenError] = useState(null);

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

  const handleHostedFieldsSubmit = useCallback(async (cardFieldsInstance) => {
    try {
      setPaymentProcessing(true);
      setPaymentError(null);

      const state = cardFieldsInstance.getState();
      if (!state?.isFormValid) {
        throw new Error('Veuillez compléter toutes les informations de carte.');
      }

      const { orderId } = await cardFieldsInstance.submit({
        contingencies: ['3D_SECURE']
      });

      await handlePayPalApprove({ orderID: orderId });
      return { success: true };
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Paiement refusé. Veuillez vérifier votre carte.';
      setPaymentError(message);
      setPaymentProcessing(false);
      return { error: message };
    }
  }, [handlePayPalApprove]);

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
    if (!showPayPalModal || !paypalClientId || paymentMethod !== 'paypal') {
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
  }, [showPayPalModal, paypalClientId, paymentMethod]);

  const paypalOptions = useMemo(() => {
    if (!paypalClientId) {
      return null;
    }

    const options = {
      'client-id': paypalClientId,
      currency: paypalCurrency,
      components: paypalClientToken ? 'buttons,hosted-fields' : 'buttons'
    };

    if (paypalClientToken) {
      options['data-client-token'] = paypalClientToken;
      options.dataClientToken = paypalClientToken;
      options.intent = 'capture';
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
        {showPayPalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  PayPal ou Carte bancaire
                </h2>
                <button
                  onClick={() => {
                    setShowPayPalModal(false);
                    setPaymentError(null);
                    setPaymentProcessing(false);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              <div className="border-2 border-green-500 rounded-xl bg-green-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-green-900">
                      Sélectionnez votre mode de paiement
                    </h3>
                    <p className="text-sm text-green-800 mt-1">
                      Payez en toute sécurité avec Carte bancaire ou PayPal
                    </p>
                  </div>
                  <FiCreditCard className="h-6 w-6 text-green-800" />
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
                        <div className="mt-4 space-y-5">
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

                          {paypalClientToken && (
                            <PayPalHostedFieldsProvider
                              createOrder={createPayPalOrder}
                              styles={{
                                '.valid': { color: '#16a34a' },
                                '.invalid': { color: '#dc2626' },
                                input: {
                                  fontSize: '16px',
                                  color: '#111827'
                                }
                              }}
                            >
                              <CardHostedFieldsForm
                                onSubmit={handleHostedFieldsSubmit}
                                disabled={!showPayPalModal}
                                isProcessing={paymentProcessing}
                              />
                            </PayPalHostedFieldsProvider>
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
              </div>

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
      </div>
    </div>
  );
};

// Composant CardHostedFieldsForm
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

