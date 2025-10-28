import React from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiPlus, FiEdit, FiEye } from 'react-icons/fi';
import CloudinaryImage from '../../common/CloudinaryImage';

const ProductsSection = ({ products, userType, loading = false }) => {
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
          to={`/${userType}/products/add`}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="mr-2" />
          Ajouter un produit
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3 w-full">
      {products.slice(0, 5).map((product) => (
        <div key={product._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
            {product.images && product.images.length > 0 ? (
                 <CloudinaryImage
                   src={product.images[0].url}
                   alt={typeof product.name === 'object' ? product.name.fr || product.name.en || 'Produit' : product.name}
                   className="w-full h-full object-cover"
                 />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <FiPackage className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {typeof product.name === 'object' ? product.name.fr || product.name.en || 'Sans nom' : product.name}
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
              to={`/${userType}/products/edit/${product._id}`}
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
            to={`/${userType}/products`}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Voir tous les produits ({products.length})
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProductsSection;
