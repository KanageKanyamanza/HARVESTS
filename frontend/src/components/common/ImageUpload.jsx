import React, { useState, useRef } from 'react';
import { FiUpload, FiX, FiImage, FiCheck } from 'react-icons/fi';
import { uploadService } from '../../services';
import { useAuth } from '../../hooks/useAuth';
import CloudinaryImage from './CloudinaryImage';
import LoadingSpinner from './LoadingSpinner';

const ImageUpload = ({
  currentImage,
  onImageChange,
  onImageRemove,
  type = 'avatar', // 'avatar', 'banner', 'logo', 'product'
  size = 'medium', // 'small', 'medium', 'large'
  aspectRatio = 'square', // 'square', 'banner', 'free'
  className = '',
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const { refreshUser } = useAuth();

  // Configuration par type
  const configs = {
    avatar: {
      maxSize: 2 * 1024 * 1024, // 2MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      dimensions: { width: 500, height: 500 },
      uploadFunction: uploadService.uploadAvatar,
      fieldName: 'avatar'
    },
    banner: {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      dimensions: { width: 1200, height: 400 },
      uploadFunction: uploadService.uploadShopBanner,
      fieldName: 'shopBanner'
    },
    logo: {
      maxSize: 2 * 1024 * 1024, // 2MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      dimensions: { width: 200, height: 200 },
      uploadFunction: uploadService.uploadShopLogo,
      fieldName: 'shopLogo'
    },
    product: {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      dimensions: { width: 800, height: 600 },
      uploadFunction: uploadService.uploadProductImages,
      fieldName: 'images'
    }
  };

  const config = configs[type] || configs.avatar;

  // Tailles d'affichage
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  };

  const aspectRatioClasses = {
    square: 'aspect-square',
    banner: 'aspect-[3/1]',
    free: ''
  };

  const handleFileSelect = async (file) => {
    if (disabled) return;

    setError('');

    // Validation du type
    if (!uploadService.validateFileType(file, config.allowedTypes)) {
      setError('Type de fichier non autorisé. Utilisez JPEG, PNG ou WebP.');
      return;
    }

    // Validation de la taille
    if (!uploadService.validateFileSize(file, config.maxSize)) {
      setError(`Fichier trop volumineux. Taille maximum: ${Math.round(config.maxSize / 1024 / 1024)}MB`);
      return;
    }

    try {
      setUploading(true);
      const formData = uploadService.createFormData(file, config.fieldName);
      const response = await config.uploadFunction(formData);
      
      // Gérer différentes structures de réponse selon le type d'upload
      if (response.data?.user?.avatar) {
        onImageChange(response.data.user.avatar);
      } else if (response.data?.user?.shopBanner) {
        onImageChange(response.data.user.shopBanner);
      } else if (response.data?.user?.shopLogo) {
        onImageChange(response.data.user.shopLogo);
      } else if (response.data?.data?.shopBanner) {
        onImageChange(response.data.data.shopBanner);
      } else if (response.data?.data?.shopLogo) {
        onImageChange(response.data.data.shopLogo);
      } else if (response.data?.data?.images) {
        onImageChange(response.data.data.images[0]?.url);
      } else if (response.data?.images) {
        onImageChange(response.data.images[0]?.url);
      } else if (response.data?.data?.banner) {
        onImageChange(response.data.data.banner);
      } else if (response.data?.data?.logo) {
        onImageChange(response.data.data.logo);
      } else if (response.data?.banner) {
        onImageChange(response.data.banner);
      } else if (response.data?.logo) {
        onImageChange(response.data.logo);
      } else {
        console.warn('Structure de réponse non reconnue pour l\'upload d\'image:', response.data);
      }
      
      // Mettre à jour automatiquement les données utilisateur après l'upload
      try {
        await refreshUser();
      } catch (refreshError) {
        console.warn('Erreur lors de la mise à jour des données utilisateur:', refreshError);
        // Ne pas bloquer l'upload si la mise à jour échoue
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      setError('Erreur lors de l\'upload de l\'image');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onImageRemove();
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          ${sizeClasses[size]} 
          ${aspectRatioClasses[aspectRatio]}
          border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200
          ${dragOver ? 'border-harvests-green bg-green-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${currentImage ? 'border-solid' : ''}
          flex items-center justify-center overflow-hidden
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        {currentImage ? (
          <div className="relative w-full h-full group">
            <CloudinaryImage
              src={currentImage}
              alt="Uploaded"
              className="w-full h-full object-cover"
              width={400}
              height={400}
              quality="auto"
              crop="fill"
            />
            {!disabled && (
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <button
                  onClick={handleRemove}
                  className="text-white hover:text-red-400 transition-colors"
                  title="Supprimer l'image"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            {uploading ? (
              <LoadingSpinner size="sm" text="Upload..." />
            ) : (
              <div className="flex flex-col items-center">
                <FiUpload className="h-6 w-6 text-gray-400 mb-2" />
                <span className="text-xs text-gray-500">
                  {type === 'avatar' && 'Photo de profil'}
                  {type === 'banner' && 'Bannière de boutique'}
                  {type === 'logo' && 'Logo de boutique'}
                  {type === 'product' && 'Image de produit'}
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  Glisser-déposer ou cliquer
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={config.allowedTypes.join(',')}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
        className="hidden"
        disabled={disabled}
      />

      {error && (
        <div className="mt-2 text-sm text-red-600 flex items-center">
          <FiX className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}

      {currentImage && !error && (
        <div className="mt-2 text-sm text-green-600 flex items-center">
          <FiCheck className="h-4 w-4 mr-1" />
          Image uploadée avec succès
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
