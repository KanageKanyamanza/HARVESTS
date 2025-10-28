import React, { useState, useEffect } from 'react';
import GenericDashboard from '../../../components/dashboard/GenericDashboard';
import ProductsSection from '../../../components/dashboard/sections/ProductsSection';
import OrdersSection from '../../../components/dashboard/sections/OrdersSection';
import QuickActionsSection from '../../../components/dashboard/sections/QuickActionsSection';
import { producerService } from '../../../services/genericService';
import commonService from '../../../services/commonService';
import { FiPackage } from 'react-icons/fi';

const ProducerDashboard = () => {
  const [producerStats, setProducerStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducerStats();
  }, []);

  const loadProducerStats = async () => {
    try {
      setLoading(true);
      const response = await producerService.getStats();
      setProducerStats(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  // Configuration des statistiques pour les producteurs
  const statsConfig = (baseStats) => {
    // Si les stats ne sont pas encore chargées, utiliser les stats de base
    if (!producerStats) {
      return baseStats;
    }
    
    return {
      ...baseStats,
      // Statistiques spécifiques aux producteurs depuis le backend
      monthlyRevenue: producerStats?.data?.stats?.totalRevenue || 0, // Utiliser totalRevenue pour monthlyRevenue
      totalRevenue: producerStats?.data?.stats?.totalRevenue || 0,
      totalOrders: producerStats?.data?.stats?.totalOrders || 0,
      completedOrders: producerStats?.data?.stats?.completedOrders || 0,
      totalProducts: producerStats?.data?.stats?.totalProducts || 0,
      activeProducts: producerStats?.data?.stats?.activeProducts || 0,
      totalProductsSold: producerStats?.data?.stats?.totalProductsSold || 0,
      uniqueCustomers: producerStats?.data?.stats?.uniqueCustomers || 0,
      averageOrderValue: producerStats?.data?.stats?.averageOrderValue || 0,
      conversionRate: producerStats?.data?.stats?.conversionRate || 0,
      averageRating: producerStats?.data?.stats?.averageRating || 0
    };
  };

  // Configuration des sections du dashboard
  const sections = [
    {
      title: 'Mes Produits',
      icon: <FiPackage className="h-5 w-5" />,
      action: {
        text: 'Voir tous',
        to: '/producer/products'
      },
      content: <ProductsSection userType="producer" />
    },
    {
      title: 'Commandes Récentes',
      icon: <FiPackage className="h-5 w-5" />,
      action: {
        text: 'Voir toutes',
        to: '/producer/orders'
      },
      content: <OrdersSection userType="producer" />
    },
    {
      title: 'Actions Rapides',
      icon: <FiPackage className="h-5 w-5" />,
      content: <QuickActionsSection userType="producer" />,
      fullWidth: true
    }
  ];

  return (
    <GenericDashboard
      userType="producer"
      service={producerService}
      commonService={commonService}
      title="Dashboard Producteur"
      description="Gérez vos produits, commandes et statistiques"
      icon={<FiPackage className="h-8 w-8 text-blue-600" />}
      statsConfig={statsConfig}
      sections={sections}
      loading={loading}
    />
  );
};

export default ProducerDashboard;
