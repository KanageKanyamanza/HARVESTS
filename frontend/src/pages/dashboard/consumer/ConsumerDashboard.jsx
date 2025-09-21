import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
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

  // Données simulées
  const stats = {
    totalOrders: 12,
    pendingOrders: 2,
    totalSpent: 245000,
    loyaltyPoints: 1250,
    cartItems: 3,
    favoriteProducts: 15
  };

  const recentOrders = [
    {
      id: 'ORD-001',
      date: '2024-01-15',
      status: 'delivered',
      total: 25000,
      items: 3,
      seller: 'Ferme Bio Kamdem'
    },
    {
      id: 'ORD-002',
      date: '2024-01-12',
      status: 'in-transit',
      total: 18500,
      items: 2,
      seller: 'Agro-Fresh SARL'
    }
  ];

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

  return (
    <ModularDashboardLayout>
      <div className="p-6 max-w-7xl mx-auto pb-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour {user?.firstName} ! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Voici un aperçu de votre activité sur Harvests
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-harvests-green bg-opacity-10 rounded-lg">
                <FiShoppingBag className="h-6 w-6 text-harvests-green" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total commandes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
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

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-harvests-yellow bg-opacity-20 rounded-lg">
                <FiTrendingUp className="h-6 w-6 text-harvests-yellow" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total dépensé</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSpent.toLocaleString()} FCFA</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
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
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{order.id}</div>
                            <div className="text-sm text-gray-500">{order.seller}</div>
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
        <div className="mt-8 ">
          <div className="bg-gradient-to-r from-harvests-green to-harvests-yellow rounded-lg shadow text-black p-6">
            <div className="flex items-center">
              <FiStar className="h-8 w-8" />
              <div className="ml-4">
                <h2 className="text-lg font-semibold">Programme de fidélité</h2>
                <p className="text-sm opacity-90">Vous avez {stats.loyaltyPoints} points</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progression vers la récompense suivante</span>
                <span>{stats.loyaltyPoints}/2000 points</span>
              </div>
              <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full" 
                  style={{ width: `${(stats.loyaltyPoints / 2000) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModularDashboardLayout>
  );
};

export default ConsumerDashboard;
