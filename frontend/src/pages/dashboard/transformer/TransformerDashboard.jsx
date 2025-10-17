import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { transformerService } from '../../../services';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import ProductCard from '../../../components/common/ProductCard';
import {
  FiPackage,
  FiShoppingCart,
  FiTrendingUp,
  FiDollarSign,
  FiEye,
  FiEdit,
  FiRefreshCw,
  FiStar,
  FiUsers,
  FiTruck,
  FiAlertCircle,
  FiClock,
  FiCheckCircle,
  FiSettings,
  FiTool,
  FiArchive,
  FiBarChart2,
  FiCalendar,
  FiActivity,
  FiZap,
  FiPlus
} from 'react-icons/fi';

const TransformerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les données du dashboard
  useEffect(() => {
    const loadDashboardData = async () => {
      if (user?.userType === 'transformer') {
        try {
          setLoading(true);
          
          // Charger les données avec gestion d'erreur pour chaque service
          const [statsResponse, ordersResponse, productsResponse] = await Promise.allSettled([
            transformerService.getBusinessStats(),
            transformerService.getMyOrders(),
            transformerService.getMyProducts()
          ]);

          // Traiter les statistiques
          if (statsResponse.status === 'fulfilled') {
            setStats(statsResponse.value.data?.data || {});
          } else {
            console.warn('Erreur statistiques business:', statsResponse.reason);
            setStats({});
          }

          // Traiter les commandes
          if (ordersResponse.status === 'fulfilled') {
            setOrders(ordersResponse.value.data?.data?.orders || []);
          } else {
            console.warn('Erreur commandes:', ordersResponse.reason);
            // Données de démonstration pour les commandes
            setOrders([
              {
                _id: 'demo-order-1',
                orderNumber: 'TR-001',
                client: { name: 'Restaurant Le Gourmet' },
                transformationType: 'Conservation',
                status: 'processing',
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                total: 150000
              },
              {
                _id: 'demo-order-2',
                orderNumber: 'TR-002',
                client: { name: 'Café Central' },
                transformationType: 'Emballage',
                status: 'completed',
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                total: 75000
              },
              {
                _id: 'demo-order-3',
                orderNumber: 'TR-003',
                client: { name: 'Boulangerie Artisanale' },
                transformationType: 'Transformation',
                status: 'pending',
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                total: 200000
              }
            ]);
          }

          // Traiter les produits
          if (productsResponse.status === 'fulfilled') {
            setProducts(productsResponse.value.data?.data?.products || []);
          } else {
            console.warn('Erreur produits:', productsResponse.reason);
            // Données de démonstration pour les produits
            setProducts([
              {
                _id: 'demo-product-1',
                name: 'Confiture de mangue artisanale',
                price: 2500,
                currency: 'FCFA',
                category: 'Conserves',
                stock: 45,
                unit: 'pots',
                status: 'active',
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                sales: 12
              },
              {
                _id: 'demo-product-2',
                name: 'Jus d\'orange frais',
                price: 1500,
                currency: 'FCFA',
                category: 'Boissons',
                stock: 28,
                unit: 'bouteilles',
                status: 'active',
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                sales: 8
              },
              {
                _id: 'demo-product-3',
                name: 'Légumes séchés mélange',
                price: 3500,
                currency: 'FCFA',
                category: 'Légumes',
                stock: 15,
                unit: 'kg',
                status: 'active',
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                sales: 5
              }
            ]);
          }

        } catch (error) {
          console.error('Erreur lors du chargement du dashboard:', error);
          setError('Erreur lors du chargement des données');
        } finally {
          setLoading(false);
        }
      }
    };

    loadDashboardData();
  }, [user]);

  // Calculer les statistiques dérivées
  const derivedStats = useMemo(() => {
    // Si pas de données réelles, utiliser des données de démonstration
    if (!orders.length && !stats) {
      return {
        totalOrders: 12,
        pendingOrders: 3,
        completedOrders: 9,
        monthlyRevenue: 450000,
        averageProcessingTime: 2.5,
        qualityScore: 4.8
      };
    }

    if (!orders.length) {
      return {
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        monthlyRevenue: 0,
        averageProcessingTime: 0,
        qualityScore: stats?.qualityScore || 0
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyRevenue = orders.reduce((total, order) => {
      const orderDate = new Date(order.createdAt);
      if (orderDate.getMonth() === currentMonth && 
          orderDate.getFullYear() === currentYear && 
          order.status === 'completed') {
        return total + (order.total || 0);
      }
      return total;
    }, 0);

    const pendingOrders = orders.filter(order => 
      !['completed', 'cancelled'].includes(order.status)
    ).length;

    const completedOrders = orders.filter(order => 
      order.status === 'completed'
    ).length;

    const averageProcessingTime = orders.length > 0 
      ? orders.reduce((total, order) => {
          if (order.processingTime) {
            return total + order.processingTime;
          }
          return total;
        }, 0) / orders.length 
      : 0;

    return {
      totalOrders: orders.length,
      pendingOrders,
      completedOrders,
      monthlyRevenue,
      averageProcessingTime,
      qualityScore: stats?.qualityScore || 0
    };
  }, [orders, stats]);

  // Statistiques principales
  const mainStats = [
    {
      title: 'Commandes en cours',
      value: derivedStats.pendingOrders,
      icon: FiClock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      link: '/transformer/orders?status=active'
    },
    {
      title: 'Commandes terminées',
      value: derivedStats.completedOrders,
      icon: FiCheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      link: '/transformer/orders?status=completed'
    },
    {
      title: 'Revenus ce mois',
      value: `${derivedStats.monthlyRevenue.toLocaleString()} FCFA`,
      icon: FiDollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      link: '/transformer/analytics/revenue'
    },
  ];

  // Actions rapides
  const quickActions = [
    {
      title: 'Ajouter un produit',
      description: 'Ajouter un nouveau produit à votre boutique',
      icon: FiPackage,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      link: '/transformer/products/new'
    }
  ];


  if (loading) {
    return (
      <ModularDashboardLayout userType="transformer">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </ModularDashboardLayout>
    );
  }

  if (error) {
    return (
      <ModularDashboardLayout userType="transformer">
        <div className="text-center py-12">
          <FiAlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Erreur</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
          >
            Réessayer
          </button>
        </div>
      </ModularDashboardLayout>
    );
  }

  // Vérifier le statut d'approbation
  const isApproved = user?.isApproved || false;
  const needsApproval = ['producer', 'transformer', 'exporter', 'transporter'].includes(user?.userType);
  const canPerformOperations = isApproved || !needsApproval;

  return (
    <ModularDashboardLayout 
      user={user}
    >
      <div className="space-y-6 px-4 pb-20">
        {/* Bandeau d'approbation en attente */}
        {needsApproval && !isApproved && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <FiClock className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Compte en attente d'approbation
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Votre compte est en cours d'examen. Vous pouvez consulter votre dashboard mais certaines opérations seront limitées jusqu'à l'approbation.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* En-tête */}
        <div className=" rounded-lg p-6 text-black">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                Dashboard Transformateur
              </h1>
              <p className="text-black mt-1">
                Bienvenue, {user?.firstName} {user?.lastName}
              </p>
              <p className="text-black text-sm mt-2">
                Gérez vos opérations de transformation et suivez vos performances
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {user?.companyName || 'Mon Entreprise'}
              </div>
              <div className="text-yellow-500 text-sm">
                {user?.transformationType || 'Type de transformation'}
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mainStats.map((stat, index) => (
            <Link
              key={index}
              to={stat.link}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const isDisabled = !canPerformOperations;
              return (
                <Link
                  key={index}
                  to={isDisabled ? '#' : action.link}
                  className={`flex items-center p-4 border border-gray-200 rounded-lg transition-colors ${
                    isDisabled 
                      ? 'opacity-50 cursor-not-allowed bg-harvests-light' 
                      : 'hover:border-purple-300 hover:bg-purple-50'
                  }`}
                  onClick={isDisabled ? (e) => e.preventDefault() : undefined}
                >
                  <div className={`p-2 rounded-lg ${isDisabled ? 'bg-gray-100' : action.bgColor} mr-3`}>
                    <action.icon className={`h-5 w-5 ${isDisabled ? 'text-gray-400' : action.color}`} />
                  </div>
                  <div>
                    <p className={`font-medium ${isDisabled ? 'text-gray-500' : 'text-gray-900'}`}>
                      {action.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {isDisabled ? 'Disponible après approbation' : action.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Commandes récentes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Commandes récentes</h2>
            <Link
              to="/transformer/orders"
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              Voir toutes
            </Link>
          </div>
          {orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-harvests-light">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commande
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.orderNumber || order._id.slice(-8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.buyer?.firstName && order.buyer?.lastName 
                              ? `${order.buyer.firstName} ${order.buyer.lastName}`
                              : 'N/A'}                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.transformationType || 'Transformation'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status === 'completed' ? 'Terminé' :
                           order.status === 'processing' ? 'En cours' :
                           order.status === 'pending' ? 'En attente' :
                           order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FiShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune commande</h3>
              <p className="mt-1 text-sm text-gray-500">
                Vous n'avez pas encore de commandes de transformation.
              </p>
            </div>
          )}
        </div>

        {/* Mes produits récents */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Mes produits récents</h2>
            <Link
              to="/transformer/products"
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              Voir tous
            </Link>
          </div>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.slice(0, 6).map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  userType="transformer"
                  showActions={false}
                  showStatus={true}
                  showFeatured={false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun produit</h3>
              <p className="mt-1 text-sm text-gray-500">
                Commencez par ajouter votre premier produit à votre boutique.
              </p>
              <div className="mt-6">
                <Link
                  to="/transformer/products/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                >
                  <FiPlus className="h-4 w-4 mr-2" />
                  Ajouter un produit
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModularDashboardLayout>
  );
};

export default TransformerDashboard;
