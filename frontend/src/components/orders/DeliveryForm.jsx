import React from 'react';

const DeliveryForm = ({ order, onInputChange }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Informations de livraison</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Adresse de livraison */}
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-4">Adresse de livraison</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rue *
              </label>
              <input
                type="text"
                name="deliveryAddress.street"
                value={order.deliveryAddress.street}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville *
                </label>
                <input
                  type="text"
                  name="deliveryAddress.city"
                  value={order.deliveryAddress.city}
                  onChange={onInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code postal
                </label>
                <input
                  type="text"
                  name="deliveryAddress.postalCode"
                  value={order.deliveryAddress.postalCode}
                  onChange={onInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Date et heure de livraison */}
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-4">Date et heure de livraison</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de livraison *
              </label>
              <input
                type="date"
                name="deliveryDate"
                value={order.deliveryDate}
                onChange={onInputChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heure de livraison
              </label>
              <input
                type="time"
                name="deliveryTime"
                value={order.deliveryTime}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Méthode de paiement
              </label>
              <select
                name="paymentMethod"
                value={order.paymentMethod}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
              >
                <option value="cash">Paiement à la livraison</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes (optionnel)
        </label>
        <textarea
          name="notes"
          value={order.notes}
          onChange={onInputChange}
          rows={3}
          placeholder="Instructions spéciales pour la livraison..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
        />
      </div>
    </div>
  );
};

export default DeliveryForm;

