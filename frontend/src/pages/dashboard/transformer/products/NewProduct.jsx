import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { transformerService } from '../../../../services';
import { useNotifications } from '../../../../contexts/NotificationContext';
import ModularDashboardLayout from '../../../../components/layout/ModularDashboardLayout';
import ProductImageManager from '../../../../components/common/ProductImageManager';
import {
  FiSave,
  FiPackage,
  FiDollarSign,
  FiTag,
  FiAlignLeft
} from 'react-icons/fi';

const NewProduct = () => {
  const { showSuccess, showError } = useNotifications();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [productImages, setProductImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'FCFA',
    category: '',
    stock: '',
    unit: 'pièces'
  });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    const newErrors = {};
    if (!product.name.trim()) newErrors.name = 'Le nom du produit est requis';
    if (!product.description.trim()) newErrors.description = 'La description est requise';
    if (!product.category) newErrors.category = 'La catégorie est requise';
    if (!product.price || product.price <= 0) newErrors.price = 'Le prix doit être supérieur à 0';
    if (!product.stock || product.stock < 0) newErrors.stock = 'Le stock doit être supérieur ou égal à 0';
    if (productImages.length === 0) newErrors.images = 'Au moins une image est requise';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const productData = {
        ...product,
        price: parseFloat(product.price),
        stock: parseInt(product.stock),
        // Le statut sera 'draft' par défaut (géré par le backend)
        images: productImages
      };

      await transformerService.createProduct(productData);
      showSuccess('Produit créé avec succès !', 'Succès');
      navigate('/transformer/products');
    } catch (error) {
      console.error('Erreur lors de la création du produit:', error);
      showError('Erreur lors de la création du produit', 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModularDashboardLayout userType="transformer">
      <div className="space-y-6 px-4 pb-20 pt-4">
        {/* En-tête */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nouveau Produit</h1>
          <p className="text-gray-600 mt-1">Ajoutez un nouveau produit à votre boutique</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Informations de base</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du produit *
                </label>
                <div className="relative">
                  <FiPackage className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={product.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Ex: Confiture de mangue artisanale"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie *
                </label>
                <div className="relative">
                  <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    name="category"
                    value={product.category}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <div className="relative">
                <FiAlignLeft className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <textarea
                  name="description"
                  value={product.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  placeholder="Décrivez votre produit..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Prix et stock */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Prix et Stock</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix *
                </label>
                <div className="relative">
                  <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    name="price"
                    value={product.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Devise
                </label>
                <select
                  name="currency"
                  value={product.currency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="FCFA">FCFA</option>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock initial *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={product.stock}
                  onChange={handleInputChange}
                  required
                  min="0"
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unité
              </label>
              <select
                name="unit"
                value={product.unit}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {units.map(unit => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Images du produit */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Images du produit</h2>
            
            <ProductImageManager
              images={productImages}
              onImagesChange={setProductImages}
              maxImages={5}
              uploading={uploadingImages}
              setUploading={setUploadingImages}
              errors={errors}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/transformer/products')}
              className="px-6 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-harvests-light"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Création...
                </>
              ) : (
                <>
                  <FiSave className="h-4 w-4 mr-2" />
                  Créer le produit
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </ModularDashboardLayout>
  );
};

export default NewProduct;
