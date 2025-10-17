import React from 'react';
import UniversalSettings from '../../../components/common/UniversalSettings';
import { producerService } from '../../../services';
import { producerSettingsConfig } from '../../../components/common/SettingsConfigs';

const SettingsProducer = () => {
  return (
    <UniversalSettings
      userType="producer"
      service={producerService}
      settingsConfig={producerSettingsConfig}
    />
  );
};

export default SettingsProducer;
