import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { producerService, uploadService } from '../../../services';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import ProductImageManager from '../../../components/common/ProductImageManager';
import CloudinaryImage from '../../../components/common/CloudinaryImage';
import { 
  FiPackage, FiDollarSign, FiSave, FiArrowLeft, FiImage, FiX, 
  FiTag, FiAlignLeft
} from 'react-icons/fi';

const AddProduct = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadingImages, setUploadingImages] = useState(false);
  const [productImages, setProductImages] = useState([]);

  const [formData, setFormData] = useState({
    // Informations de base
    name: { fr: '', en: '' },
    description: { fr: '', en: '' },
    shortDescription: { fr: '', en: '' },
    category: '',
    subcategory: '',
    tags: [],
    
    // Prix et stock
    price: '',
    compareAtPrice: '',
    stock: '',
    minimumOrderQuantity: 1,
    maximumOrderQuantity: '',
    unit: 'kg',
    
    status: 'draft'
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
    'kg', 'g', 'piece', 'bunch', 'bag', 'box', 'L', 'ml'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };


  const validateForm = () => {
    const newErrors = {};
    
    // Champs obligatoires
    if (!formData.name.fr?.trim()) newErrors.name = 'Le nom du produit en français est requis';
    if (!formData.description.fr?.trim()) newErrors.description = 'La description en français est requise';
    if (!formData.category) newErrors.category = 'La catégorie est requise';
    if (!formData.subcategory) newErrors.subcategory = 'La sous-catégorie est requise';
    if (productImages.length === 0) newErrors.images = 'Au moins une image est requise';
    
    // Validation des prix
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Le prix doit être supérieur à 0';
    }
    
    // Validation du stock
    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Le stock doit être un nombre positif';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const productData = {
        ...formData,
        images: productImages,
        producer: user._id,
        userType: 'producer'
      };

      await producerService.createProduct(productData);
      navigate('/producer/products');
    } catch (error) {
      console.error('Erreur lors de la création du produit:', error);
      setErrors({ submit: 'Erreur lors de la création du produit' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModularDashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/producer/products')}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <FiArrowLeft className="h-4 w-4 mr-2" />
            Retour aux produits
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Ajouter un produit</h1>
          <p className="text-gray-600 mt-2">Créez un nouveau produit pour votre boutique</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informations de base */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <FiPackage className="h-5 w-5 mr-2" />
              Informations de base
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du produit (Français) *
                </label>
                <input
                  type="text"
                  name="name.fr"
                  value={formData.name.fr}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                  placeholder="Ex: Tomates cerises bio"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du produit (Anglais)
                </label>
                <input
                  type="text"
                  name="name.en"
                  value={formData.name.en}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                  placeholder="Ex: Organic cherry tomatoes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description courte (Français)
                </label>
                <input
                  type="text"
                  name="shortDescription.fr"
                  value={formData.shortDescription.fr}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                  placeholder="Description courte en une phrase"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Français) *
                </label>
                <div className="relative">
                  <FiAlignLeft className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <textarea
                    name="description.fr"
                    value={formData.description.fr}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
                    placeholder="Décrivez votre produit en détail..."
                  />
                </div>
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sous-catégorie *
                  </label>
                  <input
                    type="text"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                    placeholder="Ex: Tomates, Riz, Bananes..."
                  />
                  {errors.subcategory && <p className="text-red-500 text-sm mt-1">{errors.subcategory}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags.join(', ')}
                  onChange={(e) => {
                    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                    setFormData(prev => ({ ...prev, tags }));
                  }}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                  placeholder="bio, local, frais, premium (séparés par des virgules)"
                />
              </div>
            </div>
          </div>

          {/* Prix et stock */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <FiDollarSign className="h-5 w-5 mr-2" />
              Prix et stock
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix (FCFA) *
                </label>
                <div className="relative">
                  <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
                    placeholder="0"
                  />
                </div>
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix de comparaison (FCFA)
                </label>
                <input
                  type="number"
                  name="compareAtPrice"
                  value={formData.compareAtPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock initial *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                  placeholder="0"
                />
                {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unité
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commande minimum
                </label>
                <input
                  type="number"
                  name="minimumOrderQuantity"
                  value={formData.minimumOrderQuantity}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commande maximum
                </label>
                <input
                  type="number"
                  name="maximumOrderQuantity"
                  value={formData.maximumOrderQuantity}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                />
              </div>
            </div>
          </div>

          {/* Images du produit */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <FiImage className="h-5 w-5 mr-2" />
              Images du produit
            </h2>
            
            <ProductImageManager
              images={productImages}
              onImagesChange={setProductImages}
              maxImages={5}
              uploading={uploadingImages}
              setUploading={setUploadingImages}
              errors={errors}
            />
            {errors.images && <p className="text-red-500 text-sm mt-2">{errors.images}</p>}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/producer/products')}
              className="px-6 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-harvests-green hover:bg-green-600 disabled:opacity-50"
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

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}
        </form>
      </div>
    </ModularDashboardLayout>
  );
};

export default AddProduct;
