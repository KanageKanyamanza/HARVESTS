import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';import { producerService } from '../../../services';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import ProductImageUpload from '../../../components/common/ProductImageUpload';
import CloudinaryImage from '../../../components/common/CloudinaryImage';
import { FiPackage, FiDollarSign, FiSave, FiArrowLeft, FiImage, FiX, FiEdit } from 'react-icons/fi';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadingImages, setUploadingImages] = useState(false);
  const [productImages, setProductImages] = useState([]);
  const [product, setProduct] = useState(null);

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

  // Charger le produit à modifier
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const response = await producerService.getProduct(id);
        const productData = response.data.data?.product || response.data.product || response.data;
        
        if (productData) {
          console.log('🔍 Données du produit chargées:', productData);
          console.log('🖼️ Images du produit:', productData.images);
          setProduct(productData);
          
          // Remplir le formulaire avec les données existantes
          setFormData({
            name: productData.name?.fr || productData.name?.en || productData.name || '',
            description: productData.description?.fr || productData.description?.en || productData.description || '',
            price: productData.price || '',
            stock: productData.inventory?.quantity || '',
            category: productData.category || '',
            unit: 'kg',
            status: productData.status || 'draft'
          });

          // Charger les images existantes
          if (productData.images && productData.images.length > 0) {
            console.log('📸 Chargement des images:', productData.images);
            // S'assurer que les images ont le bon format
            const formattedImages = productData.images.map((img, index) => ({
              url: img.url,
              alt: img.alt || `Image ${index + 1}`,
              isPrimary: img.isPrimary || index === 0,
              order: index
            }));
            setProductImages(formattedImages);
          } else {
            console.log('⚠️ Aucune image trouvée pour ce produit');
            setProductImages([]);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du produit:', error);
        setErrors({ submit: 'Erreur lors du chargement du produit' });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageAdd = async (newImageUrl) => {
    if (newImageUrl) {
      setProductImages(prev => [...prev, {
        url: newImageUrl,
        alt: `Image ${prev.length + 1}`,
        isPrimary: prev.length === 0,
        order: prev.length
      }]);
    }
  };

  const handleImageRemove = (index) => {
    const newImages = productImages.filter((_, i) => i !== index);
    
    // Mettre à jour l'ordre et l'image principale
    const updatedImages = newImages.map((img, i) => ({
      ...img,
      order: i,
      isPrimary: i === 0
    }));
    
    setProductImages(updatedImages);
  };

  const handleImageReorder = (fromIndex, toIndex) => {
    const newImages = [...productImages];
    const [removed] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, removed);
    
    // Mettre à jour l'ordre et l'image principale
    const updatedImages = newImages.map((img, index) => ({
      ...img,
      order: index,
      isPrimary: index === 0
    }));
    
    setProductImages(updatedImages);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom du produit est requis';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Le prix est requis';
    }
    
    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Le stock est requis';
    }
    
    if (!formData.category) {
      newErrors.category = 'La catégorie est requise';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSaving(true);
      
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
        images: productImages // Ajouter les images
      };

      console.log('💾 Données à envoyer pour la mise à jour:', productData);
      console.log('🖼️ Images à envoyer:', productImages);
      
      await producerService.updateProduct(id, productData);
      navigate('/producer/products');
    } catch (error) {
      console.error('Erreur lors de la modification du produit:', error);
      
      // Gestion des erreurs spécifiques
      let errorMessage = 'Erreur lors de la mise à jour du produit';
      
      if (error.response?.data?.message) {
        const serverMessage = error.response.data.message;
        
        // Erreur de slug dupliqué
        if (serverMessage.includes('duplicate key error') && serverMessage.includes('slug')) {
          errorMessage = 'Un produit avec ce nom existe déjà';
        }
        // Autres erreurs de validation
        else if (serverMessage.includes('validation failed')) {
          errorMessage = 'Erreur de validation';
        }
        else {
          errorMessage = serverMessage;
        }
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ModularDashboardLayout>
        <div className="p-6 max-w-4xl mx-auto pb-20">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ModularDashboardLayout>
    );
  }

  if (!product) {
    return (
      <ModularDashboardLayout>
        <div className="p-6 max-w-4xl mx-auto pb-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Produit non trouvé</h1>
            <p className="text-gray-600 mb-6">Le produit que vous recherchez n'existe pas ou n'est plus disponible</p>
            <button
              onClick={() => navigate('/producer/products')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-harvests-green hover:bg-green-600"
            >
              <FiArrowLeft className="h-4 w-4 mr-2" />
              Retour aux produits
            </button>
          </div>
        </div>
      </ModularDashboardLayout>
    );
  }

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
              <h1 className="text-2xl font-bold text-gray-900">Modifier le produit</h1>
              <p className="text-gray-600 mt-1">Modifiez les informations de votre produit</p>
            </div>
          </div>
        </div>

        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informations de base */}
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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
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
                  <option value="kg">Kilogramme</option>
                  <option value="g">Gramme</option>
                  <option value="lb">Livre</option>
                  <option value="oz">Once</option>
                </select>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <FiImage className="h-5 w-5 mr-2" />
              Images du produit
            </h2>
            
            <div className="space-y-4">
              <ProductImageUpload
                onImageUpload={handleImageAdd}
                uploading={uploadingImages}
                setUploading={setUploadingImages}
                maxImages={5}
                currentCount={productImages.length}
              />
              
              {productImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {productImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden">
                        <CloudinaryImage
                          src={image.url}
                          alt={image.alt || `Image ${index + 1}`}
                          className="w-full h-full object-cover"
                          width={200}
                          height={200}
                          quality="auto"
                          crop="fit"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 flex space-x-2">
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => handleImageReorder(index, index - 1)}
                              className="p-2 bg-white rounded-full text-gray-600 hover:text-gray-900"
                              title="Déplacer vers la gauche"
                            >
                              ←
                            </button>
                          )}
                          {index < productImages.length - 1 && (
                            <button
                              type="button"
                              onClick={() => handleImageReorder(index, index + 1)}
                              className="p-2 bg-white rounded-full text-gray-600 hover:text-gray-900"
                              title="Déplacer vers la droite"
                            >
                              →
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleImageRemove(index)}
                            className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600"
                              title="Supprimer l'image"
                          >
                            <FiX className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      {image.isPrimary && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                          Image principale
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/producer/products')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-harvests-green"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-harvests-green text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-harvests-green disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <FiSave className="h-4 w-4 mr-2" />
                  Enregistrer les modifications
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </ModularDashboardLayout>
  );
};

export default EditProduct;
