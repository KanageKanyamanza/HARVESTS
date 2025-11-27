import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from './useAuth';
import { uploadService } from '../services';
import { useNotifications } from '../contexts/NotificationContext';

export const useVehicleForm = (service, userTypeKey, basePath, defaultWeightUnit = 'kg') => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { vehicleId } = useParams();
  const { showSuccess, showError } = useNotifications();
  const [loading, setLoading] = useState(!!vehicleId);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [vehicleImage, setVehicleImage] = useState(null);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    vehicleType: '',
    registrationNumber: '',
    containerNumber: '',
    capacity: {
      weight: { value: '', unit: defaultWeightUnit },
      volume: { value: '', unit: 'm³' }
    },
    specialFeatures: [],
    condition: 'good',
    isAvailable: true,
    lastMaintenanceDate: '',
    nextMaintenanceDate: ''
  });

  useEffect(() => {
    const loadVehicle = async () => {
      if (user?.userType === userTypeKey && vehicleId) {
        try {
          setLoading(true);
          const response = await service.getFleet();
          const fleet = response.data.data?.fleet || response.data.fleet || [];
          const vehicle = fleet.find(v => v._id === vehicleId);
          
          if (!vehicle) {
            showError('Véhicule non trouvé');
            navigate(`/${userTypeKey}/fleet`);
            return;
          }

          setFormData({
            vehicleType: vehicle.vehicleType || '',
            registrationNumber: vehicle.registrationNumber || '',
            containerNumber: vehicle.containerNumber || '',
            capacity: {
              weight: { value: vehicle.capacity?.weight?.value || '', unit: vehicle.capacity?.weight?.unit || defaultWeightUnit },
              volume: { value: vehicle.capacity?.volume?.value || '', unit: vehicle.capacity?.volume?.unit || 'm³' }
            },
            specialFeatures: vehicle.specialFeatures || [],
            condition: vehicle.condition || 'good',
            isAvailable: vehicle.isAvailable !== undefined ? vehicle.isAvailable : true,
            lastMaintenanceDate: vehicle.lastMaintenanceDate ? new Date(vehicle.lastMaintenanceDate).toISOString().split('T')[0] : '',
            nextMaintenanceDate: vehicle.nextMaintenanceDate ? new Date(vehicle.nextMaintenanceDate).toISOString().split('T')[0] : ''
          });

          if (vehicle.image) {
            setVehicleImage(typeof vehicle.image === 'string' ? { url: vehicle.image, alt: 'Véhicule' } : vehicle.image);
          }
        } catch (error) {
          console.error('Erreur:', error);
          showError('Erreur lors du chargement');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    loadVehicle();
  }, [vehicleId, user, userTypeKey, service, navigate, showError, defaultWeightUnit]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  }, [errors]);

  const handleCapacityChange = useCallback((e) => {
    const { name, value } = e.target;
    const [, field, subfield] = name.split('.');
    setFormData(prev => ({
      ...prev,
      capacity: { ...prev.capacity, [field]: { ...prev.capacity[field], [subfield]: value } }
    }));
  }, []);

  const handleFeatureToggle = useCallback((feature) => {
    setFormData(prev => ({
      ...prev,
      specialFeatures: prev.specialFeatures.includes(feature)
        ? prev.specialFeatures.filter(f => f !== feature)
        : [...prev.specialFeatures, feature]
    }));
  }, []);

  const handleImageUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const response = await uploadService.uploadSingle(file, 'vehicles');
      if (response.data?.url) {
        setVehicleImage({ url: response.data.url, public_id: response.data.public_id, alt: 'Véhicule' });
        showSuccess('Image téléchargée');
      }
    } catch (error) {
      showError('Erreur lors du téléchargement');
    } finally {
      setUploadingImage(false);
    }
  }, [showSuccess, showError]);

  const handleImageRemove = useCallback(() => setVehicleImage(null), []);

  const validate = useCallback(() => {
    const newErrors = {};
    if (!formData.vehicleType) newErrors.vehicleType = 'Type requis';
    if (!formData.registrationNumber) newErrors.registrationNumber = 'Immatriculation requise';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      const payload = { ...formData, image: vehicleImage };
      
      if (vehicleId) {
        await service.updateVehicle(vehicleId, payload);
        showSuccess('Véhicule mis à jour');
      } else {
        await service.addVehicle(payload);
        showSuccess('Véhicule ajouté');
      }
      navigate(`/${userTypeKey}/fleet`);
    } catch (error) {
      console.error('Erreur:', error);
      showError(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  }, [formData, vehicleImage, vehicleId, service, userTypeKey, navigate, showSuccess, showError, validate]);

  return {
    formData, setFormData, errors, loading, saving, vehicleImage,
    uploadingImage, fileInputRef, vehicleId,
    handleChange, handleCapacityChange, handleFeatureToggle,
    handleImageUpload, handleImageRemove, handleSubmit, navigate
  };
};

