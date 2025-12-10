import React from 'react';
import { FiImage, FiX } from 'react-icons/fi';
import ProductImageUpload from '../common/ProductImageUpload';
import CloudinaryImage from '../common/CloudinaryImage';

const ProductImageGallery = ({
  productImages,
  uploadingImages,
  setUploadingImages,
  onImageAdd,
  onImageRemove,
  onImageReorder
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <FiImage className="h-5 w-5 mr-2" />
        Images du produit
      </h2>
      
      <div className="space-y-4">
        <ProductImageUpload
          onImageUpload={onImageAdd}
          uploading={uploadingImages}
          setUploading={setUploadingImages}
          maxImages={5}
          currentCount={productImages.length}
        />
        
        {productImages.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {productImages.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden">
                  <CloudinaryImage
                    src={image.url}
                    alt={image.alt || `Image ${index + 1}`}
                    className="w-full h-full object-cover"
                    width={200}
                    height={200}
                    quality="auto"
                    crop="fit"
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 flex space-x-2">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => onImageReorder(index, index - 1)}
                        className="p-2 bg-white rounded-full text-gray-600 hover:text-gray-900"
                        title="Déplacer vers la gauche"
                      >
                        ←
                      </button>
                    )}
                    {index < productImages.length - 1 && (
                      <button
                        type="button"
                        onClick={() => onImageReorder(index, index + 1)}
                        className="p-2 bg-white rounded-full text-gray-600 hover:text-gray-900"
                        title="Déplacer vers la droite"
                      >
                        →
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onImageRemove(index)}
                      className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600"
                      title="Supprimer l'image"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {image.isPrimary && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    Image principale
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductImageGallery;

