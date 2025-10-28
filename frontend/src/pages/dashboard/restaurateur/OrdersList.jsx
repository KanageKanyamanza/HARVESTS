import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { restaurateurService } from '../../../services';
import { useNotifications } from '../../../contexts/NotificationContext';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import {
  FiShoppingCart,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiEye,
  FiEdit,
  FiPlus,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiTruck,
  FiAlertCircle
} from 'react-icons/fi';

const OrdersList = () => {
  const { showSuccess, showError } = useNotifications();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    dateRange: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Charger les commandes
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const response = await restaurateurService.getOrders({
          page: pagination.page,
          limit: pagination.limit,
          ...filters
        });
        
        setOrders(response.data?.data?.orders || []);
        setPagination(prev => ({
          ...prev,
          total: response.data?.total || 0,
          totalPages: response.data?.totalPages || 0
        }));
      } catch (error) {
        console.error('Erreur lors du chargement des commandes:', error);
        setError('Erreur lors du chargement des commandes');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [pagination.page, pagination.limit, filters]);

  // Filtrer les commandes
  const filteredOrders = orders.filter(order => {
    const matchesStatus = !filters.status || order.status === filters.status;
    const matchesSearch = !filters.search || 
      (order.orderNumber && order.orderNumber.toLowerCase().includes(filters.search.toLowerCase())) ||
      (order.seller?.firstName && order.seller.firstName.toLowerCase().includes(filters.search.toLowerCase())) ||
      (order.seller?.lastName && order.seller.lastName.toLowerCase().includes(filters.search.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

  // Obtenir le statut de la commande
  const getOrderStatus = (status) => {
    const statusMap = {
      'pending': { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: FiClock },
      'confirmed': { label: 'Confirmée', color: 'bg-blue-100 text-blue-800', icon: FiCheckCircle },
      'in-transit': { label: 'En transit', color: 'bg-purple-100 text-purple-800', icon: FiTruck },
      'delivered': { label: 'Livrée', color: 'bg-green-100 text-green-800', icon: FiCheckCircle },
      'cancelled': { label: 'Annulée', color: 'bg-red-100 text-red-800', icon: FiXCircle },
      'completed': { label: 'Terminée', color: 'bg-green-100 text-green-800', icon: FiCheckCircle }
    };
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: FiAlertCircle };
  };

  // Formater la date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Annuler une commande
  const handleCancelOrder = async (orderId) => {
    try {
      await restaurateurService.cancelOrder(orderId);
      showSuccess('Commande annulée avec succès');
      // Recharger les commandes
      const response = await restaurateurService.getOrders({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });
      setOrders(response.data?.data?.orders || []);
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la commande:', error);
      showError('Erreur lors de l\'annulation de la commande');
    }
  };

  // Changer de page
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  if (loading) {
    return (
      <ModularDashboardLayout>
        <div className="p-6 max-w-7xl mx-auto pb-20">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes Commandes</h1>
            <p className="text-gray-600 mt-1">Gérez vos commandes d'approvisionnement</p>
          </div>
          <Link
            to="/restaurateur/orders/add"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-harvests-green hover:bg-green-600"
          >
            <FiPlus className="h-4 w-4 mr-2" />
            Nouvelle commande
          </Link>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par numéro de commande ou fournisseur..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green focus:border-transparent"
              >
                <option value="">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmée</option>
                <option value="in-transit">En transit</option>
                <option value="delivered">Livrée</option>
                <option value="cancelled">Annulée</option>
                <option value="completed">Terminée</option>
              </select>
            </div>
            <button
              onClick={() => setFilters({ status: '', search: '', dateRange: '' })}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-harvests-light"
            >
              <FiRefreshCw className="h-4 w-4 mr-2" />
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Liste des commandes */}
        <div className="bg-white rounded-lg shadow">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <FiShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune commande</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filters.search || filters.status ? 'Aucune commande ne correspond à vos critères' : 'Commencez par passer votre première commande'}
              </p>
              {!filters.search && !filters.status && (
                <div className="mt-6">
                  <Link
                    to="/restaurateur/orders/add"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-harvests-green hover:bg-green-600"
                  >
                    <FiPlus className="h-4 w-4 mr-2" />
                    Nouvelle commande
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredOrders.map((order) => {
                const statusInfo = getOrderStatus(order.status);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <div key={order._id} className="p-6 hover:bg-harvests-light">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              Commande #{order.orderNumber || order._id.slice(-8)}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Fournisseur: {order.seller?.firstName} {order.seller?.lastName}
                            </p>
                            <p className="text-sm text-gray-500">
                              Créée le: {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusInfo.label}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center space-x-6">
                          <div>
                            <span className="text-sm font-medium text-gray-900">
                              {order.totalAmount?.toLocaleString()} FCFA
                            </span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">
                              {order.items?.length || 0} article(s)
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/restaurateur/orders/${order._id}`}
                          className="p-2 text-gray-400 hover:text-gray-600"
                          title="Voir les détails"
                        >
                          <FiEye className="h-4 w-4" />
                        </Link>
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            className="p-2 text-red-400 hover:text-red-600"
                            title="Annuler la commande"
                          >
                            <FiXCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Affichage de {((pagination.page - 1) * pagination.limit) + 1} à {Math.min(pagination.page * pagination.limit, pagination.total)} sur {pagination.total} commandes
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-harvests-light disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 border rounded-md text-sm font-medium ${
                    page === pagination.page
                      ? 'border-harvests-green bg-harvests-green text-white'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-harvests-light'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-harvests-light disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </ModularDashboardLayout>
  );
};

export default OrdersList;
