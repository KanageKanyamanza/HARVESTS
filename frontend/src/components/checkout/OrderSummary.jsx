import React from 'react';
import { FiShoppingBag, FiShield } from 'react-icons/fi';
import CloudinaryImage from '../common/CloudinaryImage';

const deliveryMethodLabels = {
  'standard-delivery': 'livraison standard',
  'express-delivery': 'livraison express',
  'same-day': 'livraison jour même',
  'scheduled': 'livraison programmée',
  pickup: 'retrait sur place'
};

const OrderSummary = ({ cartItems, totals, isEstimating, estimation, estimationError, orderData }) => {
  const deliveryDetail = estimation?.deliveryFeeDetail;

  return (
    <div className="bg-white rounded-lg shadow p-6 sticky top-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Résumé de la commande</h2>
      
      {/* Cart Items */}
      <div className="space-y-3 mb-6">
        {cartItems.map((item, i) => (
          <div key={item.productId || item.id || `cart-item-${i}`} className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
              {item.image ? (
                <CloudinaryImage src={item.image} alt={item.name} className="h-full w-full object-cover" width={48} height={48} />
              ) : (
                <FiShoppingBag className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
              <p className="text-sm text-gray-500">x {item.quantity}</p>
            </div>
            <p className="text-sm font-medium text-gray-900">{(item.price * item.quantity).toLocaleString()} FCFA</p>
          </div>
        ))}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Sous-total</span>
          <span className="font-medium">{totals.subtotal.toLocaleString()} FCFA</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Livraison</span>
          <span className="font-medium">{totals.deliveryFee.toLocaleString()} FCFA</span>
        </div>
        
        {totals.taxes > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">TVA</span>
            <span className="font-medium">{totals.taxes.toLocaleString()} FCFA</span>
          </div>
        )}
        
        {totals.discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600">Réduction</span>
            <span className="font-medium text-green-600">-{totals.discount.toLocaleString()} FCFA</span>
          </div>
        )}
        
        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <span className="text-lg font-semibold text-gray-900">{totals.total.toLocaleString()} FCFA</span>
          </div>
        </div>
        
        {isEstimating && <p className="text-xs text-blue-500 text-right mt-1">Estimation des frais en cours...</p>}
        {!isEstimating && deliveryDetail && !estimationError && <p className="text-xs text-gray-500 text-right mt-1">{deliveryDetail.reason}</p>}
        {!isEstimating && !deliveryDetail && !estimationError && (
          <p className="text-xs text-gray-500 text-right mt-1">Montant calculé via le forfait {deliveryMethodLabels[orderData.deliveryMethod] || orderData.deliveryMethod}.</p>
        )}
        {estimationError && <p className="text-xs text-red-500 text-right mt-1">{estimationError}</p>}
      </div>

      {/* Security Info */}
      <div className="text-center text-xs text-gray-500">
        <div className="flex items-center justify-center mb-2">
          <FiShield className="h-4 w-4 mr-1" />
          <span>Paiement sécurisé</span>
        </div>
        <p>Livraison garantie</p>
      </div>
    </div>
  );
};

export default OrderSummary;

