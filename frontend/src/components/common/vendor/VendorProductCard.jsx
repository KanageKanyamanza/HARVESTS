import React from 'react';
import { FiPackage, FiStar } from 'react-icons/fi';
import { formatAverageRating, getProductAverageRating, getProductReviewCount } from '../../../utils/vendorRatings';

const VendorProductCard = ({ item, helpers, showRating = true, colorClass = 'text-green-600' }) => {
  const productAverage = getProductAverageRating(item);
  const productReviewCount = getProductReviewCount(item);

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => helpers.navigate(`/products/${item._id}`)}
    >
      <div className="h-48 bg-gray-200 relative">
        {helpers.getItemImage(item) ? (
          <img 
            src={helpers.getItemImage(item)} 
            alt={helpers.getItemName(item)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <FiPackage className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {item.category || 'Produit'}
          </span>
          {showRating && (
            <div className="flex items-center text-yellow-500">
              <FiStar className="w-4 h-4" />
              <span className="ml-1 text-sm text-gray-700">
                {formatAverageRating(productAverage)}
              </span>
              {productReviewCount > 0 && (
                <span className="ml-1 text-xs text-gray-500">
                  ({productReviewCount} avis)
                </span>
              )}
            </div>
          )}
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">
          {helpers.getItemName(item)}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {helpers.getItemDescription(item)}
        </p>
        <div className="flex items-center justify-between">
          <span className={`text-lg font-bold ${colorClass}`}>
            {helpers.formatPrice(helpers.getItemPrice(item))}
          </span>
          <span className="text-sm text-gray-500">
            {helpers.getItemExtraInfo(item)}
          </span>
        </div>
        <button 
          className={`w-full mt-3 ${helpers.getItemButtonColor} text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center`}
          onClick={(e) => {
            e.stopPropagation();
            helpers.addToCart(item);
          }}
        >
          {helpers.getItemButtonIcon}
          {helpers.getItemButtonText}
        </button>
      </div>
    </div>
  );
};

export default VendorProductCard;

