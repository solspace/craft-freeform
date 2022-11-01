import React from 'react';
import { Outlet } from 'react-router-dom';

import { List } from './sidebar/list';
import { IntegrationsWrapper } from './integrations.styles';

export const Integrations: React.FC = () => {
  return (
    <IntegrationsWrapper>
      <List />
      <Outlet />
    </IntegrationsWrapper>
  );
};
