import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { transporterService } from '../../../services';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import OrderList from '../../../components/orders/OrderList';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { FiSearch, FiRefreshCw } from 'react-icons/fi';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingOrders, setUpdatingOrders] = useState(new Set());

  useEffect(() => {
    const loadOrders = async () => {
      if (user?.userType === 'transporter') {
        try {
          setLoading(true);
          const response = await transporterService.getOrders();
          const ordersData = response.data.data?.deliveries || response.data.data?.orders || response.data.deliveries || response.data.orders || [];
          setOrders(Array.isArray(ordersData) ? ordersData : []);
        } catch (error) {
          console.error('Erreur lors du chargement des livraisons:', error);
          setOrders([]);
        } finally {
          setLoading(false);
        }
      }
    };

    loadOrders();
  }, [user]);

  const handleUpdateStatus = async (order, newStatus, segmentId = null, options = {}) => {
    if (updatingOrders.has(order._id)) return;

    try {
      setUpdatingOrders(prev => new Set(prev).add(order._id));

      // Mapper les statuts pour les transporteurs
      let deliveryStatus = newStatus;
      if (newStatus === 'ready-for-pickup') {
        deliveryStatus = 'picked-up'; // Quand le transporteur collecte
      } else if (newStatus === 'in-transit' || newStatus === 'out-for-delivery') {
        deliveryStatus = 'in-transit';
      } else if (newStatus === 'delivered') {
        deliveryStatus = 'delivered';
      }

      const response = await transporterService.updateOrderStatus(order._id, {
        status: deliveryStatus,
        location: order.delivery?.deliveryAddress?.city || null,
        note: `Statut mis à jour par ${user?.firstName || 'Transporteur'}`
      });

      if (response.data?.status === 'success') {
        // Recharger les commandes
        const refreshResponse = await transporterService.getOrders();
        const ordersData = refreshResponse.data.data?.deliveries || refreshResponse.data.data?.orders || [];
        setOrders(Array.isArray(ordersData) ? ordersData : []);
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
      order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.deliveryAddress?.city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <ModularDashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Livraisons locales</h1>
          <p className="text-gray-600 mt-1">
            Gérez et suivez toutes vos livraisons locales
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par numéro de commande, ville..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
              >
                <option value="all">Tous les statuts</option>
                <option value="confirmed">Confirmée</option>
                <option value="preparing">En préparation</option>
                <option value="ready-for-pickup">Prête pour collecte</option>
                <option value="in-transit">En transit</option>
                <option value="delivered">Livrée</option>
                <option value="completed">Terminée</option>
                <option value="cancelled">Annulée</option>
              </select>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center"
            >
              <FiRefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" text="Chargement des livraisons..." />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Aucune livraison trouvée avec ces critères.'
                : 'Aucune livraison pour le moment.'
              }
            </p>
          </div>
        ) : (
          <OrderList 
            orders={filteredOrders} 
            userType="transporter" 
            onUpdateStatus={handleUpdateStatus}
            updatingOrders={updatingOrders}
          />
        )}
      </div>
    </ModularDashboardLayout>
  );
};

export default Orders;

