import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiStar, FiMapPin, FiClock } from 'react-icons/fi';
import { consumerService } from '../../../services/genericService';
import ProductCard from '../../../components/products/ProductCard';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorMessage from '../../../components/common/ErrorMessage';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';

const Favorites = () => {
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
      
      if (response.data.status === 'success') {
        setFavorites(response.data.data.favorites || []);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des favoris:', err);
      setError('Impossible de charger vos produits favoris');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (productId) => {
    try {
      await consumerService.removeFavorite(productId);
      setFavorites(prev => prev.filter(fav => fav.product._id !== productId));
    } catch (err) {
      console.error('Erreur lors de la suppression du favori:', err);
    }
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FiHeart className="h-8 w-8 text-red-500 mr-3" />
                Mes Produits Favoris
              </h1>
              <p className="mt-2 text-gray-600">
                {favorites.length} produit{favorites.length > 1 ? 's' : ''} dans vos favoris
              </p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <FiShoppingCart className="h-4 w-4 mr-2" />
              Plus de produits
            </Link>
          </div>
        </div>

        {/* Liste des favoris */}
        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <FiHeart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun produit favori
            </h3>
            <p className="text-gray-500 mb-6">
              Commencez à ajouter des produits à vos favoris pour les retrouver facilement.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <FiShoppingCart className="h-4 w-4 mr-2" />
              Découvrir les produits
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((favorite) => {
              // Vérification de sécurité pour éviter les erreurs si product est null
              if (!favorite.product) {
                return null;
              }
              
              return (
                <div key={favorite._id} className="relative">
                  <ProductCard
                    product={favorite.product}
                    showActions={true}
                    onRemoveFavorite={() => handleRemoveFavorite(favorite.product._id)}
                  />
                </div>
              );
            })}
          </div>
        )}
        </div>
      </div>
    </ModularDashboardLayout>
  );
};

export default Favorites;
