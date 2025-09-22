import React, { useState, useEffect } from 'react';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import { useAuth } from '../../../hooks/useAuth';
import { consumerService } from '../../../services/api';
import { 
  FiTrendingUp, 
  FiShoppingBag, 
  FiDollarSign, 
  FiStar,
  FiPackage,
  FiCalendar,
  FiAward,
  FiHeart,
  FiMapPin
} from 'react-icons/fi';

const Stats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger les statistiques
  useEffect(() => {
    const loadStats = async () => {
      if (user?.userType === 'consumer') {
        try {
          setLoading(true);
          const [statsResponse, analyticsResponse] = await Promise.all([
            consumerService.getMyStats(),
            consumerService.getSpendingAnalytics()
          ]);
          
          console.log('📡 Réponse API Stats:', statsResponse);
          console.log('📡 Réponse API Analytics:', analyticsResponse);
          
          setStats(statsResponse.data);
          setAnalytics(analyticsResponse.data.analytics || {});
        } catch (error) {
          console.error('Erreur lors du chargement des statistiques:', error);
          setStats(null);
          setAnalytics({});
        } finally {
          setLoading(false);
        }
      }
    };

    loadStats();
  }, [user]);

  const formatPrice = (price, currency = 'XAF') => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' ' + currency;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <ModularDashboardLayout>
        <div className="p-6 max-w-7xl mx-auto pb-20">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

  const activityStats = stats?.activityStats || {};
  const loyaltyStats = stats?.loyaltyStats || {};

  return (
    <ModularDashboardLayout>
      <div className="p-6 max-w-7xl mx-auto pb-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FiTrendingUp className="h-8 w-8 mr-3 text-blue-500" />
            Mes statistiques
          </h1>
          <p className="text-gray-600 mt-1">
            Suivez votre activité et vos performances d'achat
          </p>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Commandes totales */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Commandes</h3>
              <FiShoppingBag className="h-6 w-6 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-harvests-green mb-2">
              {activityStats.totalOrders || 0}
            </div>
            <p className="text-sm text-gray-600">
              {activityStats.cancelledOrders || 0} annulées
            </p>
          </div>

          {/* Montant total dépensé */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Dépenses</h3>
              <FiDollarSign className="h-6 w-6 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-harvests-green mb-2">
              {formatPrice(analytics.totalSpent || 0)}
            </div>
            <p className="text-sm text-gray-600">
              Montant total
            </p>
          </div>

          {/* Note moyenne donnée */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Note moyenne</h3>
              <FiStar className="h-6 w-6 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-harvests-green mb-2">
              {activityStats.averageRatingGiven || 0}
            </div>
            <p className="text-sm text-gray-600">
              {activityStats.reviewsWritten || 0} avis écrits
            </p>
          </div>

          {/* Points de fidélité */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Points</h3>
              <FiAward className="h-6 w-6 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-harvests-green mb-2">
              {loyaltyStats.points || 0}
            </div>
            <p className="text-sm text-gray-600">
              Niveau {loyaltyStats.tier || 'Bronze'}
            </p>
          </div>
        </div>

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Historique d'achat */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <FiPackage className="h-5 w-5 mr-2 text-harvests-green" />
              Historique d'achat
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Commande moyenne</span>
                <span className="font-semibold text-gray-900">
                  {formatPrice(analytics.averageOrderValue || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Dernière commande</span>
                <span className="font-semibold text-gray-900">
                  {analytics.lastOrderDate ? formatDate(analytics.lastOrderDate) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Commandes ce mois</span>
                <span className="font-semibold text-gray-900">
                  {analytics.ordersThisMonth || 0}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Dépenses ce mois</span>
                <span className="font-semibold text-gray-900">
                  {formatPrice(analytics.spentThisMonth || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Préférences et favoris */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <FiHeart className="h-5 w-5 mr-2 text-red-500" />
              Préférences
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Catégories préférées</h4>
                <div className="flex flex-wrap gap-2">
                  {(analytics.favoriteCategories || []).map((category, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {category}
                    </span>
                  ))}
                  {(!analytics.favoriteCategories || analytics.favoriteCategories.length === 0) && (
                    <span className="text-gray-500 text-sm">Aucune donnée</span>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Producteurs favoris</h4>
                <div className="space-y-2">
                  {(analytics.favoriteProducers || []).slice(0, 3).map((producer, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{producer.name}</span>
                      <span className="font-semibold text-gray-900">{producer.orders} commandes</span>
                    </div>
                  ))}
                  {(!analytics.favoriteProducers || analytics.favoriteProducers.length === 0) && (
                    <span className="text-gray-500 text-sm">Aucune donnée</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Graphiques et tendances */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <FiTrendingUp className="h-5 w-5 mr-2 text-green-500" />
            Tendances et analyses
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Évolution des dépenses */}
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-4">Évolution des dépenses</h4>
              <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500 text-sm">Graphique en cours de développement</p>
              </div>
            </div>

            {/* Répartition par catégorie */}
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-4">Répartition par catégorie</h4>
              <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500 text-sm">Graphique en cours de développement</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommandations */}
        {analytics.recommendations && analytics.recommendations.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <FiStar className="h-5 w-5 mr-2 text-yellow-500" />
              Recommandations personnalisées
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.recommendations.map((recommendation, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">{recommendation.title}</h4>
                  <p className="text-sm text-gray-600">{recommendation.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ModularDashboardLayout>
  );
};

export default Stats;
