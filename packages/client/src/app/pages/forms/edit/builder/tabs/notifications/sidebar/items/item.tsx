import React from 'react';
import { useSelector } from 'react-redux';
import { useLastTab } from '@editor/builder/tabs/tabs.hooks';
import { notificationSelectors } from '@editor/store/slices/notifications/notifications.selectors';
import type { Notification } from '@ff-client/types/notifications';
import classes from '@ff-client/utils/classes';
import { hasErrors } from '@ff-client/utils/errors';

import { Icon, Link, Name, Status } from './item.styles';

type Props = {
  icon: string;
  notification: Notification;
};

export const NotificationItem: React.FC<Props> = ({
  icon,
  notification: { uid },
}) => {
  const { setLastTab } = useLastTab('notifications');
  const { name, enabled, errors } = useSelector(notificationSelectors.one(uid));

  return (
    <Link
      onClick={() => setLastTab(uid)}
      to={`${uid}`}
      className={classes(hasErrors(errors) && 'errors', !enabled && 'inactive')}
    >
      {icon && <Icon dangerouslySetInnerHTML={{ __html: icon }} />}
      <Name>{name}</Name>
      <Status $enabled={enabled} className={classes('status-dot')} />
    </Link>
  );
};
