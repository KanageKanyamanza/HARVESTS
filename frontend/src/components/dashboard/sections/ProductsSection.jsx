import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPackage, FiPlus, FiEdit, FiEye } from 'react-icons/fi';
import CloudinaryImage from '../../common/CloudinaryImage';
import { getDishImageUrl } from '../../../utils/dishImageUtils';
import { toPlainText } from '../../../utils/textHelpers';

const ProductsSection = ({ products, userType, loading = false }) => {
  const navigate = useNavigate();
  
  // Fonction pour obtenir la route de modification selon le type d'utilisateur
  const getEditRoute = (productId) => {
    if (userType === 'restaurateur') {
      // Pour les restaurateurs, rediriger vers la page de gestion des plats
      // L'édition se fait via un modal dans DishesManagement
      return `/restaurateur/dishes`;
    } else if (userType === 'transformer') {
      return `/transformer/products/${productId}/edit`;
    } else if (userType === 'producer') {
      return `/producer/products/edit/${productId}`;
    }
    return `/${userType}/products/edit/${productId}`;
  };
  
  // Fonction pour obtenir la route "Voir tous"
  const getAllRoute = () => {
    if (userType === 'restaurateur') {
      return '/restaurateur/dishes';
    }
    return `/${userType}/products`;
  };
  
  // Fonction pour obtenir la route "Ajouter"
  const getAddRoute = () => {
    if (userType === 'restaurateur') {
      return '/restaurateur/dishes/add';
    }
    return `/${userType}/products/add`;
  };
  
  // Fonction pour gérer le clic sur modifier (spécial pour restaurateurs)
  const handleEditClick = (e) => {
    if (userType === 'restaurateur') {
      e.preventDefault();
      // Rediriger vers la page de gestion des plats
      // L'utilisateur pourra modifier via le modal dans DishesManagement
      navigate('/restaurateur/dishes');
    }
  };
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-gray-200 rounded"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8">
        <FiPackage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit</h3>
        <p className="text-gray-500 mb-4">Commencez par ajouter vos premiers produits.</p>
        <Link
          to={getAddRoute()}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="mr-2" />
          {userType === 'restaurateur' ? 'Ajouter un plat' : 'Ajouter un produit'}
        </Link>
      </div>
    );
  }

  const items = Array.isArray(products) ? products : [];

  return (
    <div className="space-y-3 w-full">
      {items.slice(0, 5).map((product) => (
        <div key={product._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
            {(() => {
              if (userType === 'restaurateur') {
                const imageUrl = getDishImageUrl(product);
                if (imageUrl) {
                  return (
                    <CloudinaryImage
                      src={imageUrl}
                      alt={toPlainText(product.name, 'Plat')}
                      className="w-full h-full object-cover"
                    />
                  );
                }
              } else if (product.images && product.images.length > 0) {
                return (
                  <CloudinaryImage
                    src={product.images[0].url || product.images[0]}
                    alt={toPlainText(product.name, 'Produit')}
                    className="w-full h-full object-cover"
                  />
                );
              }

              return (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <FiPackage className="h-6 w-6 text-gray-400" />
                </div>
              );
            })()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {toPlainText(product.name, 'Sans nom')}
            </h4>
            <p className="text-sm text-gray-500">
              {product.price ? `${product.price} XAF` : 'Prix non défini'}
            </p>
          </div>
          <div className="flex space-x-1">
            <Link
              to={`/products/${product._id}`}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Voir"
            >
              <FiEye className="h-4 w-4" />
            </Link>
            <Link
              to={getEditRoute(product._id)}
              onClick={(e) => handleEditClick(e, product._id)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Modifier"
            >
              <FiEdit className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ))}
      
      {products.length > 5 && (
        <div className="text-center pt-2">
          <Link
            to={getAllRoute()}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {userType === 'restaurateur' 
              ? `Voir tous les plats (${products.length})` 
              : `Voir tous les produits (${products.length})`}
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProductsSection;
