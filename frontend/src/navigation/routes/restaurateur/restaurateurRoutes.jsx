/**
 * Routes pour les restaurateurs
 */
import React from 'react';

// Import des composants restaurateur (lazy loading)
const RestaurateurDashboard = React.lazy(() => import('../../../pages/dashboard/restaurateur/RestaurateurDashboardNew'));
const RestaurateurOrders = React.lazy(() => import('../../../pages/dashboard/restaurateur/OrdersList'));
const RestaurateurCart = React.lazy(() => import('../../../pages/dashboard/consumer/Cart'));
const DishesManagement = React.lazy(() => import('../../../pages/dashboard/restaurateur/DishesManagement'));
const AddDish = React.lazy(() => import('../../../pages/dashboard/restaurateur/AddDish'));
const DishDetail = React.lazy(() => import('../../../pages/dashboard/restaurateur/DishDetail'));
const RestaurateurStats = React.lazy(() => import('../../../pages/dashboard/restaurateur/Stats'));
const ProfilePage = React.lazy(() => import('../../../pages/dashboard/common/ProfilePage'));
const SettingsPage = React.lazy(() => import('../../../pages/dashboard/common/SettingsPage'));
const OrderDetail = React.lazy(() => import('../../../pages/orders/OrderDetail'));
const NotificationsPage = React.lazy(() => import('../../../pages/dashboard/common/NotificationsPage'));

export const restaurateurRoutes = [
  {
    path: '/restaurateur/dashboard',
    element: <RestaurateurDashboard />,
    title: 'Tableau de bord'
  },
  {
    path: '/restaurateur/dishes',
    element: <DishesManagement />,
    title: 'Mes plats'
  },
  {
    path: '/restaurateur/dishes/add',
    element: <AddDish />,
    title: 'Ajouter un plat'
  },
  {
    path: '/restaurateur/cart',
    element: <RestaurateurCart />,
    title: 'Mon panier'
  },
  {
    path: '/restaurateur/dishes/:dishId',
    element: <DishDetail />,
    title: 'Détails du plat'
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
    path: '/restaurateur/stats',
    element: <RestaurateurStats />,
    title: 'Statistiques'
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
  },
  {
    path: '/restaurateur/notifications',
    element: <NotificationsPage />,
    title: 'Notifications'
  }
];

export default restaurateurRoutes;
