import React, { useState, useEffect } from 'react';
import { transformerService } from '../../../services';
import { useNotifications } from '../../../contexts/NotificationContext';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import EmailVerificationRequired from '../../../components/common/EmailVerificationRequired';
import {
  FiStar,
  FiUser,
  FiCalendar,
  FiMessageSquare,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiFilter,
  FiSearch
} from 'react-icons/fi';
import { toPlainText } from '../../../utils/textHelpers';

const TransformerReviews = () => {
  const { showSuccess, showError } = useNotifications();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emailVerificationError, setEmailVerificationError] = useState(null);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: {},
    unreadCount: 0
  });
  const [filters, setFilters] = useState({
    status: 'all', // all, read, unread
    rating: 'all', // all, 5, 4, 3, 2, 1
    search: ''
  });

  // Charger les avis
  useEffect(() => {
    loadReviews();
  }, [filters]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setEmailVerificationError(null);
      setError(null);
      const response = await transformerService.getMyReviews({
        status: filters.status,
        rating: filters.rating,
        search: filters.search
      });
      
      if (response.data?.status === 'success') {
        setReviews(response.data.data.reviews || []);
        setStats(response.data.data.stats || {});
      }
    } catch (error) {
      console.error('Erreur lors du chargement des avis:', error);
      
      // Vérifier si c'est une erreur de vérification d'email
      if (error.response?.status === 403 && error.response?.data?.code === 'EMAIL_VERIFICATION_REQUIRED') {
        setEmailVerificationError(error.response.data);
      } else {
        setError('Erreur lors du chargement des avis');
        showError('Erreur lors du chargement des avis');
      }
    } finally {
      setLoading(false);
    }
  };

  // Marquer un avis comme lu
  const handleMarkAsRead = async (reviewId) => {
    try {
      await transformerService.markReviewAsRead(reviewId);
      setReviews(reviews.map(review => 
        review._id === reviewId ? { ...review, isRead: true } : review
      ));
      showSuccess('Avis marqué comme lu');
    } catch (error) {
      console.error('Erreur lors du marquage:', error);
      showError('Erreur lors du marquage de l\'avis');
    }
  };

  // Marquer tous les avis comme lus
  const handleMarkAllAsRead = async () => {
    try {
      await transformerService.markAllReviewsAsRead();
      setReviews(reviews.map(review => ({ ...review, isRead: true })));
      showSuccess('Tous les avis ont été marqués comme lus');
    } catch (error) {
      console.error('Erreur lors du marquage:', error);
      showError('Erreur lors du marquage des avis');
    }
  };

  // Répondre à un avis
  const handleRespondToReview = async (reviewId, response) => {
    try {
      await transformerService.respondToReview(reviewId, { response });
      setReviews(reviews.map(review => 
        review._id === reviewId ? { ...review, response, respondedAt: new Date() } : review
      ));
      showSuccess('Réponse envoyée avec succès');
    } catch (error) {
      console.error('Erreur lors de la réponse:', error);
      showError('Erreur lors de l\'envoi de la réponse');
    }
  };

  // Rendu des étoiles
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  // Rendu de la distribution des notes
  const renderRatingDistribution = () => {
    if (!stats.ratingDistribution) return null;
    
    return Object.entries(stats.ratingDistribution).map(([rating, count]) => (
      <div key={rating} className="flex items-center justify-between py-1">
        <div className="flex items-center">
          {renderStars(parseInt(rating))}
        </div>
        <div className="flex items-center">
          <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
            <div
              className="bg-yellow-400 h-2 rounded-full"
              style={{
                width: `${(count / stats.totalReviews) * 100}%`
              }}
            ></div>
          </div>
          <span className="text-sm text-gray-600 w-8">{count}</span>
        </div>
      </div>
    ));
  };

  if (loading) {
    return (
      <ModularDashboardLayout userType="transformer">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FiRefreshCw className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Chargement des avis...</p>
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
            onClick={loadReviews}
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
        {/* Message de vérification d'email */}
        {emailVerificationError && (
          <EmailVerificationRequired 
            errorData={emailVerificationError} 
            onResendEmail={() => {
              setEmailVerificationError(null);
              setTimeout(() => {
                loadReviews();
              }, 2000);
            }}
          />
        )}

        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Avis reçus</h1>
            <p className="text-gray-600 mt-1">Gérez les avis de vos clients</p>
          </div>
          {stats.unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
            >
              Marquer tout comme lu ({stats.unreadCount})
            </button>
          )}
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FiStar className="h-8 w-8 text-yellow-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Note moyenne</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FiMessageSquare className="h-8 w-8 text-blue-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total avis</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FiAlertCircle className="h-8 w-8 text-orange-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Non lus</p>
                <p className="text-2xl font-bold text-gray-900">{stats.unreadCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Distribution des notes */}
        {stats.ratingDistribution && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribution des notes</h3>
            <div className="space-y-2">
              {renderRatingDistribution()}
            </div>
          </div>
        )}

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Tous</option>
                <option value="read">Lus</option>
                <option value="unread">Non lus</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note
              </label>
              <select
                value={filters.rating}
                onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Toutes</option>
                <option value="5">5 étoiles</option>
                <option value="4">4 étoiles</option>
                <option value="3">3 étoiles</option>
                <option value="2">2 étoiles</option>
                <option value="1">1 étoile</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recherche
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Rechercher dans les avis..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Liste des avis */}
        <div className="bg-white rounded-lg shadow">
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <FiMessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun avis</h3>
              <p className="text-gray-600">Vous n'avez pas encore reçu d'avis de vos clients.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {reviews.map((review) => (
                <div key={review._id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <div className="flex items-center mr-4">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm text-gray-600">
                          {review.rating}/5
                        </span>
                        {!review.isRead && (
                          <span className="ml-2 bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                            Non lu
                          </span>
                        )}
                      </div>

                      <div className="flex items-center mb-3">
                        <FiUser className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-900">
                          {review.reviewer?.firstName} {review.reviewer?.lastName}
                        </span>
                        <FiCalendar className="h-4 w-4 text-gray-400 ml-4 mr-2" />
                        <span className="text-sm text-gray-600">
                          {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>

                      <p className="text-gray-700 mb-3">{review.comment}</p>

                      {review.product && (
                        <div className="text-sm text-gray-600 mb-3">
                          <span className="font-medium">Produit:</span> {toPlainText(review.product.name, 'Produit')}
                        </div>
                      )}

                      {review.response ? (
                        <div className="bg-gray-50 rounded-lg p-4 mt-3">
                          <div className="flex items-center mb-2">
                            <span className="font-medium text-gray-900">Votre réponse:</span>
                            <span className="text-sm text-gray-600 ml-2">
                              {new Date(review.respondedAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          <p className="text-gray-700">{review.response}</p>
                        </div>
                      ) : (
                        <div className="mt-3">
                          <textarea
                            placeholder="Répondre à cet avis..."
                            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            rows="3"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.ctrlKey) {
                                const response = e.target.value.trim();
                                if (response) {
                                  handleRespondToReview(review._id, response);
                                  e.target.value = '';
                                }
                              }
                            }}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Appuyez sur Ctrl+Entrée pour envoyer votre réponse
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      {!review.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(review._id)}
                          className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full hover:bg-blue-200"
                        >
                          Marquer comme lu
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ModularDashboardLayout>
  );
};

export default TransformerReviews;
