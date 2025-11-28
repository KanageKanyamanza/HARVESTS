import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { transporterService, uploadService } from '../../../services';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import { FiTruck, FiArrowLeft, FiSave, FiX, FiUpload } from 'react-icons/fi';
import { useNotifications } from '../../../contexts/NotificationContext';
import CloudinaryImage from '../../../components/common/CloudinaryImage';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const AddVehicle = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [vehicleImage, setVehicleImage] = useState(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    vehicleType: '',
    registrationNumber: '',
    capacity: {
      weight: { value: '', unit: 'kg' },
      volume: { value: '', unit: 'm³' }
    },
    specialFeatures: [],
    condition: 'good',
    isAvailable: true,
    lastMaintenanceDate: '',
    nextMaintenanceDate: ''
  });

  const vehicleTypes = [
    { value: 'motorcycle', label: 'Moto' },
    { value: 'van', label: 'Fourgonnette' },
    { value: 'truck', label: 'Camion' },
    { value: 'refrigerated-truck', label: 'Camion frigorifique' },
    { value: 'trailer', label: 'Remorque' },
    { value: 'container-truck', label: 'Camion conteneur' }
  ];

  const specialFeaturesOptions = [
    { value: 'refrigerated', label: 'Frigorifique' },
    { value: 'insulated', label: 'Isolé' },
    { value: 'ventilated', label: 'Ventilé' },
    { value: 'covered', label: 'Couvert' },
    { value: 'gps-tracked', label: 'Suivi GPS' },
    { value: 'temperature-controlled', label: 'Température contrôlée' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const parts = name.split('.');
      if (parts.length === 3) {
        const [parent, child, subChild] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent][child],
              [subChild]: type === 'number' ? parseFloat(value) || 0 : value
            }
          }
        }));
      } else {
        const [parent, child] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: type === 'number' ? parseFloat(value) || 0 : value
          }
        }));
      }
    } else {
      if (type === 'checkbox') {
        if (name === 'specialFeatures') {
          setFormData(prev => ({
            ...prev,
            specialFeatures: checked
              ? [...prev.specialFeatures, value]
              : prev.specialFeatures.filter(f => f !== value)
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            [name]: checked
          }));
        }
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: type === 'number' ? parseFloat(value) || 0 : value
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.vehicleType) {
      newErrors.vehicleType = 'Le type de véhicule est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      showError('Veuillez sélectionner un fichier image valide');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError('La taille du fichier ne doit pas dépasser 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('images', file);
      
      const response = await uploadService.uploadProductImages(formData);
      const uploadedImage = response.data?.data?.images?.[0] || response.data?.images?.[0];
      const imageUrl = uploadedImage?.url || uploadedImage?.secure_url;
      const publicId = uploadedImage?.public_id || uploadedImage?.publicId;
      
      if (imageUrl) {
        const imageData = {
          url: imageUrl,
          publicId: publicId || null,
          alt: file.name || 'Véhicule'
        };
        console.log('Image uploadée:', imageData);
        setVehicleImage(imageData);
        showSuccess('Image uploadée avec succès');
      } else {
        throw new Error('URL d\'image non trouvée dans la réponse');
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload de l\'image:', error);
      showError('Erreur lors de l\'upload de l\'image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const removeImage = () => {
    setVehicleImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const vehicleData = {
        vehicleType: formData.vehicleType,
        registrationNumber: formData.registrationNumber || undefined,
        capacity: {
          weight: formData.capacity.weight.value ? {
            value: parseFloat(formData.capacity.weight.value),
            unit: formData.capacity.weight.unit
          } : undefined,
          volume: formData.capacity.volume.value ? {
            value: parseFloat(formData.capacity.volume.value),
            unit: formData.capacity.volume.unit
          } : undefined
        },
        specialFeatures: formData.specialFeatures,
        condition: formData.condition,
        isAvailable: formData.isAvailable,
        lastMaintenanceDate: formData.lastMaintenanceDate || undefined,
        nextMaintenanceDate: formData.nextMaintenanceDate || undefined
      };

      // Ajouter l'image seulement si elle existe
      if (vehicleImage && vehicleImage.url) {
        vehicleData.image = {
          url: vehicleImage.url,
          publicId: vehicleImage.publicId || null,
          alt: vehicleImage.alt || 'Véhicule'
        };
      }

      console.log('Données du véhicule à envoyer:', vehicleData);
      await transporterService.addFleetVehicle(vehicleData);
      showSuccess('Véhicule ajouté avec succès à votre flotte !');
      navigate('/transporter/fleet');
    } catch (error) {
      console.error('Erreur:', error);
      showError(error.response?.data?.message || 'Erreur lors de l\'ajout du véhicule. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModularDashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <FiArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FiTruck className="h-7 w-7 mr-3 text-blue-500" />
            Ajouter un véhicule à la flotte
          </h1>
          <p className="text-gray-600 mt-1">
            Enregistrez un nouveau véhicule pour vos livraisons locales
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Upload d'image */}
          <div className="border-b pb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Photo du véhicule (optionnel)
            </label>
            {vehicleImage ? (
              <div className="relative inline-block">
                <div className="w-48 h-32 rounded-lg overflow-hidden border-2 border-gray-300">
                  <CloudinaryImage
                    src={vehicleImage.url}
                    alt={vehicleImage.alt || 'Véhicule'}
                    className="w-full h-full object-cover"
                    width={200}
                    height={150}
                  />
                </div>
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-harvests-green transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {uploadingImage ? (
                  <LoadingSpinner size="md" text="Upload en cours..." />
                ) : (
                  <>
                    <FiUpload className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      Cliquez ou glissez une image ici
                    </p>
                    <p className="text-xs text-gray-500 mt-1">JPEG, PNG ou WebP (max 5MB)</p>
                  </>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de véhicule <span className="text-red-500">*</span>
            </label>
            <select
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
            >
              <option value="">Sélectionnez un type</option>
              {vehicleTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            {errors.vehicleType && <p className="text-red-500 text-sm mt-1">{errors.vehicleType}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numéro d'immatriculation
            </label>
            <input
              type="text"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleInputChange}
              placeholder="Ex: ABC-123-XY"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Capacité</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poids
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="capacity.weight.value"
                    value={formData.capacity.weight.value}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
                  />
                  <select
                    name="capacity.weight.unit"
                    value={formData.capacity.weight.unit}
                    onChange={handleInputChange}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
                  >
                    <option value="kg">kg</option>
                    <option value="tons">tonnes</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Volume
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="capacity.volume.value"
                    value={formData.capacity.volume.value}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
                  />
                  <select
                    name="capacity.volume.unit"
                    value={formData.capacity.volume.unit}
                    onChange={handleInputChange}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
                  >
                    <option value="m³">m³</option>
                    <option value="liters">litres</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Caractéristiques spéciales
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {specialFeaturesOptions.map(feature => (
                <label key={feature.value} className="flex items-center">
                  <input
                    type="checkbox"
                    name="specialFeatures"
                    value={feature.value}
                    checked={formData.specialFeatures.includes(feature.value)}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-harvests-green focus:ring-harvests-green"
                  />
                  <span className="ml-2 text-sm text-gray-700">{feature.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                État du véhicule
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
              >
                <option value="excellent">Excellent</option>
                <option value="good">Bon</option>
                <option value="fair">Moyen</option>
                <option value="needs-maintenance">Entretien requis</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Disponibilité
              </label>
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-harvests-green focus:ring-harvests-green"
                />
                <span className="ml-2 text-sm text-gray-700">Disponible actuellement</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dernière maintenance
              </label>
              <input
                type="date"
                name="lastMaintenanceDate"
                value={formData.lastMaintenanceDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prochaine maintenance
              </label>
              <input
                type="date"
                name="nextMaintenanceDate"
                value={formData.nextMaintenanceDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
              />
            </div>
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.submit}
            </div>
          )}

          <div className="flex justify-end gap-4 border-t pt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !formData.vehicleType}
              className="px-6 py-2 bg-harvests-green text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <FiSave className="h-4 w-4 mr-2" />
                  Enregistrer le véhicule
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </ModularDashboardLayout>
  );
};

export default AddVehicle;

