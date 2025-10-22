import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const OrdersSection = ({ orders, userType, loading = false }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FiClock className="h-4 w-4 text-yellow-500" />;
      case 'confirmed':
        return <FiCheckCircle className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <FiCheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <FiXCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FiClock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'confirmed':
        return 'Confirmée';
      case 'completed':
        return 'Terminée';
      case 'cancelled':
        return 'Annulée';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'confirmed':
        return 'text-blue-600 bg-blue-100';
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-8">
        <FiShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune commande</h3>
        <p className="text-gray-500 mb-4">Vos commandes apparaîtront ici.</p>
        <Link
          to={`/${userType}/orders`}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiShoppingCart className="mr-2" />
          Voir toutes les commandes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3 w-full">
      {orders.slice(0, 5).map((order) => (
        <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="flex items-center space-x-3">
            {getStatusIcon(order.status)}
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                Commande #{order.orderNumber || order._id.slice(-8)}
              </h4>
              <p className="text-sm text-gray-500">
                {order.totalAmount ? `${order.totalAmount} XAF` : 'Montant non défini'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
            <Link
              to={`/dashboard/${userType}/orders/${order._id}`}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Voir
            </Link>
          </div>
        </div>
      ))}
      
      {orders.length > 5 && (
        <div className="text-center pt-2">
          <Link
            to={`/dashboard/${userType}/orders`}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Voir toutes les commandes ({orders.length})
          </Link>
        </div>
      )}
    </div>
  );
};

export default OrdersSection;
