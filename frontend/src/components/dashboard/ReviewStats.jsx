import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, MessageSquare, ThumbsUp } from 'lucide-react';
import StarRating from '../reviews/StarRating';
import { reviewService } from '../../services';

const ReviewStats = ({ 
  userId, 
  userType = 'producer', 
  showDetailed = false,
  className = '' 
}) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        let response;
        
        if (userType === 'producer') {
          response = await reviewService.getProducerRatingStats(userId);
        } else {
          // Pour les consommateurs, on ne charge pas de statistiques de producteur
          // On pourrait implémenter des stats spécifiques aux consommateurs plus tard
          setStats(null);
          return;
        }
        
        setStats(response.data || null);
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadStats();
    }
  }, [userId, userType]);

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            <div className="h-3 bg-gray-300 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Avis et notes
        </h3>
        <div className="text-center py-4">
          <Star className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  const getAverageRating = () => {
    return stats.averageRating ? stats.averageRating.toFixed(1) : '0.0';
  };

  const getTotalReviews = () => {
    return stats.totalReviews || 0;
  };

  const getDetailedStats = () => {
    return stats.averageDetailedRatings || null;
  };

  const getRatingDistribution = () => {
    if (!stats.ratingCounts) return null;
    
    const total = stats.totalReviews || 0;
    return [5, 4, 3, 2, 1].map(rating => ({
      rating,
      count: stats.ratingCounts[rating] || 0,
      percentage: total > 0 ? ((stats.ratingCounts[rating] || 0) / total) * 100 : 0
    }));
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Avis et notes
      </h3>

      {/* Note moyenne principale */}
      <div className="text-center mb-6">
        <div className="text-3xl font-bold text-gray-900 mb-2">
          {getAverageRating()}
        </div>
        <StarRating rating={parseFloat(getAverageRating())} size="lg" />
        <div className="text-sm text-gray-600 mt-2">
          {getTotalReviews()} avis
        </div>
      </div>

      {/* Distribution des notes */}
      {getRatingDistribution() && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Distribution des notes
          </h4>
          <div className="space-y-2">
            {getRatingDistribution().map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 w-6">{rating}</span>
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-8">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Détails des évaluations */}
      {showDetailed && getDetailedStats() && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Détails des évaluations
          </h4>
          <div className="space-y-2">
            {Object.entries(getDetailedStats()).map(([criteria, rating]) => {
              const labels = {
                quality: 'Qualité',
                freshness: 'Fraîcheur',
                packaging: 'Emballage',
                delivery: 'Livraison',
                communication: 'Communication',
                valueForMoney: 'Rapport qualité/prix'
              };
              
              return (
                <div key={criteria} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    {labels[criteria] || criteria}
                  </span>
                  <div className="flex items-center space-x-2">
                    <StarRating rating={rating} size="sm" />
                    <span className="text-sm text-gray-600 w-8">
                      {rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <MessageSquare className="h-4 w-4 text-blue-500 mr-1" />
            <span className="text-sm text-gray-600">Total</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {getTotalReviews()}
          </div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-gray-600">Moyenne</span>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {getAverageRating()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewStats;
