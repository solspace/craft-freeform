import type { FC } from 'react';
import React from 'react';
import { Outlet, useParams } from 'react-router-dom';

type Params = {
  type: 'crm' | 'email-marketing';
};

export const StandardIntegrations: FC = () => {
  const { type } = useParams<Params>();

  return (
    <div>
      <h1>Integration List: {type}</h1>
      <Outlet />
    </div>
  );
};
