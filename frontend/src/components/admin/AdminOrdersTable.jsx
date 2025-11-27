import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Truck, CreditCard, Clock, CheckCircle, X, AlertTriangle, Package, User } from 'lucide-react';
import { parseProductName } from '../../utils/productUtils';

export const getStatusColor = (status) => {
  const colors = {
    'pending': 'text-yellow-600 bg-yellow-100',
    'confirmed': 'text-blue-600 bg-blue-100',
    'processing': 'text-purple-600 bg-purple-100',
    'shipped': 'text-indigo-600 bg-indigo-100',
    'delivered': 'text-green-600 bg-green-100',
    'cancelled': 'text-red-600 bg-red-100',
    'disputed': 'text-orange-600 bg-orange-100',
    'completed': 'text-green-600 bg-green-100'
  };
  return colors[status] || 'text-gray-600 bg-gray-100';
};

export const getStatusText = (status) => {
  const statusMap = { 'pending': 'En attente', 'confirmed': 'Confirmée', 'processing': 'En cours', 'shipped': 'Expédiée', 'delivered': 'Livrée', 'cancelled': 'Annulée', 'disputed': 'En litige', 'completed': 'Terminée' };
  return statusMap[status] || status;
};

export const getPaymentStatusColor = (status) => {
  const colors = { 'pending': 'text-yellow-600 bg-yellow-100', 'paid': 'text-green-600 bg-green-100', 'completed': 'text-green-600 bg-green-100', 'failed': 'text-red-600 bg-red-100', 'refunded': 'text-orange-600 bg-orange-100' };
  return colors[status] || 'text-gray-600 bg-gray-100';
};

export const getPaymentStatusText = (status) => {
  const statusMap = { 'pending': 'En attente', 'paid': 'Payé', 'completed': 'Payé', 'failed': 'Échoué', 'refunded': 'Remboursé' };
  return statusMap[status] || status;
};

export const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
export const formatPrice = (price) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(price);

const AdminOrdersTable = ({ orders, onConfirmPayment, onOpenAssignModal, confirmingPayment }) => {
  if (!orders.length) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <Package className="mx-auto h-16 w-16 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Aucune commande trouvée</h3>
        <p className="mt-2 text-gray-600">Aucune commande ne correspond à vos critères de recherche.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commande</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Articles</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paiement</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <OrderRow key={order._id} order={order} onConfirmPayment={onConfirmPayment} onOpenAssignModal={onOpenAssignModal} confirmingPayment={confirmingPayment} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const OrderRow = ({ order, onConfirmPayment, onOpenAssignModal, confirmingPayment }) => {
  const canConfirmPayment = order.payment?.method === 'cash' && order.payment?.status !== 'completed' && order.payment?.status !== 'paid';
  const needsTransporter = order.delivery?.method !== 'pickup' && !order.delivery?.transporter && ['confirmed', 'preparing', 'ready-for-pickup'].includes(order.status);

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">#{order.orderNumber || order._id.slice(-8).toUpperCase()}</div>
        <div className="text-xs text-gray-500">{formatDate(order.createdAt)}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <User className="h-4 w-4 text-gray-400 mr-2" />
          <div>
            <div className="text-sm font-medium text-gray-900">{order.buyer?.firstName} {order.buyer?.lastName}</div>
            <div className="text-xs text-gray-500">{order.buyer?.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">{order.items?.length || 0} article(s)</div>
        <div className="text-xs text-gray-500 truncate max-w-[150px]">
          {order.items?.slice(0, 2).map(i => parseProductName(i.productSnapshot?.name || i.product?.name)).join(', ')}
          {order.items?.length > 2 && '...'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-semibold text-gray-900">{formatPrice(order.total || 0)}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
          {getStatusText(order.status)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment?.status)}`}>
          {getPaymentStatusText(order.payment?.status)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          <Link to={`/admin/orders/${order._id}`} className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded" title="Voir détails">
            <Eye className="h-4 w-4" />
          </Link>
          {canConfirmPayment && (
            <button onClick={() => onConfirmPayment(order._id)} disabled={confirmingPayment === order._id} className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded disabled:opacity-50" title="Confirmer paiement">
              <CreditCard className="h-4 w-4" />
            </button>
          )}
          {needsTransporter && (
            <button onClick={() => onOpenAssignModal(order)} className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded" title="Assigner transporteur">
              <Truck className="h-4 w-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default AdminOrdersTable;

