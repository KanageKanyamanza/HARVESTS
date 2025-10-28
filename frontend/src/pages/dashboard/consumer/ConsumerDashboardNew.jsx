import React, { useState, useEffect } from 'react';
import GenericDashboard from '../../../components/dashboard/GenericDashboard';
import OrdersSection from '../../../components/dashboard/sections/OrdersSection';
import FavoritesSection from '../../../components/dashboard/sections/FavoritesSection';
import ReviewsSection from '../../../components/dashboard/sections/ReviewsSection';
import StatisticsSection from '../../../components/dashboard/sections/StatisticsSection';
import QuickActionsSection from '../../../components/dashboard/sections/QuickActionsSection';
import { consumerService } from '../../../services/genericService';
import commonService from '../../../services/commonService';
import { FiShoppingCart, FiHeart, FiStar, FiTrendingUp } from 'react-icons/fi';

const ConsumerDashboard = () => {
  const [consumerStats, setConsumerStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConsumerStats();
  }, []);

  const loadConsumerStats = async () => {
    try {
      setLoading(true);
      const response = await consumerService.getStats();
      setConsumerStats(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  // Configuration des statistiques pour les consommateurs
  const statsConfig = (baseStats) => {
    // Si les stats ne sont pas encore chargées, utiliser les stats de base
    if (!consumerStats) {
      return baseStats;
    }
    
    return {
      ...baseStats,
      // Statistiques spécifiques aux consommateurs depuis le backend
      totalSpent: consumerStats?.data?.stats?.totalSpent || 0,
      totalOrders: consumerStats?.data?.stats?.totalOrders || 0,
      reviewsWritten: consumerStats?.data?.stats?.reviewsWritten || 0,
      averageRatingGiven: consumerStats?.data?.stats?.averageRatingGiven || 0,
      profileViews: consumerStats?.data?.stats?.profileViews || 0,
      favoriteProducers: 0, // À implémenter
      loyaltyPoints: 0 // À implémenter
    };
  };

  // Configuration des sections du dashboard
  const sections = [
    {
      title: 'Mes Commandes',
      icon: <FiShoppingCart className="h-5 w-5" />,
      action: {
        text: 'Voir toutes',
        to: '/consumer/orders'
      },
      content: <OrdersSection userType="consumer" service={consumerService} />
    },
    {
      title: 'Mes Favoris',
      icon: <FiHeart className="h-5 w-5" />,
      action: {
        text: 'Voir tous',
        to: '/consumer/favorites'
      },
      content: <FavoritesSection />
    },
    {
      title: 'Mes Avis',
      icon: <FiStar className="h-5 w-5" />,
      action: {
        text: 'Voir tous',
        to: '/consumer/reviews'
      },
      content: <ReviewsSection />
    },
    {
      title: 'Statistiques',
      icon: <FiTrendingUp className="h-5 w-5" />,
      action: {
        text: 'Voir détail',
        to: '/consumer/statistics'
      },
      content: <StatisticsSection />
    },
    {
      title: 'Actions Rapides',
      icon: <FiShoppingCart className="h-5 w-5" />,
      content: <QuickActionsSection userType="consumer" />,
      fullWidth: true
    }
  ];

  return (
    <GenericDashboard
      userType="consumer"
      service={consumerService}
      commonService={commonService}
      title="Dashboard Consommateur"
      description="Gérez vos commandes et préférences"
      icon={<FiShoppingCart className="h-8 w-8 text-green-600" />}
      statsConfig={statsConfig}
      sections={sections}
      loading={loading}
    />
  );
};

export default ConsumerDashboard;
