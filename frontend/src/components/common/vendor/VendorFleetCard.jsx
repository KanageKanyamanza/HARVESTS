import React from 'react';
import { FiTruck } from 'react-icons/fi';

const FEATURE_LABELS = {
  'refrigerated': 'Frigorifique',
  'insulated': 'Isolé',
  'ventilated': 'Ventilé',
  'covered': 'Couvert',
  'gps-tracked': 'Suivi GPS',
  'temperature-controlled': 'Température contrôlée'
};

const VendorFleetCard = ({ vehicle, helpers, onAction }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      {helpers.getItemImage(vehicle) ? (
        <div className="h-48 bg-gray-200 overflow-hidden">
          <img 
            src={helpers.getItemImage(vehicle)} 
            alt={helpers.getItemName(vehicle)}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<div class="w-full h-full bg-gray-100 flex items-center justify-center"><svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg></div>';
            }}
          />
        </div>
      ) : (
        <div className="h-48 bg-gray-200 flex items-center justify-center">
          <FiTruck className="h-16 w-16 text-gray-400" />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg mb-1">
              {helpers.getItemName(vehicle)}
            </h3>
            {vehicle.registrationNumber && (
              <p className="text-sm text-gray-500">
                {vehicle.registrationNumber}
              </p>
            )}
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            vehicle.isAvailable 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {vehicle.isAvailable ? 'Disponible' : 'Indisponible'}
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4">
          {helpers.getItemDescription(vehicle)}
        </p>

        {vehicle.specialFeatures && vehicle.specialFeatures.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 mb-2">Caractéristiques:</p>
            <div className="flex flex-wrap gap-2">
              {vehicle.specialFeatures.map((feature, idx) => (
                <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                  {FEATURE_LABELS[feature] || feature}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 mb-4">
          {helpers.getItemExtraInfo(vehicle)}
        </div>

        {onAction && (
          <button 
            className={`w-full ${helpers.getItemButtonColor} text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center`}
            onClick={onAction}
          >
            {helpers.getItemButtonIcon}
            {helpers.getItemButtonText}
          </button>
        )}
      </div>
    </div>
  );
};

export default VendorFleetCard;

