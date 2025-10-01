import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import SalesChart from '../../components/admin/SalesChart';
import RecentOrders from '../../components/admin/RecentOrders';
import PendingProducts from '../../components/admin/PendingProducts';
import TopProducers from '../../components/admin/TopProducers';
import ProductStats from '../../components/admin/ProductStats';
import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Shield,
  Star,
  MessageSquare,
  BarChart3,
  ArrowRight,
  Activity,
  Globe,
  Truck
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    activeUsers: 0,
    recentOrders: 0,
    monthlyGrowth: 0,
    totalProducers: 0,
    totalConsumers: 0,
    totalTransporters: 0,
    pendingProducts: 0,
    pendingReviews: 0,
    unreadMessages: 0,
    activeAdmins: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [salesChartData, setSalesChartData] = useState([]);
  const [topProducers, setTopProducers] = useState([]);
  const [productStats, setProductStats] = useState({});
  const [loading, setLoading] = useState(true);

  // Fonction loadStats mémorisée pour éviter les re-rendus
  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      
      // Charger toutes les données en parallèle
      const [
        statsResponse,
        ordersResponse,
        productsResponse,
        salesResponse,
        producersResponse,
        productStatsResponse
      ] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getRecentOrders({ limit: 5 }),
        adminService.getPendingProducts({ limit: 5 }),
        adminService.getSalesChart({ months: 12 }),
        adminService.getTopProducers({ limit: 5 }),
        adminService.getProductStats()
      ]);
      
      // Traiter les statistiques générales
      if (statsResponse.data && statsResponse.data.stats) {
        const statsData = statsResponse.data.stats;
        setStats({
          totalUsers: statsData.totalUsers || 0,
          totalProducts: statsData.totalProducts || 0,
          totalOrders: statsData.totalOrders || 0,
          totalRevenue: statsData.totalRevenue || 0,
          pendingApprovals: statsData.pendingApprovals || 0,
          activeUsers: statsData.activeUsers || 0,
          recentOrders: statsData.recentOrders || 0,
          monthlyGrowth: statsData.monthlyGrowth || 0,
          totalProducers: statsData.totalProducers || 0,
          totalConsumers: statsData.totalConsumers || 0,
          totalTransporters: statsData.totalTransporters || 0,
          pendingProducts: statsData.pendingProducts || 0,
          pendingReviews: statsData.pendingReviews || 0,
          unreadMessages: statsData.unreadMessages || 0,
          activeAdmins: statsData.activeAdmins || 0
        });
      }
      
      // Traiter les commandes récentes
      if (ordersResponse.data && ordersResponse.data.orders) {
        setRecentOrders(ordersResponse.data.orders);
      }
      
      // Traiter les produits en attente
      if (productsResponse.data && productsResponse.data.products) {
        setPendingProducts(productsResponse.data.products);
      }
      
      // Traiter les données de vente
      if (salesResponse.data && salesResponse.data.chartData) {
        setSalesChartData(salesResponse.data.chartData);
      }
      
      // Traiter les top producteurs
      if (producersResponse.data && producersResponse.data.producers) {
        setTopProducers(producersResponse.data.producers);
      }
      
      // Traiter les statistiques des produits
      if (productStatsResponse.data) {
        setProductStats(productStatsResponse.data);
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      // Réinitialiser les stats en cas d'erreur
      setStats({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingApprovals: 0,
        activeUsers: 0,
        recentOrders: 0,
        monthlyGrowth: 0,
        totalProducers: 0,
        totalConsumers: 0,
        totalTransporters: 0,
        pendingProducts: 0,
        pendingReviews: 0,
        unreadMessages: 0,
        activeAdmins: 0
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const statCards = [
    {
      title: 'Utilisateurs totaux',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'bg-blue-500',
      change: `+${stats.monthlyGrowth}%`,
      link: '/admin/users'
    },
    {
      title: 'Produits en ligne',
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      color: 'bg-green-500',
      change: stats.pendingProducts > 0 ? `${stats.pendingProducts} en attente` : 'Tous approuvés',
      link: '/admin/products'
    },
    {
      title: 'Commandes totales',
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: 'bg-purple-500',
      change: `${stats.recentOrders} récentes`,
      link: '/admin/orders'
    },
    {
      title: 'Chiffre d\'affaires',
      value: `${stats.totalRevenue.toLocaleString()} FCFA`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      change: `${stats.totalOrders} commandes`,
      link: '/admin/analytics'
    }
  ];

  const marketplaceStats = [
    {
      title: 'Producteurs',
      value: stats.totalProducers.toLocaleString(),
      icon: Globe,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Consommateurs',
      value: stats.totalConsumers.toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Transporteurs',
      value: stats.totalTransporters.toLocaleString(),
      icon: Truck,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Admins actifs',
      value: stats.activeAdmins.toLocaleString(),
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const quickActions = [
    {
      title: 'Produits en attente',
      value: stats.pendingProducts,
      icon: Package,
      color: 'text-orange-500',
      action: 'Examiner',
      link: '/admin/products'
    },
    {
      title: 'Avis à modérer',
      value: stats.pendingReviews,
      icon: Star,
      color: 'text-yellow-500',
      action: 'Modérer',
      link: '/admin/reviews'
    },
    {
      title: 'Messages non lus',
      value: stats.unreadMessages,
      icon: MessageSquare,
      color: 'text-blue-500',
      action: 'Répondre',
      link: '/admin/messages'
    },
    {
      title: 'Commandes récentes',
      value: stats.recentOrders,
      icon: ShoppingCart,
      color: 'text-purple-500',
      action: 'Voir',
      link: '/admin/orders'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => (
            <Link
              key={index}
              to={card.link}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${card.color}`}>
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    <p className="text-sm text-gray-500">{card.change}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Graphique des ventes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Évolution des ventes</h3>
              <p className="text-sm text-gray-500">Ventes des 12 derniers mois</p>
            </div>
            <div className="p-6">
              <SalesChart data={salesChartData} type="line" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Statistiques par type d'utilisateur</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {marketplaceStats.map((stat, index) => (
                  <div key={index} className={`p-4 rounded-lg ${stat.bgColor}`}>
                    <div className="flex items-center">
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Commandes récentes et produits en attente */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <RecentOrders orders={recentOrders} />
          <PendingProducts products={pendingProducts} />
        </div>

        {/* Top producteurs et actions rapides */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <TopProducers producers={topProducers} />
          
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Actions rapides</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.link}
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <action.icon className={`w-5 h-5 ${action.color}`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{action.title}</p>
                        <p className="text-xs text-gray-500">{action.value} éléments</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques des produits */}
        <div className="mb-8">
          <ProductStats data={productStats} />
        </div>

        {/* Liens rapides vers les sections principales */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Sections principales</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                to="/admin/users"
                className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200"
              >
                <Users className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Gestion des utilisateurs</p>
                  <p className="text-xs text-gray-500">Modérer et gérer les comptes</p>
                </div>
              </Link>

              <Link
                to="/admin/products"
                className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors duration-200"
              >
                <Package className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Gestion des produits</p>
                  <p className="text-xs text-gray-500">Approuver et modérer les produits</p>
                </div>
              </Link>

              <Link
                to="/admin/orders"
                className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors duration-200"
              >
                <ShoppingCart className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Gestion des commandes</p>
                  <p className="text-xs text-gray-500">Suivre et gérer les commandes</p>
                </div>
              </Link>

              <Link
                to="/admin/analytics"
                className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 transition-colors duration-200"
              >
                <BarChart3 className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Analytics</p>
                  <p className="text-xs text-gray-500">Rapports et statistiques</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
