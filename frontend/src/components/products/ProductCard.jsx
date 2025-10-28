import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CloudinaryImage from '../common/CloudinaryImage';
import { FiStar, FiPackage, FiMapPin, FiShoppingCart, FiCheck } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  
  const productName = product.name?.fr || product.name?.en || product.name;
  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart({
      ...product,
      quantity: 1
    });
    
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
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
      'nuts': 'Noix',
      'seeds': 'Graines',
      'dairy': 'Produits laitiers',
      'meat': 'Viande',
      'poultry': 'Volaille',
      'fish': 'Poisson',
      'processed-foods': 'Produits transformés',
      'beverages': 'Boissons',
      'other': 'Autre'
    };
    return categories[category] || category;
  };

  const getVendorName = (vendor) => {
    if (!vendor) return '';
    
    // Pour les producteurs
    if (vendor.farmName) {
      return vendor.farmName;
    }
    
    // Pour les transformateurs
    if (vendor.companyName) {
      return vendor.companyName;
    }
    
    // Pour les restaurateurs
    if (vendor.restaurantName) {
      return vendor.restaurantName;
    }
    
    // Fallback : nom complet de la personne
    if (vendor.firstName && vendor.lastName) {
      return `${vendor.firstName} ${vendor.lastName}`;
    }
    
    // Dernier fallback
    return vendor.user?.companyName || 'Vendeur';
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
      <Link to={`/products/${product._id}`} className="block">
        {/* Image */}
        <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
          {primaryImage ? (
            <CloudinaryImage
              src={primaryImage.url}
              alt={productName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              width={300}
              height={300}
              quality="auto"
              crop="fit"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <FiPackage className="h-12 w-12" />
            </div>
          )}
          
          {/* Badge Featured */}
          {product.isFeatured && (
            <div className="absolute top-3 left-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
              ⭐
            </div>
          )}
          
          {/* Badge Stock */}
          {product.inventory?.quantity <= 5 && product.inventory?.quantity > 0 && (
            <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
              Stock limité
            </div>
          )}
        </div>

        {/* Informations */}
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {getCategoryLabel(product.category)}
            </span>
            <div className="flex items-center text-yellow-500">
              <FiStar className="h-4 w-4 fill-current" />
              <span className="ml-1 text-sm text-gray-600 font-medium">
                0.0
              </span>
            </div>
          </div>

          <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[1rem]">
            {productName}
          </h3>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-xl font-bold text-green-600">
              {formatPrice(product.price)}
            </span>
            <div className="hidden sm:flex items-center text-sm text-gray-500">
              <FiPackage className="h-4 w-4 mr-1" />
              {product.inventory?.quantity || 0} en stock
            </div>
          </div>

          {/* Vendeur et bouton panier sur la même ligne */}
          <div className="flex items-center justify-between">
            {(product.producer || product.transformer) && (
              <div className="flex items-center text-xs text-gray-500 flex-1 min-w-0 mr-2">
                <FiMapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">
                  {getVendorName(product.producer || product.transformer)}
                </span>
                {(product.producer?.address?.city || product.transformer?.address?.city) && (
                  <>
                    <span className="mx-1">•</span>
                    <span className="truncate">
                      {product.producer?.address?.city || product.transformer?.address?.city}
                    </span>
                  </>
                )}
              </div>
            )}
            
            {/* Bouton Ajout au panier - toujours visible */}
            <button
              onClick={handleAddToCart}
              className={`p-2 rounded-full shadow-sm transition-all duration-300 transform flex-shrink-0 ${
                isAdded 
                  ? 'bg-green-600 scale-110' 
                  : 'bg-green-500 hover:bg-green-600 hover:scale-105'
              }`}
              title="Ajouter au panier"
            >
              {isAdded ? (
                <FiCheck className="h-4 w-4 text-white" />
              ) : (
                <FiShoppingCart className="h-4 w-4 text-white" />
              )}
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
