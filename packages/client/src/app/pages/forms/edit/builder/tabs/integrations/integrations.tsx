import React from 'react';
import { Outlet, useResolvedPath } from 'react-router-dom';
import { Breadcrumb } from '@components/breadcrumbs/breadcrumbs';
import translate from '@ff-client/utils/translations';

import { List } from './sidebar/list';
import { IntegrationsWrapper } from './integrations.styles';

export const Integrations: React.FC = () => {
  const currentPath = useResolvedPath('');

  return (
    <IntegrationsWrapper>
      <Breadcrumb
        id="integrations"
        label={translate('Integrations')}
        url={currentPath.pathname}
      />
      <List />
      <Outlet />
    </IntegrationsWrapper>
  );
};
