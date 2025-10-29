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

  useEffect(() => {
    const loadOrders = async () => {
      if (user?.userType === 'exporter') {
        try {
          setLoading(true);
          const response = await exporterService.getOrders();
          // Structure de réponse: data.data.exportOrders ou data.exportOrders ou data.orders
          const ordersData = response.data.data?.exportOrders || response.data.data?.orders || response.data.exportOrders || response.data.orders || [];
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

  const filteredOrders = orders.filter(order => {
    if (!order) return damage;
    
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

        <OrderList 
          orders={filteredOrders}
          userType="exporter"
          loading={loading}
        />
      </div>
    </ModularDashboardLayout>
  );
};

export default Orders;

