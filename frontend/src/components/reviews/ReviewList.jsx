import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  Star, 
  ChevronDown,
  SortAsc,
  SortDesc
} from 'lucide-react';
import ReviewCard from './ReviewCard';
import StarRating from './StarRating';

const ReviewList = ({ 
  reviews = [], 
  stats = null,
  onVoteHelpful = null,
  onVoteUnhelpful = null,
  currentUserId = null,
  showProductInfo = false,
  loading = false
}) => {
  const [filteredReviews, setFilteredReviews] = useState(reviews);
  const [filters, setFilters] = useState({
    rating: 'all',
    verified: 'all',
    sort: 'most-helpful'
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let filtered = [...reviews];

    // Filtre par note
    if (filters.rating !== 'all') {
      const rating = parseInt(filters.rating);
      filtered = filtered.filter(review => review.rating === rating);
    }

    // Filtre par achat vérifié
    if (filters.verified === 'verified') {
      filtered = filtered.filter(review => review.isVerifiedPurchase);
    }

    // Tri
    switch (filters.sort) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'highest-rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest-rating':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      case 'most-helpful':
        filtered.sort((a, b) => (b.helpfulVotes || 0) - (a.helpfulVotes || 0));
        break;
      default:
        break;
    }

    setFilteredReviews(filtered);
  }, [reviews, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getRatingDistribution = () => {
    if (!stats?.ratingCounts) return null;
    
    const total = stats.totalReviews || 0;
    return [5, 4, 3, 2, 1].map(rating => ({
      rating,
      count: stats.ratingCounts[rating] || 0,
      percentage: total > 0 ? ((stats.ratingCounts[rating] || 0) / total) * 100 : 0
    }));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="flex items-start space-x-3 mb-4">
              <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/4"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats et filtres */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Statistiques globales */}
        {stats && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {stats.averageRating?.toFixed(1) || '0.0'}
                  </div>
                  <StarRating rating={stats.averageRating || 0} size="lg" />
                  <div className="text-sm text-gray-600 mt-1">
                    {stats.totalReviews || 0} avis
                  </div>
                </div>
              </div>

              {/* Distribution des notes */}
              <div className="flex-1 max-w-md">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Distribution des notes</h4>
                <div className="space-y-2">
                  {getRatingDistribution()?.map(({ rating, count, percentage }) => (
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
            </div>
          </div>
        )}

        {/* Filtres */}
        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <Filter className="h-4 w-4" />
            <span>Filtres</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filtre par note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note
                </label>
                <select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange('rating', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">Toutes les notes</option>
                  <option value="5">5 étoiles</option>
                  <option value="4">4 étoiles</option>
                  <option value="3">3 étoiles</option>
                  <option value="2">2 étoiles</option>
                  <option value="1">1 étoile</option>
                </select>
              </div>

              {/* Filtre par achat vérifié */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type d'avis
                </label>
                <select
                  value={filters.verified}
                  onChange={(e) => handleFilterChange('verified', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">Tous les avis</option>
                  <option value="verified">Achats vérifiés</option>
                </select>
              </div>

              {/* Tri */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trier par
                </label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="most-helpful">Plus utiles</option>
                  <option value="newest">Plus récents</option>
                  <option value="oldest">Plus anciens</option>
                  <option value="highest-rating">Meilleures notes</option>
                  <option value="lowest-rating">Moins bonnes notes</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Liste des avis */}
      <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-8">
            <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun avis trouvé
            </h3>
            <p className="text-gray-600">
              {filters.rating !== 'all' || filters.verified !== 'all'
                ? 'Aucun avis ne correspond à vos filtres.'
                : 'Soyez le premier à laisser un avis !'
              }
            </p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              showProductInfo={showProductInfo}
              onVoteHelpful={onVoteHelpful}
              onVoteUnhelpful={onVoteUnhelpful}
              currentUserId={currentUserId}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewList;
