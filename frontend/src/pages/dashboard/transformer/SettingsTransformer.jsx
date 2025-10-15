import React from 'react';
import UniversalSettings from '../../../components/common/UniversalSettings';
import { transformerService } from '../../../services';
import { transformerSettingsConfig } from '../../../components/common/SettingsConfigs';

const SettingsTransformer = () => {
  return (
    <UniversalSettings
      userType="transformer"
      service={transformerService}
      settingsConfig={transformerSettingsConfig}
    />
  );
};

export default SettingsTransformer;
