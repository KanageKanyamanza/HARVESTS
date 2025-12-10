import React from 'react';
import { FiPackage, FiTag, FiAlignLeft } from 'react-icons/fi';

const categories = [
  { value: 'cereals', label: 'Céréales' },
  { value: 'vegetables', label: 'Légumes' },
  { value: 'fruits', label: 'Fruits' },
  { value: 'legumes', label: 'Légumineuses' },
  { value: 'tubers', label: 'Tubercules' },
  { value: 'spices', label: 'Épices' },
  { value: 'herbs', label: 'Herbes' },
  { value: 'nuts', label: 'Noix' },
  { value: 'seeds', label: 'Graines' },
  { value: 'dairy', label: 'Produits laitiers' },
  { value: 'meat', label: 'Viande' },
  { value: 'poultry', label: 'Volaille' },
  { value: 'fish', label: 'Poisson' },
  { value: 'processed-foods', label: 'Aliments transformés' },
  { value: 'beverages', label: 'Boissons' },
  { value: 'other', label: 'Autres' }
];

const units = [
  'pièces',
  'kg',
  'g',
  'L',
  'ml',
  'pots',
  'bouteilles',
  'sachets'
];

const ProductBasicInfoTransformer = ({ formData, errors, onInputChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <FiPackage className="h-5 w-5 mr-2" />
        Informations de base
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom du produit *
          </label>
          <div className="relative">
            <FiPackage className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onInputChange}
              className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Nom du produit"
            />
          </div>
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description du produit *
          </label>
          <div className="relative">
            <FiAlignLeft className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <textarea
              name="description"
              value={formData.description}
              onChange={onInputChange}
              rows={4}
              className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Décrivez votre produit..."
            />
          </div>
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie *
            </label>
            <div className="relative">
              <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                name="category"
                value={formData.category}
                onChange={onInputChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.category ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unité
            </label>
            <select
              name="unit"
              value={formData.unit}
              onChange={onInputChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {units.map(unit => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Statut
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={onInputChange}
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="draft">Brouillon</option>
            <option value="pending-review">En attente de révision</option>
            <option value="approved">Approuvé</option>
            <option value="inactive">Inactif</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProductBasicInfoTransformer;

