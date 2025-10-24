/**
 * Routes pour les restaurateurs
 */
import React from 'react';

// Import des composants restaurateur (lazy loading)
const RestaurateurDashboard = React.lazy(() => import('../../../pages/dashboard/restaurateur/RestaurateurDashboardNew'));
const RestaurateurOrders = React.lazy(() => import('../../../pages/dashboard/restaurateur/OrdersList'));
const RestaurateurAddOrder = React.lazy(() => import('../../../pages/dashboard/restaurateur/AddOrder'));
const ProfilePage = React.lazy(() => import('../../../pages/dashboard/common/ProfilePage'));
const SettingsPage = React.lazy(() => import('../../../pages/dashboard/common/SettingsPage'));
const OrderDetail = React.lazy(() => import('../../../pages/orders/OrderDetail'));

export const restaurateurRoutes = [
  {
    path: '/restaurateur/dashboard',
    element: <RestaurateurDashboard />,
    title: 'Tableau de bord'
  },
  {
    path: '/restaurateur/orders',
    element: <RestaurateurOrders />,
    title: 'Mes commandes'
  },
  {
    path: '/restaurateur/orders/:id',
    element: <OrderDetail />,
    title: 'Détails de la commande'
  },
  {
    path: '/restaurateur/orders/add',
    element: <RestaurateurAddOrder />,
    title: 'Nouvelle commande'
  },
  {
    path: '/restaurateur/profile',
    element: <ProfilePage />,
    title: 'Mon profil'
  },
  {
    path: '/restaurateur/settings',
    element: <SettingsPage />,
    title: 'Paramètres'
  }
];

export default restaurateurRoutes;
