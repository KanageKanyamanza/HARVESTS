import React from 'react';
import { exporterService } from '../../../services';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import { FiTruck, FiArrowLeft, FiSave, FiX } from 'react-icons/fi';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { useVehicleForm } from '../../../hooks/useVehicleForm';
import { VehicleImageUpload, VehicleBasicInfo, VehicleCapacity, VehicleFeatures, VehicleStatus } from '../../../components/vehicle/VehicleFormFields';

const vehicleTypes = [
  { value: 'container', label: 'Conteneur standard' },
  { value: 'container-20ft', label: 'Conteneur 20 pieds' },
  { value: 'container-40ft', label: 'Conteneur 40 pieds' },
  { value: 'container-refrigerated', label: 'Conteneur frigorifique' },
  { value: 'truck', label: 'Camion' },
  { value: 'refrigerated-truck', label: 'Camion frigorifique' },
  { value: 'trailer', label: 'Remorque' },
  { value: 'vessel', label: 'Navire' },
  { value: 'aircraft', label: 'Avion cargo' }
];

const specialFeaturesOptions = [
  { value: 'refrigerated', label: 'Frigorifique' },
  { value: 'insulated', label: 'Isolé' },
  { value: 'ventilated', label: 'Ventilé' },
  { value: 'covered', label: 'Couvert' },
  { value: 'gps-tracked', label: 'Suivi GPS' },
  { value: 'temperature-controlled', label: 'Température contrôlée' }
];

const EditVehicle = () => {
  const {
    formData, errors, loading, saving, vehicleImage, uploadingImage, fileInputRef, vehicleId,
    handleChange, handleCapacityChange, handleFeatureToggle, handleImageUpload, handleImageRemove, handleSubmit, navigate
  } = useVehicleForm(exporterService, 'exporter', '/exporter/fleet', 'tons');

  if (loading) {
    return (
      <ModularDashboardLayout>
        <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" text="Chargement..." /></div>
      </ModularDashboardLayout>
    );
  }

  return (
    <ModularDashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate('/exporter/fleet')} className="p-2 hover:bg-gray-100 rounded-lg"><FiArrowLeft className="h-5 w-5" /></button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{vehicleId ? 'Modifier le véhicule' : 'Ajouter un véhicule'}</h1>
              <p className="text-gray-600">Gérez les informations de votre véhicule d'export</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <VehicleImageUpload vehicleImage={vehicleImage} uploadingImage={uploadingImage} onImageUpload={handleImageUpload} onImageRemove={handleImageRemove} fileInputRef={fileInputRef} />
          <VehicleBasicInfo formData={formData} errors={errors} vehicleTypes={vehicleTypes} onChange={handleChange} isExporter={true} />
          <VehicleCapacity formData={formData} weightUnit="tonnes" volumeUnit="m³" onCapacityChange={handleCapacityChange} />
          <VehicleFeatures formData={formData} specialFeaturesOptions={specialFeaturesOptions} onFeatureToggle={handleFeatureToggle} />
          <VehicleStatus formData={formData} onChange={handleChange} />

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={() => navigate('/exporter/fleet')} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <FiX className="h-4 w-4 mr-2" />Annuler
            </button>
            <button type="submit" disabled={saving} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">
              <FiSave className="h-4 w-4 mr-2" />{saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </ModularDashboardLayout>
  );
};

export default EditVehicle;
