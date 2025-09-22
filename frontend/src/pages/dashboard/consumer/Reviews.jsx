import React, { useState, useEffect } from 'react';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import { useAuth } from '../../../hooks/useAuth';
import { consumerService } from '../../../services/api';
import { 
  FiStar, 
  FiEdit3, 
  FiTrash2, 
  FiEye,
  FiCalendar,
  FiPackage,
  FiUser,
  FiThumbsUp,
  FiThumbsDown
} from 'react-icons/fi';

const Reviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Charger les avis
  useEffect(() => {
    const loadReviews = async () => {
      if (user?.userType === 'consumer') {
        try {
          setLoading(true);
          const response = await consumerService.getMyReviews();
          console.log('📡 Réponse API Reviews:', response);
          setReviews(response.data.reviews || []);
        } catch (error) {
          console.error('Erreur lors du chargement des avis:', error);
          setReviews([]);
        } finally {
          setLoading(false);
        }
      }
    };

    loadReviews();
  }, [user]);

  const deleteReview = async (reviewId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      try {
        console.log('🗑️ Delete review:', reviewId);
        await consumerService.deleteMyReview(reviewId);
        setReviews(reviews.filter(review => review.id !== reviewId));
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FiStar
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getRatingText = (rating) => {
    switch (rating) {
      case 5: return 'Excellent';
      case 4: return 'Très bien';
      case 3: return 'Bien';
      case 2: return 'Moyen';
      case 1: return 'Mauvais';
      default: return 'Non évalué';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredReviews = reviews.filter(review => {
    if (filter === 'all') return true;
    if (filter === 'positive') return review.rating >= 4;
    if (filter === 'negative') return review.rating <= 2;
    return true;
  });

  if (loading) {
    return (
      <ModularDashboardLayout>
        <div className="p-6 max-w-7xl mx-auto pb-20">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
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
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FiStar className="h-8 w-8 mr-3 text-yellow-500" />
            Mes avis et évaluations
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez vos avis sur les produits et producteurs
          </p>
        </div>

        {/* Filtres */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'all'
                  ? 'bg-harvests-green text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tous ({reviews.length})
            </button>
            <button
              onClick={() => setFilter('positive')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'positive'
                  ? 'bg-harvests-green text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Positifs ({reviews.filter(r => r.rating >= 4).length})
            </button>
            <button
              onClick={() => setFilter('negative')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'negative'
                  ? 'bg-harvests-green text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Négatifs ({reviews.filter(r => r.rating <= 2).length})
            </button>
          </div>
        </div>

        {/* Liste des avis */}
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FiStar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'Aucun avis' : 'Aucun avis trouvé'}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? 'Vous n\'avez pas encore écrit d\'avis. Commencez à évaluer vos achats !'
                : 'Aucun avis ne correspond à ce filtre.'
              }
            </p>
            {filter === 'all' && (
              <button className="px-6 py-2 bg-harvests-green text-white rounded-md hover:bg-harvests-green/90">
                Voir mes commandes
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredReviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {getRatingText(review.rating)}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {review.product?.name || 'Produit'}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Producteur: {review.producer?.name || 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>

                  {review.comment && (
                    <div className="mb-4">
                      <p className="text-gray-700 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  )}

                  {/* Détails du produit */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center text-sm text-gray-600">
                      <FiPackage className="h-4 w-4 mr-2 text-harvests-green" />
                      <span>Commande #{review.orderId}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FiCalendar className="h-4 w-4 mr-2 text-harvests-green" />
                      <span>Livré le {formatDate(review.deliveryDate)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-2">
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                      <FiEye className="h-4 w-4" />
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                      <FiEdit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteReview(review.id)}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ModularDashboardLayout>
  );
};

export default Reviews;
