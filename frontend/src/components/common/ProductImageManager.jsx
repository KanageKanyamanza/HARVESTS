import React, { useState } from 'react';
import { FiImage, FiX } from 'react-icons/fi';
import CloudinaryImage from './CloudinaryImage';
import ProductImageUpload from './ProductImageUpload';

const ProductImageManager = ({ 
  images, 
  onImagesChange, 
  maxImages = 5, 
  uploading = false, 
  setUploading,
  errors = {}
}) => {
  const handleImageAdd = async (imageUrl) => {
    if (!imageUrl) {
      console.error('❌ Aucune URL d\'image fournie');
      return;
    }

    try {
      setUploading(true);
      
      if (imageUrl && imageUrl.startsWith('http')) {
        onImagesChange(prev => [...prev, {
          url: imageUrl,
          publicId: '',
          alt: `Image produit ${prev.length + 1}`,
          isPrimary: prev.length === 0, // Seule la première image est principale
          order: prev.length
        }]);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'image:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleImageRemove = (indexToRemove) => {
    onImagesChange(prev => {
      const updatedImages = prev.filter((_, index) => index !== indexToRemove);
      return updatedImages.map((img, index) => ({
        ...img,
        order: index,
        isPrimary: index === 0 // La première image restante devient principale
      }));
    });
  };

  const handleSetPrimaryImage = (index) => {
    onImagesChange(prev => 
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index
      }))
    );
  };

  return (
    <div className="space-y-6">
      {/* Zone d'upload */}
      <ProductImageUpload
        onImageUpload={handleImageAdd}
        uploading={uploading}
        setUploading={setUploading}
        maxImages={maxImages}
        currentCount={images.length}
      />

      {/* Affichage des erreurs */}
      {errors.images && (
        <p className="text-sm text-red-600">{errors.images}</p>
      )}

      {/* Aperçu des images */}
      {images.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Images du produit ({images.length}/{maxImages})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <CloudinaryImage
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                    width={200}
                    height={200}
                  />
                </div>
                
                {/* Indicateur d'image primaire */}
                {image.isPrimary && (
                  <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                    Principal
                  </div>
                )}
                
                {/* Boutons d'action */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                  {!image.isPrimary && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimaryImage(index)}
                      className="p-2 bg-white text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                      title="Définir comme image principale"
                    >
                      <FiImage className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleImageRemove(index)}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    title="Supprimer l'image"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImageManager;
