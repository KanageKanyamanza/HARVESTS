import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiStar, FiMapPin, FiClock } from 'react-icons/fi';
import { consumerService } from '../../../services/genericService';
import CloudinaryImage from '../../common/CloudinaryImage';
import { toPlainText } from '../../../utils/textHelpers';

const FavoritesSection = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const response = await consumerService.getFavorites();
      const favoritesData = response.data.data?.favorites || [];
      setFavorites(favoritesData.slice(0, 3)); // Afficher seulement les 3 premiers
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error);
      setError('Erreur lors du chargement des favoris');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (productId) => {
    try {
      await consumerService.removeFavorite(productId);
      setFavorites(favorites.filter(fav => fav.product._id !== productId));
    } catch (error) {
      console.error('Erreur lors de la suppression du favori:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="h-12 w-12 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <FiHeart className="h-12 w-12 text-red-300 mx-auto mb-4" />
        <p className="text-red-500 mb-4">Erreur lors du chargement des favoris</p>
        <button
          onClick={loadFavorites}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-8">
        <FiHeart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun favori</h3>
        <p className="text-gray-500 mb-4">Vos produits favoris apparaîtront ici</p>
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
      {favorites.map((favorite) => {
        // Vérification de sécurité pour éviter les erreurs si product est null
        if (!favorite.product) {
          return null;
        }
        
        return (
          <div key={favorite._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="flex-shrink-0">
            <CloudinaryImage
              src={favorite.product.images?.[0]?.url}
              alt={toPlainText(favorite.product.name, 'Produit')}
              className="h-12 w-12 rounded-lg object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {toPlainText(favorite.product.name, 'Produit')}
            </h4>
            <div className="flex items-center text-sm text-gray-500">
              <span className="font-medium text-green-600">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'XOF',
                  minimumFractionDigits: 0
                }).format(favorite.product.price || 0)}
              </span>
              {favorite.product.rating && (
                <>
                  <span className="mx-2">•</span>
                  <div className="flex items-center">
                    <FiStar className="h-3 w-3 text-yellow-400 fill-current" />
                    <span className="ml-1">{favorite.product.rating.toFixed(1)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              to={`/products/${favorite.product._id}`}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Voir
            </Link>
            <button
              onClick={() => handleRemoveFavorite(favorite.product._id)}
              className="text-red-500 hover:text-red-700 p-1"
              title="Retirer des favoris"
            >
              <FiHeart className="h-4 w-4 fill-current" />
            </button>
          </div>
        </div>
        );
      })}
    </div>
  );
};

export default FavoritesSection;
