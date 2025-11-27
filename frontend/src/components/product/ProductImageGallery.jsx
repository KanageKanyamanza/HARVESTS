import React from 'react';
import { FiPackage } from 'react-icons/fi';
import CloudinaryImage from '../common/CloudinaryImage';

const ProductImageGallery = ({ images, selectedIndex, onSelectImage, productName }) => {
  const getImageUrl = (image) => {
    return typeof image === 'string' ? image : (image?.url || image?.secure_url || '');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Miniatures */}
      {images && images.length > 1 && (
        <div className="flex flex-row lg:flex-col gap-2 lg:order-first justify-center lg:justify-start overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => onSelectImage(index)}
              className={`flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                selectedIndex === index 
                  ? 'border-harvests-green ring-2 ring-harvests-green ring-offset-2' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              style={{ width: '80px', height: '80px', minWidth: '80px' }}
            >
              <CloudinaryImage
                src={getImageUrl(image)}
                alt={`${productName} ${index + 1}`}
                className="w-full h-full object-cover"
                width={80}
                height={80}
                quality="auto"
                crop="fill"
              />
            </button>
          ))}
        </div>
      )}

      {/* Image principale */}
      <div className="flex-1 w-full rounded-lg overflow-hidden bg-white shadow-lg flex items-stretch">
        {images && images.length > 0 ? (
          <div className="relative w-full aspect-square">
            <CloudinaryImage
              src={getImageUrl(images[selectedIndex] || images[0])}
              alt={productName}
              className="absolute inset-0 w-full h-full object-cover"
              width={800}
              height={800}
              quality="auto"
              crop="fill"
            />
          </div>
        ) : (
          <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-gray-500">
            <FiPackage className="h-24 w-24 text-gray-400 mb-4" />
            <span className="text-lg font-medium">Aucune image</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductImageGallery;

