import React, { useState, useEffect } from 'react';
import { transformerService } from '../../../services';
import { transformerService as genericTransformerService } from '../../../services/genericService';
import { useNotifications } from '../../../contexts/NotificationContext';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiPackage,
  FiUsers,
  FiStar,
  FiCalendar,
  FiRefreshCw,
  FiAlertCircle,
  FiBarChart,
  FiPieChart,
  FiActivity
} from 'react-icons/fi';

const TransformerStats = () => {
  const { showError } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    businessStats: {},
    productionAnalytics: {},
    efficiencyMetrics: {},
    revenueAnalytics: {}
  });
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  // Charger les statistiques
  useEffect(() => {
    loadStats();
  }, [selectedPeriod]);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Charger seulement les statistiques de base disponibles
      const businessResponse = await genericTransformerService.getStats();
      console.log('[TransformerStats] Stats response:', businessResponse);
      
      // Pour les transformateurs, les stats sont directement dans data, pas dans data.data
      const businessStats = businessResponse.data?.data || businessResponse.data?.stats || businessResponse.data || {};
      
      setStats({
        businessStats: businessStats,
        productionAnalytics: {}, // Données simulées pour l'instant
        efficiencyMetrics: {}, // Données simulées pour l'instant
        revenueAnalytics: {} // Données simulées pour l'instant
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      setError('Erreur lors du chargement des statistiques');
      showError('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  // Rendu des cartes de statistiques
  const renderStatCard = (title, value, icon, trend, color = 'blue') => {
    const colorClasses = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      purple: 'text-purple-600 bg-purple-100',
      orange: 'text-orange-600 bg-orange-100',
      red: 'text-red-600 bg-red-100'
    };

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center">
            {trend > 0 ? (
              <FiTrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <FiTrendingDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(trend)}% vs période précédente
            </span>
          </div>
        )}
      </div>
    );
  };

  // Rendu du graphique de production quotidienne
  const renderDailyProductionChart = () => {
    const dailyProduction = stats.productionAnalytics.dailyProduction || [];
    
    if (dailyProduction.length === 0) {
      return (
        <div className="text-center py-8">
                <FiBarChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucune donnée de production disponible</p>
        </div>
      );
    }

    const maxValue = Math.max(...dailyProduction.map(d => d.totalOrders || 0));
    
    return (
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900">Production quotidienne</h4>
        <div className="flex items-end space-x-2 h-40">
          {dailyProduction.slice(-7).map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="bg-purple-500 rounded-t w-full mb-2 transition-all duration-300 hover:bg-purple-600"
                style={{
                  height: `${((day.totalOrders || 0) / maxValue) * 120}px`
                }}
                title={`${day.date}: ${day.totalOrders || 0} commandes`}
              ></div>
              <span className="text-xs text-gray-600">
                {new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Rendu des métriques d'efficacité
  const renderEfficiencyMetrics = () => {
    const metrics = stats.efficiencyMetrics;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Temps de traitement</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Moyenne:</span>
              <span className="font-medium">{metrics.averageProcessingTime || 0}h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Minimum:</span>
              <span className="font-medium">{metrics.minProcessingTime || 0}h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Maximum:</span>
              <span className="font-medium">{metrics.maxProcessingTime || 0}h</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Taux de réussite</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Commandes réussies:</span>
              <span className="font-medium text-green-600">{metrics.successRate || 0}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Retards:</span>
              <span className="font-medium text-orange-600">{metrics.delayRate || 0}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Annulations:</span>
              <span className="font-medium text-red-600">{metrics.cancellationRate || 0}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <ModularDashboardLayout userType="transformer">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FiRefreshCw className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Chargement des statistiques...</p>
          </div>
        </div>
      </ModularDashboardLayout>
    );
  }

  if (error) {
    return (
      <ModularDashboardLayout userType="transformer">
        <div className="text-center py-12">
          <FiAlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadStats}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
          >
            Réessayer
          </button>
        </div>
      </ModularDashboardLayout>
    );
  }

  return (
    <ModularDashboardLayout userType="transformer">
      <div className="space-y-6 px-4 pb-20 pt-4">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Statistiques</h1>
            <p className="text-gray-600 mt-1">Analysez vos performances et votre croissance</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">90 derniers jours</option>
              <option value="1y">1 an</option>
            </select>
            
            <button
              onClick={loadStats}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
            >
              <FiRefreshCw className="h-4 w-4 mr-2 inline" />
              Actualiser
            </button>
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {renderStatCard(
            'Chiffre d\'affaires',
            `${(stats.businessStats.totalRevenue || 0).toLocaleString()} FCFA`,
            <FiDollarSign className="h-6 w-6" />,
            stats.businessStats.revenueGrowth,
            'green'
          )}
          
          {renderStatCard(
            'Commandes totales',
            stats.businessStats.totalOrders || 0,
            <FiPackage className="h-6 w-6" />,
            stats.businessStats.ordersGrowth,
            'blue'
          )}
          
          {renderStatCard(
            'Clients actifs',
            stats.businessStats.activeCustomers || 0,
            <FiUsers className="h-6 w-6" />,
            stats.businessStats.customersGrowth,
            'purple'
          )}
          
          {renderStatCard(
            'Note moyenne',
            stats.businessStats.averageRating || '0.0',
            <FiStar className="h-6 w-6" />,
            null,
            'orange'
          )}
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Production quotidienne */}
          <div className="bg-white rounded-lg shadow p-6">
            {renderDailyProductionChart()}
          </div>

          {/* Analyse des catégories */}
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Production par catégorie</h4>
            {stats.productionAnalytics.categoryAnalytics?.length > 0 ? (
              <div className="space-y-3">
                {stats.productionAnalytics.categoryAnalytics.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-600">{category.category}</span>
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{
                            width: `${(category.totalOrders / Math.max(...stats.productionAnalytics.categoryAnalytics.map(c => c.totalOrders))) * 100}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-12">{category.totalOrders}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiPieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Aucune donnée de catégorie disponible</p>
              </div>
            )}
          </div>
        </div>

        {/* Métriques d'efficacité */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Métriques d'efficacité</h3>
          {renderEfficiencyMetrics()}
        </div>

        {/* Analyse des revenus */}
        {stats.revenueAnalytics && (
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Analyse des revenus</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {stats.revenueAnalytics.monthlyRevenue || 0} FCFA
                </p>
                <p className="text-sm text-gray-600">Revenus mensuels</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {stats.revenueAnalytics.averageOrderValue || 0} FCFA
                </p>
                <p className="text-sm text-gray-600">Valeur moyenne des commandes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {stats.revenueAnalytics.repeatCustomerRate || 0}%
                </p>
                <p className="text-sm text-gray-600">Taux de clients récurrents</p>
              </div>
            </div>
          </div>
        )}

        {/* Tendance de croissance */}
        {stats.productionAnalytics.growthRate !== undefined && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Tendance de croissance</h4>
                <p className="text-gray-600">Évolution sur la période sélectionnée</p>
              </div>
              <div className="text-right">
                <div className="flex items-center">
                  {stats.productionAnalytics.growthRate > 0 ? (
                    <FiTrendingUp className="h-6 w-6 text-green-500 mr-2" />
                  ) : (
                    <FiTrendingDown className="h-6 w-6 text-red-500 mr-2" />
                  )}
                  <span className={`text-2xl font-bold ${
                    stats.productionAnalytics.growthRate > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stats.productionAnalytics.growthRate > 0 ? '+' : ''}{stats.productionAnalytics.growthRate}%
                  </span>
                </div>
                <p className="text-sm text-gray-600">vs période précédente</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModularDashboardLayout>
  );
};

export default TransformerStats;
