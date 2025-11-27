import React from 'react';
import { FiShoppingCart, FiHeart, FiShare2, FiPlus, FiMinus, FiCheckCircle } from 'react-icons/fi';

const ProductActions = ({
  quantity,
  onQuantityChange,
  onAddToCart,
  onToggleFavorite,
  onShare,
  isFavorite,
  showAddedToCart
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">Quantité</label>
        <div className="flex items-center border border-gray-300 rounded-md">
          <button
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            className="p-2 hover:bg-gray-100"
          >
            <FiMinus className="h-4 w-4" />
          </button>
          <span className="px-4 py-2 border-x border-gray-300 min-w-[3rem] text-center">
            {quantity}
          </span>
          <button
            onClick={() => onQuantityChange(quantity + 1)}
            className="p-2 hover:bg-gray-100"
          >
            <FiPlus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={onAddToCart}
          className={`flex-1 px-6 py-3 rounded-md flex items-center justify-center font-medium transition-all duration-300 transform ${
            showAddedToCart 
              ? 'bg-green-600 scale-105 shadow-lg' 
              : 'bg-harvests-green text-white hover:bg-green-600 hover:scale-[1.02] active:scale-95'
          }`}
        >
          {showAddedToCart ? (
            <FiCheckCircle className="h-5 w-5 sm:mr-2 text-white" />
          ) : (
            <FiShoppingCart className="h-5 w-5 sm:mr-2" />
          )}
          <span className="hidden sm:inline text-white">
            {showAddedToCart ? 'Ajouté !' : 'Ajouter au panier'}
          </span>
        </button>
        
        <button
          onClick={onToggleFavorite}
          className={`p-3 rounded-md border ${
            isFavorite 
              ? 'bg-red-50 border-red-200 text-red-600' 
              : 'bg-white border-gray-300 text-gray-600 hover:bg-harvests-light'
          }`}
        >
          <FiHeart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
        <button
          onClick={onShare}
          className="p-3 rounded-md border border-gray-300 text-gray-600 hover:bg-harvests-light"
        >
          <FiShare2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default ProductActions;

