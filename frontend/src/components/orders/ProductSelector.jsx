import React from 'react';
import { FiSearch, FiPlus, FiPackage } from 'react-icons/fi';
import CloudinaryImage from '../common/CloudinaryImage';
import { toPlainText } from '../../utils/textHelpers';
import OrderCart from './OrderCart';

const ProductSelector = ({ 
  selectedSupplier,
  products,
  cart,
  searchTerm,
  onSearchChange,
  onAddToCart,
  onUpdateQuantity,
  onRemoveFromCart,
  onCalculateTotal,
  onBackToSuppliers
}) => {
  // Filtrer les produits
  const filteredProducts = products.filter(product => {
    const nameText = toPlainText(product.name, '').toLowerCase();
    const descriptionText = toPlainText(product.description, '').toLowerCase();
    const term = searchTerm.toLowerCase();
    return nameText.includes(term) || descriptionText.includes(term);
  });

  const supplierName = selectedSupplier?.profile?.displayName || 
                      selectedSupplier?.companyName || 
                      `${selectedSupplier?.firstName || ''} ${selectedSupplier?.lastName || ''}`.trim() || 
                      'fournisseur';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Liste des produits */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Produits de {supplierName}
          </h2>
          
          {/* Recherche de produits */}
          <div className="mb-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
              />
            </div>
          </div>

          {/* Liste des produits */}
          <div className="space-y-4">
            {filteredProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-6">
                Aucun produit disponible pour ce fournisseur pour le moment.
              </p>
            ) : (
              filteredProducts.map((product) => (
                <div key={product._id || product.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      {product.images && product.images.length > 0 ? (
                        <CloudinaryImage
                          src={product.images[0].url}
                          alt={toPlainText(product.name, 'Produit')}
                          className="w-16 h-16 object-cover rounded-lg"
                          width={200}
                          height={200}
                          quality="auto"
                          crop="fill"
                        />
                      ) : (
                        <FiPackage className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      {product.category && (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 mb-1">
                          {product.category}
                        </span>
                      )}
                      <h3 className="text-sm font-medium text-gray-900">
                        {toPlainText(product.name, 'Produit') || 'Produit'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {toPlainText(product.description, '').slice(0, 80) || 'Description non disponible'}
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {(Number(product.price?.value ?? product.price ?? 0)).toLocaleString()} FCFA
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onAddToCart(product)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-harvests-green hover:bg-green-600"
                  >
                    <FiPlus className="h-4 w-4 mr-1" />
                    Ajouter
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Panier */}
      <div className="lg:col-span-1">
        <OrderCart
          cart={cart}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveFromCart={onRemoveFromCart}
          onCalculateTotal={onCalculateTotal}
          onBackToSuppliers={onBackToSuppliers}
        />
      </div>
    </div>
  );
};

export default ProductSelector;

