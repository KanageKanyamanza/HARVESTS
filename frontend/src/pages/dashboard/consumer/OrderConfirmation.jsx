import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { consumerService, orderService, paymentService } from '../../../services';
import { parseProductName } from '../../../utils/productUtils';
import {
  PayPalScriptProvider,
  PayPalButtons,
  PayPalHostedFieldsProvider,
  PayPalHostedField,
  usePayPalHostedFields
} from '@paypal/react-paypal-js';
import {
  FiCheckCircle,
  FiClock,
  FiTruck,
  FiMapPin,
  FiCreditCard,
  FiShoppingBag,
  FiArrowRight,
  FiDownload,
  FiShare2,
  FiHome,
  FiPackage,
  FiUser,
  FiPhone,
  FiLock
} from 'react-icons/fi';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const paymentIdRef = useRef(null);
  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  const paypalCurrency = 'USD';
  const [paypalClientToken, setPaypalClientToken] = useState(null);
  const [paypalTokenLoading, setPaypalTokenLoading] = useState(false);
  const [paypalTokenError, setPaypalTokenError] = useState(null);
  const orderKey = order?._id || order?.id || null;

  const fetchOrder = useCallback(async () => {
    if (!orderId) {
      setError('ID de commande manquant');
      setLoading(false);
      return;
    }

    if (!isAuthenticated) {
      setError('Vous devez être connecté pour voir cette commande');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let response;

      if (['consumer', 'restaurateur'].includes(user?.userType)) {
        try {
          response = await consumerService.getMyOrder(orderId);
          if (response.data.status === 'success') {
            setOrder(response.data.data?.order || response.data.order);
            setPaymentProcessing(false);
            return;
          }
        } catch (consumerError) {
          console.log('Erreur avec consumerService, essai avec orderService:', consumerError);
        }
      }

      response = await orderService.getOrder(orderId);
      if (response.data.status === 'success') {
        setOrder(response.data.data?.order || response.data.order);
      } else {
        setError('Commande non trouvée');
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la commande:', error);
      if (error.response?.status === 404) {
        setError('Commande introuvable');
      } else if (error.response?.status === 403) {
        setError('Vous n\'avez pas l\'autorisation de voir cette commande');
      } else {
        setError('Erreur lors du chargement de la commande');
      }
    } finally {
      setLoading(false);
      setPaymentProcessing(false);
    }
  }, [orderId, isAuthenticated, user]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const getStatusConfig = (status) => {
    const configs = {
      'pending': { 
        color: 'text-yellow-600 bg-yellow-100', 
        text: 'En attente', 
        icon: FiClock 
      },
      'confirmed': { 
        color: 'text-blue-600 bg-blue-100', 
        text: 'Confirmée', 
        icon: FiCheckCircle 
      },
      'processing': { 
        color: 'text-purple-600 bg-purple-100', 
        text: 'En préparation', 
        icon: FiPackage 
      },
      'shipped': { 
        color: 'text-indigo-600 bg-indigo-100', 
        text: 'Expédiée', 
        icon: FiTruck 
      },
      'delivered': { 
        color: 'text-green-600 bg-green-100', 
        text: 'Livrée', 
        icon: FiCheckCircle 
      },
      'cancelled': { 
        color: 'text-red-600 bg-red-100', 
        text: 'Annulée', 
        icon: FiClock 
      }
    };
    return configs[status] || configs['pending'];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownloadInvoice = () => {
    // TODO: Implémenter le téléchargement de la facture
    console.log('Téléchargement de la facture pour la commande:', orderId);
  };

  const handleShareOrder = () => {
    if (navigator.share) {
      navigator.share({
        title: `Commande #${order?.orderNumber}`,
        text: `Ma commande sur Harvests - ${order?.items?.length} article(s)`,
        url: window.location.href
      });
    } else {
      // Fallback: copier le lien
      navigator.clipboard.writeText(window.location.href);
      // Ici on pourrait afficher une notification
    }
  };

  const handleFallbackPayment = useCallback(async () => {
    if (!orderKey) {
      setPaymentError('Commande introuvable.');
      return;
    }

    try {
      setPaymentProcessing(true);
      setPaymentError(null);

      const origin = window.location.origin;
      const response = await paymentService.initiatePayment({
        orderId: orderKey,
        method: 'paypal',
        returnUrl: `${origin}/payments/paypal/success?orderId=${orderKey}`,
        cancelUrl: `${origin}/payments/paypal/cancel?orderId=${orderKey}`
      });

      const payload = response.data?.data;
      const paymentId =
        payload?.payment?.paymentId ||
        payload?.payment?.id ||
        payload?.paymentId ||
        null;

      if (paymentId) {
        sessionStorage.setItem(`harvests_paypal_payment_${orderKey}`, paymentId);
      }

      if (payload?.approvalUrl) {
        window.location.href = payload.approvalUrl;
        return;
      }

      setPaymentError("Lien PayPal introuvable. Réessayez plus tard.");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Erreur lors de l’initiation du paiement.';
      setPaymentError(message);
    } finally {
      setPaymentProcessing(false);
    }
  }, [orderKey]);

  const createPayPalOrder = useCallback(async () => {
    if (!orderKey) {
      throw new Error('Commande introuvable.');
    }

    try {
      setPaymentProcessing(true);
      setPaymentError(null);

      const origin = window.location.origin;
      const response = await paymentService.initiatePayment({
        orderId: orderKey,
        method: 'paypal',
        returnUrl: `${origin}/payments/paypal/success?orderId=${orderKey}`,
        cancelUrl: `${origin}/payments/paypal/cancel?orderId=${orderKey}`
      });

      const payload = response.data?.data;
      const paymentId =
        payload?.payment?.paymentId ||
        payload?.payment?.id ||
        payload?.paymentId ||
        null;

      paymentIdRef.current = paymentId;
      if (paymentId) {
        sessionStorage.setItem(`harvests_paypal_payment_${orderKey}`, paymentId);
      }

      if (!payload?.paypalOrderId) {
        throw new Error('Identifiant PayPal introuvable.');
      }

      return payload.paypalOrderId;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Impossible de contacter PayPal pour le moment.';
      setPaymentError(message);
      setPaymentProcessing(false);
      throw err;
    }
  }, [orderKey]);

  const handlePayPalApprove = useCallback(async (data) => {
    if (!orderKey) {
      setPaymentError('Commande introuvable.');
      setPaymentProcessing(false);
      return;
    }

    try {
      const paymentId =
        paymentIdRef.current ||
        sessionStorage.getItem(`harvests_paypal_payment_${orderKey}`);

      if (!paymentId) {
        throw new Error('Identifiant du paiement introuvable.');
      }

      await paymentService.confirmPayment(paymentId, { paypalOrderId: data.orderID });
      sessionStorage.setItem(`harvests_paypal_confirmed_${orderKey}`, 'true');
      await fetchOrder();
      setPaymentError(null);
      navigate(`/payments/paypal/success?orderId=${orderKey}&paymentId=${paymentId}`);
    } catch (err) {
      console.error('Erreur PayPal lors de la confirmation:', err);
      const message =
        err.response?.data?.message ||
        err.message ||
        'Erreur lors de la confirmation du paiement.';
      setPaymentError(message);
    } finally {
      setPaymentProcessing(false);
    }
  }, [fetchOrder, orderKey, navigate]);

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
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Paiement refusé. Veuillez vérifier votre carte.';
      setPaymentError(message);
      setPaymentProcessing(false);
      return { error: message };
    }
  }, [handlePayPalApprove]);

  const handlePayPalCancel = useCallback(() => {
    setPaymentError('Paiement annulé. Vous pouvez réessayer.');
    setPaymentProcessing(false);
    if (orderKey) {
      navigate(`/payments/paypal/cancel?orderId=${orderKey}`);
    }
  }, [navigate, orderKey]);

  const handlePayPalError = useCallback((err) => {
    console.error('Erreur PayPal:', err);
    setPaymentError(err?.message || 'Erreur PayPal inattendue.');
    setPaymentProcessing(false);
  }, []);

  const paymentStatus = (order?.payment?.status || '').toLowerCase();
  const isPaypalPayment = order?.payment?.method === 'paypal';
  const isPaypalPending = isPaypalPayment && !['succeeded', 'completed', 'paid'].includes(paymentStatus);
  const orderCurrency = (order?.currency || order?.payment?.currency || '').toUpperCase();
  const showCurrencyNotice = Boolean(orderCurrency) && orderCurrency !== paypalCurrency;

  useEffect(() => {
    if (!isPaypalPayment || !paypalClientId) {
      return;
    }

    let isMounted = true;

    const loadClientToken = async () => {
      try {
        setPaypalTokenLoading(true);
        setPaypalTokenError(null);

        const response = await paymentService.getClientToken();
        const token =
          response.data?.data?.clientToken ||
          response.data?.clientToken ||
          null;

        if (isMounted) {
          setPaypalClientToken(token);
        }
      } catch (error) {
        if (isMounted) {
          const message =
            error.response?.data?.message ||
            error.message ||
            'Impossible de récupérer le token PayPal.';
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
  }, [isPaypalPayment, paypalClientId]);

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

  if (loading) {
    return (
      <div>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="text-center py-12">
            <FiShoppingBag className="mx-auto h-16 w-16 text-gray-400" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              {error || 'Commande introuvable'}
            </h2>
            <p className="mt-2 text-gray-600">
              {error === 'Commande introuvable' 
                ? 'La commande demandée n\'existe pas ou vous n\'avez pas l\'autorisation de la voir.'
                : error === 'Vous devez être connecté pour voir cette commande'
                ? 'Veuillez vous connecter pour accéder à cette page.'
                : error === 'ID de commande manquant'
                ? 'L\'identifiant de la commande est manquant dans l\'URL.'
                : 'Une erreur est survenue lors du chargement de la commande.'
              }
            </p>
            <div className="mt-6 space-x-4">
              {error === 'Vous devez être connecté pour voir cette commande' ? (
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-harvests-green hover:bg-green-600"
                >
                  Se connecter
                </button>
              ) : (
                <button
                  onClick={() => navigate('/consumer/orders')}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-harvests-green hover:bg-green-600"
                >
                  <FiArrowRight className="mr-2 h-5 w-5" />
                  Voir mes commandes
                </button>
              )}
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-harvests-light"
              >
                <FiHome className="mr-2 h-5 w-5" />
                Accueil
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order?.status);
  const StatusIcon = statusConfig.icon;
  const deliveryDetail = order?.deliveryFeeDetail || order?.delivery?.feeDetail || null;
  const confirmedTotals = {
    subtotal: order?.subtotal ?? order?.originalTotals?.subtotal ?? 0,
    deliveryFee: order?.deliveryFee ?? order?.originalTotals?.deliveryFee ?? order?.delivery?.deliveryFee ?? 0,
    taxes: order?.taxes ?? order?.originalTotals?.taxes ?? 0,
    discount: order?.discount ?? order?.originalTotals?.discount ?? 0,
    total: order?.total ?? order?.originalTotals?.total ?? 0
  };
  const deliveryMethodLabels = {
    pickup: 'retrait sur place',
    'standard-delivery': 'livraison standard',
    'express-delivery': 'livraison express',
    'same-day': 'livraison jour même',
    'scheduled': 'livraison programmée'
  };

  return (
    <div>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <FiCheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Commande confirmée !
          </h1>
          <p className="text-gray-600">
            Votre commande a été passée avec succès. Vous recevrez un email de confirmation.
          </p>
        </div>

        {isPaypalPending && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-green-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              PayPal ou Carte bancaire
            </h2>
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
                      onClick={() => handleFallbackPayment()}
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
                          forceReRender={[orderKey, paypalClientToken]}
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
                              onClick={() => handleFallbackPayment()}
                              disabled={paymentProcessing}
                              className="w-full bg-[#003087] hover:bg-[#001f5c] text-white font-semibold rounded-lg py-2.5 transition disabled:opacity-50"
                            >
                              Continuer vers PayPal
                            </button>
                          </div>
                        )}

                        {paypalClientToken && typeof window !== 'undefined' && window.paypal && window.paypal.HostedFields ? (
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
                              disabled={!isPaypalPending}
                              isProcessing={paymentProcessing}
                            />
                          </PayPalHostedFieldsProvider>
                        ) : paypalClientToken ? (
                          <div className="text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded-md p-3">
                            Le formulaire de carte sécurisé est en cours de chargement...
                          </div>
                        ) : null}
                      </div>
                    </PayPalScriptProvider>
                  ) : (
                    <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3">
                      Impossible d'initialiser PayPal pour le moment. Utilisez le bouton ci-dessous.
                      <div className="mt-3">
                        <button
                          onClick={() => handleFallbackPayment()}
                          disabled={paymentProcessing}
                          className="w-full bg-[#003087] hover:bg-[#001f5c] text-white font-semibold rounded-lg py-3 transition disabled:opacity-50"
                        >
                          {paymentProcessing ? 'Redirection…' : 'Continuer vers PayPal'}
                        </button>
                      </div>
                    </div>
                  )}
                  {showCurrencyNotice && (
                    <div className="mt-3 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs rounded-lg p-3">
                      Devise de la commande ({orderCurrency || 'N/A'}) différente de la devise PayPal ({paypalCurrency}). Le paiement sera capturé en {paypalCurrency}.
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
        )}

        {/* Order Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Commande #{order.orderNumber || order._id.slice(-8).toUpperCase()}
              </h2>
              <p className="text-sm text-gray-600">
                Passée le {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
                <StatusIcon className="h-4 w-4 mr-1" />
                {statusConfig.text}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleDownloadInvoice}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-harvests-light"
            >
              <FiDownload className="h-4 w-4 mr-2" />
              Télécharger la facture
            </button>
            <button
              onClick={handleShareOrder}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-harvests-light"
            >
              <FiShare2 className="h-4 w-4 mr-2" />
              Partager
            </button>
            <button
              onClick={() => navigate('/consumer/orders')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-harvests-light"
            >
              <FiShoppingBag className="h-4 w-4 mr-2" />
              Voir toutes mes commandes
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Articles commandés</h3>
            <div className="space-y-4">
              {order.items?.map((item, index) => {
                const productSnapshot = item.productSnapshot || {};
                const productName = productSnapshot.name || item.name || 'Produit inconnu';
                const productImages = productSnapshot.images || [];
                const productPrice = productSnapshot.price || item.unitPrice || item.price || 0;
                const quantity = item.quantity || 1;
                const totalPrice = item.totalPrice || (productPrice * quantity);
                
                // Essayer différentes approches pour extraire l'URL
                let imageUrl = null;
                let imageAlt = null;
                
                if (productImages.length > 0) {
                  const firstImg = productImages[0];
                  
                  // Si c'est déjà un objet avec une propriété url
                  if (firstImg && typeof firstImg === 'object' && firstImg.url) {
                    imageUrl = firstImg.url;
                    imageAlt = firstImg.alt;
                  }
                  // Si c'est une chaîne qui ressemble à une URL
                  else if (typeof firstImg === 'string' && firstImg.startsWith('http')) {
                    imageUrl = firstImg;
                  }
                  // Si c'est une chaîne avec une représentation d'objet, extraire l'URL avec regex
                  else if (typeof firstImg === 'string') {
                    // Chercher l'URL dans la chaîne avec une regex
                    const urlMatch = firstImg.match(/url:\s*['"]([^'"]+)['"]/);
                    if (urlMatch && urlMatch[1]) {
                      imageUrl = urlMatch[1];
                    }
                    
                    // Chercher l'alt dans la chaîne avec une regex
                    const altMatch = firstImg.match(/alt:\s*['"]([^'"]*)['"]/);
                    if (altMatch && altMatch[1]) {
                      imageAlt = altMatch[1];
                    }
                  }
                }

                return (
                  <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="h-16 w-16 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={imageAlt || parseProductName(productName)}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="h-full w-full flex items-center justify-center" style={{ display: imageUrl ? 'none' : 'flex' }}>
                        <FiPackage className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900">
                        {parseProductName(productName)}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Quantité: {quantity}
                      </p>
                      <p className="text-sm text-gray-500">
                        Prix unitaire: {productPrice.toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {totalPrice.toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé de la commande</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sous-total</span>
                <span className="font-medium">{confirmedTotals.subtotal?.toLocaleString('fr-FR')} FCFA</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Frais de livraison</span>
                <span className="font-medium">{confirmedTotals.deliveryFee?.toLocaleString('fr-FR')} FCFA</span>
              </div>
              {confirmedTotals.deliveryFee > 0 && deliveryDetail?.reason && (
                <p className="text-xs text-gray-500 text-right">
                  {deliveryDetail.reason}
                </p>
              )}
              {confirmedTotals.deliveryFee > 0 && !deliveryDetail?.reason && order.delivery?.method && (
                <p className="text-xs text-gray-500 text-right">
                  Forfait {deliveryMethodLabels[order.delivery.method] || order.delivery.method}
                </p>
              )}
              
              {confirmedTotals.taxes > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">TVA</span>
                  <span className="font-medium">{confirmedTotals.taxes?.toLocaleString('fr-FR')} FCFA</span>
                </div>
              )}
              
              {confirmedTotals.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Réduction</span>
                  <span className="font-medium text-green-600">-{confirmedTotals.discount?.toLocaleString('fr-FR')} FCFA</span>
                </div>
              )}
              
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {confirmedTotals.total?.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiMapPin className="h-5 w-5 mr-2" />
              Adresse de livraison
            </h3>
            {order.delivery?.deliveryAddress ? (
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <FiUser className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {order.delivery.deliveryAddress.firstName} {order.delivery.deliveryAddress.lastName}
                    </p>
                    {order.delivery.deliveryAddress.label && (
                      <p className="text-sm text-gray-500">{order.delivery.deliveryAddress.label}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <FiMapPin className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-gray-900">
                      {order.delivery.deliveryAddress.street}
                    </p>
                    <p className="text-gray-900">
                      {order.delivery.deliveryAddress.city}, {order.delivery.deliveryAddress.region}
                    </p>
                    <p className="text-gray-900">
                      {order.delivery.deliveryAddress.country} {order.delivery.deliveryAddress.postalCode}
                    </p>
                  </div>
                </div>
                
                {order.delivery.deliveryAddress.phone && (
                  <div className="flex items-center space-x-3">
                    <FiPhone className="h-5 w-5 text-gray-400" />
                    <p className="text-gray-900">{order.delivery.deliveryAddress.phone}</p>
                  </div>
                )}
                
                {order.delivery.deliveryAddress.deliveryInstructions && (
                  <div className="mt-3 p-3 bg-harvests-light rounded-md">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Instructions de livraison:</span><br />
                      {order.delivery.deliveryAddress.deliveryInstructions}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                <p>Aucune adresse de livraison spécifiée</p>
              </div>
            )}
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FiCreditCard className="h-5 w-5 mr-2" />
              Paiement
            </h3>
            <div className="text-sm text-gray-600">
              <p>
                <span className="font-medium">Méthode:</span> {
                  order.payment?.method === 'paypal'
                    ? 'PayPal'
                    : order.payment?.method === 'cash'
                    ? 'Paiement à la livraison'
                    : order.payment?.method
                }
              </p>
              <p>
                <span className="font-medium">Statut:</span> {
                  order.payment?.status === 'pending' ? 'En attente' :
                  order.payment?.status === 'processing' ? 'En cours' :
                  order.payment?.status === 'completed' ? 'Payé' :
                  order.payment?.status === 'failed' ? 'Échoué' :
                  order.payment?.status
                }
              </p>
              {order.payment?.transactionId && (
                <p>
                  <span className="font-medium">Transaction:</span> {order.payment.transactionId}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Prochaines étapes</h3>
          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-200 flex items-center justify-center mr-3 mt-0.5">
                <span className="text-xs font-medium">1</span>
              </div>
              <p>Vous recevrez un email de confirmation avec les détails de votre commande.</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-200 flex items-center justify-center mr-3 mt-0.5">
                <span className="text-xs font-medium">2</span>
              </div>
              <p>Le producteur préparera votre commande et vous informera de l'expédition.</p>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-200 flex items-center justify-center mr-3 mt-0.5">
                <span className="text-xs font-medium">3</span>
              </div>
              <p>Vous recevrez un numéro de suivi pour suivre votre livraison en temps réel.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-harvests-green hover:bg-green-600"
          >
            <FiHome className="mr-2 h-5 w-5" />
            Retour à l'accueil
          </button>
          <button
            onClick={() => navigate('/consumer/orders')}
            className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-harvests-light"
          >
            <FiShoppingBag className="mr-2 h-5 w-5" />
            Voir mes commandes
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;

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
            className="paypal-hosted-field block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-harvests-green focus:border-harvests-green transition"
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
              Date d’expiration
            </label>
            <PayPalHostedField
              id="card-expiration"
              className="paypal-hosted-field block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-harvests-green focus:border-harvests-green transition"
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
              className="paypal-hosted-field block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-harvests-green focus:border-harvests-green transition"
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
