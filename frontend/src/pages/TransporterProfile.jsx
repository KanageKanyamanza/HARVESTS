import React from 'react';
import VendorProfile from '../components/common/VendorProfile';
import { transporterService } from '../services';
import { transporterConfig } from '../components/common/VendorConfigs.jsx';

const TransporterProfile = () => {
  return (
    <VendorProfile
      vendorType="transporter"
      service={transporterService}
      {...transporterConfig}
    />
  );
};

export default TransporterProfile;

