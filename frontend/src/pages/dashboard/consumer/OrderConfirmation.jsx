import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { consumerService, orderService, paymentService } from '../../../services';
import PayPalPaymentSection from '../../../components/orders/PayPalPaymentSection';
import {
  getStatusConfig, SuccessHeader, OrderInfoCard, OrderItemsCard,
  OrderSummaryCard, DeliveryAddressCard, PaymentInfoCard, NextStepsCard, ActionButtons
} from '../../../components/orders/OrderConfirmationComponents';
import { FiShoppingBag, FiArrowRight, FiHome } from 'react-icons/fi';

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
  const orderKey = order?._id || order?.id || null;

  const fetchOrder = useCallback(async () => {
    if (!orderId) { setError('ID de commande manquant'); setLoading(false); return; }
    if (!isAuthenticated) { setError('Vous devez être connecté pour voir cette commande'); setLoading(false); return; }

    try {
      setLoading(true);
      setError(null);
      let response;

      if (['consumer', 'restaurateur'].includes(user?.userType)) {
        try {
          response = await consumerService.getMyOrder(orderId);
          if (response.data.status === 'success') { setOrder(response.data.data?.order || response.data.order); setPaymentProcessing(false); return; }
        } catch { /* fallback */ }
      }

      response = await orderService.getOrder(orderId);
      if (response.data.status === 'success') setOrder(response.data.data?.order || response.data.order);
      else setError('Commande non trouvée');
    } catch (error) {
      if (error.response?.status === 404) setError('Commande introuvable');
      else if (error.response?.status === 403) setError('Vous n\'avez pas l\'autorisation de voir cette commande');
      else setError('Erreur lors du chargement de la commande');
    } finally {
      setLoading(false);
      setPaymentProcessing(false);
    }
  }, [orderId, isAuthenticated, user]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  const handleFallbackPayment = useCallback(async () => {
    if (!orderKey) { setPaymentError('Commande introuvable.'); return; }
    try {
      setPaymentProcessing(true);
      setPaymentError(null);
      const origin = window.location.origin;
      const response = await paymentService.initiatePayment({ orderId: orderKey, method: 'paypal', returnUrl: `${origin}/payments/paypal/success?orderId=${orderKey}`, cancelUrl: `${origin}/payments/paypal/cancel?orderId=${orderKey}` });
      const payload = response.data?.data;
      const paymentId = payload?.payment?.paymentId || payload?.payment?.id || payload?.paymentId || null;
      if (paymentId) sessionStorage.setItem(`harvests_paypal_payment_${orderKey}`, paymentId);
      if (payload?.approvalUrl) { window.location.href = payload.approvalUrl; return; }
      setPaymentError("Lien PayPal introuvable.");
    } catch (err) {
      setPaymentError(err.response?.data?.message || err.message || 'Erreur lors de l'initiation du paiement.');
    } finally {
      setPaymentProcessing(false);
    }
  }, [orderKey]);

  const createPayPalOrder = useCallback(async () => {
    if (!orderKey) throw new Error('Commande introuvable.');
    try {
      setPaymentProcessing(true);
      setPaymentError(null);
      const origin = window.location.origin;
      const response = await paymentService.initiatePayment({ orderId: orderKey, method: 'paypal', returnUrl: `${origin}/payments/paypal/success?orderId=${orderKey}`, cancelUrl: `${origin}/payments/paypal/cancel?orderId=${orderKey}` });
      const payload = response.data?.data;
      const paymentId = payload?.payment?.paymentId || payload?.payment?.id || payload?.paymentId || null;
      paymentIdRef.current = paymentId;
      if (paymentId) sessionStorage.setItem(`harvests_paypal_payment_${orderKey}`, paymentId);
      if (!payload?.paypalOrderId) throw new Error('Identifiant PayPal introuvable.');
      return payload.paypalOrderId;
    } catch (err) {
      setPaymentError(err.response?.data?.message || err.message || 'Impossible de contacter PayPal.');
      setPaymentProcessing(false);
      throw err;
    }
  }, [orderKey]);

  const handlePayPalApprove = useCallback(async (data) => {
    if (!orderKey) { setPaymentError('Commande introuvable.'); setPaymentProcessing(false); return; }
    try {
      const paymentId = paymentIdRef.current || sessionStorage.getItem(`harvests_paypal_payment_${orderKey}`);
      if (!paymentId) throw new Error('Identifiant du paiement introuvable.');
      await paymentService.confirmPayment(paymentId, { paypalOrderId: data.orderID });
      sessionStorage.setItem(`harvests_paypal_confirmed_${orderKey}`, 'true');
      await fetchOrder();
      setPaymentError(null);
      navigate(`/payments/paypal/success?orderId=${orderKey}&paymentId=${paymentId}`);
    } catch (err) {
      setPaymentError(err.response?.data?.message || err.message || 'Erreur lors de la confirmation.');
    } finally {
      setPaymentProcessing(false);
    }
  }, [fetchOrder, orderKey, navigate]);

  const handlePayPalCancel = useCallback(() => {
    setPaymentError('Paiement annulé. Vous pouvez réessayer.');
    setPaymentProcessing(false);
    if (orderKey) navigate(`/payments/paypal/cancel?orderId=${orderKey}`);
  }, [navigate, orderKey]);

  const handlePayPalError = useCallback((err) => {
    setPaymentError(err?.message || 'Erreur PayPal inattendue.');
    setPaymentProcessing(false);
  }, []);

  const handleDownloadInvoice = () => console.log('Téléchargement facture:', orderId);
  const handleShareOrder = () => {
    if (navigator.share) navigator.share({ title: `Commande #${order?.orderNumber}`, text: `Ma commande sur Harvests`, url: window.location.href });
    else navigator.clipboard.writeText(window.location.href);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-lg shadow p-6 mb-4"><div className="h-6 bg-gray-200 rounded mb-4"></div><div className="space-y-3"><div className="h-4 bg-gray-200 rounded"></div></div></div>)}
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <FiShoppingBag className="mx-auto h-16 w-16 text-gray-400" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">{error || 'Commande introuvable'}</h2>
          <p className="mt-2 text-gray-600">Une erreur est survenue lors du chargement de la commande.</p>
          <div className="mt-6 space-x-4">
            {error === 'Vous devez être connecté pour voir cette commande' ? (
              <button onClick={() => navigate('/login')} className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-harvests-green hover:bg-green-600">Se connecter</button>
            ) : (
              <button onClick={() => navigate('/consumer/orders')} className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-harvests-green hover:bg-green-600"><FiArrowRight className="mr-2 h-5 w-5" />Voir mes commandes</button>
            )}
            <button onClick={() => navigate('/')} className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-harvests-light"><FiHome className="mr-2 h-5 w-5" />Accueil</button>
          </div>
        </div>
      </div>
    );
  }

  const paymentStatus = (order?.payment?.status || '').toLowerCase();
  const isPaypalPayment = order?.payment?.method === 'paypal';
  const isPaypalPending = isPaypalPayment && !['succeeded', 'completed', 'paid'].includes(paymentStatus);
  const orderCurrency = (order?.currency || order?.payment?.currency || '').toUpperCase();
  const showCurrencyNotice = Boolean(orderCurrency) && orderCurrency !== paypalCurrency;
  const statusConfig = getStatusConfig(order?.status);
  const deliveryDetail = order?.deliveryFeeDetail || order?.delivery?.feeDetail || null;
  const confirmedTotals = {
    subtotal: order?.subtotal ?? order?.originalTotals?.subtotal ?? 0,
    deliveryFee: order?.deliveryFee ?? order?.originalTotals?.deliveryFee ?? order?.delivery?.deliveryFee ?? 0,
    taxes: order?.taxes ?? order?.originalTotals?.taxes ?? 0,
    discount: order?.discount ?? order?.originalTotals?.discount ?? 0,
    total: order?.total ?? order?.originalTotals?.total ?? 0
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <SuccessHeader />

      {isPaypalPending && (
        <PayPalPaymentSection
          user={user} paypalClientId={paypalClientId} paypalCurrency={paypalCurrency}
          orderCurrency={orderCurrency} showCurrencyNotice={showCurrencyNotice}
          paymentProcessing={paymentProcessing} paymentError={paymentError}
          createPayPalOrder={createPayPalOrder} handlePayPalApprove={handlePayPalApprove}
          handlePayPalCancel={handlePayPalCancel} handlePayPalError={handlePayPalError}
          handleFallbackPayment={handleFallbackPayment}
        />
      )}

      <OrderInfoCard order={order} statusConfig={statusConfig} onDownload={handleDownloadInvoice} onShare={handleShareOrder} onViewOrders={() => navigate('/consumer/orders')} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrderItemsCard items={order.items} />
        <OrderSummaryCard totals={confirmedTotals} deliveryDetail={deliveryDetail} deliveryMethod={order.delivery?.method} />
        <DeliveryAddressCard address={order.delivery?.deliveryAddress} />
        <PaymentInfoCard payment={order.payment} />
      </div>

      <NextStepsCard />
      <ActionButtons onHome={() => navigate('/')} onViewOrders={() => navigate('/consumer/orders')} />
    </div>
  );
};

export default OrderConfirmation;
