import React from 'react';
import { FieldLayout } from '@ff-client/app/pages/forms/edit/builder/tabs/settings/field-layout';
import { Sidebar } from '@ff-client/app/pages/forms/edit/builder/tabs/settings/sidebar';

import { SettingsWrapper } from './settings.styles';

export const Settings: React.FC = () => (
  <SettingsWrapper>
    <Sidebar />
    <FieldLayout />
  </SettingsWrapper>
);
