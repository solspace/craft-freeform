import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sidebar } from '@components/layout/sidebar/sidebar';
import { NotificationTypeItem } from '@editor/builder/tabs/notifications/sidebar/items/type';
import { CategorySkeleton } from '@editor/builder/tabs/notifications/sidebar/items/type.skeleton';
import {
  useQueryFormNotifications,
  useQueryNotificationTypes,
} from '@ff-client/queries/notifications';

import { NotificationItem } from './items/item';

export const List: React.FC = () => {
  const { formId, id } = useParams();
  const navigate = useNavigate();

  const { data: notificationTypes, isFetching } = useQueryNotificationTypes();
  const { data: notifications } = useQueryFormNotifications(Number(formId));

  useEffect(() => {
    if (!id && notificationTypes && notifications) {
      const first = notifications.find(Boolean);
      if (first) {
        navigate(`${first.id}`);
      }
    }
  }, [id, notificationTypes, notifications]);

  if (!notificationTypes && isFetching) {
    return (
      <Sidebar>
        <CategorySkeleton />
      </Sidebar>
    );
  }

  if (!notificationTypes && !isFetching) {
    return <>Empty</>;
  }

  return (
    <Sidebar lean>
      {notificationTypes.map((type) => (
        <NotificationTypeItem key={type.class} type={type}>
          {notifications &&
            notifications
              ?.filter((notif) => notif.class === type.class)
              .map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                />
              ))}
        </NotificationTypeItem>
      ))}
    </Sidebar>
  );
};
