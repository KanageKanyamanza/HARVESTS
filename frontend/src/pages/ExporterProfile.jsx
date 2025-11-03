import React from 'react';
import VendorProfile from '../components/common/VendorProfile';
import { exporterService } from '../services';
import { exporterConfig } from '../components/common/VendorConfigs.jsx';

const ExporterProfile = () => {
  return (
    <VendorProfile
      vendorType="exporter"
      service={exporterService}
      {...exporterConfig}
    />
  );
};

export default ExporterProfile;

