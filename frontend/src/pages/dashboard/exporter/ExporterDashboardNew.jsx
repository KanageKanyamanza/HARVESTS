import React from 'react';
import GenericDashboard from '../../../components/dashboard/GenericDashboard';
import ProductsSection from '../../../components/dashboard/sections/ProductsSection';
import OrdersSection from '../../../components/dashboard/sections/OrdersSection';
import QuickActionsSection from '../../../components/dashboard/sections/QuickActionsSection';
import { exporterService } from '../../../services/genericService';
import commonService from '../../../services/commonService';
import { FiGlobe } from 'react-icons/fi';

const ExporterDashboard = () => {
  // Configuration des statistiques pour les exportateurs
  const statsConfig = (baseStats) => ({
    ...baseStats,
    // Statistiques spécifiques aux exportateurs
    exportCountries: 0, // À implémenter
    totalExports: baseStats.totalOrders, // Renommer pour plus de clarté
    exportValue: baseStats.monthlyRevenue // Renommer pour plus de clarté
  });

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
    />
  );
};

export default ExporterDashboard;
