import React from 'react';
import { FieldLayout } from '@editor/builder/tabs/settings/field-layout';
import { Sidebar } from '@editor/builder/tabs/settings/sidebar';

import { SettingsWrapper } from './settings.styles';

export const Settings: React.FC = () => (
  <SettingsWrapper>
    <Sidebar />
    <FieldLayout />
  </SettingsWrapper>
);
