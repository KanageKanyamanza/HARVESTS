import React from 'react';
import GenericDashboard from '../../../components/dashboard/GenericDashboard';
import ProductsSection from '../../../components/dashboard/sections/ProductsSection';
import OrdersSection from '../../../components/dashboard/sections/OrdersSection';
import QuickActionsSection from '../../../components/dashboard/sections/QuickActionsSection';
import { restaurateurService } from '../../../services/genericService';
import commonService from '../../../services/commonService';
import { FiCoffee } from 'react-icons/fi';

const RestaurateurDashboard = () => {
  // Configuration des statistiques pour les restaurateurs
  const statsConfig = (baseStats) => ({
    ...baseStats,
    // Statistiques spécifiques aux restaurateurs
    totalDishes: baseStats.totalProducts, // Renommer pour plus de clarté
    totalSuppliers: 0, // À implémenter
    averageOrderValue: 0 // À implémenter
  });

  // Configuration des sections du dashboard
  const sections = [
    {
      title: 'Mes Plats',
      icon: <FiCoffee className="h-5 w-5" />,
      action: {
        text: 'Voir tous',
        to: '/restaurateur/dishes'
      },
      content: <ProductsSection userType="restaurateur" />
    },
    {
      title: 'Commandes Récentes',
      icon: <FiCoffee className="h-5 w-5" />,
      action: {
        text: 'Voir toutes',
        to: '/restaurateur/orders'
      },
      content: <OrdersSection userType="restaurateur" />
    },
    {
      title: 'Actions Rapides',
      icon: <FiCoffee className="h-5 w-5" />,
      content: <QuickActionsSection userType="restaurateur" />,
      fullWidth: true
    }
  ];

  return (
    <GenericDashboard
      userType="restaurateur"
      service={restaurateurService}
      commonService={commonService}
      title="Dashboard Restaurateur"
      description="Gérez votre restaurant et vos plats"
      icon={<FiCoffee className="h-8 w-8 text-orange-600" />}
      statsConfig={statsConfig}
      sections={sections}
    />
  );
};

export default RestaurateurDashboard;
