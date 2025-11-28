import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { consumerService, producerService, transformerService, restaurateurService, orderService, transporterService, exporterService } from '../../services';
import { adminService } from '../../services/adminService';
import OrderStatusBadge, { getStatusConfig } from '../../components/orders/OrderStatusBadge';
import OrderActions from '../../components/orders/OrderActions';
import OrderItemsList from '../../components/orders/OrderItemsList';
import { DeliveryAddressCard, OrderSummaryCard, DeliveryInfoCard, TransporterCard } from '../../components/orders/OrderSidebar';
import { FiArrowLeft, FiRefreshCw, FiAlertCircle, FiCalendar } from 'react-icons/fi';

const formatDate = (dateString) => new Date(dateString).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

const OrderDetail = () => {
  const { id, orderId } = useParams();
  const orderIdParam = id || orderId;
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  
  const isAdminContext = location.pathname.startsWith('/admin/orders');

  const loadOrderDetails = useCallback(async () => {
    if (!orderIdParam || !user) { navigate('/dashboard'); return; }

    try {
      setLoading(true);
      setError(null);
      let response;

      if (isAdminContext) {
        response = await adminService.getOrderById(orderIdParam);
        if (response.status === 'success' && response.data?.order) setOrder(response.data.order);
        else setError('Commande non trouvée');
      } else {
        const services = { consumer: consumerService.getMyOrder, producer: producerService.getOrder, transformer: transformerService.getMyOrder, restaurateur: restaurateurService.getOrder, transporter: transporterService.getOrder, exporter: exporterService.getOrder };
        const service = services[user.userType] || orderService.getOrder;
        response = await service(orderIdParam);

        if (response.data.status === 'success') setOrder(response.data.data.order);
        else setError('Commande non trouvée');
      }
    } catch (error) {
      console.error('Erreur chargement commande:', error);
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [orderIdParam, user, navigate, isAdminContext]);

  useEffect(() => { loadOrderDetails(); }, [loadOrderDetails]);

  const updateOrderStatus = async (newStatus, options = {}) => {
    if (!order || updating) return;
    setUpdating(true);

    try {
      const payload = { status: newStatus, segmentId: order.segment?.id || order.segment?._id, ...(options.itemId ? { itemId: options.itemId } : {}), ...(options.itemIds ? { itemIds: options.itemIds } : {}) };

      if (isAdminContext) {
        await adminService.updateOrderStatus(order._id, newStatus);
      } else if (user.userType === 'producer') {
        await producerService.updateOrderStatus(order._id, payload);
      } else if (user.userType === 'transformer') {
        await transformerService.updateOrderStatus(order._id, payload);
      } else if (user.userType === 'restaurateur') {
        await restaurateurService.updateOrderStatus(order._id, payload);
      } else if (user.userType === 'transporter' || user.userType === 'exporter') {
        let deliveryStatus = newStatus;
        if (newStatus === 'ready-for-pickup') deliveryStatus = 'picked-up';
        else if (newStatus === 'in-transit' || newStatus === 'out-for-delivery') deliveryStatus = 'in-transit';
        else if (newStatus === 'delivered') deliveryStatus = 'delivered';
        
        const service = user.userType === 'transporter' ? transporterService : exporterService;
        await service.updateOrderStatus(order._id, { status: deliveryStatus, location: order.delivery?.deliveryAddress?.city || null, note: `Statut mis à jour par ${user?.firstName || user.userType}` });
      } else {
        await orderService.updateOrderStatus(order._id, payload);
      }
      await loadOrderDetails();
    } catch (error) {
      console.error(`Erreur mise à jour statut:`, error);
    } finally {
      setUpdating(false);
    }
  };

  const cancelOrder = () => updateOrderStatus('cancelled');
  const prepareOrder = () => updateOrderStatus('preparing');
  const readyOrder = () => updateOrderStatus('ready-for-pickup');
  const deliverOrder = () => updateOrderStatus('delivered');
  const completeOrder = () => updateOrderStatus('completed');

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3"><div className="h-4 bg-gray-200 rounded"></div><div className="h-4 bg-gray-200 rounded w-2/3"></div></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FiAlertCircle className="mx-auto h-16 w-16 text-red-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">{error || 'Commande non trouvée'}</h3>
          <p className="mt-2 text-gray-600">La commande n'existe pas ou vous n'avez pas l'autorisation.</p>
          <button onClick={() => navigate(-1)} className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-harvests-green hover:bg-green-600">
            <FiArrowLeft className="mr-2 h-4 w-4" />Retour
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin' || user?.userType === 'admin';
  const buyerId = order?.buyer?._id?.toString?.() || order?.buyer?.id?.toString?.() || (typeof order?.buyer?.toString === 'function' ? order.buyer.toString() : null);
  const userId = user?._id?.toString?.() || user?.id?.toString?.();
  const isBuyerView = user?.userType === 'consumer' && buyerId && userId && buyerId === userId;
  const isSellerView = ['producer', 'transformer', 'restaurateur'].includes(user?.userType);
  const isTransporterView = user?.userType === 'transporter' || user?.userType === 'exporter';
  const displayedStatus = order.segment?.status || order.status;
  const statusConfig = getStatusConfig(displayedStatus);
  const StatusIcon = statusConfig.icon;
  const deliveryFee = order.originalTotals?.deliveryFee ?? order.deliveryFee ?? order.delivery?.deliveryFee ?? 0;
  const deliveryDetail = order.originalTotals?.deliveryFeeDetail || order.deliveryFeeDetail || order.delivery?.feeDetail || null;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center space-x-4">
            <button onClick={() => navigate(-1)} className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-harvests-light">
              <FiArrowLeft className="mr-2 h-4 w-4" />Retour
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Commande #{order.orderNumber || order._id.slice(-8).toUpperCase()}</h1>
              <p className="text-gray-600">Passée le {formatDate(order.createdAt)}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <OrderStatusBadge status={displayedStatus} />
            <button onClick={() => window.location.reload()} className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-harvests-light">
              <FiRefreshCw className="h-4 w-4 mr-1" />Actualiser
            </button>
            <OrderActions
              displayedStatus={displayedStatus} order={order} user={user} updating={updating}
              cancelOrder={cancelOrder} prepareOrder={prepareOrder} readyOrder={readyOrder}
              deliverOrder={deliverOrder} completeOrder={completeOrder} updateOrderStatus={updateOrderStatus}
              isSellerView={isSellerView} isTransporterView={isTransporterView} isAdmin={isAdmin} isBuyerView={isBuyerView}
            />
          </div>
        </div>
      </div>

      {/* Status Description */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start space-x-3">
          <StatusIcon className="h-6 w-6 text-gray-400 mt-1" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">{isSellerView ? 'Statut de la commande' : 'Statut de votre commande'}</h3>
            <p className="text-gray-600 mt-1">{statusConfig.description}</p>
            {order.delivery?.estimatedDeliveryDate && order.status !== 'delivered' && order.status !== 'cancelled' && (
              <p className="text-sm text-gray-500 mt-2"><FiCalendar className="inline h-4 w-4 mr-1" />Livraison prévue: {formatDate(order.delivery.estimatedDeliveryDate)}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <OrderItemsList order={order} isSellerView={isSellerView} updateOrderStatus={updateOrderStatus} updating={updating} />
          <TransporterCard order={order} />
        </div>

        <div className="space-y-6">
          <DeliveryAddressCard order={order} user={user} />
          <OrderSummaryCard order={order} isSellerView={isSellerView} deliveryFee={deliveryFee} deliveryDetail={deliveryDetail} />
          <DeliveryInfoCard order={order} />
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
