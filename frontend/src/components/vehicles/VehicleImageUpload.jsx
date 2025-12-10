import React from 'react';
import { FiUpload, FiX } from 'react-icons/fi';
import CloudinaryImage from '../common/CloudinaryImage';
import LoadingSpinner from '../common/LoadingSpinner';

const VehicleImageUpload = ({
  vehicleImage,
  uploadingImage,
  fileInputRef,
  onFileSelect,
  onDrop,
  onRemove
}) => {
  return (
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
            onClick={onRemove}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-harvests-green transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onFileSelect}
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
  );
};

export default VehicleImageUpload;

