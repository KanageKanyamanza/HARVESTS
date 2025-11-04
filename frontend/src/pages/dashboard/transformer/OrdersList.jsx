import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { transformerService } from '../../../services';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import OrderList from '../../../components/orders/OrderList';
import EmailVerificationRequired from '../../../components/common/EmailVerificationRequired';
import { FiSearch, FiRefreshCw } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';

const OrdersList = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingOrders, setUpdatingOrders] = useState(new Set());
  const [emailVerificationError, setEmailVerificationError] = useState(null);

  // Initialiser le filtre basé sur les paramètres URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const statusParam = urlParams.get('status');
    if (statusParam) {
      setStatusFilter(statusParam);
    }
  }, [location.search]);


  useEffect(() => {
    const loadOrders = async () => {
      if (user?.userType === 'transformer') {
      try {
        setLoading(true);
        setEmailVerificationError(null);
          
        const response = await transformerService.getMyOrders();
          const ordersData = response.data.data?.orders || response.data.orders || [];
          
          setOrders(ordersData);
      } catch (error) {
        console.error('Erreur lors du chargement des commandes:', error);
        
        // Vérifier si c'est une erreur de vérification d'email
        if (error.response?.status === 403 && error.response?.data?.code === 'EMAIL_VERIFICATION_REQUIRED') {
          setEmailVerificationError(error.response.data);
        }
        
        setOrders([]);
      } finally {
        setLoading(false);
        }
      }
    };

    loadOrders();
  }, [user]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      console.log(`🔄 Mise à jour du statut vers: ${newStatus} pour la commande: ${orderId}`);
      
      // Marquer cette commande comme en cours de mise à jour
      setUpdatingOrders(prev => new Set([...prev, orderId]));
      
      // Appel API pour mettre à jour le statut
      const response = await transformerService.updateOrderStatus(orderId, { status: newStatus });
      
      console.log('📡 Réponse API:', response);
      
      if (response.data.status === 'success') {
        // Mise à jour optimiste de l'état local
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { ...order, status: newStatus }
              : order
          )
        );
        console.log(`✅ Commande ${orderId} ${newStatus} avec succès`);
      } else {
        console.error('❌ Erreur dans la réponse API:', response.data);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du statut:', error);
      if (error.response) {
        console.error('📡 Détails de l\'erreur API:', error.response.data);
      }
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
    
    let matchesStatus = true;
    if (statusFilter === 'all') {
      matchesStatus = true;
    } else if (statusFilter === 'active') {
      // Toutes les commandes non terminées
      matchesStatus = !['completed', 'cancelled'].includes(order.status);
    } else {
      matchesStatus = order.status === statusFilter;
    }
    
    return matchesSearch && matchesStatus;
  });

  return (
    <ModularDashboardLayout userType="transformer">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Message de vérification d'email */}
        {emailVerificationError && (
          <EmailVerificationRequired 
            errorData={emailVerificationError} 
            onResendEmail={() => {
              setEmailVerificationError(null);
              setTimeout(() => {
                window.location.reload();
              }, 2000);
            }}
          />
        )}

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
                <option value="active">En cours</option>
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmées</option>
                <option value="preparing">En préparation</option>
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
          userType="transformer"
          onUpdateStatus={updateOrderStatus}
          loading={loading}
          updatingOrders={updatingOrders}
        />
      </div>
    </ModularDashboardLayout>
  );
};

export default OrdersList;
