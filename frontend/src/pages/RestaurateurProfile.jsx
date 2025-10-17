import React from 'react';
import VendorProfile from '../components/common/VendorProfile';
import { restaurateurService } from '../services';
import { restaurateurConfig } from '../components/common/VendorConfigs.jsx';

const RestaurateurProfile = () => {
  return (
    <VendorProfile
      vendorType="restaurateur"
      service={restaurateurService}
      {...restaurateurConfig}
    />
  );
};

export default RestaurateurProfile;
