import React from 'react';
import VendorProfile from '../components/common/VendorProfile';
import { transformerService } from '../services';
import { transformerConfig } from '../components/common/VendorConfigs.jsx';

const TransformerProfile = () => {
  return (
    <VendorProfile
      vendorType="transformer"
      service={transformerService}
      {...transformerConfig}
    />
  );
};

export default TransformerProfile;
