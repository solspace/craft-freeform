import React from 'react';
import { Outlet } from 'react-router-dom';
import { Wrapper } from './integrations.styles';
import { List } from './sidebar/list';

export const Integrations: React.FC = () => {
  return (
    <Wrapper>
      <List />
      <Outlet />
    </Wrapper>
  );
};
