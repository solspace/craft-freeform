import React from 'react';
import { Outlet } from 'react-router-dom';

import { MiniMap } from './sidebar/mini-map';
import { RulesWrapper } from './rules.styles';

export const Rules: React.FC = () => {
  return (
    <RulesWrapper>
      <MiniMap />
      <Outlet />
    </RulesWrapper>
  );
};
