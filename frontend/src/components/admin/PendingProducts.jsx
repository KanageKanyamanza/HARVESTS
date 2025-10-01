import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, User, MapPin } from 'lucide-react';
import CloudinaryImage from '../common/CloudinaryImage';

const PendingProducts = ({ products = [] }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Aucun produit en attente</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Produits en attente d'approbation</h3>
          <Link 
            to="/admin/products" 
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Voir tous
          </Link>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {products.map((product) => (
          <div key={product._id} className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <CloudinaryImage
                  src={product.images?.[0]?.url}
                  alt={product.name?.fr || product.name}
                  className="w-16 h-16 rounded-lg object-cover"
                  fallback="/images/placeholder-product.svg"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {product.name?.fr || product.name}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {product.category} • {product.subcategory}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(product.price)}
                      </span>
                      <span className="text-sm text-gray-500">
                        Stock: {product.availability?.quantity || 0}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs text-gray-500">
                      {formatDate(product.createdAt)}
                    </span>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {product.producer?.firstName} {product.producer?.lastName}
                    </span>
                  </div>
                  {product.producer?.farmName && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {product.producer.farmName}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingProducts;
