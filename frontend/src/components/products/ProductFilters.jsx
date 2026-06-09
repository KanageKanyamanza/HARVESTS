import React from 'react';
import { FiFilter, FiChevronDown, FiX, FiMapPin } from 'react-icons/fi';
import { getCategoryLabel, getSortOptions } from '../../utils/productHelpers';

const ProductFilters = ({
  showFilters,
  setShowFilters,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  sortBy,
  isBio,
  priceRange,
  categories,
  onFilterChange,
  onClearFilters,
  onPageReset,
  selectedCountry
}) => {
  const hasActiveFilters = selectedCategory ||
    selectedCountry ||
    sortBy !== "newest" ||
    isBio ||
    priceRange.min ||
    priceRange.max;

  return (
    <div className="bg-white rounded-sm md:shadow-sm md:border border-gray-200 md:p-4 sticky top-4 h-full md:h-auto">
      {/* Header Mobile */}
      <div className="flex items-center justify-between mb-6 md:hidden pb-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">Filtres</h2>
        <button 
          onClick={() => setShowFilters(false)}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
        >
          <FiX className="h-6 w-6" />
        </button>
      </div>

      {/* Search Filter */}
      <div className="mb-6">
        <h3 className="font-bold text-gray-900 mb-2 text-sm">Recherche</h3>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onPageReset();
            }}
            placeholder="Chercher..."
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500 shadow-sm"
          />
          <svg className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <h3 className="font-bold text-gray-900 mb-2 text-sm">Catégorie</h3>
        <ul className="space-y-1 text-sm list-none pl-0">
          <li className="flex items-baseline">
            <span className="mr-2 text-gray-500">•</span>
            <button
              onClick={() => onFilterChange("category", "")}
              className={`text-left w-full hover:text-primary-600 ${!selectedCategory ? 'font-bold text-gray-900' : 'text-gray-600'}`}
            >
              Toutes les catégories
            </button>
          </li>
          {categories.map((category) => (
            <li key={category} className="flex items-baseline">
              <span className="mr-2 text-gray-500">•</span>
              <button
                onClick={() => onFilterChange("category", category)}
                className={`text-left w-full hover:text-primary-600 ${selectedCategory === category ? 'font-bold text-gray-900' : 'text-gray-600'}`}
              >
                {getCategoryLabel(category)}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Country Filter */}
      <div className="mb-6">
        <h3 className="font-bold text-gray-900 mb-2 text-sm">Pays de provenance</h3>
        <select
          value={selectedCountry}
          onChange={(e) => onFilterChange("country", e.target.value)}
          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-primary-500 bg-white shadow-sm"
        >
          <option value="MY_ZONE">Ma zone</option>
          <option value="">Tous les pays</option>
          <optgroup label="Zones">
            <option value="West Africa">Afrique de l'Ouest</option>
            <option value="Central Africa">Afrique Centrale</option>
          </optgroup>
          <optgroup label="Pays">
            <option value="SN">Sénégal</option>
            <option value="CM">Cameroun</option>
            <option value="CI">Côte d'Ivoire</option>
            <option value="BF">Burkina Faso</option>
            <option value="ML">Mali</option>
            <option value="GH">Ghana</option>
            <option value="NG">Nigeria</option>
          </optgroup>
        </select>
      </div>

      {/* Price Filter */}
      <div className="mb-6">
        <h3 className="font-bold text-gray-900 mb-2 text-sm">Prix (XOF)</h3>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={priceRange.min}
            onChange={(e) => onFilterChange("priceMin", e.target.value)}
            placeholder="Min"
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-primary-500 shadow-sm"
          />
          <span className="text-gray-500">-</span>
          <input
            type="number"
            value={priceRange.max}
            onChange={(e) => onFilterChange("priceMax", e.target.value)}
            placeholder="Max"
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-sm focus:ring-1 focus:ring-primary-500 shadow-sm"
          />
        </div>
      </div>

      {/* Certification BIO Filter */}
      <div className="mb-6">
        <label className="flex items-center space-x-2 cursor-pointer group">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              checked={isBio}
              onChange={(e) => onFilterChange("bio", e.target.checked)}
              className="peer h-5 w-5 cursor-pointer appearance-none rounded-sm border border-gray-300 transition-all checked:border-harvests-green checked:bg-harvests-green hover:border-harvests-green focus:ring-2 focus:ring-harvests-green focus:ring-offset-1"
            />
            <svg
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100 w-3.5 h-3.5 pointer-events-none"
              viewBox="0 0 14 10"
              fill="none"
            >
              <path
                d="M1 5L5 9L13 1"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-sm font-bold text-gray-700 group-hover:text-harvests-green transition-colors">
            Produits Certifiés BIO
          </span>
        </label>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="w-full flex items-center justify-center px-4 py-2 text-sm border border-gray-300 shadow-sm rounded-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          <FiX className="h-4 w-4 mr-1" />
          Effacer les filtres
        </button>
      )}
      {/* Apply Filters (Mobile only) */}
      <div className="mt-8 md:hidden sticky bottom-4">
        <button
          onClick={() => setShowFilters(false)}
          className="w-full flex items-center justify-center px-4 py-3 text-sm font-bold shadow-md rounded-sm text-white bg-harvests-green hover:bg-green-700 transition-colors"
        >
          Appliquer les filtres
        </button>
      </div>
    </div>
  );
};

export default ProductFilters;

