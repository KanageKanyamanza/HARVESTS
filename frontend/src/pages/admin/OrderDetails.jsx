import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, XCircle, CreditCard } from 'lucide-react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  getStatusConfig, getPaymentStatusConfig, formatDate,
  OrderSegment, OrderItemRow, BuyerInfoCard, DeliveryInfoCard,
  PaymentInfoCard, OrderTotalsCard, OrderActionsCard
} from '../../components/admin/AdminOrderComponents';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const loadOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getOrderById(orderId);
      if (response?.data?.order) setOrder(response.data.order);
      else if (response?.data) setOrder(response.data);
      else if (response?.order) setOrder(response.order);
      else setOrder(null);
    } catch (error) {
      console.error('Erreur:', error);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => { loadOrderDetails(); }, [loadOrderDetails]);

  const handleUpdateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      await adminService.updateOrderStatus(orderId, newStatus);
      await loadOrderDetails();
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    const reason = window.prompt('Raison de l\'annulation:');
    if (reason) {
      try {
        setUpdating(true);
        await adminService.cancelOrder(orderId, reason);
        await loadOrderDetails();
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setUpdating(false);
      }
    }
  };

  const handleConfirmPayment = async () => {
    if (window.confirm('Confirmer ce paiement ?')) {
      try {
        setUpdating(true);
        await adminService.updatePaymentStatus(orderId, { paymentStatus: 'completed', paidAt: new Date().toISOString() });
        await loadOrderDetails();
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setUpdating(false);
      }
    }
  };

  if (loading) return <div className="min-h-screen bg-harvests-light flex items-center justify-center"><LoadingSpinner size="lg" text="Chargement..." /></div>;

  if (!order) {
    return (
      <div className="min-h-screen bg-harvests-light flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Commande non trouvée</h2>
          <button onClick={() => navigate(-1)} className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            <ArrowLeft className="h-4 w-4 mr-2" />Retour
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order?.status);
  const paymentStatusConfig = getPaymentStatusConfig(order?.payment?.status || order?.paymentStatus);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-harvests-light">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="inline-flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5 mr-2" />Retour
            </button>
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xs text-gray-500">Commande:</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                  <StatusIcon className="h-3 w-3 mr-1" />{statusConfig.text}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">Paiement:</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${paymentStatusConfig.color}`}>
                  <CreditCard className="h-3 w-3 mr-1" />{paymentStatusConfig.text}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <h1 className="text-3xl font-bold text-gray-900">Commande #{order?.orderNumber || order?._id?.slice(-8).toUpperCase()}</h1>
            <p className="text-gray-600 mt-1">Créée le {order?.createdAt ? formatDate(order.createdAt) : 'Date inconnue'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main content */}
          <div className="xl:col-span-3 space-y-6">
            {/* Articles */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />Articles commandés
                  {order?.isMultiVendor && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Multi-vendeurs</span>}
                </h2>
              </div>
              <div className="p-6">
                {order?.segments?.length > 0 ? (
                  <div className="space-y-6">
                    {order.segments.map((segment, i) => <OrderSegment key={segment._id || i} segment={segment} index={i} />)}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {order?.items?.map((item, i) => <OrderItemRow key={item._id || i} item={item} />)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <OrderActionsCard order={order} updating={updating} onUpdateStatus={handleUpdateStatus} onCancelOrder={handleCancelOrder} onConfirmPayment={handleConfirmPayment} />
            <BuyerInfoCard buyer={order?.buyer || order?.consumer} />
            <DeliveryInfoCard delivery={order?.delivery} />
            <PaymentInfoCard payment={order?.payment} order={order} />
            <OrderTotalsCard order={order} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
