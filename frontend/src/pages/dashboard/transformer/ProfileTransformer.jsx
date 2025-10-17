import React from 'react';
import UniversalProfile from '../../../components/common/UniversalProfile';
import { transformerService } from '../../../services';
import { transformerProfileConfig } from '../../../components/common/ProfileConfigs';
import {
  GeneralContent,
  CompanyContent,
  TransformationContent,
  AddressContent,
  CertificationsContent
} from '../../../components/common/ProfileTabContent';

const ProfileTransformerUniversal = () => {
  const tabs = transformerProfileConfig.tabs.map(tab => ({
    ...tab,
    content: tab.content
  }));

  return (
    <UniversalProfile
      userType="transformer"
      service={transformerService}
      profileFields={transformerProfileConfig.fields}
      tabs={tabs}
    />
  );
};

export default ProfileTransformerUniversal;
