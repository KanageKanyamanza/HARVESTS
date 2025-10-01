import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const RecentOrders = ({ orders = [] }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Aucune commande récente</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Commandes récentes</h3>
          <Link 
            to="/admin/orders" 
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Voir toutes
          </Link>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {orders.map((order) => (
          <div key={order._id} className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(order.status)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Commande #{order.orderNumber || order._id.slice(-8)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.buyer?.firstName} {order.buyer?.lastName}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    {order.items?.length || 0} article(s)
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(order.totalAmount || order.total)}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentOrders;
