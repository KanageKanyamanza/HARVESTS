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
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Quantité</label>
        <div className="inline-flex items-center border border-gray-300 rounded-md overflow-hidden">
          <button
            type="button"
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            className="flex h-10 w-10 items-center justify-center hover:bg-gray-100 transition-colors"
            aria-label="Diminuer la quantité"
          >
            <FiMinus className="h-4 w-4" />
          </button>
          <span className="flex h-10 min-w-[3rem] items-center justify-center border-x border-gray-300 px-3 text-sm font-medium tabular-nums">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => onQuantityChange(quantity + 1)}
            className="flex h-10 w-10 items-center justify-center hover:bg-gray-100 transition-colors"
            aria-label="Augmenter la quantité"
          >
            <FiPlus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onAddToCart}
        className={`w-full h-11 px-4 rounded-md inline-flex items-center justify-center gap-2 text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
          showAddedToCart
            ? 'bg-green-600 text-white scale-[1.02] shadow-md'
            : 'bg-harvests-green text-white hover:bg-green-600 active:scale-[0.98]'
        }`}
      >
        {showAddedToCart ? (
          <>
            <FiCheckCircle className="h-5 w-5 shrink-0" />
            Ajouté !
          </>
        ) : (
          <>
            <FiShoppingCart className="h-5 w-5 shrink-0" />
            Ajouter au panier
          </>
        )}
      </button>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onToggleFavorite}
          aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          className={`h-10 rounded-md border inline-flex items-center justify-center transition-colors ${
            isFavorite
              ? 'bg-red-50 border-red-200 text-red-600'
              : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <FiHeart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
        <button
          type="button"
          onClick={onShare}
          aria-label="Partager le produit"
          className="h-10 rounded-md border border-gray-300 bg-white text-gray-600 inline-flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <FiShare2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default ProductActions;

