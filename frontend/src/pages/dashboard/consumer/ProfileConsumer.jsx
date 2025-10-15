import React from 'react';
import UniversalProfile from '../../../components/common/UniversalProfile';
import { authService } from '../../../services';
import { consumerProfileConfig } from '../../../components/common/ProfileConfigs';
import {
  GeneralContent,
  PreferencesContent,
  AddressContent,
  NotificationsContent
} from '../../../components/common/ProfileTabContent';

const ProfileConsumerUniversal = () => {
  const tabs = consumerProfileConfig.tabs.map(tab => ({
    ...tab,
    content: tab.content
  }));

  return (
    <UniversalProfile
      userType="consumer"
      service={authService}
      profileFields={consumerProfileConfig.fields}
      tabs={tabs}
    />
  );
};

export default ProfileConsumerUniversal;
