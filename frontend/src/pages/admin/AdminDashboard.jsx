import React from 'react';
import RecentOrders from '../../components/admin/RecentOrders';
import PendingProducts from '../../components/admin/PendingProducts';
import TopProducers from '../../components/admin/TopProducers';
import ProductStats from '../../components/admin/ProductStats';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatCards from './adminDashboard/StatCards';
import SalesAndUserStats from './adminDashboard/SalesAndUserStats';
import QuickActions from './adminDashboard/QuickActions';
import MainSections from './adminDashboard/MainSections';
import { useDashboardStats } from './adminDashboard/dashboardHooks';
import { createStatCards, createMarketplaceStats, createQuickActions } from './adminDashboard/dashboardUtils';

const AdminDashboard = () => {
  const {
    stats,
    recentOrders,
    pendingProducts,
    salesChartData,
    topProducers,
    productStats,
    loading
  } = useDashboardStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-harvests-light flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement..." />
      </div>
    );
  }

  const statCards = createStatCards(stats);
  const marketplaceStats = createMarketplaceStats(stats);
  const quickActions = createQuickActions(stats);

  return (
    <div className="min-h-screen bg-harvests-light overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Tableau de bord administrateur
          </h1>
          <p className="mt-2 text-gray-600">
            Vue d'ensemble de la plateforme Harvests
          </p>
        </div>

        {/* Cartes de statistiques principales */}
        <StatCards statCards={statCards} />

        {/* Graphique des ventes et statistiques utilisateurs */}
        <SalesAndUserStats 
          salesChartData={salesChartData} 
          marketplaceStats={marketplaceStats} 
        />

        {/* Commandes récentes et produits en attente */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <RecentOrders orders={recentOrders} />
          <PendingProducts products={pendingProducts} />
        </div>

        {/* Top producteurs et actions rapides */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <TopProducers producers={topProducers} />
          <QuickActions quickActions={quickActions} />
        </div>

        {/* Statistiques des produits */}
        <div className="mb-8">
          <ProductStats data={productStats} />
        </div>

        {/* Liens rapides vers les sections principales */}
        <MainSections />
      </div>
    </div>
  );
};

export default AdminDashboard;
