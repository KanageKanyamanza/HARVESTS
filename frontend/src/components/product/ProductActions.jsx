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
        <label className="block text-xs font-bold text-gray-500 mb-2">Quantité</label>
        <div className="inline-flex items-center border border-gray-200 rounded-full bg-gray-50 overflow-hidden">
          <button
            type="button"
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            className="flex h-10 w-10 items-center justify-center hover:bg-gray-200 text-gray-600 transition-colors"
            aria-label="Diminuer la quantité"
          >
            <FiMinus className="h-4 w-4" />
          </button>
          <span className="flex h-10 min-w-[3rem] items-center justify-center px-3 text-sm font-bold text-[#161D14] tabular-nums">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => onQuantityChange(quantity + 1)}
            className="flex h-10 w-10 items-center justify-center hover:bg-gray-200 text-gray-600 transition-colors"
            aria-label="Augmenter la quantité"
          >
            <FiPlus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onAddToCart}
        className={`w-full h-12 px-4 rounded-full inline-flex items-center justify-center gap-2 text-sm font-bold whitespace-nowrap transition-all duration-300 ${
          showAddedToCart
            ? 'bg-emerald-600 text-white scale-[1.02] shadow-md'
            : 'bg-gradient-to-r from-[#1A5514] to-[#31BC2E] text-white shadow-lg shadow-emerald-900/20 hover:shadow-xl active:scale-[0.98]'
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
          className={`h-10 rounded-full border inline-flex items-center justify-center gap-1.5 text-xs font-bold transition-colors ${
            isFavorite
              ? 'bg-red-50 border-red-200 text-red-600'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <FiHeart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          {isFavorite ? 'Favori' : 'Ajouter'}
        </button>
        <button
          type="button"
          onClick={onShare}
          aria-label="Partager le produit"
          className="h-10 rounded-full border border-gray-200 bg-white text-gray-600 inline-flex items-center justify-center gap-1.5 text-xs font-bold hover:bg-gray-50 transition-colors"
        >
          <FiShare2 className="h-4 w-4" />
          Partager
        </button>
      </div>
    </div>
  );
};

export default ProductActions;
