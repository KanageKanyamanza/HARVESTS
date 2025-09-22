import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { producerService, uploadService } from '../../../services';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import ImageUpload from '../../../components/common/ImageUpload';
import CloudinaryImage from '../../../components/common/CloudinaryImage';
import { FiPackage, FiDollarSign, FiSave, FiArrowLeft, FiImage, FiX } from 'react-icons/fi';

const AddProduct = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadingImages, setUploadingImages] = useState(false);
  const [productImages, setProductImages] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    unit: 'kg',
    status: 'draft'
  });

  const categories = [
    { value: 'fruits', label: 'Fruits' },
    { value: 'vegetables', label: 'Légumes' },
    { value: 'grains', label: 'Céréales' },
    { value: 'herbs', label: 'Herbes' },
    { value: 'other', label: 'Autres' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageAdd = async (newImageUrl) => {
    try {
      setUploadingImages(true);
      
      // Si newImageUrl est déjà une URL Cloudinary, l'utiliser directement
      if (newImageUrl && newImageUrl.startsWith('http')) {
        setProductImages(prev => [...prev, {
          url: newImageUrl,
          alt: `Image produit ${prev.length + 1}`,
          isPrimary: prev.length === 0,
          order: prev.length
        }]);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'image:', error);
      setErrors({ submit: 'Erreur lors de l\'upload de l\'image' });
    } finally {
      setUploadingImages(false);
    }
  };

  const handleImageRemove = (indexToRemove) => {
    setProductImages(prev => {
      const updatedImages = prev.filter((_, index) => index !== indexToRemove);
      // Réassigner les ordres et la première image comme primaire
      return updatedImages.map((img, index) => ({
        ...img,
        order: index,
        isPrimary: index === 0
      }));
    });
  };

  const handleSetPrimaryImage = (index) => {
    setProductImages(prev => 
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index
      }))
    );
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Le nom du produit est requis';
    if (!formData.description.trim()) newErrors.description = 'La description est requise';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Le prix doit être supérieur à 0';
    if (!formData.stock || formData.stock < 0) newErrors.stock = 'Le stock ne peut pas être négatif';
    if (!formData.category) newErrors.category = 'La catégorie est requise';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const productData = {
        name: {
          fr: formData.name,
          en: formData.name // Fallback en anglais
        },
        description: {
          fr: formData.description,
          en: formData.description // Fallback en anglais
        },
        price: parseFloat(formData.price),
        category: formData.category,
        subcategory: formData.category, // Utiliser la catégorie comme sous-catégorie pour l'instant
        inventory: {
          quantity: parseInt(formData.stock)
        },
        status: formData.status || 'draft',
        producer: user.id,
        images: productImages // Ajouter les images
      };

      await producerService.createProduct(productData);
      navigate('/producer/products');
    } catch (error) {
      console.error('Erreur lors de la création du produit:', error);
      
      // Gestion des erreurs spécifiques
      let errorMessage = 'Erreur lors de la création du produit';
      
      if (error.response?.data?.message) {
        const serverMessage = error.response.data.message;
        
        // Erreur de slug dupliqué
        if (serverMessage.includes('duplicate key error') && serverMessage.includes('slug')) {
          errorMessage = 'Un produit avec ce nom existe déjà. Veuillez modifier le nom du produit.';
        }
        // Autres erreurs de validation
        else if (serverMessage.includes('validation failed')) {
          errorMessage = 'Veuillez vérifier que tous les champs requis sont remplis correctement.';
        }
        else {
          errorMessage = serverMessage;
        }
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModularDashboardLayout>
      <div className="p-6 max-w-4xl mx-auto pb-20">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => navigate('/producer/products')}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ajouter un produit</h1>
              <p className="text-gray-600 mt-1">Créez un nouveau produit pour votre catalogue</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informations de base */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <FiPackage className="h-5 w-5 mr-2" />
              Informations de base
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du produit *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Tomates cerises bio"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green ${
                    errors.category ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Décrivez votre produit, ses caractéristiques, sa qualité..."
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
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
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green ${
                    errors.price ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock disponible *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green ${
                    errors.stock ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0"
                />
                {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock}</p>}
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
                  <option value="kg">Kilogramme (kg)</option>
                  <option value="g">Gramme (g)</option>
                  <option value="piece">Pièce</option>
                  <option value="bunch">Botte</option>
                  <option value="bag">Sac</option>
                </select>
              </div>
            </div>
          </div>

          {/* Images du produit */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <FiImage className="h-5 w-5 mr-2" />
              Images du produit
            </h2>
            
            <div className="space-y-6">
              {/* Zone d'upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <ImageUpload
                  type="product"
                  size="large"
                  aspectRatio="free"
                  onImageChange={handleImageAdd}
                  disabled={uploadingImages}
                  className="w-full"
                />
              </div>

              {/* Images uploadées */}
              {productImages.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Images uploadées ({productImages.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {productImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                          <CloudinaryImage
                            src={image.url}
                            alt={image.alt}
                            className="w-full h-full object-cover"
                            width={200}
                            height={200}
                            quality="auto"
                            crop="fill"
                          />
                        </div>
                        
                        {/* Indicateur d'image primaire */}
                        {image.isPrimary && (
                          <div className="absolute top-2 left-2 bg-harvests-green text-white text-xs px-2 py-1 rounded-full">
                            Principal
                          </div>
                        )}
                        
                        {/* Boutons d'action */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                          {!image.isPrimary && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(index)}
                              className="p-2 bg-white text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                              title="Définir comme image principale"
                            >
                              <FiImage className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleImageRemove(index)}
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            title="Supprimer l'image"
                          >
                            <FiX className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Erreurs générales */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-800">{errors.submit}</p>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/producer/products')}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-harvests-green hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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

export default AddProduct;
