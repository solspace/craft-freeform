import React from 'react';
import { Outlet, useResolvedPath } from 'react-router-dom';
import { Breadcrumb } from '@components/breadcrumbs/breadcrumbs';
import translate from '@ff-client/utils/translations';

import { List } from './sidebar/list';
import { NotificationsWrapper } from './notifications.styles';

export const Notifications: React.FC = () => {
  const currentPath = useResolvedPath('');

  return (
    <NotificationsWrapper>
      <Breadcrumb
        label={translate('Notifications')}
        url={currentPath.pathname}
      />
      <List />
      <Outlet />
    </NotificationsWrapper>
  );
};
