import React from 'react';
import { FiSearch, FiUsers, FiStar, FiCheckCircle } from 'react-icons/fi';
import CloudinaryImage from '../common/CloudinaryImage';
import { getVendorAverageRating, getVendorReviewCount } from '../../utils/vendorRatings';

const SupplierSelector = ({ 
  suppliers, 
  selectedSupplier, 
  onSelectSupplier, 
  searchTerm, 
  onSearchChange 
}) => {
  // Filtrer les fournisseurs
  const filteredSuppliers = suppliers.filter(supplier => {
    const displayName = (supplier.companyName || 
                        supplier.profile?.displayName || 
                        `${supplier.firstName || ''} ${supplier.lastName || ''}`)
      .toLowerCase();
    const typeLabel = (supplier.supplierType || 
                      supplier.profile?.vendorTypeLabel || 
                      supplier.userType || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    return displayName.includes(term) || typeLabel.includes(term);
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Sélectionner un fournisseur</h2>
      
      {/* Recherche */}
      <div className="mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un fournisseur..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
          />
        </div>
      </div>

      {/* Liste des fournisseurs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuppliers.map((supplier) => (
          <div
            key={supplier._id}
            onClick={() => onSelectSupplier(supplier)}
            className={`relative p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedSupplier?._id === supplier._id
                ? 'border-harvests-green bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="absolute bottom-3 right-3 bg-harvests-green text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow">
              {supplier.supplierType || supplier.profile?.vendorTypeLabel || supplier.userType || 'Fournisseur'}
            </span>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                {supplier.shopLogo || supplier.logo || supplier.avatar ? (
                  <CloudinaryImage
                    src={supplier.shopLogo || supplier.logo || supplier.avatar}
                    alt={supplier.companyName || supplier.profile?.displayName || 'Logo fournisseur'}
                    className="w-full h-full object-cover"
                    width={200}
                    height={200}
                    quality="auto"
                    crop="fill"
                  />
                ) : (
                  <FiUsers className="h-6 w-6 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {supplier.companyName || 
                   supplier.profile?.displayName || 
                   `${supplier.firstName || ''} ${supplier.lastName || ''}`.trim() || 
                   'Fournisseur'}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  {supplier.city || supplier.region || 'Localisation non renseignée'}
                </p>
                <div className="flex items-center mt-1">
                  <FiStar className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className="text-sm text-gray-500">
                    {(() => {
                      const average = getVendorAverageRating(supplier);
                      const count = getVendorReviewCount(supplier);
                      return `${average.toFixed(1)} (${count})`;
                    })()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedSupplier && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <FiCheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-800">
              Fournisseur sélectionné: {selectedSupplier.companyName || 
                                       selectedSupplier.profile?.displayName || 
                                       `${selectedSupplier.firstName || ''} ${selectedSupplier.lastName || ''}`.trim() || 
                                       'Fournisseur'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierSelector;

