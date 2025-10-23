import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiTrendingUp, FiShoppingBag, FiDollarSign, FiStar, FiEye, FiClock } from 'react-icons/fi';
import { consumerService } from '../../../services/genericService';

const StatisticsSection = () => {
  const [stats, setStats] = useState(null);
  const [spendingAnalytics, setSpendingAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const [statsResponse, analyticsResponse] = await Promise.all([
        consumerService.getStats(),
        consumerService.getSpendingAnalytics().catch(() => ({ data: { analytics: {} } }))
      ]);
      
      setStats(statsResponse.data.data?.stats);
      setSpendingAnalytics(analyticsResponse.data.data?.analytics);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      setError('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="p-4 bg-gray-50 rounded-lg">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <FiTrendingUp className="h-12 w-12 text-red-300 mx-auto mb-4" />
        <p className="text-red-500 mb-4">Erreur lors du chargement des statistiques</p>
        <button
          onClick={loadStatistics}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <FiTrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune donnée</h3>
        <p className="text-gray-500">Vos statistiques détaillées apparaîtront ici</p>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      {/* Statistiques principales */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center">
            <FiShoppingBag className="h-5 w-5 text-blue-600" />
            <span className="ml-2 text-sm font-medium text-blue-900">Commandes</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            {stats.totalOrders || 0}
          </p>
        </div>
        
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center">
            <FiDollarSign className="h-5 w-5 text-green-600" />
            <span className="ml-2 text-sm font-medium text-green-900">Dépensé</span>
          </div>
          <p className="text-lg font-bold text-green-900 mt-1">
            {formatCurrency(stats.totalSpent)}
          </p>
        </div>
        
        <div className="p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-center">
            <FiStar className="h-5 w-5 text-yellow-600" />
            <span className="ml-2 text-sm font-medium text-yellow-900">Avis</span>
          </div>
          <p className="text-2xl font-bold text-yellow-900 mt-1">
            {stats.reviewsWritten || 0}
          </p>
          {stats.averageRatingGiven > 0 && (
            <p className="text-xs text-yellow-700 mt-1">
              Moyenne: {stats.averageRatingGiven.toFixed(1)}/5
            </p>
          )}
        </div>
        
        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center">
            <FiEye className="h-5 w-5 text-purple-600" />
            <span className="ml-2 text-sm font-medium text-purple-900">Vues</span>
          </div>
          <p className="text-2xl font-bold text-purple-900 mt-1">
            {stats.profileViews || 0}
          </p>
        </div>
      </div>

      {/* Dernière commande */}
      {stats.lastOrderDate && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <FiClock className="h-5 w-5 text-gray-600" />
            <span className="ml-2 text-sm font-medium text-gray-900">Dernière commande</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {formatDate(stats.lastOrderDate)}
          </p>
        </div>
      )}

      {/* Analytics de dépenses si disponibles */}
      {spendingAnalytics && Object.keys(spendingAnalytics).length > 0 && (
        <div className="p-4 bg-indigo-50 rounded-lg">
          <h4 className="text-sm font-medium text-indigo-900 mb-2">Analytics de dépenses</h4>
          <div className="text-xs text-indigo-700">
            {spendingAnalytics.monthlySpending && (
              <p>Ce mois: {formatCurrency(spendingAnalytics.monthlySpending)}</p>
            )}
            {spendingAnalytics.averageOrderValue && (
              <p>Panier moyen: {formatCurrency(spendingAnalytics.averageOrderValue)}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatisticsSection;
