/**
 * Routes pour les producteurs
 */
import React from 'react';

// Import des composants producer (lazy loading)
const ProducerDashboard = React.lazy(() => import('../../../pages/dashboard/producer/ProducerDashboardNew'));
const MyProducts = React.lazy(() => import('../../../pages/dashboard/producer/MyProducts'));
const AddProduct = React.lazy(() => import('../../../pages/dashboard/producer/AddProduct'));
const EditProduct = React.lazy(() => import('../../../pages/dashboard/producer/EditProduct'));
const Orders = React.lazy(() => import('../../../pages/dashboard/producer/Orders'));
const Stats = React.lazy(() => import('../../../pages/dashboard/producer/Stats'));
const ProducerReviews = React.lazy(() => import('../../../pages/dashboard/producer/ProducerReviews'));
const ProfilePage = React.lazy(() => import('../../../pages/dashboard/common/ProfilePage'));
const SettingsPage = React.lazy(() => import('../../../pages/dashboard/common/SettingsPage'));
const OrderDetail = React.lazy(() => import('../../../pages/orders/OrderDetail'));
const NotificationsPage = React.lazy(() => import('../../../pages/dashboard/common/NotificationsPage'));

export const producerRoutes = [
  {
    path: '/producer/dashboard',
    element: <ProducerDashboard />,
    title: 'Tableau de bord'
  },
  {
    path: '/producer/products',
    element: <MyProducts />,
    title: 'Mes produits'
  },
  {
    path: '/producer/products/add',
    element: <AddProduct />,
    title: 'Ajouter un produit'
  },
  {
    path: '/producer/products/edit/:id',
    element: <EditProduct />,
    title: 'Modifier le produit'
  },
  {
    path: '/producer/orders',
    element: <Orders />,
    title: 'Mes commandes'
  },
  {
    path: '/producer/orders/:id',
    element: <OrderDetail />,
    title: 'Détails de la commande'
  },
  {
    path: '/producer/stats',
    element: <Stats />,
    title: 'Statistiques'
  },
  {
    path: '/producer/profile',
    element: <ProfilePage />,
    title: 'Mon profil'
  },
  {
    path: '/producer/settings',
    element: <SettingsPage />,
    title: 'Paramètres'
  },
  {
    path: '/producer/reviews',
    element: <ProducerReviews />,
    title: 'Avis reçus'
  },
  {
    path: '/producer/notifications',
    element: <NotificationsPage />,
    title: 'Notifications'
  }
];

export default producerRoutes;
