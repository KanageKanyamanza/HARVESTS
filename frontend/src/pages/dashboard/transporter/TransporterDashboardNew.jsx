import React from 'react';
import GenericDashboard from '../../../components/dashboard/GenericDashboard';
import OrdersSection from '../../../components/dashboard/sections/OrdersSection';
import QuickActionsSection from '../../../components/dashboard/sections/QuickActionsSection';
import SubscriptionSection from '../../../components/dashboard/sections/SubscriptionSection';
import { transporterService } from '../../../services/genericService';
import commonService from '../../../services/commonService';
import { FiTruck, FiStar } from 'react-icons/fi';

const TransporterDashboard = () => {
  // Configuration des statistiques pour les transporteurs
  const statsConfig = (baseStats) => ({
    ...baseStats,
    // Statistiques spécifiques aux transporteurs
    totalDeliveries: baseStats.totalOrders, // Renommer pour plus de clarté
    deliveryZones: 0, // À implémenter
    averageDeliveryTime: 0 // À implémenter
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
      title: 'Livraisons en Cours',
      icon: <FiTruck className="h-5 w-5" />,
      action: {
        text: 'Voir toutes',
        to: '/transporter/deliveries'
      },
      content: <OrdersSection userType="transporter" />
    },
    {
      title: 'Actions Rapides',
      icon: <FiTruck className="h-5 w-5" />,
      content: <QuickActionsSection userType="transporter" />,
      fullWidth: true
    }
  ];

  return (
    <GenericDashboard
      userType="transporter"
      service={transporterService}
      commonService={commonService}
      title="Dashboard Transporteur"
      description="Gérez vos livraisons et zones de service"
      icon={<FiTruck className="h-8 w-8 text-indigo-600" />}
      statsConfig={statsConfig}
      sections={sections}
    />
  );
};

export default TransporterDashboard;
