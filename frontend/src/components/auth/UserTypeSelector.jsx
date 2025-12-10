import React from 'react';
import { Users, ChevronDown } from 'lucide-react';

const userTypes = [
  { value: 'consumer', label: '🛒 Consommateur', description: 'Achetez des produits frais directement des producteurs' },
  { value: 'producer', label: '🌾 Producteur', description: 'Vendez vos produits agricoles sur notre plateforme' },
  { value: 'transformer', label: '🏭 Transformateur', description: 'Transformez et commercialisez des produits agricoles' },
  { value: 'restaurateur', label: '🍽️ Restaurateur', description: 'Commandez des ingrédients frais pour votre restaurant' },
  { value: 'exporter', label: '🚢 Exportateur', description: 'Exportez des produits agricoles vers d\'autres pays' },
  { value: 'transporter', label: '🚛 Transporteur', description: 'Transportez des produits agricoles en toute sécurité' }
];

const UserTypeSelector = ({ 
  selectedUserType, 
  isOpen, 
  onToggle, 
  onSelect, 
  error 
}) => {
  return (
    <div className="relative profile-dropdown">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
        <Users className="h-5 w-5 text-black" />
      </div>
      
      {/* Trigger du dropdown */}
      <button
        type="button"
        onClick={onToggle}
        className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-left flex items-center justify-between ${
          error ? 'border-red-300' : 'border-gray-300'
        }`}
      >
        <span className={selectedUserType ? 'text-gray-900' : 'text-gray-500'}>
          {selectedUserType 
            ? userTypes.find(type => type.value === selectedUserType)?.label 
            : 'Sélectionner un profil'
          }
        </span>
        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Menu dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-80 overflow-y-auto">
          <div className="py-2">
            {userTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => onSelect(type.value)}
                className={`w-full px-4 py-3 text-left hover:bg-green-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                  selectedUserType === type.value ? 'bg-green-50 text-green-700' : 'text-gray-700'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{type.label.split(' ')[0]}</div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {type.label.split(' ').slice(1).join(' ')}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {type.description}
                    </div>
                  </div>
                  {selectedUserType === type.value && (
                    <div className="flex-shrink-0">
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default UserTypeSelector;
export { userTypes };

