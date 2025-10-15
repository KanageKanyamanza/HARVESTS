import React from 'react';
import UniversalSettings from '../../../components/common/UniversalSettings';
import { restaurateurService } from '../../../services';
import { restaurateurSettingsConfig } from '../../../components/common/SettingsConfigs';

const SettingsRestaurateur = () => {
  return (
    <UniversalSettings
      userType="restaurateur"
      service={restaurateurService}
      settingsConfig={restaurateurSettingsConfig}
    />
  );
};

export default SettingsRestaurateur;
