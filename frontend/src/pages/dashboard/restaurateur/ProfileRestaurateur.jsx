import React from 'react';
import UniversalProfile from '../../../components/common/UniversalProfile';
import { restaurateurService } from '../../../services';
import { restaurateurProfileConfig } from '../../../components/common/ProfileConfigs';
import {
  GeneralContent,
  RestaurantContent,
  HoursContent,
  ServicesContent
} from '../../../components/common/ProfileTabContent';

const ProfileRestaurateur = () => {
  const tabs = restaurateurProfileConfig.tabs.map(tab => ({
    ...tab,
    content: tab.content
  }));

  return (
    <UniversalProfile
      userType="restaurateur"
      service={restaurateurService}
      profileFields={restaurateurProfileConfig.fields}
      tabs={tabs}
    />
  );
};

export default ProfileRestaurateur;
