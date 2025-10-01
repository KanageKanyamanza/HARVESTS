import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { consumerService } from '../../../services';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import {
  FiShoppingBag,
  FiShoppingCart,
  FiHeart,
  FiStar,
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiEye,
  FiPlus,
  FiTruck
} from 'react-icons/fi';

const ConsumerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalSpent: 0,
    loyaltyPoints: 0,
    cartItems: 0,
    favoriteProducts: 0
  });
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les données du dashboard
  useEffect(() => {
    const loadDashboardData = async () => {
      if (user?.userType === 'consumer') {
        try {
          setLoading(true);
          const [ordersResponse, loyaltyResponse, cartResponse, wishlistResponse] = await Promise.all([
            consumerService.getMyOrders(),
            consumerService.getLoyaltyStatus(),
            consumerService.getCart(),
            consumerService.getWishlist()
          ]);


          // Traiter les commandes
          const orders = ordersResponse.data.data?.orders || ordersResponse.data.orders || [];
          const pendingOrders = orders.filter(order => order.status === 'pending' || order.status === 'processing').length;
          const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);

          // Traiter les données de fidélité
          const loyaltyInfo = loyaltyResponse.data.data?.loyalty || loyaltyResponse.data.loyaltyStatus || {};
          setLoyaltyData(loyaltyInfo);
          
          // Traiter le panier
          const cartItems = cartResponse.data.cart?.items?.length || 0;
          
          // Traiter la wishlist
          const favoriteProducts = wishlistResponse.data.wishlist?.length || 0;

          setStats({
            totalOrders: orders.length,
            pendingOrders,
            totalSpent,
            loyaltyPoints: loyaltyInfo.points || 0,
            cartItems,
            favoriteProducts
          });

          setRecentOrders(orders.slice(0, 5)); // 5 dernières commandes

        } catch (error) {
          console.error('Erreur lors du chargement des données du dashboard:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadDashboardData();
  }, [user]);

  const getStatusBadge = (status) => {
    const configs = {
      'delivered': { color: 'bg-green-100 text-green-800', text: 'Livrée', icon: FiCheckCircle },
      'in-transit': { color: 'bg-blue-100 text-blue-800', text: 'En transit', icon: FiTruck },
      'pending': { color: 'bg-yellow-100 text-yellow-800', text: 'En attente', icon: FiClock }
    };
    
    const config = configs[status] || configs['pending'];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const getNextTierInfo = (currentTier) => {
    const tiers = {
      bronze: { next: 'Silver', pointsNeeded: 1000, icon: '🥈' },
      silver: { next: 'Gold', pointsNeeded: 5000, icon: '🥇' },
      gold: { next: 'Platinum', pointsNeeded: 10000, icon: '💎' },
      platinum: { next: null, pointsNeeded: null, icon: '👑' }
    };
    return tiers[currentTier] || tiers.bronze;
  };

  const getTierLabel = (tier) => {
    const labels = {
      bronze: 'Bronze',
      silver: 'Silver',
      gold: 'Gold',
      platinum: 'Platinum'
    };
    return labels[tier] || 'Bronze';
  };

  if (loading) {
    return (
      <ModularDashboardLayout>
        <div className="p-6 max-w-7xl mx-auto pb-20">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ModularDashboardLayout>
    );
  }

  return (
    <ModularDashboardLayout>
      <div className="p-6 max-w-7xl mx-auto pb-20">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Bonjour {user?.firstName} ! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Voici un aperçu de votre activité sur Harvests
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-3">
            <div className="flex  items-center">
              <div className="p-2 bg-harvests-green bg-opacity-10 rounded-lg">
                <FiShoppingBag className="h-6 w-6 text-harvests-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total commandes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-3">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiClock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En cours</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-3">
            <div className="flex items-center">
              <div className="p-2 bg-harvests-yellow bg-opacity-20 rounded-lg">
                <FiTrendingUp className="h-6 w-6 text-harvests-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total dépensé</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSpent.toLocaleString()} FCFA</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-3">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FiStar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Points fidélité</p>
                <p className="text-2xl font-bold text-gray-900">{stats.loyaltyPoints}</p>
              </div>
            </div>
          </div>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Actions rapides</h2>
              </div>
              <div className="p-6 space-y-4">
                <Link
                  to="/products"
                  className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white group-hover:scale-110 transition-transform">
                    <FiEye className="h-5 w-5" />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900 group-hover:text-harvests-green">
                      Parcourir les produits
                    </p>
                    <p className="text-sm text-gray-600">Découvrez de nouveaux produits frais</p>
                  </div>
                </Link>

                <Link
                  to="/cart"
                  className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-harvests-green hover:bg-green-600 text-white group-hover:scale-110 transition-transform">
                    <FiShoppingCart className="h-5 w-5" />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900 group-hover:text-harvests-green">
                      Voir mon panier
                    </p>
                    <p className="text-sm text-gray-600">{stats.cartItems} articles en attente</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Commandes récentes</h2>
                <Link 
                  to="/order-history"
                  className="text-harvests-green hover:text-green-600 text-sm font-medium"
                >
                  Voir tout
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Commande
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentOrders.map((order) => (
                      <tr key={order._id || order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.orderNumber || order._id?.slice(-8).toUpperCase()}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.seller?.firstName} {order.seller?.lastName}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.total.toLocaleString()} FCFA
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Loyalty Program */}
        <div className="mt-8">
          <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-lg shadow-xl text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <FiStar className="h-8 w-8" />
                <div className="ml-4">
                  <h2 className="text-lg font-semibold">Programme de fidélité</h2>
                  <p className="text-sm text-white/90">
                    Niveau: {getTierLabel(loyaltyData?.tier || 'bronze')} {getNextTierInfo(loyaltyData?.tier || 'bronze').icon}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{stats.loyaltyPoints}</div>
                <div className="text-sm text-white/80">Points</div>
              </div>
            </div>
            
            {loyaltyData && getNextTierInfo(loyaltyData.tier).next && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progression vers {getNextTierInfo(loyaltyData.tier).next}</span>
                  <span>
                    {stats.loyaltyPoints}/{getNextTierInfo(loyaltyData.tier).pointsNeeded} points
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-white h-2.5 rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${Math.min((stats.loyaltyPoints / getNextTierInfo(loyaltyData.tier).pointsNeeded) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-white/70 mt-2">
                  Plus que {Math.max(0, getNextTierInfo(loyaltyData.tier).pointsNeeded - stats.loyaltyPoints)} points pour atteindre {getNextTierInfo(loyaltyData.tier).next}
                </p>
              </div>
            )}
            
            {loyaltyData?.tier === 'platinum' && (
              <div className="mt-4 p-4 bg-white/10 rounded-lg text-center">
                <p className="font-semibold">🎉 Félicitations !</p>
                <p className="text-sm text-white/80 mt-1">Vous avez atteint le niveau maximum</p>
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-white/20">
              <Link
                to="/consumer/loyalty"
                className="text-sm text-white hover:underline inline-flex items-center"
              >
                Voir tous mes avantages
                <FiStar className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ModularDashboardLayout>
  );
};

export default ConsumerDashboard;
