import React from 'react';
import { Users, ChevronDown, ShoppingCart, Wheat, Factory, Utensils, Ship, Truck } from 'lucide-react';

const userTypes = [
  { value: 'consumer', icon: ShoppingCart, label: 'Consommateur', description: 'Achetez des produits frais directement des producteurs' },
  { value: 'producer', icon: Wheat, label: 'Producteur', description: 'Vendez vos produits agricoles sur notre plateforme' },
  { value: 'transformer', icon: Factory, label: 'Transformateur', description: 'Transformez et commercialisez des produits agricoles' },
  { value: 'restaurateur', icon: Utensils, label: 'Restaurateur', description: 'Commandez des ingrédients frais pour votre restaurant' },
  { value: 'exporter', icon: Ship, label: 'Exportateur', description: 'Exportez des produits agricoles vers d\'autres pays' },
  { value: 'transporter', icon: Truck, label: 'Transporteur', description: 'Transportez des produits agricoles en toute sécurité' }
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
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
        <Users className="h-4.5 w-4.5 text-gray-400" />
      </div>

      {/* Trigger du dropdown */}
      <button
        type="button"
        onClick={onToggle}
        className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-[#1A5514] outline-none bg-gray-50 hover:bg-white transition-all text-left flex items-center justify-between text-sm ${
          error ? 'border-red-300' : 'border-gray-200'
        }`}
      >
        <span className={selectedUserType ? 'text-gray-900 flex items-center' : 'text-gray-500 flex items-center'}>
          {selectedUserType 
            ? (() => {
                const type = userTypes.find(t => t.value === selectedUserType);
                if (!type) return 'Sélectionner un profil';
                const Icon = type.icon;
                return <><Icon className="w-4 h-4 mr-2" /> {type.label}</>;
              })()
            : 'Sélectionner un profil'
          }
        </span>
        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Menu dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-black/10 z-20 max-h-80 overflow-y-auto py-2">
          {userTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => onSelect(type.value)}
              className={`w-full px-4 py-2.5 text-left transition-colors ${
                selectedUserType === type.value ? 'bg-emerald-50 text-[#1A5514]' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5"><type.icon className="w-4.5 h-4.5 text-[#1A5514]" /></div>
                <div className="flex-1">
                  <div className="font-bold text-sm">
                    {type.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {type.description}
                  </div>
                </div>
                {selectedUserType === type.value && (
                  <div className="flex-shrink-0">
                    <div className="w-4 h-4 bg-[#1A5514] rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                  </div>
                )}
              </div>
            </button>
          ))}
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

