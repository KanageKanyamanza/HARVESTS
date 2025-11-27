import React from 'react';
import { FiImage } from 'react-icons/fi';
import ProfileImageUpload from '../common/ProfileImageUpload';
import CloudinaryImage from '../common/CloudinaryImage';

const VENDOR_TYPES = ['producer', 'transformer', 'restaurateur', 'exporter', 'transporter'];

const ShopSection = ({
  user,
  shopBanner,
  shopLogo,
  onBannerChange,
  onBannerRemove,
  onLogoChange,
  onLogoRemove
}) => {
  if (!VENDOR_TYPES.includes(user?.userType)) return null;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <FiImage className="mr-2" />
          Ma Boutique
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Bannière de boutique
            </label>
            <ProfileImageUpload
              currentImage={shopBanner}
              onImageChange={onBannerChange}
              onImageRemove={onBannerRemove}
              imageType="banner"
              size="large"
              aspectRatio="banner"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-2">
              Recommandé: 1200x400px (ratio 3:1)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Logo de boutique
            </label>
            <ProfileImageUpload
              currentImage={shopLogo}
              onImageChange={onLogoChange}
              onImageRemove={onLogoRemove}
              imageType="logo"
              size="medium"
              aspectRatio="square"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-2">
              Recommandé: 400x400px (carré)
            </p>
          </div>
        </div>

        {(shopBanner || shopLogo) && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Aperçu de votre boutique</h4>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {shopBanner && (
                <div className="aspect-[3/1] bg-gray-100">
                  <CloudinaryImage
                    src={shopBanner}
                    alt="Bannière de boutique"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4 flex items-center space-x-3">
                {shopLogo && (
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    <CloudinaryImage
                      src={shopLogo}
                      alt="Logo de boutique"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <h5 className="font-medium text-gray-900">
                    {user?.farmName || user?.companyName || user?.businessName || 'Ma Boutique'}
                  </h5>
                  <p className="text-sm text-gray-500">
                    {user?.firstName} {user?.lastName}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopSection;

