import React from 'react';
import { Outlet } from 'react-router-dom';
import { IntegrationsWrapper } from './integrations.styles';
import { List } from './sidebar/list';

export const Integrations: React.FC = () => {
  return (
    <IntegrationsWrapper>
      <List />
      <Outlet />
    </IntegrationsWrapper>
  );
};
