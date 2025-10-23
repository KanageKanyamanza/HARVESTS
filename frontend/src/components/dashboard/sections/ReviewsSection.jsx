import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiClock, FiShoppingCart } from 'react-icons/fi';
import { consumerService } from '../../../services/genericService';
import CloudinaryImage from '../../common/CloudinaryImage';

const ReviewsSection = () => {
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
      const reviewsData = response.data.data?.reviews || [];
      setReviews(reviewsData.slice(0, 3)); // Afficher seulement les 3 premiers
    } catch (error) {
      console.error('Erreur lors du chargement des avis:', error);
      setError('Erreur lors du chargement des avis');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
            </div>
            <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <FiStar className="h-12 w-12 text-red-300 mx-auto mb-4" />
        <p className="text-red-500 mb-4">Erreur lors du chargement des avis</p>
        <button
          onClick={loadReviews}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <FiStar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun avis</h3>
        <p className="text-gray-500 mb-4">Vos avis sur les produits apparaîtront ici</p>
        <Link
          to="/products"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiShoppingCart className="mr-2" />
          Découvrir les produits
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <div key={review._id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="flex items-center space-x-3 mb-2">
            <div className="flex-shrink-0">
              <CloudinaryImage
                src={review.product.images?.[0]?.url}
                alt={review.product.name?.fr || review.product.name?.en || review.product.name}
                className="h-8 w-8 rounded object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {review.product.name?.fr || review.product.name?.en || review.product.name}
              </h4>
              <div className="flex items-center text-xs text-gray-500">
                <FiClock className="h-3 w-3 mr-1" />
                {formatDate(review.createdAt)}
              </div>
            </div>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  className={`h-3 w-3 ${
                    i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          {review.comment && (
            <p className="text-sm text-gray-700 line-clamp-2">
              {review.comment}
            </p>
          )}
          <div className="mt-2 flex justify-between items-center">
            <span className="text-xs text-gray-500">
              Commande #{review.order?.orderNumber || 'N/A'}
            </span>
            <Link
              to={`/products/${review.product._id}`}
              className="text-blue-600 hover:text-blue-800 text-xs"
            >
              Voir le produit
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewsSection;
