import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { exporterService } from '../../../services';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import OrderList from '../../../components/orders/OrderList';
import { FiSearch, FiRefreshCw } from 'react-icons/fi';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingOrders, setUpdatingOrders] = useState(new Set());

  const loadOrders = async () => {
    if (user?.userType === 'exporter') {
      try {
        setLoading(true);
        const response = await exporterService.getOrders();
        // Structure de réponse: data.data.exportOrders ou data.exportOrders ou data.orders
        const ordersData = response.data.data?.exportOrders || response.data.data?.orders || response.data.exportOrders || response.data.orders || [];
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      } catch (error) {
        console.error('Erreur lors du chargement des commandes:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user]);

  const handleUpdateStatus = async (order, newStatus, segmentId = null, options = {}) => {
    if (updatingOrders.has(order._id)) return;

    try {
      setUpdatingOrders(prev => new Set(prev).add(order._id));

      // Mapper les statuts pour les exportateurs (similaire aux transporteurs)
      let deliveryStatus = newStatus;
      if (newStatus === 'ready-for-pickup') {
        deliveryStatus = 'picked-up'; // Quand l'exportateur collecte
      } else if (newStatus === 'in-transit' || newStatus === 'out-for-delivery') {
        deliveryStatus = 'in-transit';
      } else if (newStatus === 'delivered') {
        deliveryStatus = 'delivered';
      }

      const response = await exporterService.updateOrderStatus(order._id, {
        status: deliveryStatus,
        location: order.delivery?.deliveryAddress?.city || null,
        note: `Statut mis à jour par ${user?.firstName || 'Exportateur'}`
      });

      if (response.data?.status === 'success') {
        // Recharger les commandes
        await loadOrders();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      alert(error.response?.data?.message || 'Erreur lors de la mise à jour du statut');
    } finally {
      setUpdatingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(order._id);
        return newSet;
      });
    }
  };

  const filteredOrders = orders.filter(order => {
    if (!order) return false;
    
    const matchesSearch = searchTerm === '' || 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <ModularDashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Commandes d'export</h1>
          <p className="text-gray-600 mt-1">
            Gérez et suivez toutes vos commandes d'export
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par numéro de commande..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-harvests-green"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmées</option>
                <option value="processing">En préparation</option>
                <option value="shipped">Expédiées</option>
                <option value="delivered">Livrées</option>
                <option value="cancelled">Annulées</option>
              </select>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-harvests-light"
              >
                <FiRefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-harvests-green"></div>
            <p className="mt-4 text-gray-600">Chargement des commandes...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Aucune commande trouvée avec ces critères.'
                : 'Aucune commande d\'export pour le moment.'
              }
            </p>
          </div>
        ) : (
          <OrderList 
            orders={filteredOrders}
            userType="exporter"
            onUpdateStatus={handleUpdateStatus}
            updatingOrders={updatingOrders}
            loading={loading}
          />
        )}
      </div>
    </ModularDashboardLayout>
  );
};

export default Orders;

