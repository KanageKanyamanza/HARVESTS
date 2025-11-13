import React from 'react';
import GenericDashboard from '../../../components/dashboard/GenericDashboard';
import ProductsSection from '../../../components/dashboard/sections/ProductsSection';
import OrdersSection from '../../../components/dashboard/sections/OrdersSection';
import QuickActionsSection from '../../../components/dashboard/sections/QuickActionsSection';
import SubscriptionSection from '../../../components/dashboard/sections/SubscriptionSection';
import { transformerService } from '../../../services/genericService';
import commonService from '../../../services/commonService';
import { FiSettings, FiStar } from 'react-icons/fi';

const TransformerDashboard = () => {
  // Configuration des statistiques pour les transformateurs
  const statsConfig = (baseStats) => ({
    ...baseStats,
    // Statistiques spécifiques aux transformateurs
    totalBatches: 0, // À implémenter
    processingCapacity: 0 // À implémenter
  });

  // Configuration des sections du dashboard
  const sections = [
    {
      title: 'Mon Abonnement',
      icon: <FiStar className="h-5 w-5" />,
      content: <SubscriptionSection />,
      fullWidth: false
    },
    {
      title: 'Produits Transformés',
      icon: <FiSettings className="h-5 w-5" />,
      action: {
        text: 'Voir tous',
        to: '/transformer/products'
      },
      content: <ProductsSection userType="transformer" />
    },
    {
      title: 'Commandes de Transformation',
      icon: <FiSettings className="h-5 w-5" />,
      action: {
        text: 'Voir toutes',
        to: '/transformer/orders'
      },
      content: <OrdersSection userType="transformer" />
    },
    {
      title: 'Actions Rapides',
      icon: <FiSettings className="h-5 w-5" />,
      content: <QuickActionsSection userType="transformer" />,
      fullWidth: true
    }
  ];

  return (
    <GenericDashboard
      userType="transformer"
      service={transformerService}
      commonService={commonService}
      title="Dashboard Transformateur"
      description="Gérez votre production et transformation"
      icon={<FiSettings className="h-8 w-8 text-purple-600" />}
      statsConfig={statsConfig}
      sections={sections}
    />
  );
};

export default TransformerDashboard;
