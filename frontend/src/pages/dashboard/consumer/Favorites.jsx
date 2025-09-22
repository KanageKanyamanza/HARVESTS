import React, { useState, useEffect } from 'react';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import { useAuth } from '../../../hooks/useAuth';
import { consumerService } from '../../../services/api';
import { 
  FiHeart, 
  FiShoppingCart, 
  FiEye, 
  FiTrash2, 
  FiSearch,
  FiFilter,
  FiGrid,
  FiList,
  FiStar,
  FiMapPin,
  FiClock
} from 'react-icons/fi';

const Favorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid');
  const [filterCategory, setFilterCategory] = useState('all');

  // Charger les favoris
  useEffect(() => {
    const loadFavorites = async () => {
      if (user?.userType === 'consumer') {
        try {
          setLoading(true);
          const response = await consumerService.getWishlist();
          console.log('📡 Réponse API Favorites:', response);
          setFavorites(response.data.wishlist || []);
        } catch (error) {
          console.error('Erreur lors du chargement des favoris:', error);
          setFavorites([]);
        } finally {
          setLoading(false);
        }
      }
    };

    loadFavorites();
  }, [user]);


  // Filtrer et trier les favoris
  const filteredFavorites = favorites
    .filter(favorite => {
      const matchesSearch = favorite.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           favorite.product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || favorite.product.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.product.name.localeCompare(b.product.name);
        case 'price-low':
          return a.product.price - b.product.price;
        case 'price-high':
          return b.product.price - a.product.price;
        case 'recent':
        default:
          return new Date(b.addedAt) - new Date(a.addedAt);
      }
    });

  const categories = [
    { value: 'all', label: 'Toutes les catégories' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'légumes', label: 'Légumes' },
    { value: 'céréales', label: 'Céréales' },
    { value: 'viandes', label: 'Viandes' },
    { value: 'poissons', label: 'Poissons' }
  ];

  const sortOptions = [
    { value: 'recent', label: 'Plus récent' },
    { value: 'name', label: 'Nom A-Z' },
    { value: 'price-low', label: 'Prix croissant' },
    { value: 'price-high', label: 'Prix décroissant' }
  ];

  const removeFromFavorites = async (favoriteId) => {
    try {
      // await consumerService.removeFromFavorites(favoriteId);
      setFavorites(favorites.filter(fav => fav.id !== favoriteId));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const addToCart = async (productId) => {
    try {
      // await consumerService.addToCart(productId);
      console.log('Produit ajouté au panier:', productId);
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
    }
  };

  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' ' + currency;
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
      <ModularDashboardLayout>
        <div className="p-6 max-w-7xl mx-auto pb-20">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
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
            <FiHeart className="h-8 w-8 mr-3 text-red-500" />
            Mes favoris
          </h1>
          <p className="text-gray-600 mt-1">
            Retrouvez tous vos produits préférés
          </p>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Recherche */}
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher dans vos favoris..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
              />
            </div>

            {/* Filtres */}
            <div className="flex flex-wrap gap-4">
              {/* Catégorie */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>

              {/* Tri */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Mode d'affichage */}
              <div className="flex border border-gray-300 rounded-md">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-harvests-green text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <FiGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-harvests-green text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <FiList className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Résultats */}
        <div className="mb-4">
          <p className="text-gray-600">
            {filteredFavorites.length} produit{filteredFavorites.length > 1 ? 's' : ''} trouvé{filteredFavorites.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Liste des favoris */}
        {filteredFavorites.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FiHeart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun favori trouvé</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterCategory !== 'all' 
                ? 'Aucun produit ne correspond à vos critères de recherche.'
                : 'Vous n\'avez pas encore de produits favoris.'}
            </p>
            {!searchTerm && filterCategory === 'all' && (
              <button className="px-6 py-2 bg-harvests-green text-white rounded-md hover:bg-harvests-green/90">
                Découvrir les produits
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }>
            {filteredFavorites.map((favorite) => (
              <div key={favorite.id} className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow ${
                viewMode === 'list' ? 'flex' : ''
              }`}>
                {/* Image du produit */}
                <div className={`${viewMode === 'list' ? 'w-48 h-32' : 'h-48'} bg-gray-200 rounded-t-lg lg:rounded-l-lg lg:rounded-t-none flex-shrink-0`}>
                  <img
                    src={favorite.product.image}
                    alt={favorite.product.name}
                    className="w-full h-full object-cover rounded-t-lg lg:rounded-l-lg lg:rounded-t-none"
                    onError={(e) => {
                      e.target.src = '/images/placeholder-product.jpg';
                    }}
                  />
                </div>

                {/* Contenu */}
                <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {favorite.product.name}
                    </h3>
                    <button
                      onClick={() => removeFromFavorites(favorite.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Retirer des favoris"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {favorite.product.description}
                  </p>

                  {/* Producteur */}
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <FiMapPin className="h-4 w-4 mr-1" />
                    <span>{favorite.product.producer.name}</span>
                    <div className="flex items-center ml-2">
                      <FiStar className="h-3 w-3 text-yellow-400 mr-1" />
                      <span>{favorite.product.producer.rating}</span>
                    </div>
                  </div>

                  {/* Prix et disponibilité */}
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="text-xl font-bold text-harvests-green">
                        {formatPrice(favorite.product.price, favorite.product.currency)}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        /unité
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      favorite.product.availability === 'En stock' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {favorite.product.availability}
                    </span>
                  </div>

                  {/* Date d'ajout */}
                  <div className="flex items-center text-xs text-gray-400 mb-4">
                    <FiClock className="h-3 w-3 mr-1" />
                    <span>Ajouté le {formatDate(favorite.addedAt)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => addToCart(favorite.product.id)}
                      disabled={favorite.product.availability !== 'En stock'}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-harvests-green text-white rounded-md hover:bg-harvests-green/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiShoppingCart className="h-4 w-4" />
                      <span>Ajouter au panier</span>
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                      <FiEye className="h-4 w-4" />
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

export default Favorites;
