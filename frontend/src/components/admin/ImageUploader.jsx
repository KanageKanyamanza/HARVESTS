import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Move, Trash2 } from 'lucide-react';
import uploadService from '../../services/uploadService';
import CloudinaryImage from '../common/CloudinaryImage';
import { useNotifications } from '../../contexts/NotificationContext';
import LoadingSpinner from '../common/LoadingSpinner';

const ImageUploader = ({
  images = [],
  onImagesChange,
  maxImages = 10,
  showPositionControls = true
}) => {
  const { showSuccess, showError } = useNotifications();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const positions = [
    { value: 'top', label: 'En haut' },
    { value: 'content-start', label: 'Début du contenu' },
    { value: 'middle', label: 'Au milieu' },
    { value: 'content-end', label: 'Fin du contenu' },
    { value: 'bottom', label: 'En bas' },
    { value: 'inline', label: 'Dans le texte' }
  ];

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      showError(`Maximum ${maxImages} images autorisées`);
      return;
    }

    setUploading(true);

    try {
      const uploadedImages = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`📤 Upload de l'image ${i + 1}/${files.length}:`, file.name);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'harvests/blogs');

        const response = await uploadService.uploadToCloudinary(formData);
        console.log(`✅ Image ${i + 1} uploadée:`, response);

        const imageData = response.data?.data || response.data;
        const imageUrl = imageData?.secure_url || imageData?.url;

        if (imageUrl) {
          uploadedImages.push({
            url: imageUrl,
            cloudinaryId: imageData?.public_id,
            alt: '',
            caption: '',
            position: 'inline',
            order: images.length + uploadedImages.length
          });
        }
      }

      if (uploadedImages.length > 0) {
        onImagesChange([...images, ...uploadedImages]);
        showSuccess(`${uploadedImages.length} image(s) uploadée(s) avec succès`);
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'upload:', error);
      showError(error.response?.data?.message || 'Erreur lors de l\'upload des images');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    // Réorganiser les ordres
    const reorderedImages = newImages.map((img, idx) => ({
      ...img,
      order: idx
    }));
    onImagesChange(reorderedImages);
  };

  const updateImage = (index, updates) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], ...updates };
    onImagesChange(newImages);
  };

  const getImageHTML = (image) => {
    return `<img src="${image.url}" alt="${image.alt || ''}" ${image.caption ? `title="${image.caption}"` : ''} />`;
  };

  const copyImageHTML = (image) => {
    const html = getImageHTML(image);
    navigator.clipboard.writeText(html);
    showSuccess('HTML copié dans le presse-papiers');
  };

  return (
    <div className="space-y-4">
      {/* Zone d'upload */}
      <div
        onClick={() => !uploading && images.length < maxImages && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          uploading
            ? 'border-blue-400 bg-blue-50 cursor-wait'
            : images.length >= maxImages
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
            : 'border-gray-300 hover:border-green-500 cursor-pointer'
        }`}
      >
        {uploading ? (
          <LoadingSpinner size="md" text="Upload en cours..." />
        ) : (
          <>
            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-gray-600">
              {images.length >= maxImages
                ? `Maximum ${maxImages} images atteint`
                : 'Cliquez pour ajouter des images'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {images.length}/{maxImages} images
            </p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={uploading || images.length >= maxImages}
          className="hidden"
        />
      </div>

      {/* Liste des images */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {images.map((image, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
              {/* Aperçu de l'image */}
              <div className="relative">
                <CloudinaryImage
                  src={image.url}
                  alt={image.alt || `Image ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Contrôles de position */}
              {showPositionControls && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position
                  </label>
                  <select
                    value={image.position || 'inline'}
                    onChange={(e) => updateImage(index, { position: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    {positions.map((pos) => (
                      <option key={pos.value} value={pos.value}>
                        {pos.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Alt text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Texte alternatif
                </label>
                <input
                  type="text"
                  value={image.alt || ''}
                  onChange={(e) => updateImage(index, { alt: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Description de l'image"
                />
              </div>

              {/* Caption */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Légende
                </label>
                <input
                  type="text"
                  value={image.caption || ''}
                  onChange={(e) => updateImage(index, { caption: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Légende de l'image"
                />
              </div>

              {/* Bouton pour copier le HTML */}
              {image.position === 'inline' && (
                <button
                  type="button"
                  onClick={() => copyImageHTML(image)}
                  className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm flex items-center justify-center"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Copier le HTML
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;

