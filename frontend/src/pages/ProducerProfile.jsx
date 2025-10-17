import React from 'react';
import VendorProfile from '../components/common/VendorProfile';
import { producerService } from '../services';
import { producerConfig } from '../components/common/VendorConfigs.jsx';

const ProducerProfile = () => {
  return (
    <VendorProfile
      vendorType="producer"
      service={producerService}
      {...producerConfig}
    />
  );
};

export default ProducerProfile;
