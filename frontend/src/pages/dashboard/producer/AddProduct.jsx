import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { producerService, uploadService } from '../../../services';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import ProductImageUpload from '../../../components/common/ProductImageUpload';
import CloudinaryImage from '../../../components/common/CloudinaryImage';
import { 
  FiPackage, FiDollarSign, FiSave, FiArrowLeft, FiImage, FiX, 
  FiTruck, FiShield, FiInfo, FiTag, FiCalendar,
  FiMapPin, FiThermometer, FiClock, FiStar, FiPlus, FiMinus
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
    
    // Informations agricoles
    agricultureInfo: {
      harvestDate: '',
      expiryDate: '',
      shelfLife: { value: '', unit: 'days' },
      storageConditions: 'room-temperature',
      storageInstructions: '',
      seasonality: [],
      region: '',
      farmingMethod: 'organic'
    },
    
    // Informations nutritionnelles
    nutritionalInfo: {
      servingSize: { value: '', unit: 'g' },
      calories: '',
      nutrients: [],
      allergens: [],
      ingredients: []
    },
    
    // Expédition
    shipping: {
      weight: { value: '', unit: 'kg' },
      dimensions: { length: '', width: '', height: '', unit: 'cm' },
      fragile: false,
      perishable: true,
      requiresRefrigeration: false
    },
    
    // Certifications
    certifications: [],
    
    // Disponibilité
    availability: {
      status: 'in-stock',
      availableFrom: '',
      availableUntil: '',
      estimatedRestockDate: ''
    },
    
    // SEO
    seo: {
      title: '',
      description: '',
      keywords: []
    },
    
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

  const farmingMethods = [
    { value: 'organic', label: 'Biologique' },
    { value: 'conventional', label: 'Conventionnel' },
    { value: 'biodynamic', label: 'Biodynamique' },
    { value: 'hydroponic', label: 'Hydroponique' },
    { value: 'greenhouse', label: 'Serre' }
  ];

  const storageConditions = [
    { value: 'room-temperature', label: 'Température ambiante' },
    { value: 'cool-dry', label: 'Frais et sec' },
    { value: 'refrigerated', label: 'Réfrigéré' },
    { value: 'frozen', label: 'Congelé' },
    { value: 'special', label: 'Conditions spéciales' }
  ];

  const seasons = [
    { value: 'spring', label: 'Printemps' },
    { value: 'summer', label: 'Été' },
    { value: 'autumn', label: 'Automne' },
    { value: 'winter', label: 'Hiver' }
  ];

  const commonAllergens = [
    'Gluten', 'Lactose', 'Noix', 'Arachides', 'Soja', 'Œufs', 
    'Poisson', 'Crustacés', 'Mollusques', 'Sésame', 'Moutarde'
  ];

  const commonNutrients = [
    'Calories', 'Protéines', 'Glucides', 'Lipides', 'Fibres', 
    'Vitamine C', 'Vitamine A', 'Calcium', 'Fer', 'Potassium'
  ];

  // Fonctions de gestion des données
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else if (name.includes('agricultureInfo.')) {
      const field = name.replace('agricultureInfo.', '');
      setFormData(prev => ({
        ...prev,
        agricultureInfo: {
          ...prev.agricultureInfo,
          [field]: type === 'checkbox' ? checked : value
        }
      }));
    } else if (name.includes('nutritionalInfo.')) {
      const field = name.replace('nutritionalInfo.', '');
      setFormData(prev => ({
        ...prev,
        nutritionalInfo: {
          ...prev.nutritionalInfo,
          [field]: type === 'checkbox' ? checked : value
        }
      }));
    } else if (name.includes('shipping.')) {
      const field = name.replace('shipping.', '');
      
      // Gérer les champs imbriqués comme shipping.weight.value
      if (field.includes('.')) {
        const keys = field.split('.');
        setFormData(prev => {
          const newData = { ...prev };
          let current = newData.shipping;
          
          for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
              current[keys[i]] = {};
            }
            current = current[keys[i]];
          }
          
          current[keys[keys.length - 1]] = type === 'checkbox' ? checked : value;
          return newData;
        });
      } else {
        setFormData(prev => ({
          ...prev,
          shipping: {
            ...prev.shipping,
            [field]: type === 'checkbox' ? checked : value
          }
        }));
      }
    } else if (name.includes('seo.')) {
      const field = name.replace('seo.', '');
      setFormData(prev => ({
        ...prev,
        seo: {
          ...prev.seo,
          [field]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Effacer l'erreur shippingWeight si on modifie le poids
    if (name === 'shipping.weight.value' && errors.shippingWeight) {
      setErrors(prev => ({ ...prev, shippingWeight: '' }));
    }
  };

  const handleArrayInputChange = (parent, child, value) => {
    if (parent === '') {
      // Pour les tags au niveau racine
      setFormData(prev => ({
        ...prev,
        [child]: value.split(',').map(item => item.trim()).filter(item => item)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value.split(',').map(item => item.trim()).filter(item => item)
        }
      }));
    }
  };

  const addNutrient = () => {
    setFormData(prev => ({
      ...prev,
      nutritionalInfo: {
        ...prev.nutritionalInfo,
        nutrients: [...prev.nutritionalInfo.nutrients, { name: '', value: '', unit: 'g' }]
      }
    }));
  };

  const removeNutrient = (index) => {
    setFormData(prev => ({
      ...prev,
      nutritionalInfo: {
        ...prev.nutritionalInfo,
        nutrients: prev.nutritionalInfo.nutrients.filter((_, i) => i !== index)
      }
    }));
  };

  const updateNutrient = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      nutritionalInfo: {
        ...prev.nutritionalInfo,
        nutrients: prev.nutritionalInfo.nutrients.map((nutrient, i) => 
          i === index ? { ...nutrient, [field]: value } : nutrient
        )
      }
    }));
  };

  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, { name: '', certifyingBody: '', certificateNumber: '', validUntil: '', document: '' }]
    }));
  };

  const removeCertification = (index) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const updateCertification = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) => 
        i === index ? { ...cert, [field]: value } : cert
      )
    }));
  };

  const handleImageAdd = async (newImageUrl) => {
    try {
      setUploadingImages(true);
      
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
    
    // Champs obligatoires selon le modèle Product (required: true)
    if (!formData.name.fr?.trim()) newErrors.name = 'Le nom du produit en français est requis';
    if (!formData.description.fr?.trim()) newErrors.description = 'La description en français est requise';
    if (!formData.category) newErrors.category = 'La catégorie est requise';
    if (!formData.subcategory) newErrors.subcategory = 'La sous-catégorie est requise';
    if (productImages.length === 0) newErrors.images = 'Au moins une image est requise';
    
    // Validation des champs optionnels (si remplis)
    if (formData.price && formData.price <= 0) newErrors.price = 'Le prix doit être supérieur à 0';
    if (formData.stock && formData.stock < 0) newErrors.stock = 'Le stock ne peut pas être négatif';
    if (formData.minimumOrderQuantity && formData.minimumOrderQuantity < 1) newErrors.minimumOrderQuantity = 'La quantité minimum doit être au moins 1';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const productData = {
        name: formData.name,
        description: formData.description,
        shortDescription: formData.shortDescription,
        price: parseFloat(formData.price),
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
        category: formData.category,
        subcategory: formData.subcategory,
        tags: formData.tags,
        minimumOrderQuantity: parseInt(formData.minimumOrderQuantity),
        maximumOrderQuantity: formData.maximumOrderQuantity ? parseInt(formData.maximumOrderQuantity) : undefined,
        agricultureInfo: {
          ...formData.agricultureInfo,
          harvestDate: formData.agricultureInfo.harvestDate ? new Date(formData.agricultureInfo.harvestDate) : undefined,
          expiryDate: formData.agricultureInfo.expiryDate ? new Date(formData.agricultureInfo.expiryDate) : undefined,
          shelfLife: {
            ...formData.agricultureInfo.shelfLife,
            value: formData.agricultureInfo.shelfLife.value ? parseInt(formData.agricultureInfo.shelfLife.value) : undefined
          }
        },
        nutritionalInfo: {
          ...formData.nutritionalInfo,
          servingSize: {
            ...formData.nutritionalInfo.servingSize,
            value: formData.nutritionalInfo.servingSize.value ? parseFloat(formData.nutritionalInfo.servingSize.value) : undefined
          },
          calories: formData.nutritionalInfo.calories ? parseFloat(formData.nutritionalInfo.calories) : undefined,
          nutrients: formData.nutritionalInfo.nutrients.filter(n => n.name && n.value)
        },
        shipping: {
          ...formData.shipping,
          weight: {
            ...formData.shipping.weight,
            value: formData.shipping.weight.value ? parseFloat(formData.shipping.weight.value) : undefined
          },
          dimensions: {
            ...formData.shipping.dimensions,
            length: formData.shipping.dimensions.length ? parseFloat(formData.shipping.dimensions.length) : undefined,
            width: formData.shipping.dimensions.width ? parseFloat(formData.shipping.dimensions.width) : undefined,
            height: formData.shipping.dimensions.height ? parseFloat(formData.shipping.dimensions.height) : undefined
          }
        },
        certifications: formData.certifications.filter(cert => cert.name),
        availability: {
          ...formData.availability,
          availableFrom: formData.availability.availableFrom ? new Date(formData.availability.availableFrom) : undefined,
          availableUntil: formData.availability.availableUntil ? new Date(formData.availability.availableUntil) : undefined,
          estimatedRestockDate: formData.availability.estimatedRestockDate ? new Date(formData.availability.estimatedRestockDate) : undefined
        },
        seo: {
          ...formData.seo,
          keywords: formData.seo.keywords.filter(k => k.trim())
        },
        inventory: {
          quantity: parseInt(formData.stock)
        },
        status: formData.status || 'draft',
        producer: user.id,
        images: productImages
      };

      await producerService.createProduct(productData);
      navigate('/producer/products');
    } catch (error) {
      console.error('Erreur lors de la création du produit:', error);
      
      let errorMessage = 'Erreur lors de la création du produit';
      
      if (error.response?.data?.message) {
        const serverMessage = error.response.data.message;
        
        if (serverMessage.includes('duplicate key error') && serverMessage.includes('slug')) {
          errorMessage = 'Un produit avec ce nom existe déjà. Veuillez modifier le nom du produit.';
        } else if (serverMessage.includes('validation failed')) {
          errorMessage = 'Veuillez vérifier que tous les champs requis sont remplis correctement.';
        } else {
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
      <div className="p-6 max-w-6xl mx-auto pb-20">
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
                  Nom du produit (Français) *
                </label>
                <input
                  type="text"
                  name="name.fr"
                  value={formData.name.fr}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sous-catégorie *
                </label>
                <input
                  type="text"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleInputChange}
                  className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green ${
                    errors.subcategory ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Tomates cerises, Pommes de terre, etc."
                />
                {errors.subcategory && <p className="mt-1 text-sm text-red-600">{errors.subcategory}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (séparés par des virgules)
                </label>
                <input
                  type="text"
                  value={formData.tags.join(', ')}
                  onChange={(e) => handleArrayInputChange('', 'tags', e.target.value)}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                  placeholder="Ex: bio, local, frais, saisonnier"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Français) *
                </label>
                <textarea
                  name="description.fr"
                  value={formData.description.fr}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Décrivez votre produit, ses caractéristiques, sa qualité..."
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description courte (Français)
                </label>
                <textarea
                  name="shortDescription.fr"
                  value={formData.shortDescription.fr}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                  placeholder="Description courte pour les cartes produit..."
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
                  Prix (FCFA)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                  placeholder="0.00"
                />
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
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock disponible
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantité minimum
                </label>
                <input
                  type="number"
                  name="minimumOrderQuantity"
                  value={formData.minimumOrderQuantity}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                  placeholder="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantité maximum
                </label>
                <input
                  type="number"
                  name="maximumOrderQuantity"
                  value={formData.maximumOrderQuantity}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                  placeholder="100"
                />
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
                  <option value="box">Boîte</option>
                </select>
              </div>
            </div>
          </div>

          {/* Informations agricoles */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <FiInfo className="h-5 w-5 mr-2" />
              Informations agricoles
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Méthode de culture
                </label>
                <select
                  name="agricultureInfo.farmingMethod"
                  value={formData.agricultureInfo.farmingMethod}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                >
                  {farmingMethods.map(method => (
                    <option key={method.value} value={method.value}>{method.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Région de production
                </label>
                <input
                  type="text"
                  name="agricultureInfo.region"
                  value={formData.agricultureInfo.region}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                  placeholder="Ex: Centre, Littoral, Ouest..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de récolte
                </label>
                <input
                  type="date"
                  name="agricultureInfo.harvestDate"
                  value={formData.agricultureInfo.harvestDate}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date d'expiration
                </label>
                <input
                  type="date"
                  name="agricultureInfo.expiryDate"
                  value={formData.agricultureInfo.expiryDate}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée de conservation
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    name="agricultureInfo.shelfLife.value"
                    value={formData.agricultureInfo.shelfLife.value}
                    onChange={handleInputChange}
                    className="flex-1 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                    placeholder="7"
                  />
                  <select
                    name="agricultureInfo.shelfLife.unit"
                    value={formData.agricultureInfo.shelfLife.unit}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                  >
                    <option value="days">Jours</option>
                    <option value="weeks">Semaines</option>
                    <option value="months">Mois</option>
                    <option value="years">Années</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conditions de stockage
                </label>
                <select
                  name="agricultureInfo.storageConditions"
                  value={formData.agricultureInfo.storageConditions}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                >
                  {storageConditions.map(condition => (
                    <option key={condition.value} value={condition.value}>{condition.label}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructions de stockage
                </label>
                <textarea
                  name="agricultureInfo.storageInstructions"
                  value={formData.agricultureInfo.storageInstructions}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                  placeholder="Ex: Conserver au frais et au sec, éviter l'exposition directe au soleil..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Saisonnalité
                </label>
                <div className="flex flex-wrap gap-2">
                  {seasons.map(season => (
                    <label key={season.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.agricultureInfo.seasonality.includes(season.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              agricultureInfo: {
                                ...prev.agricultureInfo,
                                seasonality: [...prev.agricultureInfo.seasonality, season.value]
                              }
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              agricultureInfo: {
                                ...prev.agricultureInfo,
                                seasonality: prev.agricultureInfo.seasonality.filter(s => s !== season.value)
                              }
                            }));
                          }
                        }}
                        className="mr-2"
                      />
                      {season.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Informations nutritionnelles */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <FiInfo className="h-5 w-5 mr-2" />
              Informations nutritionnelles
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taille de portion
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    name="nutritionalInfo.servingSize.value"
                    value={formData.nutritionalInfo.servingSize.value}
                    onChange={handleInputChange}
                    className="flex-1 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                    placeholder="100"
                  />
                  <select
                    name="nutritionalInfo.servingSize.unit"
                    value={formData.nutritionalInfo.servingSize.unit}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                  >
                    <option value="g">g</option>
                    <option value="ml">ml</option>
                    <option value="piece">pièce</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calories (pour 100g)
                </label>
                <input
                  type="number"
                  name="nutritionalInfo.calories"
                  value={formData.nutritionalInfo.calories}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                  placeholder="50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allergènes
                </label>
                <div className="flex flex-wrap gap-2">
                  {commonAllergens.map(allergen => (
                    <label key={allergen} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.nutritionalInfo.allergens.includes(allergen)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              nutritionalInfo: {
                                ...prev.nutritionalInfo,
                                allergens: [...prev.nutritionalInfo.allergens, allergen]
                              }
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              nutritionalInfo: {
                                ...prev.nutritionalInfo,
                                allergens: prev.nutritionalInfo.allergens.filter(a => a !== allergen)
                              }
                            }));
                          }
                        }}
                        className="mr-2"
                      />
                      {allergen}
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ingrédients (pour produits transformés)
                </label>
                <input
                  type="text"
                  value={formData.nutritionalInfo.ingredients.join(', ')}
                  onChange={(e) => handleArrayInputChange('nutritionalInfo', 'ingredients', e.target.value)}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                  placeholder="Ex: Tomates, sel, épices..."
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Valeurs nutritionnelles
                  </label>
                  <button
                    type="button"
                    onClick={addNutrient}
                    className="flex items-center text-sm text-harvests-green hover:text-green-600"
                  >
                    <FiPlus className="h-4 w-4 mr-1" />
                    Ajouter
                  </button>
                </div>
                
                {formData.nutritionalInfo.nutrients.map((nutrient, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={nutrient.name}
                      onChange={(e) => updateNutrient(index, 'name', e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                      placeholder="Ex: Protéines"
                    />
                    <input
                      type="number"
                      value={nutrient.value}
                      onChange={(e) => updateNutrient(index, 'value', e.target.value)}
                      className="w-20 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                      placeholder="2.5"
                    />
                    <select
                      value={nutrient.unit}
                      onChange={(e) => updateNutrient(index, 'unit', e.target.value)}
                      className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                    >
                      <option value="g">g</option>
                      <option value="mg">mg</option>
                      <option value="%">%</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeNutrient(index)}
                      className="p-2 text-red-500 hover:text-red-600"
                    >
                      <FiMinus className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Expédition */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <FiTruck className="h-5 w-5 mr-2" />
              Informations d'expédition
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poids
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    name="shipping.weight.value"
                    value={formData.shipping.weight.value}
                    onChange={handleInputChange}
                    className="flex-1 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                    placeholder="1.5"
                  />
                  <select
                    name="shipping.weight.unit"
                    value={formData.shipping.weight.unit}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                  >
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                    <option value="lb">lb</option>
                    <option value="oz">oz</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dimensions (L x l x H)
                </label>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      name="shipping.dimensions.length"
                      value={formData.shipping.dimensions.length}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green text-center"
                      placeholder="Longueur"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      name="shipping.dimensions.width"
                      value={formData.shipping.dimensions.width}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green text-center"
                      placeholder="Largeur"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      name="shipping.dimensions.height"
                      value={formData.shipping.dimensions.height}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green text-center"
                      placeholder="Hauteur"
                    />
                  </div>
                  <div className="w-20">
                    <select
                      name="shipping.dimensions.unit"
                      value={formData.shipping.dimensions.unit}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md py-2 px-2 focus:outline-none focus:ring-2 focus:ring-harvests-green text-center"
                    >
                      <option value="cm">cm</option>
                      <option value="m">m</option>
                      <option value="in">in</option>
                      <option value="ft">ft</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="shipping.fragile"
                      checked={formData.shipping.fragile}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    Produit fragile
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="shipping.perishable"
                      checked={formData.shipping.perishable}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    Produit périssable
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="shipping.requiresRefrigeration"
                      checked={formData.shipping.requiresRefrigeration}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    Nécessite une réfrigération
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <FiShield className="h-5 w-5 mr-2" />
              Certifications et labels
            </h2>
            
            <div className="space-y-4">
              {formData.certifications.map((cert, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-700">Certification {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeCertification(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom de la certification
                      </label>
                      <input
                        type="text"
                        value={cert.name}
                        onChange={(e) => updateCertification(index, 'name', e.target.value)}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                        placeholder="Ex: Agriculture Biologique"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Organisme certificateur
                      </label>
                      <input
                        type="text"
                        value={cert.certifyingBody}
                        onChange={(e) => updateCertification(index, 'certifyingBody', e.target.value)}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                        placeholder="Ex: Ecocert"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Numéro de certificat
                      </label>
                      <input
                        type="text"
                        value={cert.certificateNumber}
                        onChange={(e) => updateCertification(index, 'certificateNumber', e.target.value)}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                        placeholder="Ex: BIO-2024-001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valide jusqu'au
                      </label>
                      <input
                        type="date"
                        value={cert.validUntil}
                        onChange={(e) => updateCertification(index, 'validUntil', e.target.value)}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Document (URL)
                      </label>
                      <input
                        type="url"
                        value={cert.document}
                        onChange={(e) => updateCertification(index, 'document', e.target.value)}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                        placeholder="https://example.com/certificate.pdf"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addCertification}
                className="flex items-center text-sm text-harvests-green hover:text-green-600"
              >
                <FiPlus className="h-4 w-4 mr-1" />
                Ajouter une certification
              </button>
            </div>
          </div>

          {/* Disponibilité */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <FiCalendar className="h-5 w-5 mr-2" />
              Disponibilité
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut de disponibilité
                </label>
                <select
                  name="availability.status"
                  value={formData.availability.status}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                >
                  <option value="in-stock">En stock</option>
                  <option value="low-stock">Stock faible</option>
                  <option value="out-of-stock">Rupture de stock</option>
                  <option value="pre-order">Pré-commande</option>
                  <option value="discontinued">Discontinué</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Disponible à partir du
                </label>
                <input
                  type="date"
                  name="availability.availableFrom"
                  value={formData.availability.availableFrom}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Disponible jusqu'au
                </label>
                <input
                  type="date"
                  name="availability.availableUntil"
                  value={formData.availability.availableUntil}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de réapprovisionnement estimée
                </label>
                <input
                  type="date"
                  name="availability.estimatedRestockDate"
                  value={formData.availability.estimatedRestockDate}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                />
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <FiTag className="h-5 w-5 mr-2" />
              Optimisation SEO
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre SEO
                </label>
                <input
                  type="text"
                  name="seo.title"
                  value={formData.seo.title}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                  placeholder="Ex: Tomates cerises bio fraîches - Producteur local"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description SEO
                </label>
                <textarea
                  name="seo.description"
                  value={formData.seo.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                  placeholder="Description optimisée pour les moteurs de recherche..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mots-clés (séparés par des virgules)
                </label>
                <input
                  type="text"
                  value={formData.seo.keywords.join(', ')}
                  onChange={(e) => handleArrayInputChange('seo', 'keywords', e.target.value)}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                  placeholder="Ex: tomates, bio, local, frais, agriculture"
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
            
            <div className="space-y-6">
              {/* Zone d'upload */}
              <ProductImageUpload
                onImageUpload={handleImageAdd}
                uploading={uploadingImages}
                setUploading={setUploadingImages}
                maxImages={10}
                currentCount={productImages.length}
              />

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
