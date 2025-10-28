import React, { useState, useRef } from 'react';
import { FiUpload, FiX, FiImage, FiCheck } from 'react-icons/fi';
import { uploadService } from '../../services';
import CloudinaryImage from './CloudinaryImage';

const ProductImageUpload = ({
  onImageUpload,
  uploading = false,
  setUploading,
  maxImages = 5,
  currentCount = 0
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = async (files) => {
    if (currentCount >= maxImages) {
      setError(`Maximum ${maxImages} images autorisées`);
      return;
    }

    const fileArray = Array.from(files);
    const remainingSlots = maxImages - currentCount;
    const filesToUpload = fileArray.slice(0, remainingSlots);

    if (filesToUpload.length !== fileArray.length) {
      setError(`Seules ${remainingSlots} images seront uploadées (maximum ${maxImages})`);
    }

    for (const file of filesToUpload) {
      await uploadSingleImage(file);
    }
  };

  const uploadSingleImage = async (file) => {
    // Validation du fichier
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner un fichier image valide');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      setError('La taille du fichier ne doit pas dépasser 5MB');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('images', file);

      const response = await uploadService.uploadProductImages(formData);
      
      console.log('📤 Réponse upload complète:', response);
      console.log('📤 Réponse upload data:', response.data);
      console.log('📤 Structure de la réponse:', JSON.stringify(response.data, null, 2));
      
      // Vérifier différentes structures possibles
      let imageUrl = null;
      
      if (response.data && response.data.data && response.data.data.images && response.data.data.images.length > 0) {
        // Structure: {status: 'success', data: {images: [...]}}
        imageUrl = response.data.data.images[0].secure_url || response.data.data.images[0].url;
        console.log('✅ Image trouvée dans data.data.images:', imageUrl);
      } else if (response.data && response.data.images && response.data.images.length > 0) {
        // Structure: {images: [...]}
        imageUrl = response.data.images[0].secure_url || response.data.images[0].url;
        console.log('✅ Image trouvée dans data.images:', imageUrl);
      } else if (response.data && response.data.data && response.data.data.url) {
        // Structure: {status: 'success', data: {url: '...'}}
        imageUrl = response.data.data.url;
        console.log('✅ Image trouvée dans data.data.url:', imageUrl);
      } else if (response.data && response.data.url) {
        // Structure: {url: '...'}
        imageUrl = response.data.url;
        console.log('✅ Image trouvée dans data.url:', imageUrl);
      } else if (response.data && response.data.data && typeof response.data.data === 'string') {
        // Structure: {status: 'success', data: 'url...'}
        imageUrl = response.data.data;
        console.log('✅ Image trouvée dans data.data (string):', imageUrl);
      }
      
      if (imageUrl) {
        console.log('✅ Image uploadée avec succès:', imageUrl);
        onImageUpload(imageUrl);
      } else {
        console.error('❌ Aucune URL d\'image trouvée dans la réponse');
        throw new Error('Aucune image retournée par le serveur');
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      setError('Erreur lors de l\'upload de l\'image');
    } finally {
      setUploading(false);
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

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
    // Reset input
    e.target.value = '';
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Zone d'upload - masquée si max atteint */}
      {currentCount < maxImages && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-2"></div>
              <p className="text-sm text-gray-600">Upload en cours...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <FiImage className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Glissez-déposez vos images ici
              </p>
              <p className="text-sm text-gray-500 mb-4">
                ou cliquez pour sélectionner des fichiers
              </p>
              <button
                type="button"
                onClick={openFileDialog}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-harvests-light focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <FiUpload className="h-4 w-4 mr-2" />
                Sélectionner des images
              </button>
              <p className="text-xs text-gray-400 mt-2">
                {currentCount}/{maxImages} images • JPG, PNG, WebP • Max 5MB
              </p>
            </div>
          )}
        </div>
      )}

      {/* Message quand max atteint */}
      {currentCount >= maxImages && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <FiImage className="h-8 w-8 text-blue-400 mx-auto mb-2" />
          <p className="text-sm text-blue-600 font-medium">
            Nombre maximum d'images atteint ({maxImages}/{maxImages})
          </p>
          <p className="text-xs text-blue-500 mt-1">
            Supprimez une image pour en ajouter une nouvelle
          </p>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex">
            <FiX className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImageUpload;
