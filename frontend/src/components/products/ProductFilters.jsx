import React from 'react';
import { FiFilter, FiChevronDown, FiX } from 'react-icons/fi';
import { getCategoryLabel, getSortOptions } from '../../utils/productHelpers';

const ProductFilters = ({
  showFilters,
  setShowFilters,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  sortBy,
  priceRange,
  categories,
  onFilterChange,
  onClearFilters,
  onPageReset
}) => {
  const hasActiveFilters = selectedCategory ||
    sortBy !== "newest" ||
    priceRange.min ||
    priceRange.max;

  return (
    <div className="bg-white gap-2 flex flex-wrap justify-around rounded-lg shadow-sm border p-6 mb-8">
      <div className="w-full flex flex-wrap gap-2">
        <div className="w-full md:w-1/2">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    onPageReset();
                  }}
                  placeholder="Rechercher des produits..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  onPageReset();
                }}
                className="px-4 py-2 bg-harvests-light0 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Effacer
              </button>
            )}
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-harvests-light"
          >
            <FiFilter className="h-4 w-4 mr-2" />
            Filtres
            <FiChevronDown
              className={`h-4 w-4 ml-2 transition-transform ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </button>

          <select
            value={sortBy}
            onChange={(e) => onFilterChange("sort", e.target.value)}
            className="px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
          >
            {getSortOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => onFilterChange("category", e.target.value)}
            className="flex-1 px-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {getCategoryLabel(category)}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
            >
              <FiX className="h-4 w-4 mr-1" />
              Effacer
            </button>
          )}
        </div>
      </div>

      {/* Filtres avancés */}
      {showFilters && (
        <div className="w-full md:w-1/2 mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix minimum (XOF)
              </label>
              <input
                type="number"
                value={priceRange.min}
                onChange={(e) => onFilterChange("priceMin", e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix maximum (XOF)
              </label>
              <input
                type="number"
                value={priceRange.max}
                onChange={(e) => onFilterChange("priceMax", e.target.value)}
                placeholder="100000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;

