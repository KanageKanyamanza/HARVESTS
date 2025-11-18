import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const OrdersSection = ({ orders, userType, loading = false, service }) => {
  const [localOrders, setLocalOrders] = useState([]);
  const [localLoading, setLocalLoading] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      setLocalLoading(true);
      const response = await service.getOrders({ limit: 5 });
      console.log(`[OrdersSection] Response for ${userType}:`, response.data);
      
      // Gérer différentes structures de réponse selon le type d'utilisateur
      let ordersData = [];
      if (userType === 'transporter') {
        ordersData = response.data.data?.deliveries || 
                     response.data.data?.orders || 
                     response.data.deliveries || 
                     response.data.orders || [];
      } else if (userType === 'exporter') {
        // Pour les exportateurs, vérifier toutes les structures possibles
        ordersData = response.data.data?.exportOrders || 
                     response.data.data?.orders || 
                     response.data.exportOrders || 
                     response.data.orders || [];
        console.log(`[OrdersSection] Exporter orders found:`, ordersData.length, ordersData);
      } else {
        ordersData = response.data.data?.orders || response.data.orders || [];
      }
      setLocalOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      console.error(`[OrdersSection] Erreur lors du chargement des commandes pour ${userType}:`, error);
      console.error('[OrdersSection] Error details:', error.response?.data);
      setLocalOrders([]);
    } finally {
      setLocalLoading(false);
    }
  }, [service, userType]);

  // Si un service est fourni et pas d'orders, charger les commandes
  useEffect(() => {
    if (service && !orders) {
      loadOrders();
    }
  }, [service, orders, loadOrders]);

  // Utiliser les orders passés en prop ou les orders chargés localement
  const displayOrders = orders || localOrders;
  const displayLoading = loading || localLoading;
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

  if (displayLoading) {
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

  if (!displayOrders || displayOrders.length === 0) {
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
      {displayOrders.slice(0, 5).map((order) => (
        <div key={order._id} className="flex flex-wrap gap-2 items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="flex gap-2 items-center">
            {getStatusIcon(order.status)}
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                Commande #{order.orderNumber || order._id.slice(-8)}
              </h4>
              <p className="text-sm text-gray-500">
                {order.total ? `${order.total} ${order.currency || 'XAF'}` : 'Montant non défini'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
            <Link
              to={`/${userType}/orders/${order._id}`}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Voir
            </Link>
          </div>
        </div>
      ))}
      
      {displayOrders.length > 5 && (
        <div className="text-center pt-2">
          <Link
            to={`/${userType}/orders`}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Voir toutes les commandes ({displayOrders.length})
          </Link>
        </div>
      )}
    </div>
  );
};

export default OrdersSection;
