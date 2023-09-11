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
import { ScrollableList } from './list.styles';

export const List: React.FC = () => {
  const { formId, uid } = useParams();
  const navigate = useNavigate();

  const { data: notificationTypes, isFetching } = useQueryNotificationTypes();
  useQueryFormNotifications(formId ? Number(formId) : undefined);
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
    <Sidebar $lean>
      <ScrollableList>
        {notificationTypes.map((type) => (
          <NotificationTypeItem key={type.className} type={type}>
            {notifications &&
              notifications
                ?.filter(
                  (notification) => notification.className === type.className
                )
                .map((notification) => (
                  <NotificationItem
                    key={notification.uid}
                    icon={type.icon}
                    notification={notification}
                  />
                ))}
          </NotificationTypeItem>
        ))}
      </ScrollableList>
    </Sidebar>
  );
};
