import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { transporterService } from '../../../services';
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
                <option value="pending">En attente</option>
                <option value="accepted">Acceptée</option>
                <option value="in-transit">En transit</option>
                <option value="delivered">Livrée</option>
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
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-harvests-green"></div>
            <p className="mt-4 text-gray-600">Chargement des livraisons...</p>
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
          <OrderList orders={filteredOrders} userType="transporter" />
        )}
      </div>
    </ModularDashboardLayout>
  );
};

export default Orders;

