/**
 * Routes pour les exportateurs
 */
import React from 'react';

// Import des composants exporter (lazy loading)
const ExporterDashboard = React.lazy(() => import('../../../pages/dashboard/exporter/ExporterDashboardNew'));
const ProfilePage = React.lazy(() => import('../../../pages/dashboard/common/ProfilePage'));
const SettingsPage = React.lazy(() => import('../../../pages/dashboard/common/SettingsPage'));
const OrderDetail = React.lazy(() => import('../../../pages/orders/OrderDetail'));

export const exporterRoutes = [
  {
    path: '/exporter/dashboard',
    element: <ExporterDashboard />,
    title: 'Tableau de bord'
  },
  {
    path: '/exporter/orders/:id',
    element: <OrderDetail />,
    title: 'Détails de la commande'
  },
  {
    path: '/exporter/profile',
    element: <ProfilePage />,
    title: 'Mon profil'
  },
  {
    path: '/exporter/settings',
    element: <SettingsPage />,
    title: 'Paramètres'
  }
];

export default exporterRoutes;
