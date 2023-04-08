import React from 'react';
import { useSelector } from 'react-redux';
import { selectNotification } from '@editor/store/slices/notifications';
import type { Notification } from '@ff-client/types/notifications';

import { Link, Name, Status } from './item.styles';

type Props = {
  notification: Notification;
};

export const NotificationItem: React.FC<Props> = ({ notification: { id } }) => {
  const { name, enabled } = useSelector(selectNotification(id));

  return (
    <Link to={`${id}`}>
      <Name>{name}</Name>
      <Status enabled={enabled} />
    </Link>
  );
};
