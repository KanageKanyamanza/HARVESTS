/**
 * Routes pour les transporteurs
 */
import React from 'react';

// Import des composants transporter (lazy loading)
const TransporterDashboard = React.lazy(() => import('../../../pages/dashboard/transporter/TransporterDashboardNew'));
const ProfilePage = React.lazy(() => import('../../../pages/dashboard/common/ProfilePage'));
const SettingsPage = React.lazy(() => import('../../../pages/dashboard/common/SettingsPage'));
const OrderDetail = React.lazy(() => import('../../../pages/orders/OrderDetail'));

export const transporterRoutes = [
  {
    path: '/transporter/dashboard',
    element: <TransporterDashboard />,
    title: 'Tableau de bord'
  },
  {
    path: '/transporter/orders/:id',
    element: <OrderDetail />,
    title: 'Détails de la commande'
  },
  {
    path: '/transporter/profile',
    element: <ProfilePage />,
    title: 'Mon profil'
  },
  {
    path: '/transporter/settings',
    element: <SettingsPage />,
    title: 'Paramètres'
  }
];

export default transporterRoutes;
