import React from 'react';
import UniversalSettings from '../../../components/common/UniversalSettings';
import { consumerService } from '../../../services';
import { consumerSettingsConfig } from '../../../components/common/SettingsConfigs';

const SettingsConsumer = () => {
  return (
    <UniversalSettings
      userType="consumer"
      service={consumerService}
      settingsConfig={consumerSettingsConfig}
    />
  );
};

export default SettingsConsumer;
