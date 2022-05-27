import React from 'react';
import { NavLink } from 'react-router-dom';

import { Wrapper } from './tabs.styles';

export const Tabs: React.FC = () => {
  return (
    <Wrapper>
      <NavLink to="" end>
        Layout
      </NavLink>
      <NavLink to="notifications">Notifications</NavLink>
      <NavLink to="integrations">Integrations</NavLink>
      <NavLink to="rules">Rules</NavLink>
    </Wrapper>
  );
};
