import React from 'react';

const OrderConfirmation = ({ selectedSupplier, cart, order, calculateTotal }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Confirmation de la commande</h2>
      
      <div className="space-y-6">
        {/* Fournisseur */}
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-2">Fournisseur</h3>
          <p className="text-sm text-gray-600">
            {selectedSupplier?.companyName || 
             selectedSupplier?.profile?.displayName || 
             `${selectedSupplier?.firstName || ''} ${selectedSupplier?.lastName || ''}`.trim() || 
             'Fournisseur'}
          </p>
        </div>

        {/* Produits */}
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-2">Produits commandés</h3>
          <div className="space-y-2">
            {cart.map((item) => (
              <div key={item.product._id} className="flex justify-between text-sm">
                <span>{item.product.name} x {item.quantity}</span>
                <span>{(item.product.price * item.quantity).toLocaleString()} FCFA</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex justify-between font-medium">
              <span>Total:</span>
              <span>{calculateTotal().toLocaleString()} FCFA</span>
            </div>
          </div>
        </div>

        {/* Livraison */}
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-2">Informations de livraison</h3>
          <p className="text-sm text-gray-600">
            {order.deliveryAddress.street}, {order.deliveryAddress.city}
          </p>
          <p className="text-sm text-gray-600">
            Date: {order.deliveryDate} à {order.deliveryTime}
          </p>
          <p className="text-sm text-gray-600">
            Paiement: {order.paymentMethod === 'paypal' ? 'PayPal' : 'Paiement à la livraison'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;

