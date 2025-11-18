import React, { useState, useEffect } from 'react';
import GenericDashboard from '../../../components/dashboard/GenericDashboard';
import OrdersSection from '../../../components/dashboard/sections/OrdersSection';
import QuickActionsSection from '../../../components/dashboard/sections/QuickActionsSection';
import FleetSummarySection from '../../../components/dashboard/sections/FleetSummarySection';
import SubscriptionSection from '../../../components/dashboard/sections/SubscriptionSection';
import { exporterService } from '../../../services/genericService';
import commonService from '../../../services/commonService';
import { FiGlobe, FiTruck, FiStar } from 'react-icons/fi';

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
      console.log('[ExporterDashboard] Stats response:', response);
      // La réponse est { status: 'success', data: { stats: {...} } }
      setExporterStats(response.data?.data || response.data);
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
    
    // exporterStats peut être { stats: {...} } ou { status: 'success', data: { stats: {...} } }
    const stats = exporterStats?.stats || exporterStats?.data?.stats || {};
    
    return {
      ...baseStats,
      // Statistiques spécifiques aux exportateurs depuis le backend
      totalExports: stats.totalExports || 0,
      totalValue: stats.totalValue || 0,
      exportValue: stats.totalValue || 0,
      monthlyRevenue: stats.monthlyRevenue || 0,
      totalRevenue: stats.totalRevenue || 0,
      totalOrders: stats.totalOrders || 0,
      completedOrders: stats.completedExports || stats.completedOrders || 0,
      pendingOrders: stats.pendingExports || stats.pendingOrders || 0,
      exportCountries: stats.exportCountries || 0,
      exportProductsCount: stats.exportProductsCount || 0,
      activeLicenses: stats.activeLicenses || 0,
      successfulDeliveryRate: stats.successfulDeliveryRate || 0,
      averageRating: stats.averageRating || 0,
      totalReviews: stats.totalReviews || 0,
      totalProducts: stats.totalProducts || 0,
      activeProducts: stats.activeProducts || 0
    };
  };

  // Configuration des sections du dashboard
  const sections = [
    {
      title: 'Mon Abonnement',
      icon: <FiStar className="h-5 w-5" />,
      content: <SubscriptionSection />,
      fullWidth: false
    },
    {
      title: 'Commandes d\'Export',
      icon: <FiGlobe className="h-5 w-5" />,
      action: {
        text: 'Voir toutes',
        to: '/exporter/orders'
      },
      content: <OrdersSection userType="exporter" service={exporterService} />
    },
    {
      title: 'Gestion de la flotte',
      icon: <FiTruck className="h-5 w-5" />,
      content: <FleetSummarySection />
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
