import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { consumerService } from '../../../services';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import {
  FiSearch,
  FiDownload,
  FiEye,
  FiRefreshCw,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiStar
} from 'react-icons/fi';

const OrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Charger les commandes
  useEffect(() => {
    const loadOrders = async () => {
      if (user?.userType === 'consumer') {
        try {
          setLoading(true);
          const response = await consumerService.getMyOrders();
          console.log('📡 Réponse API Orders:', response);
          const ordersData = response.data.orders || response.data || [];
          console.log('📦 Données brutes des commandes:', ordersData);
          setOrders(ordersData);
        } catch (error) {
          console.error('Erreur lors du chargement des commandes:', error);
          setOrders([]);
        } finally {
          setLoading(false);
        }
      }
    };

    loadOrders();
  }, [user]);


  const getStatusConfig = (status) => {
    const configs = {
      'delivered': { color: 'bg-green-100 text-green-800', text: 'Livrée', icon: FiCheckCircle },
      'in-transit': { color: 'bg-blue-100 text-blue-800', text: 'En transit', icon: FiTruck },
      'pending': { color: 'bg-yellow-100 text-yellow-800', text: 'En attente', icon: FiClock },
      'cancelled': { color: 'bg-red-100 text-red-800', text: 'Annulée', icon: FiXCircle }
    };
    return configs[status] || configs['pending'];
  };

  const filteredOrders = (Array.isArray(orders) ? orders : []).filter(order => {
    const orderNumber = order.orderNumber || order.id || order._id || '';
    const orderStatus = order.status || 'pending';
    const matchesSearch = orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <ModularDashboardLayout>
        <div className="p-6 max-w-7xl mx-auto pb-20">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ModularDashboardLayout>
    );
  }

  return (
    <ModularDashboardLayout>
      <div className="p-6 max-w-7xl mx-auto pb-20">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mes commandes</h1>
              <p className="text-gray-600 mt-1">Suivez et gérez toutes vos commandes</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <FiDownload className="h-4 w-4 mr-2" />
                Exporter
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une commande..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                />
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="in-transit">En transit</option>
                  <option value="delivered">Livrées</option>
                  <option value="cancelled">Annulées</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune commande trouvée</h3>
              <p className="mt-1 text-sm text-gray-500">
                Vous n'avez pas encore passé de commandes
              </p>
              <div className="mt-6">
                <Link
                  to="/products"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-harvests-green hover:bg-green-600"
                >
                  Commencer mes achats
                </Link>
              </div>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {order.orderNumber || order.id || order._id || 'N/A'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {order.date || order.createdAt || 'N/A'} • {order.seller?.name || order.producer?.name || 'N/A'}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <FiStar className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-sm text-gray-600">{order.seller?.rating || order.producer?.rating || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-0 flex items-center space-x-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
                          <StatusIcon className="w-4 h-4 mr-1" />
                          {statusConfig.text}
                        </span>
                        <span className="text-lg font-bold text-gray-900">
                          {(order.total || order.amount || 0).toLocaleString()} FCFA
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Articles</h4>
                          <ul className="space-y-1">
                            {order.items.map((item, index) => (
                              <li key={index} className="text-sm text-gray-600">
                                {item.quantity}x {item.name}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Livraison</h4>
                          <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="flex flex-wrap gap-2">
                        <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                          <FiEye className="h-4 w-4 mr-2" />
                          Voir détails
                        </button>
                        <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                          <FiRefreshCw className="h-4 w-4 mr-2" />
                          Recommander
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </ModularDashboardLayout>
  );
};

export default OrderHistory;
