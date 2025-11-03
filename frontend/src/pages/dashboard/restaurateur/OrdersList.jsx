import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { restaurateurService } from '../../../services';
import { useNotifications } from '../../../contexts/NotificationContext';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import OrderList from '../../../components/orders/OrderList';
import {
  FiShoppingCart,
  FiSearch,
  FiRefreshCw
} from 'react-icons/fi';

const OrdersList = () => {
  const { showSuccess, showError } = useNotifications();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingOrders, setUpdatingOrders] = useState(new Set());

  // Charger les commandes
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const response = await restaurateurService.getOrders();
        const ordersData = response.data.data?.orders || response.data.orders || [];
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      } catch (error) {
        console.error('Erreur lors du chargement des commandes:', error);
        setError('Erreur lors du chargement des commandes');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  // Mettre à jour le statut d'une commande
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Marquer cette commande comme en cours de mise à jour
      setUpdatingOrders(prev => new Set([...prev, orderId]));
      
      // Appel API pour mettre à jour le statut
      const response = await restaurateurService.updateOrderStatus(orderId, { status: newStatus });
      
      if (response.data.status === 'success') {
        // Mise à jour optimiste de l'état local
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { ...order, status: newStatus }
              : order
          )
        );
        showSuccess(`Commande ${newStatus === 'confirmed' ? 'confirmée' : newStatus === 'cancelled' ? 'annulée' : 'mise à jour'} avec succès`);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      showError('Erreur lors de la mise à jour du statut');
    } finally {
      // Retirer cette commande de la liste des commandes en cours de mise à jour
      setUpdatingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  // Filtrer les commandes
  const filteredOrders = orders.filter(order => {
    if (!order) return false;
    
    const matchesSearch = searchTerm === '' || 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.buyer?.firstName && order.buyer.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.buyer?.lastName && order.buyer.lastName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    // Pour les restaurateurs, ne montrer que les commandes où ils sont vendeurs (commandes reçues)
    // Les commandes d'achat peuvent être filtrées si nécessaire
    const isReceivedOrder = order.role === 'seller' || (!order.role && order.seller); // Si role existe, utiliser role, sinon vérifier que seller existe
    
    return matchesStatus && matchesSearch && isReceivedOrder;
  });

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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Mes Commandes</h1>
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
                <option value="ready-for-pickup">Prête pour collecte</option>
                <option value="in-transit">En transit</option>
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
          userType="restaurateur"
          onUpdateStatus={updateOrderStatus}
          loading={loading}
          updatingOrders={updatingOrders}
        />
      </div>
    </ModularDashboardLayout>
  );
};

export default OrdersList;
