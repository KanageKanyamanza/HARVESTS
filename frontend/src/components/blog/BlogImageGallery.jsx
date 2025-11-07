import React, { useState } from 'react';
import CloudinaryImage from '../common/CloudinaryImage';
import { FiX } from 'react-icons/fi';

const BlogImageGallery = ({ images = [] }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!images || images.length === 0) return null;

  const openLightbox = (image) => {
    setSelectedImage(image);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-8">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative cursor-pointer group overflow-hidden rounded-lg"
            onClick={() => openLightbox(image)}
          >
            <CloudinaryImage
              src={image.url || image.cloudinaryId}
              alt={image.alt || `Image ${index + 1}`}
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
            />
            {image.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
                {image.caption}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
          onClick={closeLightbox}
        >
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <FiX className="w-8 h-8" />
            </button>
            <CloudinaryImage
              src={selectedImage.url || selectedImage.cloudinaryId}
              alt={selectedImage.alt || 'Image'}
              className="max-w-full max-h-[90vh] object-contain"
            />
            {selectedImage.caption && (
              <p className="text-white text-center mt-4">{selectedImage.caption}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default BlogImageGallery;

