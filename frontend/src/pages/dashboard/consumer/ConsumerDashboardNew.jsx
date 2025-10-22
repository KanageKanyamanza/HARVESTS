import React from 'react';
import GenericDashboard from '../../../components/dashboard/GenericDashboard';
import OrdersSection from '../../../components/dashboard/sections/OrdersSection';
import QuickActionsSection from '../../../components/dashboard/sections/QuickActionsSection';
import { consumerService } from '../../../services/genericService';
import commonService from '../../../services/commonService';
import { FiShoppingCart } from 'react-icons/fi';

const ConsumerDashboard = () => {
  // Configuration des statistiques pour les consommateurs
  const statsConfig = (baseStats) => ({
    ...baseStats,
    // Statistiques spécifiques aux consommateurs
    totalSpent: baseStats.monthlyRevenue, // Renommer pour plus de clarté
    favoriteProducers: 0, // À implémenter
    loyaltyPoints: 0 // À implémenter
  });

  // Configuration des sections du dashboard
  const sections = [
    {
      title: 'Mes Commandes',
      icon: <FiShoppingCart className="h-5 w-5" />,
      action: {
        text: 'Voir toutes',
        to: '/consumer/orders'
      },
      content: <OrdersSection userType="consumer" />
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
    />
  );
};

export default ConsumerDashboard;
