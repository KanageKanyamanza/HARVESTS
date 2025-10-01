import React, { useState, useEffect } from 'react';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import { useAuth } from '../../../hooks/useAuth';
import { consumerService } from '../../../services';
import { 
  FiTrendingUp, 
  FiShoppingBag, 
  FiDollarSign, 
  FiStar,
  FiPackage,
  FiCalendar,
  FiAward,
  FiHeart,
  FiMapPin,
  FiClock
} from 'react-icons/fi';

const Stats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les statistiques
  useEffect(() => {
    const loadStats = async () => {
      if (user?.userType === 'consumer') {
        try {
          setLoading(true);
          const [statsResponse, analyticsResponse, ordersResponse] = await Promise.all([
            consumerService.getMyStats(),
            consumerService.getSpendingAnalytics(),
            consumerService.getMyOrders()
          ]);
          
          console.log('📡 Réponse API Stats:', statsResponse);
          console.log('📡 Réponse API Analytics:', analyticsResponse);
          console.log('📡 Réponse API Orders:', ordersResponse);
          
          setStats(statsResponse.data.data || statsResponse.data);
          setAnalytics(analyticsResponse.data.data?.analytics || analyticsResponse.data.analytics || {});
          setOrders(ordersResponse.data.data?.orders || ordersResponse.data.orders || []);
        } catch (error) {
          console.error('Erreur lors du chargement des statistiques:', error);
          setStats(null);
          setAnalytics({});
          setOrders([]);
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

  const activityStats = stats?.data?.activityStats || stats?.activityStats || {};
  const loyaltyStats = stats?.data?.loyaltyStats || stats?.loyaltyStats || {};
  
  // Calculer les statistiques réelles depuis les commandes
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
  const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'delivered').length;
  const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
  const inTransitOrders = orders.filter(o => o.status === 'in-transit' || o.status === 'shipped').length;
  
  console.log('📊 Activity Stats:', activityStats);
  console.log('📊 Loyalty Stats:', loyaltyStats);
  console.log('📊 Analytics:', analytics);
  console.log('📊 Orders:', orders);

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
              {orders.length || 0}
            </div>
            <p className="text-sm text-gray-600">
              {completedOrders} complétées • {cancelledOrders} annulées
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
                  {(analytics.favoriteCategories || []).map((category, index) => {
                    const categoryLabels = {
                      'cereals': 'Céréales',
                      'vegetables': 'Légumes',
                      'fruits': 'Fruits',
                      'legumes': 'Légumineuses',
                      'tubers': 'Tubercules',
                      'spices': 'Épices',
                      'herbs': 'Herbes',
                      'nuts': 'Noix',
                      'seeds': 'Graines',
                      'dairy': 'Produits Laitiers',
                      'meat': 'Viande',
                      'poultry': 'Volaille',
                      'fish': 'Poisson',
                      'processed-foods': 'Produits Transformés',
                      'beverages': 'Boissons',
                      'other': 'Autre'
                    };
                    return (
                      <span key={index} className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                        {categoryLabels[category] || category}
                      </span>
                    );
                  })}
                  {(!analytics.favoriteCategories || analytics.favoriteCategories.length === 0) && (
                    <span className="text-gray-500 text-sm">Aucune donnée disponible</span>
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

        {/* Activité récente */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <FiCalendar className="h-5 w-5 mr-2 text-green-500" />
            Activité récente
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Commandes en attente */}
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">En attente</span>
                <FiClock className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold text-yellow-600">
                {pendingOrders}
              </div>
              <p className="text-xs text-gray-600 mt-1">À traiter</p>
            </div>
            
            {/* Commandes en transit */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">En transit</span>
                <FiShoppingBag className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {inTransitOrders}
              </div>
              <p className="text-xs text-gray-600 mt-1">En livraison</p>
            </div>
            
            {/* Commandes complétées */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Complétées</span>
                <FiPackage className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-green-600">
                {completedOrders}
              </div>
              <p className="text-xs text-gray-600 mt-1">Livrées avec succès</p>
            </div>
            
            {/* Avis donnés */}
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Avis</span>
                <FiStar className="h-5 w-5 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {activityStats.reviewsWritten || 0}
              </div>
              <p className="text-xs text-gray-600 mt-1">Avis publiés</p>
            </div>
          </div>
        </div>

        {/* Résumé de performance */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg shadow-xl p-8 text-white mt-8">
          <h3 className="text-2xl font-bold mb-6 flex items-center">
            <FiAward className="h-6 w-6 mr-3" />
            Votre Performance
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">{orders.length || 0}</div>
              <div className="text-sm text-white/80">Commandes totales</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">{formatPrice(analytics.totalSpent || 0)}</div>
              <div className="text-sm text-white/80">Dépenses totales</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">{(activityStats.averageRatingGiven || 0).toFixed(1)}⭐</div>
              <div className="text-sm text-white/80">Note moyenne donnée</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">{loyaltyStats.points || 0}</div>
              <div className="text-sm text-white/80">Points de fidélité</div>
            </div>
          </div>
        </div>
      </div>
    </ModularDashboardLayout>
  );
};

export default Stats;
