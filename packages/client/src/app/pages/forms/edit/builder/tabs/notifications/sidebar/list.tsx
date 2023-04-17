import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Sidebar } from '@components/layout/sidebar/sidebar';
import { NotificationTypeItem } from '@editor/builder/tabs/notifications/sidebar/items/type';
import { CategorySkeleton } from '@editor/builder/tabs/notifications/sidebar/items/type.skeleton';
import { notificationSelectors } from '@editor/store/slices/notifications/notifications.selectors';
import {
  useQueryFormNotifications,
  useQueryNotificationTypes,
} from '@ff-client/queries/notifications';

import { NotificationItem } from './items/item';

export const List: React.FC = () => {
  const { formId, uid } = useParams();
  const navigate = useNavigate();

  const { data: notificationTypes, isFetching } = useQueryNotificationTypes();
  useQueryFormNotifications(Number(formId || 0));
  const notifications = useSelector(notificationSelectors.all);

  useEffect(() => {
    if (!uid && notificationTypes && notifications) {
      const first = notifications.find(Boolean);
      if (first) {
        navigate(first.uid);
      }
    }
  }, [uid, notificationTypes, notifications]);

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
                  key={notification.uid}
                  notification={notification}
                />
              ))}
        </NotificationTypeItem>
      ))}
    </Sidebar>
  );
};
