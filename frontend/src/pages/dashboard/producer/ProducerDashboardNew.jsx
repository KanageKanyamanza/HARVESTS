import React from 'react';
import GenericDashboard from '../../../components/dashboard/GenericDashboard';
import ProductsSection from '../../../components/dashboard/sections/ProductsSection';
import OrdersSection from '../../../components/dashboard/sections/OrdersSection';
import QuickActionsSection from '../../../components/dashboard/sections/QuickActionsSection';
import { producerService } from '../../../services/genericService';
import commonService from '../../../services/commonService';
import { FiPackage } from 'react-icons/fi';

const ProducerDashboard = () => {
  // Configuration des statistiques pour les producteurs
  const statsConfig = (baseStats) => ({
    ...baseStats,
    // Ajouter des statistiques spécifiques aux producteurs si nécessaire
  });

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
    />
  );
};

export default ProducerDashboard;
