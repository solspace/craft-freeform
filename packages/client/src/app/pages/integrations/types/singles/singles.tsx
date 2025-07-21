import type { FC } from 'react';
import React from 'react';
import { Outlet } from 'react-router-dom';

export const SinglesIntegrations: FC = () => {
  return (
    <div>
      Singles Integrations
      <Outlet />
    </div>
  );
};
