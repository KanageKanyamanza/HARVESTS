import React from 'react';
import { FiPlus, FiMinus } from 'react-icons/fi';
import { toPlainText } from '../../utils/textHelpers';

const OrderCart = ({ 
  cart, 
  onUpdateQuantity, 
  onRemoveFromCart, 
  onCalculateTotal,
  onBackToSuppliers 
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Panier</h3>
      
      {cart.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500 mb-4">Votre panier est vide</p>
          {onBackToSuppliers && (
            <button
              onClick={onBackToSuppliers}
              className="inline-flex items-center px-4 py-2 bg-harvests-green text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Voir les produits
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {cart.map((item) => (
            <div key={item.product._id} className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">
                  {toPlainText(item.product.name, 'Produit') || 'Produit'}
                </h4>
                <p className="text-sm text-gray-500">
                  {(Number(item.product.price?.value ?? item.product.price ?? 0)).toLocaleString()} FCFA
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onUpdateQuantity(item.product._id, item.quantity - 1)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <FiMinus className="h-4 w-4" />
                </button>
                <span className="text-sm font-medium text-gray-900 w-8 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => onUpdateQuantity(item.product._id, item.quantity + 1)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <FiPlus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onRemoveFromCart(item.product._id)}
                  className="px-2 py-1 text-xs font-medium text-red-500 hover:text-red-700"
                >
                  Retirer
                </button>
              </div>
            </div>
          ))}
          
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between text-lg font-semibold text-gray-900">
              <span>Total:</span>
              <span>{onCalculateTotal().toLocaleString()} FCFA</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCart;

