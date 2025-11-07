import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  User,
  Package,
  Clock,
  CheckCircle,
  X,
  Eye,
  AlertTriangle
} from 'lucide-react';

import { adminService } from '../../services/adminService';
import { parseProductName } from '../../utils/productUtils';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fonction loadOrders mémorisée pour éviter les re-rendus
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        status: statusFilter,
        search: searchTerm
      };

      const response = await adminService.getOrders(params);
      
      console.log('📡 Réponse API Admin Orders:', response);
      
      // Le backend retourne { status: 'success', data: { orders: [...], pagination: {...} } }
      // adminService.getOrders retourne response.data, donc on a { status: 'success', data: {...} }
      
      // Vérifier si la réponse contient des commandes
      if (response.status === 'success' && response.data && response.data.orders) {
        console.log('✅ Commandes trouvées dans response.data.orders:', response.data.orders.length);
        setOrders(response.data.orders || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else if (response.data && response.data.orders) {
        // Structure alternative
        console.log('✅ Commandes trouvées dans response.data.orders (structure alternative):', response.data.orders.length);
        setOrders(response.data.orders || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else if (response.orders) {
        // Structure directe
        console.log('✅ Commandes trouvées dans response.orders:', response.orders.length);
        setOrders(response.orders || []);
        setTotalPages(response.pagination?.totalPages || 1);
      } else {
        console.log('❌ Aucune commande trouvée dans la réponse. Structure:', Object.keys(response));
        setOrders([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
      
      // Afficher un message d'erreur plus détaillé
      if (error.response?.status === 401) {
        console.error('❌ Erreur 401: Non autorisé. Vérifiez que vous êtes connecté en tant qu\'admin.');
      } else if (error.response?.status === 403) {
        console.error('❌ Erreur 403: Accès refusé. Vous n\'avez pas les permissions nécessaires.');
      } else {
        console.error('❌ Erreur lors du chargement:', error.response?.data?.message || error.message);
      }
      
      setOrders([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchTerm]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      loadOrders();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleCancelOrder = async (orderId, reason) => {
    try {
      await adminService.cancelOrder(orderId, reason);
      loadOrders();
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  };


  const getStatusColor = (status) => {
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

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'En attente',
      'confirmed': 'Confirmée',
      'processing': 'En cours',
      'shipped': 'Expédiée',
      'delivered': 'Livrée',
      'cancelled': 'Annulée',
      'disputed': 'En litige',
      'completed': 'Terminée'
    };
    return statusMap[status] || status;
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      'pending': 'text-yellow-600 bg-yellow-100',
      'paid': 'text-green-600 bg-green-100',
      'failed': 'text-red-600 bg-red-100',
      'refunded': 'text-orange-600 bg-orange-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const getPaymentStatusText = (status) => {
    const statusMap = {
      'pending': 'En attente',
      'paid': 'Payé',
      'failed': 'Échoué',
      'refunded': 'Remboursé'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des commandes</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gérez les commandes et résolvez les litiges
            </p>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Rechercher
              </label>
              <input
                type="text"
                placeholder="Rechercher par numéro de commande ou client..."
                value={searchTerm}
                onChange={handleSearch}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Statut
              </label>
              <select
                value={statusFilter}
                onChange={handleStatusFilter}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="disputed">En litige</option>
                <option value="processing">En cours</option>
                <option value="completed">Terminées</option>
                <option value="cancelled">Annulées</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des commandes */}
        <div className="bg-white shadow sm:rounded-md">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune commande</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter 
                  ? 'Aucune commande ne correspond à vos critères de recherche.'
                  : 'Aucune commande n\'a encore été passée.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
              {orders.map((order) => (
              <div key={order._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-medium text-gray-900">
                            {order.orderNumber}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                            {getPaymentStatusText(order.paymentStatus)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          <strong>Client:</strong> {order.customer.firstName} {order.customer.lastName} ({order.customer.email})
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Producteur:</strong> {order.producer.firstName} {order.producer.lastName} - {order.producer.farmName}
                        </p>
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            <strong>Produits:</strong>
                          </p>
                          <ul className="text-sm text-gray-600 ml-4">
                            {order.items.map((item, index) => (
                              <li key={index}>
                                {item.quantity}x {parseProductName(item.product?.name)} - {formatPrice(item.price)}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          <strong>Total:</strong> {formatPrice(order.totalAmount)}
                        </p>
                        {order.disputeReason && (
                          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                            <p className="text-xs text-red-700">
                              <strong>Raison du litige:</strong> {order.disputeReason}
                            </p>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/admin/orders/${order._id}`}
                      className="text-blue-600 hover:text-blue-900"
                      title="Voir détails"
                    >
                      <Eye className="h-5 w-5" />
                    </Link>
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order._id, 'confirmed')}
                        className="text-green-600 hover:text-green-900"
                        title="Confirmer"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                    )}
                    {order.status === 'disputed' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order._id, 'resolved')}
                        className="text-green-600 hover:text-green-900"
                        title="Résoudre le litige"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                    )}
                    {(order.status === 'pending' || order.status === 'confirmed') && (
                      <button
                        onClick={() => {
                          const reason = window.prompt('Raison de l\'annulation:');
                          if (reason) handleCancelOrder(order._id, reason);
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Annuler"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>


        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-harvests-light disabled:opacity-50"
            >
              Précédent
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-harvests-light disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Affichage de <span className="font-medium">1</span> à <span className="font-medium">{orders.length}</span> sur{' '}
                <span className="font-medium">{orders.length}</span> résultats
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-harvests-light disabled:opacity-50"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-harvests-light disabled:opacity-50"
                >
                  Suivant
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
