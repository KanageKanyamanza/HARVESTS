import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Search } from 'lucide-react';
import { productService } from '../../services';
import { toPlainText } from '../../utils/textHelpers';
import LoadingSpinner from './LoadingSpinner';

// Composant pour gérer les images des produits
const ProductImage = ({ product, className = "" }) => {
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    if (product.images && product.images.length > 0) {
      const primaryImage = product.images.find(img => img.isPrimary);
      if (primaryImage) {
        setImageSrc(primaryImage.url || primaryImage);
      } else {
        setImageSrc(product.images[0].url || product.images[0]);
      }
      setImageError(false);
    }
  }, [product.images]);

  const handleImageError = () => {
    setImageError(true);
  };

  if (!product.images || product.images.length === 0 || imageError || !imageSrc) {
    return (
      <div className={`${className} bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center`}>
        <div className="text-center">
          <div className="text-green-600 text-lg mb-1">🌱</div>
          <span className="text-green-700 text-xs font-medium">Bio</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={toPlainText(product.name, 'Produit')}
      className={className}
      onError={handleImageError}
      loading="lazy"
    />
  );
};

// Fonction utilitaire pour les labels de catégories
const getCategoryLabel = (category) => {
  const categories = {
    cereals: "Céréales",
    vegetables: "Légumes",
    fruits: "Fruits",
    legumes: "Légumineuses",
    tubers: "Tubercules",
    spices: "Épices",
    herbs: "Herbes",
    grains: "Grains",
    nuts: "Noix",
    seeds: "Graines",
    dairy: "Produits laitiers",
    meat: "Viande",
    poultry: "Volaille",
    fish: "Poisson",
    "processed-foods": "Aliments transformés",
    beverages: "Boissons",
    other: "Autres",
  };
  return categories[category] || category;
};

const SearchModal = ({ isOpen, onClose, onProductClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Focus sur l'input quand la modale s'ouvre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await productService.getProducts({
          search: searchQuery,
          limit: 20 // Plus de résultats dans la modale
        });

        if (response.data.status === 'success') {
          setResults(response.data.data.products || []);
        }
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
        setError('Erreur lors de la recherche');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Empêcher le scroll du body quand la modale est ouverte
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleProductClick = (product, event) => {
    event.preventDefault();
    event.stopPropagation();
    onProductClick(product);
    onClose();
  };

  const handleViewAllResults = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onClose();
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onClose();
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative h-full w-full bg-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 md:p-4 lg:p-6 border-b border-gray-200">
          <div className="flex-1 max-w-4xl mx-auto pr-2 md:pr-0">
            <form onSubmit={handleSubmit} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 md:h-6 md:w-6 text-gray-400" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 md:pl-12 pr-10 md:pr-4 py-3 md:py-4 text-base md:text-lg border-2 border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Rechercher des produits..."
                autoComplete="off"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 md:pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4 md:h-5 md:w-5" />
                </button>
              )}
            </form>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-2 md:ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Fermer"
          >
            <X className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-3 md:p-4 lg:p-6">
            {!searchQuery || searchQuery.length < 2 ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Commencez à taper pour rechercher des produits</p>
              </div>
            ) : loading ? (
              <div className="py-12 text-center">
                <LoadingSpinner size="lg" text="Recherche en cours..." />
              </div>
            ) : error ? (
              <div className="py-12 text-center">
                <p className="text-red-600 text-lg">{error}</p>
              </div>
            ) : results.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-gray-500 text-lg">Aucun produit trouvé pour "{searchQuery}"</p>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900">
                    {results.length} résultat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
                  </h3>
                  <button
                    onClick={handleViewAllResults}
                    className="text-primary-600 hover:text-primary-700 font-medium text-xs md:text-sm whitespace-nowrap"
                  >
                    Voir tous les résultats →
                  </button>
                </div>

                {/* Liste sur mobile, grille sur desktop */}
                <div className="space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0">
                  {results.map((product) => (
                    <Link
                      key={product._id}
                      to={`/products/${product._id}`}
                      onClick={(event) => handleProductClick(product, event)}
                      className="flex md:flex-col bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200"
                    >
                      {/* Image du produit */}
                      <div className="w-24 h-24 md:w-full md:h-48 flex-shrink-0 bg-gray-100">
                        <ProductImage 
                          product={product}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Informations du produit */}
                      <div className="p-3 md:p-4 flex-1 flex flex-col min-w-0">
                        <h4 className="text-sm md:text-base font-semibold text-gray-900 mb-1 md:mb-2 line-clamp-2">
                          {toPlainText(product.name, 'Nom non disponible')}
                        </h4>
                        <p className="text-xs md:text-sm text-gray-500 mb-1 md:mb-2">
                          {product.producer?.farmName || 'Producteur'}
                        </p>
                        
                        {/* Catégorie */}
                        {product.category && (
                          <div className="mb-2 md:mb-3">
                            <span className="inline-flex items-center px-1.5 md:px-2 py-0.5 md:py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                              {getCategoryLabel(product.category)}
                            </span>
                          </div>
                        )}
                        
                        {/* Prix */}
                        <div className="mt-auto pt-1 md:pt-2">
                          <p className="text-base md:text-lg font-bold text-green-600">
                            {product.price ? `${product.price.toLocaleString()} F CFA` : 'Prix non disponible'}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Bouton voir tous les résultats */}
                {results.length > 0 && (
                  <div className="mt-4 md:mt-6 text-center">
                    <button
                      onClick={handleViewAllResults}
                      className="w-full md:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm md:text-base"
                    >
                      Voir tous les résultats pour "{searchQuery}"
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;

