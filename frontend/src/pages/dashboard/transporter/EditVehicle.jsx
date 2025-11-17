import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { transporterService, uploadService } from '../../../services';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import { FiTruck, FiArrowLeft, FiSave, FiX, FiUpload, FiTrash2 } from 'react-icons/fi';
import { useNotifications } from '../../../contexts/NotificationContext';
import CloudinaryImage from '../../../components/common/CloudinaryImage';

const EditVehicle = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { vehicleId } = useParams();
  const { showSuccess, showError } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    const loadVehicle = async () => {
      if (user?.userType === 'transporter' && vehicleId) {
        try {
          setLoading(true);
          const response = await transporterService.getFleet();
          const fleet = response.data.data?.fleet || response.data.fleet || [];
          const vehicle = fleet.find(v => v._id === vehicleId);
          
          if (!vehicle) {
            showError('Véhicule non trouvé');
            navigate('/transporter/fleet');
            return;
          }

          setFormData({
            vehicleType: vehicle.vehicleType || '',
            registrationNumber: vehicle.registrationNumber || '',
            capacity: {
              weight: {
                value: vehicle.capacity?.weight?.value || '',
                unit: vehicle.capacity?.weight?.unit || 'kg'
              },
              volume: {
                value: vehicle.capacity?.volume?.value || '',
                unit: vehicle.capacity?.volume?.unit || 'm³'
              }
            },
            specialFeatures: vehicle.specialFeatures || [],
            condition: vehicle.condition || 'good',
            isAvailable: vehicle.isAvailable !== undefined ? vehicle.isAvailable : true,
            lastMaintenanceDate: vehicle.lastMaintenanceDate ? new Date(vehicle.lastMaintenanceDate).toISOString().split('T')[0] : '',
            nextMaintenanceDate: vehicle.nextMaintenanceDate ? new Date(vehicle.nextMaintenanceDate).toISOString().split('T')[0] : ''
          });

          if (vehicle.image) {
            setVehicleImage(vehicle.image);
          }
        } catch (error) {
          console.error('Erreur lors du chargement du véhicule:', error);
          showError('Erreur lors du chargement du véhicule');
          navigate('/transporter/fleet');
        } finally {
          setLoading(false);
        }
      }
    };

    loadVehicle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userType, vehicleId]);

  const handleInputChange = useCallback((e) => {
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
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.vehicleType) {
      newErrors.vehicleType = 'Le type de véhicule est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = useCallback(async (file) => {
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
      const formDataUpload = new FormData();
      formDataUpload.append('images', file);
      
      const response = await uploadService.uploadProductImages(formDataUpload);
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
  }, [showError]);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  }, [handleImageUpload]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  }, [handleImageUpload]);

  const removeImage = useCallback(() => {
    setVehicleImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
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

      // Ajouter l'image seulement si elle existe (ou la supprimer si vehicleImage est null)
      if (vehicleImage && vehicleImage.url) {
        vehicleData.image = {
          url: vehicleImage.url,
          publicId: vehicleImage.publicId || null,
          alt: vehicleImage.alt || 'Véhicule'
        };
      } else if (vehicleImage === null) {
        // Si l'image a été supprimée, envoyer null pour la supprimer
        vehicleData.image = null;
      }

      console.log('Données du véhicule à envoyer:', vehicleData);
      await transporterService.updateFleetVehicle(vehicleId, vehicleData);
      showSuccess('Véhicule modifié avec succès !');
      navigate('/transporter/fleet');
    } catch (error) {
      console.error('Erreur:', error);
      showError(error.response?.data?.message || 'Erreur lors de la modification du véhicule. Veuillez réessayer.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ? Cette action est irréversible.')) {
      return;
    }

    try {
      await transporterService.removeFleetVehicle(vehicleId);
      showSuccess('Véhicule supprimé avec succès');
      navigate('/transporter/fleet');
    } catch (error) {
      console.error('Erreur:', error);
      showError(error.response?.data?.message || 'Erreur lors de la suppression du véhicule');
    }
  };

  if (loading) {
    return (
      <ModularDashboardLayout>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-harvests-green"></div>
            <p className="mt-4 text-gray-600">Chargement du véhicule...</p>
          </div>
        </div>
      </ModularDashboardLayout>
    );
  }

  return (
    <ModularDashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <FiArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </button>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <FiTruck className="h-7 w-7 mr-3 text-blue-500" />
              Modifier le véhicule
            </h1>
            <p className="text-gray-600 mt-1">
              Modifiez les informations de votre véhicule de livraison
            </p>
          </div>
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            <FiTrash2 className="h-4 w-4 mr-2" />
            Supprimer
          </button>
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
                  <>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-harvests-green mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Upload en cours...</p>
                  </>
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
              disabled={saving || !formData.vehicleType}
              className="px-6 py-2 bg-harvests-green text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
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

export default EditVehicle;

