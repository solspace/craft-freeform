import React from 'react';
import { Outlet } from 'react-router-dom';

import { List } from './sidebar/list';
import { NotificationsWrapper } from './notifications.styles';

export const Notifications: React.FC = () => {
  return (
    <NotificationsWrapper>
      <List />
      <Outlet />
    </NotificationsWrapper>
  );
};
