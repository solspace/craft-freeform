import React from 'react';
import { Outlet } from 'react-router-dom';
import { Wrapper } from './integrations.styles';
import { Sidebar } from './sidebar/sidebar';

export const Integrations: React.FC = () => {
  return (
    <Wrapper>
      <Sidebar />
      <Outlet />
    </Wrapper>
  );
};
