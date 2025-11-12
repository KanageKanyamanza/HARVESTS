import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { producerService } from '../../../services';
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

  const getOrderStatus = useCallback(
    (order) => order?.segment?.status || order?.status || 'pending',
    []
  );

  const loadOrders = useCallback(async () => {
    if (user?.userType !== 'producer') return;

    try {
      setLoading(true);
      const response = await producerService.getOrders();
      const ordersData = response.data.data?.orders || response.data.orders || [];

      if (Array.isArray(ordersData)) {
        const missingSegments = ordersData.filter(order => !order.segment && order.items?.length);
        if (missingSegments.length > 0) {
          console.warn(`[Harvests] ${missingSegments.length} commande(s) sans segment détectée(s). Elles seront régénérées automatiquement lors des prochaines opérations.`);
        }
      }

      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [user?.userType]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const updateOrderStatus = async (order, newStatus, segmentId, options = {}) => {
    const orderId = order?._id;
    if (!orderId) return;

    try {
      // Marquer cette commande comme en cours de mise à jour
      setUpdatingOrders(prev => new Set([...prev, orderId]));

      const payload = {
        status: newStatus,
        segmentId,
        ...(options.itemId ? { itemId: options.itemId } : {}),
        ...(options.itemIds ? { itemIds: options.itemIds } : {})
      };

      // Appel API pour mettre à jour le statut
      const response = await producerService.updateOrderStatus(orderId, payload);

      if (response.data.status === 'success') {
        console.log(`Commande ${orderId} ${newStatus} avec succès`);
        await loadOrders();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      // Optionnel : afficher une notification d'erreur
    } finally {
      // Retirer cette commande de la liste des commandes en cours de mise à jour
      setUpdatingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };


  const filteredOrders = orders.filter(order => {
    if (!order) return false;
    
    const matchesSearch = searchTerm === '' || 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const orderStatus = getOrderStatus(order);
    const matchesStatus = statusFilter === 'all' || orderStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <ModularDashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Mes commandes</h1>
          <p className="text-gray-600 mt-1">
            Gérez et suivez toutes les commandes reçues
          </p>
        </div>

        {/* Filters and Search */}
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
                <option value="preparing">En préparation</option>
                <option value="ready-for-pickup">Prêtes pour collecte</option>
                <option value="in-transit">En transit</option>
                <option value="delivered">Livrées</option>
                <option value="completed">Terminées</option>
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

        <OrderList 
          orders={filteredOrders}
          userType="producer"
          onUpdateStatus={updateOrderStatus}
          loading={loading}
          updatingOrders={updatingOrders}
        />
      </div>
    </ModularDashboardLayout>
  );
};

export default Orders;
