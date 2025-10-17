import React from 'react';
import UniversalProfile from '../../../components/common/UniversalProfile';
import { producerService } from '../../../services';
import { producerProfileConfig } from '../../../components/common/ProfileConfigs';
import {
  GeneralContent,
  AddressContent,
  CertificationsContent
} from '../../../components/common/ProfileTabContent';

const ProfileProducer = () => {
  const tabs = producerProfileConfig.tabs.map(tab => ({
    ...tab,
    content: tab.content
  }));

  return (
    <UniversalProfile
      userType="producer"
      service={producerService}
      profileFields={producerProfileConfig.fields}
      tabs={tabs}
    />
  );
};

export default ProfileProducer;
