import React from 'react';
import { FiFilter, FiChevronDown, FiX, FiMapPin } from 'react-icons/fi';
import { getCategoryLabel, getSortOptions } from '../../utils/productHelpers';
import { SUPPORTED_COUNTRIES, REGIONAL_ZONES } from '../../utils/countryMapper';

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
    <div className="bg-white rounded-t-3xl md:rounded-2xl md:shadow-sm border border-emerald-100/90 flex flex-col min-h-0 flex-1 md:flex-none md:self-start md:sticky md:top-[140px] md:h-auto shadow-[0_-8px_30px_-8px_rgba(0,0,0,0.15)] md:shadow-sm">
      {/* Poignée (mobile) */}
      <div className="md:hidden flex justify-center pt-2.5 pb-1 shrink-0">
        <span className="w-10 h-1.5 rounded-full bg-gray-200" />
      </div>

      {/* Header Mobile */}
      <div className="flex items-center justify-between px-5 mb-2 md:hidden pb-4 border-b border-gray-100 shrink-0">
        <h2 className="text-lg font-extrabold text-[#161D14]">Filtres</h2>
        <button
          onClick={() => setShowFilters(false)}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
        >
          <FiX className="h-5 w-5" />
        </button>
      </div>

      <div className="overflow-y-auto px-5 pb-5 md:pt-5 flex-1 min-h-0">
        {/* Search Filter */}
        <div className="mb-4">
          <h3 className="font-bold text-[#161D14] mb-2 text-sm">Recherche</h3>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                onPageReset();
              }}
              placeholder="Chercher..."
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-[#1A5514] transition-all"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-4">
          <h3 className="font-bold text-[#161D14] mb-2 text-sm">Catégorie</h3>
          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 h-4 w-4 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => onFilterChange("category", e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-[#1A5514] appearance-none transition-all"
            >
              <option value="">Toutes les catégories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {getCategoryLabel(category)}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
          </div>
        </div>

        {/* Country Filter */}
        <div className="mb-4">
          <h3 className="font-bold text-[#161D14] mb-2 text-sm">Pays de provenance</h3>
          <div className="relative">
            <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 h-4 w-4 pointer-events-none" />
            <select
              value={selectedCountry}
              onChange={(e) => onFilterChange("country", e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-[#1A5514] appearance-none transition-all"
            >
              <option value="MY_ZONE">Ma zone</option>
              <option value="">Tous les pays</option>
              <optgroup label="Zones">
                {REGIONAL_ZONES.map(z => (
                  <option key={z.id} value={z.id}>{z.label}</option>
                ))}
              </optgroup>
              <optgroup label="Pays">
                {SUPPORTED_COUNTRIES.map(c => (
                  <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                ))}
              </optgroup>
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
          </div>
        </div>

        {/* Price Filter */}
        <div className="mb-4">
          <h3 className="font-bold text-[#161D14] mb-2 text-sm">Prix (XOF)</h3>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={priceRange.min}
              onChange={(e) => onFilterChange("priceMin", e.target.value)}
              placeholder="Min"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-[#1A5514] transition-all"
            />
            <span className="text-gray-400 font-bold">-</span>
            <input
              type="number"
              value={priceRange.max}
              onChange={(e) => onFilterChange("priceMax", e.target.value)}
              placeholder="Max"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-[#1A5514] transition-all"
            />
          </div>
        </div>

        {/* Certification BIO Filter */}
        <div className="mb-4">
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer group border border-transparent has-[:checked]:border-emerald-200 has-[:checked]:bg-emerald-50 transition-all">
            <span className="text-sm font-bold text-gray-700 group-hover:text-[#1A5514] transition-colors">
              Produits Certifiés BIO
            </span>
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={isBio}
                onChange={(e) => onFilterChange("bio", e.target.checked)}
                className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 bg-white transition-all checked:border-[#1A5514] checked:bg-[#1A5514] hover:border-[#1A5514] focus:ring-2 focus:ring-emerald-500/30"
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
          </label>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-bold border border-gray-200 rounded-xl text-gray-600 bg-white hover:bg-gray-50 transition-colors"
          >
            <FiX className="h-4 w-4 mr-1.5" />
            Effacer les filtres
          </button>
        )}
      </div>

      {/* Apply Filters (Mobile only) */}
      <div className="md:hidden p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t border-gray-100 bg-white shrink-0">
        <button
          onClick={() => setShowFilters(false)}
          className="w-full flex items-center justify-center px-4 py-3.5 text-sm font-bold rounded-xl text-white bg-gradient-to-r from-[#1A5514] to-[#31BC2E] shadow-lg shadow-emerald-900/20 hover:shadow-xl transition-all"
        >
          Appliquer les filtres
        </button>
      </div>
    </div>
  );
};

export default ProductFilters;
