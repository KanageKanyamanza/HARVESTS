import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { exporterService, transporterService, uploadService } from '../services';
import { useNotifications } from '../contexts/NotificationContext';

/**
 * Hook personnalisé pour gérer l'ajout d'un véhicule
 * @param {string} userType - 'exporter' ou 'transporter'
 */
export const useAddVehicle = (userType = 'exporter') => {
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
    containerNumber: userType === 'exporter' ? '' : undefined,
    capacity: {
      weight: { value: '', unit: userType === 'transporter' ? 'kg' : 'tons' },
      volume: { value: '', unit: 'm³' }
    },
    specialFeatures: [],
    condition: 'good',
    isAvailable: true,
    lastMaintenanceDate: '',
    nextMaintenanceDate: ''
  });

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
      const imageFormData = new FormData();
      imageFormData.append('images', file);
      imageFormData.append('folder', 'fleet');
      imageFormData.append('resourceType', 'image');

      const response = await uploadService.uploadProductImages(imageFormData);

      const payload = response?.data?.data || response?.data;
      const uploaded = payload?.images?.[0]
        ? {
            url: payload.images[0].secure_url || payload.images[0].url,
            secureUrl: payload.images[0].secure_url || payload.images[0].url,
            publicId: payload.images[0].public_id || payload.images[0].publicId,
            originalFilename: payload.images[0].original_filename,
            format: payload.images[0].format,
            size: payload.images[0].size,
            width: payload.images[0].width,
            height: payload.images[0].height
          }
        : payload;

      if (uploaded?.secureUrl || uploaded?.url) {
        setVehicleImage({
          url: uploaded.secureUrl || uploaded.url,
          secureUrl: uploaded.secureUrl || uploaded.url,
          publicId: uploaded.publicId,
          alt: file.name
        });
      } else {
        throw new Error('Réponse upload invalide');
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
        ...(userType === 'exporter' && { containerNumber: formData.containerNumber || undefined }),
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
        nextMaintenanceDate: formData.nextMaintenanceDate || undefined,
        image: vehicleImage?.url ? vehicleImage : undefined
      };

      const service = userType === 'transporter' ? transporterService : exporterService;
      const response = await service.addFleetVehicle(vehicleData);
      showSuccess('Véhicule ajouté avec succès à votre flotte !');
      
      const newVehicle = response?.data?.data || response?.data;
      const basePath = userType === 'transporter' ? '/transporter/fleet' : '/exporter/fleet';
      if (newVehicle && newVehicle._id) {
        navigate(`${basePath}/${newVehicle._id}`, { replace: true });
      } else {
        navigate(basePath, { replace: true });
      }
    } catch (error) {
      console.error('Erreur:', error);
      showError(error.response?.data?.message || 'Erreur lors de l\'ajout du véhicule. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    errors,
    formData,
    vehicleImage,
    uploadingImage,
    fileInputRef,
    handleInputChange,
    handleFileSelect,
    handleDrop,
    removeImage,
    handleSubmit
  };
};

