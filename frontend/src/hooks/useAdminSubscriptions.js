import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/adminService';

/**
 * Hook personnalisé pour gérer les abonnements admin
 */
export const useAdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        status: statusFilter || undefined,
        planId: planFilter || undefined,
        paymentStatus: paymentStatusFilter || undefined
      };
      const response = await adminService.getSubscriptions(params);
      
      const subscriptionsData = response?.data?.subscriptions || [];
      const total = response?.total || 0;
      const pages = response?.pages || 1;
      
      if (Array.isArray(subscriptionsData)) {
        setSubscriptions(subscriptionsData);
        setTotalPages(pages);
        setTotalItems(total);
      } else {
        setSubscriptions([]);
        setTotalPages(1);
        setTotalItems(total);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des souscriptions:', error);
      setSubscriptions([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, planFilter, paymentStatusFilter]);

  const loadStats = useCallback(async () => {
    try {
      const response = await adminService.getSubscriptionStats();
      if (response.data && response.data.stats) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  }, []);

  useEffect(() => {
    loadSubscriptions();
    loadStats();
  }, [loadSubscriptions, loadStats]);

  // Filtrer les subscriptions par recherche
  const filteredSubscriptions = subscriptions.filter(sub => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const userName = `${sub.user?.firstName || ''} ${sub.user?.lastName || ''}`.toLowerCase();
      const userEmail = sub.user?.email?.toLowerCase() || '';
      return userName.includes(searchLower) || userEmail.includes(searchLower);
    }
    return true;
  });

  return {
    subscriptions,
    filteredSubscriptions,
    stats,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    planFilter,
    setPlanFilter,
    paymentStatusFilter,
    setPaymentStatusFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    loadSubscriptions
  };
};

