import React from 'react';
import { useSelector } from 'react-redux';
import { selectNotification } from '@editor/store/slices/notifications';
import type { Notification } from '@ff-client/types/notifications';

import { Link, Name, Status } from './item.styles';

type Props = {
  notification: Notification;
};

export const NotificationItem: React.FC<Props> = ({
  notification: { uid },
}) => {
  const { name, enabled } = useSelector(selectNotification(uid));

  return (
    <Link to={`${uid}`}>
      <Name>{name}</Name>
      <Status enabled={enabled} />
    </Link>
  );
};
