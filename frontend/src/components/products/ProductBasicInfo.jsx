import React from 'react';
import { FiPackage } from 'react-icons/fi';

const categories = [
  { value: 'fruits', label: 'Fruits' },
  { value: 'vegetables', label: 'Légumes' },
  { value: 'grains', label: 'Céréales' },
  { value: 'herbs', label: 'Herbes' },
  { value: 'other', label: 'Autres' }
];

const ProductBasicInfo = ({ formData, errors, onInputChange }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <FiPackage className="h-5 w-5 mr-2" />
        Informations de base
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom du produit *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={onInputChange}
            className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Nom du produit"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description du produit *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={onInputChange}
            rows={4}
            className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Décrivez votre produit..."
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Catégorie *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={onInputChange}
            className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green ${
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
          {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Statut
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={onInputChange}
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
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

export default ProductBasicInfo;

