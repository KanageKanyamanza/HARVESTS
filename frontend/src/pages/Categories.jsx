import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services';
import CloudinaryImage from '../components/common/CloudinaryImage';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  FiGrid, 
  FiList, 
  FiPackage, 
  FiStar,
  FiArrowRight,
  FiSearch
} from 'react-icons/fi';

const Categories = () => {
  
  // États
  const [categories, setCategories] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Charger les données
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productService.getCategories();
      if (response.data.status === 'success') {
        const categoriesData = response.data.data || [];
        setCategories(categoriesData);
        
        // Charger les produits pour chaque catégorie
        const productsPromises = categoriesData.map(category => 
          loadCategoryProducts(category, 4) // Limiter à 4 produits par catégorie
        );
        await Promise.all(productsPromises);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      setError('Erreur lors du chargement des catégories');
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryProducts = async (category, limit = 8) => {
    try {
      const response = await productService.getProductsByCategory(category, { limit });
      if (response.data.status === 'success') {
        setCategoryProducts(prev => ({
          ...prev,
          [category]: response.data.data.products || []
        }));
      }
    } catch (error) {
      console.error(`Erreur lors du chargement des produits pour ${category}:`, error);
    }
  };

  const getCategoryLabel = (category) => {
    const categories = {
      'cereals': 'Céréales',
      'vegetables': 'Légumes',
      'fruits': 'Fruits',
      'legumes': 'Légumineuses',
      'tubers': 'Tubercules',
      'spices': 'Épices',
      'herbs': 'Herbes',
      'grains': 'Grains',
      'nuts': 'Noix',
      'seeds': 'Graines',
      'dairy': 'Produits laitiers',
      'meat': 'Viande',
      'poultry': 'Volaille',
      'fish': 'Poisson',
      'processed-foods': 'Aliments transformés',
      'beverages': 'Boissons',
      'other': 'Autres'
    };
    return categories[category] || category;
  };

  const getCategoryDescription = (category) => {
    const descriptions = {
      'cereals': 'Riz, maïs, mil, sorgho et autres céréales locales',
      'vegetables': 'Légumes frais cultivés localement',
      'fruits': 'Fruits de saison et tropicaux',
      'legumes': 'Haricots, pois, lentilles et autres légumineuses',
      'tubers': 'Manioc, igname, patate douce et autres tubercules',
      'spices': 'Épices et condiments pour vos plats',
      'herbs': 'Herbes aromatiques et médicinales',
      'nuts': 'Noix, amandes et autres fruits à coque',
      'seeds': 'Graines diverses pour la cuisine',
      'dairy': 'Produits laitiers frais',
      'meat': 'Viande fraîche de qualité',
      'poultry': 'Volaille et œufs',
      'fish': 'Poisson frais et fruits de mer',
      'processed-foods': 'Aliments transformés locaux',
      'beverages': 'Boissons naturelles et jus',
      'other': 'Autres produits agricoles'
    };
    return descriptions[category] || 'Produits de qualité';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'cereals': '🌾',
      'vegetables': '🥬',
      'fruits': '🍎',
      'legumes': '🫘',
      'tubers': '🥔',
      'spices': '🌶️',
      'herbs': '🌿',
      'nuts': '🥜',
      'seeds': '🌱',
      'dairy': '🥛',
      'meat': '🥩',
      'poultry': '🐔',
      'fish': '🐟',
      'processed-foods': '🥫',
      'beverages': '🥤',
      'other': '📦'
    };
    return icons[category] || '📦';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  };

  const filteredCategories = categories.filter(category => {
    if (!searchQuery) return true;
    const label = getCategoryLabel(category).toLowerCase();
    return label.includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Nos Catégories
          </h1>
          <p className="text-gray-600">
            Explorez nos catégories de produits frais et de qualité
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une catégorie..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <FiGrid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <FiList className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Liste des catégories */}
        {error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">{error}</div>
            <button
              onClick={loadCategories}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Réessayer
            </button>
          </div>
        ) : filteredCategories.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1 md:grid-cols-2'
          }`}>
            {filteredCategories.map((category) => {
              const products = categoryProducts[category] || [];
              const totalProducts = products.length;
              
              return (
                <div
                  key={category}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <Link to={`/categories/${category}`}>
                    {viewMode === 'grid' ? (
                      <div className="p-6">
                        {/* En-tête de la catégorie */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="text-3xl">
                              {getCategoryIcon(category)}
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900">
                                {getCategoryLabel(category)}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {getCategoryDescription(category)}
                              </p>
                            </div>
                          </div>
                          <FiArrowRight className="h-5 w-5 text-gray-400" />
                        </div>

                        {/* Produits de la catégorie */}
                        {products.length > 0 ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">
                                Produits populaires
                              </span>
                              <span className="text-sm text-gray-500">
                                {totalProducts} produit{totalProducts > 1 ? 's' : ''}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              {products.slice(0, 4).map((product) => {
                                const productName = product.name?.fr || product.name?.en || product.name;
                                const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
                                
                                return (
                                  <div key={product._id} className="group">
                                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2">
                                      {primaryImage ? (
                                        <CloudinaryImage
                                          src={primaryImage.url}
                                          alt={productName}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                          width={100}
                                          height={100}
                                          quality="auto"
                                          crop="fit"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                          <FiPackage className="h-6 w-6" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-xs">
                                      <p className="font-medium text-gray-900 truncate">
                                        {productName}
                                      </p>
                                      <p className="text-green-600 font-semibold">
                                        {formatPrice(product.price)}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <FiPackage className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">
                              Aucun produit disponible
                            </p>
                          </div>
                        )}

                        {/* Bouton voir tous */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              Voir tous les produits
                            </span>
                            <FiArrowRight className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex p-6">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="text-2xl">
                            {getCategoryIcon(category)}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {getCategoryLabel(category)}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {getCategoryDescription(category)}
                            </p>
                            <div className="flex flex-wrap items-center sm:space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <FiPackage className="h-4 w-4 mr-1" />
                                {totalProducts} produit{totalProducts > 1 ? 's' : ''}
                              </span>
                              {products.length > 0 && (
                                <span className="flex items-center">
                                  <FiStar className="h-4 w-4 mr-1" />
                                  À partir de {formatPrice(Math.min(...products.map(p => p.price)))}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <FiArrowRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    )}
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FiPackage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune catégorie trouvée
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery 
                ? 'Essayez de modifier votre recherche'
                : 'Aucune catégorie disponible pour le moment'
              }
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Effacer la recherche
              </button>
            )}
          </div>
        )}

        {/* Section des catégories populaires */}
        {categories.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Catégories populaires
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((category) => (
                <Link
                  key={category}
                  to={`/categories/${category}`}
                  className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow group"
                >
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                    {getCategoryIcon(category)}
                  </div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {getCategoryLabel(category)}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
