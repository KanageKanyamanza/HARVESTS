import React from 'react';
import { Link } from 'react-router-dom';
import CloudinaryImage from './CloudinaryImage';
import {
  FiPackage,
  FiDollarSign,
  FiEdit,
  FiEye,
  FiTrash2,
  FiStar,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiSend
} from 'react-icons/fi';
import { toPlainText } from '../../utils/textHelpers';

const ProductCard = ({ 
  product, 
  userType = 'transformer', // Type d'utilisateur par défaut
  onEdit,
  onDelete,
  onPublish,
  onView,
  showActions = true,
  showStatus = true,
  showFeatured = true
}) => {
  // Fonction pour obtenir la route de modification selon le type d'utilisateur
  const getEditRoute = (productId) => {
    if (userType === 'restaurateur') {
      // Pour les restaurateurs, rediriger vers la page de gestion des plats
      return '/restaurateur/dishes';
    } else if (userType === 'transformer') {
      return `/transformer/products/${productId}/edit`;
    } else if (userType === 'producer') {
      return `/producer/products/edit/${productId}`;
    }
    return `/${userType}/products/edit/${productId}`;
  };
  // Vérification de sécurité pour éviter les erreurs si product est null
  if (!product) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
        <div className="text-center text-gray-500">
          <FiPackage className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p>Produit non disponible</p>
        </div>
      </div>
    );
  }

  // Vérification supplémentaire pour éviter les erreurs
  if (!product || typeof product !== 'object') {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
        <div className="text-center text-gray-500">
          <FiPackage className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p>Données produit invalides</p>
        </div>
      </div>
    );
  }

  const productName = toPlainText(product.name, 'Produit sans nom');
  const productDescription = toPlainText(product.description, 'Aucune description');

  // Configuration des statuts
  const getStatusConfig = (status) => {
    const configs = {
      'approved': { color: 'bg-green-100 text-green-800', text: 'Publié', icon: FiCheckCircle },
      'pending-review': { color: 'bg-yellow-100 text-yellow-800', text: 'En révision', icon: FiClock },
      'draft': { color: 'bg-blue-100 text-blue-800', text: 'Brouillon', icon: FiEdit },
      'rejected': { color: 'bg-red-100 text-red-800', text: 'Rejeté', icon: FiXCircle },
      'inactive': { color: 'bg-gray-100 text-gray-800', text: 'Inactif', icon: FiXCircle }
    };
    return configs[status] || configs['draft'];
  };

  const statusConfig = getStatusConfig(product.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image du produit */}
      <div className="aspect-w-16 aspect-h-9">
        {product.images && product.images.length > 0 && product.images[0]?.url ? (
          <CloudinaryImage
            src={product.images[0].url}
            alt={productName}
            className="w-full h-48 object-cover"
            width={800}
            height={600}
            quality="auto"
            crop="fit"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-gray-500">
            <FiPackage className="h-16 w-16 text-gray-400 mb-2" />
            <span className="text-sm font-medium">Aucune image</span>
            <span className="text-xs text-gray-400">Ajoutez une image</span>
          </div>
        )}
      </div>

      {/* Contenu du produit */}
      <div className="p-6">
        {/* En-tête avec nom et statut */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {productName}
          </h3>
          <div className="flex flex-col items-end space-y-1">
            {showStatus && (
              <span className={`whitespace-nowrap inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusConfig.text}
              </span>
            )}
            {showFeatured && product.isFeatured && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <FiStar className="w-3 h-3 mr-1 fill-current" />
                Mis en avant
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {productDescription}
        </p>

        {/* Prix et stock */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center whitespace-nowrap">
              <FiDollarSign className="h-4 w-4 text-gray-400 mr-1" />
              <div>
                <span className="text-lg whitespace-nowrap font-bold text-gray-900">
                  {product.price?.toLocaleString()} {product.currency || 'FCFA'}
                </span>
                {product.unit && (
                  <span className="text-xs text-gray-500 ml-1">
                    par {product.unit}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center whitespace-nowrap">
              <FiPackage className="h-4 w-4 text-gray-400 mr-1" />
              <span className="text-sm text-gray-600">
                {product.inventory?.quantity || product.stock || 0} en stock
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {onEdit && (
                <Link
                  to={getEditRoute(product._id)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-harvests-light"
                >
                  <FiEdit className="h-4 w-4 mr-1" />
                  Modifier
                </Link>
              )}
              
              {onPublish && product.status === 'draft' && (
                <button
                  onClick={() => onPublish(product._id)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <FiSend className="h-4 w-4 mr-1" />
                  Publier
                </button>
              )}
              
              {onView && (
                <Link
                  to={`/products/${product._id}`}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-harvests-light"
                >
                  <FiEye className="h-4 w-4 mr-1" />
                  Voir
                </Link>
              )}
            </div>
            
            {onDelete && (
              <button
                onClick={() => onDelete(product._id)}
                className="p-2 text-red-400 hover:text-red-600"
              >
                <FiTrash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
