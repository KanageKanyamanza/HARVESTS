import React, { useState, useEffect } from 'react';
import GenericDashboard from '../../../components/dashboard/GenericDashboard';
import ProductsSection from '../../../components/dashboard/sections/ProductsSection';
import OrdersSection from '../../../components/dashboard/sections/OrdersSection';
import QuickActionsSection from '../../../components/dashboard/sections/QuickActionsSection';
import { exporterService } from '../../../services/genericService';
import commonService from '../../../services/commonService';
import { FiGlobe } from 'react-icons/fi';

const ExporterDashboard = () => {
  const [exporterStats, setExporterStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExporterStats();
  }, []);

  const loadExporterStats = async () => {
    try {
      setLoading(true);
      const response = await exporterService.getStats();
      setExporterStats(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  // Configuration des statistiques pour les exportateurs
  const statsConfig = (baseStats) => {
    // Si les stats ne sont pas encore chargées, utiliser les stats de base
    if (!exporterStats) {
      return baseStats;
    }
    
    return {
      ...baseStats,
      // Statistiques spécifiques aux exportateurs depuis le backend
      totalExports: exporterStats?.data?.stats?.totalExports || 0,
      totalValue: exporterStats?.data?.stats?.totalValue || 0,
      exportValue: exporterStats?.data?.stats?.totalValue || 0,
      monthlyRevenue: exporterStats?.data?.stats?.monthlyRevenue || 0,
      totalRevenue: exporterStats?.data?.stats?.totalRevenue || 0,
      totalOrders: exporterStats?.data?.stats?.totalOrders || 0,
      completedOrders: exporterStats?.data?.stats?.completedOrders || 0,
      pendingOrders: exporterStats?.data?.stats?.pendingOrders || 0,
      exportCountries: exporterStats?.data?.stats?.exportCountries || 0,
      exportProductsCount: exporterStats?.data?.stats?.exportProductsCount || 0,
      activeLicenses: exporterStats?.data?.stats?.activeLicenses || 0,
      successfulDeliveryRate: exporterStats?.data?.stats?.successfulDeliveryRate || 0,
      averageRating: exporterStats?.data?.stats?.averageRating || 0,
      totalReviews: exporterStats?.data?.stats?.totalReviews || 0,
      totalProducts: exporterStats?.data?.stats?.totalProducts || 0,
      activeProducts: exporterStats?.data?.stats?.activeProducts || 0
    };
  };

  // Configuration des sections du dashboard
  const sections = [
    {
      title: 'Produits d\'Export',
      icon: <FiGlobe className="h-5 w-5" />,
      action: {
        text: 'Voir tous',
        to: '/exporter/products'
      },
      content: <ProductsSection userType="exporter" />
    },
    {
      title: 'Commandes d\'Export',
      icon: <FiGlobe className="h-5 w-5" />,
      action: {
        text: 'Voir toutes',
        to: '/exporter/orders'
      },
      content: <OrdersSection userType="exporter" />
    },
    {
      title: 'Actions Rapides',
      icon: <FiGlobe className="h-5 w-5" />,
      content: <QuickActionsSection userType="exporter" />,
      fullWidth: true
    }
  ];

  return (
    <GenericDashboard
      userType="exporter"
      service={exporterService}
      commonService={commonService}
      title="Dashboard Exportateur"
      description="Gérez vos exportations et marchés internationaux"
      icon={<FiGlobe className="h-8 w-8 text-teal-600" />}
      statsConfig={statsConfig}
      sections={sections}
      loading={loading}
    />
  );
};

export default ExporterDashboard;
