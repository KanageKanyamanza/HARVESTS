import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services';

// Composant pour gérer les images des produits
const ProductImage = ({ product, className = "" }) => {
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    if (product.images && product.images.length > 0) {
      // Chercher l'image principale d'abord
      const primaryImage = product.images.find(img => img.isPrimary);
      if (primaryImage) {
        setImageSrc(primaryImage.url || primaryImage);
      } else {
        // Sinon prendre la première image
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
      alt={product.name?.fr || product.name?.en || 'Produit'}
      className={className}
      onError={handleImageError}
      loading="lazy"
    />
  );
};

const SearchDropdown = ({ searchQuery, isOpen, onClose, onProductClick }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);

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
          limit: 6 // Limiter à 6 résultats pour le dropdown
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

  // Fermer le dropdown si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || (!searchQuery || searchQuery.length < 2)) {
    return null;
  }

  const handleProductClick = (product, event) => {
    event.preventDefault();
    event.stopPropagation();
    onProductClick(product);
    onClose();
  };

  return (
    <div 
      ref={dropdownRef}
      data-search-dropdown
      className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto
                 sm:max-h-80 md:max-h-96"
    >
      {loading && (
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Recherche en cours...</p>
        </div>
      )}

      {error && (
        <div className="p-4 text-center text-red-600">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && results.length === 0 && searchQuery && (
        <div className="p-4 text-center text-gray-600">
          <p className="text-sm">Aucun produit trouvé pour "{searchQuery}"</p>
        </div>
      )}

      {!loading && !error && results.length > 0 && (
        <div className="py-2">
          {results.map((product) => (
            <div
              key={product._id}
              onClick={(event) => handleProductClick(product, event)}
              className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0
                         sm:p-2 md:p-3"
            >
              {/* Image du produit */}
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 mr-2 sm:mr-3 relative">
                <ProductImage 
                  product={product}
                  className="w-full h-full object-cover rounded-md"
                />
              </div>

              {/* Informations du produit */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                      {product.name?.fr || product.name?.en || 'Nom non disponible'}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">
                      {product.producer?.farmName || 'Producteur'}
                    </p>
                  </div>
                  <div className="ml-1 sm:ml-2 flex-shrink-0">
                    <p className="text-xs sm:text-sm font-semibold text-green-600">
                      {product.price ? `${product.price.toLocaleString()} F CFA` : 'Prix non disponible'}
                    </p>
                  </div>
                </div>
                
                {/* Catégorie */}
                {product.category && (
                  <div className="mt-1">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800
                                   sm:px-2">
                      {getCategoryLabel(product.category)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Lien vers tous les résultats */}
          <div className="p-2 sm:p-3 border-t border-gray-200 bg-gray-50">
            <Link
              to={`/products?q=${encodeURIComponent(searchQuery)}`}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onClose();
                // Naviguer après avoir fermé le dropdown
                setTimeout(() => {
                  window.location.href = `/products?q=${encodeURIComponent(searchQuery)}`;
                }, 100);
              }}
              className="block text-center text-xs sm:text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Voir tous les résultats pour "{searchQuery}"
            </Link>
          </div>
        </div>
      )}
    </div>
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

export default SearchDropdown;
