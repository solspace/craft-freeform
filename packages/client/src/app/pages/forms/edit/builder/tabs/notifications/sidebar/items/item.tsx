import React from 'react';
import { useSelector } from 'react-redux';
import { notificationSelectors } from '@editor/store/slices/notifications/notifications.selectors';
import type { Notification } from '@ff-client/types/notifications';
import classes from '@ff-client/utils/classes';
import { hasErrors } from '@ff-client/utils/errors';

import { Link, Name, Status } from './item.styles';

type Props = {
  notification: Notification;
};

export const NotificationItem: React.FC<Props> = ({
  notification: { uid },
}) => {
  const { name, enabled, errors } = useSelector(notificationSelectors.one(uid));

  return (
    <Link to={`${uid}`} className={classes(hasErrors(errors) && 'errors')}>
      <Name>{name}</Name>
      <Status enabled={enabled} />
    </Link>
  );
};
