import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMapPin } from 'react-icons/fi';
import CloudinaryImage from '../common/CloudinaryImage';
import { getVendorName, getVendorLogo, formatVendorAddress, getVendorProfileRoute } from '../../utils/productUtils';

const VendorCard = ({ vendor }) => {
  const navigate = useNavigate();
  
  if (!vendor) return null;

  const logo = getVendorLogo(vendor);
  const name = getVendorName(vendor);
  const address = formatVendorAddress(vendor);

  return (
    <div className="bg-harvests-light rounded-lg p-4">
      <div className="flex items-center space-x-3">
        {logo ? (
          <CloudinaryImage
            src={logo}
            alt={name}
            className="w-12 h-12 rounded-full object-cover"
            width={48}
            height={48}
            quality="auto"
            crop="fill"
          />
        ) : (
          <div className="w-12 h-12 bg-harvests-green rounded-full flex items-center justify-center flex-shrink-0">
            <FiUser className="h-6 w-6 text-white" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{name}</h3>
          {address && (
            <p className="text-sm text-gray-600 flex items-center mt-1">
              <FiMapPin className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="truncate">{address}</span>
            </p>
          )}
        </div>
        <button
          onClick={() => navigate(getVendorProfileRoute(vendor))}
          className="text-harvests-green hover:text-green-600 text-sm font-medium whitespace-nowrap flex-shrink-0"
        >
          Visiter la boutique
        </button>
      </div>
    </div>
  );
};

export default VendorCard;

