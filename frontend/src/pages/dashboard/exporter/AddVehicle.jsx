import React from 'react';
import { useNavigate } from 'react-router-dom';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import VehicleImageUpload from '../../../components/vehicles/VehicleImageUpload';
import VehicleCapacity from '../../../components/vehicles/VehicleCapacity';
import { FiTruck, FiArrowLeft, FiSave } from 'react-icons/fi';
import { useAddVehicle } from '../../../hooks/useAddVehicle';
import { vehicleTypes, specialFeaturesOptions } from '../../../utils/vehicleConstants';

const AddVehicle = () => {
  const navigate = useNavigate();
  const {
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
  } = useAddVehicle();

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
            Enregistrez un nouveau véhicule ou conteneur pour votre flotte d'export
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Upload d'image */}
          <VehicleImageUpload
            vehicleImage={vehicleImage}
            uploadingImage={uploadingImage}
            fileInputRef={fileInputRef}
            onFileSelect={handleFileSelect}
            onDrop={handleDrop}
            onRemove={removeImage}
          />

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de conteneur
              </label>
              <input
                type="text"
                name="containerNumber"
                value={formData.containerNumber}
                onChange={handleInputChange}
                placeholder="Ex: ABCD1234567"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
              />
            </div>
          </div>

          {/* Capacité */}
          <VehicleCapacity
            capacity={formData.capacity}
            onInputChange={handleInputChange}
          />

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
                  Enregistrer
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
