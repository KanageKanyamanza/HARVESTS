import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { producerService } from '../../../services';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import { FiShoppingBag, FiSearch, FiFilter, FiEye, FiCheckCircle, FiXCircle, FiClock, FiTruck } from 'react-icons/fi';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const loadOrders = async () => {
      if (user?.userType === 'producer') {
        try {
          setLoading(true);
          const response = await producerService.getOrders();
          const ordersData = Array.isArray(response.data.orders) ? response.data.orders : 
                           Array.isArray(response.data) ? response.data : [];
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
      'pending': { color: 'bg-yellow-100 text-yellow-800', text: 'En attente', icon: FiClock },
      'confirmed': { color: 'bg-blue-100 text-blue-800', text: 'Confirmée', icon: FiCheckCircle },
      'shipped': { color: 'bg-purple-100 text-purple-800', text: 'Expédiée', icon: FiTruck },
      'delivered': { color: 'bg-green-100 text-green-800', text: 'Livrée', icon: FiCheckCircle },
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

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await producerService.updateOrderStatus(orderId, { status: newStatus });
      setOrders(prev => prev.map(order => 
        order.id === orderId || order._id === orderId 
          ? { ...order, status: newStatus }
          : order
      ));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

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
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mes commandes</h1>
              <p className="text-gray-600 mt-1">Gérez les commandes de vos produits</p>
            </div>
          </div>
        </div>

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
                  <option value="confirmed">Confirmées</option>
                  <option value="shipped">Expédiées</option>
                  <option value="delivered">Livrées</option>
                  <option value="cancelled">Annulées</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <FiShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune commande trouvée</h3>
              <p className="mt-1 text-sm text-gray-500">
                Vous n'avez pas encore reçu de commandes
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div key={order.id || order._id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Commande #{order.orderNumber || order.id || order._id}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {order.customer?.name || order.buyer?.name || 'Client'} • {order.date || order.createdAt}
                          </p>
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
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Articles commandés</h4>
                          <ul className="space-y-1">
                            {order.items?.map((item, index) => (
                              <li key={index} className="text-sm text-gray-600">
                                {item.quantity}x {item.name} - {item.price?.toLocaleString()} FCFA
                              </li>
                            )) || <li className="text-sm text-gray-500">Aucun détail disponible</li>}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Adresse de livraison</h4>
                          <p className="text-sm text-gray-600">{order.deliveryAddress || 'Non spécifiée'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="flex flex-wrap gap-2">
                        <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                          <FiEye className="h-4 w-4 mr-2" />
                          Voir détails
                        </button>
                        
                        {order.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => updateOrderStatus(order.id || order._id, 'confirmed')}
                              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                            >
                              <FiCheckCircle className="h-4 w-4 mr-2" />
                              Confirmer
                            </button>
                            <button 
                              onClick={() => updateOrderStatus(order.id || order._id, 'cancelled')}
                              className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                            >
                              <FiXCircle className="h-4 w-4 mr-2" />
                              Annuler
                            </button>
                          </>
                        )}
                        
                        {order.status === 'confirmed' && (
                          <button 
                            onClick={() => updateOrderStatus(order.id || order._id, 'shipped')}
                            className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                          >
                            <FiTruck className="h-4 w-4 mr-2" />
                            Marquer comme expédiée
                          </button>
                        )}
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

export default Orders;
