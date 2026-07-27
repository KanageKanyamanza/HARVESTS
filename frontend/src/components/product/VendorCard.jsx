import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiArrowRight } from 'react-icons/fi';
import CloudinaryImage from '../common/CloudinaryImage';
import { getVendorName, getVendorLogo, getVendorProfileRoute } from '../../utils/productUtils';

const VendorCard = ({ vendor }) => {
  const navigate = useNavigate();

  if (!vendor) return null;

  const logo = getVendorLogo(vendor);
  const name = getVendorName(vendor);

  return (
    <button
      onClick={() => navigate(getVendorProfileRoute(vendor))}
      className="w-full bg-[#F8FAF6] hover:bg-emerald-50 border border-emerald-100/80 rounded-2xl p-3.5 flex items-center gap-3 transition-colors text-left group"
    >
      {logo ? (
        <CloudinaryImage
          src={logo}
          alt={name}
          className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
          width={44}
          height={44}
          quality="auto"
          crop="fill"
        />
      ) : (
        <div className="w-11 h-11 bg-gradient-to-tr from-[#1A5514] to-[#31BC2E] rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
          <FiUser className="h-5 w-5 text-white" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Vendu par</p>
        <h3 className="font-bold text-[#161D14] truncate text-sm">{name}</h3>
      </div>
      <FiArrowRight className="h-4 w-4 text-[#1A5514] shrink-0 group-hover:translate-x-1 transition-transform" />
    </button>
  );
};

export default VendorCard;
