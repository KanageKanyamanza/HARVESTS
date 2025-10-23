import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiEdit, FiTrash2, FiClock, FiUser } from 'react-icons/fi';
import { consumerService } from '../../../services/genericService';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorMessage from '../../../components/common/ErrorMessage';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await consumerService.getMyReviews();
      
      if (response.data.status === 'success') {
        setReviews(response.data.data.reviews || []);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des avis:', err);
      setError('Impossible de charger vos avis');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      return;
    }

    try {
      await consumerService.deleteReview(reviewId);
      setReviews(prev => prev.filter(review => review._id !== reviewId));
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'avis:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ErrorMessage message={error} />
        </div>
      </div>
    );
  }

  return (
    <ModularDashboardLayout>
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FiStar className="h-8 w-8 text-yellow-500 mr-3" />
            Mes Avis
          </h1>
          <p className="mt-2 text-gray-600">
            {reviews.length} avis laissé{reviews.length > 1 ? 's' : ''} sur des produits
          </p>
        </div>

        {/* Liste des avis */}
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <FiStar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun avis laissé
            </h3>
            <p className="text-gray-500 mb-6">
              Vous n'avez pas encore laissé d'avis sur des produits.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Découvrir les produits
            </Link>
          </div>
        ) : (
          <div className="space-y-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div key={review._id} className="bg-white rounded-lg shadow p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* En-tête de l'avis */}
                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                      </div>
                      <span className="ml-2 text-sm text-gray-500">
                        {review.rating}/5
                      </span>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>

                    {/* Produit concerné */}
                    <div className="mb-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {review.product?.name?.fr || review.product?.name || 'Produit supprimé'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Vendu par {review.producer?.businessName || review.producer?.firstName + ' ' + review.producer?.lastName || 'Producteur inconnu'}
                      </p>
                    </div>

                    {/* Commentaire */}
                    {review.comment && (
                      <p className="text-gray-700 mb-4">{review.comment}</p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center space-x-4">
                      <Link
                        to={`/products/${review.product?._id}`}
                        className="text-sm text-green-600 hover:text-green-700"
                      >
                        Voir le produit
                      </Link>
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="text-sm text-red-600 hover:text-red-700 flex items-center"
                      >
                        <FiTrash2 className="h-4 w-4 mr-1" />
                        Supprimer
                      </button>
                    </div>
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

export default Reviews;
