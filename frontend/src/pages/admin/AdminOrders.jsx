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
  AlertTriangle,
  Truck,
  Loader
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
  
  // États pour l'assignation de livreur
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [availableTransporters, setAvailableTransporters] = useState([]);
  const [loadingTransporters, setLoadingTransporters] = useState(false);
  const [assigning, setAssigning] = useState(false);

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

  const handleOpenAssignModal = async (order) => {
    setSelectedOrder(order);
    setShowAssignModal(true);
    setLoadingTransporters(true);
    
    try {
      const response = await adminService.getAvailableTransporters(order._id);
      if (response.status === 'success' && response.data) {
        setAvailableTransporters(response.data.transporters || []);
      } else {
        setAvailableTransporters([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des transporteurs:', error);
      setAvailableTransporters([]);
    } finally {
      setLoadingTransporters(false);
    }
  };

  const handleAssignTransporter = async (transporterId) => {
    if (!selectedOrder) return;
    
    setAssigning(true);
    try {
      await adminService.assignTransporterToOrder(selectedOrder._id, transporterId);
      setShowAssignModal(false);
      setSelectedOrder(null);
      setAvailableTransporters([]);
      loadOrders(); // Recharger la liste des commandes
    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error);
      alert(error.response?.data?.message || 'Erreur lors de l\'assignation du transporteur');
    } finally {
      setAssigning(false);
    }
  };

  const handleCloseModal = () => {
    setShowAssignModal(false);
    setSelectedOrder(null);
    setAvailableTransporters([]);
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
                        {order.transporter && (
                          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                            <div className="flex items-center space-x-2">
                              <p className="text-xs text-blue-700">
                                <strong>Livreur assigné:</strong> {order.transporter.companyName || `${order.transporter.firstName} ${order.transporter.lastName}`}
                              </p>
                              {order.transporter.userType && (
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                                  order.transporter.userType === 'exporter' 
                                    ? 'bg-indigo-100 text-indigo-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {order.transporter.userType === 'exporter' ? '🚢 Exportateur' : '🚛 Transporteur'}
                                </span>
                              )}
                            </div>
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
                    {!order.transporter && (order.status === 'confirmed' || order.status === 'processing') && (
                      <button
                        onClick={() => handleOpenAssignModal(order)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Assigner un livreur"
                      >
                        <Truck className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>

        {/* Modal d'assignation de livreur */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={handleCloseModal}>
            <div className="relative top-2 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Assigner un livreur - Commande {selectedOrder?.orderNumber}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {selectedOrder?.delivery?.deliveryAddress && (
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-700">
                    <strong>Zone de livraison:</strong> {selectedOrder.delivery.deliveryAddress.city || ''} {selectedOrder.delivery.deliveryAddress.region || ''}
                  </p>
                </div>
              )}

              {loadingTransporters ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="h-8 w-8 animate-spin text-green-600" />
                </div>
              ) : availableTransporters.length === 0 ? (
                <div className="text-center py-8">
                  <Truck className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    Aucun livreur disponible pour cette zone de livraison
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {availableTransporters.map((transporter) => (
                    <div
                      key={transporter._id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-medium text-gray-900">
                              {transporter.companyName || `${transporter.firstName} ${transporter.lastName}`}
                            </h4>
                            {transporter.userType && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                transporter.userType === 'exporter' 
                                  ? 'bg-indigo-100 text-indigo-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {transporter.userType === 'exporter' ? '🚢 Exportateur' : '🚛 Transporteur'}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {transporter.email} {transporter.phone && `• ${transporter.phone}`}
                          </p>
                          {(!transporter.serviceAreas || transporter.serviceAreas.length === 0) && transporter.userType === 'transporter' && (
                            <p className="text-xs text-amber-600 mt-1 italic">
                              ⚠️ Aucune zone de service définie
                            </p>
                          )}
                          {transporter.performance && (
                            <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                              <span>Taux de ponctualité: {transporter.performance.onTimeDeliveryRate || 0}%</span>
                              <span>Note: {transporter.performance.averageRating || 0}/5</span>
                              <span>Livraisons: {transporter.performance.totalDeliveries || 0}</span>
                            </div>
                          )}
                          {transporter.serviceAreas && transporter.serviceAreas.length > 0 && (
                            <div className="mt-2 text-xs text-gray-500">
                              <span className="font-medium">Zones:</span> {transporter.serviceAreas.map(area => area.region).filter((v, i, a) => a.indexOf(v) === i).join(', ')}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleAssignTransporter(transporter._id)}
                          disabled={assigning}
                          className="ml-4 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {assigning ? 'Assignation...' : 'Assigner'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}


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
