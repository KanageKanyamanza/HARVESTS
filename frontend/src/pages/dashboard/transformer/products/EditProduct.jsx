import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { transformerService } from '../../../../services';
import { useNotifications } from '../../../../contexts/NotificationContext';
import ModularDashboardLayout from '../../../../components/layout/ModularDashboardLayout';
import ProductImageManager from '../../../../components/common/ProductImageManager';
import {
  FiPackage,
  FiDollarSign,
  FiSave,
  FiArrowLeft,
  FiTag,
  FiAlignLeft
} from 'react-icons/fi';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotifications();
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
    currency: 'FCFA',
    category: '',
    stock: '',
    unit: 'pièces',
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
    'pièces',
    'kg',
    'g',
    'L',
    'ml',
    'pots',
    'bouteilles',
    'sachets'
  ];

  // Charger le produit à modifier
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        console.log('🔄 Chargement du produit avec ID:', id);
        const response = await transformerService.getProduct(id);
        console.log('📦 Réponse complète:', response);
        console.log('📦 response.data:', response.data);
        console.log('📦 response.data.data:', response.data?.data);
        console.log('📦 response.data.data.product:', response.data?.data?.product);
        
        const productData = response.data?.data?.product || response.data?.product || response.data;
        
        if (!productData) {
          console.error('❌ Aucune donnée produit trouvée dans la réponse');
          showError('Produit non trouvé');
          setLoading(false);
          return;
        }
        
        console.log('🔍 Données du produit chargées:', productData);
        console.log('📝 Nom du produit:', productData.name);
        console.log('💰 Prix du produit:', productData.price);
        console.log('📦 Stock du produit:', productData.inventory?.quantity, productData.stock);
        console.log('🖼️ Images du produit:', productData.images);
        
        const formattedProduct = {
          ...productData,
          name: toPlainText(productData.name, ''),
          description: toPlainText(productData.description, ''),
          shortDescription: toPlainText(productData.shortDescription, '')
        };
        
        setProduct(formattedProduct);
        
        setFormData({
          name: formattedProduct.name,
          description: formattedProduct.description,
          price: formattedProduct.price || '',
          currency: formattedProduct.currency || 'FCFA',
          category: formattedProduct.category || '',
          stock: formattedProduct.inventory?.quantity || formattedProduct.inventory?.stock || formattedProduct.stock || '',
          unit: formattedProduct.unit || 'pièces',
          status: formattedProduct.status || 'draft'
        });

        // Charger les images existantes
        if (productData.images && productData.images.length > 0) {
          console.log('📸 Chargement des images:', productData.images);
          const formattedImages = productData.images.map((img, index) => {
            let imageUrl = '';
            if (typeof img === 'string') {
              imageUrl = img;
            } else if (img.url) {
              imageUrl = img.url;
            } else if (img.secure_url) {
              imageUrl = img.secure_url;
            } else if (img.public_id) {
              // Construire l'URL à partir du public_id si nécessaire
              imageUrl = `https://res.cloudinary.com/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'dlbwu1dld'}/image/upload/${img.public_id}`;
            }
            
            return {
              url: imageUrl,
              alt: typeof img === 'string' ? `Image ${index + 1}` : (img.alt || `Image ${index + 1}`),
              isPrimary: index === 0 || (img.isPrimary === true),
              order: img.order !== undefined ? img.order : index
            };
          });
          console.log('🖼️ Images formatées:', formattedImages);
          setProductImages(formattedImages);
        } else {
          console.log('⚠️ Aucune image trouvée pour ce produit');
          setProductImages([]);
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement du produit:', error);
        console.error('❌ Détails de l\'erreur:', error.response?.data || error.message);
        showError(error.response?.data?.message || 'Erreur lors du chargement du produit');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id, showError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
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
      newErrors.price = 'Le prix est requis et doit être supérieur à 0';
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
        name: toPlainText(formData.name, ''),
        description: toPlainText(formData.description, ''),
        shortDescription: deriveShortDescription(formData.description, ''),
        price: parseFloat(formData.price),
        currency: formData.currency,
        category: formData.category,
        inventory: {
          quantity: parseInt(formData.stock)
        },
        unit: formData.unit,
        status: formData.status || 'draft',
        images: productImages
      };

      console.log('💾 Données à envoyer pour la mise à jour:', productData);
      console.log('🖼️ Images à envoyer:', productImages);
      
      await transformerService.updateProduct(id, productData);
      showSuccess('Produit modifié avec succès');
      navigate('/transformer/products');
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
      
      showError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ModularDashboardLayout userType="transformer">
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
      <ModularDashboardLayout userType="transformer">
        <div className="p-6 max-w-4xl mx-auto pb-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Produit non trouvé</h1>
            <p className="text-gray-600 mb-6">Le produit que vous recherchez n'existe pas ou n'est plus disponible</p>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
            >
              <FiArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </button>
          </div>
        </div>
      </ModularDashboardLayout>
    );
  }

  return (
    <ModularDashboardLayout userType="transformer">
      <div className="p-6 max-w-4xl mx-auto pb-20">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => navigate(-1)}
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

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informations de base */}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                      onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                  onChange={handleInputChange}
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

          {/* Prix et stock */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <FiDollarSign className="h-5 w-5 mr-2" />
              Prix et stock
            </h2>
            
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
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      errors.price ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Devise
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="FCFA">FCFA</option>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                </select>
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
                  className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.stock ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0"
                />
                {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock}</p>}
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Images du produit
            </h2>
            
            <ProductImageManager
              images={productImages}
              onImagesChange={setProductImages}
              maxImages={5}
              uploading={uploadingImages}
              setUploading={setUploadingImages}
              errors={{}}
            />
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-harvests-light focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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

