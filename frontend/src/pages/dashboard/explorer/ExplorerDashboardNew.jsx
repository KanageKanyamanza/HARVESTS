import React, { useState, useEffect } from 'react';
import GenericDashboard from '../../../components/dashboard/GenericDashboard';
import OrdersSection from '../../../components/dashboard/sections/OrdersSection';
import FavoritesSection from '../../../components/dashboard/sections/FavoritesSection';
import ReviewsSection from '../../../components/dashboard/sections/ReviewsSection';
import StatisticsSection from '../../../components/dashboard/sections/StatisticsSection';
import QuickActionsSection from '../../../components/dashboard/sections/QuickActionsSection';
import { explorerService } from '../../../services/genericService';
import commonService from '../../../services/commonService';
import { FiCompass, FiHeart, FiStar, FiTrendingUp, FiSearch } from 'react-icons/fi';

const ExplorerDashboard = () => {
  const [explorerStats, setExplorerStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExplorerStats();
  }, []);

  const loadExplorerStats = async () => {
    try {
      setLoading(true);
      const response = await explorerService.getStats();
      setExplorerStats(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  // Configuration des statistiques pour les explorateurs
  const statsConfig = (baseStats) => {
    // Si les stats ne sont pas encore chargées, utiliser les stats de base
    if (!explorerStats) {
      return baseStats;
    }
    
    return {
      ...baseStats,
      // Statistiques spécifiques aux explorateurs depuis le backend
      totalVisits: explorerStats?.data?.stats?.totalVisits || 0,
      producersExplored: explorerStats?.data?.stats?.producersExplored || 0,
      productsDiscovered: explorerStats?.data?.stats?.productsDiscovered || 0,
      totalOrders: explorerStats?.data?.stats?.totalOrders || 0,
      reviewsWritten: explorerStats?.data?.stats?.reviewsWritten || 0,
      averageRatingGiven: explorerStats?.data?.stats?.averageRatingGiven || 0,
      favoriteProducers: explorerStats?.data?.stats?.favoriteProducers || 0
    };
  };

  // Configuration des sections du dashboard
  const sections = [
    {
      title: 'Mes Découvertes',
      icon: <FiCompass className="h-5 w-5" />,
      action: {
        text: 'Explorer',
        to: '/explorer/discover'
      },
      content: <OrdersSection userType="explorer" service={explorerService} />
    },
    {
      title: 'Mes Favoris',
      icon: <FiHeart className="h-5 w-5" />,
      action: {
        text: 'Voir tous',
        to: '/explorer/favorites'
      },
      content: <FavoritesSection />
    },
    {
      title: 'Mes Avis',
      icon: <FiStar className="h-5 w-5" />,
      action: {
        text: 'Voir tous',
        to: '/explorer/reviews'
      },
      content: <ReviewsSection />
    },
    {
      title: 'Statistiques',
      icon: <FiTrendingUp className="h-5 w-5" />,
      action: {
        text: 'Voir détail',
        to: '/explorer/statistics'
      },
      content: <StatisticsSection />
    },
    {
      title: 'Actions Rapides',
      icon: <FiSearch className="h-5 w-5" />,
      content: <QuickActionsSection userType="explorer" />,
      fullWidth: true
    }
  ];

  return (
    <GenericDashboard
      userType="explorer"
      service={explorerService}
      commonService={commonService}
      title="Dashboard Explorateur"
      description="Explorez et découvrez de nouveaux produits et producteurs"
      icon={<FiCompass className="h-8 w-8 text-cyan-600" />}
      statsConfig={statsConfig}
      sections={sections}
      loading={loading}
    />
  );
};

export default ExplorerDashboard;

